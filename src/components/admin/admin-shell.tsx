'use client'
import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Building2, UserCheck, Users, Car, Calendar, 
  Clock, CreditCard, DollarSign, MessageSquare, AlertCircle, 
  LogOut, User, ChevronLeft, ChevronRight, Sun, Moon
} from 'lucide-react'

const NAV = [
  { path: '/admin/dashboard', label: { en: 'Dashboard', th: 'แดชบอร์ด', zh: '仪表板' }, icon: LayoutDashboard },
  { path: '/admin/dmcs', label: { en: 'DMCs', th: 'บริษัท DMC', zh: '目的地管理公司' }, icon: Building2 },
  { path: '/admin/drivers', label: { en: 'Drivers', th: 'คนขับ', zh: '司机' }, icon: UserCheck },
  { path: '/admin/operators', label: { en: 'Operators', th: 'ผู้ประกอบการ', zh: '运营商' }, icon: Users },
  { path: '/admin/vehicles', label: { en: 'Vehicles', th: 'ยานพาหนะ', zh: '车辆' }, icon: Car },
  { path: '/admin/bookings', label: { en: 'Bookings', th: 'การจอง', zh: '预订' }, icon: Calendar },
  { path: '/admin/pending', label: { en: 'Approvals', th: 'รอการอนุมัติ', zh: '待审批' }, icon: AlertCircle, badge: true },
  { path: '/admin/subscriptions', label: { en: 'Subscriptions', th: 'การสมัครสมาชิก', zh: '订阅' }, icon: CreditCard },
  { path: '/admin/finance', label: { en: 'Finance', th: 'การเงิน', zh: '财务' }, icon: DollarSign },
  { path: '/admin/support', label: { en: 'Support', th: 'ซัพพอร์ต', zh: '支持' }, icon: MessageSquare },
]

type Lang = 'en' | 'th' | 'zh'

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState(new Date())
  const [lang, setLang] = useState<Lang>('en')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [pendingCount] = useState(4) // Mock pending count

  useEffect(() => {
    const savedLang = localStorage.getItem('riden_lang') as Lang
    const savedTheme = localStorage.getItem('riden_theme') as 'dark' | 'light'
    if (savedLang) setLang(savedLang)
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const changeLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem('riden_lang', newLang)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('riden_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const handleLogout = () => {
    localStorage.removeItem('riden_admin')
    router.push('/admin/login')
  }

  const fmt = (d: Date) => d.toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Bangkok', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
  })

  return (
    <div 
      className="min-h-screen relative transition-colors duration-150" 
      style={{
        background: 'var(--bg-base)',
        color: 'var(--text-1)',
        backgroundImage: 'radial-gradient(circle, rgba(29,158,117,0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }}
    >
      {/* Sidebar */}
      <aside 
        className="fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: collapsed ? 56 : 232,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)'
        }}
      >
        {/* Logo */}
        <div 
          className="h-16 flex items-center px-4 relative"
          style={{ borderBottom: '1px solid var(--border)' }}
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
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: 16, color: 'var(--teal)', letterSpacing: 2 }}>RIDEN</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: 3, textTransform: 'uppercase' }}>ADMIN PANEL</div>
            </div>
          )}
          
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border)',
              color: 'var(--text-2)'
            }}
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ path, label, icon: Icon, badge }) => {
            const active = pathname === path || pathname.startsWith(path + '/')
            return (
              <Link key={path} href={path}>
                <div 
                  className="flex items-center gap-3 mx-2 mb-0.5 rounded-lg transition-all duration-120 relative"
                  style={{
                    padding: collapsed ? '10px 12px' : '10px 12px',
                    background: active ? 'var(--teal-10)' : 'transparent',
                    color: active ? 'var(--teal)' : 'var(--text-2)',
                    borderLeft: active ? '2px solid var(--teal)' : '2px solid transparent'
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--bg-elevated)'
                      e.currentTarget.style.color = 'var(--text-1)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-2)'
                    }
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-sm">{label[lang]}</span>
                      {badge && pendingCount > 0 && (
                        <span 
                          className="ml-auto w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ 
                            background: 'var(--amber)', 
                            color: '#000',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10
                          }}
                        >
                          {pendingCount}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div className="mb-4">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-2)', marginBottom: 2 }}>BANGKOK</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--teal)' }}>{fmt(time)}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full transition-colors"
            style={{ color: 'var(--text-2)', fontSize: 12 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>{lang === 'en' ? 'Sign out' : lang === 'th' ? 'ออกจากระบบ' : '退出'}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div 
        className="transition-all duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: collapsed ? 56 : 232 }}
      >
        {/* Topbar */}
        <header 
          className="h-14 sticky top-0 z-40 flex items-center justify-end px-6"
          style={{ 
            background: 'rgba(var(--bg-surface-rgb, 17,17,17), 0.8)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div className="flex items-center gap-3">
            {/* Domain label */}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>admin.riden.me</span>
            
            {/* Language toggle */}
            <div 
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {(['en', 'th', 'zh'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className="px-2.5 py-1 text-xs font-medium transition-colors"
                  style={{
                    background: lang === l ? 'var(--bg-base)' : 'transparent',
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
              onClick={toggleTheme}
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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)' }}>A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
