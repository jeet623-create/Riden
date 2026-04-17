'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, Check } from 'lucide-react'
import { toast } from 'sonner'

const drivers = [
  {id:1,name:'Somchai Pattana',vehicle:'van_9',plate:'BKK-1234',phone:'+66 82 123 4567',location:'Bangkok',license:'DL-12345678',expiry:'2027-03-15',status:'pending'},
  {id:2,name:'Niran Chaiwong',vehicle:'sedan',plate:'CMI-5678',phone:'+66 85 234 5678',location:'Chiang Mai',license:'DL-23456789',expiry:'2026-09-20',status:'active'},
  {id:3,name:'Prasert Suksawat',vehicle:'suv',plate:'PKT-9012',phone:'+66 87 345 6789',location:'Phuket',license:'DL-34567890',expiry:'2025-12-01',status:'pending'},
  {id:4,name:'Wichai Yongyut',vehicle:'sedan',plate:'BKK-3456',phone:'+66 89 456 7890',location:'Bangkok',license:'DL-45678901',expiry:'2028-06-10',status:'active'},
  {id:5,name:'Anan Rattana',vehicle:'van_9',plate:'KBI-7890',phone:'+66 81 567 8901',location:'Krabi',license:'DL-56789012',expiry:'2026-11-25',status:'inactive'},
  {id:6,name:'Sutin Nakornsri',vehicle:'van_9',plate:'BKK-2345',phone:'+66 84 678 9012',location:'Bangkok',license:'DL-67890123',expiry:'2027-08-30',status:'pending'},
]
const TABS = ['All','Pending','Active','Inactive']

export default function DriversPage() {
  const [tab,setTab] = useState('Pending')
  const [sel,setSel] = useState<typeof drivers[0]|null>(null)
  const [lightbox,setLightbox] = useState(false)
  const [rejection,setRejection] = useState('')
  const pendingCount = drivers.filter(d=>d.status==='pending').length
  const filtered = tab==='All'?drivers:drivers.filter(d=>d.status===tab.toLowerCase())
  const isExpired = (expiry:string) => new Date(expiry)<new Date()

  return (
    <AdminShell>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
        <div className="flex items-center justify-between mb-6">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <h1 style={{fontSize:22,fontWeight:700}}>Driver Verification</h1>
            {pendingCount>0&&<span style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.2)',color:'var(--amber)',borderRadius:99,padding:'3px 12px',fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600}}>{pendingCount} PENDING</span>}
          </div>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:20}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:'5px 14px',borderRadius:99,fontSize:12,cursor:'pointer',border:`1px solid ${tab===t?'var(--teal-20)':'var(--border)'}`,background:tab===t?'var(--teal-10)':'transparent',color:tab===t?'var(--teal)':'var(--text-3)',transition:'all 150ms'}}>
              {t==='Pending'&&pendingCount>0?`Pending (${pendingCount})`:t}
            </button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {filtered.map((d,i)=>(
            <motion.div key={d.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              style={{background:'var(--bg-surface)',border:`1px solid ${d.status==='pending'?'rgba(245,158,11,0.25)':'var(--border)'}`,borderRadius:12,overflow:'hidden',cursor:'pointer',transition:'all 200ms'}}
              onClick={()=>setSel(d)}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
              <div style={{height:148,background:'var(--bg-elevated)',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:11,color:'var(--text-3)'}}>No photo uploaded</span>
                <div style={{position:'absolute',top:8,right:8}}><StatusBadge status={d.status} variant="small"/></div>
                {d.status==='pending'&&<div style={{position:'absolute',top:8,left:8,background:'var(--amber)',color:'white',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:600}}>REVIEW</div>}
              </div>
              <div style={{padding:'12px 14px'}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{d.name}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-3)',marginBottom:2}}>{d.vehicle.replace('_',' ')} · {d.plate}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>{d.phone} · {d.location}</div>
              </div>
              {d.status==='pending'&&(
                <div style={{padding:'0 12px 12px',display:'flex',gap:8}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>{toast.success(`${d.name} approved`);}} style={{flex:1,padding:'6px',borderRadius:6,fontSize:12,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer'}}>Approve</button>
                  <button onClick={()=>setSel(d)} style={{flex:1,padding:'6px',borderRadius:6,fontSize:12,background:'var(--red-bg)',color:'var(--red)',border:'1px solid rgba(239,68,68,0.2)',cursor:'pointer'}}>Reject</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {sel&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSel(null)}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:50,display:'flex',justifyContent:'flex-end'}}>
            <motion.div initial={{x:60,opacity:0}} animate={{x:0,opacity:1}} exit={{x:60,opacity:0}} transition={{duration:0.26}}
              onClick={e=>e.stopPropagation()}
              style={{width:440,background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',height:'100%',overflowY:'auto',padding:24}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
                <div style={{fontSize:16,fontWeight:600}}>{sel.name}</div>
                <button onClick={()=>setSel(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-2)'}}><X size={18}/></button>
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>VEHICLE PHOTO</div>
                <div onClick={()=>setLightbox(true)} style={{height:200,background:'var(--bg-elevated)',borderRadius:12,border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                  <div style={{textAlign:'center',color:'var(--text-3)'}}>
                    <ZoomIn size={24} style={{margin:'0 auto 6px'}}/>
                    <div style={{fontSize:11}}>Click to enlarge</div>
                  </div>
                </div>
              </div>
              <div style={{background:'var(--bg-elevated)',borderRadius:10,padding:16,marginBottom:16}}>
                {[['VEHICLE',`${sel.vehicle.replace('_',' ')} · ${sel.plate}`],['PHONE',sel.phone],['LICENSE',sel.license],['EXPIRY',sel.expiry],['BASE',sel.location]].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1}}>{l}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:l==='EXPIRY'&&isExpired(v)?'var(--red)':'var(--text-1)'}}>{v}</span>
                  </div>
                ))}
              </div>
              {sel.status==='pending'&&(
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  <div>
                    <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6}}>REJECTION REASON (OPTIONAL)</label>
                    <textarea value={rejection} onChange={e=>setRejection(e.target.value)} placeholder="Enter reason..." rows={3}
                      style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',fontSize:13,color:'var(--text-1)',resize:'none',outline:'none',fontFamily:'var(--font-body)'}}
                      onFocus={e=>e.target.style.borderColor='var(--teal)'}
                      onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                  </div>
                  <button onClick={()=>{toast.success(`${sel.name} approved`);setSel(null)}} style={{padding:'9px',borderRadius:8,fontSize:13,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer'}}><Check size={14} style={{display:'inline',marginRight:6}}/>Approve Driver</button>
                  <button onClick={()=>{toast.error(`${sel.name} rejected`);setSel(null)}} style={{padding:'9px',borderRadius:8,fontSize:13,background:'var(--red-bg)',color:'var(--red)',border:'1px solid rgba(239,68,68,0.2)',cursor:'pointer'}}>✗ Reject Application</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLightbox(false)}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'var(--bg-elevated)',borderRadius:12,padding:40,textAlign:'center',color:'var(--text-3)'}}>
              <div style={{fontSize:14}}>Vehicle Photo (Full Size)</div>
              <div style={{fontSize:12,marginTop:4}}>No photo available</div>
            </div>
            <button onClick={()=>setLightbox(false)} style={{position:'absolute',top:20,right:20,background:'none',border:'none',color:'white',fontSize:28,cursor:'pointer'}}>×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
