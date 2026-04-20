'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Wordmark } from '@/components/brand/Wordmark'
import { Monogram } from '@/components/brand/Monogram'

const NAV = [
  { h: '/admin', l: 'Dashboard', icon: '⊞', exact: true },
  { h: '/admin/dmcs', l: 'DMCs', icon: '🏢' },
  { h: '/admin/operators', l: 'Operators', icon: '🚐' },
  { h: '/admin/drivers', l: 'Drivers', icon: '👤' },
  { h: '/admin/vehicles', l: 'Vehicles', icon: '🚗' },
  { h: '/admin/bookings', l: 'Bookings', icon: '📋' },
  { h: '/admin/pending', l: 'Approvals', icon: '⏳', badge: true },
  { h: '/admin/subscriptions', l: 'Subscriptions', icon: '💳' },
  { h: '/admin/finance', l: 'Finance', icon: '$' },
  { h: '/admin/support', l: 'Support', icon: '💬' },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [time, setTime] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem('admin_theme') as 'dark' | 'light') || 'dark'
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
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' }))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { fetchPending() }, [])

  async function fetchPending() {
    const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    try {
      const r = await fetch(SUPA + '/rest/v1/drivers?is_verified=eq.false&is_active=eq.true&select=id', {
        headers: { apikey: KEY, Authorization: 'Bearer ' + KEY },
      })
      const d = await r.json()
      setPendingCount(Array.isArray(d) ? d.length : 0)
    } catch {}
  }

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/admin/login')
  }

  const isActive = (item: typeof NAV[0]) => (item.exact ? pathname === item.h : pathname.startsWith(item.h))

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="sticky top-0 h-screen flex flex-col z-50 flex-shrink-0 bg-sidebar border-r border-sidebar-border"
        style={{ width: collapsed ? 56 : 220, transition: 'width 200ms ease' }}
      >
        <div className="border-b border-sidebar-border flex items-center justify-between min-h-16 px-4" style={{ padding: collapsed ? '18px 0' : '18px 16px', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div className="text-foreground">
              <Wordmark size="sm" />
              <div className="font-mono text-[8px] text-primary uppercase tracking-[0.25em] mt-1 opacity-80">‹ Admin Panel</div>
            </div>
          )}
          {collapsed && (
            <div className="text-foreground">
              <Monogram size="sm" variant="solid" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted hover:text-foreground text-xs p-1 rounded flex-shrink-0"
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto flex flex-col gap-[1px]">
          {NAV.map(item => {
            const active = isActive(item)
            return (
              <Link key={item.h} href={item.h} className="no-underline">
                <div
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-md border transition-all duration-120 relative ${
                    active ? 'bg-primary-dim border-primary-border text-primary' : 'border-transparent text-muted hover:bg-surface-elevated hover:text-foreground'
                  }`}
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '9px 0' : '8px 10px' }}
                >
                  {active && <div className="absolute left-0 top-[20%] h-[60%] w-0.5 bg-primary rounded-sm" />}
                  <span className="text-xs leading-none text-center w-3.5">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className={`text-xs flex-1 ${active ? 'font-semibold text-foreground' : 'font-normal'}`}>{item.l}</span>
                      {item.badge && pendingCount > 0 && (
                        <span className="bg-warning text-[9px] font-bold text-studio-ink px-1.5 py-0.5 rounded font-mono">{pendingCount}</span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          {!collapsed && (
            <div className="px-2.5 py-1.5 mb-1.5">
              <div className="text-[10px] font-mono text-primary tracking-[0.15em]">{time}</div>
              <div className="text-[9px] font-mono text-muted mt-0.5">‹ BANGKOK</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-md text-muted hover:bg-danger-dim hover:text-danger transition-colors text-xs"
            style={{ padding: collapsed ? '9px 0' : '8px 10px', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span className="text-xs">→</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border sticky top-0 z-40 bg-surface/80 backdrop-blur-sm flex items-center px-6 gap-3.5">
          <div className="flex-1" />
          <div className="flex gap-0.5 bg-surface-elevated rounded-md p-0.5">
            {['EN', 'TH', '中文'].map(l => (
              <button key={l} className="px-2 py-0.5 rounded text-[10px] text-muted hover:text-foreground font-mono tracking-wider">
                {l}
              </button>
            ))}
          </div>
          <button onClick={toggleTheme} className="w-7.5 h-7.5 w-[30px] h-[30px] flex items-center justify-center rounded-md bg-surface-elevated border border-border text-muted">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="text-[10px] font-mono text-muted tracking-wider">admin.riden.me</div>
          <div className="w-7 h-7 rounded-full bg-primary-dim border border-primary-border flex items-center justify-center text-[10px] text-primary font-bold font-mono">A</div>
        </header>
        <div className="flex-1 p-7 overflow-y-auto bg-background">{children}</div>
      </main>
    </div>
  )
}
