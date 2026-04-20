'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { StatusBadge } from '@/components/admin/status-badge'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, X, ZoomIn } from 'lucide-react'
import { toast } from 'sonner'

const pendingDrivers = [
  {id:1,name:'Somchai Pattana',vehicle:'Van 9',plate:'BKK-1234',license:'DL-12345678',phone:'+66 82 123 4567',location:'Bangkok',expiry:'2027-03-15',joined:'2026-04-14'},
  {id:2,name:'Prasert Suksawat',vehicle:'SUV',plate:'PKT-9012',license:'DL-23456789',phone:'+66 87 345 6789',location:'Phuket',expiry:'2026-09-20',joined:'2026-04-13'},
  {id:3,name:'Sutin Nakornsri',vehicle:'Van 9',plate:'BKK-2345',license:'DL-34567890',phone:'+66 84 678 9012',location:'Bangkok',expiry:'2027-08-30',joined:'2026-04-12'},
]
const pendingOperators = [
  {id:1,company:'Island Express',phone:'+66 76 345 6789',base:'Phuket',alsoDriver:true,joined:'2026-04-10'},
]

type Driver = typeof pendingDrivers[0]

export default function PendingPage() {
  const [sel, setSel] = useState<Driver|null>(null)
  const [lightbox, setLightbox] = useState(false)
  const [rejection, setRejection] = useState('')
  const [approvedIds, setApprovedIds] = useState<number[]>([])
  const total = pendingDrivers.filter(d=>!approvedIds.includes(d.id)).length + pendingOperators.length

  function approve(d: Driver) {
    setApprovedIds(prev=>[...prev,d.id])
    setSel(null)
    toast.success(`${d.name} approved successfully`)
  }

  return (
    <AdminShell>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{fontSize:22,fontWeight:700,fontFamily:'var(--font-body)'}}>Pending Approvals</h1>
            <p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>{total} items waiting for review</p>
          </div>
        </div>

        <AnimatePresence>
          {total === 0 && (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
              style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,padding:'64px 24px',textAlign:'center'}}>
              <CheckCircle2 size={48} style={{color:'var(--teal)',opacity:0.4,margin:'0 auto 12px'}}/>
              <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>All clear!</div>
              <div style={{fontSize:13,color:'var(--text-2)'}}>No pending approvals</div>
            </motion.div>
          )}
        </AnimatePresence>

        {pendingDrivers.filter(d=>!approvedIds.includes(d.id)).length > 0 && (
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginBottom:24}}>
            <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}>
              <AlertTriangle size={16} style={{color:'var(--amber)'}}/>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>Drivers ({pendingDrivers.filter(d=>!approvedIds.includes(d.id)).length})</div>
                <div style={{fontSize:12,color:'var(--text-2)'}}>Awaiting license verification</div>
              </div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
                    {['NAME','VEHICLE','PLATE','LICENSE','PHONE','JOINED','ACTIONS'].map(h=>(
                      <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingDrivers.filter(d=>!approvedIds.includes(d.id)).map((d,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{d.name}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{d.vehicle}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12}}>{d.plate}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{d.license}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{d.phone}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{d.joined}</td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>approve(d)}
                            style={{padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer',transition:'opacity 150ms'}}
                            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                            ✓ Approve
                          </button>
                          <button onClick={()=>setSel(d)}
                            style={{padding:'5px 12px',borderRadius:6,fontSize:12,background:'transparent',color:'var(--text-2)',border:'1px solid var(--border)',cursor:'pointer',transition:'all 150ms'}}
                            onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-elevated)';e.currentTarget.style.color='var(--text-1)'}}
                            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-2)'}}>
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pendingOperators.length > 0 && (
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontWeight:600,fontSize:14}}>Operators ({pendingOperators.length})</div>
              <div style={{fontSize:12,color:'var(--text-2)'}}>Awaiting verification</div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
                    {['COMPANY','PHONE','BASE','ALSO DRIVER','JOINED','ACTION'].map(h=>(
                      <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingOperators.map((o,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{o.company}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{o.phone}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{o.base}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{o.alsoDriver?'Yes':'No'}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{o.joined}</td>
                      <td style={{padding:'12px 16px'}}>
                        <button onClick={()=>toast.success(`${o.company} verified`)}
                          style={{padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer'}}>
                          ✓ Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Driver Detail Drawer */}
      <AnimatePresence>
        {sel && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSel(null)}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:50,display:'flex',justifyContent:'flex-end'}}>
            <motion.div initial={{x:60,opacity:0}} animate={{x:0,opacity:1}} exit={{x:60,opacity:0}} transition={{duration:0.26}}
              onClick={e=>e.stopPropagation()}
              style={{width:440,background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',height:'100%',overflowY:'auto',padding:24}}>

              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
                <div>
                  <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>{sel.name}</div>
                  <StatusBadge status="pending"/>
                </div>
                <button onClick={()=>setSel(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-2)',padding:4}}>
                  <X size={18}/>
                </button>
              </div>

              {/* Vehicle Photo Placeholder */}
              <div style={{marginBottom:16}}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>VEHICLE PHOTO</div>
                <div onClick={()=>setLightbox(true)}
                  style={{height:180,background:'var(--bg-elevated)',borderRadius:12,border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'background 150ms'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                  onMouseLeave={e=>e.currentTarget.style.background='var(--bg-elevated)'}>
                  <div style={{textAlign:'center',color:'var(--text-3)'}}>
                    <ZoomIn size={22} style={{margin:'0 auto 6px'}}/>
                    <div style={{fontSize:11}}>No photo uploaded · Click to enlarge</div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{background:'var(--bg-elevated)',borderRadius:10,padding:16,marginBottom:20}}>
                {[
                  ['VEHICLE', sel.vehicle],
                  ['PLATE', sel.plate],
                  ['PHONE', sel.phone],
                  ['LICENSE #', sel.license],
                  ['EXPIRY', sel.expiry],
                  ['BASE', sel.location],
                  ['JOINED', sel.joined],
                ].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1}}>{l}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-1)'}}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div>
                  <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6}}>
                    REJECTION REASON (OPTIONAL)
                  </label>
                  <textarea value={rejection} onChange={e=>setRejection(e.target.value)} placeholder="Enter reason if rejecting..."
                    rows={3} style={{width:'100%',background:'var(--bg-base)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',fontSize:13,color:'var(--text-1)',resize:'none',outline:'none',fontFamily:'var(--font-body)',transition:'border-color 150ms'}}
                    onFocus={e=>e.target.style.borderColor='var(--teal)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                </div>
                <button onClick={()=>approve(sel)}
                  style={{padding:'10px',borderRadius:8,fontSize:13,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer',transition:'opacity 150ms'}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  ✓ Approve Driver
                </button>
                <button onClick={()=>{toast.error(`${sel.name} rejected`);setRejection('');setSel(null)}}
                  style={{padding:'10px',borderRadius:8,fontSize:13,background:'var(--red-bg)',color:'var(--red)',border:'1px solid rgba(239,68,68,0.2)',cursor:'pointer'}}>
                  ✗ Reject Application
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLightbox(false)}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'var(--bg-elevated)',borderRadius:12,padding:40,textAlign:'center',color:'var(--text-3)'}}>
              <div style={{fontSize:14,marginBottom:4}}>Vehicle Photo</div>
              <div style={{fontSize:12}}>No photo uploaded yet</div>
            </div>
            <button onClick={()=>setLightbox(false)}
              style={{position:'absolute',top:20,right:24,background:'none',border:'none',color:'white',fontSize:28,cursor:'pointer',lineHeight:1}}>×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
