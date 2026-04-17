'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'

const dmcs = [
  {id:1,company:'Bangkok Express DMC',contact:'Somchai P.',email:'contact@bangkokexpress.com',country:'Thailand',language:'en',plan:'growth',status:'active',trialEnds:null,lineConnected:true,joined:'2025-11-15'},
  {id:2,company:'Chiang Mai Adventures',contact:'Niran C.',email:'info@cmadventures.com',country:'Thailand',language:'th',plan:'starter',status:'trial',trialEnds:'2026-04-30',lineConnected:false,joined:'2026-04-01'},
  {id:3,company:'Phuket Premier DMC',contact:'Prasert S.',email:'hello@phuketpremier.com',country:'Thailand',language:'en',plan:'pro',status:'active',trialEnds:null,lineConnected:true,joined:'2025-08-15'},
  {id:4,company:'Krabi Elite Travel',contact:'Wichai Y.',email:'support@krabielite.com',country:'Thailand',language:'en',plan:'growth',status:'active',trialEnds:null,lineConnected:true,joined:'2026-01-10'},
  {id:5,company:'Korea DMC Bangkok',contact:'Kim J.',email:'ops@koreabkk.com',country:'South Korea',language:'en',plan:'starter',status:'active',trialEnds:null,lineConnected:false,joined:'2026-02-20'},
  {id:6,company:'Euro Adventures Thailand',contact:'Mueller H.',email:'hello@euroadv.com',country:'Germany',language:'en',plan:'growth',status:'suspended',trialEnds:null,lineConnected:false,joined:'2026-03-01'},
]
const TABS = ['all','trial','active','expired','suspended']

export default function DmcsPage() {
  const [tab,setTab] = useState('all')
  const [q,setQ] = useState('')
  const [sel,setSel] = useState<typeof dmcs[0]|null>(null)
  const filtered = dmcs.filter(d=>{
    const matchTab = tab==='all'||d.status===tab
    const matchQ = !q||d.company.toLowerCase().includes(q.toLowerCase())||d.email.toLowerCase().includes(q.toLowerCase())
    return matchTab&&matchQ
  })
  return (
    <AdminShell>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{fontSize:22,fontWeight:700}}>DMC Management</h1>
            <p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>{dmcs.length} companies registered</p>
          </div>
          <Input icon="search" placeholder="Search company or email..." className="w-64" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:'5px 14px',borderRadius:99,fontSize:12,cursor:'pointer',textTransform:'capitalize',border:`1px solid ${tab===t?'var(--teal-20)':'var(--border)'}`,background:tab===t?'var(--teal-10)':'transparent',color:tab===t?'var(--teal)':'var(--text-3)',transition:'all 150ms'}}>
              {t}
            </button>
          ))}
        </div>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
                {['COMPANY','EMAIL','COUNTRY','PLAN','LINE','STATUS','JOINED',''].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{filtered.map((d,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',transition:'background 120ms'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{d.company}</td>
                  <td style={{padding:'12px 16px',fontSize:12,color:'var(--text-2)'}}>{d.email}</td>
                  <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{d.country}</td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)',textTransform:'capitalize'}}>{d.plan}</td>
                  <td style={{padding:'12px 16px'}}>
                    {d.lineConnected
                      ?<span style={{fontFamily:'var(--font-mono)',fontSize:10,padding:'2px 8px',borderRadius:99,background:'rgba(6,199,85,0.1)',color:'#06C755'}}>● Connected</span>
                      :<span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)'}}>—</span>}
                  </td>
                  <td style={{padding:'12px 16px'}}><StatusBadge status={d.status}/></td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{d.joined}</td>
                  <td style={{padding:'12px 16px'}}><button onClick={()=>setSel(d)} style={{padding:'4px 12px',borderRadius:6,fontSize:12,background:'transparent',border:'1px solid var(--border)',color:'var(--text-2)',cursor:'pointer'}}>Details</button></td>
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
                {[['CONTACT',sel.contact],['EMAIL',sel.email],['COUNTRY',sel.country],['LANGUAGE',sel.language.toUpperCase()],['PLAN',sel.plan],['TRIAL ENDS',sel.trialEnds||'—'],['JOINED',sel.joined]].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1}}>{l}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:12}}>{v}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0'}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1}}>LINE</span>
                  {sel.lineConnected
                    ?<span style={{fontFamily:'var(--font-mono)',fontSize:11,padding:'2px 10px',borderRadius:99,background:'rgba(6,199,85,0.1)',color:'#06C755'}}>● LINE Connected</span>
                    :<span style={{fontSize:12,color:'var(--text-3)'}}>Not connected</span>}
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {sel.status!=='active'&&<button onClick={()=>{toast.success('Account activated');setSel(null)}} style={{padding:'9px 16px',borderRadius:8,fontSize:13,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer'}}>✓ Activate Account</button>}
                {sel.status!=='suspended'&&<button onClick={()=>{toast.error('Account suspended');setSel(null)}} style={{padding:'9px 16px',borderRadius:8,fontSize:13,background:'var(--red-bg)',color:'var(--red)',border:'1px solid rgba(239,68,68,0.2)',cursor:'pointer'}}>⊘ Suspend Account</button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
