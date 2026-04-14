'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const Y = '#D4E827', D = '#1A1A1A'
const NAV = [
  { href:'/dashboard', label:'Dashboard', labelTh:'ไดชบอร์ด' },
  { href:'/bookings', label:'Bookings', labelTh:'การจอง' },
  { href:'/operators', label:'Operators', labelTh:'ผู้ประกอบการ' },
  { href:'/reports', label:'Reports', labelTh:'รายงาน' },
]

export default function Shell({ children, title, action }: { children: React.ReactNode, title?: string, action?: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [lang] = useState<'en'|'th'>('en')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    const client = createClient()
    client.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      client.from('dmc_users').select('company_name').eq('id', user.id).single().then(({ data }) => {
        if (data) setCompanyName(data.company_name)
      })
    })
  }, [])

  async function signOut() { await createClient().auth.signOut(); router.push('/login') }

  return (
    <div style={{ minHeight:'100vh', background:'#F5F5F5', fontFamily:'var(--font-space)' }}>
      <style>{`
        .hide-mobile { display: flex; }
        .hide-desktop { display: none; }
        @media(max-width:768px) { .hide-mobile { display: none !important; } .hide-desktop { display: flex !important; } }
      `}</style>
      <nav style={{ background:D, position:'sticky', top:0, zIndex:50, height:56 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/dashboard" style={{ textDecoration:'none', display:'inline-flex', alignItems:'baseline', gap:5 }}>
            <span style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:20, letterSpacing:'-0.05em', color:Y }}>RIDEN</span>
            <span style={{ fontFamily:'var(--font-space)', fontWeight:500, fontSize:10, letterSpacing:'0.05em', opacity:0.55, color:Y }}>ไรเด็น</span>
          </Link>
          <div className="hide-mobile" style={{ alignItems:'center', gap:4 }}>
            {NAV.map(n => (
              <Link key={n.href} href={n.href} style={{ fontFamily:'var(--font-space)', fontSize:13, fontWeight:500, color:Y, opacity: path.startsWith(n.href) ? 1 : 0.5, textDecoration:'none', padding:'4px 10px', transition:'opacity 150ms' }}>
                {n.label}
              </Link>
            ))}
          </div>
          <div className="hide-mobile" style={{ alignItems:'center', gap:10 }}>
            {companyName && <span style={{ fontSize:11, color:Y, opacity:0.4 }}>{companyName}</span>}
            <button onClick={signOut} style={{ background:Y, color:D, border:'none', borderRadius:8, padding:'7px 14px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-syne)' }}>Sign out</button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="hide-desktop" style={{ background:'none', border:'none', cursor:'pointer', padding:8, color:Y }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <><path d="M4 4l12 12M16 4L4 16"/></> : <><path d="M3 7h14M3 12h14M3 17h14"/></>}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div style={{ background:'#222', borderTop:'0.5px solid #333', padding:'12px 20px' }}>
            {NAV.map(n => (
              <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
                style={{ display:'block', padding:'10px 0', fontSize:14, fontWeight:500, color: path.startsWith(n.href) ? Y : '#666', textDecoration:'none', borderBottom:'0.5px solid #2a2a2a', fontFamily:'var(--font-space)' }}>
                {n.label}
              </Link>
            ))}
            <button onClick={signOut} style={{ marginTop:12, width:'100%', padding:10, background:Y, color:D, border:'none', borderRadius:8, fontFamily:'var(--font-syne)', fontWeight:700, fontSize:13, cursor:'pointer' }}>Sign out</button>
          </div>
        )}
      </nav>
      {title && (
        <div style={{ background:D, borderBottom:'0.5px solid #2a2a2a' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' as const }}>
            <h1 style={{ fontFamily:'var(--font-syne)', fontWeight:700, fontSize:'clamp(18px,3vw,26px)', color:Y, letterSpacing:'-0.03em', lineHeight:1 }}>{title}</h1>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <main style={{ maxWidth:1280, margin:'0 auto', padding:'clamp(16px,3vw,32px) 20px' }}>{children}</main>
    </div>
  )
}
