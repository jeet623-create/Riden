'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const NAV_EN = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/dmc', icon: '🏢', label: 'DMC Companies' },
  { href: '/admin/operators', icon: '🚐', label: 'Operators' },
  { href: '/admin/drivers', icon: '👤', label: 'Drivers' },
  { href: '/admin/vehicles', icon: '🚗', label: 'Vehicles' },
  { href: '/admin/bookings', icon: '📋', label: 'Bookings' },
  { href: '/admin/subscriptions', icon: '💳', label: 'Subscriptions' },
  { href: '/admin/support', icon: '🎧', label: 'Support' },
]
const NAV_TH = [
  { href: '/admin/dashboard', icon: '📊', label: 'แดชบอร์ด' },
  { href: '/admin/dmc', icon: '🏢', label: 'บริษัท DMC' },
  { href: '/admin/operators', icon: '🚐', label: 'ผู้ประกอบการ' },
  { href: '/admin/drivers', icon: '👤', label: 'คนขับ' },
  { href: '/admin/vehicles', icon: '🚗', label: 'ยานพาหนะ' },
  { href: '/admin/bookings', icon: '📋', label: 'การจอง' },
  { href: '/admin/subscriptions', icon: '💳', label: 'การสมัครสมาชิก' },
  { href: '/admin/support', icon: '🎧', label: 'ซัพพอร์ต' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminInfo, setAdminInfo] = useState<{name:string,role:string,lang:string}|null>(null)
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('riden_admin')
    if (!stored) { router.push('/admin/login'); return }
    const info = JSON.parse(stored)
    setAdminInfo(info)
    setLang(info.lang || 'en')
  }, [router])

  async function handleLogout() {
    await createClient().auth.signOut()
    localStorage.removeItem('riden_admin')
    router.push('/admin/login')
  }

  function toggleLang() {
    const newLang = lang === 'en' ? 'th' : 'en'
    setLang(newLang)
    if (adminInfo) {
      const updated = { ...adminInfo, lang: newLang }
      setAdminInfo(updated)
      localStorage.setItem('riden_admin', JSON.stringify(updated))
    }
  }

  const nav = lang === 'en' ? NAV_EN : NAV_TH

  if (!adminInfo) return (
    <div className="min-h-screen bg-riden-black flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-riden-teal/30 border-t-riden-teal rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-riden-black flex">
      <aside className={`${sidebarOpen?'w-56':'w-16'} transition-all duration-300 border-r border-riden-border flex flex-col bg-riden-black/95 fixed h-full z-40`}>
        <div className="px-4 py-5 border-b border-riden-border flex items-center gap-3">
          <div className="w-8 h-8 bg-riden-teal rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-display text-sm font-700 text-riden-white">RIDEN</div>
              <div className="text-riden-teal text-xs font-mono">ADMIN</div>
            </div>
          )}
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {nav.map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl mb-0.5 transition-all cursor-pointer ${pathname.startsWith(item.href)?'bg-riden-teal/15 text-riden-teal':'text-riden-text hover:bg-riden-card/50 hover:text-riden-white'}`}>
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-riden-border space-y-2">
          <button onClick={toggleLang} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-riden-text hover:text-riden-white transition-colors text-sm">
            <span>🌐</span>{sidebarOpen && <span>{lang==='en'?'ภาษาไทย':'English'}</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-riden-text hover:text-red-400 transition-colors text-sm">
            <span>🚪</span>{sidebarOpen && <span>{lang==='en'?'Logout':'ออกจากระบบ'}</span>}
          </button>
        </div>
      </aside>
      <div className={`${sidebarOpen?'ml-56':'ml-16'} transition-all duration-300 flex-1 flex flex-col min-h-screen`}>
        <header className="border-b border-riden-border px-6 py-3 flex items-center justify-between bg-riden-black/80 backdrop-blur sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-riden-muted hover:text-riden-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-riden-teal rounded-full animate-pulse" />
            <span className="text-riden-text text-sm">{adminInfo.name}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-mono ${adminInfo.role==='superadmin'?'bg-yellow-400/10 text-yellow-400':'bg-riden-teal/10 text-riden-teal'}`}>{adminInfo.role}</span>
          </div>
        </header>
        <main className="flex-1 p-6 relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
