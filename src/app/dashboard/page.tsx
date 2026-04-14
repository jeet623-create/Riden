'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import NotificationBell from '@/components/NotificationBell'

type Stats = {active:number;pending:number;doneWeek:number;payPending:number}
type Booking = {id:string;booking_ref:string;client_name:string;status:string;booking_type:string;total_days:number;created_at:string}
type Lang = 'en'|'th'
type Theme = 'dark'|'light'

const STATUS_BADGE: Record<string,{color:string;bg:string;border:string}> = {
  pending:       {color:'#F59E0B',bg:'rgba(245,158,11,0.1)',border:'rgba(245,158,11,0.2)'},
  operator_notified:{color:'#F59E0B',bg:'rgba(245,158,11,0.1)',border:'rgba(245,158,11,0.2)'},
  operator_accepted:{color:'#60A5FA',bg:'rgba(96,165,250,0.1)',border:'rgba(96,165,250,0.2)'},
  driver_assigned:  {color:'#60A5FA',bg:'rgba(96,165,250,0.1)',border:'rgba(96,165,250,0.2)'},
  in_progress:    {color:'#10B981',bg:'rgba(16,185,129,0.1)',border:'rgba(16,185,129,0.2)'},
  completed:      {color:'#19C977',bg:'rgba(25,201,119,0.1)',border:'rgba(25,201,119,0.2)'},
  cancelled:      {color:'#F87171',bg:'rgba(248,113,113,0.1)',border:'rgba(248,113,113,0.2)'},
  confirmed:      {color:'#60A5FA',bg:'rgba(96,165,250,0.1)',border:'rgba(96,165,250,0.2)'},
}

const T = {
  en:{ g:['Good morning','Good afternoon','Good evening'], active:'Active Trips', pending:'Pending Confirmations', doneWeek:'Completed This Week', pay:'Payments Due', recent:'Recent Bookings', viewAll:'View all', live:'Live Trips', actions:'Quick Actions', acct:'Account', nb:'New Booking', signOut:'Sign out', nav:['Dashboard','Bookings','Calendar','Trips','Payments','Reports','Support'], privacy:'Privacy Policy', noBookings:'No bookings yet', createFirst:'Create your first booking' },
  th:{ g:['สวัสดีตอนเช้า','สวัสดีตอนบ่าย','สวัสดีตอนเย็น'], active:'ทริปที่ใช้งาน', pending:'รอการยืนยัน', doneWeek:'เสร็จสัปดาห์นี้', pay:'รอชำระเงิน', recent:'การจองล่าสุด', viewAll:'ดูทั้งหมด', live:'ทริปสด', actions:'การดำเนินการด่วน', acct:'บัญชี', nb:'จองใหม่', signOut:'ออกจากระบบ', nav:['แดชบอร์ด','การจอง','ปฏิทิน','ทริป','ชำระเงิน','รายงาน','สนับสนุน'], privacy:'นโยบายความเป็นส่วนตัว', noBookings:'ยังไม่มีการจอง', createFirst:'สร้างการจองแรก' }
}
const NAV_HREFS = ['/dashboard','/bookings','/calendar','/trips','/payments','/reports','/support']

const TEAL='#19C977', TEAL_DIM='rgba(25,201,119,0.1)'

function themeColors(theme: Theme) {
  return theme === 'dark'
    ? { bg:'#07100D', s1:'#0C1810', s2:'#111F15', s3:'#16271A', border:'rgba(255,255,255,0.08)', borderHi:'rgba(255,255,255,0.14)', text:'#EDF5F0', text2:'#7A9A87', text3:'#3D5C47', navBg:'rgba(7,16,13,0.88)' }
    : { bg:'#F4F7F5', s1:'#FFFFFF', s2:'#FFFFFF', s3:'#EEF3F0', border:'rgba(0,0,0,0.08)', borderHi:'rgba(0,0,0,0.15)', text:'#0D1F14', text2:'#4A6B55', text3:'#8AADA0', navBg:'rgba(244,247,245,0.92)' }
}

