"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, MapPin } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const operators = [
  {id:1,name:"Somchai Transport",contact:"Somchai J.",phone:"+66 81 234 5678",base:"Bangkok",vehicles:5,types:["Van 9","Van 12","Sedan"],trips:47,rating:4.8,preferred:true},
  {id:2,name:"Island Express",contact:"Prasert K.",phone:"+66 76 345 6789",base:"Phuket",vehicles:8,types:["Minibus 20","Coach 30","SUV"],trips:32,rating:4.6,preferred:true},
  {id:3,name:"Bangkok Fleet Co",contact:"Wichai N.",phone:"+66 89 456 7890",base:"Bangkok",vehicles:12,types:["Coach 40","Minibus 15","Van 12"],trips:89,rating:4.9,preferred:false},
  {id:4,name:"Northern Roads",contact:"Niran C.",phone:"+66 85 567 8901",base:"Chiang Mai",vehicles:3,types:["Van 9","SUV"],trips:15,rating:4.5,preferred:false},
  {id:5,name:"Hua Hin Wheels",contact:"Manat S.",phone:"+66 83 678 9012",base:"Hua Hin",vehicles:4,types:["Van 12","Sedan"],trips:28,rating:4.7,preferred:false},
]

export default function DmcOperatorsPage() {
  const {t} = useLanguage()
  const [sel,setSel] = useState<typeof operators[0]|null>(null)
  const [q,setQ] = useState("")
  const filtered = operators.filter(o=>!q||o.name.toLowerCase().includes(q.toLowerCase())||o.base.toLowerCase().includes(q.toLowerCase()))
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--text-1,#f0f0f0)"}}>{t({en:"Operators",th:"ผู้ให้บริการ",zh:"运营商"})}</h1>
          <p style={{fontSize:13,color:"var(--text-2,#999)",marginTop:2}}>{operators.filter(o=>o.preferred).length} preferred · {operators.length} total</p>
        </div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search operators..."
          style={{width:220,height:36,padding:"0 12px",borderRadius:8,border:"1px solid var(--border,#242)",background:"var(--bg-elevated,#1a1a1a)",color:"var(--text-1,#f0f0f0)",fontSize:13,outline:"none"}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
        {filtered.map(op=>(
          <div key={op.id} onClick={()=>setSel(op)}
            style={{background:"var(--bg-surface,#111)",border:`1px solid ${op.preferred?"rgba(29,158,117,0.3)":"var(--border,#242)"}`,borderRadius:12,padding:20,cursor:"pointer",transition:"all 150ms"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=op.preferred?"rgba(29,158,117,0.5)":"rgba(255,255,255,0.1)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=op.preferred?"rgba(29,158,117,0.3)":"var(--border,#242)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontWeight:600,fontSize:14,color:"var(--text-1,#f0f0f0)",marginBottom:2}}>{op.name}</div>
                <div style={{fontSize:12,color:"var(--text-2,#999)",display:"flex",alignItems:"center",gap:4}}><MapPin size={11}/>{op.base}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {op.preferred&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"rgba(29,158,117,0.1)",color:"#1D9E75",fontFamily:"monospace"}}>PREFERRED</span>}
                <span style={{display:"flex",alignItems:"center",gap:2,fontSize:12,color:"#f59e0b"}}><Star size={12} fill="#f59e0b"/>{op.rating}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:16,marginBottom:12}}>
              <div style={{textAlign:"center"}}><div style={{fontFamily:"monospace",fontSize:18,fontWeight:700,color:"var(--text-1,#f0f0f0)"}}>{op.vehicles}</div><div style={{fontSize:10,color:"var(--text-2,#999)",textTransform:"uppercase"}}>Vehicles</div></div>
              <div style={{textAlign:"center"}}><div style={{fontFamily:"monospace",fontSize:18,fontWeight:700,color:"var(--text-1,#f0f0f0)"}}>{op.trips}</div><div style={{fontSize:10,color:"var(--text-2,#999)",textTransform:"uppercase"}}>Trips</div></div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {op.types.map(v=><span key={v} style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"var(--bg-elevated,#1a1a1a)",color:"var(--text-2,#999)",border:"1px solid var(--border,#242)"}}>{v}</span>)}
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {sel&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSel(null)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",zIndex:50,display:"flex",justifyContent:"flex-end"}}>
            <motion.div initial={{x:60}} animate={{x:0}} exit={{x:60}} transition={{duration:0.25}} onClick={e=>e.stopPropagation()}
              style={{width:400,background:"var(--bg-surface,#111)",borderLeft:"1px solid var(--border,#242)",height:"100%",overflowY:"auto",padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div style={{fontSize:16,fontWeight:600,color:"var(--text-1,#f0f0f0)"}}>{sel.name}</div>
                <button onClick={()=>setSel(null)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-2,#999)"}}><X size={18}/></button>
              </div>
              <div style={{background:"var(--bg-elevated,#1a1a1a)",borderRadius:10,padding:16,marginBottom:20}}>
                {[["Contact",sel.contact],["Phone",sel.phone],["Base",sel.base],["Vehicles",String(sel.vehicles)],["Trips",String(sel.trips)],["Rating",sel.rating+" ⭐"]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{fontFamily:"monospace",fontSize:10,color:"var(--text-3,#555)",textTransform:"uppercase",letterSpacing:1}}>{l}</span>
                    <span style={{fontFamily:"monospace",fontSize:12,color:"var(--text-1,#f0f0f0)"}}>{v}</span>
                  </div>
                ))}
              </div>
              <button style={{width:"100%",padding:10,borderRadius:8,fontSize:13,fontWeight:500,background:"#1D9E75",color:"white",border:"none",cursor:"pointer"}}>
                {t({en:"Book This Operator",th:"จองผู้ให้บริการนี้",zh:"预订此运营商"})}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
