import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Counters = {
  bookings_this_month: number
  active_dmcs: number
  trips_in_progress: number
  fetched_at: string
  source: "live" | "fallback"
}

const FALLBACK: Omit<Counters, "fetched_at" | "source"> = {
  bookings_this_month: 0,
  active_dmcs: 0,
  trips_in_progress: 0,
}

export async function GET() {
  try {
    const supabase = await createClient()
    const startOfMonth = new Date()
    startOfMonth.setUTCDate(1)
    startOfMonth.setUTCHours(0, 0, 0, 0)

    const [bookingsRes, dmcsRes, tripsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("dmc_users")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("trips")
        .select("id", { count: "exact", head: true })
        .eq("status", "in_progress"),
    ])

    const live: Counters = {
      bookings_this_month: bookingsRes.count ?? FALLBACK.bookings_this_month,
      active_dmcs: dmcsRes.count ?? FALLBACK.active_dmcs,
      trips_in_progress: tripsRes.count ?? FALLBACK.trips_in_progress,
      fetched_at: new Date().toISOString(),
      source: "live",
    }

    return NextResponse.json(live, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json(
      { ...FALLBACK, fetched_at: new Date().toISOString(), source: "fallback" },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
