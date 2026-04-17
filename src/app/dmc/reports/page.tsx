"use client"
import { motion } from "framer-motion"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { useLanguage } from "@/hooks/use-language"

const monthly = [
  { month:"Nov", bookings:8 }, { month:"Dec", bookings:14 }, { month:"Jan", bookings:11 },
  { month:"Feb", bookings:18 }, { month:"Mar", bookings:23 }, { month:"Apr", bookings:17 },
]
const operators = [
  { name:"Somchai Transport", trips:47, onTime:96 },
  { name:"Bangkok Fleet Co", trips:89, onTime:98 },
  { name:"Island Express", trips:32, onTime:94 },
  { name:"Northern Roads", trips:15, onTime:91 },
  { name:"Hua Hin Wheels", trips:28, onTime:95 },
]
const topRoutes = [
  { route:"Bangkok → Pattaya", count:23 },
  { route:"Airport Transfer", count:31 },
  { route:"Hua Hin City Tour", count:14 },
  { route:"Phuket → Krabi", count:9 },
]

const TEAL_TOOLTIP = { contentStyle:{ background:"#111", border:"1px solid #242", borderRadius:8 }, labelStyle:{ color:"#999", fontSize:11 }, itemStyle:{ color:"#1D9E75" } }

export default function DmcReportsPage() {
  const { t } = useLanguage()
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1,#f0f0f0)" }}>{t({ en:"Reports", th:"รายงาน", zh:"报告" })}</h1>
        <p style={{ fontSize:13, color:"var(--text-2,#999)", marginTop:2 }}>Last 6 months · April 2026</p>
      </div>

      {/* Summary Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Bookings", value:"91", color:"#1D9E75" },
          { label:"On-time Rate", value:"96%", color:"#22c55e" },
          { label:"Avg Days/Booking", value:"4.2", color:"#3b82f6" },
          { label:"Active Operators", value:"5", color:"#f59e0b" },
        ].map(s=>(
          <div key={s.label} style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderLeft:`3px solid ${s.color}`, borderRadius:12, padding:16 }}>
            <div style={{ fontFamily:"var(--font-mono,monospace)", fontSize:10, color:"var(--text-2,#999)", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{s.label}</div>
            <div style={{ fontFamily:"var(--font-mono,monospace)", fontSize:26, fontWeight:700, color:"var(--text-1,#f0f0f0)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
        {/* Booking Trend */}
        <div style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderRadius:12, padding:20 }}>
          <div style={{ fontWeight:600, fontSize:14, color:"var(--text-1,#f0f0f0)", marginBottom:4 }}>Monthly Bookings</div>
          <div style={{ fontSize:12, color:"var(--text-2,#999)", marginBottom:16 }}>6 month trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthly}>
              <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3}/><stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="month" tick={{ fill:"#555", fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#555", fontSize:10 }} axisLine={false} tickLine={false}/>
              <Tooltip {...TEAL_TOOLTIP}/>
              <Area type="monotone" dataKey="bookings" stroke="#1D9E75" strokeWidth={2} fill="url(#tg)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Routes */}
        <div style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderRadius:12, padding:20 }}>
          <div style={{ fontWeight:600, fontSize:14, color:"var(--text-1,#f0f0f0)", marginBottom:4 }}>Top Routes</div>
          <div style={{ fontSize:12, color:"var(--text-2,#999)", marginBottom:16 }}>Most booked</div>
          {topRoutes.map((r,i)=>(
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:"var(--text-1,#f0f0f0)" }}>{r.route}</span>
                <span style={{ fontFamily:"var(--font-mono,monospace)", fontSize:11, color:"#1D9E75" }}>{r.count}</span>
              </div>
              <div style={{ height:4, background:"var(--bg-elevated,#1a1a1a)", borderRadius:99 }}>
                <div style={{ height:"100%", width:`${(r.count/31)*100}%`, background:"#1D9E75", borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operator Performance */}
      <div style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--border,#242)" }}>
          <div style={{ fontWeight:600, fontSize:14, color:"var(--text-1,#f0f0f0)" }}>Operator Performance</div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"var(--bg-base,#080808)" }}>
              {["OPERATOR","TRIPS","ON-TIME RATE","PERFORMANCE"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:10, color:"var(--text-2,#999)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operators.map((o,i)=>(
              <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding:"12px 16px", fontSize:13, fontWeight:500, color:"var(--text-1,#f0f0f0)" }}>{o.name}</td>
                <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:12, color:"var(--text-2,#999)" }}>{o.trips}</td>
                <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:13, color:"#1D9E75" }}>{o.onTime}%</td>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1, height:6, background:"var(--bg-elevated,#1a1a1a)", borderRadius:99 }}>
                      <div style={{ height:"100%", width:`${o.onTime}%`, background:o.onTime>=96?"#1D9E75":o.onTime>=93?"#f59e0b":"#ef4444", borderRadius:99 }}/>
                    </div>
                    <span style={{ fontFamily:"var(--font-mono,monospace)", fontSize:10, color:"var(--text-2,#999)", width:30 }}>{o.onTime}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
