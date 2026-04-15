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
  pending:            'badge-pending',
  operator_notified:  'badge-pending',
  operator_accepted:  'badge-progress',
  driver_assigned:    'badge-progress',
  in_progress:        'badge-progress',
  completed:          'badge-completed',
  cancelled:          'badge-cancelled',
  confirmed:          'badge-progress',
}

const T = {
  en: {
    g: ['Good morning','Good afternoon','Good evening'],
    active:'Active Trips', pending:'Pending', doneWeek:'Done This Week', pay:'Payments Due',
    recent:'Recent Bookings', viewAll:'View all', live:'Live Trips',
    actions:'Quick Actions', acct:'Account', nb:'New Booking', signOut:'Sign out',
    nav:['Dashboard','Bookings','Calendar','Trips','Payments','Reports','Support'],
    privacy:'Privacy Policy', noBookings:'No bookings yet', createFirst:'Create your first booking',
  },
  th: {
    g:['สวัสดีตอนเช้า','สวัสดีตอนบ่าย','สวัสดีตอนเย็น'],
    active:'ทริปที่ใช้งาน', pending:'รอการยืนยัน', doneWeek:'เสร็จสัปดาห์นี้', pay:'รอชำระเงิน',
    recent:'การจองล่าสุด', viewAll:'ดูทั้งหมด', live:'ทริปสด',
    actions:'การดำเนินการด่วน', acct:'บัญชี', nb:'จองใหม่', signOut:'ออกจากระบบ',
    nav:['แดชบอร์ด','การจอง','ปฏิทิน','ทริป','ชำระเงิน','รายงาน','สนับสนุน'],
    privacy:'นโยบายความเป็นส่วนตัว', noBookings:'ยังไม่มีการจอง', createFirst:'สร้างการจองแรก',
  },
}
const NAV_HREFS = ['/dashboard','/bookings','/calendar','/trips','/payments','/reports','/support']
const Y = '#D4E827', DK = '#1A1A1A', G6 = '#F5F5F5', BORDER = '#E8E8E8'
const FF = "'Syne',sans-serif", FB = "'Space Grotesk',sans-serif", FM = "'DM Mono',monospace"

