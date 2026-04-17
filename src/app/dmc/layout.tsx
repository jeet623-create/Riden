'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  CalendarDays, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Sun,
  Moon
} from 'lucide-react'

const navItems = [
  { href: '/dmc/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dmc/bookings', icon: CalendarDays, label: 'Bookings' },
  { href: '/dmc/operators', icon: Building2, label: 'Operators' },
]

export default function DMCLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState<'dark'|'light'>('dark')
  const [lang, setLang] = useState<'en'|'th'|'zh'>('en')
  const [time, setTime] = useState('')
  const [company, setCompany] = useState('DMC Portal')
  const isLoginPage = pathname === '/dmc/login'

  useEffect(() => {
    if (isLoginPage) return
    
    const stored = localStorage.getItem('riden_dmc')
    if (stored) {
      const data = JSON.parse(stored)
      setCompany(data.name || 'DMC Portal')
    }
    
    const updateTime = () => {
      const now = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Bangkok', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
      setTime(now)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [isLoginPage])

  // Skip layout for login page
  if (isLoginPage) {
    return <>{children}</>
  }

  function logout() {
    localStorage.removeItem('riden_dmc')
    router.push('/dmc/login')
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        background: 'var(--bg-base)',
        backgroundImage: 'radial-gradient(circle, rgba(29,158,117,0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }}
    >
      {/* Sidebar */}
      <aside 
        className="fixed left-0 top-0 h-full flex flex-col transition-all duration-[280ms]"
        style={{ 
          width: collapsed ? 56 : 232,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)'
        }}
      >
        {/* Logo */}
        <div 
          className="h-16 flex items-center px-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {collapsed ? (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--teal-10)', border: '1px solid var(--teal-20)' }}
            >
              <span style={{ fontFamily: 'var(--font-brand)', fontSize: 14, color: 'var(--teal)' }}>R</span>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: 16, color: 'var(--teal)' }}>RIDEN</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: 2, textTransform: 'uppercase' }}>DMC PORTAL</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-20 translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
          style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border)',
            color: 'var(--text-2)'
          }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg mb-1 transition-colors"
                style={{
                  background: isActive ? 'var(--teal-10)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--teal)' : '2px solid transparent',
                  color: isActive ? 'var(--teal)' : 'var(--text-2)'
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {!collapsed && (
            <div className="mb-3">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-2)', letterSpacing: 2 }}>BANGKOK</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)' }}>{time}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 py-2 px-3 rounded-lg w-full transition-colors hover:text-red-500"
            style={{ color: 'var(--text-2)' }}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div 
        className="flex-1 transition-all duration-[280ms]"
        style={{ marginLeft: collapsed ? 56 : 232 }}
      >
        {/* Topbar */}
        <header 
          className="h-14 sticky top-0 z-40 flex items-center justify-between px-6 border-b"
          style={{ 
            background: 'rgba(17,17,17,0.8)',
            backdropFilter: 'blur(8px)',
            borderColor: 'var(--border)'
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>
            {company}
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div 
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {(['en', 'th', 'zh'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="px-2.5 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: lang === l ? 'var(--bg-elevated)' : 'transparent',
                    color: lang === l ? 'var(--text-1)' : 'var(--text-2)',
                    borderRight: l !== 'zh' ? '1px solid var(--border)' : 'none'
                  }}
                >
                  {l === 'en' ? 'EN' : l === 'th' ? 'TH' : '中文'}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" style={{ color: 'var(--text-2)' }} />
              ) : (
                <Moon className="w-4 h-4" style={{ color: 'var(--text-2)' }} />
              )}
            </button>

            {/* Avatar */}
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--teal-10)', border: '1px solid var(--teal-20)' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)' }}>D</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
