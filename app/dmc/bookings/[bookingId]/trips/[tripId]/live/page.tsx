"use client"

export const dynamic = "force-dynamic"

import { use, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Script from "next/script"
import { ArrowLeft, Circle, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Position = {
  lat: number
  lng: number
  updatedAt: string | null
}

type Trip = {
  id: string
  driver_id: string | null
  pickup_location: string | null
  dropoff_location: string | null
  status: string | null
}

type Driver = {
  id: string
  full_name: string | null
  current_lat: number | string | null
  current_lng: number | string | null
  current_location_updated_at: string | null
  phone: string | null
}

type TrailPoint = { lat: number; lng: number; captured_at: string }

declare global {
  interface Window {
    google?: any
  }
  // Loose types so we don't need @types/google.maps; the Google Maps JS API
  // is loaded via <Script>, so runtime is still correct.
  const google: any
  namespace google.maps {
    type Map = any
    type Marker = any
    type Polyline = any
    type MapTypeStyle = any
    type LatLng = any
  }
}

export default function LiveMapPage({
  params,
}: {
  params: Promise<{ bookingId: string; tripId: string }>
}) {
  const { bookingId, tripId } = use(params)

  const mapsKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const [trip, setTrip] = useState<Trip | null>(null)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [pos, setPos] = useState<Position | null>(null)
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const [mapsReady, setMapsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const pathRef = useRef<google.maps.Polyline | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const fetchPosition = useCallback(async () => {
    const supabase = createClient()

    const { data: tripRow, error: tripErr } = await supabase
      .from("trips")
      .select("id, driver_id, pickup_location, dropoff_location, status")
      .eq("id", tripId)
      .maybeSingle()

    if (tripErr) {
      setError(tripErr.message)
      return
    }
    if (!tripRow) {
      setError("Trip not found")
      return
    }
    setTrip(tripRow as Trip)

    if (!tripRow.driver_id) {
      setError("No driver assigned yet")
      return
    }

    const [{ data: drv, error: drvErr }, { data: trailRows }] = await Promise.all([
      supabase
        .from("drivers")
        .select("id, full_name, current_lat, current_lng, current_location_updated_at, phone")
        .eq("id", tripRow.driver_id)
        .maybeSingle(),
      supabase
        .from("driver_locations")
        .select("lat, lng, captured_at")
        .eq("trip_id", tripId)
        .order("captured_at", { ascending: true })
        .limit(200),
    ])

    if (drvErr) {
      setError(drvErr.message)
      return
    }
    if (!drv) {
      setError("Driver record missing")
      return
    }
    setDriver(drv as Driver)

    if (drv.current_lat != null && drv.current_lng != null) {
      setPos({
        lat: Number(drv.current_lat),
        lng: Number(drv.current_lng),
        updatedAt: drv.current_location_updated_at,
      })
      setError(null)
    } else {
      setError("Waiting for first GPS ping from driver")
    }

    if (trailRows) {
      setTrail(
        trailRows
          .filter((r: any) => r.lat != null && r.lng != null)
          .map((r: any) => ({
            lat: Number(r.lat),
            lng: Number(r.lng),
            captured_at: r.captured_at,
          }))
      )
    }
  }, [tripId])

  useEffect(() => {
    fetchPosition()
    const interval = setInterval(fetchPosition, 15000)
    return () => clearInterval(interval)
  }, [fetchPosition])

  useEffect(() => {
    if (!mapsReady || !pos || !containerRef.current || !window.google?.maps) return
    const latLng = new google.maps.LatLng(pos.lat, pos.lng)

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: latLng,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: DARK_MAP_STYLE,
      })
    } else {
      mapRef.current.panTo(latLng)
    }

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: latLng,
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#1D9E75",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      })
    } else {
      markerRef.current.setPosition(latLng)
    }
  }, [mapsReady, pos])

  useEffect(() => {
    if (!mapsReady || !mapRef.current || trail.length < 2 || !window.google?.maps) return
    const path = trail.map(p => ({ lat: p.lat, lng: p.lng }))
    if (!pathRef.current) {
      pathRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#1D9E75",
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map: mapRef.current,
      })
    } else {
      pathRef.current.setPath(path)
    }
  }, [mapsReady, trail])

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <header className="flex items-center gap-3 bg-surface border-b border-border px-4 py-3">
        <Link
          href={`/dmc/bookings/${bookingId}`}
          className="text-muted hover:text-foreground p-1 -ml-1 rounded"
          aria-label="Back to booking"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">LIVE LOCATION</div>
          <div className="text-foreground text-sm font-medium truncate">
            {driver?.full_name ?? "Driver"}
            {trip?.pickup_location && trip?.dropoff_location && (
              <span className="text-muted font-normal"> · {trip.pickup_location} → {trip.dropoff_location}</span>
            )}
          </div>
        </div>
        {pos?.updatedAt && (
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Circle className="w-2 h-2 fill-primary text-primary animate-pulse" />
              <span className="font-mono text-[11px] text-muted">
                {new Date(pos.updatedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-[10px] text-muted">polling 15s</div>
          </div>
        )}
      </header>

      <div className="relative flex-1">
        {!mapsKey && (
          <Banner kind="error">
            NEXT_PUBLIC_GOOGLE_MAPS_KEY is not set. Add it in the DMC env file.
          </Banner>
        )}
        {error && <Banner kind="warn">{error}</Banner>}

        <div ref={containerRef} className="absolute inset-0 bg-background" />

        {!pos && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-6 h-6 text-muted mx-auto mb-2 animate-pulse" />
              <div className="text-sm text-muted">Locating driver…</div>
            </div>
          </div>
        )}
      </div>

      {mapsKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}`}
          strategy="afterInteractive"
          onReady={() => setMapsReady(true)}
        />
      )}
    </div>
  )
}

function Banner({ kind, children }: { kind: "warn" | "error"; children: React.ReactNode }) {
  const tone =
    kind === "error"
      ? "bg-[color:var(--danger,#c13e3e)]/10 text-[color:var(--danger,#c13e3e)] border-[color:var(--danger,#c13e3e)]/30"
      : "bg-primary/10 text-primary border-primary/30"
  return (
    <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-md text-xs border ${tone}`}>
      {children}
    </div>
  )
}

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
