"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, RefreshCcw, Pause, Play } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Panel, FilterTabs, Skel, EmptyRow, Toggle, PillBadge, fmtTime } from "@/components/admin/console"

type Op = {
  id: string
  company_name: string
  contact_name: string | null
  base_location: string | null
  is_verified: boolean
  status: string | null
  created_at: string
}

type Stats = { fleet: number; drivers: number; trips_this_month: number }

type Tab = "all" | "verified" | "unverified" | "suspended"

export default function AdminOperatorsPage() {
  const [rows, setRows] = useState<Op[]>([])
  const [stats, setStats] = useState<Record<string, Stats>>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("all")
  const [q, setQ] = useState("")

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("operators")
      .select("id, company_name, contact_name, base_location, is_verified, status, created_at")
      .order("created_at", { ascending: false })
    const list = (data ?? []) as Op[]
    setRows(list)

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const statsMap: Record<string, Stats> = {}
    await Promise.all(list.map(async op => {
      const [fleetRes, driversRes, tripsRes] = await Promise.all([
        supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("operator_id", op.id),
        supabase.from("drivers").select("*", { count: "exact", head: true }).eq("operator_id", op.id),
        supabase.from("trips").select("*", { count: "exact", head: true }).eq("operator_id", op.id).gte("created_at", monthStart),
      ])
      statsMap[op.id] = {
        fleet: fleetRes.count ?? 0,
        drivers: driversRes.count ?? 0,
        trips_this_month: tripsRes.count ?? 0,
      }
    }))
    setStats(statsMap)
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const filtered = useMemo(() => {
    const ql = q.toLowerCase()
    return rows.filter(r => {
      if (tab === "verified" && !r.is_verified) return false
      if (tab === "unverified" && r.is_verified) return false
      if (tab === "suspended" && r.status !== "suspended") return false
      if (!ql) return true
      return (r.company_name ?? "").toLowerCase().includes(ql) || (r.base_location ?? "").toLowerCase().includes(ql)
    })
  }, [rows, tab, q])

  async function toggleVerified(op: Op) {
    const supabase = createClient()
    const { error } = await supabase.from("operators").update({ is_verified: !op.is_verified }).eq("id", op.id)
    if (error) { toast.error("Update failed: " + error.message); return }
    toast.success(`${op.company_name}: ${!op.is_verified ? "verified" : "unverified"}`)
    fetchRows()
  }

  async function toggleSuspend(op: Op) {
    const supabase = createClient()
    const nextStatus = op.status === "suspended" ? "active" : "suspended"
    const { error } = await supabase.from("operators").update({ status: nextStatus }).eq("id", op.id)
    if (error) { toast.error("Update failed: " + error.message); return }
    toast.success(`${op.company_name}: ${nextStatus}`)
    fetchRows()
  }

  const counts = useMemo(() => ({
    all: rows.length,
    verified: rows.filter(r => r.is_verified).length,
    unverified: rows.filter(r => !r.is_verified).length,
    suspended: rows.filter(r => r.status === "suspended").length,
  }), [rows])

  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · OPERATORS</div>
          <div className="text-foreground text-[15px] font-medium">Fleet operators</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              placeholder="Company or base"
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
          { value: "verified", label: "Verified", count: counts.verified },
          { value: "unverified", label: "Unverified", count: counts.unverified },
          { value: "suspended", label: "Suspended", count: counts.suspended },
        ]}
      />

      <Panel>
        {loading ? (
          <Skel rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyRow text="No operators match." />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full min-w-[880px]">
              <thead>
                <tr className="border-b border-border">
                  {["Company", "Base", "Verified", "Status", "Fleet", "Drivers", "Trips (mo)", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-2 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const s = stats[r.id] ?? { fleet: 0, drivers: 0, trips_this_month: 0 }
                  return (
                    <tr key={r.id} className="border-t border-border hover:bg-surface-elevated/60 transition-colors">
                      <td className="py-2 px-4">
                        <div className="text-foreground font-medium">{r.company_name}</div>
                        {r.contact_name && <div className="text-[11px] text-muted">{r.contact_name}</div>}
                      </td>
                      <td className="py-2 px-4 text-muted font-mono text-[11px]">{r.base_location ?? "—"}</td>
                      <td className="py-2 px-4">
                        <Toggle on={r.is_verified} onClick={() => toggleVerified(r)} labelOn="verified" labelOff="unverified" />
                      </td>
                      <td className="py-2 px-4"><PillBadge tone={r.status === "active" ? "primary" : r.status === "suspended" ? "danger" : "muted"}>{r.status ?? "—"}</PillBadge></td>
                      <td className="py-2 px-4 font-mono text-[12px] text-foreground">{s.fleet}</td>
                      <td className="py-2 px-4 font-mono text-[12px] text-foreground">{s.drivers}</td>
                      <td className="py-2 px-4 font-mono text-[12px] text-foreground">{s.trips_this_month}</td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">{fmtTime(r.created_at)} ago</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => toggleSuspend(r)}
                          title={r.status === "suspended" ? "Reactivate" : "Suspend"}
                          className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[color:var(--warning-dim)] text-muted hover:text-[color:var(--warning)]"
                        >
                          {r.status === "suspended" ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>
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
