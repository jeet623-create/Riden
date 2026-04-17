"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, MessageSquare, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dmc/status-badge"

const mockTickets = [
  { id: "TK-001", subject: "Cannot connect LINE account", dmc: "Siam Tours Co., Ltd.", status: "open" as const, priority: "high", created_at: "2024-01-20T10:30:00", last_reply: null },
  { id: "TK-002", subject: "Booking notification not received", dmc: "Amazing Thailand DMC", status: "replied" as const, priority: "medium", created_at: "2024-01-19T14:00:00", last_reply: "2024-01-19T16:30:00" },
  { id: "TK-003", subject: "How to add multiple vehicles?", dmc: "Golden Triangle Travel", status: "closed" as const, priority: "low", created_at: "2024-01-18T09:00:00", last_reply: "2024-01-18T11:00:00" },
]

type Ticket = typeof mockTickets[0]
const priorityColors = { high: "text-red bg-red-dim", medium: "text-amber bg-amber-dim", low: "text-muted bg-surface-elevated" }
function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }

export default function AdminSupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const filtered = mockTickets.filter(t => t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.dmc.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div><h1 className="text-[22px] font-semibold text-foreground">Support Tickets</h1><p className="text-sm text-muted mt-0.5">{filtered.length} tickets</p></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" /><Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div></div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w5full">
          <thead><tr className="bg-background">{["Ticket", "DMC", "Priority", "Status", "Created"].map(h => <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h</th>)}</tr></thead>
          <tbody>
            {filtered.map((t, i) => (
              <motion.tr key={t.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }} onClick={() => setSelectedTicket(t)} className="border-b border-border cursor-pointer hover:bg-surface-elevated transition-colors">
                <td className="py-3 px-4"><p className="text-sm font-medium text-foreground">{t.subject}</p><p className="text-[12px] text-muted font-mono">{t.id}</p></td>
                <td className="py-3 px-4 text-sm text-muted">{t.dmc}</td>
                <td className="py-3 px-4"><span className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${priorityColors[t.priority as keyof typeof priorityColors]}`}>{t.priority}</span></td>
                <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                <td className="py-3 px-4 font-mono text-xs text-muted">{fmtDate(t.created_at)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-surface border-l border-border z-50 flex flex-col">
              <div className="h-14 border-b border-border px-5 flex items-center justify-between"><h2 className="text-[15px] font-semibold text-foreground">Ticket Details</h2><button onClick={() => setSelectedTicket(null)} className="w8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated"><X className="w-4 h-4 text-muted" /></button></div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-start gap-4 mb-6"><div className="w-14 h-14 rounded-xl bg-amber/10 flex items-center justify-center"><MessageSquare className="w-6 h-6 text-amber" /></div><div><h3 className="text-[17px] font-semibold text-foreground">{selectedTicket.subject}</h3><p className="text-[13px] text-muted mt-0.5">{selectedTicket.dmc}</p><div className="flex items-center gap-2 mt-2"><StatusBadge status={selectedTicket.status} /><span className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${priorityColors[selectedTicket.priority as keyof typeof priorityColors]}`}>{selectedTicket.priority}</span></div></div></div>
                <div className="space-y-3"><div className="flex items-start gap-3 py-2.5 border-b border-border"><Clock className="w-4 h-4 text-muted mt-0.5" /><div><p className="font-mono text-[10px] uppercase text-muted tracking-wider">Created</p><p className="text-[13px] text-foreground mt-0.5">{fmtDate(selectedTicket.created_at)}</p></div></div></div>
              </div>
              <div className="border-t border-border p-4 flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setSelectedTicket(null)}>Close</Button><Button className="flex-1 bg-primary">Reply</Button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
