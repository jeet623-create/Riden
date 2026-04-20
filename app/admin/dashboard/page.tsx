"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import {
  RefreshCcw, Search, Command, AlertTriangle, UserPlus, Inbox, Ticket, Activity,
  ArrowUp, ArrowDown, Zap, Check, X as XIcon, Siren, MessageCircle, ArrowUpRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// ---------- Types ----------
type Pulse = {
  active_dmcs: number
  trips_running: number
  operators_online: number
  drivers_in_pool: number
  open_tickets: number
  panic_alerts: number
}

type PendingActivation = {
  id: string
  company_name: string
  country: string | null
  created_at: string
  subscription_status: string
  plan: string | null
  price_thb: number | null
  has_proof: boolean
}

type RecentSignup = {
  id: string
  company_name: string
  country: string | null
  trial_ends_at: string | null
  created_at: string
}

type PanicRow = {
  trip_id: string
  booking_id: string | null
  booking_ref: string | null
  dmc_name: string | null
  driver_name: string | null
  created_at: string
}

type ActivityEvent = {
  key: string
  kind: "booking" | "trip_event" | "assignment" | "support"
  at: string
  label: string
  who: string | null
  href: string | null
  tone: "teal" | "amber" | "red" | "grey" | "blue"
}

// ---------- Shared helpers ----------
function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diffS = Math.floor((now - d.getTime()) / 1000)
  if (diffS < 60) return `${diffS}s`
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m`
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h`
  return `${Math.floor(diffS / 86400)}d`
}

function fmtDateStamp(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
}

