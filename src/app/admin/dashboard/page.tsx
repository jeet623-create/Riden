'use client'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatCard } from '@/components/admin/stat-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { Building2, Users, UserCheck, DollarSign, Map, Car, Clock, ClipboardList, RefreshCw, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const bookingTrend = [{date:'Apr 10',bookings:12},{date:'Apr 11',bookings:19},{date:'Apr 12',bookings:15},{date:'Apr 13',bookings:22},{date:'Apr 14',bookings:28},{date:'Apr 15',bookings:25},{date:'Apr 16',bookings:23}]
const revenueTrend = [{month:'Nov',revenue:142000},{month:'Dec',revenue:158000},{month:'Jan',revenue:165000},{month:'Feb',revenue:172000},{month:'Mar',revenue:179000},{month:'Apr',revenue:186000}]
const recentBookings = [
  {ref:'BK-2026-001',client:'Singapore Tours Ltd',dmc:'Bangkok Express DMC',days:5,status:'confirmed',created:'2026-04-14'},
  {ref:'BK-2026-002',client:'Euro Travel Group',dmc:'Chiang Mai Adventures',days:3,status:'pending',created:'2026-04-14'},
  {ref:'BK-2026-003',client:'Asia Pacific Tours',dmc:'Phuket Premier DMC',days:7,status:'confirmed',created:'2026-04-13'},
  {ref:'BK-2026-004',client:'Global Destinations',dmc:'Bangkok Express DMC',days:4,status:'in_progress',created:'2026-04-13'},
  {ref:'BK-2026-005',client:'Luxury Escapes Co',dmc:'Krabi Elite Travel',days:6,status:'confirmed',created:'2026-04-12'},
]
const pendingDrivers = 12
const tt = {contentStyle:{backgroundColor:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--font-mono)',fontSize:12}}
const stagger = (i:number) => ({initial:{opacity:0,y:8},animate:{opacity:1,y:0},transition:{delay:i*0.05,duration:0.2}})

export default function DashboardPage() {
  const date = new Date().toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long'})
  return (
    <AdminShell>
      <motion.div {...stagger(0)} className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{fontSize:22,fontWeight:700,fontFamily:'var(--font-body)'}}>Command Center</h1>
          <p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>{date} · Bangkok</p>
        </div>
        <button style={{display:'flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:8,fontSize:12,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:'var(--text-2)',cursor:'pointer'}}>
          <RefreshCw size={14}/>Refresh
        </button>
      </motion.div>

      <motion.div {...stagger(1)} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:16}}>
        <StatCard label="Active DMCs" value={47} sublabel="companies" color="teal" icon={<Building2 size={18}/>}/>
        <StatCard label="Operators" value={182} sublabel="fleet owners" color="blue" icon={<Users size={18}/>}/>
        <StatCard label="Verified Drivers" value={329} sublabel="in pool" color="green" icon={<UserCheck size={18}/>}/>
        <StatCard label="Est. MRR" value="฿186,000" sublabel="monthly recurring" color="amber" icon={<DollarSign size={18}/>}/>
      </motion.div>
      <motion.div {...stagger(2)} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        <StatCard label="Active Trips" value={23} sublabel="running now" color="green" icon={<Map size={18}/>}/>
        <StatCard label="Vehicles" value={456} sublabel="active fleet" color="grey" icon={<Car size={18}/>}/>
        <StatCard label="Pending Review" value={12} sublabel="need approval" color="amber" icon={<Clock size={18}/>}/>
        <StatCard label="Recent Bookings" value={89} sublabel="this week" color="blue" icon={<ClipboardList size={18}/>}/>
      </motion.div>

      <AnimatePresence>
        {pendingDrivers > 0 && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
            style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:12,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <AlertTriangle size={18} style={{color:'var(--amber)'}}/>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:'var(--amber)'}}>{pendingDrivers} drivers waiting for approval</div>
                <div style={{fontSize:12,color:'var(--text-2)'}}>Review driver applications to activate their accounts</div>
              </div>
            </div>
            <Link href="/admin/pending" style={{padding:'6px 14px',borderRadius:8,fontSize:12,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:'var(--text-2)',textDecoration:'none'}}>Review</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div {...stagger(3)} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:24}}>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}><h3 style={{fontSize:14,fontWeight:600}}>7-Day Booking Trend</h3></div>
          <div style={{padding:24}}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={bookingTrend}>
                <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--teal)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="date" stroke="var(--text-2)" style={{fontSize:11}}/><YAxis stroke="var(--text-2)" style={{fontSize:11}}/>
                <Tooltip {...tt}/><Area type="monotone" dataKey="bookings" stroke="var(--teal)" strokeWidth={2} fill="url(#bg)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)'}}><h3 style={{fontSize:14,fontWeight:600}}>MRR Growth</h3></div>
          <div style={{padding:24}}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="month" stroke="var(--text-2)" style={{fontSize:11}}/><YAxis stroke="var(--text-2)" style={{fontSize:11}}/>
                <Tooltip {...tt} formatter={(v:number)=>`฿${v.toLocaleString()}`}/>
                <Line type="monotone" dataKey="revenue" stroke="var(--teal)" strokeWidth={2} dot={{fill:'var(--teal)',r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div {...stagger(4)} style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid var(--border)'}}>
          <div><h3 style={{fontSize:14,fontWeight:600}}>Recent Bookings</h3><p style={{fontSize:12,color:'var(--text-2)',marginTop:2}}>Latest platform activity</p></div>
          <Link href="/admin/bookings" style={{fontSize:12,color:'var(--teal)',textDecoration:'none'}}>View all</Link>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg-base)'}}>
              {['REF','CLIENT','DMC','DAYS','STATUS','CREATED'].map(h=><th key={h} style={{textAlign:'left',padding:'10px 16px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{h}</th>)}
            </tr></thead>
            <tbody>{recentBookings.map((b,i)=>(
              <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 120ms',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:13,color:'var(--teal)'}}>{b.ref}</td>
                <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{b.client}</td>
                <td style={{padding:'12px 16px',fontSize:13,color:'var(--text-2)'}}>{b.dmc}</td>
                <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{b.days}d</td>
                <td style={{padding:'12px 16px'}}><StatusBadge status={b.status}/></td>
                <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-2)'}}>{b.created}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </motion.div>
    </AdminShell>
  )
}
