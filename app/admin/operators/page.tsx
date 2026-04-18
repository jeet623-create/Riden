
"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Phone, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

type Operator = {
  id: string
  company_name: string
  contact_name: string
  phone: string
  base_location: string
  is_also_driver: boolean
  is_verified: boolean
  status: string
  rating: number
  total_trips: number
  created_at: string
}

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selected, setSelected] = useState<Operator | null>(null)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from("operators").select("id,company_name,contact_name,phone,base_location,is_also_driver,is_verified,status,rating,total_trips,created_at").order("created_at", { ascending: false })
      setOperators(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = operators.filter(o =>
    o.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.contact_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">Operators</h1>
          <p className="text-sm text-muted mt-0.5">{loading ? "Loading..." : `${filtered.length} fleet owners registered`}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input placeholder="Search operators..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Company", "Phone", "Base", "Also Driver", "Verified", "Status", "Joined"].map(h => (
                <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>
              ))}
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="py-3 px-4"><div className="h-4 bg-surface-elevated rounded animate-pulse" /></td>
                ))}
              </tr>
            )) : filtered.map((op, i) => (
              <motion.tr key={op.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                onClick={() => setSelected(op)} className="border-b border-border cursor-pointer hover:bg-surface-elevated transition-colors">
                <td className="py-3 px-4">
                  <p className="text-sm font-medium text-foreground">{op.company_name}</p>
                  <p className="text-[12px] text-muted">{op.contact_name}</p>
                </td>
                <td className="py-3 px-4 text-sm text-muted">{op.phone}</td>
                <td className="py-3 px-4 text-sm text-muted">{op.base_location}</td>
                <td className="py-3 px-4 text-sm">{op.is_also_driver ? <span className="text-primary">✓</span> : <span className="text-muted">—</span>}</td>
                <td className="py-3 px-4 text-sm">{op.is_verified ? <span className="text-primary">✓</span> : <span className="text-muted">—</span>}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${op.status === "active" ? "bg-primary/10 text-primary" : "bg-surface-elevated text-muted"}`}>{op.status}</span>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-muted">{new Date(op.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-4"><span className="text-xs text-primary cursor-pointer hover:underline">Details</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-surface border-l border-border z-50 flex flex-col">
              <div className="h-14 border-b border-border px-5 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-foreground">Operator Details</h2>
                <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated"><X className="w-4 h-4 text-muted" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className="text-[17px] font-semibold text-foreground">{selected.company_name}</h3>
                <p className="text-[13px] text-muted mb-4">{selected.contact_name}</p>
                <div className="space-y-3">
                  {[
                    { label: "Phone", value: selected.phone },
                    { label: "Base", value: selected.base_location },
                    { label: "Total Trips", value: selected.total_trips?.toString() || "0" },
                    { label: "Rating", value: selected.rating ? `${Number(selected.rating).toFixed(1)} ★` : "—" },
                    { label: "Status", value: selected.status },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted">{r.label}</span>
                      <span className="text-sm text-foreground font-medium">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-4 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                <Button className="flex-1 bg-primary">Edit</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
