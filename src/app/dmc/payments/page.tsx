"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const payments = [
  { trip:"T101-1", booking:"BK-2026-001", client:"Wang Family", operator:"Somchai Transport", status:"confirmed" as const, proofUrl:"#", date:"2026-04-15" },
  { trip:"T102-2", booking:"BK-2026-003", client:"Asia Pacific Tours", operator:"Island Express", status:"proof_uploaded" as const, proofUrl:"#", date:"2026-04-13" },
  { trip:"T103-1", booking:"BK-2026-004", client:"Korea DMC Group", operator:"Bangkok Fleet Co", status:"pending" as const, proofUrl:null, date:"2026-04-12" },
  { trip:"T104-3", booking:"BK-2026-002", client:"Euro Travel Group", operator:"Somchai Transport", status:"pending" as const, proofUrl:null, date:"2026-04-10" },
  { trip:"T105-1", booking:"BK-2026-005", client:"Luxury Escapes Co", operator:"Island Express", status:"confirmed" as const, proofUrl:"#", date:"2026-04-08" },
]

const ICON = { confirmed:<CheckCircle2 size={14} color="#1D9E75"/>, proof_uploaded:<Clock size={14} color="#3b82f6"/>, pending:<AlertTriangle size={14} color="#f59e0b"/> }
const LABEL = { confirmed:"Confirmed", proof_uploaded:"Proof Uploaded", pending:"Awaiting" }
const BG = { confirmed:"rgba(29,158,117,0.1)", proof_uploaded:"rgba(59,130,246,0.1)", pending:"rgba(245,158,11,0.08)" }
const COL = { confirmed:"#1D9E75", proof_uploaded:"#3b82f6", pending:"#f59e0b" }

export default function DmcPaymentsPage() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<"all"|"pending"|"confirmed">("all")

  const filtered = payments.filter(p => tab === "all" || (tab === "pending" ? p.status === "pending" : p.status !== "pending"))

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1,#f0f0f0)" }}>{t({ en:"Payments", th:"การชำระเงิน", zh:"支付" })}</h1>
          <p style={{ fontSize:13, color:"var(--text-2,#999)", marginTop:2 }}>{payments.filter(p=>p.status==="pending").length} pending confirmation</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {(["all","pending","confirmed"] as const).map(f=>(
            <button key={f} onClick={()=>setTab(f)}
              style={{ padding:"5px 14px", borderRadius:99, fontSize:12, cursor:"pointer", border:`1px solid ${tab===f?"rgba(29,158,117,0.2)":"var(--border,#242)"}`, background:tab===f?"rgba(29,158,117,0.1)":"transparent", color:tab===f?"#1D9E75":"var(--text-2,#999)" }}>
              {f[0].toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:t({ en:"Confirmed", th:"ยืนยันแล้ว", zh:"已确认" }), count:payments.filter(p=>p.status==="confirmed").length, color:"#1D9E75" },
          { label:t({ en:"Proof Uploaded", th:"อัพโหลดหลักฐาน", zh:"已上传凭证" }), count:payments.filter(p=>p.status==="proof_uploaded").length, color:"#3b82f6" },
          { label:t({ en:"Pending", th:"รอดำเนินการ", zh:"待处理" }), count:payments.filter(p=>p.status==="pending").length, color:"#f59e0b" },
        ].map(s=>(
          <div key={s.label} style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderLeft:`3px solid ${s.color}`, borderRadius:12, padding:16 }}>
            <div style={{ fontFamily:"var(--font-mono,monospace)", fontSize:10, color:"var(--text-2,#999)", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{s.label}</div>
            <div style={{ fontFamily:"var(--font-mono,monospace)", fontSize:28, fontWeight:700, color:"var(--text-1,#f0f0f0)" }}>{s.count}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid var(--border,#242)", background:"var(--bg-base,#080808)" }}>
              {["TRIP","BOOKING","CLIENT","OPERATOR","STATUS","DATE","ACTION"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:10, color:"var(--text-2,#999)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 120ms" }}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated,#1a1a1a)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:12, color:"#1D9E75" }}>{p.trip}</td>
                <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:12, color:"var(--text-2,#999)" }}>{p.booking}</td>
                <td style={{ padding:"12px 16px", fontSize:13, fontWeight:500, color:"var(--text-1,#f0f0f0)" }}>{p.client}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-2,#999)" }}>{p.operator}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, fontSize:11, fontFamily:"var(--font-mono,monospace)", background:BG[p.status], color:COL[p.status] }}>
                    {ICON[p.status]}{LABEL[p.status]}
                  </span>
                </td>
                <td style={{ padding:"12px 16px", fontFamily:"var(--font-mono,monospace)", fontSize:12, color:"var(--text-2,#999)" }}>{p.date}</td>
                <td style={{ padding:"12px 16px" }}>
                  {p.status==="proof_uploaded" && (
                    <button style={{ padding:"4px 12px", borderRadius:6, fontSize:11, background:"#1D9E75", color:"white", border:"none", cursor:"pointer" }}>
                      {t({ en:"Confirm", th:"ยืนยัน", zh:"确认" })}
                    </button>
                  )}
                  {p.status==="pending" && <span style={{ fontSize:11, color:"var(--text-3,#555)" }}>Awaiting proof</span>}
                  {p.status==="confirmed" && <span style={{ fontSize:11, color:"#1D9E75" }}>✓ Done</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