export default function DashboardPage() {
  const router = useRouter()
  const [lang, setLangState] = useState<Lang>('en')
  const [user, setUser] = useState<{email:string;company:string}|null>(null)
  const [stats, setStats] = useState<Stats>({active:0,pending:0,doneWeek:0,payPending:0})
  const [bookings, setBookings] = useState<Booking[]>([])
  const [live, setLive] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lineLinked, setLineLinked] = useState<boolean|null>(null)
  const [lineCode, setLineCode] = useState<string>('')
  const [lineCodeLoading, setLineCodeLoading] = useState(false)

  useEffect(() => {
    setInterval(() => setTime(new Date()), 30000)
    const l = (localStorage.getItem('riden_lang') as Lang) || 'en'
    setLangState(l)
    createClient().auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.push('/login'); return }
      const [dmc, bk, tr] = await Promise.all([
        createClient().from('dmc_users').select('company_name,email').eq('id', u.id).single(),
        createClient().from('bookings').select('*').eq('dmc_id', u.id).order('created_at',{ascending:false}).limit(8),
        createClient().from('trips').select('*').eq('dmc_id', u.id).in('status',['in_progress','driver_assigned','operator_accepted'])
      ])
      if (dmc.data) setUser({email:dmc.data.email, company:dmc.data.company_name})
      const bks = bk.data??[]; const trs = tr.data??[]
      setBookings(bks); setLive(trs)
      const wa = new Date(); wa.setDate(wa.getDate()-7)
      setStats({
        active: trs.filter((t:any)=>t.status==='in_progress').length,
        pending: bks.filter((b:any)=>['pending','operator_notified'].includes(b.status)).length,
        doneWeek: bks.filter((b:any)=>b.status==='completed'&&new Date(b.created_at)>wa).length,
        payPending: bks.filter((b:any)=>b.status==='confirmed').length,
      })
      // LINE link check
      const dmc2 = await createClient().from('dmc_users').select('line_user_id').eq('id', u.id).single()
      setLineLinked(!!dmc2.data?.line_user_id)
      setLoading(false)
    })
  }, [router])

  function toggleLang() {
    const n: Lang = lang === 'en' ? 'th' : 'en'
    setLangState(n); localStorage.setItem('riden_lang', n)
  }
  async function signOut() { await createClient().auth.signOut(); router.push('/login') }
  async function generateLineCode() {
    setLineCodeLoading(true)
    const { data: { user: u } } = await createClient().auth.getUser()
    if (!u) return
    const res = await fetch((process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1/dmc-link-line', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dmc_id: u.id })
    })
    const data = await res.json()
    if (data.already_linked) setLineLinked(true)
    else if (data.code) setLineCode(data.code)
    setLineCodeLoading(false)
  }

  const t = T[lang]
  const hr = time.getHours()
  const greeting = t.g[hr < 12 ? 0 : hr < 17 ? 1 : 2]

  const STAT_DATA = [
    { label:t.active,   v:stats.active,     dark:false },
    { label:t.pending,  v:stats.pending,    dark:true  },
    { label:t.doneWeek, v:stats.doneWeek,   dark:false },
    { label:t.pay,      v:stats.payPending, dark:true  },
  ]

  return (
    <div style={{ minHeight:'100vh', background:G6, fontFamily:FB, WebkitFontSmoothing:'antialiased' }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{ background:DK, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <Link href="/dashboard" style={{ textDecoration:'none', display:'flex', alignItems:'baseline', gap:6 }}>
              <span style={{ fontFamily:FF, fontWeight:800, fontSize:18, letterSpacing:'-5px', color:Y }}>RIDEN</span>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, fontSize:10, letterSpacing:'5px', color:Y, opacity:0.55 }}>ไรเด็น</span>
            </Link>

            {/* Nav links — hidden on mobile */}
            <div className="hide-mobile" style={{ display:'flex', gap:2 }}>
              {t.nav.map((label:string, i:number) => (
                <Link key={NAV_HREFS[i]} href={NAV_HREFS[i]} style={{ textDecoration:'none' }}>
                  <button style={{
                    padding:'5px 12px', borderRadius:6, fontSize:13, fontWeight:500,
                    fontFamily:FB, border:'none', cursor:'pointer', transition:'all 0.12s',
                    color: NAV_HREFS[i]==='/dashboard' ? Y : 'rgba(212,232,39,0.5)',
                    background: NAV_HREFS[i]==='/dashboard' ? 'rgba(212,232,39,0.12)' : 'transparent',
                  }}>{label}</button>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Lang */}
            <button onClick={toggleLang} style={{ padding:'5px 10px', background:'rgba(212,232,39,0.1)', border:'0.5px solid rgba(212,232,39,0.2)', borderRadius:6, color:Y, fontFamily:FB, fontSize:12, fontWeight:500, cursor:'pointer' }}>
              {lang === 'en' ? 'EN / ไทย' : 'ไทย / EN'}
            </button>

            <NotificationBell />

            {/* New Booking */}
            <Link href="/bookings/new">
              <button className="btn-yellow" style={{ padding:'7px 16px', fontSize:13 }}>
                + {t.nb}
              </button>
            </Link>

            {/* Sign out */}
            <button onClick={signOut} className="hide-mobile" style={{ padding:'7px 12px', background:'transparent', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:6, fontSize:12, color:'rgba(255,255,255,0.5)', fontFamily:FB, cursor:'pointer' }}>{t.signOut}</button>

            {/* Hamburger */}
            <button onClick={()=>setMobileOpen(!mobileOpen)} style={{ display:'none' }} className="show-mobile-flex" aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={Y} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-nav-menu${mobileOpen ? ' open' : ''}`}>
          {t.nav.map((label:string,i:number) => (
            <Link key={i} href={NAV_HREFS[i]} className="mobile-nav-link" onClick={()=>setMobileOpen(false)}>{label}</Link>
          ))}
          <button onClick={signOut} style={{ display:'block', padding:'12px 8px', color:'rgba(212,232,39,0.4)', background:'none', border:'none', fontSize:14, fontFamily:FB, cursor:'pointer', width:'100%', textAlign:'left' }}>{t.signOut}</button>
        </div>
      </nav>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <main style={{ maxWidth:1280, margin:'0 auto', padding:'32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:32 }} className="anim-fade-up">
          <h1 style={{ fontFamily:FF, fontWeight:800, fontSize:28, letterSpacing:'-0.5px', color:DK, marginBottom:4 }}>
            {greeting}{user ? `, ${user.company}` : ''}
          </h1>
          <p style={{ fontSize:13, color:'#888', fontFamily:FB }}>
            {time.toLocaleDateString(lang==='en'?'en-GB':'th-TH', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
        </div>

        {/* LINE banner */}
        {lineLinked === false && (
          <div style={{ marginBottom:24, padding:'16px 20px', background:DK, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' as const }} className="anim-fade-up">
            <div>
              <div style={{ fontFamily:FF, fontWeight:700, fontSize:14, color:Y, marginBottom:2 }}>Link LINE for Emergency Alerts</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontFamily:FB }}>Receive instant LINE messages if a driver cancels or a critical issue occurs.</div>
            </div>
            {!lineCode ? (
              <button onClick={generateLineCode} disabled={lineCodeLoading} className="btn-yellow" style={{ padding:'9px 20px', flexShrink:0, opacity:lineCodeLoading?0.6:1 }}>
                {lineCodeLoading ? '...' : 'Get Link Code'}
              </button>
            ) : (
              <div style={{ flexShrink:0 }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:FB, marginBottom:4 }}>Open RIDEN LINE bot and type this code:</div>
                <div style={{ fontFamily:FM, fontSize:22, fontWeight:500, color:Y, letterSpacing:4, background:'rgba(212,232,39,0.08)', padding:'8px 16px', borderRadius:8, border:'0.5px solid rgba(212,232,39,0.2)' }}>{lineCode}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:FB, marginTop:4 }}>Valid for 24 hours</div>
              </div>
            )}
          </div>
        )}
        {lineLinked === true && (
          <div style={{ marginBottom:16, padding:'10px 16px', background:'rgba(212,232,39,0.08)', border:'0.5px solid rgba(212,232,39,0.3)', borderRadius:8, fontSize:12, color:DK, fontFamily:FB }} className="anim-fade-up">
            LINE linked — emergency alerts active.
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }} className="anim-fade-up">
          {STAT_DATA.map((s,i) => (
            <div key={s.label} className={`anim-fade-up anim-delay-${i+1}`}
              style={{ background:s.dark?DK:Y, borderRadius:14, padding:'24px 20px', minHeight:100 }}>
              <div style={{ fontFamily:FF, fontWeight:800, fontSize:44, letterSpacing:'-2px', lineHeight:1, color:s.dark?Y:DK, marginBottom:8 }}>
                {loading ? '—' : s.v}
              </div>
              <div style={{ fontFamily:FB, fontWeight:500, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:s.dark?'rgba(212,232,39,0.5)':'rgba(26,26,26,0.5)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:16 }}>

          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Recent bookings */}
            <div style={{ background:'#fff', border:'0.5px solid '+BORDER, borderRadius:14 }} className="anim-fade-up">
              <div style={{ padding:'16px 20px', borderBottom:'0.5px solid '+BORDER, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontFamily:FF, fontWeight:700, fontSize:14, color:DK }}>{t.recent}</span>
                <Link href="/bookings" style={{ textDecoration:'none', fontSize:12, fontFamily:FB, color:'#888' }}>{t.viewAll} →</Link>
              </div>
              {loading ? (
                <div style={{ padding:20 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height:46, background:G6, borderRadius:8, marginBottom:8 }} />)}
                </div>
              ) : bookings.length === 0 ? (
                <div style={{ padding:'48px 24px', textAlign:'center' as const }}>
                  <p style={{ fontFamily:FF, fontWeight:700, fontSize:16, color:DK, marginBottom:4 }}>{t.noBookings}</p>
                  <p style={{ fontSize:13, color:'#888', fontFamily:FB, marginBottom:20 }}>{t.createFirst}</p>
                  <Link href="/bookings/new">
                    <button className="btn-yellow" style={{ padding:'10px 24px' }}>{t.nb}</button>
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX:'auto' as const }}>
                  <table className="riden-table">
                    <thead><tr>
                      <th>Ref</th><th>Client</th><th className="hide-mobile">Type</th><th className="hide-mobile">Days</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id} style={{ cursor:'pointer' }} onClick={()=>router.push(`/bookings/${b.id}`)}>
                          <td><span style={{ fontFamily:FM, fontSize:12, color:'#555' }}>{b.booking_ref}</span></td>
                          <td style={{ fontWeight:500 }}>{b.client_name}</td>
                          <td className="hide-mobile" style={{ color:'#888', textTransform:'capitalize' as const }}>{b.booking_type?.replace(/_/g,' ')}</td>
                          <td className="hide-mobile" style={{ color:'#888' }}>{b.total_days}d</td>
                          <td><span className={`badge ${STATUS_BADGE[b.status]||'badge-pending'}`}>{b.status?.replace(/_/g,' ')}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Live trips */}
            {live.length > 0 && (
              <div style={{ background:DK, border:'none', borderRadius:14 }} className="anim-fade-up">
                <div style={{ padding:'16px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:6, height:6, background:Y, borderRadius:'50%' }} />
                  <span style={{ fontFamily:FF, fontWeight:700, fontSize:14, color:Y }}>{t.live}</span>
                </div>
                {live.map((tr:any) => (
                  <div key={tr.id} style={{ padding:'14px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:500, fontSize:13, color:'#fff', fontFamily:FB }}>{tr.pickup_location} → {tr.dropoff_location}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2, fontFamily:FB }}>{tr.vehicle_type}</div>
                    </div>
                    <span style={{ fontFamily:FM, fontSize:11, color:Y }}>LIVE</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* Quick actions */}
            <div style={{ background:'#fff', border:'0.5px solid '+BORDER, borderRadius:14, padding:20 }} className="anim-fade-up">
              <div style={{ fontFamily:FB, fontWeight:500, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#888', marginBottom:14 }}>{t.actions}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <Link href="/bookings/new" style={{ textDecoration:'none' }}>
                  <button className="btn-yellow" style={{ width:'100%', padding:'10px', textAlign:'center' as const, justifyContent:'center', fontFamily:FF }}>
                    {t.nb}
                  </button>
                </Link>
                {[{l:'All Bookings',h:'/bookings'},{l:'Calendar',h:'/calendar'},{l:'Live Trips',h:'/trips'},{l:'Payments',h:'/payments'},{l:'Reports',h:'/reports'},{l:'Support',h:'/support'}].map(a => (
                  <Link key={a.h} href={a.h} style={{ textDecoration:'none' }}>
                    <button style={{ width:'100%', textAlign:'left' as const, padding:'9px 12px', background:'transparent', color:'#555', border:'0.5px solid '+BORDER, borderRadius:8, fontSize:13, fontWeight:400, cursor:'pointer', transition:'all 0.1s', fontFamily:FB }}>
                      {a.l}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <div style={{ background:DK, borderRadius:14, padding:20 }} className="anim-fade-up">
              <div style={{ fontFamily:FB, fontWeight:500, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'rgba(212,232,39,0.4)', marginBottom:14 }}>{t.acct}</div>
              <p style={{ fontFamily:FF, fontWeight:700, fontSize:15, color:'#fff', marginBottom:2 }}>{user?.company}</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, marginBottom:16, fontFamily:FB }}>{user?.email}</p>
              <div style={{ height:'0.5px', background:'rgba(255,255,255,0.08)', marginBottom:14 }} />
              <Link href="/privacy" style={{ textDecoration:'none', fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:FB }}>{t.privacy}</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
