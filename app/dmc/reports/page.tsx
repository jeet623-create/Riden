"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Download, ClipboardList, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/use-language"

interface StatusBreakdown { status: string; label: string; count: number; color: string }

const mockData: StatusBreakdown[] = [
  { status: "confirmed", label: "Confirmed", count: 18, color: "bg-primary" },
  { status: "completed", label: "Completed", count: 12, color: "bg-green" },
  { status: "pending", label: "Pending", count: 8, color: "bg-amber" },
  { status: "in_progress", label: "In Progress", count: 5, color: "bg-blue" },
  { status: "cancelled", label: "Cancelled", count: 2, color: "bg-red" },
]

const totalBookings = mockData.reduce((sum, d) => sum + d.count, 0)

function AnimatedBar({ width, color, delay }: { width: number; color: string; delay: number }) {
  const [animatedWidth, setAnimatedWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(width), delay * 100)
    return () => clearTimeout(timer)
  }, [width, delay])
  return (
    <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${animatedWidth}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className={`h-full ${color} rounded-full`} />
    </div>
  )
}

function AnimatedNumber({ value, delay }: { value: number; delay: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const frameRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 800
      const startTime = performance.now()
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        setDisplayValue(Math.floor(value * (1 - Math.pow(1 - progress, 3))))
        if (progress < 1) frameRef.current = requestAnimationFrame(animate)
      }
      frameRef.current = requestAnimationFrame(animate)
    }, delay * 100)
    return () => { clearTimeout(timer); if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [value, delay])
  return <span>{displayValue}</span>
}

export default function ReportsPage() {
  const { t } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
  })
  const monthLabel = new Date(selectedMonth + "-01").toLocaleString("en-US", { month: "long", year: "numeric" })

  const handleExportCSV = () => {
    const csv = "Status,Count\n" + mockData.map(d => `${d.label},${d.count}`).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `riden-report-${selectedMonth}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-semibold text-foreground">{t({ en: "Reports", th: "รายงาน", zh: "报告" })}</h1>
          <span className="text-[13px] text-muted">Monthly summary — {monthLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-[160px] h-9 bg-surface" />
          <Button variant="secondary" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" />CSV</Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: totalBookings, icon: ClipboardList, color: "border-l-primary" },
          { label: "Confirmed", value: 18, icon: CheckCircle, color: "border-l-primary" },
          { label: "Pending", value: 8, icon: Clock, color: "border-l-amber" },
          { label: "Completed", value: 12, icon: CheckCircle, color: "border-l-green" },
        ].map((stat, index) => (
          <div key={stat.label} className={`bg-surface border border-border rounded-xl p-5 border-l-[3px] ${stat.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase text-muted">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-muted/60" />
            </div>
            <div className="text-[28px] font-semibold text-foreground"><AnimatedNumber value={stat.value} delay={index} /></div>
          </div>
        ))}
      </div>
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Booking Breakdown</h2>
            <p className="text-[12px] text-muted mt-0.5">Status distribution</p>
          </div>
        </div>
        <div className="space-y-4">
          {mockData.map((item, index) => (
            <div key={item.status} className="flex items-center gap-4">
              <span className="w-28 text-[12px] font-medium text-foreground">{item.label}</span>
              <AnimatedBar width={(item.count / totalBookings) * 100} color={item.color} delay={index} />
              <span className="font-mono text-[12px] text-muted w-8 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}