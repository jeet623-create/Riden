"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/dmc/status-badge"
import { createClient } from "@/lib/supabase/client"

type Booking = {
  id: string
  booking_ref: string
  client_name: string
  total_days: number
  status: string
  created_at: string
  vehicle_type?: string
  preferred_operator_id?: string
}

const STATUS_TABS = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled"] as const

export default function DmcBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dmcId, setDmcId] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setDmcId(user.id)
      else setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (!dmcId) return
    async function fetchBookings() {
      const supabase = createClient()
      let query = supabase.from("bookings")
        .select("id,booking_ref,client_name,total_days,status,created_at")
        .eq("dmc_id", dmcId)
        .order("created_at", { ascending: false })
      if (activeTab !== "all") query = query.eq("status", activeTab)
      const { data } = await query
      setBookings(data || [])
      setLoading(false)
    }
    setLoading(true)
    fetchBookings()
  }, [dmcId, activeTab])

  const filtered = bookings.filter(b =>
    b.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.booking_ref?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">Bookings</h1>
          <p className="text-sm text-muted mt-0.5">{loading ? "Loading..." : `${filtered.length} total`}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Link href="/dmc/bookings/new">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium whitespace-nowrap hover:bg-primary/90 transition-colors">
              + New Booking
            </button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === tab ? "bg-primary text-white" : "bg-surface border border-border text-muted hover:text-foreground"}`}>
            {tab === "all" ? "All" : tab.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Ref", "Client", "Days", "Status", "Date"].map(h => (
                <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="py-3 px-4"><div className="h-4 bg-surface-elevated rounded animate-pulse" /></td>
                ))}
              </tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-muted">No bookings found</td></tr>
            ) : filtered.map((b, i) => (
              <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                className="border-b border-border hover:bg-surface-elevated transition-colors cursor-pointer">
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-primary">{b.booking_ref}</span>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-foreground">{b.client_name}</td>
                <td className="py-3 px-4 text-sm text-muted">{b.total_days}d</td>
                <td className="py-3 px-4"><StatusBadge status={b.status as any} /></td>
                <td className="py-3 px-4 font-mono text-xs text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
