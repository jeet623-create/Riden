'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import NotificationBell from '@/components/NotificationBell'

type Stats = {active:number;pending:number;doneWeek:number;payPending:number}
type Booking = {id:string;booking_ref:string;client_name:string;status:string;booking_type:string;total_days:number;created_at:string}
type Lang = 'en'|'th'; type Theme = 'dark'|'light'

const STATUS_MAP: Record<string,string> = {pending:'badge-pending',operator_notified:'badge-pending',operator_accepted:'badge-progress',driver_assigned:'badge-progress',in_progress:'badge-active',completed:'badge-done',cancelled:'badge-error',confirmed:'badge-progress'}

const T = {
  en:{greeting:['Good morning','Good afternoon','Good evening'],active:'Active Trips',pending:'Pending',doneWeek:'Done This Week',payPending:'Payments Due',recent:'Recent Bookings',viewAll:'View all',liveTrips:'Live Trips',actions:'Quick Actions',account:'Account',newBooking:'New Booking',allBookings:'All Bookings',calendar:'Calendar',trips:'Live Trips',payments:'Payments',reports:'Reports',support:'Support',noBookings:'No bookings yet',createFirst:'Create your first booking',signOut:'Sign out',privacy:'Privacy Policy',nav:['Dashboard','Bookings','Calendar','Trips','Payments','Reports','Support']},
  th:{greeting:['สวัสดีตอนเช้า','สวัสดีตอนบ่าย','สวัสดีตอนเย็น'],active:'ทริปที่ใช้งาน',pending:'รอดำเนินการ',doneWeek:'เสร็จสัปดาห์นี้',payPending:'รอชำระเงิน',recent:'การจองล่าสุด',viewAll:'ดูทั้งหมด',liveTrips:'ทริปสด',actions:'การดำเนินการด่วน',account:'บัญชี',newBooking:'จองใหม่',allBookings:'การจองทั้งหมด',calendar:'ปฏิทิน',trips:'ทริปสด',payments:'การชำระเงิน',reports:'รายงาน',support:'ฝ่ายสนับสนุน',noBookings:'ยังไม่มีการจอง',createFirst:'สร้างการจองแรก',signOut:'ออกจากระบบ',privacy:'นโยบายความเป็นส่วนตัว',nav:['แดชบอร์ด','การจอง','ปฏิทิน','ทริป','การชำระเงิน','รายงาน','ฝ่ายสนับสนุน']}
}
const NAV_HREFS = ['/dashboard','/bookings','/calendar','/trips','/payments','/reports','/support']

