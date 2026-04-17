'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const subs = [
  {company:'Bangkok Express DMC',email:'contact@bangkokexpress.com',plan:'growth',amount:4000,start:'2025-11-20',end:'2026-11-20',status:'active'},
  {company:'Chiang Mai Adventures',email:'info@cmadventures.com',plan:'starter',amount:2000,start:'2026-04-01',end:'2026-04-30',status:'trial'},
  {company:'Phuket Premier DMC',email:'hello@phuketpremier.com',plan:'pro',amount:6000,start:'2025-08-15',end:'2026-08-15',status:'active'},
  {company:'Krabi Elite Travel',email:'support@krabielite.com',plan:'growth',amount:4000,start:'2026-01-10',end:'2027-01-10',status:'active'},
]
const plans = [{name:'starter',price:2000},{name:'growth',price:4000},{name:'pro',price:6000}]

export default function SubscriptionsPage() {
  const [modal,setModal] = useState(false)
  const [selPlan,setSelPlan] = useState('')
  const [selDmc,setSelDmc] = useState('')
  const [months,setMonths] = useState(12)
  const [activating,setActivating] = useState(false)
  const total = (plans.find(p=>p.name===selPlan)?.price??0)*months

  async function activate() {
    if(!selDmc||!selPlan) return
    setActivating(true)
    await new Promise(r=>setTimeout(r,900))
    toast.success('Subscription activated!')
    setActivating(false); setModal(false); setSelPlan(''); setSelDmc(''); setMonths(12)
  }

  return (
    <AdminShell>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{fontSize:22,fontWeight:700}}>Subscriptions</h1>
            <p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>Manual bank transfer activation</p>
          </div>
          <button onClick={()=>setModal(true)}
            style={{display:'flex',alignItems:'center',gap:8,padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:'pointer'}}>
            <Plus size={14}/>Activate Plan
          </button>
        </div>

        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
                {['COMPANY','EMAIL','PLAN','AMOUNT','START','END','STATUS'].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{subs.map((s,i)=>(
                <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{s.company}</td>
                  <td style={{padding:'12px 16px',fontSize:12,color:'var(--text-2)'}}>{s.email}</td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)',textTransform:'capitalize'}}>{s.plan}</td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:13,color:'var(--green)'}}>฿{s.amount.toLocaleString()}</td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{s.start}</td>
                  <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{s.end}</td>
                  <td style={{padding:'12px 16px'}}><StatusBadge status={s.status}/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {modal&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
            onClick={()=>setModal(false)}>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}} transition={{duration:0.18}}
              onClick={e=>e.stopPropagation()}
              style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:20,width:'100%',maxWidth:460,overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 24px',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:15,fontWeight:600}}>Activate Subscription</div>
                <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-2)'}}><X size={18}/></button>
              </div>
              <div style={{padding:24,display:'flex',flexDirection:'column',gap:18}}>
                <div>
                  <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:2,display:'block',marginBottom:8}}>DMC COMPANY</label>
                  <select value={selDmc} onChange={e=>setSelDmc(e.target.value)}
                    style={{width:'100%',background:'var(--bg-elevated)',border:`1px solid ${!selDmc&&activating?'var(--red)':'var(--border)'}`,borderRadius:8,height:38,padding:'0 12px',fontSize:13,color:'var(--text-1)',outline:'none',cursor:'pointer'}}>
                    <option value="">Select DMC...</option>
                    {subs.map(s=><option key={s.company} value={s.company}>{s.company}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:2,display:'block',marginBottom:8}}>PLAN</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {plans.map(p=>(
                      <button key={p.name} onClick={()=>setSelPlan(p.name)}
                        style={{padding:'10px 8px',borderRadius:8,border:`1px solid ${selPlan===p.name?'var(--teal-20)':'var(--border)'}`,background:selPlan===p.name?'var(--teal-10)':'var(--bg-elevated)',cursor:'pointer',transition:'all 150ms',textAlign:'center'}}>
                        <div style={{fontSize:13,fontWeight:600,color:selPlan===p.name?'var(--teal)':'var(--text-1)',textTransform:'capitalize',marginBottom:4}}>{p.name}</div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-3)'}}>฿{p.price.toLocaleString()}/mo</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:2,display:'block',marginBottom:8}}>MONTHS</label>
                  <input type="number" value={months} onChange={e=>setMonths(Math.max(1,Math.min(24,Number(e.target.value))))} min={1} max={24}
                    style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,height:38,padding:'0 12px',fontSize:13,color:'var(--text-1)',outline:'none'}}
                    onFocus={e=>e.target.style.borderColor='var(--teal)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                </div>
                <AnimatePresence>
                  {selPlan&&selDmc&&(
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      style={{background:'var(--teal-10)',border:'1px solid var(--teal-20)',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:13,color:'var(--text-2)'}}>Total Amount</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:18,fontWeight:700,color:'var(--teal)'}}>฿{total.toLocaleString()}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div style={{display:'flex',gap:8,padding:'0 24px 24px'}}>
                <button onClick={()=>setModal(false)} style={{flex:1,padding:'9px',borderRadius:8,fontSize:13,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:'var(--text-2)',cursor:'pointer'}}>Cancel</button>
                <button onClick={activate} disabled={!selDmc||!selPlan||activating}
                  style={{flex:1,padding:'9px',borderRadius:8,fontSize:13,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:!selDmc||!selPlan?'not-allowed':'pointer',opacity:!selDmc||!selPlan?0.5:1}}>
                  {activating?'Activating...':'✓ Activate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
