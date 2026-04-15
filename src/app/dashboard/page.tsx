'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import NotificationBell from '@/components/NotificationBell'

type Stats = { active:number; pending:number; doneWeek:number; payPending:number }
type Booking = { id:string; booking_ref:string; client_name:string; status:string; booking_type:string; total_days:number; created_at:string }
type Lang = 'en'|'th'

const STATUS_BADGE: Record<string,string> = {
  pending:'badge-warning', operator_notified:'badge-warning',
  operator_accepted:'badge-progress', driver_assigned:'badge-progress',
  in_progress:'badge-progress', completed:'badge-completed',
  cancelled:'badge-cancelled', confirmed:'badge-confirmed',
}

const T = {
  en:{ g:['Good morning','Good afternoon','Good evening'], active:'Active Trips',
    pending:'Pending', doneWeek:'Done This Week', pay:'Payments Due',
    recent:'Recent Bookings', viewAll:'View all', live:'Live Trips',
    actions:'Quick Actions', acct:'Account', nb:'New Booking', signOut:'Sign out',
    nav:['Dashboard','Bookings','Calendar','Trips','Payments','Reports','Support'],
    privacy:'Privacy Policy', noBookings:'No bookings yet', createFirst:'Create your first booking' },
  th:{ g:['สวัสดีตอนเช้า','สวัสดีตอนบ่าย','สวัสดีตอนเย็น'],
    active:'ทริปที่ใช้งาน', pending:'รอการยืนยัน',
    doneWeek:'เสร็จสัปดาห์', pay:'รอชำระเงิน',
    recent:'การจองล่าสุด', viewAll:'ดูทั้งหมด',
    live:'ทริปสด', actions:'การดำเนินการด่วน',
    acct:'บัญชี', nb:'จองใหม่', signOut:'ออกจากระบบ',
    nav:['แดชบอร์ด','การจอง','ปฏิทิน','ทริป','ชำระเงิน','รายงาน','สนับสนุน'],
    privacy:'นโยบายความเป็นส่วนตัว',
    noBookings:'ยังไม่มีการจอง', createFirst:'สร้างการจองแรก' },
}
const NAV = ['/dashboard','/bookings','/calendar','/trips','/payments','/reports','/support']

