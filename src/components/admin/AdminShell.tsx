'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { LayoutDashboard, Building2, Users, UserCheck, Car, Calendar, AlertCircle, CreditCard, DollarSign, MessageSquare, LogOut, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, labelEn: 'Dashboard', labelTh: 'แดชบอร์ด', labelZh: '仪表板' },
  { href: '/admin/dmcs', icon: Building2, labelEn: 'DMCs', labelTh: 'บริษัท DMC', labelZh: 'DMC公司' },
  { href: '/admin/operators', icon: Users, labelEn: 'Operators', labelTh: 'ผู้ประกอบการ', labelZh: '运营商' },
  { href: '/admin/drivers', icon: UserCheck, labelEn: 'Drivers', labelTh: 'คนขับ', labelZh: '司机' },
  { href: '/admin/vehicles', icon: Car, labelEn: 'Vehicles', labelTh: 'ยานพาหนะ', labelZh: '车辆' },
  { href: '/admin/bookings', icon: Calendar, labelEn: 'Bookings', labelTh: 'การจอง', labelZh: '预订' },
  { href: '/admin/pending', icon: AlertCircle, labelEn: 'Approvals', labelTh: 'รอการยืนยัน', labelZh: '待审批', badge: 5 },
  { href: '/admin/subscriptions', icon: CreditCard, labelEn: 'Subscriptions', labelTh: 'สมาชิก', labelZh: '订阅' },
  { href: '/admin/finance', icon: DollarSign, labelEn: 'Finance', labelTh: 'การเงิน', labelZh: '财务' },
  { href: '/admin/support', icon: MessageSquare, labelEn: 'Support', labelTh: 'ซัพพอร์ต', labelZh: '支持', badge: 3 },
]

type Lang = 'en' | 'th' | 'zh'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loaded, setLoaded] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return }
      sb.from('admin_users').select('id').eq('id', user.id).single()
        .then(({ data }) => { if (!data) router.push('/admin/login'); else setLoaded(true) })
    })
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  const getLabel = (item: typeof NAV[0]) => lang === 'th' ? item.labelTh : lang === 'zh' ? item.labelZh : item.labelEn

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--teal)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="min-h-screen flex dot-grid" style={{ background: 'var(--bg-base)', color: 'var(--text-1)', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 56 : 232, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', transition: 'width 280ms cubic-bezier(0.4,0,0.2,1)', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 12px' : '20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, minHeight: 64 }}>
          <div style={{ width: 32, height: 32, background: 'var(--teal)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: 16, color: 'var(--teal)', letterSpacing: 3 }}>RIDEN</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 }}>ADMIN PANEL</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 12px' : '9px 12px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', fontSize: 13, fontWeight: active ? 500 : 400, color: active ? 'var(--teal)' : 'var(--text-2)', background: active ? 'var(--teal-10)' : 'transparent', borderLeft: active ? '2px solid var(--teal)' : '2px solid transparent', transition: 'all 150ms', position: 'relative' }}>
                <Icon size={16} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{getLabel(item)}</span>}
                {!collapsed && item.badge && <span style={{ marginLeft: 'auto', background: 'var(--amber)', color: 'white', borderRadius: 99, fontSize: 10, padding: '1px 6px', fontFamily: 'var(--font-mono)' }}>{item.badge}</span>}
                {collapsed && item.badge && <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, background: 'var(--amber)', borderRadius: '50%' }} />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px 16px', borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Clock size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1 }}>BANGKOK</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}>{formatTime(time)}</div>
              </div>
            </div>
          )}
          <button onClick={async () => { await createClient().auth.signOut(); router.push('/admin/login') }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, padding: '6px 4px', borderRadius: 8, transition: 'color 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
            <LogOut size={14} />{!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ position: 'absolute', top: 20, right: -12, width: 24, height: 24, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
          {collapsed ? <ChevronRight size={12} style={{ color: 'var(--text-2)' }} /> : <ChevronLeft size={12} style={{ color: 'var(--text-2)' }} />}
        </button>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: collapsed ? 56 : 232, flex: 1, transition: 'margin-left 280ms cubic-bezier(0.4,0,0.2,1)' }}>
        {/* Topbar */}
        <header style={{ height: 56, borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: 12 }}>
          {/* Lang toggle */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['en','th','zh'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer', border: `1px solid ${lang===l?'var(--teal-20)':'var(--border)'}`, background: lang===l?'var(--teal-10)':'transparent', color: lang===l?'var(--teal)':'var(--text-3)', transition: 'all 150ms' }}>
                {l==='en'?'EN':l==='th'?'TH':'中文'}
              </button>
            ))}
          </div>
          {/* Theme toggle */}
          <button onClick={() => setTheme(t => t==='dark'?'light':'dark')}
            style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>
            {theme==='dark'?'☀️':'🌙'}
          </button>
          {/* Domain */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>admin.riden.me</span>
          {/* Avatar */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--teal-10)', border: '1px solid var(--teal-20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)' }}>A</div>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  )
}
