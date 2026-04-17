'use client'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatCard } from '@/components/admin/stat-card'
import { TrendingUp, Banknote, UserCheck, Timer, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

const monthlyRevenue = [
  {month:'Nov',revenue:142000},{month:'Dec',revenue:158000},{month:'Jan',revenue:165000},
  {month:'Feb',revenue:172000},{month:'Mar',revenue:179000},{month:'Apr',revenue:186000},
]
const planBreakdown = [
  {plan:'Starter',count:18,amount:2000},{plan:'Growth',count:22,amount:4000},{plan:'Pro',count:7,amount:6000},
]
const recentPayments = [
  {company:'Bangkok Express DMC',plan:'Growth',date:'2026-04-15',amount:4000},
  {company:'Phuket Premier DMC',plan:'Pro',date:'2026-04-14',amount:6000},
  {company:'Krabi Elite Travel',plan:'Growth',date:'2026-04-13',amount:4000},
  {company:'Korea DMC Bangkok',plan:'Starter',date:'2026-04-12',amount:2000},
]
const allTx = [
  {company:'Bangkok Express DMC',email:'contact@bangkokexpress.com',plan:'growth',amount:4000,start:'2026-04-15',end:'2026-05-15'},
  {company:'Phuket Premier DMC',email:'hello@phuketpremier.com',plan:'pro',amount:6000,start:'2026-04-14',end:'2026-05-14'},
  {company:'Krabi Elite Travel',email:'support@krabielite.com',plan:'growth',amount:4000,start:'2026-04-13',end:'2026-05-13'},
]
const totalMRR = planBreakdown.reduce((s,p)=>s+p.count*p.amount,0)
const tt = {contentStyle:{backgroundColor:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--font-mono)',fontSize:12}}
const stagger = (i:number) => ({initial:{opacity:0,y:8},animate:{opacity:1,y:0},transition:{delay:i*0.06,duration:0.2}})

export default function FinancePage() {
  return (
    <AdminShell>
      <motion.div {...stagger(0)} className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{fontSize:22,fontWeight:700}}>Finance</h1>
          <p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>Revenue and subscription overview</p>
        </div>
        <button style={{display:'flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:8,fontSize:12,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:'var(--text-2)',cursor:'pointer'}}>
          <Download size={14}/>Export CSV
        </button>
      </motion.div>

      <motion.div {...stagger(1)} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        <StatCard label="MRR" value={`฿${totalMRR.toLocaleString()}`} sublabel="monthly recurring" color="teal" icon={<TrendingUp size={18}/>}/>
        <StatCard label="Total Collected" value="฿842,000" sublabel="all time" color="green" icon={<Banknote size={18}/>}/>
        <StatCard label="Active Subscribers" value={47} sublabel="paying now" color="blue" icon={<UserCheck size={18}/>}/>
        <StatCard label="On Trial" value={8} sublabel="converting" color="amber" icon={<Timer size={18}/>}/>
      </motion.div>

      <motion.div {...stagger(2)} style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginBottom:24}}>
        <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}><h3 style={{fontSize:14,fontWeight:600}}>MRR Growth</h3></div>
        <div style={{padding:24}}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="month" stroke="var(--text-2)" style={{fontSize:11}}/>
              <YAxis stroke="var(--text-2)" style={{fontSize:11}}/>
              <Tooltip {...tt} formatter={(v:number)=>`฿${v.toLocaleString()}`}/>
              <Bar dataKey="revenue" fill="var(--teal)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div {...stagger(3)} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:24}}>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:14,fontWeight:600}}>Plan Breakdown</div>
            <div style={{fontSize:12,color:'var(--text-2)',marginTop:2}}>Active subscribers by plan</div>
          </div>
          <div style={{padding:20,display:'flex',flexDirection:'column',gap:16}}>
            {planBreakdown.map(p=>{
              const pct = (p.count*p.amount)/totalMRR*100
              return (
                <div key={p.plan}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:13,fontWeight:500}}>{p.plan}</span>
                      <span style={{fontSize:11,color:'var(--text-3)'}}>{p.count} DMCs</span>
                    </div>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>฿{(p.count*p.amount).toLocaleString()}/mo</span>
                  </div>
                  <div style={{height:6,background:'var(--bg-elevated)',borderRadius:99,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:'var(--teal)',borderRadius:99,transition:'width 800ms ease'}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:14,fontWeight:600}}>Recent Payments</div>
            <div style={{fontSize:12,color:'var(--text-2)',marginTop:2}}>Latest activations</div>
          </div>
          <div style={{padding:'8px 0'}}>
            {recentPayments.map((p,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{p.company}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{p.plan} · {p.date}</div>
                </div>
                <span style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:500,color:'var(--green)'}}>+฿{p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div {...stagger(4)} style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
        <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}>
          <div style={{fontSize:14,fontWeight:600}}>All Transactions</div>
          <div style={{fontSize:12,color:'var(--text-2)',marginTop:2}}>{allTx.length} records</div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
              {['COMPANY','EMAIL','PLAN','AMOUNT','START','END'].map(h=>(
                <th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{allTx.map((t,i)=>(
              <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{t.company}</td>
                <td style={{padding:'12px 16px',fontSize:12,color:'var(--text-2)'}}>{t.email}</td>
                <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)',textTransform:'capitalize'}}>{t.plan}</td>
                <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:13,color:'var(--green)'}}>฿{t.amount.toLocaleString()}</td>
                <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{t.start}</td>
                <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{t.end}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </motion.div>
    </AdminShell>
  )
}
