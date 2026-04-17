"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Phone, MapPin } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const drivers = [
  { id:1, name:"Somchai Jaidee", phone:"+66 82 123 4567", vehicle:"Toyota Commuter", plate:"กข-1234", base:"Bangkok", trips:89, rating:4.9, available:true, operator:"Somchai Transport" },
  { id:2, name:"Prasert Deejai", phone:"+66 87 234 5678", vehicle:"Honda Van", plate:"กข-5678", base:"Bangkok", trips:54, rating:4.7, available:false, operator:"Bangkok Fleet Co" },
  { id:3, name:"Manat Sukchai", phone:"+66 84 345 6789", vehicle:"Toyota Van", plate:"ภก-9012", base:"Phuket", trips:37, rating:4.8, available:true, operator:"Island Express" },
  { id:4, name:"Wanchai Bootlert", phone:"+66 89 456 7890", vehicle:"Mercedes Sprinter", plate:"นค-3456", base:"Bangkok", trips:112, rating:5.0, available:true, operator:"Bangkok Fleet Co" },
  { id:5, name:"Sutin Nakprom", phone:"+66 85 567 8901", vehicle:"Toyota Fortuner", plate:"ขก-7890", base:"Chiang Mai", trips:28, rating:4.6, available:true, operator:"Northern Roads" },
  { id:6, name:"Krit Jansorn", phone:"+66 83 678 9012", vehicle:"Isuzu Minibus", plate:"สก-2345", base:"Hua Hin", trips:45, rating:4.8, available:false, operator:"Hua Hin Wheels" },
]

export default function DmcDriversPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<"all"|"available">("all")

  const filtered = filter === "available" ? drivers.filter(d=>d.available) : drivers

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1,#f0f0f0)" }}>{t({ en:"Drivers", th:"คนขับ", zh:"司机" })}</h1>
          <p style={{ fontSize:13, color:"var(--text-2,#999)", marginTop:2 }}>{drivers.filter(d=>d.available).length} available now</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {(["all","available"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"5px 14px", borderRadius:99, fontSize:12, cursor:"pointer", border:`1px solid ${filter===f?"rgba(29,158,117,0.2)":"var(--border,#242)"}`, background:filter===f?"rgba(29,158,117,0.1)":"transparent", color:filter===f?"#1D9E75":"var(--text-2,#999)" }}>
              {f==="all" ? t({ en:"All", th:"ทั้งหมด", zh:"全部" }) : t({ en:"Available", th:"ว่างอยู่", zh:"可用" })}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {filtered.map(d => (
          <div key={d.id} style={{ background:"var(--bg-surface,#111)", border:"1px solid var(--border,#242)", borderRadius:12, padding:20, transition:"border-color 150ms" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border,#242)"}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"var(--teal-10,rgba(29,158,117,0.1))", border:"1px solid rgba(29,158,117,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-mono,monospace)", fontSize:13, fontWeight:600, color:"#1D9E75" }}>
                  {d.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:"var(--text-1,#f0f0f0)" }}>{d.name}</div>
                  <div style={{ fontSize:11, color:"var(--text-2,#999)" }}>{d.operator}</div>
                </div>
              </div>
              <div style={{ width:8, height:8, borderRadius:"50%", background:d.available?"#22c55e":"var(--text-3,#555)", boxShadow:d.available?"0 0 6px #22c55e":"none" }}/>
            </div>
            <div style={{ fontSize:12, color:"var(--text-2,#999)", marginBottom:6 }}>{d.vehicle} · <span style={{ fontFamily:"var(--font-mono,monospace)" }}>{d.plate}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", gap:12 }}>
                <span style={{ fontSize:11, color:"var(--text-2,#999)", display:"flex", alignItems:"center", gap:3 }}><MapPin size={10}/>{d.base}</span>
                <span style={{ fontSize:11, color:"var(--text-2,#999)" }}>{d.trips} trips</span>
              </div>
              <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:12, color:"#f59e0b" }}><Star size={11} fill="#f59e0b"/>{d.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
