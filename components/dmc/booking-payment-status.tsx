"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, Check, Circle, Clock, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useRef } from "react"

type RequestStatus = "requested" | "proof_uploaded" | "confirmed" | "disputed"

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
  trips: { id: string; status: string | null } | null
  operator: { id: string; company_name: string | null } | null
}

type TripGroup = {
  tripId: string
  tripStatus: string | null
  operator_to_driver?: PaymentRequest   // Leg 1
  dmc_to_operator?: PaymentRequest      // Leg 2
}

function relativeAgo(iso: string | null): string {
  if (!iso) return ""
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 60) return "just now"
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`
  return `${Math.floor(sec / 86400)} d ago`
}

function hoursSince(iso: string | null): number {
  if (!iso) return 0
  return Math.round((Date.now() - new Date(iso).getTime()) / 3600000)
}

export function BookingPaymentStatus({ bookingId, dmcId }: { bookingId: string; dmcId: string }) {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadTarget, setUploadTarget] = useState<PaymentRequest | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean
        requests: PaymentRequest[]
        error?: string
      }>("dmc-payments", { body: { action: "list", dmc_id: dmcId } })
      if (error) throw new Error(error.message)
      if (!data?.ok) throw new Error(data?.error ?? "Failed")
      setRequests((data.requests ?? []).filter(r => r.booking_id === bookingId))
    } catch (e: any) {
      toast.error(e?.message ?? "Could not load payment status")
    } finally {
      setLoading(false)
    }
  }, [bookingId, dmcId])

  useEffect(() => { load() }, [load])

  const groups: TripGroup[] = useMemo(() => {
    // Backend returns DMC-visible requests (both legs). We can't distinguish legs from the
    // response shape alone, so we group by trip_id and infer: the leg with operator === null
    // or where DMC owes (dmc_to_operator) is the one we can upload proof for. For display
    // purposes we show all requests under each trip; upload button only surfaces when status
    // is `requested` which is the DMC-owed leg per backend filter.
    const byTrip: Record<string, TripGroup> = {}
    for (const r of requests) {
      if (!byTrip[r.trip_id]) {
        byTrip[r.trip_id] = { tripId: r.trip_id, tripStatus: r.trips?.status ?? null }
      }
      // Heuristic: if operator is populated, this is the DMC→Operator leg
      if (r.operator) byTrip[r.trip_id].dmc_to_operator = r
      else byTrip[r.trip_id].operator_to_driver = r
    }
    return Object.values(byTrip).sort((a, b) => a.tripId.localeCompare(b.tripId))
  }, [requests])

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-2 text-sm text-muted">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading payment status…
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        No payment records for this booking yet. Payments appear once trips are completed.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {groups.map(g => (
        <TripPaymentRow key={g.tripId} group={g} onUpload={setUploadTarget} />
      ))}

      <UploadProofDialog
        request={uploadTarget}
        dmcId={dmcId}
        onClose={() => setUploadTarget(null)}
        onSuccess={() => { setUploadTarget(null); load() }}
      />
    </div>
  )
}

function TripPaymentRow({ group, onUpload }: { group: TripGroup; onUpload: (r: PaymentRequest) => void }) {
  const tripDone = group.tripStatus === "completed"
  const leg1 = group.operator_to_driver
  const leg2 = group.dmc_to_operator

  const step1Done = tripDone
  const step2Done = Boolean(leg1 && (leg1.status === "proof_uploaded" || leg1.status === "confirmed"))
  const step3Done = Boolean(leg2 && (leg2.status === "proof_uploaded" || leg2.status === "confirmed"))
  const step4Done = Boolean(leg2 && leg2.status === "confirmed")

  const step3Overdue = Boolean(leg2 && leg2.status === "requested" && hoursSince(leg2.requested_at) >= 48)

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-primary">{group.tripId}</span>
          {tripDone && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[#1D9E75]/20 text-[#1D9E75]">
              <Check className="w-3 h-3" /> Trip completed
            </span>
          )}
        </div>
        {leg2?.status === "requested" && (
          <Button size="sm" onClick={() => onUpload(leg2)} className="gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Upload proof
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Step
          label="Trip done"
          done={step1Done}
        />
        <Step
          label="Operator paid driver"
          done={step2Done}
          sub={leg1?.proof_uploaded_at ? relativeAgo(leg1.proof_uploaded_at) : undefined}
        />
        <Step
          label="You paid operator"
          done={step3Done}
          overdue={step3Overdue}
          sub={leg2?.proof_uploaded_at ? relativeAgo(leg2.proof_uploaded_at) : undefined}
        />
        <Step
          label="Operator confirmed"
          done={step4Done}
          sub={leg2?.confirmed_at ? relativeAgo(leg2.confirmed_at) : undefined}
        />
      </div>

      {leg2?.status === "disputed" && (
        <div className="mt-3 text-xs text-red-300 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Operator disputed your payment proof.
        </div>
      )}
    </div>
  )
}

function Step({
  label, done, overdue, sub,
}: {
  label: string
  done: boolean
  overdue?: boolean
  sub?: string
}) {
  const color = done
    ? "text-[#1D9E75]"
    : overdue
    ? "text-red-300"
    : "text-muted"
  const Icon = done ? Check : overdue ? AlertTriangle : Clock
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
        done
          ? "bg-[#1D9E75]/20 border-[#1D9E75]/30"
          : overdue
          ? "bg-red-500/10 border-red-500/30"
          : "bg-background border-border"
      }`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className={`text-[11px] font-medium ${done ? "text-foreground" : color}`}>{label}</div>
      {sub && <div className="text-[10px] text-muted font-mono">{sub}</div>}
      {overdue && !sub && <div className="text-[10px] text-red-300 font-mono">48h+ overdue</div>}
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

  useEffect(() => { if (!request) { setFile(null); setNote("") } }, [request])

  async function submit() {
    if (!request || !file) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const path = `${request.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from("payment_proofs")
        .upload(path, file, { contentType: file.type, upsert: false })
      if (upErr) throw new Error("Upload failed: " + upErr.message)
      const { data: pubUrl } = supabase.storage.from("payment_proofs").getPublicUrl(path)
      const publicUrl = pubUrl?.publicUrl
      if (!publicUrl) throw new Error("Could not get public URL")
      const { data, error: invokeErr } = await supabase.functions.invoke<{ ok: boolean; error?: string }>(
        "dmc-payments",
        {
          body: {
            action: "upload_proof",
            dmc_id: dmcId,
            request_id: request.id,
            proof_photo_url: publicUrl,
            proof_note: note.trim() || null,
          },
        }
      )
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

  return (
    <Dialog open={Boolean(request)} onOpenChange={v => { if (!v) onClose() }}>
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
          <button type="button" onClick={onClose} className="h-9 px-3 rounded-md text-sm text-muted hover:text-foreground">
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
