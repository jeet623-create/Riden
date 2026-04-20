"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search, Check, X as XIcon, HelpCircle, RefreshCcw, AlertTriangle,
  ArrowLeft, User as UserIcon, Car, CreditCard, MapPin, Phone,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Panel, Skel, EmptyRow, PillBadge, fmtTime, fmtDateShort, daysUntil } from "@/components/admin/console"

type Driver = {
  id: string
  full_name: string | null
  phone: string | null
  operator_id: string | null
  base_location: string | null
  vehicle_type: string | null
  vehicle_plate: string | null
  vehicle_brand_model: string | null
  vehicle_color: string | null
  vehicle_seats: number | null
  vehicle_photo_url: string | null
  license_number: string | null
  license_expiry: string | null
  license_photo_url: string | null
  profile_photo_url: string | null
  is_verified: boolean
  is_active: boolean | null
  verification_status: string | null
  verification_notes: string | null
  rejected_reason: string | null
  verified_at: string | null
  verified_by: string | null
  created_at: string
}

type ListTab = "pending" | "recent"

export default function AdminPendingPage() {
  const [rows, setRows] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ListTab>("pending")
  const [q, setQ] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [acting, setActing] = useState(false)
  const [modal, setModal] = useState<null | { kind: "reject" | "needs_info"; reason: string }>(null)
  const [operatorNames, setOperatorNames] = useState<Record<string, string>>({})
  const [zoom, setZoom] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false })

    if (tab === "pending") {
      query = query.eq("verification_status", "pending")
    } else {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      query = query.in("verification_status", ["approved", "rejected", "needs_info"]).gte("verified_at", sevenDaysAgo)
    }

    const { data, error } = await query.limit(200)
    if (error) { toast.error("Load failed: " + error.message); setLoading(false); return }
    const list = (data ?? []) as Driver[]
    setRows(list)

    const opIds = Array.from(new Set(list.map(r => r.operator_id).filter(Boolean) as string[]))
    if (opIds.length > 0) {
      const { data: ops } = await supabase.from("operators").select("id, company_name").in("id", opIds)
      const map: Record<string, string> = {}
      ;(ops ?? []).forEach((o: any) => { map[o.id] = o.company_name })
      setOperatorNames(map)
    } else setOperatorNames({})

    setLoading(false)
  }, [tab])

  useEffect(() => { fetchRows() }, [fetchRows])

  const filtered = useMemo(() => {
    const ql = q.toLowerCase()
    if (!ql) return rows
    return rows.filter(r =>
      (r.full_name ?? "").toLowerCase().includes(ql) ||
      (r.phone ?? "").toLowerCase().includes(ql) ||
      (r.vehicle_plate ?? "").toLowerCase().includes(ql)
    )
  }, [rows, q])

  const selected = useMemo(() => filtered.find(r => r.id === selectedId) ?? null, [filtered, selectedId])

  // Auto-select first when list changes and nothing selected
  useEffect(() => {
    if (filtered.length === 0) { setSelectedId(null); return }
    if (!selectedId || !filtered.some(r => r.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  // Reset notes when switching driver
  useEffect(() => {
    setNotes(selected?.verification_notes ?? "")
  }, [selected?.id])

  const selectNext = useCallback(() => {
    if (!selected) return
    const idx = filtered.findIndex(r => r.id === selected.id)
    const next = filtered[idx + 1] ?? filtered[idx - 1] ?? null
    setSelectedId(next?.id ?? null)
  }, [filtered, selected])

  const moveSelection = useCallback((delta: number) => {
    if (filtered.length === 0) return
    const idx = filtered.findIndex(r => r.id === selectedId)
    const nextIdx = Math.max(0, Math.min(filtered.length - 1, idx + delta))
    setSelectedId(filtered[nextIdx].id)
  }, [filtered, selectedId])

  // Keyboard hotkeys
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return
      if (modal) return
      if (e.key === "ArrowDown") { e.preventDefault(); moveSelection(1); return }
      if (e.key === "ArrowUp") { e.preventDefault(); moveSelection(-1); return }
      if (!selected || acting) return
      if (e.key === "a" || e.key === "A") { e.preventDefault(); handleApprove() }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); openModal("reject") }
      if (e.key === "n" || e.key === "N") { e.preventDefault(); openModal("needs_info") }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveSelection, selected, acting, modal])

  function openModal(kind: "reject" | "needs_info") {
    setModal({ kind, reason: "" })
  }

  async function callEdgeFn(slug: string, body: Record<string, unknown>) {
    try {
      const supabase = createClient()
      const { error } = await supabase.functions.invoke(slug, { body })
      if (error) console.warn(`[${slug}] edge fn warning:`, error.message)
    } catch (err) {
      // TODO: edge fn "${slug}" not deployed yet — driver LINE notification skipped
      console.warn(`[${slug}] skipped:`, err)
    }
  }

  async function handleApprove() {
    if (!selected) return
    setActing(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from("drivers").update({
      is_verified: true,
      is_active: true,
      verification_status: "approved",
      verification_notes: notes.trim() || null,
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
      rejected_reason: null,
    }).eq("id", selected.id)
    if (error) { toast.error("Approve failed: " + error.message); setActing(false); return }
    toast.success(`${selected.full_name ?? "Driver"} approved`)
    // TODO: ensure edge fn "driver-approved" is deployed to send LINE "You're verified!"
    await callEdgeFn("driver-approved", { driver_id: selected.id })
    selectNext()
    fetchRows()
    setActing(false)
  }

  async function handleReject() {
    if (!selected || !modal) return
    const reason = modal.reason.trim()
    if (!reason) { toast.error("Rejection reason required"); return }
    setActing(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from("drivers").update({
      is_verified: false,
      is_active: false,
      verification_status: "rejected",
      verification_notes: notes.trim() || null,
      rejected_reason: reason,
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
    }).eq("id", selected.id)
    if (error) { toast.error("Reject failed: " + error.message); setActing(false); return }
    toast.success(`${selected.full_name ?? "Driver"} rejected`)
    // TODO: ensure edge fn "driver-rejected" is deployed to send LINE rejection message
    await callEdgeFn("driver-rejected", { driver_id: selected.id, reason })
    setModal(null)
    selectNext()
    fetchRows()
    setActing(false)
  }

  async function handleNeedsInfo() {
    if (!selected || !modal) return
    const reason = modal.reason.trim()
    if (!reason) { toast.error("Specify what info is needed"); return }
    setActing(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const nextNotes = notes.trim() ? `${notes.trim()} | ${reason}` : reason
    const { error } = await supabase.from("drivers").update({
      verification_status: "needs_info",
      verification_notes: nextNotes,
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
    }).eq("id", selected.id)
    if (error) { toast.error("Update failed: " + error.message); setActing(false); return }
    toast.success(`Info requested from ${selected.full_name ?? "driver"}`)
    // TODO: ensure edge fn "driver-needs-info" is deployed to send LINE info request
    await callEdgeFn("driver-needs-info", { driver_id: selected.id, note: reason })
    setModal(null)
    selectNext()
    fetchRows()
    setActing(false)
  }

  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · PENDING APPROVAL</div>
          <div className="text-foreground text-[15px] font-medium">Driver approval queue</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setTab("pending")}
              className={`h-8 px-3 text-[12px] ${tab === "pending" ? "bg-primary/15 text-primary" : "bg-surface text-muted hover:text-foreground"}`}
            >Pending</button>
            <button
              onClick={() => setTab("recent")}
              className={`h-8 px-3 text-[12px] ${tab === "recent" ? "bg-primary/15 text-primary" : "bg-surface text-muted hover:text-foreground"}`}
            >Recently reviewed · 7d</button>
          </div>
          <button onClick={fetchRows} className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-surface text-[12px] text-muted hover:text-foreground hover:border-primary/40 transition-colors">
            <RefreshCcw className="w-3 h-3" /> R
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* LEFT — queue */}
        <Panel
          title={`${tab === "pending" ? "PENDING" : "REVIEWED · 7d"} · ${filtered.length}`}
          className="lg:sticky lg:top-4 lg:self-start lg:h-[calc(100vh-120px)] lg:flex lg:flex-col lg:overflow-hidden"
        >
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              placeholder="Name, phone, plate"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="h-8 w-full pl-8 pr-3 rounded-md bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
            {loading ? (
              <Skel rows={6} />
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center">
                <div className="font-display italic text-foreground text-[15px]">
                  {tab === "pending" ? "All caught up. 🎉" : "Nothing reviewed in the last 7 days."}
                </div>
                {tab === "pending" && <div className="text-[11px] text-muted mt-1">No drivers waiting.</div>}
              </div>
            ) : (
              filtered.map(r => (
                <DriverListCard
                  key={r.id}
                  d={r}
                  selected={r.id === selectedId}
                  operatorName={r.operator_id ? operatorNames[r.operator_id] : undefined}
                  onClick={() => setSelectedId(r.id)}
                />
              ))
            )}
          </div>
        </Panel>

        {/* RIGHT — review */}
        <div>
          {!selected ? (
            <Panel>
              <div className="py-10 text-center">
                <div className="font-display italic text-foreground text-[18px]">Select a driver to review.</div>
                <div className="text-[11px] text-muted mt-2 font-mono">↑/↓ navigate · A approve · R reject · N need info</div>
              </div>
            </Panel>
          ) : (
            <ReviewCard
              driver={selected}
              operatorName={selected.operator_id ? operatorNames[selected.operator_id] : undefined}
              notes={notes}
              setNotes={setNotes}
              acting={acting}
              onApprove={handleApprove}
              onReject={() => openModal("reject")}
              onNeedInfo={() => openModal("needs_info")}
              readOnly={tab === "recent"}
              onZoom={setZoom}
            />
          )}
        </div>
      </div>

      {/* Modal for reject / needs_info */}
      {modal && (
        <DecisionModal
          kind={modal.kind}
          reason={modal.reason}
          setReason={(r) => setModal(m => m ? { ...m, reason: r } : m)}
          acting={acting}
          onClose={() => setModal(null)}
          onConfirm={modal.kind === "reject" ? handleReject : handleNeedsInfo}
        />
      )}

      {/* Photo zoom */}
      {zoom && (
        <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-zoom-out">
          <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1.5" onClick={(e) => { e.stopPropagation(); setZoom(null) }}>
            <XIcon className="w-4 h-4" />
          </button>
          <img src={zoom} alt="" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </div>
  )
}

// ---------- Left card ----------
function DriverListCard({
  d, selected, operatorName, onClick,
}: { d: Driver; selected: boolean; operatorName?: string; onClick: () => void }) {
  const initials = (d.full_name ?? "—").split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase()
  const statusTone =
    d.verification_status === "approved" ? "primary" :
    d.verification_status === "rejected" ? "danger" :
    d.verification_status === "needs_info" ? "warning" :
    "muted"
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex gap-3 px-2 py-2 rounded-md transition-colors border-l-2
        ${selected
          ? "bg-primary/10 border-primary"
          : "bg-transparent border-transparent hover:bg-surface-elevated"}`}
    >
      <div className="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-surface-elevated border border-border flex items-center justify-center">
        {d.profile_photo_url
          ? <img src={d.profile_photo_url} alt="" className="w-full h-full object-cover" />
          : <span className="font-mono text-[11px] text-muted">{initials}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-medium truncate">{d.full_name ?? "—"}</span>
          {d.verification_status !== "pending" && <PillBadge tone={statusTone as any}>{d.verification_status}</PillBadge>}
        </div>
        <div className="text-[11px] text-muted truncate font-mono">
          {(d.vehicle_type ?? "—")}{d.vehicle_plate ? ` · ${d.vehicle_plate}` : ""}
        </div>
        <div className="text-[11px] text-muted truncate flex items-center gap-1">
          <span>{fmtTime(d.created_at)} ago</span>
          {operatorName && <><span>·</span><span className="truncate">{operatorName}</span></>}
        </div>
      </div>
    </button>
  )
}

// ---------- Review card ----------
function ReviewCard({
  driver, operatorName, notes, setNotes, acting, onApprove, onReject, onNeedInfo, readOnly, onZoom,
}: {
  driver: Driver
  operatorName?: string
  notes: string
  setNotes: (v: string) => void
  acting: boolean
  onApprove: () => void
  onReject: () => void
  onNeedInfo: () => void
  readOnly: boolean
  onZoom: (url: string) => void
}) {
  const licDays = daysUntil(driver.license_expiry)
  const licExpired = licDays != null && licDays < 0
  const licWarning = licDays != null && licDays >= 0 && licDays <= 30
  const missingLicense = !driver.license_number || !driver.license_expiry

  return (
    <div className="space-y-4">
      {/* Driver */}
      <Panel title="DRIVER">
        <div className="flex items-start gap-4">
          {driver.profile_photo_url
            ? <button onClick={() => onZoom(driver.profile_photo_url!)} className="w-[120px] h-[120px] rounded-xl overflow-hidden border border-border bg-surface-elevated">
                <img src={driver.profile_photo_url} alt="" className="w-full h-full object-cover" />
              </button>
            : <div className="w-[120px] h-[120px] rounded-xl border border-dashed border-border bg-surface-elevated flex items-center justify-center text-muted"><UserIcon className="w-8 h-8" /></div>
          }
          <div className="flex-1 min-w-0 space-y-1.5">
            <h2 className="font-display italic text-[22px] font-semibold text-foreground leading-tight">{driver.full_name ?? "—"}</h2>
            {driver.phone && (
              <div className="flex items-center gap-2 text-[13px]">
                <Phone className="w-3.5 h-3.5 text-muted" />
                <a href={`tel:${driver.phone}`} className="font-mono text-foreground hover:text-primary transition-colors">{driver.phone}</a>
              </div>
            )}
            {driver.base_location && (
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <MapPin className="w-3.5 h-3.5" />
                <span>{driver.base_location}</span>
              </div>
            )}
            {operatorName && (
              <div className="text-[12px]">
                <Link href="/admin/operators" className="text-primary hover:underline inline-flex items-center gap-1">
                  {operatorName} <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <span className="font-mono text-[11px] text-muted">Registered {fmtTime(driver.created_at)} ago</span>
              <PillBadge tone="primary">via LINE</PillBadge>
            </div>
          </div>
        </div>
      </Panel>

      {/* Vehicle */}
      <Panel title="VEHICLE" icon={<Car className="w-3 h-3" />}>
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
          {driver.vehicle_photo_url ? (
            <button onClick={() => onZoom(driver.vehicle_photo_url!)} className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-border bg-surface-elevated">
              <img src={driver.vehicle_photo_url} alt="" className="w-full h-full object-cover" />
            </button>
          ) : (
            <div className="w-full aspect-[4/3] rounded-lg border border-dashed border-border bg-surface-elevated flex items-center justify-center text-muted"><Car className="w-8 h-8" /></div>
          )}
          <div className="space-y-3">
            <KV label="Type" value={driver.vehicle_type ?? "—"} />
            <KV label="Brand / Model" value={driver.vehicle_brand_model ?? "—"} />
            <KV label="Color" value={driver.vehicle_color ?? "—"} />
            <KV label="Seats" value={driver.vehicle_seats != null ? String(driver.vehicle_seats) : "—"} mono />
            <div>
              <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1">Plate</div>
              <div className="inline-flex items-center px-3 h-8 rounded-md border border-primary/40 bg-primary/5 font-mono text-[15px] text-foreground tracking-wider">
                {driver.vehicle_plate ?? "—"}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* License */}
      <Panel title="LICENSE" icon={<CreditCard className="w-3 h-3" />} danger={missingLicense || licExpired}>
        {missingLicense && (
          <div className="mb-3 flex items-start gap-2 rounded-md bg-[color:var(--warning-dim)] border border-[color:var(--warning)]/20 px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-[color:var(--warning)] mt-0.5" />
            <div className="text-[12px] text-foreground">
              Missing license data — ask driver to resubmit via LINE.
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4">
          {driver.license_photo_url ? (
            <button onClick={() => onZoom(driver.license_photo_url!)} className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-border bg-surface-elevated">
              <img src={driver.license_photo_url} alt="" className="w-full h-full object-cover" />
            </button>
          ) : (
            <div className="w-full aspect-[16/9] rounded-lg border border-dashed border-border bg-surface-elevated flex items-center justify-center text-muted">
              <div className="text-center">
                <CreditCard className="w-8 h-8 mx-auto" />
                <div className="text-[11px] mt-1 italic font-display">No license photo uploaded</div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <KV label="License No." value={driver.license_number ?? "—"} mono />
            <div>
              <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1">Expiry</div>
              <div className={`inline-flex items-center gap-1 font-mono text-[13px] ${licExpired ? "text-[color:var(--danger)]" : licWarning ? "text-[color:var(--warning)]" : "text-foreground"}`}>
                {(licExpired || licWarning) && <AlertTriangle className="w-3.5 h-3.5" />}
                {driver.license_expiry ? fmtDateShort(driver.license_expiry) : "—"}
                {licDays != null && (
                  <span className="text-muted text-[11px]">
                    · {licExpired ? `expired ${-licDays}d ago` : `${licDays}d left`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Decision */}
      <Panel title="DECISION">
        {readOnly ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PillBadge tone={
                driver.verification_status === "approved" ? "primary"
                : driver.verification_status === "rejected" ? "danger"
                : driver.verification_status === "needs_info" ? "warning"
                : "muted"
              }>
                {driver.verification_status ?? "—"}
              </PillBadge>
              <span className="font-mono text-[11px] text-muted">
                {driver.verified_at ? `reviewed ${fmtTime(driver.verified_at)} ago` : ""}
              </span>
            </div>
            {driver.verification_notes && (
              <div className="text-[12px]">
                <span className="text-muted">Notes:</span> <span className="text-foreground">{driver.verification_notes}</span>
              </div>
            )}
            {driver.rejected_reason && (
              <div className="text-[12px]">
                <span className="text-muted">Rejected reason:</span> <span className="text-[color:var(--danger)]">{driver.rejected_reason}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1">Admin Notes (internal)</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional — saves to verification_notes"
                className="w-full min-h-[56px] bg-background border border-input rounded-md px-2 py-1.5 text-[13px] text-foreground resize-none focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={acting}
                onClick={onApprove}
                className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Approve <kbd className="ml-1 px-1.5 h-5 rounded bg-white/20 font-mono text-[10px]">A</kbd>
              </button>
              <button
                disabled={acting}
                onClick={onReject}
                className="h-9 px-4 rounded-md bg-[color:var(--danger)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <XIcon className="w-4 h-4" /> Reject <kbd className="ml-1 px-1.5 h-5 rounded bg-white/20 font-mono text-[10px]">R</kbd>
              </button>
              <button
                disabled={acting}
                onClick={onNeedInfo}
                className="h-9 px-4 rounded-md border border-[color:var(--warning)]/40 text-[color:var(--warning)] text-[13px] font-medium hover:bg-[color:var(--warning-dim)] transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" /> Need Info <kbd className="ml-1 px-1.5 h-5 rounded bg-[color:var(--warning)]/15 font-mono text-[10px]">N</kbd>
              </button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ---------- Modal ----------
function DecisionModal({
  kind, reason, setReason, acting, onClose, onConfirm,
}: {
  kind: "reject" | "needs_info"
  reason: string
  setReason: (v: string) => void
  acting: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const isReject = kind === "reject"
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase text-muted tracking-wider">
              {isReject ? "REJECT DRIVER" : "REQUEST INFO"}
            </div>
            <div className="text-[13px] text-foreground mt-0.5">
              {isReject ? "This message will be sent to the driver via LINE." : "Ask the driver to provide what's missing."}
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground"><XIcon className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4">
          <textarea
            autoFocus
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={isReject ? "Reason (required) — driver will see this" : "What info is needed (required)"}
            className="w-full min-h-[90px] bg-background border border-input rounded-md px-2.5 py-2 text-[13px] text-foreground resize-y focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button onClick={onClose} className="h-8 px-3 rounded-md text-[12px] text-muted hover:text-foreground">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={acting || !reason.trim()}
            className={`h-8 px-3 rounded-md text-[12px] font-medium text-white disabled:opacity-50 ${isReject ? "bg-[color:var(--danger)] hover:opacity-90" : "bg-[color:var(--warning)] hover:opacity-90"}`}
          >
            {acting ? "…" : isReject ? "Send rejection" : "Send request"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- KV row ----------
function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1">{label}</div>
      <div className={`text-[13px] text-foreground ${mono ? "font-mono" : ""}`}>{value || <span className="text-muted">—</span>}</div>
    </div>
  )
}
