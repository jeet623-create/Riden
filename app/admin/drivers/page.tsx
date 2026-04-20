"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { Search, RefreshCcw, Pause, Play, AlertTriangle, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Panel, FilterTabs, Skel, EmptyRow, Toggle, PillBadge, fmtTime, fmtDateShort, daysUntil } from "@/components/admin/console"

type Driver = {
  id: string
  full_name: string | null
  phone: string | null
  operator_id: string | null
  vehicle_type: string | null
  vehicle_plate: string | null
  license_expiry: string | null
  is_verified: boolean
  is_available: boolean
  is_active: boolean | null
  created_at: string
}

type Tab = "all" | "verified" | "pending" | "expiring" | "suspended"

export default function AdminDriversPage() {
  const [rows, setRows] = useState<Driver[]>([])
  const [operatorNames, setOperatorNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("all")
  const [q, setQ] = useState("")

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("drivers")
      .select("id, full_name, phone, operator_id, vehicle_type, vehicle_plate, license_expiry, is_verified, is_available, is_active, created_at")
      .order("created_at", { ascending: false })
    const list = (data ?? []) as Driver[]
    setRows(list)
    const opIds = Array.from(new Set(list.map(r => r.operator_id).filter(Boolean) as string[]))
    if (opIds.length > 0) {
      const { data: ops } = await supabase.from("operators").select("id, company_name").in("id", opIds)
      const map: Record<string, string> = {}
      ;(ops ?? []).forEach((o: any) => { map[o.id] = o.company_name })
      setOperatorNames(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const filtered = useMemo(() => {
    const ql = q.toLowerCase()
    return rows.filter(r => {
      if (tab === "verified" && !r.is_verified) return false
      if (tab === "pending" && r.is_verified) return false
      if (tab === "suspended" && r.is_active !== false) return false
      if (tab === "expiring") {
        const d = daysUntil(r.license_expiry)
        if (d == null || d > 30 || d < 0) return false
      }
      if (!ql) return true
      return (r.full_name ?? "").toLowerCase().includes(ql) ||
        (r.phone ?? "").toLowerCase().includes(ql) ||
        (r.vehicle_plate ?? "").toLowerCase().includes(ql)
    })
  }, [rows, tab, q])

  async function toggleVerified(d: Driver) {
    const supabase = createClient()
    const { error } = await supabase.from("drivers").update({ is_verified: !d.is_verified }).eq("id", d.id)
    if (error) { toast.error("Update failed: " + error.message); return }
    toast.success(`${d.full_name ?? "Driver"}: ${!d.is_verified ? "verified" : "unverified"}`)
    fetchRows()
  }

  async function toggleActive(d: Driver) {
    const supabase = createClient()
    const nextActive = !(d.is_active ?? true)
    const { error } = await supabase.from("drivers").update({ is_active: nextActive }).eq("id", d.id)
    if (error) { toast.error("Update failed: " + error.message); return }
    toast.success(`${d.full_name ?? "Driver"}: ${nextActive ? "reactivated" : "suspended"}`)
    fetchRows()
  }

  const counts = useMemo(() => {
    const expiring = rows.filter(r => { const d = daysUntil(r.license_expiry); return d != null && d >= 0 && d <= 30 }).length
    return {
      all: rows.length,
      verified: rows.filter(r => r.is_verified).length,
      pending: rows.filter(r => !r.is_verified).length,
      expiring,
      suspended: rows.filter(r => r.is_active === false).length,
    }
  }, [rows])

  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · DRIVERS</div>
          <div className="text-foreground text-[15px] font-medium">Driver pool</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/pending"
            className="h-8 px-3 rounded-md bg-primary/10 text-primary text-[12px] font-medium inline-flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
          >
            Review Pending <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              placeholder="Name, phone, plate"
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
          { value: "pending", label: "Pending", count: counts.pending },
          { value: "expiring", label: "License < 30d", count: counts.expiring },
          { value: "suspended", label: "Suspended", count: counts.suspended },
        ]}
      />

      <Panel>
        {loading ? (
          <Skel rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyRow text="No drivers match." />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Operator", "Vehicle", "Verified", "Available", "License", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-2 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const licDays = daysUntil(r.license_expiry)
                  const licWarning = licDays != null && licDays >= 0 && licDays <= 30
                  const licExpired = licDays != null && licDays < 0
                  return (
                    <tr key={r.id} className="border-t border-border hover:bg-surface-elevated/60 transition-colors">
                      <td className="py-2 px-4">
                        <div className="text-foreground font-medium">{r.full_name ?? "—"}</div>
                        {r.phone && <div className="text-[11px] text-muted font-mono">{r.phone}</div>}
                      </td>
                      <td className="py-2 px-4 text-muted">{r.operator_id ? (operatorNames[r.operator_id] ?? r.operator_id.slice(0, 8)) : "—"}</td>
                      <td className="py-2 px-4">
                        <div className="text-[12px] text-foreground">{r.vehicle_type ?? "—"}</div>
                        <div className="text-[11px] text-muted font-mono">{r.vehicle_plate ?? ""}</div>
                      </td>
                      <td className="py-2 px-4">
                        <Toggle on={r.is_verified} onClick={() => toggleVerified(r)} labelOn="verified" labelOff="pending" />
                      </td>
                      <td className="py-2 px-4">
                        <PillBadge tone={r.is_available ? "primary" : "muted"}>{r.is_available ? "available" : "offline"}</PillBadge>
                      </td>
                      <td className="py-2 px-4 font-mono text-[11px]">
                        {r.license_expiry ? (
                          <span className={`inline-flex items-center gap-1 ${licExpired ? "text-[color:var(--danger)]" : licWarning ? "text-[color:var(--warning)]" : "text-muted"}`}>
                            {(licWarning || licExpired) && <AlertTriangle className="w-3 h-3" />}
                            {fmtDateShort(r.license_expiry)}
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-2 px-4 font-mono text-[11px] text-muted">{fmtTime(r.created_at)} ago</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => toggleActive(r)}
                          title={r.is_active === false ? "Reactivate" : "Suspend"}
                          className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[color:var(--warning-dim)] text-muted hover:text-[color:var(--warning)]"
                        >
                          {r.is_active === false ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
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
