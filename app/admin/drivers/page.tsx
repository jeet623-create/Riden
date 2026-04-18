
"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

type Driver = {
  id: string
  full_name: string
  phone: string
  vehicle_type: string
  vehicle_plate: string
  vehicle_brand_model: string
  base_location: string
  is_verified: boolean
  is_active: boolean
  license_number: string
  license_expiry: string
  created_at: string
}

function AdminDriversPageInner() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get("status") || "pending"
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "inactive">(
    statusFilter === "active" ? "active" : statusFilter === "inactive" ? "inactive" : "pending"
  )

  useEffect(() => {
    async function fetchDrivers() {
      let query = supabase.from("drivers").select("id,full_name,phone,vehicle_type,vehicle_plate,vehicle_brand_model,base_location,is_verified,is_active,license_number,license_expiry,created_at").order("created_at", { ascending: false })
      if (activeTab === "pending") query = query.eq("is_verified", false).eq("is_active", true)
      else if (activeTab === "active") query = query.eq("is_verified", true).eq("is_active", true)
      else query = query.eq("is_active", false)
      const { data } = await query
      setDrivers(data || [])
      setLoading(false)
    }
    setLoading(true)
    fetchDrivers()
  }, [activeTab])

  const filtered = drivers.filter(d =>
    d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.vehicle_plate || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function approveDriver(id: string, name: string) {
    await supabase.from("drivers").update({ is_verified: true }).eq("id", id)
    setDrivers(prev => prev.filter(d => d.id !== id))
    toast.success(`${name} approved`)
  }

  async function rejectDriver(id: string, name: string) {
    await supabase.from("drivers").update({ is_active: false }).eq("id", id)
    setDrivers(prev => prev.filter(d => d.id !== id))
    toast.error(`${name} rejected`)
  }

  const tabs = [
    { key: "pending", label: "Pending" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ] as const

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">Driver Verification</h1>
          {filtered.length > 0 && activeTab === "pending" && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-mono text-[11px]">{filtered.length} PENDING</span>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input placeholder="Search drivers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === t.key ? "bg-primary text-white" : "bg-surface border border-border text-muted hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-surface border border-border rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">No {activeTab} drivers</div>
      ) : activeTab === "pending" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="relative h-32 bg-surface-elevated flex items-center justify-center">
                <span className="text-muted text-sm">No photo uploaded</span>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-mono text-[10px] uppercase">Review</div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface text-muted font-mono text-[10px]">Pending</div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-foreground">{d.full_name}</p>
                <p className="text-[12px] text-muted mt-0.5">{d.vehicle_type} · {d.vehicle_plate}</p>
                <p className="text-[12px] text-muted">{d.phone} · {d.base_location}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 bg-primary text-white" onClick={() => approveDriver(d.id, d.full_name)}>Approve</Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => rejectDriver(d.id, d.full_name)}>Reject</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-background">
                {["Name", "Vehicle", "Plate", "Base", "License Expiry"].map(h => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 * i }}
                  className="border-b border-border hover:bg-surface-elevated transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{d.full_name}</td>
                  <td className="py-3 px-4 text-sm text-muted">{d.vehicle_type} · {d.vehicle_brand_model}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted">{d.vehicle_plate}</td>
                  <td className="py-3 px-4 text-sm text-muted">{d.base_location}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted">{d.license_expiry || "—"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}

export default function AdminDriversPage() {
  return <Suspense><AdminDriversPageInner /></Suspense>
}
