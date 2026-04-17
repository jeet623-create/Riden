"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Phone, MapPin, Truck, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dmc/status-badge"

const mockOperators = [
  { id: 1, company_name: "Bangkok Express Transport", fleet_size: 25, verified_drivers: 18, location: "Bangkok", phone: "+66 2 111 2222", status: "active" as const },
  { id: 2, company_name: "Phuket Premium Vans", fleet_size: 15, verified_drivers: 12, location: "Phuket", phone: "+66 76 333 4444", status: "active" as const },
  { id: 3, company_name: "Chiang Mai Coach Co.", fleet_size: 8, verified_drivers: 6, location: "Chiang Mai", phone: "+66 53 555 6666", status: "pending" as const },
]

type Operator = typeof mockOperators[0]

export default function AdminOperatorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null)
  const filteredOps = mockOperators.filter(op => op.company_name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div><h1 className="text-[22px] font-semibold text-foreground">Operators</h1><p className="text-sm text-muted mt-0.5">{filteredOps.length} providers</p></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div></div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-background">{["Company", "Fleet", "Drivers", "Location", "Status"].map(h => <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>)}</tr></thead>
          <tbody>
            {filteredOps.map((op, i) => (
              <motion.tr key={op.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }} onClick={() => setSelectedOperator(op)} className="border-b border-border cursor-pointer hover:bg-surface-elevated transition-colors">
                <td className="py-3 px-4"><p className="text-sm font-medium text-foreground">{op.company_name}</p><p className="text-[12px] text-muted">{op.phone}</p></td>
                <td className="py-3 px-4"><div className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-muted" /><span className="font-mono text-xs">{op.fleet_size}</span></div></td>
                <td className="py-3 px-4"><div className="flex items-center gap-1.5"><Users className="w4 h-4 text-muted" /><span className="font-mono text-xs">{op.verified_drivers}</span></div></td>
                <td className="py-3 px-4 text-sm text-muted">{op.location}</td>
                <td className="py-3 px-4"><StatusBadge status={op.status} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {selectedOperator && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOperator(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-surface border-l border-border z-50 flex flex-col">
              <div className="h-14 border-b border-border px-5 flex items-center justify-between"><h2 className="text-[15px] font-semibold text-foreground">Operator Details</h2><button onClick={() => setSelectedOperator(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated"><X className="w-4 h-4 text-muted" /></button></div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-start gap-4 mb-6"><div className="w-14 h-14 rounded-xl bg-blue/10 flex items-center justify-center"><Truck className="w-6 h-6 text-blue" /></div><div><h3 className="text-[17px] font-semibold text-foreground">{selectedOperator.company_name}</h3><p className="text-[13px] text-muted mt-0.5">{selectedOperator.location}</p><div className="mt-2"><StatusBadge status={selectedOperator.status} /></div></div></div>
                <div className="space-y-3">
                  {[{ Icon: Truck, label: "Fleet Size", value: `${selectedOperator.fleet_size} vehicles` }, { Icon: Users, label: "Verified Drivers", value: `${selectedOperator.verified_drivers} drivers` }, { Icon: Phone, label: "Phone", value: selectedOperator.phone }, { Icon: MapPin, label: "Location", value: selectedOperator.location }].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 py-2.5 border-b border-border"><Icon className="w-4 h-4 text-muted mt-0.5" /><div><p className="font-mono text-[10px] uppercase text-muted tracking-wider">{label}</p><p className="text-[13px] text-foreground mt-0.5">{value}</p></div></div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-4 flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setSelectedOperator(null)}>Close</Button><Button className="flex-1 bg-primary">Edit Operator</Button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
