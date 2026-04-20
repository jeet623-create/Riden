"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Search, Send, X, Star, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dmc/status-badge"
import { createClient } from "@/lib/supabase/client"

type Booking = {
  id: string
  booking_ref: string
  client_name: string
  total_days: number
  status: string
  dispatch_state: string | null
  created_at: string
}

type Operator = {
  id: string
  company_name: string
  base_location: string | null
  is_verified: boolean
}

const TABS = ["all", "draft", "pending", "confirmed", "in_progress", "completed", "cancelled"] as const
type Tab = typeof TABS[number]

export default function DmcBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dmcId, setDmcId] = useState<string | null>(null)
  const [preferredOperatorIds, setPreferredOperatorIds] = useState<string[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [dispatchTarget, setDispatchTarget] = useState<Booking | null>(null)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setDmcId(user.id)
      const [{ data: dmc }, { data: ops }] = await Promise.all([
        supabase.from("dmc_users").select("preferred_operator_ids").eq("id", user.id).maybeSingle(),
        supabase.from("operators").select("id, company_name, base_location, is_verified").eq("status", "active"),
      ])
      if (dmc?.preferred_operator_ids) setPreferredOperatorIds(dmc.preferred_operator_ids)
      setOperators(ops ?? [])
    })()

    // Pre-select tab from ?tab=draft if present
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      const tab = url.searchParams.get("tab")
      if (tab && (TABS as readonly string[]).includes(tab)) setActiveTab(tab as Tab)
    }
  }, [])

  async function fetchBookings() {
    if (!dmcId) return
    const supabase = createClient()
    let query = supabase.from("bookings")
      .select("id,booking_ref,client_name,total_days,status,dispatch_state,created_at")
      .eq("dmc_id", dmcId)
      .order("created_at", { ascending: false })
    if (activeTab === "draft") query = query.eq("dispatch_state", "draft")
    else if (activeTab !== "all") query = query.eq("status", activeTab)
    setLoading(true)
    const { data } = await query
    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchBookings() }, [dmcId, activeTab])

  const filtered = bookings.filter(b =>
    b.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.booking_ref?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">DIRECTION 09 · BOOKINGS</div>
          <h1 className="font-display italic text-[26px] font-semibold text-foreground leading-tight">Bookings overview</h1>
          <p className="text-sm text-muted mt-0.5">{loading ? "Loading..." : `${filtered.length} total`}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Link href="/dmc/bookings/new">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium whitespace-nowrap hover:bg-primary/90 transition-colors">
              + New Booking
            </button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === tab
              ? "bg-primary text-white"
              : "bg-surface border border-border text-muted hover:text-foreground"}`}>
            {tab === "all" ? "All" : tab.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Ref", "Client", "Days", "Status", "Date", ""].map(h => (
                <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="py-3 px-4"><div className="h-4 bg-surface-elevated rounded animate-pulse" /></td>
                ))}
              </tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted font-display italic">No bookings found.</td></tr>
            ) : filtered.map((b, i) => {
              const isDraft = b.dispatch_state === "draft"
              return (
                <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                  className="border-b border-border hover:bg-surface-elevated transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-primary">{b.booking_ref}</span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{b.client_name}</td>
                  <td className="py-3 px-4 text-sm text-muted">{b.total_days}d</td>
                  <td className="py-3 px-4">
                    {isDraft
                      ? <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[11px] bg-[rgba(139,139,139,0.10)] text-muted">Draft</span>
                      : <StatusBadge status={b.status as any} />}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    {isDraft && (
                      <button
                        onClick={() => setDispatchTarget(b)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        Dispatch <Send className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {dispatchTarget && (
          <DispatchModal
            booking={dispatchTarget}
            operators={operators}
            preferredOperatorIds={preferredOperatorIds}
            onClose={() => setDispatchTarget(null)}
            onSent={() => { setDispatchTarget(null); fetchBookings() }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DispatchModal({
  booking, operators, preferredOperatorIds, onClose, onSent,
}: {
  booking: Booking
  operators: Operator[]
  preferredOperatorIds: string[]
  onClose: () => void
  onSent: () => void
}) {
  const [mode, setMode] = useState<"operators" | "pool">("operators")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [sending, setSending] = useState(false)

  const visible = useMemo(() => {
    const q = search.toLowerCase()
    const sorted = [...operators].sort((a, b) => {
      const ap = preferredOperatorIds.includes(a.id) ? 0 : 1
      const bp = preferredOperatorIds.includes(b.id) ? 0 : 1
      if (ap !== bp) return ap - bp
      if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1
      return a.company_name.localeCompare(b.company_name)
    })
    if (!q) return sorted
    return sorted.filter(o =>
      o.company_name.toLowerCase().includes(q) || (o.base_location ?? "").toLowerCase().includes(q)
    )
  }, [operators, preferredOperatorIds, search])

  function toggle(id: string) {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(x => x !== id))
    else if (selectedIds.length >= 10) toast.error("Max 10 operators")
    else setSelectedIds([...selectedIds, id])
  }

  async function send() {
    const supabase = createClient()
    setSending(true)
    const updateRow: Record<string, any> = { dispatch_state: "sent" }
    if (mode === "operators") {
      if (selectedIds.length === 0) { toast.error("Pick at least one operator"); setSending(false); return }
      updateRow.preferred_operator_ids = selectedIds
    } else {
      updateRow.preferred_operator_ids = []
    }
    const { error } = await supabase.from("bookings").update(updateRow).eq("id", booking.id)
    if (error) { toast.error("Failed: " + error.message); setSending(false); return }

    try {
      if (mode === "operators") {
        for (const id of selectedIds) {
          await supabase.functions.invoke("booking-created", { body: { bookingId: booking.id, operatorId: id } })
        }
      } else {
        await supabase.functions.invoke("booking-created", { body: { bookingId: booking.id } })
      }
    } catch (e) {
      console.warn("dispatch edge fn error", e)
    }

    toast.success("Dispatched")
    setSending(false)
    onSent()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <div className="font-mono text-[10px] uppercase text-muted tracking-wider">Dispatch</div>
            <div className="text-sm font-medium text-foreground">{booking.booking_ref} · {booking.client_name}</div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("operators")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm ${mode === "operators" ? "bg-primary text-white" : "bg-surface-elevated border border-border text-foreground"}`}
            >To operators</button>
            <button
              onClick={() => setMode("pool")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm ${mode === "pool" ? "bg-primary text-white" : "bg-surface-elevated border border-border text-foreground"}`}
            >To pool</button>
          </div>

          {mode === "operators" && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input className="pl-9" placeholder="Search operators..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedIds.map(id => {
                    const op = operators.find(o => o.id === id); if (!op) return null
                    return (
                      <span key={id} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        {op.company_name}
                        <button onClick={() => toggle(id)}><X className="w-3 h-3" /></button>
                      </span>
                    )
                  })}
                </div>
              )}
              <div className="border border-border rounded-lg max-h-64 overflow-y-auto divide-y divide-border">
                {visible.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted italic font-display">No operators.</div>
                ) : visible.map(op => {
                  const selected = selectedIds.includes(op.id)
                  const preferred = preferredOperatorIds.includes(op.id)
                  return (
                    <button
                      key={op.id} type="button"
                      onClick={() => toggle(op.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-elevated transition-colors ${selected ? "bg-primary/5" : ""}`}
                    >
                      <div className={`w-4 h-4 rounded border ${selected ? "bg-primary border-primary" : "border-border"} flex items-center justify-center`}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          {preferred && <Star className="w-3 h-3 text-primary fill-primary" />}
                          <span className="font-medium">{op.company_name}</span>
                          {op.is_verified && <span className="text-[10px] uppercase font-mono text-primary tracking-wider">verified</span>}
                        </div>
                        <div className="text-[11px] text-muted">{op.base_location ?? "—"}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {mode === "pool" && (
            <div className="rounded-lg bg-[color:var(--warning-dim)] border border-[color:var(--warning)]/20 px-4 py-3 text-sm text-foreground">
              Sending to pool means drivers will bid directly on each day. All updates come to you.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={send} disabled={sending} className="bg-primary text-white hover:bg-primary/90">
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
