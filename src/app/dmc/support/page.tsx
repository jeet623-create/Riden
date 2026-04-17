"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Send } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const tickets = [
  {id:"TK-001",subject:"Driver arrived late for airport transfer",status:"replied" as const,date:"2026-04-16",messages:[
    {from:"dmc",text:"Our driver for BK-2026-001 arrived 20 minutes late. Client was very upset.",time:"09:15"},
    {from:"support",text:"We sincerely apologize. We have reviewed the trip log and issued a warning to the driver. A credit has been added to your account.",time:"10:30"},
  ]},
  {id:"TK-002",subject:"Need to change vehicle type for BK-2026-003",status:"open" as const,date:"2026-04-15",messages:[
    {from:"dmc",text:"Client now has 2 extra passengers. Need to upgrade from Van 9 to Van 12 for all days.",time:"14:20"},
  ]},
  {id:"TK-003",subject:"Payment proof not received from operator",status:"open" as const,date:"2026-04-13",messages:[
    {from:"dmc",text:"It has been 48 hours since trip T102-2 closed but we still have not received payment confirmation.",time:"16:00"},
  ]},
]
const SS = {open:{bg:"rgba(245,158,11,0.08)",col:"#f59e0b"},replied:{bg:"rgba(59,130,246,0.1)",col:"#3b82f6"},closed:{bg:"rgba(255,255,255,0.05)",col:"#555"}}

export default function DmcSupportPage() {
  const {t} = useLanguage()
  const [sel,setSel] = useState(tickets[0])
  const [msg,setMsg] = useState("")
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--text-1,#f0f0f0)"}}>{t({en:"Support",th:"ช่วยเหลือ",zh:"支持"})}</h1>
          <p style={{fontSize:13,color:"var(--text-2,#999)",marginTop:2}}>{tickets.filter(t=>t.status!=="closed").length} open tickets</p>
        </div>
        <button style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:500,background:"#1D9E75",color:"white",border:"none",cursor:"pointer"}}>
          <Plus size={14}/>{t({en:"New Ticket",th:"ตั๋วใหม่",zh:"新工单"})}
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16,height:"calc(100vh - 220px)",minHeight:480}}>
        <div style={{background:"var(--bg-surface,#111)",border:"1px solid var(--border,#242)",borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border,#242)",fontFamily:"monospace",fontSize:10,color:"var(--text-2,#999)",textTransform:"uppercase",letterSpacing:1}}>TICKETS</div>
          <div style={{overflowY:"auto",flex:1}}>
            {tickets.map(tk=>(
              <div key={tk.id} onClick={()=>setSel(tk)}
                style={{padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",background:sel.id===tk.id?"rgba(29,158,117,0.08)":"transparent",borderLeft:sel.id===tk.id?"2px solid #1D9E75":"2px solid transparent",transition:"all 150ms"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:"#1D9E75"}}>{tk.id}</span>
                  <span style={{display:"inline-flex",padding:"1px 7px",borderRadius:99,fontSize:10,fontFamily:"monospace",background:SS[tk.status].bg,color:SS[tk.status].col}}>{tk.status}</span>
                </div>
                <div style={{fontSize:12,color:"var(--text-1,#f0f0f0)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tk.subject}</div>
                <div style={{fontSize:11,color:"var(--text-3,#555)"}}>{tk.date}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"var(--bg-surface,#111)",border:"1px solid var(--border,#242)",borderRadius:12,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border,#242)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:"var(--text-1,#f0f0f0)"}}>{sel.subject}</div>
              <div style={{fontSize:12,color:"var(--text-2,#999)",marginTop:2}}>{sel.id} · {sel.date}</div>
            </div>
            <span style={{display:"inline-flex",padding:"3px 10px",borderRadius:99,fontSize:11,fontFamily:"monospace",background:SS[sel.status].bg,color:SS[sel.status].col}}>{sel.status}</span>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:12}}>
            {sel.messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.from==="dmc"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"70%",padding:"10px 14px",borderRadius:12,background:m.from==="dmc"?"rgba(29,158,117,0.12)":"var(--bg-elevated,#1a1a1a)",border:`1px solid ${m.from==="dmc"?"rgba(29,158,117,0.2)":"var(--border,#242)"}`}}>
                  <div style={{fontSize:11,color:m.from==="dmc"?"#1D9E75":"var(--text-2,#999)",marginBottom:4,fontFamily:"monospace"}}>{m.from==="dmc"?"You":"RIDEN Support"} · {m.time}</div>
                  <div style={{fontSize:13,color:"var(--text-1,#f0f0f0)",lineHeight:1.5}}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:16,borderTop:"1px solid var(--border,#242)",display:"flex",gap:10}}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder={t({en:"Type your message...",th:"พิมพ์ข้อความ...",zh:"输入消息..."})}
              style={{flex:1,height:40,padding:"0 14px",borderRadius:8,border:"1px solid var(--border,#242)",background:"var(--bg-elevated,#1a1a1a)",color:"var(--text-1,#f0f0f0)",fontSize:13,outline:"none"}}
              onFocus={e=>e.target.style.borderColor="#1D9E75"}
              onBlur={e=>e.target.style.borderColor="var(--border,#242)"}/>
            <button onClick={()=>setMsg("")} style={{width:40,height:40,borderRadius:8,background:"#1D9E75",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Send size={16} color="white"/>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
