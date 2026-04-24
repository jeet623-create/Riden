"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle, BellRing, Check, ChevronLeft, ChevronRight, Download, Flag, Loader2,
  RefreshCw, Search, X as XIcon,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

type RequestStatus = "requested" | "proof_uploaded" | "confirmed" | "disputed"
type LegKind = "operator_to_driver" | "dmc_to_operator"

type ListRow = {
  trip_id: string
  trip_date: string | null
  client_name: string | null
  dmc_name: string | null
  operator_name: string | null
  driver_name: string | null
  op_to_driver_status: RequestStatus | null
  dmc_to_op_status: RequestStatus | null
  op_payment_overdue_48h: boolean | null
  driver_confirmation_overdue_24h: boolean | null
  dmc_payment_overdue_72h: boolean | null
}

type ListResponse = {
  ok: boolean
  rows: ListRow[]
  total: number
  error?: string
}

type SummaryResponse = {
  ok: boolean
  counts: {
    total_trips: number
    op_to_driver: { pending: number; proof_uploaded: number; confirmed: number; disputed: number }
    dmc_to_op: { pending: number; proof_uploaded: number; confirmed: number; disputed: number }
    red_flags: {
      op_payment_overdue_48h: number
      driver_confirmation_overdue_24h: number
      dmc_payment_overdue_72h: number
    }
  }
  error?: string
}

type DetailRequest = {
  id: string
  leg: LegKind
  status: RequestStatus
  requested_at: string | null
  proof_uploaded_at: string | null
  proof_photo_url: string | null
  proof_note: string | null
  confirmed_at: string | null
  disputed_reason: string | null
  nudge_count: number
}

type DetailResponse = {
  ok: boolean
  chain: {
    trip_id: string
    trip_date: string | null
    pickup_time: string | null
    pickup_location: string | null
    dropoff_location: string | null
    client_name: string | null
    dmc_name: string | null
    operator_name: string | null
    operator_phone: string | null
    driver_name: string | null
    driver_phone: string | null
  } | null
  requests: DetailRequest[]
  error?: string
}

const PAGE_SIZE = 50

const statusTone: Record<RequestStatus, string> = {
  requested: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  proof_uploaded: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  confirmed: "bg-[#1D9E75]/20 text-[#1D9E75] border-[#1D9E75]/30",
  disputed: "bg-red-500/20 text-red-300 border-red-500/30",
}
const statusLabel: Record<RequestStatus, string> = {
  requested: "Requested",
  proof_uploaded: "Proof uploaded",
  confirmed: "Confirmed",
  disputed: "Disputed",
}

type Filters = {
  search: string
  status: "all" | RequestStatus
  leg: "all" | LegKind
  date_from: string
  date_to: string
  only_red_flags: boolean
}