export default function DashboardPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('en')
  const [user, setUser] = useState<{email:string;company:string}|null>(null)
  const [stats, setStats] = useState<Stats>({active:0,pending:0,doneWeek:0,payPending:0})
  const [bookings, setBookings] = useState<Booking[]>([])
  const [live, setLive] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lineLinked, setLineLinked] = useState<boolean|null>(null)
  const [lineCode, setLineCode] = useState('')
  const [lineLoading, setLineLoading] = useState(false)

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 30000)
    const l = (localStorage.getItem('riden_lang') as Lang)||'en'
    setLang(l)
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.push('/login'); return }
      const [dmc, bk, tr, ll] = await Promise.all([
        sb.from('dmc_users').select('company_name,email').eq('id',u.id).single(),
        sb.from('bookings').select('*').eq('dmc_id',u.id).order('created_at',{ascending:false}).limit(8),
        sb.from('trips').select('*').eq('dmc_id',u.id).in('status',['in_progress','driver_assigned','operator_accepted']),
        sb.from('dmc_users').select('line_user_id').eq('id',u.id).single(),
      ])
      if (dmc.data) setUser({email:dmc.data.email,company:dmc.data.company_name})
      const bks=bk.data??[]; const trs=tr.data??[]
      setBookings(bks); setLive(trs)
      setLineLinked(!!ll.data?.line_user_id)
      const wa=new Date(); wa.setDate(wa.getDate()-7)
      setStats({
        active:trs.filter((t:any)=>t.status==='in_progress').length,
        pending:bks.filter((b:any)=>['pending','operator_notified'].includes(b.status)).length,
        doneWeek:bks.filter((b:any)=>b.status==='completed'&&new Date(b.created_at)>wa).length,
        payPending:bks.filter((b:any)=>b.status==='confirmed').length,
      })
      setLoading(false)
    })
    return () => clearInterval(iv)
  }, [router])

  function toggleLang() { const n:Lang=lang==='en'?'th':'en'; setLang(n); localStorage.setItem('riden_lang',n) }
  async function signOut() { await createClient().auth.signOut(); router.push('/login') }
  async function getLineCode() {
    setLineLoading(true)
    const { data:{user:u} } = await createClient().auth.getUser()
    if (!u) return
    const res = await fetch((process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1/dmc-link-line',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dmc_id:u.id})
    })
    const d = await res.json()
    if (d.already_linked) setLineLinked(true)
    else if (d.code) setLineCode(d.code)
    setLineLoading(false)
  }

  const t = T[lang]
  const hr = time.getHours()
  const greeting = t.g[hr<12?0:hr<17?1:2]

  const STATS = [
    {l:t.active,   v:stats.active,     color:'var(--accent)'},
    {l:t.pending,  v:stats.pending,    color:'var(--warning)'},
    {l:t.doneWeek, v:stats.doneWeek,   color:'var(--text-primary)'},
    {l:t.pay,      v:stats.payPending, color:'var(--text-secondary)'},
  ]

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>

      {/* Nav */}
      <nav className="riden-nav" style={{position:'relative'}}>
        <div className="riden-nav-inner">
          <div style={{display:'flex',alignItems:'center',gap:20}}>
            <Link href="/dashboard" className="riden-logo">
              <span className="riden-logo-r">RIDEN</span>
              <span className="riden-logo-th">ไรเด็น</span>
            </Link>
            <div className="riden-nav-links">
              {t.nav.map((label:string,i:number) => (
                <Link key={i} href={NAV[i]} className={`riden-nav-link${NAV[i]==='/dashboard'?' active':''}`}>{label}</Link>
              ))}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={toggleLang} className="btn-ghost" style={{padding:'5px 10px',fontSize:11,letterSpacing:'0.04em'}}>
              {lang==='en'?'EN':'TH'}
            </button>
            <NotificationBell />
            <Link href="/bookings/new">
              <button className="btn-primary">+ {t.nb}</button>
            </Link>
            <button onClick={signOut} className="btn-ghost hide-mobile">{t.signOut}</button>
            <button className="mobile-menu-btn btn-ghost" onClick={()=>setMobileOpen(!mobileOpen)} style={{padding:'5px 8px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="mobile-nav">
            {t.nav.map((l:string,i:number)=><Link key={i} href={NAV[i]} onClick={()=>setMobileOpen(false)}>{l}</Link>)}
            <a href="#" onClick={e=>{e.preventDefault();signOut()}} style={{color:'var(--danger)'}}>{t.signOut}</a>
          </div>
        )}
      </nav>

      <div className="riden-page">

        {/* Header */}
        <div style={{marginBottom:24}} className="fade-up">
          <h1 style={{fontSize:22,fontWeight:600,letterSpacing:'-0.3px',color:'var(--text-primary)',marginBottom:3}}>
            {greeting}{user?`, ${user.company}`:''}
          </h1>
          <p style={{fontSize:12,color:'var(--text-tertiary)'}}>
            {time.toLocaleDateString(lang==='en'?'en-GB':'th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
        </div>

        {/* LINE banner */}
        {lineLinked===false && (
          <div className="riden-card fade-up" style={{padding:'14px 18px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap' as const}}>
            <div>
              <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)',marginBottom:2}}>Link LINE for emergency alerts</div>
              <div style={{fontSize:12,color:'var(--text-tertiary)'}}>Get instant LINE message if driver cancels or critical issue occurs</div>
            </div>
            {!lineCode?(
              <button onClick={getLineCode} disabled={lineLoading} className="btn-primary" style={{flexShrink:0,opacity:lineLoading?0.6:1}}>
                {lineLoading?'...':'Get Link Code'}
              </button>
            ):(
              <div style={{flexShrink:0}}>
                <div style={{fontSize:11,color:'var(--text-tertiary)',marginBottom:4}}>Open RIDEN LINE bot and type:</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:20,fontWeight:500,color:'var(--accent)',letterSpacing:4,background:'var(--accent-bg)',padding:'6px 14px',borderRadius:6,border:'0.5px solid rgba(25,201,119,0.2)'}}>{lineCode}</div>
                <div style={{fontSize:10,color:'var(--text-tertiary)',marginTop:3}}>Valid for 24 hours</div>
              </div>
            )}
          </div>
        )}
        {lineLinked===true && (
          <div style={{padding:'8px 14px',background:'var(--accent-bg)',border:'0.5px solid rgba(25,201,119,0.2)',borderRadius:8,fontSize:12,color:'var(--accent)',marginBottom:16}} className="fade-up">
            LINE linked — emergency alerts active
          </div>
        )}

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}} className="fade-up">
          {STATS.map((s,i)=>(
            <div key={s.l} className={`riden-card delay-${i+1}`} style={{padding:'16px',textAlign:'center' as const}}>
              <div style={{fontSize:28,fontWeight:600,letterSpacing:'-0.5px',color:s.color,lineHeight:1,marginBottom:6}}>
                {loading?'—':s.v}
              </div>
              <div style={{fontSize:10,fontWeight:500,color:'var(--text-tertiary)',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 240px',gap:14}}>

          {/* Left */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>

            {/* Bookings table */}
            <div className="riden-card fade-up">
              <div style={{padding:'13px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:13,fontWeight:500}}>{t.recent}</span>
                <Link href="/bookings" style={{fontSize:12,color:'var(--text-tertiary)',textDecoration:'none'}}>{t.viewAll} →</Link>
              </div>
              {loading?(
                <div style={{padding:16}}>{[1,2,3].map(i=><div key={i} style={{height:40,background:'var(--bg-page)',borderRadius:6,marginBottom:6}}/>)}</div>
              ):bookings.length===0?(
                <div style={{padding:'40px 16px',textAlign:'center' as const}}>
                  <p style={{fontWeight:500,color:'var(--text-primary)',marginBottom:4}}>{t.noBookings}</p>
                  <p style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:16}}>{t.createFirst}</p>
                  <Link href="/bookings/new"><button className="btn-primary">{t.nb}</button></Link>
                </div>
              ):(
                <div style={{overflowX:'auto' as const}}>
                  <table className="riden-table">
                    <thead><tr>
                      <th>Ref</th><th>Client</th>
                      <th className="hide-mobile">Type</th>
                      <th className="hide-mobile">Days</th>
                      <th>Status</th>
                    </tr></thead>
                    <tbody>
                      {bookings.map(b=>(
                        <tr key={b.id} style={{cursor:'pointer'}} onClick={()=>router.push(`/bookings/${b.id}`)}>
                          <td><span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)'}}>{b.booking_ref}</span></td>
                          <td style={{fontWeight:500}}>{b.client_name}</td>
                          <td className="hide-mobile" style={{color:'var(--text-secondary)',textTransform:'capitalize' as const}}>{b.booking_type?.replace(/_/g,' ')}</td>
                          <td className="hide-mobile" style={{color:'var(--text-secondary)'}}>{b.total_days}d</td>
                          <td><span className={`badge ${STATUS_BADGE[b.status]||'badge-pending'}`}>{b.status?.replace(/_/g,' ')}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Live trips */}
            {live.length>0&&(
              <div className="riden-card fade-up">
                <div style={{padding:'13px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:6,height:6,background:'var(--accent)',borderRadius:'50%'}}/>
                  <span style={{fontSize:13,fontWeight:500}}>{t.live}</span>
                </div>
                {live.map((tr:any)=>(
                  <div key={tr.id} style={{padding:'12px 16px',borderBottom:'0.5px solid var(--bg-page)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontWeight:500,fontSize:13}}>{tr.pickup_location} → {tr.dropoff_location}</div>
                      <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>{tr.vehicle_type}</div>
                    </div>
                    <span className="badge badge-progress">Live</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>

            {/* Quick actions */}
            <div className="riden-card fade-up" style={{padding:16}}>
              <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.08em',color:'var(--text-tertiary)',marginBottom:12}}>{t.actions}</div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                <Link href="/bookings/new" style={{textDecoration:'none'}}>
                  <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'9px'}}>{t.nb}</button>
                </Link>
                {[{l:'All Bookings',h:'/bookings'},{l:'Calendar',h:'/calendar'},{l:'Payments',h:'/payments'},{l:'Reports',h:'/reports'},{l:'Support',h:'/support'}].map(a=>(
                  <Link key={a.h} href={a.h} style={{textDecoration:'none'}}>
                    <button className="btn-ghost" style={{width:'100%',textAlign:'left' as const,padding:'8px 10px'}}>{a.l}</button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <div className="riden-card fade-up" style={{padding:16}}>
              <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.08em',color:'var(--text-tertiary)',marginBottom:10}}>{t.acct}</div>
              <p style={{fontWeight:600,fontSize:14,color:'var(--text-primary)',marginBottom:2}}>{user?.company}</p>
              <p style={{fontSize:11,color:'var(--text-tertiary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const,marginBottom:12}}>{user?.email}</p>
              <div style={{height:'0.5px',background:'var(--border)',marginBottom:10}}/>
              <Link href="/privacy" style={{textDecoration:'none',fontSize:11,color:'var(--text-tertiary)'}}>{t.privacy}</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
