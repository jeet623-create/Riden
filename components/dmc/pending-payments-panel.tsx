"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle, Check, Clock, ExternalLink, Eye, Loader2, Upload, X as XIcon,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type RequestStatus = "requested" | "proof_uploaded" | "confirmed" | "disputed"

type TripInfo = {
  id: string
  trip_date: string | null
  pickup_time: string | null
  pickup_location: string | null
  dropoff_location: string | null
  status: string | null
}

type OperatorInfo = {
  id: string
  company_name: string | null
  phone: string | null
}

type PaymentRequest = {
  id: string
  trip_id: string
  booking_id: string
  status: RequestStatus
  requested_at: string
  proof_uploaded_at: string | null
  proof_photo_url: string | null
  confirmed_at: string | null
  nudge_count: number
  trips: TripInfo | null
  operator: OperatorInfo | null
}

type Summary = {
  total: number
  pending: number
  proof_pending_confirm: number
  confirmed: number
  disputed: number
}

type Filter = "all" | "requested" | "proof_uploaded"

const statusLabel: Record<RequestStatus, string> = {
  requested: "Action needed",
  proof_uploaded: "Awaiting confirm",
  confirmed: "Paid",
  disputed: "Disputed",
}

const statusTone: Record<RequestStatus, string> = {
  requested: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  proof_uploaded: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  confirmed: "bg-[#1D9E75]/20 text-[#1D9E75] border-[#1D9E75]/30",
  disputed: "bg-red-500/20 text-red-300 border-red-500/30",
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—"
  try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) } catch { return iso }
}
function fmtTime(t: string | null): string { return (t ?? "").slice(0, 5) }
function hoursSince(iso: string | null): number {
  if (!iso) return 0
  const ms = Date.now() - new Date(iso).getTime()
  return Math.round(ms / 3600000)
}

