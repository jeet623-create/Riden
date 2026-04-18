"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useSearchParams, Suspense } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Search, X, Mail, Phone, MapPin, Calendar, CreditCard, Building2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/dmc/status-badge"

const mockDmcs = [
  { id: 1, company_name: "Siam Tours Co., Ltd.", contact_person: "Somchai Wongsakul", email: "contact@siamtours.com", phone: "+66 2 123 4567", location: "Bangkok", subscription_plan: "professional", subscription_status: "active", line_user_id: "U1234567890", created_at: "2024-01-15" },
  { id: 2, company_name: "Amazing Thailand DMC", contact_person: "Nattapong Srisuk", email: "info@amazingthaidmc.com", phone: "+66 2 987 6543", location: "Phuket", subscription_plan: "basic", subscription_status: "active", line_user_id: null, created_at: "2024-01-10" },
  { id: 3, company_name: "Golden Triangle Travel", contact_person: "Wichai Phanich", email: "book@goldentriangle.co.th", phone: "+66 53 111 2222", location: "Chiang Mai", subscription_plan: "trial", subscription_status: "trial", line_user_id: null, created_at: "2024-01-20" },
  { id: 4, company_name: "Andaman Adventures", contact_person: "Prasert Chaiyasit", email: "hello@andamanadv.com", phone: "+66 76 333 4444", location: "Krabi", subscription_plan: "professional", subscription_status: "expired", line_user_id: "U0987654321", created_at: "2023-12-01" },
]

type DMC = typeof mockDmcs[0]

function DmcDetailDrawer({ dmc, onClose, onSendLineReminder }: { dmc: DMC | null; onClose: () => void; onSendLineReminder: (id: number) => void }) {
  if (!dmc) return null
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-surface border-l border-border z-50 flex flex-col">
        <div className="h-14 border-b border-border px-5 flex items-center justify-between flex-shrink-0"><h2 className="text-[15px] font-semibold text-foreground">DMC Details</h2><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated"><X className="w-4 h-4 text-muted" /></button></div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start gap-4 mb-6"><div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-primary" /></div><div><h3 className="text-[17px] font-semibold text-foreground">{dmc.company_name}</h3><p className="text-[13px] text-muted mt-0.5">{dmc.contact_person}</p><div className="flex items-center gap-2 mt-2"><StatusBadge status={dmc.subscription_status as any} /><span className="text-[11px] font-mono text-muted uppercase">{dmc.subscription_plan}</span></div></div></div>
          <div className="space-y-3">
            {[{ Icon: Mail, label: "Email", value: dmc.email }, { Icon: Phone, label: "Phone", value: dmc.phone }, { Icon: MapPin, label: "Location", value: dmc.location }, { Icon: CreditCard, label: "Subscription", value: dmc.subscription_plan }].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 py-2.5 border-b border-border"><Icon className="w4 h-4 text-muted mt-0.5" /><div><p className="font-mono text-[10px] uppercase text-muted tracking-wider">{label}</p><p className="text-[13px] text-foreground mt-0.5">{value}</p></div></div>
            ))}
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <div className="w-4 h-4 mt-0.5 flex items-center justify-center"><div className="w-4 h-4 bg-[#06C755] rounded flex items-center justify-center"><span className="text-white text-[5px] font-bold">LINE</span></div></div>
              <div className="flex-1"><p className="font-mono text-[10px] uppercase text-muted tracking-wider">LINE</p>
                <div className="flex items-center justify-between mt-1">
                  {dmc.line_user_id ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(6,199,85,0.1)] text-[#06C755] font-mono text-[11px]"><span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />LINE Connected</span>
                  ) : (
                    <div className="flex items-center gap-2"><span className="text-[13px] text-muted">Not connected</span><Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted" onClick={() => onSendLineReminder(dmc.id)}><Bell className="w-3 h-3 mr-1" />Remind</Button></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-4 flex gap-3"><Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button><Button className="flex-1 bg-primary">Edit DMC</Button></div>
      </motion.div>
    </>
  )
}

function AdminDmcsPageInner() {
  const searchParams = useSearchParams()
  const lineFilter = searchParams.get("line")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDmc, setSelectedDmc] = useState<DMC | null>(null)

  const filteredDmcs = mockDmcs.filter(dmc => {
    const matchesSearch = dmc.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || dmc.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLine = lineFilter === "disconnected" ? !dmc.line_user_id : true
    return matchesSearch && matchesLine
  })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div><h1 className="text-[22px] font-semibold text-foreground">DMCs</h1><p className="text-sm text-muted mt-0.5">{filteredDmcs.length} {lineFilter === "disconnected" ? "without LINE" : "total"}</p></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" /><Input placeholder="Search DMCs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div></div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-background">{["Company", "Location", "Plan", "Status", "LINE"].map(h => <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>)}</tr></thead>
          <tbody>
            {filteredDmcs.map((dmc, i) => (
              <motion.tr key={dmc.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }} onClick={() => setSelectedDmc(dmc)} className="border-b border-border cursor-pointer hover:bg-surface-elevated transition-colors">
                <td className="py-3 px-4"><p className="text-sm font-medium text-foreground">{dmc.company_name}</p><p className="text-[12px] text-muted">{dmc.email}</p></td>
                <td className="py-3 px-4 text-sm text-muted">{dmc.location}</td>
                <td className="py-3 px-4 font-mono text-xs text-muted uppercase">{dmc.subscription_plan}</td>
                <td className="py-3 px-4"><StatusBadge status={dmc.subscription_status as any} /></td>
                <td className="py-3 px-4">{dmc.line_user_id ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(6,199,85,0.1)] text-[#06C755] font-mono text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />Connected</span> : <span className="text-[12px] text-muted">—</span>}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {selectedDmc && <DmcDetailDrawer dmc={selectedDmc} onClose={() => setSelectedDmc(null)} onSendLineReminder={(id) => { const d = mockDmcs.find(d => d.id === id); if (d) toast.success(`Reminder sent to ${d.company_name}`) }} />}
      </AnimatePresence>
    </motion.div>
  )
}


export default function AdminDmcsPage() {
  return <Suspense><AdminDmcsPageInner /></Suspense>
}
