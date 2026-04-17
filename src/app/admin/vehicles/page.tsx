'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { motion } from 'framer-motion'
import { Car, Users, AlertCircle, CheckCircle } from 'lucide-react'

const vehicles = [
  {id:1,plate:'BKK-1234',type:'van_9',brand:'Toyota HiAce',color:'White',seats:9,operator:'Siam Transport Co',driver:'Somchai P.',status:'active'},
  {id:2,plate:'BKK-5678',type:'sedan',brand:'Toyota Camry',color:'Silver',seats:4,operator:'Siam Transport Co',driver:'Niran C.',status:'active'},
  {id:3,plate:'CMI-9012',type:'suv',brand:'Toyota Fortuner',color:'Black',seats:7,operator:'Northern Routes Ltd',driver:'Prasert S.',status:'active'},
  {id:4,plate:'PKT-3456',type:'van_12',brand:'Mercedes-Benz V-Class',color:'White',seats:12,operator:'Island Express',driver:'Unassigned',status:'inactive'},
  {id:5,plate:'PKT-7890',type:'sedan',brand:'BMW 5 Series',color:'Black',seats:4,operator:'Island Express',driver:'Wichai Y.',status:'active'},
  {id:6,plate:'BKK-2345',type:'van_9',brand:'Toyota Alphard',color:'White',seats:9,operator:'Siam Transport Co',driver:'Sutin N.',status:'active'},
]

const typeColors: Record<string,{bg:string,text:string}> = {
  van_9:   {bg:'var(--blue-bg)',   text:'var(--blue)'},
  van_12:  {bg:'var(--blue-bg)',   text:'var(--blue)'},
  sedan:   {bg:'rgba(255,255,255,0.06)', text:'var(--text-2)'},
  suv:     {bg:'var(--teal-10)',   text:'var(--teal)'},
  coach:   {bg:'var(--purple-bg)', text:'var(--purple)'},
  minibus: {bg:'var(--amber-bg)',  text:'var(--amber)'},
}

export default function VehiclesPage() {
  const [q, setQ] = useState('')
  const filtered = vehicles.filter(v => !q || v.plate.toLowerCase().includes(q.toLowerCase()) || v.brand.toLowerCase().includes(q.toLowerCase()) || v.operator.toLowerCase().includes(q.toLowerCase()))
  const active = vehicles.filter(v => v.status === 'active').length

  return (
    <AdminShell>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{fontSize:22,fontWeight:700,fontFamily:'var(--font-body)'}}>Vehicles</h1>
            <p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>{vehicles.length} total · {active} active</p>
          </div>
          <Input icon="search" placeholder="Search vehicles..." className="w-56" value={q} onChange={e => setQ(e.target.value)} />
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[
            {label:'TOTAL',value:vehicles.length,icon:<Car size={18}/>,color:'var(--teal)'},
            {label:'ACTIVE',value:active,icon:<CheckCircle size={18}/>,color:'var(--green)'},
            {label:'INACTIVE',value:vehicles.length-active,icon:<AlertCircle size={18}/>,color:'var(--amber)'},
            {label:'UNASSIGNED',value:vehicles.filter(v=>v.driver==='Unassigned').length,icon:<Users size={18}/>,color:'var(--red)'},
          ].map(s => (
            <div key={s.label} style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,padding:20,borderLeft:`3px solid ${s.color}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{s.label}</span>
                <span style={{color:s.color,opacity:0.6}}>{s.icon}</span>
              </div>
              <div style={{fontSize:28,fontWeight:700,color:'var(--text-1)'}}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
                  {['PLATE','TYPE','BRAND/MODEL','SEATS','OPERATOR','DRIVER','STATUS'].map(h => (
                    <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v,i) => (
                  <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:'var(--teal)'}}>{v.plate}</td>
                    <td style={{padding:'12px 16px'}}>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:11,padding:'2px 8px',borderRadius:99,background:(typeColors[v.type]||typeColors.sedan).bg,color:(typeColors[v.type]||typeColors.sedan).text}}>
                        {v.type.replace('_',' ')}
                      </span>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{v.brand}</td>
                    <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)',textAlign:'center'}}>{v.seats}</td>
                    <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{v.operator}</td>
                    <td style={{padding:'12px 16px',fontSize:13,color:v.driver==='Unassigned'?'var(--amber)':'var(--text-2)',fontStyle:v.driver==='Unassigned'?'italic':'normal'}}>{v.driver}</td>
                    <td style={{padding:'12px 16px'}}><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AdminShell>
  )
}
