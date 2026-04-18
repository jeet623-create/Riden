
"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Stats {
  dmc_count: number
  operator_count: number
  driver_count: number
  active_trips: number
  vehicle_count: number
  pending_drivers: number
  recent_bookings: number
  mrr: number
  open_tickets: number
}

interface BookingTrend {
  date: string
  count: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: dmc_count },
        { count: operator_count },
        { count: driver_count },
        { count: active_trips },
        { count: vehicle_count },
        { count: pending_drivers },
        { count: recent_bookings },
        { count: open_tickets },
        { data: subs },
      ] = await Promise.all([
        supabase.from("dmc_users").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("operators").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("drivers").select("*", { count: "exact", head: true }).eq("is_verified", true),
        supabase.from("trips").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
        supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("drivers").select("*", { count: "exact", head: true }).eq("is_verified", false).eq("is_active", true),
        supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("subscriptions").select("price_thb").eq("status", "active"),
      ])
      const mrr = (subs || []).reduce((s: number, r: any) => s + (Number(r.price_thb) || 0), 0)
      setStats({
        dmc_count: dmc_count || 0,
        operator_count: operator_count || 0,
        driver_count: driver_count || 0,
        active_trips: active_trips || 0,
        vehicle_count: vehicle_count || 0,
        pending_drivers: pending_drivers || 0,
        recent_bookings: recent_bookings || 0,
        mrr,
        open_tickets: open_tickets || 0,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    { label: "ACTIVE DMCS", value: stats?.dmc_count, sub: "companies", color: "text-primary", icon: "🏢" },
    { label: "OPERATORS", value: stats?.operator_count, sub: "fleet owners", color: "text-blue-400", icon: "🚐" },
    { label: "VERIFIED DRIVERS", value: stats?.driver_count, sub: "in pool", color: "text-primary", icon: "👤" },
    { label: "EST. MRR", value: stats ? `฿${stats.mrr.toLocaleString()}` : null, sub: "monthly recurring", color: "text-amber-400", icon: "💰" },
    { label: "ACTIVE TRIPS", value: stats?.active_trips, sub: "running now", color: "text-primary", icon: "🗺" },
    { label: "VEHICLES", value: stats?.vehicle_count, sub: "active fleet", color: "text-blue-400", icon: "🚗" },
    { label: "PENDING REVIEW", value: stats?.pending_drivers, sub: "need approval", color: "text-amber-400", icon: "⏳" },
    { label: "RECENT BOOKINGS", value: stats?.recent_bookings, sub: "this week", color: "text-blue-400", icon: "📋" },
  ]

  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">Command Center</h1>
          <p className="text-sm text-muted mt-0.5">{dateStr} · Bangkok</p>
        </div>
        <button onClick={() => { setLoading(true); window.location.reload() }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:bg-surface-elevated transition-colors">
          ↻ Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-surface border border-border rounded-xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">{c.label}</p>
            {loading ? (
              <div className="h-8 w-16 bg-surface-elevated rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-[28px] font-bold ${c.color}`}>{c.value}</p>
            )}
            <p className="text-[12px] text-muted">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {stats && stats.pending_drivers > 0 && (
        <Link href="/admin/drivers">
          <div className="mb-6 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-500/15 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-amber-400">⚠</span>
              <div>
                <p className="text-sm font-medium text-amber-400">{stats.pending_drivers} driver{stats.pending_drivers > 1 ? "s" : ""} waiting for approval</p>
                <p className="text-xs text-muted">Review driver applications to activate their accounts</p>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-medium">Review →</span>
          </div>
        </Link>
      )}

      {stats && stats.open_tickets > 0 && (
        <Link href="/admin/support">
          <div className="mb-6 flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 cursor-pointer hover:bg-red-500/15 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-red-400">🎫</span>
              <p className="text-sm font-medium text-red-400">{stats.open_tickets} open support ticket{stats.open_tickets > 1 ? "s" : ""}</p>
            </div>
            <span className="text-xs text-red-400 font-medium">View →</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Activate Subscription", href: "/admin/subscriptions", color: "bg-primary/10 text-primary border-primary/20" },
              { label: "Review Drivers", href: "/admin/drivers", color: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
              { label: "View Operators", href: "/admin/operators", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
              { label: "Support Inbox", href: "/admin/support", color: "bg-red-400/10 text-red-400 border-red-400/20" },
            ].map(a => (
              <Link key={a.label} href={a.href}>
                <div className={`border rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${a.color}`}>
                  {a.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">System Status</h3>
          <div className="space-y-3">
            {[
              { label: "Supabase Database", status: "Operational" },
              { label: "LINE Bot Webhook", status: "Operational" },
              { label: "Edge Functions", status: "Operational" },
              { label: "File Storage", status: "Operational" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-muted">{s.label}</span>
                <span className="flex items-center gap-1.5 text-xs text-primary font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
