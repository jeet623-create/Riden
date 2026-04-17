'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { motion } from 'framer-motion'
const bookings = [
  {ref:'BK-2026-001',client:'Singapore Tours Ltd',dmc:'Bangkok Express DMC',days:5,type:'airport_transfer',status:'confirmed',created:'2026-04-14'},
  {ref:'BK-2026-002',client:'Euro Travel Group',dmc:'Chiang Mai Adventures',days:3,type:'city_tour',status:'pending',created:'2026-04-14'},
  {ref:'BK-2026-003',client:'Asia Pacific Tours',dmc:'Phuket Premier DMC',days:7,type:'multi_day',status:'confirmed',created:'2026-04-13'},
  {ref:'BK-2026-004',client:'Global Destinations',dmc:'Bangkok Express DMC',days:4,type:'private_charter',status:'in_progress',created:'2026-04-13'},
  {ref:'BK-2026-005',client:'Luxury Escapes Co',dmc:'Krabi Elite Travel',days:6,type:'multi_day',status:'completed',created:'2026-04-12'},
  {ref:'BK-2026-006',client:'Adventure Seekers',dmc:'Chiang Mai Adventures',days:2,type:'day_trip',status:'cancelled',created:'2026-04-10'},
]
const TABS = ['All','Pending','Confirmed','In Progress','Completed','Cancelled']
export default function BookingsPage() {
  const [tab,setTab] = useState('All')
  const [q,setQ] = useState('')
  const filtered = bookings.filter(b=>{
    const matchTab = tab==='All'||b.status===tab.toLowerCase().replace(' ','_')
    const matchQ = !q||b.ref.toLowerCase().includes(q.toLowerCase())||b.client.toLowerCase().includes(q.toLowerCase())
    return matchTab&&matchQ
  })
  return (
    <AdminShell>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
        <div className="flex items-center justify-between mb-6">
          <div><h1 style={{fontSize:22,fontWeight:700}}>Bookings</h1><p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>{bookings.length} total</p></div>
          <Input icon="search" placeholder="Search ref or client..." className="w-56" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'5px 14px',borderRadius:99,fontSize:12,cursor:'pointer',border:`1px solid ${tab===t?'var(--teal-20)':'var(--border)'}`,background:tab===t?'var(--teal-10)':'transparent',color:tab===t?'var(--teal)':'var(--text-3)',transition:'all 150ms'}}>{t}</button>)}
        </div>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
                {['REF','CLIENT','DMC','DAYS','TYPE','STATUS','CREATED'].map(h=><th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>)}
              </tr></thead>
              <tbody>{filtered.map((b,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',transition:'background 120ms'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:13,color:'var(--teal)'}}>{b.ref}</td>
                  <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{b.client}</td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{b.dmc}</td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{b.days}d</td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)',textTransform:'capitalize'}}>{b.type.replace(/_/g,' ')}</td>
                  <td style={{padding:'12px 16px'}}><StatusBadge status={b.status}/></td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{b.created}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AdminShell>
  )
}