export default function DashboardPage() {
  const router = useRouter()
  const [lang, setLangState] = useState<Lang>('en')
  const [theme, setThemeState] = useState<Theme>('dark')
  const [user, setUser] = useState<{email:string;company:string}|null>(null)
  const [stats, setStats] = useState<Stats>({active:0,pending:0,doneWeek:0,payPending:0})
  const [bookings, setBookings] = useState<Booking[]>([])
  const [live, setLive] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())
  const [hovered, setHovered] = useState<string|null>(null)
  const [lineLinked, setLineLinked] = useState<boolean|null>(null)
  const [lineCode, setLineCode] = useState<string>('')
  const [lineCodeLoading, setLineCodeLoading] = useState(false)

  useEffect(() => {
    setInterval(() => setTime(new Date()), 30000)
    const l = (localStorage.getItem('riden_lang') as Lang) || 'en'
    const th = (localStorage.getItem('riden_theme') as Theme) || 'dark'
    setLangState(l); setThemeState(th)
    document.documentElement.setAttribute('data-theme', th)
    document.body.style.background = th === 'dark' ? '#07100D' : '#F4F7F5'
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
      setStats({ active:trs.filter(t=>t.status==='in_progress').length, pending:bks.filter(b=>['pending','operator_notified'].includes(b.status)).length, doneWeek:bks.filter(b=>b.status==='completed'&&new Date(b.created_at)>wa).length, payPending:bks.filter(b=>b.status==='confirmed').length })
      setLoading(false)
    })
  }, [router])

  function toggleTheme() {
    const n: Theme = theme === 'dark' ? 'light' : 'dark'
    setThemeState(n); localStorage.setItem('riden_theme', n)
    document.documentElement.setAttribute('data-theme', n)
    document.body.style.background = n === 'dark' ? '#07100D' : '#F4F7F5'
  }
  function toggleLang() {
    const n: Lang = lang === 'en' ? 'th' : 'en'
    setLangState(n); localStorage.setItem('riden_lang', n)
  }
  async function signOut() { await createClient().auth.signOut(); router.push('/login') }
  async function generateLineCode() {
    setLineCodeLoading(true)
    const { data: { user: u } } = await createClient().auth.getUser()
    if (!u) return
    const res = await fetch((process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1/dmc-link-line', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dmc_id: u.id }) })
    const data = await res.json()
    if (data.already_linked) setLineLinked(true)
    else if (data.code) setLineCode(data.code)
    setLineCodeLoading(false)
  }

  const C = themeColors(theme)
  const t = T[lang]
  const hr = time.getHours()
  const greeting = t.g[hr < 12 ? 0 : hr < 17 ? 1 : 2]
  const F = "'Inter',-apple-system,sans-serif"
  const FM = "'JetBrains Mono',monospace"

  const STATS = [
    {label:t.active,    v:stats.active,    c:'#19C977', bg:'rgba(25,201,119,0.08)', icon:'▲'},
    {label:t.pending,   v:stats.pending,   c:'#F59E0B', bg:'rgba(245,158,11,0.08)',  icon:'◆'},
    {label:t.doneWeek,  v:stats.doneWeek,  c:'#60A5FA', bg:'rgba(96,165,250,0.08)', icon:'●'},
    {label:t.pay,       v:stats.payPending,c:'#C084FC', bg:'rgba(192,132,252,0.08)',icon:'■'},
  ]
  const ACTIONS = [
    {l:t.nb, h:'/bookings/new', primary:true},
    {l:'All Bookings', h:'/bookings'},
    {l:'Calendar', h:'/calendar'},
    {l:'Live Trips', h:'/trips'},
    {l:'Payments', h:'/payments'},
    {l:'Reports', h:'/reports'},
    {l:'Support', h:'/support'},
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:F, WebkitFontSmoothing:'antialiased', transition:'background 0.3s' }}>

      {/* ── Nav ── */}
      <nav style={{ position:'sticky', top:0, zIndex:50, borderBottom:`1px solid ${C.border}`, background:C.navBg, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {/* Left */}
          <div style={{ display:'flex', alignItems:'center', gap:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:30, height:30, background:TEAL, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span style={{ fontWeight:800, fontSize:16, letterSpacing:'-0.04em', color:C.text }}>RIDEN</span>
            </div>
            <div style={{ display:'flex', gap:2 }}>
              {t.nav.map((label: string, i: number) => (
                <Link key={NAV_HREFS[i]} href={NAV_HREFS[i]} style={{ textDecoration:'none' }}>
                  <button style={{ padding:'5px 11px', borderRadius:8, fontSize:13, fontWeight:500, color: NAV_HREFS[i]==='/dashboard' ? TEAL : C.text2, background: NAV_HREFS[i]==='/dashboard' ? TEAL_DIM : 'transparent', border:'none', cursor:'pointer', transition:'all 0.12s', fontFamily:F, whiteSpace:'nowrap' }}>{label}</button>
                </Link>
              ))}
            </div>
          </div>
          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Lang toggle */}
            <div style={{ display:'inline-flex', background:C.s3, border:`1px solid ${C.border}`, borderRadius:100, padding:3, gap:2 }}>
              {(['en','th'] as const).map(l => (
                <button key={l} onClick={toggleLang} style={{ padding:'4px 11px', borderRadius:100, fontSize:11.5, fontWeight:600, cursor:'pointer', border:'none', background: lang===l ? TEAL : 'transparent', color: lang===l ? '#fff' : C.text2, transition:'all 0.15s', fontFamily:F }}>
                  {l==='en' ? 'EN' : 'ไทย'}
                </button>
              ))}
            </div>
            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:`1px solid ${C.border}`, borderRadius:9, cursor:'pointer', color:C.text2, transition:'all 0.15s' }}>
              {theme === 'dark'
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <NotificationBell />
            <Link href="/bookings/new">
              <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', background:TEAL, color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:F, boxShadow:'0 2px 8px rgba(25,201,119,0.3)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                {t.nb}
              </button>
            </Link>
            <button onClick={signOut} style={{ padding:'7px 14px', background:'transparent', border:`1px solid ${C.border}`, borderRadius:9, fontSize:13, color:C.text2, cursor:'pointer', fontFamily:F, transition:'all 0.15s' }}>{t.signOut}</button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth:1280, margin:'0 auto', padding:'36px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.03em', color:C.text, marginBottom:3 }}>{greeting}{user ? `, ${user.company}` : ''}</h1>
          <p style={{ fontSize:13.5, color:C.text2 }}>{time.toLocaleDateString(lang==='en'?'en-GB':'th-TH', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>

        {lineLinked === false && (
        <div style={{ marginBottom:20, padding:'14px 18px', background:'rgba(0,112,255,0.07)', border:'1px solid rgba(96,165,250,0.25)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' as const }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#60A5FA', marginBottom:2 }}>📱 Link LINE for Emergency Alerts</div>
            <div style={{ fontSize:13, color:C.text2 }}>Receive instant LINE messages if a driver cancels or a critical issue occurs.</div>
          </div>
          {!lineCode ? (
            <button onClick={generateLineCode} disabled={lineCodeLoading} style={{ padding:'9px 18px', background:'#06C755', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', flexShrink:0, opacity:lineCodeLoading?0.6:1 }}>
              {lineCodeLoading ? '...' : 'Get Link Code'}
            </button>
          ) : (
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Open RIDEN LINE bot and type this code:</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:20, fontWeight:800, color:'#06C755', letterSpacing:2, background:'rgba(6,199,85,0.1)', padding:'8px 16px', borderRadius:8 }}>{lineCode}</div>
              <div style={{ fontSize:11, color:C.text3, marginTop:4 }}>Valid for 24 hours</div>
            </div>
          )}
        </div>
      )}
      {lineLinked === true && (
        <div style={{ marginBottom:14, padding:'10px 16px', background:'rgba(25,201,119,0.08)', border:'1px solid rgba(25,201,119,0.2)', borderRadius:10, fontSize:13, color:'#19C977' }}>
          ✅ LINE linked — you will receive emergency alerts on LINE.
        </div>
      )}
      {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 18px', transition:'border-color 0.15s' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                <span style={{ color:s.c, fontSize:14 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize:40, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, color:s.c, marginBottom:6, animationDelay:`${i*0.07}s` }}>
                {loading ? '—' : s.v}
              </div>
              <div style={{ fontSize:10, fontFamily:FM, letterSpacing:'0.1em', textTransform:'uppercase', color:C.text3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:18 }}>
          {/* Left */}
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {/* Recent bookings */}
            <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:16 }}>
              <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{t.recent}</span>
                <Link href="/bookings" style={{ textDecoration:'none', fontSize:13, color:TEAL }}>{t.viewAll} →</Link>
              </div>
              {loading ? (
                <div style={{ padding:20 }}>{[1,2,3].map(i => <div key={i} style={{ height:50, background:C.s3, borderRadius:8, marginBottom:8, animation:'shimmer 1.4s infinite', backgroundSize:'200% 100%' }} />)}</div>
              ) : bookings.length === 0 ? (
                <div style={{ padding:'48px 20px', textAlign:'center' }}>
                  <p style={{ fontWeight:600, color:C.text, marginBottom:4 }}>{t.noBookings}</p>
                  <p style={{ fontSize:13, color:C.text2, marginBottom:20 }}>{t.createFirst}</p>
                  <Link href="/bookings/new"><button style={{ padding:'9px 20px', background:TEAL, color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:F }}>{t.nb}</button></Link>
                </div>
              ) : (
                <div>
                  {bookings.map((b, i) => {
                    const st = STATUS_BADGE[b.status] || {color:'#7A9A87',bg:'rgba(122,154,135,0.1)',border:'rgba(122,154,135,0.2)'}
                    return (
                      <Link key={b.id} href={`/bookings/${b.id}`} style={{ textDecoration:'none' }}>
                        <div style={{ padding:'12px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background: hovered===b.id ? C.s3 : 'transparent', transition:'background 0.1s' }} onMouseEnter={()=>setHovered(b.id)} onMouseLeave={()=>setHovered(null)}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <span style={{ fontFamily:FM, fontSize:12, color:TEAL, minWidth:86 }}>{b.booking_ref}</span>
                            <span style={{ fontWeight:600, fontSize:14, color:C.text }}>{b.client_name}</span>
                            <span style={{ fontSize:12, color:C.text2, textTransform:'capitalize' }}>{b.booking_type?.replace(/_/g,' ')} · {b.total_days}d</span>
                          </div>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:100, fontSize:11, fontFamily:FM, fontWeight:500, color:st.color, background:st.bg, border:`1px solid ${st.border}` }}>
                            <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', flexShrink:0, display:'inline-block' }} />
                            {b.status}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Live trips */}
            {live.length > 0 && (
              <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:16 }}>
                <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:7, height:7, background:'#10B981', borderRadius:'50%', animation:'pulse 2s infinite' }} />
                  <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{t.live}</span>
                </div>
                {live.map(tr => (
                  <div key={tr.id} style={{ padding:'12px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:C.text }}>{tr.pickup_location} → {tr.dropoff_location}</div>
                      <div style={{ fontSize:12, color:C.text2, marginTop:2 }}>{tr.vehicle_type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Quick actions */}
            <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
              <div style={{ fontSize:10, fontFamily:FM, letterSpacing:'0.1em', textTransform:'uppercase', color:C.text3, marginBottom:14 }}>{t.actions}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {ACTIONS.map(a => (
                  <Link key={a.h} href={a.h} style={{ textDecoration:'none' }}>
                    <button style={{ width:'100%', textAlign:'left', padding:'9px 13px', background: a.primary ? TEAL : 'transparent', color: a.primary ? '#fff' : C.text2, border:`1px solid ${a.primary ? 'transparent' : C.border}`, borderRadius:9, fontSize:13, fontWeight: a.primary ? 700 : 500, cursor:'pointer', transition:'all 0.12s', fontFamily:F }}>
                      {a.l}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <div style={{ background:C.s2, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
              <div style={{ fontSize:10, fontFamily:FM, letterSpacing:'0.1em', textTransform:'uppercase', color:C.text3, marginBottom:14 }}>{t.acct}</div>
              <p style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:2 }}>{user?.company}</p>
              <p style={{ fontSize:12, color:C.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:14 }}>{user?.email}</p>
              <div style={{ height:1, background:C.border, marginBottom:14 }} />
              <Link href="/privacy" style={{ textDecoration:'none', fontSize:12, color:C.text3 }}>{t.privacy}</Link>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { from{background-position:-200% center} to{background-position:200% center} }
      `}</style>
    </div>
  )
}