'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const NAV = [
  { h:'/admin', l:'Dashboard', icon:'⌘', exact:true },
  { h:'/admin/dmcs', l:'DMCs', icon:'🏢' },
  { h:'/admin/operators', l:'Operators', icon:'🚐' },
  { h:'/admin/drivers', l:'Drivers', icon:'🧑‍✈️' },
  { h:'/admin/vehicles', l:'Vehicles', icon:'🚗' },
  { h:'/admin/bookings', l:'Bookings', icon:'📋' },
  { h:'/admin/pending', l:'Pending', icon:'⏳', badge:true },
  { h:'/admin/subscriptions', l:'Subscriptions', icon:'💳' },
  { h:'/admin/finance', l:'Finance', icon:'📊' },
  { h:'/admin/support', l:'Support', icon:'💬' },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [time, setTime] = useState('')
  const [theme, setTheme] = useState<'dark'|'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('admin_theme') as 'dark'|'light' || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('admin_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'Asia/Bangkok' }) + ' BKK')
    }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { fetchPending() }, [])

  async function fetchPending() {
    const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    try {
      const r = await fetch(SUPA+'/rest/v1/drivers?is_verified=eq.false&is_active=eq.false&select=id', { headers: { apikey:KEY, Authorization:'Bearer '+KEY } })
      const d = await r.json()
      setPendingCount(Array.isArray(d)?d.length:0)
    } catch {}
  }

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/admin/login')
  }

  const isActive = (item: typeof NAV[0]) => item.exact ? pathname === item.h : pathname.startsWith(item.h)

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <style>{`
:root {
  --bg-base:#0e0e0e;--bg-surface:#141414;--bg-elevated:#1a1a1a;--bg-hover:#222;
  --teal:#1D9E75;--teal-10:rgba(29,158,117,.10);--teal-20:rgba(29,158,117,.20);
  --text-1:#F5F5F5;--text-2:#999;--text-3:#555;
  --border:rgba(255,255,255,.06);--border-strong:rgba(255,255,255,.12);
  --green:#22c55e;--green-bg:rgba(34,197,94,.10);
  --amber:#f59e0b;--amber-bg:rgba(245,158,11,.10);
  --red:#ef4444;--red-bg:rgba(239,68,68,.10);
  --blue:#60a5fa;--blue-bg:rgba(96,165,250,.10);
  --purple:#a78bfa;--purple-bg:rgba(167,139,250,.10);
}
[data-theme="light"] {
  --bg-base:#f5f5f7;--bg-surface:#ffffff;--bg-elevated:#f2f2f2;--bg-hover:#ebebeb;
  --text-1:#1d1d1f;--text-2:#6e6e73;--text-3:#aeaeb2;
  --border:rgba(0,0,0,.08);--border-strong:rgba(0,0,0,.14);
}
`}</style>
      <aside style={{ width:collapsed?56:232, background:'rgba(10,10,10,0.95)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', transition:'width 0.2s ease', flexShrink:0, backdropFilter:'blur(20px)', zIndex:50 }}>
        <div style={{ padding:collapsed?'20px 0':'20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:collapsed?'center':'space-between', gap:10, minHeight:64 }}>
          {!collapsed&&(<div><div style={{ fontFamily:'var(--font-brand)', fontSize:16, letterSpacing:4, color:'var(--text-1)', lineHeight:1 }}>RIDEN</div><div style={{ fontSize:9, color:'var(--teal)', letterSpacing:2, marginTop:3, fontFamily:'var(--font-mono)' }}>ADMIN PANEL</div></div>)}
          {collapsed&&<div style={{ fontFamily:'var(--font-brand)', fontSize:10, color:'var(--teal)', letterSpacing:2 }}>R</div>}
          <button onClick={()=>setCollapsed(!collapsed)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:12, padding:4, borderRadius:4 }} onMouseEnter={e=>(e.currentTarget.style.color='var(--text-1)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text-3)')}>{collapsed?'›':'‹'}</button>
        </div>
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(item => {
            const active = isActive(item)
            return (
              <Link key={item.h} href={item.h} style={{ textDecoration:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:collapsed?'10px 0':'9px 12px', borderRadius:'var(--r)', background:active?'var(--teal-10)':'transparent', border:active?'1px solid var(--teal-20)':'1px solid transparent', cursor:'pointer', transition:'all 0.12s ease', justifyContent:collapsed?'center':'flex-start', position:'relative' }}>
                  {active&&<div style={{ position:'absolute', left:0, top:'20%', height:'60%', width:2, background:'var(--teal)', borderRadius:2 }} />}
                  <span style={{ fontSize:13, lineHeight:1, minWidth:16, textAlign:'center' }}>{item.icon}</span>
                  {!collapsed&&(
                    <>
                      <span style={{ fontSize:13, fontWeight:active?500:400, color:active?'var(--text-1)':'var(--text-2)', flex:1, letterSpacing:0.2 }}>{item.l}</span>
                      {item.badge&&pendingCount>0&&(<span style={{ background:'var(--amber)', color:'#000', fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:10, fontFamily:'var(--font-mono)', lineHeight:1.4 }}>{pendingCount}</span>)}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
        <div style={{ padding:'12px 8px', borderTop:'1px solid var(--border)' }}>
          {!collapsed&&(<div style={{ padding:'8px 12px', marginBottom:8 }}><div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--teal)', letterSpacing:1 }}>{time}</div><div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>Bangkok TZ</div></div>)}
          <button onClick={handleLogout} style={{ width:'100%', padding:collapsed?'10px 0':'9px 12px', background:'transparent', border:'1px solid transparent', borderRadius:'var(--r)', color:'var(--text-3)', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:8, justifyContent:collapsed?'center':'flex-start', transition:'all 0.12s', fontFamily:'var(--font-body)' }} onMouseEnter={e=>{ e.currentTarget.style.background='var(--red-bg)'; e.currentTarget.style.color='var(--red)' }} onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-3)' }}><span>⎋</span>{!collapsed&&<span>Sign out</span>}</button>
        </div>
      </aside>
      <main style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <header style={{ height:56, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 28px', gap:16, background:'rgba(10,10,10,0.8)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:40 }}>
          <div style={{ flex:1 }} />
          <button onClick={toggleTheme} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, color:'var(--text-2)', transition:'all 0.12s' }} title='Toggle theme'>
            {theme==='dark'?'☀️':'🌙'}
          </button>
          <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-3)', letterSpacing:0.5 }}>admin.riden.me</div>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--teal-10)', border:'1px solid var(--teal-20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--teal)', fontWeight:600, cursor:'pointer' }}>JG</div>
        </header>
        <div style={{ flex:1, padding:'28px', overflowY:'auto' }}>{children}</div>
      </main>
    </div>
  )
}