function fmtTHB(n: number) {
  return `฿${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

// ---------- Page ----------
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [pulse, setPulse] = useState<Pulse | null>(null)
  const [mrr, setMrr] = useState<number>(0)
  const [mrrDeltaPct, setMrrDeltaPct] = useState<number | null>(null)
  const [monthCollected, setMonthCollected] = useState<number>(0)
  const [sparkline, setSparkline] = useState<number[]>([])
  const [pendingActs, setPendingActs] = useState<PendingActivation[]>([])
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([])
  const [panicAlerts, setPanicAlerts] = useState<PanicRow[]>([])
  const [lineHealthy, setLineHealthy] = useState<boolean | null>(null)
  const [edgeErrorsHr, setEdgeErrorsHr] = useState<number | null>(null)
  const [dbHealthy, setDbHealthy] = useState<boolean>(true)
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [clock, setClock] = useState(new Date())

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const DAY_MS = 86_400_000
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfThisMonthIso = startOfMonth.toISOString()
    const startOfPrevMonthIso = startOfPrevMonth.toISOString()
    const ninetyDaysAgoIso = new Date(now.getTime() - 90 * DAY_MS).toISOString()
    const sevenDaysAgoIso = new Date(now.getTime() - 7 * DAY_MS).toISOString()
    const twentyFourHoursAgoIso = new Date(now.getTime() - DAY_MS).toISOString()

    const [
      { count: activeDmcs },
      { count: tripsRunning },
      { count: operatorsOnline },
      { count: driversInPool },
      { count: openTickets },
      { count: panicCount },

      { data: activeSubs },
      { data: recentPayments },

      { data: pendingDmcs },
      { data: signups },
      { data: panics },

      { data: recentBookings },
      { data: recentTripEvents },
      { data: recentAssignments },
      { data: recentTickets },
    ] = await Promise.all([
      supabase.from("dmc_users").select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
      supabase.from("trips").select("*", { count: "exact", head: true }).in("status", ["in_progress", "assigned", "driver_assigned"]),
      supabase.from("operators").select("*", { count: "exact", head: true }).eq("is_verified", true).eq("status", "active"),
      supabase.from("drivers").select("*", { count: "exact", head: true }).eq("is_verified", true).eq("is_available", true),
      supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("trips").select("*", { count: "exact", head: true }).eq("status", "panic"),

      supabase
        .from("subscriptions")
        .select("price_thb, end_date, start_date, created_at, activated_at, status, dmc_id")
        .eq("status", "active"),
      supabase
        .from("subscriptions")
        .select("price_thb, start_date, created_at, status")
        .gte("created_at", ninetyDaysAgoIso)
        .order("created_at", { ascending: true }),

      supabase
        .from("dmc_users")
        .select("id, company_name, country, created_at, subscription_status")
        .in("subscription_status", ["suspended", "trial", "pending"])
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("dmc_users")
        .select("id, company_name, country, trial_ends_at, created_at")
        .gte("created_at", sevenDaysAgoIso)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("trips")
        .select("id, booking_id, created_at, driver_id, bookings(booking_ref, dmc_id, dmc_users(company_name)), drivers(full_name)")
        .eq("status", "panic")
        .gte("created_at", twentyFourHoursAgoIso)
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("bookings")
        .select("id, booking_ref, client_name, created_at, dmc_users(company_name)")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("trip_events")
        .select("id, trip_id, event_type, created_at, notes")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("trip_assignments")
        .select("id, trip_id, operator_id, driver_id, assigned_at, operators(company_name), drivers(full_name)")
        .order("assigned_at", { ascending: false })
        .limit(6),
      supabase
        .from("support_tickets")
        .select("id, ticket_ref, subject, priority, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ])

    setPulse({
      active_dmcs: activeDmcs ?? 0,
      trips_running: tripsRunning ?? 0,
      operators_online: operatorsOnline ?? 0,
      drivers_in_pool: driversInPool ?? 0,
      open_tickets: openTickets ?? 0,
      panic_alerts: panicCount ?? 0,
    })

    const currentMrr = (activeSubs ?? []).reduce((s: number, r: any) => s + (Number(r.price_thb) || 0), 0)
    setMrr(currentMrr)

    const subHistory = recentPayments ?? []
    const thisMonth = subHistory.filter((p: any) => p.created_at >= startOfThisMonthIso && p.status === "active")
    const prevMonth = subHistory.filter((p: any) => p.created_at >= startOfPrevMonthIso && p.created_at < startOfThisMonthIso && p.status === "active")
    const thisSum = thisMonth.reduce((s: number, r: any) => s + (Number(r.price_thb) || 0), 0)
    const prevSum = prevMonth.reduce((s: number, r: any) => s + (Number(r.price_thb) || 0), 0)
    setMonthCollected(thisSum)
    if (prevSum > 0) setMrrDeltaPct(Math.round(((thisSum - prevSum) / prevSum) * 100))
    else if (thisSum > 0) setMrrDeltaPct(100)
    else setMrrDeltaPct(null)

    // 90-day sparkline bucketed per 3 days
    const buckets: number[] = new Array(30).fill(0)
    subHistory.forEach((p: any) => {
      if (p.status !== "active") return
      const d = new Date(p.created_at).getTime()
      const age = Math.floor((now.getTime() - d) / DAY_MS)
      const idx = Math.max(0, Math.min(29, 29 - Math.floor(age / 3)))
      buckets[idx] += Number(p.price_thb) || 0
    })
    setSparkline(buckets)

    // pending activations: take suspended or with proof waiting
    const pendingList: PendingActivation[] = []
    for (const d of (pendingDmcs ?? [])) {
      const { data: subRow } = await supabase
        .from("subscriptions")
        .select("plan, price_thb, payment_proof_url, status, created_at")
        .eq("dmc_id", d.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      const hasProof = Boolean(subRow?.payment_proof_url)
      const isSuspended = d.subscription_status === "suspended"
      if (isSuspended || hasProof) {
        pendingList.push({
          id: d.id,
          company_name: d.company_name,
          country: d.country ?? null,
          created_at: d.created_at,
          subscription_status: d.subscription_status,
          plan: subRow?.plan ?? null,
          price_thb: subRow?.price_thb != null ? Number(subRow.price_thb) : null,
          has_proof: hasProof,
        })
        if (pendingList.length >= 5) break
      }
    }
    setPendingActs(pendingList)

    setRecentSignups((signups ?? []).map((s: any) => ({
      id: s.id, company_name: s.company_name, country: s.country, trial_ends_at: s.trial_ends_at, created_at: s.created_at,
    })))

    setPanicAlerts((panics ?? []).map((p: any) => ({
      trip_id: p.id,
      booking_id: p.booking_id,
      booking_ref: p.bookings?.booking_ref ?? null,
      dmc_name: p.bookings?.dmc_users?.company_name ?? null,
      driver_name: p.drivers?.full_name ?? null,
      created_at: p.created_at,
    })))

    // ---- system health: LINE via most recent line_user_log success, edge errors TBD (no error table, proxy via webhook_events fail count)
    const { data: lineLog } = await supabase
      .from("line_user_log")
      .select("last_seen")
      .order("last_seen", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (lineLog?.last_seen) {
      const ageMin = (now.getTime() - new Date(lineLog.last_seen).getTime()) / 60000
      setLineHealthy(ageMin < 60 * 24)
    } else setLineHealthy(null)

    const { count: webhookErrCount } = await supabase
      .from("webhook_events")
      .select("*", { count: "exact", head: true })
      .gte("processed_at", new Date(now.getTime() - 3600_000).toISOString())
    setEdgeErrorsHr(webhookErrCount ?? 0)
    setDbHealthy(true)

    // ---- recent activity merge
    const events: ActivityEvent[] = []
    ;(recentBookings ?? []).forEach((b: any) => {
      events.push({
        key: `b-${b.id}`,
        kind: "booking",
        at: b.created_at,
        label: `Booking ${b.booking_ref ?? b.id.slice(0, 8)} · ${b.client_name ?? "—"}`,
        who: b.dmc_users?.company_name ?? null,
        href: `/admin/bookings`,
        tone: "teal",
      })
    })
    ;(recentTripEvents ?? []).forEach((ev: any) => {
      events.push({
        key: `t-${ev.id}`,
        kind: "trip_event",
        at: ev.created_at,
        label: `Trip ${ev.trip_id} · ${ev.event_type}`,
        who: ev.notes ?? null,
        href: null,
        tone: ev.event_type?.includes("panic") ? "red" : "blue",
      })
    })
    ;(recentAssignments ?? []).forEach((a: any) => {
      events.push({
        key: `a-${a.id}`,
        kind: "assignment",
        at: a.assigned_at,
        label: `Assigned ${a.trip_id} → ${a.drivers?.full_name ?? a.operators?.company_name ?? "pending"}`,
        who: a.operators?.company_name ?? null,
        href: null,
        tone: "grey",
      })
    })
    ;(recentTickets ?? []).forEach((t: any) => {
      events.push({
        key: `s-${t.id}`,
        kind: "support",
        at: t.created_at,
        label: `Ticket ${t.ticket_ref ?? ""} · ${t.subject ?? "—"}`,
        who: t.priority ? `priority ${t.priority}` : null,
        href: `/admin/support`,
        tone: t.priority === "high" || t.priority === "urgent" ? "amber" : "grey",
      })
    })

    events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    setActivity(events.slice(0, 20))

    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return
      if (e.key === "r" || e.key === "R") { fetchAll() }
      if (e.key === "/") { e.preventDefault(); document.getElementById("admin-dash-search")?.focus() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fetchAll])

  const clockStr = clock.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
  const dateStr = clock.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })

  return (
    <div className="space-y-4 text-[13px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · COMMAND</div>
            <div className="text-foreground text-[15px] font-medium leading-tight">{dateStr} · <span className="font-mono text-muted">{clockStr} BKK</span></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              id="admin-dash-search"
              placeholder="Search  /  "
              className="h-8 pl-8 pr-8 rounded-md bg-surface border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary w-52"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono">/</span>
          </div>
          <KeyHint k="N" label="New" />
          <KeyHint k="⌘K" label="Commands" />
          <button onClick={fetchAll} className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-surface text-[12px] text-muted hover:text-foreground hover:border-primary/40 transition-colors">
            <RefreshCcw className="w-3 h-3" /> R
          </button>
        </div>
      </div>

      {/* Pulse strip */}
      <PulseStrip pulse={pulse} loading={loading} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <RevenueCard mrr={mrr} monthCollected={monthCollected} deltaPct={mrrDeltaPct} sparkline={sparkline} loading={loading} />
          <PendingActivationsCard rows={pendingActs} loading={loading} />
        </div>
        <div className="space-y-4">
          <RecentSignupsCard rows={recentSignups} loading={loading} />
          <PanicAlertsCard rows={panicAlerts} loading={loading} />
          <SystemHealthCard
            dbHealthy={dbHealthy}
            lineHealthy={lineHealthy}
            edgeErrorsHr={edgeErrorsHr}
            loading={loading}
          />
        </div>
      </div>

      <ActivityCard events={activity} loading={loading} />
    </div>
  )
}

// ---------- Pulse strip ----------
function PulseStrip({ pulse, loading }: { pulse: Pulse | null; loading: boolean }) {
  const items: { label: string; value: number; tone: string }[] = [
    { label: "ACTIVE DMCS", value: pulse?.active_dmcs ?? 0, tone: "text-primary" },
    { label: "TRIPS RUNNING", value: pulse?.trips_running ?? 0, tone: "text-foreground" },
    { label: "OPERATORS ONLINE", value: pulse?.operators_online ?? 0, tone: "text-foreground" },
    { label: "DRIVERS IN POOL", value: pulse?.drivers_in_pool ?? 0, tone: "text-foreground" },
    { label: "OPEN TICKETS", value: pulse?.open_tickets ?? 0, tone: (pulse?.open_tickets ?? 0) > 0 ? "text-[color:var(--warning)]" : "text-foreground" },
    { label: "PANIC", value: pulse?.panic_alerts ?? 0, tone: (pulse?.panic_alerts ?? 0) > 0 ? "text-[color:var(--panic)]" : "text-foreground" },
  ]
  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="flex divide-x divide-border overflow-x-auto">
        {items.map((it, i) => (
          <div key={it.label} className="flex-1 min-w-[130px] px-4 py-3 relative">
            {i > 0 && <span className="hidden sm:block absolute left-0 top-3 bottom-3 w-[2px] bg-primary/30" />}
            <div className="font-mono text-[10px] uppercase text-muted tracking-wider">{it.label}</div>
            <div className={`font-mono text-[22px] font-semibold leading-tight ${it.tone} ${loading ? "opacity-30" : ""}`}>
              {loading ? "—" : it.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- Revenue ----------
function RevenueCard({
  mrr, monthCollected, deltaPct, sparkline, loading,
}: { mrr: number; monthCollected: number; deltaPct: number | null; sparkline: number[]; loading: boolean }) {
  const series = sparkline.map(v => ({ v }))
  const up = deltaPct != null && deltaPct >= 0
  return (
    <Panel title="REVENUE" icon={<Zap className="w-3 h-3" />} accent>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-wider">MRR</div>
          <div className="font-mono text-[26px] font-semibold text-foreground leading-tight">{loading ? "—" : fmtTHB(mrr)}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
            <span>This month: <span className="font-mono text-foreground">{fmtTHB(monthCollected)}</span></span>
            {deltaPct != null && (
              <span className={`inline-flex items-center gap-0.5 font-mono ${up ? "text-primary" : "text-[color:var(--danger)]"}`}>
                {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{Math.abs(deltaPct)}%
              </span>
            )}
          </div>
        </div>
        <div style={{ width: 180, height: 48 }}>
          <ResponsiveContainer>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="mrr-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={1.5} fill="url(#mrr-spark)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-muted font-mono">90d revenue · sum of `subscriptions.price_thb` where status=active</div>
    </Panel>
  )
}

// ---------- Pending activations ----------
function PendingActivationsCard({ rows, loading }: { rows: PendingActivation[]; loading: boolean }) {
  return (
    <Panel title="PENDING ACTIVATIONS" icon={<Inbox className="w-3 h-3" />}>
      {loading ? (
        <Skel rows={3} />
      ) : rows.length === 0 ? (
        <EmptyRow text="No activations waiting." />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map(r => (
            <li key={r.id} className="py-2 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-foreground truncate">{r.company_name}</div>
                <div className="text-[11px] text-muted font-mono flex items-center gap-2">
                  <span>{r.country ?? "—"}</span>
                  <span>·</span>
                  <span>{r.subscription_status}</span>
                  {r.has_proof && <><span>·</span><span className="text-primary">proof uploaded</span></>}
                  {r.price_thb != null && <><span>·</span><span>{fmtTHB(r.price_thb)}</span></>}
                </div>
              </div>
              <button
                onClick={() => alert("Activation modal — coming in Phase 3h")}
                className="h-7 px-2.5 rounded-md bg-primary/10 text-primary text-[12px] font-medium hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
              >
                Activate <ArrowUpRight className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

// ---------- Recent signups ----------
function RecentSignupsCard({ rows, loading }: { rows: RecentSignup[]; loading: boolean }) {
  return (
    <Panel title="RECENT SIGNUPS · 7d" icon={<UserPlus className="w-3 h-3" />}>
      {loading ? (
        <Skel rows={3} />
      ) : rows.length === 0 ? (
        <EmptyRow text="No signups in the last 7 days." />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map(r => (
            <li key={r.id} className="py-2 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <Link href={`/admin/dmcs/${r.id}`} className="text-foreground hover:text-primary transition-colors truncate block">
                  {r.company_name}
                </Link>
                <div className="text-[11px] text-muted font-mono flex items-center gap-2">
                  <span>{r.country ?? "—"}</span>
                  <span>·</span>
                  <span>trial ends {r.trial_ends_at ? fmtTime(r.trial_ends_at) : "—"}</span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-muted">{fmtTime(r.created_at)} ago</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

// ---------- Panic alerts ----------
function PanicAlertsCard({ rows, loading }: { rows: PanicRow[]; loading: boolean }) {
  return (
    <Panel title="PANIC ALERTS · 24h" icon={<Siren className="w-3 h-3" />} danger={rows.length > 0}>
      {loading ? (
        <Skel rows={2} />
      ) : rows.length === 0 ? (
        <EmptyRow text="No panic alerts." />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map(r => (
            <li key={r.trip_id} className="py-2 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-foreground truncate font-mono text-[12px]">
                  {r.booking_ref ?? r.trip_id} · <span className="text-[color:var(--panic)]">panic</span>
                </div>
                <div className="text-[11px] text-muted truncate">{r.dmc_name ?? "—"}{r.driver_name ? ` · ${r.driver_name}` : ""}</div>
              </div>
              <span className="font-mono text-[11px] text-[color:var(--panic)]">{fmtTime(r.created_at)} ago</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

// ---------- System health ----------
function SystemHealthCard({
  dbHealthy, lineHealthy, edgeErrorsHr, loading,
}: { dbHealthy: boolean; lineHealthy: boolean | null; edgeErrorsHr: number | null; loading: boolean }) {
  const items = [
    { label: "Supabase DB", healthy: dbHealthy, detail: "ping ok" },
    { label: "LINE Messaging", healthy: lineHealthy ?? false, detail: lineHealthy == null ? "no recent log" : lineHealthy ? "recent success" : "stale > 24h" },
    { label: "Edge Functions", healthy: (edgeErrorsHr ?? 0) < 5, detail: `${edgeErrorsHr ?? 0} events/hr` },
  ]
  return (
    <Panel title="SYSTEM HEALTH" icon={<Activity className="w-3 h-3" />}>
      {loading ? <Skel rows={3} /> : (
        <ul className="divide-y divide-border">
          {items.map(i => (
            <li key={i.label} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${i.healthy ? "bg-primary" : "bg-[color:var(--danger)]"}`} />
                <span className="text-foreground">{i.label}</span>
              </div>
              <span className="font-mono text-[11px] text-muted">{i.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

// ---------- Activity ----------
function ActivityCard({ events, loading }: { events: ActivityEvent[]; loading: boolean }) {
  return (
    <Panel title="RECENT ACTIVITY" icon={<MessageCircle className="w-3 h-3" />}>
      {loading ? <Skel rows={5} /> : events.length === 0 ? <EmptyRow text="No activity yet." /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["TIME", "EVENT", "WHO"].map(h => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.key} className="border-t border-border hover:bg-surface-elevated/60 transition-colors">
                  <td className="py-2 pr-4 font-mono text-[11px] text-muted whitespace-nowrap">{fmtDateStamp(ev.at)}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <EventIcon kind={ev.kind} tone={ev.tone} />
                      {ev.href ? (
                        <Link href={ev.href} className="text-foreground hover:text-primary transition-colors">{ev.label}</Link>
                      ) : (
                        <span className="text-foreground">{ev.label}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-muted truncate max-w-[280px]">{ev.who ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

function EventIcon({ kind, tone }: { kind: ActivityEvent["kind"]; tone: ActivityEvent["tone"] }) {
  const color = tone === "red" ? "var(--panic)" : tone === "amber" ? "var(--warning)" : tone === "blue" ? "var(--info)" : tone === "teal" ? "var(--primary)" : "var(--muted)"
  const Icon =
    kind === "booking" ? Ticket :
    kind === "trip_event" ? Activity :
    kind === "assignment" ? Check :
    MessageCircle
  return <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface-elevated"><Icon className="w-3 h-3" style={{ color }} /></span>
}

// ---------- Primitives ----------
function Panel({ title, icon, accent, danger, children }: {
  title: string; icon?: React.ReactNode; accent?: boolean; danger?: boolean; children: React.ReactNode
}) {
  return (
    <section className={`bg-surface rounded-lg border ${danger ? "border-[color:var(--danger)]/30" : "border-border"}`}>
      <header className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className={`font-mono text-[10px] uppercase tracking-wider ${accent ? "text-primary" : "text-muted"}`}>{title}</span>
          {icon && <span className={accent ? "text-primary" : "text-muted"}>{icon}</span>}
        </div>
      </header>
      <div className="px-4 py-3 text-[13px]">{children}</div>
    </section>
  )
}

function KeyHint({ k, label }: { k: string; label: string }) {
  return (
    <div className="hidden md:flex items-center gap-1 text-[11px] text-muted">
      <kbd className="px-1.5 h-5 rounded bg-surface border border-border font-mono text-[10px] text-foreground inline-flex items-center">{k}</kbd>
      <span>{label}</span>
    </div>
  )
}

function Skel({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-5 bg-surface-elevated rounded animate-pulse" />
      ))}
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <div className="text-[12px] text-muted italic py-3">{text}</div>
}
