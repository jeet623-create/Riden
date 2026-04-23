"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Search, RefreshCcw, Upload, ExternalLink, Mail, Phone, CheckCircle2, X as XIcon,
  Calendar as CalendarIcon, CreditCard, AlertTriangle, FileText, Eye,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Panel, Skel, EmptyRow, PillBadge, fmtTime, fmtDateShort, daysUntil } from "@/components/admin/console"

type DMC = {
  id: string
  company_name: string
  contact_person: string | null
  email: string
  phone: string | null
  country: string | null
  subscription_plan: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  line_user_id: string | null
  total_bookings: number | null
  created_at: string
  latest_sub_status?: string | null
  latest_sub_payment_proof_url?: string | null
  latest_sub_plan?: string | null
}

type Sub = {
  id: string
  dmc_id: string
  plan: string | null
  price_thb: number | null
  status: string | null
  start_date: string | null
  end_date: string | null
  payment_proof_url: string | null
  activated_at: string | null
  created_at: string
  notes: string | null
}

type Plan = { id: string; name: string; price: number; features: string[] }

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", price: 2000, features: ["Up to 50 bookings/mo", "Basic LINE notifications", "Email support"] },
  { id: "growth", name: "Growth", price: 4000, features: ["Up to 200 bookings/mo", "Priority LINE notifications", "Priority support"] },
  { id: "pro", name: "Pro", price: 6000, features: ["Unlimited bookings", "All features", "Dedicated support"] },
]

type ListTab = "awaiting" | "recent" | "all"

