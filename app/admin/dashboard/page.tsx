"use client"

export const dynamic = 'force-dynamic'

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Users, 
  Truck, 
  UserCheck, 
  ClipboardList, 
  ArrowRight,
  AlertTriangle,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data - in production from Supabase
const mockStats = {
  totalDmcs: 156,
  activeOperators: 52,
  verifiedDrivers: 234,
  totalBookings: 1847,
  pendingDriverApprovals: 8,
  dmcsWithoutLine: 23,
}

interface StatCardProps {
  label: string
  value: number
  subLabel: string
  icon: React.ElementType
  accentColor: "primary" | "amber" | "green" | "blue" | "purple"
  href?: string
}

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  amber: { bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]", border: "border-[#f59e0b]/20" },
  green: { bg: "bg-[#22c55e]/10", text: "text-[#22c55e]", border: "border-[#22c55e]/20" },
  blue: { bg: "bg-[#3b82f6]/10", text: "text-[#3b82f6]", border: "border-[#3b82f6]/20" },
  purple: { bg: "bg-[#8b5cf6]/10", text: "text-[#8b5cf6]", border: "border-[#8b5cf6]/20" },
}

function AdminStatCard({ label, value, subLabel, icon: Icon, accentColor, href }: StatCardProps) {
  const colors = colorMap[accentColor]
  const content = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-surface border ${colors.border} rounded-xl p-4 ${href ? "cursor-pointer hover:border-primary/40 transition-colors" : ""}`}>
      <div className="flex items-start justify-between mb-3"><div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${colors.text}`} /></div></div>
      <p className="font-mono text-[28px] font-semibold text-foreground mb-0.5">{value}</p>
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      <p className="text-[11px] text-muted mt-0.5">{subLabel}</p>
    </motion.div>
  )
  if (href) return <Link href={href}>{content}</Link>
  return content
}

export default function AdminDashboardPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      {mockStats.pendingDriverApprovals > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.12)] rounded-xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3"><AlertTriangle className="w-[18px] h-[18px] text-[#f59e0b]" /><div><span className="text-[13px] font-medium text-foreground">{mockStats.pendingDriverApprovals} drivers pending approval</span><p className="text-[12px] text-muted">Review and approve new driver registrations</p></div></div>
          <Button variant="ghost" size="sm" className="text-[#f59e0b]" asChild><Link href="/admin/drivers?status=pending">Review drivers <ArrowRight className="w-3 h-3 ml-1" /></Link></Button>
        </motion.div>
      )}
      {mockStats.dmcsWithoutLine > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="w-full bg-[rgba(6,199,85,0.06)] border border-[rgba(6,199,85,0.12)] rounded-xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3"><MessageSquare className="w-[18px] h-[18px] text-[#06C755]" /><div><span className="text-[13px] font-medium text-foreground">{mockStats.dmcsWithoutLine} DMCs have not connected LINE</span><p className="text-[12px] text-muted">They won't receive booking notifications</p></div></div>
          <Button variant="ghost" size="sm" className="text-[#06C755]" asChild><Link href="/admin/dmcs?line=disconnected">View DMCs <ArrowRight className="w-3 h-3 ml-1" /></Link></Button>
        </motion.div>
      )}
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-[22px] font-semibold text-foreground">Dashboard</h1><p className="text-sm text-muted mt-0.5">Platform overview</p></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStatCard label="Total DMCs" value={mockStats.totalDmcs} subLabel="registered companies" icon={Users} accentColor="primary" href="/admin/dmcs" />
        <AdminStatCard label="Active Operators" value={mockStats.activeOperators} subLabel="transport providers" icon={Truck} accentColor="blue" href="/admin/operators" />
        <AdminStatCard label="Verified Drivers" value={mockStats.verifiedDrivers} subLabel="approved drivers" icon={UserCheck} accentColor="green" href="/admin/drivers" />
        <AdminStatCard label="Total Bookings" value={mockStats.totalBookings} subLabel="all time" icon={ClipboardList} accentColor="amber" href="/admin/bookings" />
      </div>
      <div className="bg-surface border border-border rounded-xl p-5"><h2 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Button variant="outline" className="justify-start" asChild><Link href="/admin/drivers?status=pending"><UserCheck className="w4 h-4 mr-2" />Review Pending Drivers</Link></Button><Button variant="outline" className="justify-start" asChild><Link href="/admin/dmcs"><Users className="w4 h-4 mr-2" />Manage DMCs</Link></Button><Button variant="outline" className="justify-start" asChild><Link href="/admin/support"><MessageSquare className="w4 h-4 mr-2" />View Support Tickets</Link></Button></div></div>
    </motion.div>
  )
}
