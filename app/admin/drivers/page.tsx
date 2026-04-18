"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Search, X, Phone, MapPin, User, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dmc/status-badge"

const mockDrivers = [
  { id: 1, name: "Somchai Thongdee", phone: "+66 81 111 2222", operator: "Bangkok Express Transport", license_number: "BKK-12345", status: "active" as const, location: "Bangkok" },
  { id: 2, name: "Nattapong Srisuk", phone: "+66 82 333 4444", operator: "Phuket Premium Vans", license_number: "PKT-67890", status: "pending" as const, location: "Phuket" },
  { id: 3, name: "Wichai Phanich", phone: "+66 83 555 6666", operator: "Chiang Mai Coach Co.", license_number: "CNX-11111", status: "pending" as const, location: "Chiang Mai" },
  { id: 4, name: "Prasert Chaiyasit", phone: "+66 84 777 8888", operator: "Bangkok Express Transport", license_number: "BKK-22222", status: "active" as const, location: "Bangkok" },
]

type Driver = typeof mockDrivers[0]

export default function AdminDriversPage() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get("status")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  const filteredDrivers = mockDrivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) || driver.operator.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "pending" ? driver.status === "pending" : true
    return matchesSearch && matchesStatus
  })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"><div><h1 className="text-[22px] font-semibold text-foreground">Drivers</h1><p className="text-sm text-muted mt-0.5">{filteredDrivers.length} {statusFilter === "pending" ? "pending approval" : "total"}</p></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" /><Input placeholder="Search drivers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div></div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w5full">
          <thead><tr className="bg-background">{["Driver", "Operator", "License", "Location", "Status"].map(h => <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>)}</tr></thead>
          <tbody>
            {filteredDrivers.map((driver, i) => (
              <motion.tr key={driver.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }} onClick={() => setSelectedDriver(driver)} className="border-b border-border cursor-pointer hover:bg-surface-elevated transition-colors">
                <td className="py-3 px-4"><p className="text-sm font-medium text-foreground">{driver.name}</p><p className="text-[12px] text-muted">{driver.phone}</p></td>
                <td className="py-3 px-4 text-sm text-muted">{driver.operator}</td>
                <td className="py-3 px-4 font-mono text-xs text-muted">{driver.license_number}</td>
                <td className="py-3 px-4 text-sm text-muted">{driver.location}</td>
                <td className="py-3 px-4"><StatusBadge status={driver.status} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {selectedDriver && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDriver(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-surface border-l border-border z-50 flex flex-col">
              <div className="h-14 border-b border-border px-5 flex items-center justify-between"><h2 className="text-[15px] font-semibold text-foreground">Driver Details</h2><button onClick={() => setSelectedDriver(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated"><X className="w-4 h-4 text-muted" /></button></div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-start gap-4 mb-6"><div className="w-14 h-14 rounded-xl bg-green/10 flex items-center justify-center"><User className="w-6 h-6 text-green" /></div><div><h3 className="text-[17px] font-semibold text-foreground">{selectedDriver.name}</h3><p className="text-[13px] text-muted mt-0.5">{selectedDriver.operator}</p><div className="mt-2"><StatusBadge status={selectedDriver.status} /></div></div></div>
                <div className="space-y-3">
                  {[{ Icon: Phone, label: "Phone", value: selectedDriver.phone }, { Icon: User, label: "License", value: selectedDriver.license_number }, { Icon: MapPin, label: "Location", value: selectedDriver.location }].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 py-2.5 border-b border-border"><Icon className="w-4 h-4 text-muted mt-0.5" /><div><p className="font-mono text-[10px] uppercase text-muted tracking-wider">{label}</p><p className="text-[13px] text-foreground mt-0.5">{value}</p></div></div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-4">
                {selectedDriver.status === "pending" ? (
                  <div className="flex gap-3"><Button variant="outline" className="flex-1 border-red/30 text-red" onClick={() => { toast.error(`${selectedDriver.name} rejected`); setSelectedDriver(null) }}><XCircle className="w-4 h-4 mr-2" />Reject</Button><Button className="flex-1 bg-green text-white" onClick={() => { toast.success(`${selectedDriver.name} approved`); setSelectedDriver(null) }}><CheckCircle className="w-4 h-4 mr-2" />Approve</Button></div>
                ) : (
                  <div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setSelectedDriver(null)}>Close</Button><Button className="flex-1 bg-primary">Edit Driver</Button></div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
