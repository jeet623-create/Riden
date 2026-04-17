"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { StatusBadge } from "@/components/dmc/status-badge"
import { useLanguage } from "@/hooks/use-language"

const trips = [
  { date:"2026-04-15", id:"BK-2026-001", client:"Wang Family", status:"confirmed" as const, vehicle:"Van 9" },
  { date:"2026-04-17", id:"BK-2026-003", client:"Asia Pacific Tours", status:"in_progress" as const, vehicle:"Van 12" },
  { date:"2026-04-18", id:"BK-2026-002", client:"Euro Travel Group", status:"pending" as const, vehicle:"Coach 30" },
  { date:"2026-04-20", id:"BK-2026-004", client:"Korea DMC Group", status:"confirmed" as const, vehicle:"Minibus 20" },
  { date:"2026-04-22", id:"BK-2026-005", client:"Luxury Escapes Co", status:"confirmed" as const, vehicle:"SUV" },
  { date:"2026-04-25", id:"BK-2026-006", client:"Tokyo Travel", status:"pending" as const, vehicle:"Van 9" },
]

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const STATUS_COLORS: Record<string,string> = { confirmed:"#1D9E75", in_progress:"#3b82f6", pending:"#f59e0b", completed:"#555", cancelled:"#ef4444" }

export default function DmcCalendarPage() {
  const { t } = useLanguage()
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(3) // 0-indexed = April

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month:"long" })
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)

  const tripsOnDay = (d: number) => {
    const key = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
    return trips.filter(t => t.date === key)
  }

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1,#f0f0f0)" }}>{t({ en:"Calendar", th:"ปฏิทิน", zh:"日历" })}</h1>
          <p style={{ fontSize:13, color:"var(--text-2,#999)", marginTop:2 }}>{trips.length} trips this month</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={prev} style={{ width:32, height:32, borderRadius:8, border:"1px solid var(--border,#242)", background:"var(--bg-elevated,#1a1a1a)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronLeft size={16} color="var(--text-2,#999)"/></button>
          <span style={{ fontWeight:600, fontSize:15, color:"var(--text-1,#f0f0f0)", minWidth:140, textAlign:"center" }}>{monthName} {year}</span>
          <button onClick={next} style={{ width:32, height:32, borderRadius:8, border:"1px solid var(--border,#242)", background:"var(--bg-elevated,#1a1a1a)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronRight size={16} color="var(--text-2,#999)"/></button>
        </div>
      </div>
      <div style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1px solid var(--border,#242)" }}>
          {DAYS.map(d => <div key={d} style={{ padding:"10px 0", textAlign:"center", fontFamily:"var(--font-mono,monospace)", fontSize:10, color:"var(--text-2,#999)", textTransform:"uppercase", letterSpacing:1 }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {cells.map((day, i) => {
            const dayTrips = day ? tripsOnDay(day) : []
            const isToday = day === 17 && month === 3
            return (
              <div key={i} style={{ minHeight:100, padding:8, borderRight: i%7!==6 ? "1px solid var(--border,#242)" : "none", borderBottom:"1px solid var(--border,#242)", background: isToday ? "rgba(29,158,117,0.04)" : "transparent" }}>
                {day && <>
                  <div style={{ fontFamily:"var(--font-mono,monospace)", fontSize:12, color: isToday ? "#1D9E75" : "var(--text-2,#999)", fontWeight: isToday ? 700 : 400, marginBottom:4 }}>{day}</div>
                  {dayTrips.map((tr,j) => (
                    <div key={j} style={{ marginBottom:3, padding:"2px 6px", borderRadius:4, background:`${STATUS_COLORS[tr.status]}18`, borderLeft:`2px solid ${STATUS_COLORS[tr.status]}`, fontSize:10, color:STATUS_COLORS[tr.status], overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {tr.client}
                    </div>
                  ))}
                </>}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
