"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type DmcUser = {
  id: string
  company_name: string
  subscription_plan: string
  subscription_status: string
  line_user_id: string | null
  trial_ends_at: string | null
}

type Stats = {
  total_bookings: number
  active_trips: number
  pending_bookings: number
  confirmed_bookings: number
}

export default function DmcDashboardPage() {
  const [dmc, setDmc] = useState<DmcUser | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: dmcData } = await supabase
        .from("dmc_users")
        .select("id, company_name, subscription_plan, subscription_status, line_user_id, trial_ends_at")
        .eq("id", user.id)
        .single()
      if (!dmcData) { setLoading(false); return }
      setDmc(dmcData)
      await fetchStats(user.id, supabase)
    })()
  }, [])

  async function fetchStats(dmcId: string, supabase: ReturnType<typeof createClient>) {
    const [
      { count: total_bookings },
      { count: active_trips },
      { count: pending_bookings },
      { count: confirmed_bookings },
    ] = await Promise.all([
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId),
      supabase.from("trips").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId).eq("status", "in_progress"),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId).eq("status", "pending"),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId).eq("status", "confirmed"),
    ])
    setStats({
      total_bookings: total_bookings || 0,
      active_trips: active_trips || 0,
      pending_bookings: pending_bookings || 0,
      confirmed_bookings: confirmed_bookings || 0,
    })
    setLoading(false)
  }

  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  const isTrial = dmc?.subscription_status === "trial"
  const trialDaysLeft = dmc?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(dmc.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      {isTrial && (
        <div className="mb-4 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">⏰</span>
            <p className="text-sm text-amber-400">
              Trial account — {trialDaysLeft !== null ? `${trialDaysLeft} days left` : "upgrade to unlock all features"}
            </p>
          </div>
          <span className="text-xs text-amber-400 font-medium cursor-pointer hover:underline">Contact us →</span>
        </div>
      )}

      {!dmc?.line_user_id && (
        <div className="mb-4 flex items-center justify-between bg-[rgba(0,185,74,0.06)] border border-[rgba(0,185,74,0.15)] rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#06C755] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">LINE</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Connect your LINE account</p>
              <p className="text-xs text-muted">Receive booking notifications, driver alerts and emergency updates on LINE</p>
            </div>
          </div>
          <button className="px-4 py-1.5 rounded-lg bg-[#06C755] text-white text-sm font-medium whitespace-nowrap hover:bg-[#05b34c] transition-colors">
            Connect LINE →
          </button>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">
            Welcome back, {dmc?.company_name || "..."}!
          </h1>
          <p className="text-sm text-muted mt-0.5">{dateStr} · Bangkok</p>
        </div>
        <Link href="/dmc/bookings/new">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            + New Booking
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL BOOKINGS", value: stats?.total_bookings, sub: "all time", color: "text-primary" },
          { label: "ACTIVE TRIPS", value: stats?.active_trips, sub: "running now", color: "text-blue-400" },
          { label: "PENDING", value: stats?.pending_bookings, sub: "awaiting confirmation", color: "text-amber-400" },
          { label: "CONFIRMED", value: stats?.confirmed_bookings, sub: "ready to go", color: "text-primary" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-surface border border-border rounded-xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">{c.label}</p>
            {loading ? (
              <div className="h-8 w-12 bg-surface-elevated rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-[28px] font-bold ${c.color}`}>{c.value}</p>
            )}
            <p className="text-[12px] text-muted">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Booking", href: "/dmc/bookings/new", color: "bg-primary/10 text-primary border-primary/20" },
              { label: "View Calendar", href: "/dmc/calendar", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
              { label: "Check Payments", href: "/dmc/payments", color: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
              { label: "View Reports", href: "/dmc/reports", color: "bg-purple-400/10 text-purple-400 border-purple-400/20" },
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
          <h3 className="text-sm font-semibold text-foreground mb-1">Account Status</h3>
          <div className="space-y-3 mt-3">
            {[
              { label: "Plan", value: dmc?.subscription_plan || "—" },
              { label: "Status", value: dmc?.subscription_status || "—" },
              { label: "LINE", value: dmc?.line_user_id ? "Connected" : "Not connected" },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted">{r.label}</span>
                <span className={`text-sm font-medium ${r.label === "LINE" && dmc?.line_user_id ? "text-[#06C755]" : "text-foreground"}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