const emptyFilters: Filters = {
  search: "", status: "all", leg: "all", date_from: "", date_to: "", only_red_flags: false,
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—"
  try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) } catch { return iso }
}
function fmtDateTime(iso: string | null): string {
  if (!iso) return "—"
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

function buildFilterBody(f: Filters, extras: Record<string, unknown> = {}): Record<string, unknown> {
  const body: Record<string, unknown> = { ...extras }
  if (f.search.trim()) body.search = f.search.trim()
  if (f.status !== "all") body.status = f.status
  if (f.leg !== "all") body.leg = f.leg
  if (f.date_from) body.date_from = f.date_from
  if (f.date_to) body.date_to = f.date_to
  if (f.only_red_flags) body.only_red_flags = true
  return body
}

export function AdminPaymentsTable() {
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [rows, setRows] = useState<ListRow[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [detailTripId, setDetailTripId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const body = buildFilterBody(filters, { action: "list", limit: PAGE_SIZE, offset })
      const { data, error } = await supabase.functions.invoke<ListResponse>("admin-payments", { body })
      if (error) throw new Error(error.message)
      if (!data?.ok) throw new Error(data?.error ?? "Failed to load rows")
      setRows(data.rows ?? [])
      setTotal(data.total ?? 0)
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }, [filters, offset])

  const loadSummary = useCallback(async () => {
    try {
      const supabase = createClient()
      const body = buildFilterBody(filters, { action: "summary" })
      const { data, error } = await supabase.functions.invoke<SummaryResponse>("admin-payments", { body })
      if (error) throw new Error(error.message)
      if (!data?.ok) return
      setSummary(data)
    } catch {
      /* silent */
    }
  }, [filters])

  useEffect(() => { loadList() }, [loadList])
  useEffect(() => { loadSummary() }, [loadSummary])

  async function downloadCsv() {
    setExporting(true)
    try {
      const body = buildFilterBody(filters)
      const res = await fetch("/api/admin/payments/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `riden-payments-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      toast.error("CSV export failed: " + (e?.message ?? "unknown"))
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.floor(offset / PAGE_SIZE) + 1

  function updateFilter<K extends keyof Filters>(k: K, v: Filters[K]) {
    setFilters(f => ({ ...f, [k]: v }))
    setOffset(0)
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            placeholder="Search trip ID or client…"
            value={filters.search}
            onChange={e => updateFilter("search", e.target.value)}
            className="h-9 w-full pl-9 pr-3 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
          />
        </div>

        <select
          value={filters.status}
          onChange={e => updateFilter("status", e.target.value as Filters["status"])}
          className="h-9 px-2 rounded-md bg-background border border-border text-sm text-foreground"
        >
          <option value="all">Status: All</option>
          <option value="requested">Requested</option>
          <option value="proof_uploaded">Proof uploaded</option>
          <option value="confirmed">Confirmed</option>
          <option value="disputed">Disputed</option>
        </select>

        <select
          value={filters.leg}
          onChange={e => updateFilter("leg", e.target.value as Filters["leg"])}
          className="h-9 px-2 rounded-md bg-background border border-border text-sm text-foreground"
        >
          <option value="all">Leg: All</option>
          <option value="operator_to_driver">Op → Driver</option>
          <option value="dmc_to_operator">DMC → Op</option>
        </select>

        <input
          type="date"
          value={filters.date_from}
          onChange={e => updateFilter("date_from", e.target.value)}
          className="h-9 px-2 rounded-md bg-background border border-border text-sm text-foreground"
        />
        <input
          type="date"
          value={filters.date_to}
          onChange={e => updateFilter("date_to", e.target.value)}
          className="h-9 px-2 rounded-md bg-background border border-border text-sm text-foreground"
        />

        <label className="inline-flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={filters.only_red_flags}
            onChange={e => updateFilter("only_red_flags", e.target.checked)}
          />
          Red flags only
        </label>

        <button
          onClick={() => setFilters(emptyFilters)}
          className="h-9 px-3 rounded-md text-sm text-muted hover:text-foreground"
        >
          Reset
        </button>

        <button
          onClick={() => { loadList(); loadSummary() }}
          className="h-9 px-3 rounded-md border border-border text-sm text-muted hover:text-foreground inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>

        <Button onClick={downloadCsv} disabled={exporting} className="gap-1.5">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export CSV
        </Button>
      </div>

      {/* Summary strip */}
      {summary?.counts && (
        <div className="bg-surface border border-border rounded-xl p-3 flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted">Total: <span className="text-foreground font-mono">{summary.counts.total_trips}</span></span>
          <span className="text-muted">Op→Driver pending: <span className="text-amber-300 font-mono">{summary.counts.op_to_driver.pending}</span></span>
          <span className="text-muted">DMC→Op pending: <span className="text-blue-300 font-mono">{summary.counts.dmc_to_op.pending}</span></span>
          {summary.counts.red_flags.op_payment_overdue_48h > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-300">
              <Flag className="w-3.5 h-3.5" /> {summary.counts.red_flags.op_payment_overdue_48h} op overdue 48h
            </span>
          )}
          {summary.counts.red_flags.dmc_payment_overdue_72h > 0 && (
            <span className="inline-flex items-center gap-1 text-red-300">
              <Flag className="w-3.5 h-3.5" /> {summary.counts.red_flags.dmc_payment_overdue_72h} dmc overdue 72h
            </span>
          )}
          {summary.counts.red_flags.driver_confirmation_overdue_24h > 0 && (
            <span className="inline-flex items-center gap-1 text-blue-300">
              <Flag className="w-3.5 h-3.5" /> {summary.counts.red_flags.driver_confirmation_overdue_24h} driver confirm 24h
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background border-b border-border">
              {["Trip ID", "Date", "Client", "DMC", "Operator", "Driver", "Op→Driver", "DMC→Op", "🚩"].map(h => (
                <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="py-3 px-3"><div className="h-4 bg-surface-elevated rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} className="py-12 text-center text-muted font-display italic">No payments match these filters.</td></tr>
            ) : rows.map(r => (
              <tr
                key={r.trip_id}
                onClick={() => setDetailTripId(r.trip_id)}
                className="border-b border-border last:border-b-0 cursor-pointer hover:bg-surface-elevated/40 transition-colors"
              >
                <td className="py-2.5 px-3 font-mono text-sm text-primary">{r.trip_id}</td>
                <td className="py-2.5 px-3 text-xs text-muted font-mono">{fmtDate(r.trip_date)}</td>
                <td className="py-2.5 px-3 text-sm text-foreground truncate max-w-[160px]">{r.client_name ?? "—"}</td>
                <td className="py-2.5 px-3 text-xs text-muted truncate max-w-[140px]">{r.dmc_name ?? "—"}</td>
                <td className="py-2.5 px-3 text-xs text-muted truncate max-w-[140px]">{r.operator_name ?? "—"}</td>
                <td className="py-2.5 px-3 text-xs text-muted truncate max-w-[140px]">{r.driver_name ?? "—"}</td>
                <td className="py-2.5 px-3">
                  {r.op_to_driver_status ? (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusTone[r.op_to_driver_status]}`}>
                      {statusLabel[r.op_to_driver_status]}
                    </span>
                  ) : <span className="text-muted text-xs">—</span>}
                </td>
                <td className="py-2.5 px-3">
                  {r.dmc_to_op_status ? (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusTone[r.dmc_to_op_status]}`}>
                      {statusLabel[r.dmc_to_op_status]}
                    </span>
                  ) : <span className="text-muted text-xs">—</span>}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    {r.dmc_payment_overdue_72h && <Flag className="w-3.5 h-3.5 text-red-300" />}
                    {r.op_payment_overdue_48h && <Flag className="w-3.5 h-3.5 text-amber-300" />}
                    {r.driver_confirmation_overdue_24h && <Flag className="w-3.5 h-3.5 text-blue-300" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-border text-sm">
          <span className="text-muted">
            Page <span className="font-mono text-foreground">{page}</span> of <span className="font-mono">{totalPages}</span>
            <span className="mx-2">·</span>
            <span className="font-mono">{total}</span> records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}
              disabled={offset === 0}
              className="h-8 px-3 rounded-md border border-border text-xs text-muted hover:text-foreground disabled:opacity-40 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => setOffset(o => o + PAGE_SIZE)}
              disabled={page >= totalPages}
              className="h-8 px-3 rounded-md border border-border text-xs text-muted hover:text-foreground disabled:opacity-40 inline-flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <PaymentDetailDrawer
        tripId={detailTripId}
        onClose={() => setDetailTripId(null)}
        onNudged={() => { loadList(); loadSummary() }}
      />
    </div>
  )
}

function PaymentDetailDrawer({
  tripId, onClose, onNudged,
}: {
  tripId: string | null
  onClose: () => void
  onNudged: () => void
}) {
  const [data, setData] = useState<DetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [nudgingId, setNudgingId] = useState<string | null>(null)

  useEffect(() => {
    if (!tripId) { setData(null); return }
    ;(async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: res, error } = await supabase.functions.invoke<DetailResponse>(
          "admin-payments",
          { body: { action: "get_detail", trip_id: tripId } }
        )
        if (error) throw new Error(error.message)
        if (!res?.ok) throw new Error(res?.error ?? "Failed to load")
        setData(res)
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load detail")
      } finally {
        setLoading(false)
      }
    })()
  }, [tripId])

  async function nudge(requestId: string) {
    setNudgingId(requestId)
    try {
      const supabase = createClient()
      const { data: res, error } = await supabase.functions.invoke<{ ok: boolean; error?: string }>(
        "admin-payments",
        { body: { action: "nudge", request_id: requestId } }
      )
      if (error) throw new Error(error.message)
      if (!res?.ok) throw new Error(res?.error ?? "Nudge failed")
      toast.success("Reminder sent on LINE")
      // Refresh detail to update nudge_count
      if (tripId) {
        const { data: refresh } = await supabase.functions.invoke<DetailResponse>(
          "admin-payments",
          { body: { action: "get_detail", trip_id: tripId } }
        )
        if (refresh?.ok) setData(refresh)
      }
      onNudged()
    } catch (e: any) {
      toast.error(e?.message ?? "Nudge failed")
    } finally {
      setNudgingId(null)
    }
  }

  const open = Boolean(tripId)
  const leg1 = data?.requests?.find(r => r.leg === "operator_to_driver")
  const leg2 = data?.requests?.find(r => r.leg === "dmc_to_operator")

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent side="right" className="bg-surface border-border w-full sm:max-w-[50vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            Payment chain
            {tripId && <span className="font-mono text-primary text-sm">{tripId}</span>}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center gap-2 mt-6 text-muted text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : !data?.chain ? (
          <div className="mt-6 text-sm text-muted">No detail available.</div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Trip info */}
            <section className="bg-background border border-border rounded-lg p-4">
              <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-2">TRIP</div>
              <div className="text-sm text-foreground">
                {fmtDate(data.chain.trip_date)}
                {data.chain.pickup_time && <span className="text-muted font-mono"> · {data.chain.pickup_time.slice(0,5)}</span>}
              </div>
              <div className="text-xs text-muted mt-1">
                {data.chain.pickup_location ?? "—"} → {data.chain.dropoff_location ?? "—"}
              </div>
              <div className="text-xs text-muted mt-1">
                Client: <span className="text-foreground">{data.chain.client_name ?? "—"}</span> · DMC: <span className="text-foreground">{data.chain.dmc_name ?? "—"}</span>
              </div>
            </section>

            {/* Parties */}
            <section className="grid grid-cols-2 gap-3">
              <PartyCard title="OPERATOR" name={data.chain.operator_name ?? "—"} phone={data.chain.operator_phone ?? null} />
              <PartyCard title="DRIVER" name={data.chain.driver_name ?? "—"} phone={data.chain.driver_phone ?? null} />
            </section>

            {/* Leg 1 */}
            <LegBlock
              title="Leg 1: Operator → Driver"
              req={leg1}
              nudgeLabel="Nudge operator"
              onNudge={id => nudge(id)}
              nudging={nudgingId === leg1?.id}
            />

            {/* Leg 2 */}
            <LegBlock
              title="Leg 2: DMC → Operator"
              req={leg2}
              nudgeLabel="Nudge DMC"
              onNudge={id => nudge(id)}
              nudging={nudgingId === leg2?.id}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function PartyCard({ title, name, phone }: { title: string; name: string; phone: string | null }) {
  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <div className="font-mono text-[10px] uppercase text-muted tracking-wider">{title}</div>
      <div className="text-sm font-medium text-foreground mt-1">{name}</div>
      {phone && <a href={`tel:${phone}`} className="text-xs text-muted hover:text-primary">{phone}</a>}
    </div>
  )
}

function LegBlock({
  title, req, nudgeLabel, onNudge, nudging,
}: {
  title: string
  req: DetailRequest | undefined
  nudgeLabel: string
  onNudge: (id: string) => void
  nudging: boolean
}) {
  if (!req) {
    return (
      <section className="bg-background border border-border rounded-lg p-4">
        <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-2">{title}</div>
        <div className="text-xs text-muted italic">No record.</div>
      </section>
    )
  }
  return (
    <section className="bg-background border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] uppercase text-muted tracking-wider">{title}</div>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusTone[req.status]}`}>
          {statusLabel[req.status]}
        </span>
      </div>

      <Timeline
        requested={req.requested_at}
        proofUploaded={req.proof_uploaded_at}
        proofUrl={req.proof_photo_url}
        proofNote={req.proof_note}
        confirmed={req.confirmed_at}
      />

      {req.status === "disputed" && req.disputed_reason && (
        <div className="mt-3 p-2 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-300">
          <AlertTriangle className="inline w-3.5 h-3.5 mr-1" />
          Dispute: {req.disputed_reason}
        </div>
      )}

      {(req.status === "requested" || req.status === "proof_uploaded") && (
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            onClick={() => onNudge(req.id)}
            disabled={nudging}
            className="gap-1.5"
          >
            {nudging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
            {nudgeLabel}
          </Button>
          {req.nudge_count > 0 && (
            <span className="text-xs text-muted">{req.nudge_count} reminder{req.nudge_count === 1 ? "" : "s"} sent</span>
          )}
        </div>
      )}
    </section>
  )
}

function Timeline({
  requested, proofUploaded, proofUrl, proofNote, confirmed,
}: {
  requested: string | null
  proofUploaded: string | null
  proofUrl: string | null
  proofNote: string | null
  confirmed: string | null
}) {
  return (
    <div className="space-y-2">
      <TimelineItem done={Boolean(requested)} label="Requested" meta={fmtDateTime(requested)} />
      <TimelineItem
        done={Boolean(proofUploaded)}
        label="Proof uploaded"
        meta={proofUploaded ? fmtDateTime(proofUploaded) : "—"}
      >
        {proofUrl && (
          <a href={proofUrl} target="_blank" rel="noreferrer" className="block mt-1">
            <img src={proofUrl} alt="proof" className="max-h-40 rounded-md border border-border" />
          </a>
        )}
        {proofNote && <div className="text-xs text-muted mt-1">Note: {proofNote}</div>}
      </TimelineItem>
      <TimelineItem done={Boolean(confirmed)} label="Confirmed" meta={fmtDateTime(confirmed)} />
    </div>
  )
}

function TimelineItem({
  done, label, meta, children,
}: {
  done: boolean
  label: string
  meta: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        done ? "bg-[#1D9E75]/20 text-[#1D9E75]" : "bg-background border border-border text-muted"
      }`}>
        <Check className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-xs text-muted font-mono">{meta}</div>
        {children}
      </div>
    </div>
  )
}
