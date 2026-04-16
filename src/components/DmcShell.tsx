'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'

const NAV = [
  { h:'/dashboard', l:'Dashboard', icon:'⌘', exact:true },
  { h:'/bookings', l:'Bookings', icon:'📋' },
  { h:'/trips', l:'Trips', icon:'🗺️' },
  { h:'/calendar', l:'Calendar', icon:'📅' },
  { h:'/operators', l:'Operators', icon:'🚐' },
  { h:'/drivers', l:'Drivers', icon:'🧑‍✈️' },
  { h:'/payments', l:'Payments', icon:'💳' },
  { h:'/reports', l:'Reports', icon:'📊' },
  { h:'/support', l:'Support', icon:'💬' },
]

const LANG_LABELS: Record<string,string> = {
  en:'EN', th:'TH', zh:'ZH', ko:'KO', tr:'TR'
}

export function DmcShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [company, setCompany] = useState('')
  const [plan, setPlan] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState('')
  const [theme, setTheme] = useState<'dark'|'light'>('dark')
  const [lang, setLang] = useState('en')
  const [showLangMenu, setShowLangMenu] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('dmc_theme') as 'dark'|'light' || 'dark'
    const savedLang = localStorage.getItem('dmc_lang') || 'en'
    setTheme(savedTheme)
    setLang(savedLang)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('dmc_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  function setLanguage(l: string) {
    setLang(l)
    localStorage.setItem('dmc_lang', l)
    setShowLangMenu(false)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'Asia/Bangkok' }) + ' BKK')
    }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { loadUser() }, [])

  async function loadUser() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await sb.from('dmc_users').select('company_name,subscription_plan,subscription_status').eq('id', user.id).single()
    if (data) { setCompany(data.company_name ?? ''); setPlan(data.subscription_plan ?? 'trial') }
  }

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  const isActive = (item: typeof NAV[0]) => item.exact ? pathname === item.h : pathname.startsWith(item.h)

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-base)' }}>
      <aside style={{ width:collapsed?56:232, background:'rgba(10,10,10,0.98)', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', transition:'width 0.2s ease', flexShrink:0, backdropFilter:'blur(20px)', zIndex:50 }}>
        <div style={{ padding:collapsed?'20px 0':'20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:collapsed?'center':'space-between', gap:10, minHeight:64 }}>
          {!collapsed&&(
            <div>
              <div style={{ fontFamily:'var(--font-brand)', fontSize:16, letterSpacing:4, color:'#F5F5F5', lineHeight:1 }}>RIDEN</div>
              <div style={{ fontSize:9, color:'var(--teal)', letterSpacing:2, marginTop:3, fontFamily:'var(--font-mono)' }}>DMC PORTAL</div>
            </div>
          )}
          {collapsed&&<div style={{ fontFamily:'var(--font-brand)', fontSize:10, color:'var(--teal)', letterSpacing:2 }}>R</div>}
          <button onClick={()=>setCollapsed(!collapsed)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:12, padding:4, borderRadius:4 }} onMouseEnter={e=>(e.currentTarget.style.color='rgba(255,255,255,0.8)')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.3)')}>{collapsed?'›':'‹'}</button>
        </div>
        {!collapsed&&company&&(
          <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:12, fontWeight:500, color:'#F5F5F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{company}</div>
            <div style={{ fontSize:10, color:'var(--teal)', fontFamily:'var(--font-mono)', marginTop:2, textTransform:'uppercase', letterSpacing:1 }}>{plan}</div>
          </div>
        )}
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(item => {
            const active = isActive(item)
            return (
              <Link key={item.h} href={item.h} style={{ textDecoration:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:collapsed?'10px 0':'9px 12px', borderRadius:'var(--r)', background:active?'var(--teal-10)':'transparent', border:active?'1px solid var(--teal-20)':'1px solid transparent', cursor:'pointer', transition:'all 0.12s ease', justifyContent:collapsed?'center':'flex-start', position:'relative' }} onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='rgba(255,255,255,0.06)' }} onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent' }}>
                  {active&&<div style={{ position:'absolute', left:0, top:'20%', height:'60%', width:2, background:'var(--teal)', borderRadius:2 }} />}
                  <span style={{ fontSize:13, lineHeight:1, minWidth:16, textAlign:'center' }}>{item.icon}</span>
                  {!collapsed&&<span style={{ fontSize:13, fontWeight:active?500:400, color:active?'#F5F5F5':'rgba(255,255,255,0.6)', flex:1 }}>{item.l}</span>}
                </div>
              </Link>
            )
          })}
        </nav>
        <div style={{ padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed&&(<div style={{ padding:'8px 12px', marginBottom:8 }}><div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--teal)', letterSpacing:1 }}>{time}</div></div>)}
          <button onClick={handleLogout} style={{ width:'100%', padding:collapsed?'10px 0':'9px 12px', background:'transparent', border:'1px solid transparent', borderRadius:'var(--r)', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:8, justifyContent:collapsed?'center':'flex-start', transition:'all 0.12s', fontFamily:'var(--font-body)' }} onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='var(--red)' }} onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.4)' }}>
            <span>⎋</span>{!collapsed&&<span>Sign out</span>}
          </button>
        </div>
      </aside>
      <main style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <header style={{ height:56, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 28px', background:'var(--bg-surface)', position:'sticky', top:0, zIndex:40 }}>
          <div style={{ flex:1 }} />
          {/* Language selector */}
          <div style={{ position:'relative', marginRight:8 }}>
            <button onClick={()=>setShowLangMenu(!showLangMenu)} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'0 10px', height:30, fontSize:11, color:'var(--text-2)', cursor:'pointer', fontFamily:'var(--font-mono)', display:'flex', alignItems:'center', gap:4 }}>
              {LANG_LABELS[lang]||lang.toUpperCase()} ▾
            </button>
            {showLangMenu&&(
              <div style={{ position:'absolute', top:36, right:0, background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden', zIndex:100, minWidth:80, boxShadow:'0 4px 16px rgba(0,0,0,0.2)' }}>
                {['en','th','zh','ko','tr'].map(l=>(
                  <button key={l} onClick={()=>setLanguage(l)} style={{ display:'block', width:'100%', padding:'8px 14px', background:lang===l?'var(--teal-10)':'transparent', border:'none', cursor:'pointer', fontSize:12, color:lang===l?'var(--teal)':'var(--text-2)', fontFamily:'var(--font-mono)', textAlign:'left', textTransform:'uppercase' }}>{l}</button>
                ))}
              </div>
            )}
          </div>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, marginRight:8 }}>
            {theme==='dark'?'☀️':'🌙'}
          </button>
          {/* Notification bell */}
          <NotificationBell />
          {/* Avatar */}
          <div style={{ marginLeft:12, width:28, height:28, borderRadius:'50%', background:'var(--teal-10)', border:'1px solid var(--teal-20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--teal)', fontWeight:600 }}>{company.slice(0,2).toUpperCase()||'DM'}</div>
        </header>
        <div style={{ flex:1, padding:'28px', overflowY:'auto', background:'var(--bg-base)' }}>{children}</div>
      </main>
    </div>
  )
}
