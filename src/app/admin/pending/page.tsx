'use client'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const pendingDrivers = [
  {id:1,name:'Somchai Pattana',vehicle:'van_9',plate:'BKK-1234',license:'DL-12345678',phone:'+66 82 123 4567',joined:'2026-04-14'},
  {id:2,name:'Prasert Suksawat',vehicle:'suv',plate:'PKT-9012',license:'DL-23456789',phone:'+66 87 345 6789',joined:'2026-04-13'},
  {id:3,name:'Sutin Nakornsri',vehicle:'van_9',plate:'BKK-2345',license:'DL-34567890',phone:'+66 84 678 9012',joined:'2026-04-12'},
]
const pendingOperators = [
  {id:1,company:'Island Express',phone:'+66 76 345 6789',base:'Phuket',alsoDriver:true,joined:'2026-04-10'},
]

export default function PendingPage() {
  const total = pendingDrivers.length + pendingOperators.length

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

        {pendingDrivers.length > 0 && (
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginBottom:24}}>
            <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}>
              <AlertTriangle size={16} style={{color:'var(--amber)'}}/>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>Drivers ({pendingDrivers.length})</div>
                <div style={{fontSize:12,color:'var(--text-2)'}}>Awaiting license verification</div>
              </div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
                    {['NAME','VEHICLE','PLATE','LICENSE','PHONE','JOINED','ACTIONS'].map(h => (
                      <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingDrivers.map((d,i) => (
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{d.name}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)',textTransform:'capitalize'}}>{d.vehicle.replace('_',' ')}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12}}>{d.plate}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{d.license}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{d.phone}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{d.joined}</td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={() => toast.success(`${d.name} approved`)}
                            style={{padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer'}}>✓ Approve</button>
                          <button style={{padding:'5px 12px',borderRadius:6,fontSize:12,background:'transparent',color:'var(--text-2)',border:'1px solid var(--border)',cursor:'pointer'}}>View</button>
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
                    {['COMPANY','PHONE','BASE','ALSO DRIVER','JOINED','ACTION'].map(h => (
                      <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingOperators.map((o,i) => (
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{o.company}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{o.phone}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{o.base}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{o.alsoDriver?'Yes':'No'}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{o.joined}</td>
                      <td style={{padding:'12px 16px'}}>
                        <button onClick={() => toast.success(`${o.company} verified`)}
                          style={{padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer'}}>✓ Verify</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </AdminShell>
  )
}
