'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import NotificationBell from '@/components/NotificationBell'

type Stats = { activeTrips: number; pendingConfirmations: number; completedThisWeek: number; paymentsPending: number }
type Booking = { id: string; booking_ref: string; client_name: string; total_days: number; status: string; created_at: string; booking_type: string }
type Trip = { id: string; status: string; trip_date: string; pickup_location: string; dropoff_location: string; vehicle_type: string }

const STATUS_BADGE: Record<string,string> = {
  pending:'badge-pending', confirmed:'badge-confirmed', operator_notified:'badge-pending',
  operator_accepted:'badge-confirmed', driver_assigned:'badge-confirmed',
  in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled'
}

const NAV_LINKS = [
  {label:'Dashboard',href:'/dashboard'},{label:'Bookings',href:'/bookings'},
  {label:'Calendar',href:'/calendar'},{label:'Trips',href:'/trips'},
  {label:'Payments',href:'/payments'},{label:'Reports',href:'/reports'},{label:'Support',href:'/support'}
]

const QUICK_ACTIONS = [
  {label:'New Booking',href:'/bookings/new',primary:true},
  {label:'All Bookings',href:'/bookings',primary:false},
  {label:'Calendar',href:'/calendar',primary:false},
  {label:'Live Trips',href:'/trips',primary:false},
  {label:'Payments',href:'/payments',primary:false},
  {label:'Reports',href:'/reports',primary:false},
  {label:'Support',href:'/support',primary:false},
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{email:string;company:string}|null>(null)
  const [stats, setStats] = useState<Stats>({activeTrips:0,pendingConfirmations:0,completedThisWeek:0,paymentsPending:0})
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [activeTrips, setActiveTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(()=>{ const t=setInterval(()=>setCurrentTime(new Date()),60000); return ()=>clearInterval(t) },[])

  useEffect(()=>{
    async function load() {
      const sb=createClient()
      const {data:{user:au}}=await sb.auth.getUser()
      if(!au){router.push('/login');return}
      const {data:dmc}=await sb.from('dmc_users').select('company_name,email').eq('id',au.id).single()
      if(dmc) setUser({email:dmc.email,company:dmc.company_name})
      const wa=new Date(); wa.setDate(wa.getDate()-7)
      const [bRes,tRes]=await Promise.all([
        sb.from('bookings').select('*').eq('dmc_id',au.id).order('created_at',{ascending:false}).limit(10),
        sb.from('trips').select('*').eq('dmc_id',au.id).in('status',['in_progress','driver_assigned','operator_accepted'])
      ])
      const bk=bRes.data??[]; const tr=tRes.data??[]
      setRecentBookings(bk); setActiveTrips(tr)
      setStats({
        activeTrips:tr.filter(t=>t.status==='in_progress').length,
        pendingConfirmations:bk.filter(b=>b.status==='pending'||b.status==='operator_notified').length,
        completedThisWeek:bk.filter(b=>b.status==='completed'&&new Date(b.created_at)>wa).length,
        paymentsPending:bk.filter(b=>b.status==='confirmed').length,
      })
      setLoading(false)
    }
    load()
  },[router])

  async function handleLogout(){await createClient().auth.signOut(); router.push('/login')}
  const hr=currentTime.getHours()
  const greeting=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening'

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-riden-teal rounded-lg flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <span className="font-display text-riden-white font-700 text-lg">RIDEN</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({label,href})=>(<Link key={href} href={href}><button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${href==='/dashboard'?'bg-riden-teal/15 text-riden-teal':'text-riden-text hover:text-riden-white hover:bg-riden-card/50'}`}>{label}</button></Link>))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/bookings/new"><button className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>New Booking</button></Link>
            <button onClick={handleLogout} className="btn-ghost px-3 py-2 text-sm">Sign out</button>
          </div>
        </div>
      </nav>
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8"><h1 className="font-display text-3xl font-700 text-riden-white">{greeting}, {user?.company??'Loading...'}</h1><p className="text-riden-text mt-1">{currentTime.toLocaleDateString('en',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[{label:'Active Trips',value:stats.activeTrips,color:'text-green-400'},{label:'Pending Confirmations',value:stats.pendingConfirmations,color:'text-yellow-400'},{label:'Completed This Week',value:stats.completedThisWeek,color:'text-riden-teal'},{label:'Payments Pending',value:stats.paymentsPending,color:'text-blue-400'}].map(s=>(<div key={s.label} className="glass rounded-xl p-5"><div className={`font-display text-4xl font-700 ${s.color}`}>{loading?'-':s.value}</div><div className="text-riden-text text-sm mt-1">{s.label}</div></div>))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4"><h2 className="font-display font-600 text-riden-white">Recent Bookings</h2><Link href="/bookings" className="text-riden-teal text-sm hover:underline">View all</Link></div>
              {loading?(<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 glass rounded-lg animate-pulse"/>)}</div>):recentBookings.length===0?(<div className="text-center py-8"><p className="text-riden-white font-medium mb-1">No bookings yet</p><Link href="/bookings/new"><button className="btn-primary px-5 py-2.5 text-sm mt-3">Create First Booking</button></Link></div>):(<div className="space-y-2">{recentBookings.map(b=>(<Link href={`/bookings/${b.id}`} key={b.id}><div className="flex items-center justify-between p-3 glass rounded-lg hover:bg-riden-card/50 cursor-pointer"><div className="flex items-center gap-3"><span className="font-mono text-xs text-riden-teal">{b.booking_ref}</span><span className="text-riden-white text-sm">{b.client_name}</span></div><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[b.status]??'badge-pending'}`}>{b.status}</span></div></Link>))}</div>)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-xl p-6"><h2 className="font-display font-600 text-riden-white mb-4">Quick Actions</h2><div className="space-y-2">{QUICK_ACTIONS.map(a=>(<Link key={a.href} href={a.href}><button className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${a.primary?'btn-primary':'glass glass-hover text-riden-text hover:text-riden-white'}`}>{a.label}</button></Link>))}</div></div>
            <div className="glass rounded-xl p-5"><div className="text-riden-muted text-xs font-mono uppercase tracking-wider mb-3">Account</div><div className="text-riden-white font-medium text-sm">{user?.company}</div><div className="text-riden-muted text-xs mt-1 truncate">{user?.email}</div><div className="mt-3 pt-3 border-t border-riden-border"><Link href="/privacy" className="text-riden-muted text-xs hover:text-riden-teal">Privacy Policy</Link></div></div>
          </div>
        </div>
      </main>
    </div>
  )
}
