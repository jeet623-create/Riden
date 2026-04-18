
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { h:'/dmc', l:'Dashboard', icon:'⊞', exact:true },
  { h:'/dmc/bookings', l:'Bookings', icon:'📋', badge:true },
  { h:'/dmc/calendar', l:'Calendar', icon:'📅' },
  { h:'/dmc/operators', l:'Operators', icon:'🚐' },
  { h:'/dmc/drivers', l:'Drivers', icon:'👤' },
  { h:'/dmc/reports', l:'Reports', icon:'📊' },
  { h:'/dmc/payments', l:'Payments', icon:'💳' },
  { h:'/dmc/support', l:'Support', icon:'💬' },
]

function RidenLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 13 : size === 'lg' ? 22 : 17
  const arrowSz = size === 'sm' ? 9 : size === 'lg' ? 14 : 11
  return (
    <div style={{ display:'inline-flex', alignItems:'flex-start', lineHeight:1 }}>
      <span style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: sz,
        letterSpacing: '-0.04em',
        color: '#F5F5F5',
        lineHeight: 1,
      }}>RIDEN</span>
      <span style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 400,
        fontSize: arrowSz,
        color: '#1D9E75',
        lineHeight: 1,
        marginTop: 1,
      }}>↗</span>
    </div>
  )
}

export function DmcShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState('')
  const [theme, setTheme] = useState<'dark'|'light'>('dark')
  const [companyName, setCompanyName] = useState('')
  const [subscriptionStatus, setSubscriptionStatus] = useState('')
  const [pendingBookings, setPendingBookings] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('dmc_theme') as 'dark'|'light' || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    const stored = localStorage.getItem('dmc_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setCompanyName(user.company_name || '')
        setSubscriptionStatus(user.subscription_status || '')
      } catch {}
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('dmc_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false, timeZone:'Asia/Bangkok' }))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  function handleLogout() {
    localStorage.removeItem('dmc_user')
    router.push('/dmc/login')
  }

  const isActive = (item: typeof NAV[0]) => item.exact ? pathname === item.h : pathname.startsWith(item.h)
  const sidebarBg = 'rgba(8,8,8,0.98)'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{ width:collapsed?56:200, background:sidebarBg, borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', transition:'width 0.2s ease', flexShrink:0, zIndex:50 }}>

        {/* Logo + company */}
        <div style={{ padding:collapsed?'18px 0':'16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:collapsed?'center':'space-between', minHeight:64 }}>
          {!collapsed && (
            <div>
              <RidenLogo size="md" />
              {companyName && (
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:4, fontFamily:"'JetBrains Mono', monospace", letterSpacing:0.5, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{companyName}</div>
              )}
              {subscriptionStatus === 'trial' && (
                <div style={{ display:'inline-block', marginTop:4, padding:'1px 5px', borderRadius:3, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', fontSize:8, color:'#F59E0B', fontFamily:"'JetBrains Mono', monospace", letterSpacing:1 }}>TRIAL</div>
              )}
            </div>
          )}
          {collapsed && (
            <div style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:14, color:'#1D9E75', letterSpacing:'-0.04em' }}>R<span style={{ fontSize:8, verticalAlign:'top', lineHeight:1 }}>↗</span></div>
          )}
          <button onClick={()=>setCollapsed(!collapsed)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.25)', fontSize:11, padding:4, borderRadius:4, flexShrink:0 }} onMouseEnter={e=>(e.currentTarget.style.color='rgba(255,255,255,0.7)')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.25)')}>{collapsed?'›':'‹'}</button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:1 }}>
          {NAV.map(item => {
            const active = isActive(item)
            return (
              <Link key={item.h} href={item.h} style={{ textDecoration:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, padding:collapsed?'9px 0':'8px 10px', borderRadius:6, background:active?'rgba(29,158,117,0.12)':'transparent', border:active?'1px solid rgba(29,158,117,0.2)':'1px solid transparent', cursor:'pointer', transition:'all 0.12s', justifyContent:collapsed?'center':'flex-start', position:'relative' }} onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='rgba(255,255,255,0.05)' }} onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent' }}>
                  {active && <div style={{ position:'absolute', left:0, top:'20%', height:'60%', width:2, background:'#1D9E75', borderRadius:2 }} />}
                  <span style={{ fontSize:12, lineHeight:1, minWidth:14, textAlign:'center', opacity:active?1:0.7 }}>{item.icon}</span>
                  {!collapsed && (
                    <span style={{ fontSize:12, fontWeight:active?600:400, color:active?'#F5F5F5':'rgba(255,255,255,0.55)', flex:1, fontFamily:"'DM Sans', sans-serif", letterSpacing:0.1 }}>{item.l}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom: time + logout */}
        <div style={{ padding:'10px 8px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed && (
            <div style={{ padding:'6px 10px', marginBottom:6 }}>
              <div style={{ fontSize:10, fontFamily:"'JetBrains Mono', monospace", color:'#1D9E75', letterSpacing:1 }}>{time}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', marginTop:1, fontFamily:"'JetBrains Mono', monospace" }}>BANGKOK</div>
            </div>
          )}
          <button onClick={handleLogout} style={{ width:'100%', padding:collapsed?'9px 0':'8px 10px', background:'transparent', border:'1px solid transparent', borderRadius:6, color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', gap:8, justifyContent:collapsed?'center':'flex-start', transition:'all 0.12s', fontFamily:"'DM Sans', sans-serif" }} onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.color='#EF4444' }} onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.35)' }}>
            <span style={{ fontSize:12 }}>→</span>{!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <header style={{ height:56, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 24px', gap:14, background:'var(--bg-surface)', position:'sticky', top:0, zIndex:40 }}>
          <div style={{ flex:1 }} />
          {/* EN/TH/中文 */}
          <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.05)', borderRadius:6, padding:2 }}>
            {['EN','TH','中文'].map(l => (
              <button key={l} style={{ padding:'3px 8px', borderRadius:4, border:'none', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:10, cursor:'pointer', fontFamily:"'JetBrains Mono', monospace", letterSpacing:0.5 }}
                onMouseEnter={e => e.currentTarget.style.color='#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}
              >{l}</button>
            ))}
          </div>
          <button onClick={toggleTheme} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:6, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13 }}>
            {theme==='dark'?'☀️':'🌙'}
          </button>
          <div style={{ fontSize:10, fontFamily:"'JetBrains Mono', monospace", color:'rgba(255,255,255,0.25)', letterSpacing:0.5 }}>dmc.riden.me</div>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(29,158,117,0.15)', border:'1px solid rgba(29,158,117,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#1D9E75', fontWeight:700, cursor:'pointer', fontFamily:"'JetBrains Mono', monospace" }}>D</div>
        </header>
        <div style={{ flex:1, padding:'28px', overflowY:'auto', background:'var(--bg-base)' }}>{children}</div>
      </main>
    </div>
  )
}
