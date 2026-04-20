"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { Search, MessageSquare, Eye, Power, RefreshCcw, Pause, Play } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Panel, FilterTabs, Skel, EmptyRow, Toggle, PillBadge, fmtTime } from "@/components/admin/console"

type DMC = {
  id: string
  company_name: string
  contact_person: string | null
  email: string
  phone: string | null
  country: string | null
  city: string | null
  subscription_plan: string | null
  subscription_status: string | null
  trial_ends_at: string | null
  line_user_id: string | null
  is_active: boolean | null
  created_at: string
}

type Tab = "all" | "trial" | "active" | "suspended" | "expired"

export default function AdminDmcsPage() {
  const [rows, setRows] = useState<DMC[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("all")
  const [q, setQ] = useState("")
  const [counts, setCounts] = useState<Record<string, number>>({})

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [{ data }, countsRes] = await Promise.all([
      supabase
        .from("dmc_users")
        .select("id, company_name, contact_person, email, phone, country, city, subscription_plan, subscription_status, trial_ends_at, line_user_id, is_active, created_at")
        .order("created_at", { ascending: false }),
      Promise.all(["trial", "active", "suspended", "expired"].map(status =>
        supabase.from("dmc_users").select("*", { count: "exact", head: true }).eq("subscription_status", status)
      )),
    ])
    setRows((data ?? []) as DMC[])
    const [tr, ac, su, ex] = countsRes
    setCounts({ trial: tr.count ?? 0, active: ac.count ?? 0, suspended: su.count ?? 0, expired: ex.count ?? 0, all: (data ?? []).length })
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const filtered = useMemo(() => {
    const ql = q.toLowerCase()
    return rows.filter(r => {
      if (tab !== "all" && r.subscription_status !== tab) return false
      if (!ql) return true
      return (r.company_name ?? "").toLowerCase().includes(ql) || (r.email ?? "").toLowerCase().includes(ql)
    })
  }, [rows, tab, q])

  async function toggleSuspend(dmc: DMC) {
    const supabase = createClient()
    const nextStatus = dmc.subscription_status === "suspended" ? "active" : "suspended"
    const { error } = await supabase.from("dmc_users").update({ subscription_status: nextStatus }).eq("id", dmc.id)
    if (error) { toast.error("Update failed: " + error.message); return }
    toast.success(`${dmc.company_name}: ${nextStatus}`)
    fetchRows()
  }

  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · DMCS</div>
          <div className="text-foreground text-[15px] font-medium">Destination Management Companies</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              placeholder="Company or email"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-md bg-surface border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary w-60"
            />
          </div>
          <button onClick={fetchRows} className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-surface text-[12px] text-muted hover:text-foreground hover:border-primary/40 transition-colors">
            <RefreshCcw className="w-3 h-3" /> R
          </button>
        </div>
      </div>

      <FilterTabs<Tab>
        active={tab}
        onChange={setTab}
        tabs={[
          { value: "all", label: "All", count: counts.all },
          { value: "trial", label: "Trial", count: counts.trial },
          { value: "active", label: "Active", count: counts.active },
          { value: "suspended", label: "Suspended", count: counts.suspended },
          { value: "expired", label: "Expired", count: counts.expired },
        ]}
      />

      <Panel>
        {loading ? (
          <Skel rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyRow text="No DMCs match." />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full min-w-[880px]">
              <thead>
                <tr className="border-b border-border">
                  {["Company", "Country", "Email", "Plan", "Status", "Trial Ends", "Created", "Actions"].map(h => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-2 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const suspended = r.subscription_status === "suspended"
                  const tone =
                    r.subscription_status === "active" ? "primary" :
                    r.subscription_status === "trial" ? "warning" :
                    r.subscription_status === "suspended" ? "danger" :
                    r.subscription_status === "expired" ? "danger" :
                    "muted"
                  return (
                    <tr key={r.id} className="border-t border-border hover:bg-surface-elevated/60 transition-colors">
                      <td className="py-2 px-4">
                        <Link href={`/admin/dmcs/${r.id}`} className="text-foreground hover:text-primary font-medium transition-colors">
                          {r.company_name}
                        </Link>
                        {r.contact_person && <div className="text-[11px] text-muted truncate">{r.contact_person}</div>}
                      </td>
                      <td className="py-2 px-4 text-muted font-mono text-[11px]">{r.country ?? r.city ?? "—"}</td>
                      <td className="py-2 px-4 text-muted font-mono text-[11px] truncate max-w-[180px]">{r.email}</td>
                      <td className="py-2 px-4 font-mono text-[11px] text-foreground">{r.subscription_plan ?? "—"}</td>
                      <td className="py-2 px-4"><PillBadge tone={tone as any}>{r.subscription_status ?? "—"}</PillBadge></td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">
                        {r.trial_ends_at ? fmtTime(r.trial_ends_at) : "—"}
                      </td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">{fmtTime(r.created_at)} ago</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/dmcs/${r.id}`} title="View" className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-primary/10 text-muted hover:text-primary">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => toggleSuspend(r)}
                            title={suspended ? "Reactivate" : "Suspend"}
                            className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[color:var(--warning-dim)] text-muted hover:text-[color:var(--warning)]`}
                          >
                            {suspended ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => toast.info("Messaging in Phase 3k")}
                            title="Send message"
                            className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-surface-elevated text-muted hover:text-foreground"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
