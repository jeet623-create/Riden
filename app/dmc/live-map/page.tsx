"use client"

export const dynamic = "force-dynamic"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Circle, Clock, ExternalLink, Loader2, MapPin, RefreshCw, UserCheck } from "lucide-react"
import { GoogleMap, InfoWindow, Marker, useLoadScript } from "@react-google-maps/api"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type Driver = {
  id: string
  full_name: string | null
  current_lat: number | string | null
  current_lng: number | string | null
  current_location_updated_at: string | null
  vehicle_plate: string | null
  vehicle_brand_model: string | null
}

type ActiveTrip = {
  id: string
  status: string
  pickup_location: string | null
  dropoff_location: string | null
  booking_id: string | null
  drivers: Driver | null
}

const THAILAND_CENTER = { lat: 13.7563, lng: 100.5018 }
const THAILAND_ZOOM = 7
const FOCUSED_ZOOM = 14

const MAP_CONTAINER = { width: "100%", height: "100%" }

const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#111318" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0b0e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#23262e" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0b0e" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
]

function minutesSince(iso: string | null): number | null {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return 0
  return Math.round(ms / 60000)
}

function freshnessColor(mins: number | null): { fill: string; label: string; tone: string } {
  if (mins == null) return { fill: "#6B7280", label: "no data", tone: "text-muted" }
  if (mins < 2) return { fill: "#22C55E", label: "just now", tone: "text-[#22C55E]" }
  if (mins < 5) return { fill: "#F59E0B", label: `${mins}m ago`, tone: "text-[#F59E0B]" }
  return { fill: "#EF4444", label: `${mins}m ago`, tone: "text-[#EF4444]" }
}

