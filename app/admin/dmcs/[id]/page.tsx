"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, X, MessageSquare, ExternalLink, CheckCircle2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Panel, Skel, EmptyRow, PillBadge, fmtTime, fmtDateShort, fmtDateStamp } from "@/components/admin/console"

type DMC = {
  id: string
  company_name: string
  contact_person: string | null
  email: string
  phone: string | null
  country: string | null
  city: string | null
  language_preference: string | null
  subscription_plan: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  line_user_id: string | null
  is_active: boolean | null
  preferred_operator_ids: string[] | null
  created_at: string
}

type Sub = {
  id: string
  plan: string | null
  price_thb: number | null
  status: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  activated_at: string | null
}

type BookingRow = {
  id: string
  booking_ref: string
  client_name: string
  total_days: number
  status: string | null
  dispatch_state: string | null
  created_at: string
}

type Op = { id: string; company_name: string }

type TabName = "overview" | "bookings" | "subs" | "activity"

export default function AdminDmcDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id
  const [dmc, setDmc] = useState<DMC | null>(null)
  const [subs, setSubs] = useState<Sub[]>([])
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [bookingCount, setBookingCount] = useState(0)
  const [operators, setOperators] = useState<Op[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabName>("overview")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<DMC>>({})

  const fetchAll = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const supabase = createClient()
    const [dmcRes, subsRes, bkRes, bkCountRes, opsRes] = await Promise.all([
      supabase.from("dmc_users").select("*").eq("id", id).maybeSingle(),
      supabase.from("subscriptions").select("id, plan, price_thb, status, start_date, end_date, created_at, activated_at").eq("dmc_id", id).order("created_at", { ascending: false }),
      supabase.from("bookings").select("id, booking_ref, client_name, total_days, status, dispatch_state, created_at").eq("dmc_id", id).order("created_at", { ascending: false }).limit(20),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("dmc_id", id),
      supabase.from("operators").select("id, company_name").eq("status", "active").order("company_name"),
    ])
    setDmc(dmcRes.data as DMC | null)
    setForm(dmcRes.data ?? {})
    setSubs((subsRes.data ?? []) as Sub[])
    setBookings((bkRes.data ?? []) as BookingRow[])
    setBookingCount(bkCountRes.count ?? 0)
    setOperators((opsRes.data ?? []) as Op[])
    setLoading(false)
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function save() {
    if (!dmc) return
    setSaving(true)
    const supabase = createClient()
    const patch = {
      company_name: form.company_name,
      contact_person: form.contact_person,
      email: form.email,
      phone: form.phone,
      country: form.country,
      language_preference: form.language_preference,
      preferred_operator_ids: form.preferred_operator_ids ?? [],
    }
    const { error } = await supabase.from("dmc_users").update(patch).eq("id", dmc.id)
    setSaving(false)
    if (error) { toast.error("Save failed: " + error.message); return }
    toast.success("Saved")
    setEditing(false)
    fetchAll()
  }

  if (!id) return null

  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted hover:text-foreground transition-colors inline-flex items-center gap-1 text-[12px]">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · DMC</div>
          <div className="text-foreground text-[17px] font-medium">{loading ? "…" : dmc?.company_name ?? "—"}</div>
          {dmc && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <PillBadge tone={dmc.subscription_status === "active" ? "primary" : dmc.subscription_status === "trial" ? "warning" : "danger"}>
                {dmc.subscription_status ?? "—"}
              </PillBadge>
              {dmc.subscription_plan && <PillBadge>{dmc.subscription_plan}</PillBadge>}
              {dmc.line_user_id
                ? <PillBadge tone="primary">LINE linked</PillBadge>
                : <PillBadge tone="danger">no LINE</PillBadge>
              }
              <span className="font-mono text-[11px] text-muted">joined {fmtTime(dmc.created_at)} ago</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/subscriptions?dmc=${id}`}
            className="h-8 px-3 rounded-md bg-primary text-white text-[12px] font-medium inline-flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
          >
            Activate Subscription
          </Link>
          <button
            onClick={() => toast.info("Messaging in Phase 3k")}
            className="h-8 px-2.5 rounded-md border border-border bg-surface text-[12px] text-muted hover:text-foreground hover:border-primary/30 inline-flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Message
          </button>
        </div>
      </div>

      <nav className="flex gap-1.5">
        {([
          ["overview", "Overview"],
          ["bookings", `Bookings · ${bookingCount}`],
          ["subs", "Subscriptions"],
          ["activity", "Activity"],
        ] as [TabName, string][]).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-2.5 h-7 rounded-md text-[12px] transition-colors
              ${tab === v
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-surface border border-border text-muted hover:text-foreground hover:border-primary/30"}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {loading ? (
        <Panel><Skel rows={8} /></Panel>
      ) : !dmc ? (
        <Panel><EmptyRow text="DMC not found." /></Panel>
      ) : tab === "overview" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel
            title="COMPANY"
            actions={editing ? (
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditing(false); setForm(dmc) }} disabled={saving}
                  className="h-7 px-2 rounded text-[11px] text-muted hover:text-foreground inline-flex items-center gap-1">
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button onClick={save} disabled={saving}
                  className="h-7 px-2 rounded text-[11px] bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-1">
                  <Save className="w-3 h-3" /> {saving ? "…" : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)}
                className="h-7 px-2 rounded text-[11px] text-muted hover:text-foreground inline-flex items-center gap-1">
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          >
            <KV label="Company" value={form.company_name ?? ""} editable={editing} onChange={v => setForm(f => ({ ...f, company_name: v }))} />
            <KV label="Contact" value={form.contact_person ?? ""} editable={editing} onChange={v => setForm(f => ({ ...f, contact_person: v }))} />
            <KV label="Email" value={form.email ?? ""} editable={editing} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <KV label="Phone" value={form.phone ?? ""} editable={editing} onChange={v => setForm(f => ({ ...f, phone: v }))} />
            <KV label="Country" value={form.country ?? ""} editable={editing} onChange={v => setForm(f => ({ ...f, country: v }))} />
            <KV label="Language" value={form.language_preference ?? ""} editable={editing} onChange={v => setForm(f => ({ ...f, language_preference: v }))} />
            <div className="py-1.5 grid grid-cols-[110px_1fr] items-start gap-3">
              <span className="font-mono text-[10px] uppercase text-muted tracking-wider pt-1">Preferred Ops</span>
              {editing ? (
                <div className="flex flex-wrap gap-1">
                  {operators.map(o => {
                    const active = (form.preferred_operator_ids ?? []).includes(o.id)
                    return (
                      <button key={o.id}
                        onClick={() => setForm(f => {
                          const cur = f.preferred_operator_ids ?? []
                          return { ...f, preferred_operator_ids: active ? cur.filter(x => x !== o.id) : [...cur, o.id] }
                        })}
                        className={`px-2 h-6 rounded-md text-[11px] border ${active ? "bg-primary/15 border-primary/30 text-primary" : "bg-surface border-border text-muted hover:text-foreground"}`}>
                        {o.company_name}
                      </button>
                    )
                  })}
                  {operators.length === 0 && <span className="text-[11px] text-muted italic">No active operators.</span>}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {(dmc.preferred_operator_ids ?? []).length === 0
                    ? <span className="text-[11px] text-muted">—</span>
                    : (dmc.preferred_operator_ids ?? []).map(pid => {
                      const op = operators.find(o => o.id === pid)
                      return <PillBadge key={pid} tone="primary">{op?.company_name ?? pid.slice(0, 8)}</PillBadge>
                    })}
                </div>
              )}
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel title="SUBSCRIPTION">
              <KV label="Plan" value={dmc.subscription_plan ?? "—"} />
              <KV label="Status" value={dmc.subscription_status ?? "—"} />
              <KV label="Trial Ends" value={dmc.trial_ends_at ? `${fmtDateShort(dmc.trial_ends_at)} · ${fmtTime(dmc.trial_ends_at)}` : "—"} />
              <div className="pt-3 mt-2 border-t border-border">
                <Link href={`/admin/subscriptions?dmc=${id}`}
                  className="text-[12px] text-primary hover:underline inline-flex items-center gap-1">
                  Manage subscription <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </Panel>
            <Panel title="LINE">
              {dmc.line_user_id ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Linked</span>
                  <span className="font-mono text-[11px] text-muted truncate">{dmc.line_user_id}</span>
                </div>
              ) : (
                <div className="text-[12px] text-muted italic font-display">Not linked. DMC has not connected their LINE account.</div>
              )}
            </Panel>
          </div>
        </div>
      ) : tab === "bookings" ? (
        <Panel
          title={`BOOKINGS · ${bookingCount}`}
          actions={
            <Link href={`/admin/bookings?dmc=${id}`} className="text-[11px] text-primary hover:underline inline-flex items-center gap-1">
              See all <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          {bookings.length === 0 ? <EmptyRow text="No bookings yet." /> : (
            <div className="overflow-x-auto -mx-4">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Ref", "Client", "Days", "Status", "Dispatch", "Created"].map(h => (
                      <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-2 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-t border-border hover:bg-surface-elevated/60">
                      <td className="py-2 px-4 font-mono text-[11px] text-primary">{b.booking_ref}</td>
                      <td className="py-2 px-4 text-foreground">{b.client_name}</td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">{b.total_days}d</td>
                      <td className="py-2 px-4"><PillBadge>{b.status ?? "—"}</PillBadge></td>
                      <td className="py-2 px-4"><PillBadge tone={b.dispatch_state === "sent" ? "primary" : "muted"}>{b.dispatch_state ?? "—"}</PillBadge></td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">{fmtTime(b.created_at)} ago</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      ) : tab === "subs" ? (
        <Panel title="SUBSCRIPTIONS HISTORY">
          {subs.length === 0 ? <EmptyRow text="No subscriptions on record." /> : (
            <div className="overflow-x-auto -mx-4">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Plan", "Price", "Status", "Start", "End", "Activated"].map(h => (
                      <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-2 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map(s => (
                    <tr key={s.id} className="border-t border-border hover:bg-surface-elevated/60">
                      <td className="py-2 px-4 font-mono text-[11px] text-foreground">{s.plan ?? "—"}</td>
                      <td className="py-2 px-4 font-mono text-[11px] text-foreground">{s.price_thb != null ? `฿${Number(s.price_thb).toLocaleString()}` : "—"}</td>
                      <td className="py-2 px-4"><PillBadge tone={s.status === "active" ? "primary" : "muted"}>{s.status ?? "—"}</PillBadge></td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">{fmtDateShort(s.start_date)}</td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">{fmtDateShort(s.end_date)}</td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">{s.activated_at ? fmtDateStamp(s.activated_at) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      ) : (
        <Panel title="ACTIVITY">
          <EmptyRow text="Admin audit log not tracked yet." />
        </Panel>
      )}
    </div>
  )
}

function KV({ label, value, editable, onChange }: {
  label: string
  value: string
  editable?: boolean
  onChange?: (v: string) => void
}) {
  return (
    <div className="py-1.5 grid grid-cols-[110px_1fr] items-start gap-3">
      <span className="font-mono text-[10px] uppercase text-muted tracking-wider pt-1">{label}</span>
      {editable ? (
        <input
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className="h-7 bg-background border border-input rounded-md px-2 text-[13px] text-foreground focus:outline-none focus:border-primary"
        />
      ) : (
        <span className="text-foreground text-[13px]">{value || <span className="text-muted">—</span>}</span>
      )}
    </div>
  )
}
