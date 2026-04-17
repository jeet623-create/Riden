"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"

type TripStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"

interface Trip {
  id: string
  clientName: string
  pickupTime: string
  status: TripStatus
  date: string
}

const generateMockTrips = (year: number, month: number): Trip[] => {
  const trips: Trip[] = []
  const statuses: TripStatus[] = ["pending", "confirmed", "in_progress", "completed"]
  const clients = ["Wang Family", "ABC Corp", "Smith Group", "Chen Tours", "Tanaka Inc"]
  for (let i = 0; i < 18; i++) {
    const day = Math.floor(Math.random() * 28) + 1
    const hour = Math.floor(Math.random() * 10) + 6
    trips.push({
      id: `trip-${i}`,
      clientName: clients[Math.floor(Math.random() * clients.length)],
      pickupTime: `${hour.toString().padStart(2, "0")}:00`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    })
  }
  return trips
}

const statusColors: Record<TripStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-amber/15", text: "text-amber" },
  confirmed: { bg: "bg-primary/15", text: "text-primary" },
  in_progress: { bg: "bg-green/15", text: "text-green" },
  completed: { bg: "bg-muted/15", text: "text-muted" },
  cancelled: { bg: "bg-red/15", text: "text-red" },
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const trips = useMemo(() => generateMockTrips(year, month), [year, month])
  const monthName = currentDate.toLocaleString("en-US", { month: "long" })
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const today = new Date()
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const getTripsForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    return trips.filter(t => t.date === dateStr).slice(0, 3)
  }

  const getTripCountForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    return trips.filter(t => t.date === dateStr).length
  }

  const calendarCells = []
  for (let i = firstDayOfMonth - 1; i >= 0; i--) calendarCells.push({ day: daysInPrevMonth - i, isPadding: true })
  for (let i = 1; i <= daysInMonth; i++) calendarCells.push({ day: i, isPadding: false })
  const remaining = 42 - calendarCells.length
  for (let i = 1; i <= remaining; i++) calendarCells.push({ day: i, isPadding: true })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-semibold text-foreground">{t({ en: "Calendar", th: "ปฏิทิน", zh: "日历" })}</h1>
          <span className="text-[13px] text-muted">{monthName} {year}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center font-mono text-[11px] uppercase text-muted tracking-wider">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarCells.map((cell, index) => {
            const dayTrips = !cell.isPadding ? getTripsForDay(cell.day) : []
            const totalTrips = !cell.isPadding ? getTripCountForDay(cell.day) : 0
            const extraTrips = totalTrips - 3
            return (
              <div key={index} className={`min-h-[100px] p-2 border-r border-b border-border last:border-r-0 ${cell.isPadding ? "bg-black/[0.03] dark:bg-black/15" : "hover:bg-surface-elevated transition-colors"}`}>
                <div className={`font-mono text-[12px] mb-1 ${cell.isPadding ? "text-muted/50" : isToday(cell.day) ? "text-primary font-bold" : "text-muted"}`}>{cell.day}</div>
                {!cell.isPadding && (
                  <div className="space-y-0.5">
                    {dayTrips.map((trip) => (
                      <div key={trip.id} className={`px-1.5 py-0.5 rounded-sm text-[10px] truncate cursor-pointer ${statusColors[trip.status].bg} ${statusColors[trip.status].text}`} title={`${trip.pickupTime} - ${trip.clientName}`}>
                        {trip.pickupTime} {trip.clientName}
                      </div>
                    ))}
                    {extraTrips > 0 && <div className="text-[10px] text-muted pl-1">+{extraTrips} more</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}