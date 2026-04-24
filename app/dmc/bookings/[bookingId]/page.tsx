"use client"

export const dynamic = "force-dynamic"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Car, MapPin, Users, Phone, MapPinned } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/dmc/status-badge"
import { ShareDriverCard } from "@/components/dmc/share-driver-card"
import { BookingPaymentStatus } from "@/components/dmc/booking-payment-status"
import { createClient } from "@/lib/supabase/client"

type Booking = {
  id: string
  booking_ref: string
  client_name: string
  client_phone: string | null
  client_email: string | null
  source_agent: string | null
  adults_count: number | null
  children_count: number | null
  children_ages: string | null
  total_days: number
  status: string
  dispatch_state: string | null
  special_requirements: string | null
  notes: string | null
  created_at: string
}

type Trip = {
  id: string
  day_number: number
  trip_date: string
  pickup_time: string | null
  pickup_location: string | null
  dropoff_location: string | null
  vehicle_type: string | null
  pax_count: number | null
  booking_type: string | null
  status: string
  driver_id: string | null
  driver?: { full_name: string | null; phone: string | null } | null
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = use(params)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [dmcId, setDmcId] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setDmcId(user?.id ?? null)
    })()
  }, [])

  const load = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    const [{ data: b, error: bErr }, { data: t, error: tErr }] = await Promise.all([
      supabase
        .from("bookings")
        .select(
          "id, booking_ref, client_name, client_phone, client_email, source_agent, adults_count, children_count, children_ages, total_days, status, dispatch_state, special_requirements, notes, created_at"
        )
        .eq("id", bookingId)
        .maybeSingle(),
      supabase
        .from("trips")
        .select(
          "id, day_number, trip_date, pickup_time, pickup_location, dropoff_location, vehicle_type, pax_count, booking_type, status, driver_id"
        )
        .eq("booking_id", bookingId)
        .order("day_number", { ascending: true }),
    ])

    if (bErr) toast.error("Failed to load booking: " + bErr.message)
    if (tErr) toast.error("Failed to load trips: " + tErr.message)
    setBooking((b as Booking) ?? null)

    const tripRows = (t as Trip[]) ?? []
    const driverIds = Array.from(new Set(tripRows.map(x => x.driver_id).filter(Boolean))) as string[]
    if (driverIds.length > 0) {
      const { data: drivers } = await supabase
        .from("drivers")
        .select("id, full_name, phone")
        .in("id", driverIds)
      const byId: Record<string, { full_name: string | null; phone: string | null }> = {}
      for (const d of drivers ?? []) byId[d.id] = { full_name: d.full_name, phone: d.phone }
      for (const tr of tripRows) if (tr.driver_id) tr.driver = byId[tr.driver_id] ?? null
    }
    setTrips(tripRows)
    setLoading(false)
  }, [bookingId])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !booking) {
    return <div className="text-sm text-muted">Loading booking…</div>
  }
  if (!booking) {
    return (
      <div className="space-y-3">
        <BackLink />
        <div className="text-sm text-muted">Booking not found.</div>
      </div>
    )
  }

  const pax = (booking.adults_count ?? 0) + (booking.children_count ?? 0)

  return (
    <div className="space-y-6">
      <BackLink />

      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">BOOKING · {booking.booking_ref}</div>
          <h1 className="font-display italic text-[26px] font-semibold text-foreground leading-tight">
            {booking.client_name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted">
            <StatusBadge status={booking.status as any} />
            <span><Calendar className="inline w-3 h-3 mr-0.5" /> {booking.total_days} day{booking.total_days === 1 ? "" : "s"}</span>
            <span><Users className="inline w-3 h-3 mr-0.5" /> {pax} pax</span>
            {booking.client_phone && (
              <a href={`tel:${booking.client_phone}`} className="hover:text-primary">
                <Phone className="inline w-3 h-3 mr-0.5" /> {booking.client_phone}
              </a>
            )}
            <span>Created {new Date(booking.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      {booking.special_requirements && (
        <Panel label="SPECIAL REQUIREMENTS">
          <p className="text-sm text-foreground whitespace-pre-wrap">{booking.special_requirements}</p>
        </Panel>
      )}
      {booking.notes && (
        <Panel label="NOTES">
          <p className="text-sm text-foreground whitespace-pre-wrap">{booking.notes}</p>
        </Panel>
      )}

      {dmcId && (
        <section className="space-y-4">
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">PAYMENT STATUS</div>
          <BookingPaymentStatus bookingId={bookingId} dmcId={dmcId} />
        </section>
      )}

      <section className="space-y-4">
        <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ITINERARY · {trips.length} day{trips.length === 1 ? "" : "s"}</div>

        {trips.length === 0 ? (
          <div className="text-sm text-muted italic">No trip days yet.</div>
        ) : (
          trips.map(trip => (
            <TripCard key={trip.id} trip={trip} bookingId={bookingId} />
          ))
        )}
      </section>
    </div>
  )
}

function BackLink() {
  return (
    <Link href="/dmc/bookings" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground">
      <ArrowLeft className="w-3.5 h-3.5" /> All bookings
    </Link>
  )
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em] mb-1.5">{label}</div>
      {children}
    </div>
  )
}

function TripCard({ trip, bookingId }: { trip: Trip; bookingId: string }) {
  const hasDriver = Boolean(trip.driver_id)
  const isLive = trip.status === "in_progress"

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary font-mono text-[12px] font-medium">
            D{trip.day_number}
          </span>
          <div>
            <div className="text-sm font-medium text-foreground">
              {new Date(trip.trip_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              {trip.pickup_time && <span className="text-muted font-mono"> · {trip.pickup_time}</span>}
            </div>
            <div className="font-mono text-[10px] uppercase text-muted">TRIP · {trip.id}</div>
          </div>
        </div>
        <StatusBadge status={trip.status as any} showPulse={isLive} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-muted">Pickup</div>
            <div className="text-foreground">{trip.pickup_location ?? "—"}</div>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <MapPinned className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-muted">Dropoff</div>
            <div className="text-foreground">{trip.dropoff_location ?? "—"}</div>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <Car className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-muted">Vehicle</div>
            <div className="text-foreground">{trip.vehicle_type ?? "—"}{trip.pax_count ? ` · ${trip.pax_count} pax` : ""}</div>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-mono uppercase text-muted">Driver</div>
            <div className="text-foreground">
              {trip.driver?.full_name ?? (hasDriver ? "—" : <span className="text-muted italic">Not assigned</span>)}
              {trip.driver?.phone && <span className="text-muted"> · {trip.driver.phone}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isLive && (
          <Link
            href={`/dmc/bookings/${bookingId}/trips/${trip.id}/live`}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
          >
            <MapPin className="w-3.5 h-3.5" /> View live location
          </Link>
        )}

        {hasDriver && (trip.status === "assigned" || trip.status === "driver_assigned" || trip.status === "operator_accepted" || trip.status === "in_progress") && (
          <ShareDriverCard tripId={trip.id} />
        )}
      </div>
    </div>
  )
}