export function PendingPaymentsPanel({ dmcId }: { dmcId: string }) {
  const [rows, setRows] = useState<PaymentRequest[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [uploadTarget, setUploadTarget] = useState<PaymentRequest | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const body: Record<string, unknown> = { action: "list", dmc_id: dmcId }
      if (filter !== "all") body.status_filter = filter
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean
        requests: PaymentRequest[]
        summary: Summary
        error?: string
      }>("dmc-payments", { body })
      if (error) throw new Error(error.message)
      if (!data?.ok) throw new Error(data?.error ?? "Failed to load payments")
      setRows(data.requests ?? [])
      setSummary(data.summary ?? null)
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }, [dmcId, filter])

  useEffect(() => { load() }, [load])

  const filtered = rows

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Pending Payments</h2>
          <p className="text-[12px] text-muted mt-0.5">
            Payments you owe operators for completed trips
          </p>
        </div>
        {summary && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <SummaryChip tone="amber" label="Pending" value={summary.pending} />
            <SummaryChip tone="blue" label="Awaiting confirm" value={summary.proof_pending_confirm} />
            <SummaryChip tone="teal" label="Confirmed" value={summary.confirmed} />
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill>
        <FilterPill active={filter === "requested"} onClick={() => setFilter("requested")}>Pending</FilterPill>
        <FilterPill active={filter === "proof_uploaded"} onClick={() => setFilter("proof_uploaded")}>Proof uploaded</FilterPill>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="h-4 bg-surface-elevated rounded w-24" />
              <div className="h-4 bg-surface-elevated rounded flex-1" />
              <div className="h-7 bg-surface-elevated rounded w-28" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted font-display italic">No payments to show.</p>
          </div>
        ) : (
          filtered.map(r => (
            <PaymentRow key={r.id} r={r} onUpload={() => setUploadTarget(r)} />
          ))
        )}
      </div>

      <UploadProofDialog
        request={uploadTarget}
        dmcId={dmcId}
        onClose={() => setUploadTarget(null)}
        onSuccess={() => { setUploadTarget(null); load() }}
      />
    </div>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-3 rounded-full text-xs font-medium transition-colors border ${
        active
          ? "bg-primary/15 text-primary border-primary/30"
          : "bg-transparent text-muted border-border hover:text-foreground hover:border-primary/30"
      }`}
    >
      {children}
    </button>
  )
}

function SummaryChip({ tone, label, value }: { tone: "amber" | "blue" | "teal"; label: string; value: number }) {
  const toneClass = tone === "amber"
    ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
    : tone === "blue"
    ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
    : "bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/20"
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${toneClass}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}

function PaymentRow({ r, onUpload }: { r: PaymentRequest; onUpload: () => void }) {
  const overdue = r.status === "requested" && hoursSince(r.requested_at) >= 72

  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-surface-elevated/40 transition-colors">
      <div className="min-w-[120px]">
        <Link
          href={`/dmc/bookings/${r.booking_id}`}
          className="font-mono text-sm text-primary hover:underline"
        >
          {r.trip_id}
        </Link>
        <div className="text-[11px] text-muted">
          {fmtDate(r.trips?.trip_date ?? null)} {fmtTime(r.trips?.pickup_time ?? null)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground truncate">
          {r.operator?.company_name ?? "—"}
        </div>
        <div className="text-[11px] text-muted truncate">
          {r.trips?.pickup_location ?? "—"} → {r.trips?.dropoff_location ?? "—"}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusTone[r.status]}`}>
          {statusLabel[r.status]}
        </span>
        {overdue && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/20 text-red-300 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" /> 72h+ overdue
          </span>
        )}
      </div>

      <div className="min-w-[140px] flex items-center justify-end">
        {r.status === "requested" && (
          <Button size="sm" onClick={onUpload} className="gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Upload proof
          </Button>
        )}
        {r.status === "proof_uploaded" && r.proof_photo_url && (
          <a
            href={r.proof_photo_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-300 hover:underline"
          >
            <Eye className="w-3.5 h-3.5" /> View proof <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {r.status === "confirmed" && (
          <span className="inline-flex items-center gap-1 text-xs text-[#1D9E75]">
            <Check className="w-3.5 h-3.5" /> Paid
          </span>
        )}
        {r.status === "disputed" && (
          <span className="inline-flex items-center gap-1 text-xs text-red-300">
            <AlertTriangle className="w-3.5 h-3.5" /> Disputed
          </span>
        )}
      </div>
    </div>
  )
}

function UploadProofDialog({
  request, dmcId, onClose, onSuccess,
}: {
  request: PaymentRequest | null
  dmcId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!request) { setFile(null); setNote("") }
  }, [request])

  async function submit() {
    if (!request || !file) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const path = `${request.id}/${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage.from("payment_proofs").upload(path, file, {
        contentType: file.type, upsert: false,
      })
      if (upErr) throw new Error("Upload failed: " + upErr.message)

      const { data: pubUrl } = supabase.storage.from("payment_proofs").getPublicUrl(path)
      const publicUrl = pubUrl?.publicUrl
      if (!publicUrl) throw new Error("Could not get public URL")

      const { data, error: invokeErr } = await supabase.functions.invoke<{
        ok: boolean
        error?: string
      }>("dmc-payments", {
        body: {
          action: "upload_proof",
          dmc_id: dmcId,
          request_id: request.id,
          proof_photo_url: publicUrl,
          proof_note: note.trim() || null,
        },
      })
      if (invokeErr) throw new Error(invokeErr.message)
      if (!data?.ok) throw new Error(data?.error ?? "Server rejected proof")

      toast.success("Proof uploaded. Operator notified on LINE.")
      onSuccess()
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to upload proof")
    } finally {
      setSubmitting(false)
    }
  }

  const open = Boolean(request)
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload payment proof</DialogTitle>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="text-xs text-muted">
              Trip <span className="font-mono text-foreground">{request.trip_id}</span>
              {request.operator?.company_name && <> · {request.operator.company_name}</>}
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1">
                Screenshot / receipt
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-left text-muted hover:text-foreground hover:border-primary/40 inline-flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                {file ? file.name : "Pick an image…"}
                {file && (
                  <span className="ml-auto font-mono text-[10px] text-muted">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                )}
              </button>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Bank ref, transfer time, etc."
                className="w-full min-h-[72px] bg-background border border-border rounded-md px-2 py-1.5 text-sm text-foreground resize-y focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3 rounded-md text-sm text-muted hover:text-foreground"
          >
            Cancel
          </button>
          <Button onClick={submit} disabled={!file || submitting} className="gap-1.5">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {submitting ? "Uploading…" : "Submit proof"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