export default function AdminSubscriptionsPage() {
  const search = useSearchParams()
  const preselectDmcId = search?.get("dmc")

  const [dmcs, setDmcs] = useState<DMC[]>([])
  const [latestSubs, setLatestSubs] = useState<Record<string, Sub>>({})
  const [recentActivations, setRecentActivations] = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ListTab>("awaiting")
  const [q, setQ] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stats, setStats] = useState<Record<string, { bookings: number; trips: number }>>({})

  // form state
  const [planId, setPlanId] = useState<string>("starter")
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState<string>("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofNote, setProofNote] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: dmcData, error: dmcErr } = await supabase
      .from("dmc_users")
      .select("id, company_name, contact_person, email, phone, country, subscription_plan, subscription_status, trial_ends_at, line_user_id, total_bookings, created_at")
      .order("created_at", { ascending: false })
    if (dmcErr) {
      console.error("dmc_users fetch error:", dmcErr)
      toast.error("Failed to load DMCs: " + dmcErr.message)
      setLoading(false)
      return
    }
    const dmcList = (dmcData ?? []) as DMC[]
    setDmcs(dmcList)

    const dmcIds = dmcList.map(d => d.id)
    if (dmcIds.length > 0) {
      const { data: subs, error: subsErr } = await supabase
        .from("subscriptions")
        .select("id, dmc_id, plan, price_thb, status, start_date, end_date, payment_proof_url, activated_at, created_at, notes")
        .in("dmc_id", dmcIds)
        .order("created_at", { ascending: false })
      if (subsErr) {
        console.error("subscriptions fetch error:", subsErr)
        toast.error("Failed to load subscriptions: " + subsErr.message)
        setLoading(false)
        return
      }
      const subList = (subs ?? []) as Sub[]
      const map: Record<string, Sub> = {}
      for (const s of subList) if (!map[s.dmc_id]) map[s.dmc_id] = s
      setLatestSubs(map)

      const sevenDaysAgoIso = new Date(Date.now() - 7 * 86400000).toISOString()
      setRecentActivations(subList.filter(s => s.status === "active" && s.activated_at && s.activated_at >= sevenDaysAgoIso).slice(0, 5))
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    if (preselectDmcId && !selectedId) setSelectedId(preselectDmcId)
  }, [preselectDmcId, selectedId])

  // Fetch bookings/trips counts for selected DMC
  useEffect(() => {
    if (!selectedId) return
    if (stats[selectedId]) return
    ;(async () => {
      const supabase = createClient()
      const [bRes, tRes] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("dmc_id", selectedId),
        supabase.from("trips").select("*", { count: "exact", head: true }).eq("dmc_id", selectedId),
      ])
      if (bRes.error) {
        console.error("bookings count error:", bRes.error)
        toast.error("Failed to load booking count: " + bRes.error.message)
      }
      if (tRes.error) {
        console.error("trips count error:", tRes.error)
        toast.error("Failed to load trip count: " + tRes.error.message)
      }
      setStats(s => ({ ...s, [selectedId]: { bookings: bRes.count ?? 0, trips: tRes.count ?? 0 } }))
    })()
  }, [selectedId, stats])

  const selected = useMemo(() => dmcs.find(d => d.id === selectedId) ?? null, [dmcs, selectedId])
  const selectedSub = selectedId ? latestSubs[selectedId] : undefined

  // derive "awaiting" set
  const awaitingIds = useMemo(() => {
    const now = Date.now()
    const sevenDaysFwd = now + 7 * 86400000
    return new Set(dmcs.filter(d => {
      if (d.subscription_status === "suspended") return true
      if (d.subscription_status === "trial") {
        if (d.trial_ends_at) {
          const t = new Date(d.trial_ends_at).getTime()
          if (t <= sevenDaysFwd) return true
        }
        return false
      }
      const sub = latestSubs[d.id]
      if (sub?.payment_proof_url && sub.status !== "active") return true
      return false
    }).map(d => d.id))
  }, [dmcs, latestSubs])

  const filteredDmcs = useMemo(() => {
    const ql = q.toLowerCase()
    let list: DMC[]
    if (tab === "awaiting") {
      list = dmcs.filter(d => awaitingIds.has(d.id))
    } else if (tab === "recent") {
      const activatedIdsByRecent = new Set(recentActivations.map(s => s.dmc_id))
      list = dmcs.filter(d => activatedIdsByRecent.has(d.id))
    } else {
      // "all" — full roster, no status filter
      list = dmcs
    }
    if (ql) list = list.filter(d =>
      (d.company_name ?? "").toLowerCase().includes(ql) ||
      (d.email ?? "").toLowerCase().includes(ql) ||
      (d.country ?? "").toLowerCase().includes(ql)
    )
    return list
  }, [dmcs, tab, q, awaitingIds, recentActivations])

  // end-date default syncs to start+30d when not manually edited
  useEffect(() => {
    if (!endDate && startDate) setEndDate(addDaysISO(startDate, 30))
  }, [startDate, endDate])

  // reset form when switching DMC
  useEffect(() => {
    setPlanId("starter")
    setStartDate(new Date().toISOString().slice(0, 10))
    setEndDate(addDaysISO(new Date().toISOString().slice(0, 10), 30))
    setProofFile(null)
    setProofNote("")
    setAdminNotes("")
  }, [selectedId])

  const total = useMemo(() => {
    return PLANS.find(p => p.id === planId)?.price ?? 0
  }, [planId])

  async function uploadProofIfAny(dmcId: string): Promise<string | null> {
    if (!proofFile) return null
    const supabase = createClient()
    const safeName = proofFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const path = `${dmcId}/${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from("payment-proofs").upload(path, proofFile, { upsert: false })
    if (error) throw new Error(`Upload failed: ${error.message}`)
    const { data: signed, error: sErr } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 60 * 60 * 24 * 365)
    if (sErr) throw new Error(`Signed URL failed: ${sErr.message}`)
    return signed.signedUrl
  }

  async function activate() {
    if (!selected) return
    if (!startDate || !endDate) { toast.error("Billing dates required"); return }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error("Not signed in")

      const { data: admin, error: adminErr } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", user.email)
        .single()
      if (adminErr || !admin) throw new Error("Admin user not found for current session")

      const proofUrl = await uploadProofIfAny(selected.id)
      const combinedNotes = [
        proofNote.trim() ? `Payment ref: ${proofNote.trim()}` : "",
        adminNotes.trim() ? `Admin: ${adminNotes.trim()}` : "",
        proofUrl ? `Proof: ${proofUrl}` : "",
      ].filter(Boolean).join(" | ") || null

      // Uses supabase.functions.invoke so the current user's access token is
      // sent automatically (not the anon key). Required by the hardened
      // admin-subscriptions edge function which validates the JWT belongs to
      // an active admin_users row.
      const { data: result, error: invokeError } = await supabase.functions.invoke<{
        plan?: string
        dmc_name?: string
        email_sent?: boolean
        error?: string
      }>("admin-subscriptions", {
        body: {
          dmc_id: selected.id,
          plan: planId,
          start_date: startDate,
          end_date: endDate,
          admin_id: admin.id,
          notes: combinedNotes,
        },
      })
      if (invokeError) {
        throw new Error(invokeError.message || "Activation failed")
      }
      if (!result) {
        throw new Error("Activation failed — no response from server")
      }
      if (result.error) {
        throw new Error(result.error)
      }

      const planLabel = result.plan
        ? result.plan.charAt(0).toUpperCase() + result.plan.slice(1)
        : (PLANS.find(p => p.id === planId)?.name ?? planId)
      const dmcLabel = result.dmc_name ?? selected.company_name
      toast.success(
        `${planLabel} plan activated for ${dmcLabel}${result.email_sent ? " · Email sent" : ""}`
      )

      // auto-select next
      const idx = filteredDmcs.findIndex(d => d.id === selected.id)
      const next = filteredDmcs[idx + 1] ?? filteredDmcs[idx - 1] ?? null
      setSelectedId(next && next.id !== selected.id ? next.id : null)
      await fetchAll()
    } catch (e: any) {
      toast.error(e?.message ?? "Activation failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · SUBSCRIPTIONS</div>
          <div className="text-foreground text-[15px] font-medium">Activation queue</div>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-surface text-[12px] text-muted hover:text-foreground hover:border-primary/40 transition-colors">
          <RefreshCcw className="w-3 h-3" /> R
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* LEFT — queue + recent */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Panel
            title={`${tab === "awaiting" ? "AWAITING" : tab === "recent" ? "ACTIVATED · 7d" : "ALL"} · ${filteredDmcs.length}`}
          >
            <div className="flex items-center gap-1 mb-2 text-[12px]">
              <TabButton active={tab === "awaiting"} onClick={() => setTab("awaiting")}>Awaiting</TabButton>
              <TabButton active={tab === "recent"} onClick={() => setTab("recent")}>Activated · 7d</TabButton>
              <TabButton active={tab === "all"} onClick={() => setTab("all")}>All</TabButton>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input
                type="search"
                name="admin-subs-search"
                placeholder="Search"
                value={q}
                onChange={e => setQ(e.target.value)}
                autoComplete="off"
                className="h-8 w-full pl-8 pr-3 rounded-md bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto -mx-1 px-1">
              {loading ? <Skel rows={5} />
                : filteredDmcs.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="font-display italic text-foreground text-[14px]">
                      {tab === "awaiting" ? "Queue is clear. 🎉" : tab === "recent" ? "Nothing activated in the last 7 days." : "No DMCs yet."}
                    </div>
                  </div>
                ) : filteredDmcs.map(d => {
                  const sub = latestSubs[d.id]
                  return (
                    <QueueCard
                      key={d.id}
                      dmc={d}
                      sub={sub}
                      selected={d.id === selectedId}
                      onClick={() => setSelectedId(d.id)}
                    />
                  )
                })}
            </div>
          </Panel>

          <Panel title="RECENTLY ACTIVATED · 7d">
            {Object.keys(latestSubs).length === 0 ? (
              <EmptyRow text="No subscriptions yet. Click + Activate Plan to activate your first paying DMC." />
            ) : recentActivations.length === 0 ? <EmptyRow text="None this week." /> : (
              <ul className="divide-y divide-border">
                {recentActivations.map(s => {
                  const dmc = dmcs.find(d => d.id === s.dmc_id)
                  return (
                    <li key={s.id} className="py-2 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-foreground truncate">{dmc?.company_name ?? s.dmc_id.slice(0, 8)}</div>
                        <div className="text-[11px] text-muted font-mono truncate">{s.plan} · ฿{Number(s.price_thb ?? 0).toLocaleString()}</div>
                      </div>
                      <span className="font-mono text-[11px] text-muted">{fmtTime(s.activated_at)} ago</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>

        {/* RIGHT — form */}
        <div>
          {!selected ? (
            <Panel>
              <div className="py-16 text-center">
                <div className="font-display italic text-foreground text-[18px]">Select a DMC to activate.</div>
                <div className="text-[11px] text-muted mt-2">Pick an entry from the queue on the left.</div>
              </div>
            </Panel>
          ) : (
            <div className="space-y-4">
              <DmcSummary dmc={selected} sub={selectedSub} stats={stats[selected.id]} />

              <Panel title="PLAN SELECTION">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLANS.map(p => {
                    const active = planId === p.id
                    return (
                      <button key={p.id}
                        onClick={() => setPlanId(p.id)}
                        className={`text-left p-3 rounded-lg border transition-colors ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className={`w-4 h-4 rounded-full border ${active ? "border-primary" : "border-border"} flex items-center justify-center`}>
                            {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <div className="font-mono text-[13px] text-foreground mt-0.5">
                          ฿{p.price.toLocaleString()}
                          <span className="text-[11px] text-muted ml-1">/ period</span>
                        </div>
                        <ul className="mt-2 space-y-0.5">
                          {p.features.map(f => (
                            <li key={f} className="text-[11px] text-muted">· {f}</li>
                          ))}
                        </ul>
                      </button>
                    )
                  })}
                </div>
              </Panel>

              <Panel title="BILLING PERIOD" icon={<CalendarIcon className="w-3 h-3" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1 block">Start date</label>
                    <input
                      type="date" value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="h-8 w-full bg-background border border-input rounded-md px-2 text-[13px] text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1 block">End date</label>
                    <input
                      type="date" value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="h-8 w-full bg-background border border-input rounded-md px-2 text-[13px] text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="font-mono text-[10px] uppercase text-muted tracking-wider">Presets:</span>
                  {[{ l: "1mo", d: 30 }, { l: "3mo", d: 90 }, { l: "6mo", d: 180 }, { l: "1yr", d: 365 }].map(p => (
                    <button key={p.l}
                      onClick={() => setEndDate(addDaysISO(startDate, p.d))}
                      className="h-7 px-2.5 rounded-md border border-border bg-surface text-[11px] text-muted hover:text-foreground hover:border-primary/40"
                    >{p.l}</button>
                  ))}
                </div>
                <div className="mt-3 text-[12px]">
                  <span className="text-muted">Total amount:</span>{" "}
                  <span className="font-mono text-foreground text-[14px]">฿{total.toLocaleString()}</span>
                </div>
              </Panel>

              <Panel title="PAYMENT PROOF" icon={<FileText className="w-3 h-3" />}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={e => setProofFile(e.target.files?.[0] ?? null)} className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-3 rounded-md border border-border bg-surface text-[12px] text-muted hover:text-foreground hover:border-primary/40 inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> {proofFile ? "Replace file" : "Upload file"}
                    </button>
                    {proofFile && (
                      <div className="text-[12px] text-foreground flex items-center gap-1.5">
                        <span className="truncate max-w-[200px]">{proofFile.name}</span>
                        <span className="text-muted font-mono">{(proofFile.size / 1024).toFixed(0)} KB</span>
                        <button onClick={() => setProofFile(null)} className="text-muted hover:text-[color:var(--danger)]"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1 block">Reference / note</label>
                    <input
                      value={proofNote}
                      onChange={e => setProofNote(e.target.value)}
                      placeholder="Bank transfer ref SCB-2026-001"
                      className="h-8 w-full bg-background border border-input rounded-md px-2 text-[13px] text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </Panel>

              <Panel title="ADMIN NOTES (internal)">
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Optional internal notes"
                  className="w-full min-h-[64px] bg-background border border-input rounded-md px-2 py-1.5 text-[13px] text-foreground resize-y focus:outline-none focus:border-primary"
                />
              </Panel>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[12px]">
                  <button
                    disabled
                    title="Invoice PDF coming in Phase 3i"
                    className="h-8 px-3 rounded-md border border-border bg-surface text-muted text-[12px] inline-flex items-center gap-1.5 opacity-60 cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5" /> Download Invoice PDF
                  </button>
                  <span className="text-[11px] text-muted italic font-display">Coming in Phase 3i</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="h-9 px-3 rounded-md text-[12px] text-muted hover:text-foreground"
                  >Cancel</button>
                  <button
                    onClick={activate}
                    disabled={submitting}
                    className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {submitting ? "Activating…" : "Activate Subscription →"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Queue card ----------
function QueueCard({
  dmc, sub, selected, onClick,
}: { dmc: DMC; sub?: Sub; selected: boolean; onClick: () => void }) {
  const source = sub?.payment_proof_url ? "bank transfer" : dmc.subscription_status === "suspended" ? "suspended" : dmc.subscription_status === "trial" ? "trial ending" : "review"
  const tone =
    dmc.subscription_status === "active" ? "primary" :
    dmc.subscription_status === "trial" ? "warning" :
    dmc.subscription_status === "suspended" ? "danger" :
    "muted"
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-2 rounded-md transition-colors border-l-2
        ${selected ? "bg-primary/10 border-primary" : "bg-transparent border-transparent hover:bg-surface-elevated"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground font-medium truncate">{dmc.company_name}</span>
        <PillBadge tone={tone as any}>{dmc.subscription_status ?? "—"}</PillBadge>
      </div>
      <div className="text-[11px] text-muted truncate flex items-center gap-2">
        <span className="font-mono">{dmc.country ?? "—"}</span>
        <span>·</span>
        <span>{source}</span>
      </div>
      <div className="text-[11px] text-muted font-mono">{fmtTime(dmc.created_at)} ago</div>
    </button>
  )
}

// ---------- Summary ----------
function DmcSummary({ dmc, sub, stats }: { dmc: DMC; sub?: Sub; stats?: { bookings: number; trips: number } }) {
  const trialLeft = daysUntil(dmc.trial_ends_at)
  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display italic text-[22px] font-semibold text-foreground leading-tight">{dmc.company_name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {dmc.country && <span className="text-[12px] text-muted">{dmc.country}</span>}
            {dmc.email && <a href={`mailto:${dmc.email}`} className="text-[12px] text-muted hover:text-primary inline-flex items-center gap-1"><Mail className="w-3 h-3" />{dmc.email}</a>}
            {dmc.phone && <a href={`tel:${dmc.phone}`} className="text-[12px] text-muted hover:text-primary inline-flex items-center gap-1"><Phone className="w-3 h-3" />{dmc.phone}</a>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <PillBadge tone={dmc.subscription_status === "active" ? "primary" : dmc.subscription_status === "trial" ? "warning" : "danger"}>
              {dmc.subscription_status ?? "—"}
            </PillBadge>
            {dmc.subscription_plan && <PillBadge>{dmc.subscription_plan}</PillBadge>}
            {dmc.trial_ends_at && (
              <span className="font-mono text-[11px] text-muted">
                trial ends {fmtDateShort(dmc.trial_ends_at)}{trialLeft != null ? ` · ${trialLeft}d` : ""}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-[12px] text-muted">
            <span>Member since <span className="text-foreground font-mono">{fmtTime(dmc.created_at)} ago</span></span>
            {stats && (
              <>
                <span>Bookings <span className="text-foreground font-mono">{stats.bookings}</span></span>
                <span>Trips <span className="text-foreground font-mono">{stats.trips}</span></span>
              </>
            )}
            <Link href={`/admin/dmcs/${dmc.id}`} className="text-primary hover:underline inline-flex items-center gap-1">
              Full detail <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          {sub?.payment_proof_url && (
            <div className="mt-3 text-[12px]">
              <a href={sub.payment_proof_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Last payment proof
              </a>
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}

// ---------- Small Tab button ----------
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-2.5 rounded-md text-[11px] whitespace-nowrap transition-colors
        ${active ? "bg-primary/15 text-primary border border-primary/30" : "bg-surface border border-border text-muted hover:text-foreground hover:border-primary/30"}`}
    >{children}</button>
  )
}

function addDaysISO(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
