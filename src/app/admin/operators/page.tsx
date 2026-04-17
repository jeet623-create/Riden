'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { toast } from 'sonner'

const operators = [
  {id:1,company:'Siam Transport Co',phone:'+66 2 123 4567',base:'Bangkok',alsoDriver:true,verified:true,status:'active',joined:'2025-11-15',fleet:[{type:'van_9',plate:'BKK-1234',model:'Toyota HiAce'},{type:'sedan',plate:'BKK-5678',model:'Toyota Camry'}]},
  {id:2,company:'Northern Routes Ltd',phone:'+66 53 234 5678',base:'Chiang Mai',alsoDriver:false,verified:true,status:'active',joined:'2026-01-20',fleet:[{type:'suv',plate:'CMI-9012',model:'Toyota Fortuner'}]},
  {id:3,company:'Island Express',phone:'+66 76 345 6789',base:'Phuket',alsoDriver:true,verified:false,status:'inactive',joined:'2026-04-10',fleet:[{type:'van_12',plate:'PKT-3456',model:'Mercedes-Benz V-Class'}]},
  {id:4,company:'Bangkok Luxury Fleet',phone:'+66 2 987 6543',base:'Bangkok',alsoDriver:false,verified:true,status:'active',joined:'2026-02-15',fleet:[{type:'sedan',plate:'BKK-9876',model:'BMW 5 Series'},{type:'suv',plate:'BKK-5432',model:'Mercedes GLE'}]},
]

export default function OperatorsPage() {
  const [q,setQ] = useState('')
  const [sel,setSel] = useState<typeof operators[0]|null>(null)
  const filtered = operators.filter(o=>!q||o.company.toLowerCase().includes(q.toLowerCase())||o.base.toLowerCase().includes(q.toLowerCase()))
  return (
    <AdminShell>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{fontSize:22,fontWeight:700}}>Operators</h1>
            <p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>{operators.length} fleet owners registered</p>
          </div>
          <Input icon="search" placeholder="Search operator..." className="w-56" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
                {['COMPANY','PHONE','BASE','ALSO DRIVER','VERIFIED','STATUS','JOINED',''].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{filtered.map((o,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{o.company}</td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{o.phone}</td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{o.base}</td>
                  <td style={{padding:'12px 16px'}}>{o.alsoDriver?<Check size={14} style={{color:'var(--green)'}}/>:<span style={{color:'var(--text-3)'}}>—</span>}</td>
                  <td style={{padding:'12px 16px'}}>{o.verified?<Check size={14} style={{color:'var(--green)'}}/>:<span style={{color:'var(--text-3)'}}>—</span>}</td>
                  <td style={{padding:'12px 16px'}}><StatusBadge status={o.status}/></td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{o.joined}</td>
                  <td style={{padding:'12px 16px'}}><button onClick={()=>setSel(o)} style={{padding:'4px 12px',borderRadius:6,fontSize:12,background:'transparent',border:'1px solid var(--border)',color:'var(--text-2)',cursor:'pointer'}}>Details</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {sel&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSel(null)}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:50,display:'flex',justifyContent:'flex-end'}}>
            <motion.div initial={{x:60,opacity:0}} animate={{x:0,opacity:1}} exit={{x:60,opacity:0}} transition={{duration:0.26}}
              onClick={e=>e.stopPropagation()}
              style={{width:440,background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',height:'100%',overflowY:'auto',padding:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
                <div><div style={{fontSize:16,fontWeight:600,marginBottom:6}}>{sel.company}</div><StatusBadge status={sel.status}/></div>
                <button onClick={()=>setSel(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-2)'}}><X size={18}/></button>
              </div>
              <div style={{background:'var(--bg-elevated)',borderRadius:10,padding:16,marginBottom:20}}>
                {[['PHONE',sel.phone],['BASE',sel.base],['ALSO DRIVER',sel.alsoDriver?'Yes':'No'],['VERIFIED',sel.verified?'Yes':'No'],['JOINED',sel.joined]].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1}}>{l}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:12}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>FLEET ({sel.fleet.length})</div>
                {sel.fleet.map((v,i)=>(
                  <div key={i} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',marginBottom:6}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:12,fontWeight:500,textTransform:'capitalize'}}>{v.type.replace('_',' ')}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--teal)'}}>{v.plate}</span>
                    </div>
                    <span style={{fontSize:11,color:'var(--text-2)'}}>{v.model}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {!sel.verified&&<button onClick={()=>{toast.success('Operator verified');setSel(null)}} style={{padding:'9px 16px',borderRadius:8,fontSize:13,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer'}}>✓ Verify Operator</button>}
                <button onClick={()=>{toast.error('Operator suspended');setSel(null)}} style={{padding:'9px 16px',borderRadius:8,fontSize:13,background:'var(--red-bg)',color:'var(--red)',border:'1px solid rgba(239,68,68,0.2)',cursor:'pointer'}}>Suspend</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