export default function DashboardPage() {
  const router = useRouter()
  const [lang,setLangState]=useState<Lang>('en')
  const [theme,setThemeState]=useState<Theme>('dark')
  const [user,setUser]=useState<{email:string;company:string}|null>(null)
  const [stats,setStats]=useState<Stats>({active:0,pending:0,doneWeek:0,payPending:0})
  const [bookings,setBookings]=useState<Booking[]>([])
  const [live,setLive]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [time,setTime]=useState(new Date())

  useEffect(()=>{
    setInterval(()=>setTime(new Date()),30000)
    const l=(localStorage.getItem('riden_lang') as Lang)||'en'
    const th=(localStorage.getItem('riden_theme') as Theme)||'dark'
    setLangState(l);setThemeState(th)
    document.documentElement.setAttribute('data-theme',th)
    createClient().auth.getUser().then(async({data:{user:u}})=>{
      if(!u){router.push('/login');return}
      const[dmc,bk,tr]=await Promise.all([
        createClient().from('dmc_users').select('company_name,email').eq('id',u.id).single(),
        createClient().from('bookings').select('*').eq('dmc_id',u.id).order('created_at',{ascending:false}).limit(8),
        createClient().from('trips').select('*').eq('dmc_id',u.id).in('status',['in_progress','driver_assigned','operator_accepted'])
      ])
      if(dmc.data)setUser({email:dmc.data.email,company:dmc.data.company_name})
      const bks=bk.data??[];const trs=tr.data??[]
      setBookings(bks);setLive(trs)
      const wa=new Date();wa.setDate(wa.getDate()-7)
      setStats({active:trs.filter(t=>t.status==='in_progress').length,pending:bks.filter(b=>['pending','operator_notified'].includes(b.status)).length,doneWeek:bks.filter(b=>b.status==='completed'&&new Date(b.created_at)>wa).length,payPending:bks.filter(b=>b.status==='confirmed').length})
      setLoading(false)
    })
  },[router])

  function toggleTheme(){const n=theme==='dark'?'light':'dark';setThemeState(n);localStorage.setItem('riden_theme',n);document.documentElement.setAttribute('data-theme',n)}
  function toggleLang(){const n=lang==='en'?'th':'en';setLangState(n);localStorage.setItem('riden_lang',n)}
  async function signOut(){await createClient().auth.signOut();router.push('/login')}

  const t=T[lang]
  const hr=time.getHours()
  const greeting=t.greeting[hr<12?0:hr<17?1:2]
  const STATS=[{label:t.active,v:stats.active,c:'#19C977',bg:'rgba(25,201,119,0.1)'},{label:t.pending,v:stats.pending,c:'#F59E0B',bg:'rgba(245,158,11,0.1)'},{label:t.doneWeek,v:stats.doneWeek,c:'#60A5FA',bg:'rgba(96,165,250,0.1)'},{label:t.payPending,v:stats.payPending,c:'#C084FC',bg:'rgba(192,132,252,0.1)'}]
  const ACTIONS=[{l:t.newBooking,h:'/bookings/new',p:true},{l:t.allBookings,h:'/bookings'},{l:t.calendar,h:'/calendar'},{l:t.trips,h:'/trips'},{l:t.payments,h:'/payments'},{l:t.reports,h:'/reports'},{l:t.support,h:'/support'}]

  return (
    <div className="page-bg">
      <div className="grid-bg" />
      <nav style={{position:'sticky',top:0,zIndex:50,borderBottom:'1px solid var(--c-border)',background:'rgba(7,16,13,0.85)',backdropFilter:'blur(20px)'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:28}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:30,height:30,background:'var(--c-teal)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span style={{fontWeight:800,fontSize:16,letterSpacing:'-0.04em'}}>RIDEN</span>
            </div>
            <div style={{display:'flex',gap:2}}>
              {t.nav.map((label:string,i:number)=>(<Link key={NAV_HREFS[i]} href={NAV_HREFS[i]} style={{textDecoration:'none'}}><button className={`nav-pill ${NAV_HREFS[i]==='/dashboard'?'active':''}`}>{label}</button></Link>))}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div className="toggle-pill">{(['en','th'] as const).map(l=>(<button key={l} className={`toggle-opt ${lang===l?'on':''}`} onClick={toggleLang}>{l==='en'?'EN':'ไทย'}</button>))}</div>
            <button className="btn btn-icon" onClick={toggleTheme}>{theme==='dark'?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}</button>
            <NotificationBell />
            <Link href="/bookings/new"><button className="btn btn-primary" style={{padding:'7px 16px',fontSize:13}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>{t.newBooking}</button></Link>
            <button className="btn btn-ghost" onClick={signOut} style={{padding:'7px 14px',fontSize:13}}>{t.signOut}</button>
          </div>
        </div>
      </nav>
      <main style={{maxWidth:1280,margin:'0 auto',padding:'40px 24px'}}>
        <div className="anim-fade-up" style={{marginBottom:32}}>
          <h1 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.03em',marginBottom:4}}>{greeting}{user?`, ${user.company}`:''}</h1>
          <p style={{color:'var(--c-text2)',fontSize:14}}>{time.toLocaleDateString(lang==='en'?'en-GB':'th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div className="anim-fade-up s1" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
          {STATS.map((s,i)=>(<div key={s.label} className="card" style={{borderRadius:16,padding:'20px 18px'}}><div style={{width:38,height:38,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}><div style={{width:10,height:10,borderRadius:'50%',background:s.c}}/></div><div className="stat-value" style={{color:s.c,animationDelay:`${i*0.07}s`}}>{loading?'—':s.v}</div><div className="t-label" style={{marginTop:6}}>{s.label}</div></div>))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 290px',gap:20}}>
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <div className="card anim-fade-up s2" style={{borderRadius:16}}>
              <div style={{padding:'18px 22px',borderBottom:'1px solid var(--c-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontWeight:700,fontSize:14}}>{t.recent}</span>
                <Link href="/bookings" style={{textDecoration:'none'}}><span style={{fontSize:13,color:'var(--c-teal)'}}>{t.viewAll} →</span></Link>
              </div>
              {loading?(<div style={{padding:20,display:'flex',flexDirection:'column',gap:10}}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:50}}/>)}</div>):bookings.length===0?(<div style={{padding:48,textAlign:'center'}}><p style={{fontWeight:600,marginBottom:4}}>{t.noBookings}</p><p style={{color:'var(--c-text2)',fontSize:13,marginBottom:20}}>{t.createFirst}</p><Link href="/bookings/new"><button className="btn btn-primary">{t.newBooking}</button></Link></div>):(<div>{bookings.map((b,i)=>(<Link key={b.id} href={`/bookings/${b.id}`} style={{textDecoration:'none'}}><div className="anim-slide-in" style={{animationDelay:`${i*0.04}s`,padding:'13px 22px',borderBottom:'1px solid var(--c-border)',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'background 0.1s'}} onMouseEnter={e=>(e.currentTarget.style.background='var(--c-s3)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}><div style={{display:'flex',alignItems:'center',gap:14}}><span className="t-mono" style={{color:'var(--c-teal)',minWidth:88}}>{b.booking_ref}</span><span style={{fontWeight:600,fontSize:14}}>{b.client_name}</span><span style={{fontSize:12,color:'var(--c-text2)',textTransform:'capitalize'}}>{b.booking_type?.replace(/_/g,' ')} · {b.total_days}d</span></div><span className={`badge ${STATUS_MAP[b.status]??'badge-neutral'}`}>{b.status}</span></div></Link>))}</div>)}
            </div>
            {live.length>0&&(<div className="card anim-fade-up s3" style={{borderRadius:16}}><div style={{padding:'18px 22px',borderBottom:'1px solid var(--c-border)',display:'flex',alignItems:'center',gap:10}}><div className="dot-live"/><span style={{fontWeight:700,fontSize:14}}>{t.liveTrips}</span></div>{live.map(tr=>(<div key={tr.id} style={{padding:'13px 22px',borderBottom:'1px solid var(--c-border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontWeight:600,fontSize:14}}>{tr.pickup_location} → {tr.dropoff_location}</div><div style={{fontSize:12,color:'var(--c-text2)',marginTop:2}}>{tr.vehicle_type}</div></div><span className={`badge ${STATUS_MAP[tr.status]??'badge-neutral'}`}>{tr.status}</span></div>))}</div>)}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="card anim-fade-up s2" style={{borderRadius:16,padding:18}}>
              <p className="t-label" style={{marginBottom:12}}>{t.actions}</p>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>{ACTIONS.map(a=>(<Link key={a.h} href={a.h} style={{textDecoration:'none'}}><button className={`btn ${a.p?'btn-primary':'btn-ghost'}`} style={{width:'100%',justifyContent:'flex-start',padding:'9px 13px',fontSize:13}}>{a.l}</button></Link>))}</div>
            </div>
            <div className="card anim-fade-up s3" style={{borderRadius:16,padding:18}}>
              <p className="t-label" style={{marginBottom:12}}>{t.account}</p>
              <p style={{fontWeight:700,fontSize:15,marginBottom:2}}>{user?.company}</p>
              <p style={{fontSize:12,color:'var(--c-text2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</p>
              <div className="divider" style={{margin:'14px 0'}}/>
              <Link href="/privacy" style={{textDecoration:'none'}}><span style={{fontSize:12,color:'var(--c-text3)'}}>{t.privacy}</span></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}