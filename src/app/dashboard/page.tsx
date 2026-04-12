'use client'
import{useEffect,useState}from'react'
import{useRouter}from'next/navigation'
import Link from'next/link'
import{createClient}from'@/lib/supabase'
import NotificationBell from'@/components/NotificationBell'
type Stats={activeTrips:number;pendingConfirmations:number;completedThisWeek:number;paymentsPending:number}
type Booking={id:string;booking_ref:string;client_name:string;total_days:number;status:string;created_at:string}
const SB:Record<string,string>={pending:'badge-pending',confirmed:'badge-confirmed',operator_notified:'badge-pending',operator_accepted:'badge-confirmed',driver_assigned:'badge-confirmed',in_progress:'badge-progress',completed:'badge-completed',cancelled:'badge-cancelled'}
const NAV=[{l:'Dashboard',h:'/dashboard'},{l:'Bookings',h:'/bookings'},{l:'Calendar',h:'/calendar'},{l:'Trips',h:'/trips'},{l:'Payments',h:'/payments'},{l:'Reports',h:'/reports'},{l:'Support',h:'/support'}]
const QA=[{l:'New Booking',h:'/bookings/new',p:true},{l:'All Bookings',h:'/bookings',p:false},{l:'Calendar',h:'/calendar',p:false},{l:'Live Trips',h:'/trips',p:false},{l:'Payments',h:'/payments',p:false},{l:'Reports',h:'/reports',p:false},{l:'Support',h:'/support',p:false}]
export default function DashboardPage(){
  const router=useRouter()
  const[user,setUser]=useState<{email:string;company:string}|null>(null)
  const[stats,setStats]=useState<Stats>({activeTrips:0,pendingConfirmations:0,completedThisWeek:0,paymentsPending:0})
  const[bookings,setBookings]=useState<Booking[]>([])
  const[loading,setLoading]=useState(true)
  const[time,setTime]=useState(new Date())
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),60000);return()=>clearInterval(t)},[])
  useEffect(()=>{
    async function load(){
      const sb=createClient()
      const{data:{user:au}}=await sb.auth.getUser()
      if(!au){router.push('/login');return}
      const{data:d}=await sb.from('dmc_users').select('company_name,email').eq('id',au.id).single()
      if(d)setUser({email:d.email,company:d.company_name})
      const wa=new Date();wa.setDate(wa.getDate()-7)
      const{data:bk}=await sb.from('bookings').select('*').eq('dmc_id',au.id).order('created_at',{ascending:false}).limit(10)
      const b=bk??[]
      setBookings(b)
      setStats({activeTrips:0,pendingConfirmations:b.filter((x:Booking)=>x.status==='pending').length,completedThisWeek:b.filter((x:Booking)=>x.status==='completed'&&new Date(x.created_at)>wa).length,paymentsPending:b.filter((x:Booking)=>x.status==='confirmed').length})
      setLoading(false)
    }
    load()
  },[router])
  const logout=async()=>{await createClient().auth.signOut();router.push('/login')}
  const hr=time.getHours()
  const greet=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening'
  return(
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none"/>
      <nav className="relative z-50 border-b border-riden-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-riden-teal rounded-lg flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <span className="font-display text-riden-white font-700 text-lg">RIDEN</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({l,h})=>(<Link key={h} href={h}><button className={"px-3 py-1.5 rounded-lg text-sm font-medium transition-all "+(h==='/dashboard'?'bg-riden-teal/15 text-riden-teal':'text-riden-text hover:text-riden-white hover:bg-riden-card/50')}>{l}</button></Link>))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell/>
            <Link href="/bookings/new"><button className="btn-primary px-4 py-2 text-sm">+ New Booking</button></Link>
            <button onClick={logout} className="btn-ghost px-3 py-2 text-sm">Sign out</button>
          </div>
        </div>
      </nav>
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-700 text-riden-white">{greet}, {user?.company??'Loading...'}</h1>
          <p className="text-riden-text mt-1">{time.toLocaleDateString('en',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[{label:'Active Trips',value:stats.activeTrips,color:'text-green-400'},{label:'Pending',value:stats.pendingConfirmations,color:'text-yellow-400'},{label:'Done This Week',value:stats.completedThisWeek,color:'text-riden-teal'},{label:'Payments Due',value:stats.paymentsPending,color:'text-blue-400'}].map(s=>(<div key={s.label} className="glass rounded-xl p-5"><div className={"font-display text-4xl font-700 "+s.color}>{loading?'-':s.value}</div><div className="text-riden-text text-sm mt-1">{s.label}</div></div>))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display font-600 text-riden-white">Recent Bookings</h2><Link href="/bookings" className="text-riden-teal text-sm">View all</Link></div>
            {loading?(<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 glass rounded-lg animate-pulse"/>)}</div>):bookings.length===0?(<div className="text-center py-8"><p className="text-riden-white text-sm mb-3">No bookings yet</p><Link href="/bookings/new"><button className="btn-primary px-4 py-2 text-sm">Create First Booking</button></Link></div>):(<div className="space-y-2">{bookings.map(b=>(<Link href={"/bookings/"+b.id} key={b.id}><div className="flex items-center justify-between p-3 glass rounded-lg hover:bg-riden-card/50 cursor-pointer"><div className="flex items-center gap-3"><span className="font-mono text-xs text-riden-teal">{b.booking_ref}</span><span className="text-riden-white text-sm">{b.client_name}</span></div><span className={"px-2 py-0.5 rounded text-xs "+(SB[b.status]||'badge-pending')}>{b.status}</span></div></Link>))}</div>)}
          </div></div>
          <div className="space-y-3">
            <div className="glass rounded-xl p-5"><h2 className="font-display font-600 text-riden-white text-sm mb-3">Quick Actions</h2><div className="space-y-2">{QA.map(a=>(<Link key={a.h} href={a.h}><button className={"w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium "+(a.p?'btn-primary':'glass glass-hover text-riden-text')}>{a.l}</button></Link>))}</div></div>
            <div className="glass rounded-xl p-4"><div className="text-riden-muted text-xs font-mono uppercase mb-2">Account</div><div className="text-riden-white text-sm">{user?.company}</div><div className="text-riden-muted text-xs truncate">{user?.email}</div><Link href="/privacy" className="text-riden-muted text-xs hover:text-riden-teal mt-2 block">Privacy Policy</Link></div>
          </div>
        </div>
      </main>
    </div>
  )
}