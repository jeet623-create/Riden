"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/dmc/status-badge"
import { useLanguage } from "@/hooks/use-language"

type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"

interface Booking {
  id: string; ref: string; clientName: string; days: number; type: string; status: BookingStatus; createdAt: string
}

const mockBookings: Booking[] = [
  { id: "1", ref: "BK-2024-0047", clientName: "Wang Family", days: 3, type: "Day Tour", status: "confirmed", createdAt: "2024-01-15" },
  { id: "2", ref: "BK-2024-0046", clientName: "ABC Corporation", days: 5, type: "Airport Transfer", status: "pending", createdAt: "2024-01-14" },
  { id: "3", ref: "BK-2024-0045", clientName: "Smith Group", days: 2, type: "Sightseeing", status: "in_progress", createdAt: "2024-01-13" },
  { id: "4", ref: "BK-2024-0044", clientName: "Chen Tours", days: 7, type: "Custom", status: "completed", createdAt: "2024-01-12" },
  { id: "5", ref: "BK-2024-0043", clientName: "Tanaka Inc", days: 1, type: "Airport Transfer", status: "cancelled", createdAt: "2024-01-11" },
  { id: "6", ref: "BK-2024-0042", clientName: "Kim Family", days: 4, type: "Day Tour", status: "confirmed", createdAt: "2024-01-10" },
  { id: "7", ref: "BK-2024-0041", clientName: "Nguyen Group", days: 2, type: "Hotel Transfer", status: "pending", createdAt: "2024-01-09" },
]

const statusFilters: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export default function BookingsPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.ref.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-semibold text-foreground">{t({ en: "Bookings", th: "การจอง", zh: "预订" })}</h1>
          <span className="text-[13px] text-muted">{filteredBookings.length} results</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search bookings..." className="pl-9 w-[200px] h-9 bg-surface" />
          </div>
          <Button asChild><Link href="/dmc/bookings/new"><Plus className="w-4 h-4 mr-2" />New Booking</Link></Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {statusFilters.map((filter) => (
          <button key={filter.value} onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${statusFilter === filter.value ? "bg-primary-dim text-primary border border-primary/20" : "bg-surface border border-border text-muted hover:text-foreground"}`}>
            {filter.label}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="bg-background grid grid-cols-[100px_1fr_80px_120px_100px_80px] gap-4 px-4 py-3 border-b border-border">
          {["Ref","Client","Days","Type","Status","Date"].map(h => (
            <div key={h} className="font-mono text-[10px] uppercase text-muted tracking-wider">{h}</div>
          ))}
        </div>
        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center"><p className="text-[14px] font-medium text-foreground">No bookings found</p></div>
        ) : (
          filteredBookings.map((booking, index) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
              className="grid grid-cols-[100px_1fr_80px_120px_100px_80px] gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors cursor-pointer table-row-hover">
              <div className="font-mono text-[11px] text-primary">{booking.ref}</div>
              <div className="text-[13px] font-medium text-foreground truncate">{booking.clientName}</div>
              <div className="font-mono text-[12px] text-muted">{booking.days}d</div>
              <div className="text-[12px] text-muted truncate">{booking.type}</div>
              <div><StatusBadge status={booking.status} showPulse={booking.status === "in_progress"} /></div>
              <div className="font-mono text-[11px] text-muted">{booking.createdAt.slice(5)}</div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}