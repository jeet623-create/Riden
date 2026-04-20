"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { AlertTriangle, Clock, ArrowRight } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { StatusBadge } from "@/components/dmc/status-badge"

type DmcUser = {
  id: string
  company_name: string
  subscription_plan: string
  subscription_status: string
  line_user_id: string | null
  trial_ends_at: string | null
}

type Booking = {
  id: string
  booking_ref: string
  client_name: string
  total_days: number
  status: string
  created_at: string
}

type Stats = {
  total: number
  active: number
  pending: number
  confirmed: number
  panic: number
  sparkline: number[]
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setDisplay(Math.round(easeOutQuart(progress) * value))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{display.toLocaleString()}</>
}

function relativeTime(iso: string) {
  const d = new Date(iso)
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const h = Math.floor(diffMin / 60)
  if (h < 24) return `${h}h ago`
  const day = Math.floor(h / 24)
  if (day < 30) return `${day}d ago`
  return d.toLocaleDateString()
}

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const series = data.map((v, i) => ({ v, i }))
  return (
    <div style={{ width: 64, height: 20 }}>
      <ResponsiveContainer>
        <AreaChart data={series}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const STAT_HEX: Record<string, string> = {
  total: "#1D9E75",
  active: "#3B82F6",
  pending: "#F59E0B",
  confirmed: "#22C55E",
}

function LineConnectBanner({ onConnect, connecting }: { onConnect: (id: string) => void; connecting: boolean }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3"
      style={{ background: "var(--line-green-dim)", border: "1px solid var(--line-green-border)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--line-green)" }}>
          <span className="text-white text-[10px] font-bold">LINE</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Connect your LINE account</p>
          <p className="text-xs text-muted">Receive booking, driver, and emergency notifications on LINE</p>
        </div>
      </div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-1.5 rounded-lg text-white text-sm font-medium whitespace-nowrap hover:opacity-90 transition-opacity"
          style={{ background: "var(--line-green)" }}
        >
          Connect LINE →
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            placeholder="LINE user ID"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-9 px-3 rounded-md border text-sm bg-background text-foreground focus:outline-none"
            style={{ borderColor: "var(--line-green-border)" }}
          />
          <button
            disabled={connecting || !input}
            onClick={() => onConnect(input.trim())}
            className="h-9 px-3 rounded-md text-white text-sm font-medium disabled:opacity-50"
            style={{ background: "var(--line-green)" }}
          >
            {connecting ? "..." : "Save"}
          </button>
          <button onClick={() => setOpen(false)} className="text-xs text-muted hover:text-foreground px-2">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default function DmcDashboardPage() {
  const [dmc, setDmc] = useState<DmcUser | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingLine, setConnectingLine] = useState(false)

  async function loadAll() {
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

    const dmcId = user.id
    const sinceIso = new Date(Date.now() - 14 * 86400000).toISOString()

    const [totalQ, activeQ, pendingQ, confirmedQ, panicQ, sparkQ, recentQ] = await Promise.all([
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId),
      supabase.from("trips").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId).in("status", ["in_progress", "assigned", "driver_assigned"]),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId).in("status", ["pending", "operator_notified"]),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId).in("status", ["confirmed", "operator_accepted"]),
      supabase.from("trips").select("*", { count: "exact", head: true }).eq("dmc_id", dmcId).eq("status", "panic"),
      supabase.from("bookings").select("created_at").eq("dmc_id", dmcId).gte("created_at", sinceIso),
      supabase.from("bookings").select("id, booking_ref, client_name, total_days, status, created_at").eq("dmc_id", dmcId).order("created_at", { ascending: false }).limit(5),
    ])

    const spark = new Array(14).fill(0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    ;(sparkQ.data || []).forEach((b: { created_at: string }) => {
      const d = new Date(b.created_at)
      d.setHours(0, 0, 0, 0)
      const daysAgo = Math.floor((today.getTime() - d.getTime()) / 86400000)
      if (daysAgo >= 0 && daysAgo < 14) spark[13 - daysAgo]++
    })

    setStats({
      total: totalQ.count || 0,
      active: activeQ.count || 0,
      pending: pendingQ.count || 0,
      confirmed: confirmedQ.count || 0,
      panic: panicQ.count || 0,
      sparkline: spark,
    })
    setRecent((recentQ.data as Booking[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function connectLine(lineUserId: string) {
    setConnectingLine(true)
    const supabase = createClient()
    const { error } = await supabase.functions.invoke("dmc-link-line", { body: { line_user_id: lineUserId } })
    if (error) {
      toast.error("Failed to connect LINE: " + error.message)
      setConnectingLine(false)
      return
    }
    toast.success("LINE connected")
    await loadAll()
    setConnectingLine(false)
  }

  const today = new Date()
  const isTrial = dmc?.subscription_plan?.toLowerCase() === "trial"
  const trialDaysLeft = dmc?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(dmc.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null
  const trialActive = isTrial && trialDaysLeft !== null && trialDaysLeft > 0
  const hasPanic = (stats?.panic || 0) > 0

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, delay: i * 0.06, ease: "easeOut" as const },
  })

  return (
    <div>
      <AnimatePresence>
        {hasPanic && (
          <motion.div
            {...stagger(0)}
            className="mb-4 flex items-center justify-between rounded-xl px-4 py-3 panic-pulse"
            style={{ border: "1px solid rgba(220,38,38,0.3)" }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" style={{ color: "var(--panic)" }} strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--panic)" }}>
                  Emergency — driver cancelled on {stats?.panic} trip{(stats?.panic ?? 0) > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted">Finding replacement now</p>
              </div>
            </div>
            <Link href="/dmc/bookings?status=panic" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: "var(--panic)" }}>
              View <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {trialActive && (
        <motion.div
          {...stagger(1)}
          className="mb-4 flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: "var(--warning-dim)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "var(--warning)" }} strokeWidth={1.75} />
            <p className="text-sm" style={{ color: "var(--warning)" }}>
              Trial — <span className="font-mono">{trialDaysLeft}</span> days left
            </p>
          </div>
          <button className="text-xs font-medium hover:underline" style={{ color: "var(--warning)" }}>
            Upgrade →
          </button>
        </motion.div>
      )}

      {dmc && !dmc.line_user_id && (
        <motion.div {...stagger(2)} className="mb-4">
          <LineConnectBanner onConnect={connectLine} connecting={connectingLine} />
        </motion.div>
      )}

      <motion.div {...stagger(3)} className="flex items-start justify-between mb-8 mt-2 gap-4">
        <div>
          <h1 className="font-display italic font-semibold text-[32px] tracking-[-0.015em] leading-[1.1] text-foreground">
            Welcome back, {dmc?.company_name || "..."}.
          </h1>
          <p className="text-xs mt-2 font-mono uppercase tracking-[0.15em] text-muted">
            {today.toLocaleDateString("en-US", { weekday: "long" })}
            <span className="mx-2" style={{ color: "var(--studio-teal)" }}>·</span>
            {today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            <span className="mx-2" style={{ color: "var(--studio-teal)" }}>·</span>
            Bangkok
          </p>
        </div>
        <Link href="/dmc/bookings/new">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
            + New Booking <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {([
          { key: "total", label: "Total Bookings", value: stats?.total ?? 0, sub: "all time" },
          { key: "active", label: "Active Trips", value: stats?.active ?? 0, sub: "running now" },
          { key: "pending", label: "Pending", value: stats?.pending ?? 0, sub: "awaiting confirmation" },
          { key: "confirmed", label: "Confirmed", value: stats?.confirmed ?? 0, sub: "ready to go" },
        ] as const).map((c, i) => {
          const hex = STAT_HEX[c.key]
          return (
            <motion.div
              key={c.key}
              {...stagger(4 + i)}
              className="bg-surface border border-border rounded-xl p-5"
              style={{ borderLeft: `3px solid ${hex}` }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted mb-2">{c.label}</p>
              {loading ? (
                <div className="h-9 w-20 bg-surface-elevated rounded skeleton-pulse mb-2" />
              ) : (
                <p className="font-display font-semibold text-[32px] tracking-[-0.02em] leading-none mb-2 text-foreground">
                  <CountUp value={c.value} />
                </p>
              )}
              <div className="flex items-end justify-between">
                <p className="text-xs text-muted">{c.sub}</p>
                {!loading && stats?.sparkline && <Sparkline data={stats.sparkline} color={hex} id={`spark-${c.key}`} />}
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div {...stagger(8)} className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Bookings</h3>
          <Link href="/dmc/bookings" className="text-xs text-muted hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-surface-elevated rounded skeleton-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-display italic text-[20px] text-foreground mb-2">No bookings yet.</p>
            <Link href="/dmc/bookings/new" className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-75" style={{ color: "var(--studio-teal)" }}>
              Create your first one <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-background">
                {["REF", "CLIENT", "DAYS", "STATUS", "CREATED"].map((h) => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted py-3 px-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-surface-elevated">
                  <td className="py-3 px-5">
                    <Link href={`/dmc/bookings/${b.id}`} className="font-mono text-sm text-primary hover:underline">
                      {b.booking_ref}
                    </Link>
                  </td>
                  <td className="py-3 px-5 text-sm font-medium text-foreground">{b.client_name}</td>
                  <td className="py-3 px-5 text-sm text-muted font-mono">{b.total_days}d</td>
                  <td className="py-3 px-5">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3 px-5 text-xs text-muted font-mono">{relativeTime(b.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}