function pinSvgUrl(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.1 17 27 17 27s17-14.9 17-27C34 7.6 26.4 0 17 0z" fill="${color}" />
    <circle cx="17" cy="16" r="7" fill="#ffffff" />
  </svg>`
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}

export default function DmcLiveMapPage() {
  const mapsKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsKey ?? "",
  })

  const [dmcId, setDmcId] = useState<string | null>(null)
  const [trips, setTrips] = useState<ActiveTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setDmcId(user?.id ?? null)
    })()
  }, [])

  const load = useCallback(async () => {
    if (!dmcId) return
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("trips")
        .select(
          `id, status, pickup_location, dropoff_location, booking_id,
           bookings!inner(id, dmc_id),
           drivers(id, full_name, current_lat, current_lng, current_location_updated_at, vehicle_plate, vehicle_brand_model)`
        )
        .eq("bookings.dmc_id", dmcId)
        .eq("status", "in_progress")

      if (error) throw new Error(error.message)

      const normalized = ((data ?? []) as unknown as ActiveTrip[])
        .map(t => ({ ...t, drivers: Array.isArray(t.drivers) ? (t.drivers as any)[0] ?? null : t.drivers }))
      setTrips(normalized)
      setLastFetched(new Date())
    } catch (e: any) {
      toast.error("Could not refresh live map: " + (e?.message ?? "unknown"))
    } finally {
      setLoading(false)
    }
  }, [dmcId])

  useEffect(() => {
    if (!dmcId) return
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [dmcId, load])

  const driversWithFix = useMemo(
    () => trips.filter(t => t.drivers?.current_lat != null && t.drivers?.current_lng != null),
    [trips]
  )

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const focusOn = useCallback((trip: ActiveTrip) => {
    if (!mapRef.current || !trip.drivers?.current_lat || !trip.drivers?.current_lng) return
    mapRef.current.panTo({
      lat: Number(trip.drivers.current_lat),
      lng: Number(trip.drivers.current_lng),
    })
    mapRef.current.setZoom(FOCUSED_ZOOM)
    setSelectedTripId(trip.id)
  }, [])

  if (!mapsKey) {
    return (
      <EmptyState
        title="Google Maps key not set"
        body="Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to the DMC env file."
      />
    )
  }

  if (loadError) {
    return (
      <EmptyState
        title="Map failed to load"
        body={String(loadError.message ?? loadError)}
      />
    )
  }

  return (
    <div className="fixed inset-0 left-[232px] top-14 flex">
      {/* Left panel — active trips list */}
      <aside className="w-[340px] border-r border-border bg-surface flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-2">
          <div>
            <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">DMC · LIVE MAP</div>
            <h1 className="font-display italic text-[20px] font-semibold text-foreground leading-tight">Active trips</h1>
            <p className="text-[11px] text-muted mt-0.5">
              {loading ? "Loading…" : `${driversWithFix.length} with GPS · ${trips.length - driversWithFix.length} waiting`}
            </p>
          </div>
          <button
            onClick={load}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-primary/40"
            aria-label="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {loading && trips.length === 0 ? (
            <div className="p-6 text-sm text-muted flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading active trips…
            </div>
          ) : trips.length === 0 ? (
            <div className="p-6 text-sm text-muted font-display italic">
              No trips are in progress right now.
            </div>
          ) : (
            trips.map(t => {
              const mins = minutesSince(t.drivers?.current_location_updated_at ?? null)
              const meta = freshnessColor(mins)
              const isSelected = selectedTripId === t.id
              const hasFix = t.drivers?.current_lat != null && t.drivers?.current_lng != null
              return (
                <button
                  key={t.id}
                  onClick={() => hasFix ? focusOn(t) : setSelectedTripId(t.id)}
                  className={`w-full text-left p-3 transition-colors ${
                    isSelected ? "bg-primary/10" : "hover:bg-surface-elevated/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-primary">{t.id}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] ${meta.tone}`}>
                      <Circle className="w-2 h-2" style={{ fill: meta.fill, stroke: meta.fill }} />
                      {hasFix ? meta.label : "no fix"}
                    </span>
                  </div>
                  <div className="text-sm text-foreground mt-0.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-muted shrink-0" />
                    {t.drivers?.full_name ?? "—"}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5 truncate">
                    {t.pickup_location ?? "—"} → {t.dropoff_location ?? "—"}
                  </div>
                  {t.drivers?.vehicle_plate && (
                    <div className="text-[10px] text-muted font-mono mt-0.5">{t.drivers.vehicle_plate}{t.drivers.vehicle_brand_model ? ` · ${t.drivers.vehicle_brand_model}` : ""}</div>
                  )}
                </button>
              )
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-border text-[10px] text-muted font-mono flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Polling 15s{lastFetched ? ` · last ${lastFetched.toLocaleTimeString()}` : ""}
        </div>
      </aside>

      {/* Map */}
      <section className="flex-1 relative">
        {!isLoaded ? (
          <div className="h-full flex items-center justify-center text-muted text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading map…
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER}
            center={THAILAND_CENTER}
            zoom={THAILAND_ZOOM}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: DARK_MAP_STYLE,
              gestureHandling: "greedy",
            }}
          >
            {driversWithFix.map(t => {
              const mins = minutesSince(t.drivers?.current_location_updated_at ?? null)
              const { fill } = freshnessColor(mins)
              return (
                <Marker
                  key={t.id}
                  position={{
                    lat: Number(t.drivers!.current_lat),
                    lng: Number(t.drivers!.current_lng),
                  }}
                  icon={{
                    url: pinSvgUrl(fill),
                    scaledSize: new google.maps.Size(34, 44),
                    anchor: new google.maps.Point(17, 44),
                  }}
                  onClick={() => setSelectedTripId(t.id)}
                />
              )
            })}

            {selectedTripId && (() => {
              const trip = driversWithFix.find(t => t.id === selectedTripId)
              if (!trip?.drivers) return null
              const mins = minutesSince(trip.drivers.current_location_updated_at)
              const meta = freshnessColor(mins)
              return (
                <InfoWindow
                  position={{
                    lat: Number(trip.drivers.current_lat),
                    lng: Number(trip.drivers.current_lng),
                  }}
                  onCloseClick={() => setSelectedTripId(null)}
                >
                  <div style={{ color: "#111", minWidth: 220, fontFamily: "system-ui, sans-serif" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1D9E75", letterSpacing: 1 }}>
                      {trip.id}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                      {trip.drivers.full_name ?? "Driver"}
                    </div>
                    <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>
                      {trip.pickup_location ?? "—"} → {trip.dropoff_location ?? "—"}
                    </div>
                    {trip.drivers.vehicle_plate && (
                      <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>
                        {trip.drivers.vehicle_plate}{trip.drivers.vehicle_brand_model ? ` · ${trip.drivers.vehicle_brand_model}` : ""}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: meta.fill, marginTop: 4, fontFamily: "monospace" }}>
                      ● {meta.label}
                    </div>
                    {trip.booking_id && (
                      <Link
                        href={`/dmc/bookings/${trip.booking_id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "#1D9E75",
                          marginTop: 8,
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        View trip <ExternalLink style={{ width: 12, height: 12 }} />
                      </Link>
                    )}
                  </div>
                </InfoWindow>
              )
            })()}
          </GoogleMap>
        )}

        {/* Legend overlay */}
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1 z-10">
          <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1">GPS FRESHNESS</div>
          <div className="flex items-center gap-2"><Circle className="w-2.5 h-2.5 fill-[#22C55E] text-[#22C55E]" /> &lt; 2 min</div>
          <div className="flex items-center gap-2"><Circle className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]" /> 2 – 5 min</div>
          <div className="flex items-center gap-2"><Circle className="w-2.5 h-2.5 fill-[#EF4444] text-[#EF4444]" /> &gt; 5 min</div>
        </div>
      </section>
    </div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="fixed inset-0 left-[232px] top-14 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <MapPin className="w-8 h-8 text-muted mx-auto mb-3" />
        <div className="text-lg font-semibold text-foreground">{title}</div>
        <p className="text-sm text-muted mt-2">{body}</p>
      </div>
    </div>
  )
}
