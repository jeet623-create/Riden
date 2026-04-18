
"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Search, X, Mail, Phone, MapPin, CreditCard, Building2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/dmc/status-badge"
import { supabase } from "@/lib/supabase"

type DMC = {
  id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  city: string
  subscription_plan: string
  subscription_status: string
  line_user_id: string | null
  created_at: string
}

function DmcDetailDrawer({ dmc, onClose }: { dmc: DMC | null; onClose: () => void }) {
  if (!dmc) return null
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-surface border-l border-border z-50 flex flex-col">
        <div className="h-14 border-b border-border px-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-foreground">DMC Details</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated"><X className="w-4 h-4 text-muted" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-primary" /></div>
            <div>
              <h3 className="text-[17px] font-semibold text-foreground">{dmc.company_name}</h3>
              <p className="text-[13px] text-muted mt-0.5">{dmc.contact_person}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={dmc.subscription_status as any} />
                <span className="text-[11px] font-mono text-muted uppercase">{dmc.subscription_plan}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { Icon: Mail, label: "Email", value: dmc.email },
              { Icon: Phone, label: "Phone", value: dmc.phone || "—" },
              { Icon: MapPin, label: "City", value: dmc.city || "—" },
              { Icon: CreditCard, label: "Plan", value: dmc.subscription_plan },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 py-2.5 border-b border-border">
                <Icon className="w-4 h-4 text-muted mt-0.5" />
                <div>
                  <p className="font-mono text-[10px] uppercase text-muted tracking-wider">{label}</p>
                  <p className="text-[13px] text-foreground mt-0.5">{value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-4 h-4 mt-0.5 flex items-center justify-center">
                <div className="w-4 h-4 bg-[#06C755] rounded flex items-center justify-center"><span className="text-white text-[5px] font-bold">LINE</span></div>
              </div>
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase text-muted tracking-wider">LINE</p>
                <div className="flex items-center justify-between mt-1">
                  {dmc.line_user_id ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(6,199,85,0.1)] text-[#06C755] font-mono text-[11px]"><span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />Connected</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-muted">Not connected</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted" onClick={() => toast.success(`Reminder sent to ${dmc.company_name}`)}><Bell className="w-3 h-3 mr-1" />Remind</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
          <Button className="flex-1 bg-primary">Edit DMC</Button>
        </div>
      </motion.div>
    </>
  )
}

function AdminDmcsPageInner() {
  const searchParams = useSearchParams()
  const lineFilter = searchParams.get("line")
  const [searchQuery, setSearchQuery] = useState("")
  const [dmcs, setDmcs] = useState<DMC[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDmc, setSelectedDmc] = useState<DMC | null>(null)

  useEffect(() => {
    async function fetchDmcs() {
      let query = supabase.from("dmc_users").select("id,company_name,contact_person,email,phone,city,subscription_plan,subscription_status,line_user_id,created_at").order("created_at", { ascending: false })
      if (lineFilter === "disconnected") query = query.is("line_user_id", null)
      const { data } = await query
      setDmcs(data || [])
      setLoading(false)
    }
    fetchDmcs()
  }, [lineFilter])

  const filtered = dmcs.filter(d =>
    d.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">DMCs</h1>
          <p className="text-sm text-muted mt-0.5">{loading ? "Loading..." : `${filtered.length} ${lineFilter === "disconnected" ? "without LINE" : "total"}`}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input placeholder="Search DMCs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Company", "Email", "Country", "Plan", "LINE", "Status", "Joined"].map(h => (
                <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>
              ))}
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="py-3 px-4"><div className="h-4 bg-surface-elevated rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map((dmc, i) => (
              <motion.tr key={dmc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                onClick={() => setSelectedDmc(dmc)} className="border-b border-border cursor-pointer hover:bg-surface-elevated transition-colors">
                <td className="py-3 px-4">
                  <p className="text-sm font-medium text-foreground">{dmc.company_name}</p>
                  <p className="text-[12px] text-muted">{dmc.contact_person}</p>
                </td>
                <td className="py-3 px-4 text-sm text-muted">{dmc.email}</td>
                <td className="py-3 px-4 text-sm text-muted">{dmc.city || "—"}</td>
                <td className="py-3 px-4 font-mono text-xs text-muted uppercase">{dmc.subscription_plan}</td>
                <td className="py-3 px-4">
                  {dmc.line_user_id
                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(6,199,85,0.1)] text-[#06C755] font-mono text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />Connected</span>
                    : <span className="text-[12px] text-muted">—</span>}
                </td>
                <td className="py-3 px-4"><StatusBadge status={dmc.subscription_status as any} /></td>
                <td className="py-3 px-4 font-mono text-xs text-muted">{new Date(dmc.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-4"><span className="text-xs text-primary cursor-pointer hover:underline">Details</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedDmc && <DmcDetailDrawer dmc={selectedDmc} onClose={() => setSelectedDmc(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}

export default function AdminDmcsPage() {
  return <Suspense><AdminDmcsPageInner /></Suspense>
}
