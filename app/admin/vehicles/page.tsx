"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { Search, RefreshCcw, X as XIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Panel, FilterTabs, Skel, EmptyRow, PillBadge, fmtTime } from "@/components/admin/console"

type Vehicle = {
  id: string
  operator_id: string | null
  type: string | null
  brand_model: string | null
  plate: string | null
  seats: number | null
  color: string | null
  photo_url: string | null
  status: string | null
  is_active: boolean | null
  created_at: string
}

const TYPE_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sedan", label: "Sedan" },
  { value: "van_9", label: "Van 9" },
  { value: "van_12", label: "Van 12" },
  { value: "minibus_15", label: "Minibus 15" },
  { value: "minibus_20", label: "Minibus 20" },
  { value: "coach_30", label: "Coach 30" },
  { value: "coach_40plus", label: "Coach 40+" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup" },
]

export default function AdminVehiclesPage() {
  const [rows, setRows] = useState<Vehicle[]>([])
  const [operatorNames, setOperatorNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<string>("all")
  const [q, setQ] = useState("")
  const [zoom, setZoom] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("vehicles")
      .select("id, operator_id, type, brand_model, plate, seats, color, photo_url, status, is_active, created_at")
      .order("created_at", { ascending: false })
    const list = (data ?? []) as Vehicle[]
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

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: rows.length }
    for (const t of TYPE_TABS) if (t.value !== "all") m[t.value] = rows.filter(r => r.type === t.value).length
    return m
  }, [rows])

  const filtered = useMemo(() => {
    const ql = q.toLowerCase()
    return rows.filter(r => {
      if (tab !== "all" && r.type !== tab) return false
      if (!ql) return true
      return (r.plate ?? "").toLowerCase().includes(ql) ||
        (r.brand_model ?? "").toLowerCase().includes(ql) ||
        (r.color ?? "").toLowerCase().includes(ql)
    })
  }, [rows, tab, q])

  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · VEHICLES</div>
          <div className="text-foreground text-[15px] font-medium">Fleet vehicles</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              placeholder="Plate, brand, color"
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

      <FilterTabs
        active={tab}
        onChange={setTab}
        tabs={TYPE_TABS.map(t => ({ value: t.value, label: t.label, count: counts[t.value] ?? 0 }))}
      />

      <Panel>
        {loading ? (
          <Skel rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyRow text="No vehicles match." />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full min-w-[880px]">
              <thead>
                <tr className="border-b border-border">
                  {["Photo", "Plate", "Type", "Brand/Model", "Seats", "Color", "Operator", "Status", "Added"].map(h => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-2 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-t border-border hover:bg-surface-elevated/60 transition-colors">
                    <td className="py-2 px-4">
                      {r.photo_url ? (
                        <button onClick={() => setZoom(r.photo_url)} className="w-12 h-9 rounded-md overflow-hidden border border-border bg-surface-elevated">
                          <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-12 h-9 rounded-md border border-dashed border-border bg-surface-elevated" />
                      )}
                    </td>
                    <td className="py-2 px-4 font-mono text-[12px] text-foreground">{r.plate ?? "—"}</td>
                    <td className="py-2 px-4"><PillBadge>{r.type ?? "—"}</PillBadge></td>
                    <td className="py-2 px-4 text-foreground">{r.brand_model ?? "—"}</td>
                    <td className="py-2 px-4 font-mono text-[12px] text-muted">{r.seats ?? "—"}</td>
                    <td className="py-2 px-4 text-muted">{r.color ?? "—"}</td>
                    <td className="py-2 px-4 text-muted">{r.operator_id ? (operatorNames[r.operator_id] ?? r.operator_id.slice(0, 8)) : "—"}</td>
                    <td className="py-2 px-4"><PillBadge tone={r.status === "active" ? "primary" : "muted"}>{r.status ?? "—"}</PillBadge></td>
                    <td className="py-2 px-4 font-mono text-[11px] text-muted">{fmtTime(r.created_at)} ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {zoom && (
        <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6 cursor-zoom-out">
          <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1.5" onClick={(e) => { e.stopPropagation(); setZoom(null) }}>
            <XIcon className="w-4 h-4" />
          </button>
          <img src={zoom} alt="" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </div>
  )
}
