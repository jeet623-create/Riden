"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search } from "lucide-react"
import { StatusBadge } from "@/components/dmc/status-badge"
import { useLanguage } from "@/hooks/use-language"

const mockBookings = [
  { id:"BK-2026-001", client:"Wang Family", days:3, status:"confirmed" as const, vehicle:"Van 9", date:"2026-04-15", operator:"Somchai Transport" },
  { id:"BK-2026-002", client:"Euro Travel Group", days:7, status:"pending" as const, vehicle:"Coach 30", date:"2026-04-14", operator:"—" },
  { id:"BK-2026-003", client:"Asia Pacific Tours", days:2, status:"in_progress" as const, vehicle:"Van 12", date:"2026-04-13", operator:"Island Express" },
  { id:"BK-2026-004", client:"Korea DMC Group", days:5, status:"confirmed" as const, vehicle:"Minibus 20", date:"2026-04-12", operator:"Bangkok Fleet Co" },
  { id:"BK-2026-005", client:"Luxury Escapes Co", days:4, status:"completed" as const, vehicle:"SUV", date:"2026-04-10", operator:"Somchai Transport" },
]

const TABS = ["all","pending","confirmed","in_progress","completed","cancelled"]

export default function DmcBookingsPage() {
  const { t } = useLanguage()
  const [tab, setTab] = useState("all")
  const [q, setQ] = useState("")

  const filtered = mockBookings.filter(b => {
    const matchTab = tab === "all" || b.status === tab
    const matchQ = !q || b.id.toLowerCase().includes(q.toLowerCase()) || b.client.toLowerCase().includes(q.toLowerCase())
    return matchTab && matchQ
  })

  const tabLabel = (key: string) => ({
    all: t({ en:"All", th:"ทั้งหมด", zh:"全部" }),
    pending: t({ en:"Pending", th:"รอดำเนินการ", zh:"待处理" }),
    confirmed: t({ en:"Confirmed", th:"ยืนยันแล้ว", zh:"已确认" }),
    in_progress: t({ en:"In Progress", th:"กำลังดำเนินการ", zh:"进行中" }),
    completed: t({ en:"Completed", th:"เสร็จสิ้น", zh:"已完成" }),
    cancelled: t({ en:"Cancelled", th:"ยกเลิก", zh:"已取消" }),
  })[key] || key

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1,#f0f0f0)" }}>
            {t({ en:"Bookings", th:"การจอง", zh:"预订" })}
          </h1>
          <p style={{ fontSize:13, color:"var(--text-2,#999)", marginTop:2 }}>{filtered.length} total</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3,#555)" }} />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder={t({ en:"Search...", th:"ค้นหา...", zh:"搜索..." })}
              style={{ paddingLeft:32, paddingRight:12, height:36, borderRadius:8, border:"1px solid var(--border,#242)", background:"var(--bg-elevated,#1a1a1a)", color:"var(--text-1,#f0f0f0)", fontSize:13, outline:"none", width:200 }} />
          </div>
          <button style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:500, background:"#1D9E75", color:"white", border:"none", cursor:"pointer" }}>
            <Plus size={14} /> {t({ en:"+ New Booking", th:"+ จองใหม่", zh:"+ 新预订" })}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {TABS.map(key => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding:"5px 14px", borderRadius:99, fontSize:12, cursor:"pointer", border:`1px solid ${tab===key?"var(--teal-20,rgba(29,158,117,0.2))":"var(--border,#242)"}`, background:tab===key?"var(--teal-10,rgba(29,158,117,0.1))":"transparent", color:tab===key?"#1D9E75":"var(--text-2,#999)", transition:"all 150ms" }}>
            {tabLabel(key)}
            {key !== "all" && <span style={{ marginLeft:4, fontSize:10, opacity:0.7 }}>({mockBookings.filter(b=>b.status===key).length})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderRadius:12, overflow:"hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding:"60px 24px", textAlign:"center", color:"var(--text-2,#999)", fontSize:14 }}>
            {t({ en:"No bookings found", th:"ไม่พบการจอง", zh:"未找到预订" })}
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border,#242)", background:"var(--bg-base,#080808)" }}>
                  {["REF","CLIENT","DAYS","VEHICLE","OPERATOR","STATUS","DATE"].map(h => (
                    <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:10, color:"var(--text-2,#999)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", transition:"background 120ms" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated,#1a1a1a)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:13, color:"#1D9E75" }}>{b.id}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:500, color:"var(--text-1,#f0f0f0)" }}>{b.client}</td>
                    <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:12, color:"var(--text-2,#999)" }}>{b.days}d</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-2,#999)" }}>{b.vehicle}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-2,#999)" }}>{b.operator}</td>
                    <td style={{ padding:"12px 16px" }}><StatusBadge status={b.status} showPulse /></td>
                    <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:12, color:"var(--text-2,#999)" }}>{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
