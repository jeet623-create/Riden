'use client'
import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { LayoutDashboard, Building2, UserCheck, Users, Car, Calendar, Clock, CreditCard, DollarSign, MessageSquare, AlertCircle, LogOut, User } from 'lucide-react'
const NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/dmcs', label: 'DMCs', icon: Building2 },
  { path: '/admin/drivers', label: 'Drivers', icon: UserCheck },
  { path: '/admin/operators', label: 'Operators', icon: Users },
  { path: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { path: '/admin/pending', label: 'Approvals', icon: AlertCircle },
  { path: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { path: '/admin/finance', label: 'Finance', icon: DollarSign },
  { path: '/admin/support', label: 'Support', icon: MessageSquare },
]
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loaded, setLoaded] = useState(false)
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
  const fmt = (d: Date) => d.toLocaleTimeString('en-US', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  if (!loaded) return <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin"/></div>
  return (
    <div className="min-h-screen relative" style={{background:'#0e0e0e',color:'#f5f5f5',backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'40px 40px'}}>
      <div className="w-[232px] bg-[#141414] border-r border-white/[0.08] h-screen flex flex-col fixed left-0 top-0 z-50">
        <div className="p-6 border-b border-white/[0.08]">
          <div className="font-[family-name:var(--font-logo)] text-2xl text-[#1D9E75] tracking-wider">RIDEN</div>
          <div className="text-[10px] text-[#1D9E75] font-mono tracking-widest mt-1">ADMIN PANEL</div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ path, label, icon: Icon }) => {
            const active = pathname === path || pathname.startsWith(path + '/')
            return (
              <Link key={path} href={path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${active ? 'text-[#1D9E75] bg-[rgba(29,158,117,0.1)]' : 'text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]'}`}>
                {active && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1D9E75] rounded-r"/>}
                <Icon className="w-4 h-4 flex-shrink-0"/><span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-6 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 text-[#a3a3a3] mb-4">
            <Clock className="w-4 h-4"/>
            <div className="text-xs"><div className="text-[#737373] font-mono text-[10px]">BANGKOK</div><div className="font-mono text-sm">{fmt(time)}</div></div>
          </div>
          <button onClick={async()=>{const sb=createClient();await sb.auth.signOut();router.push('/admin/login')}} className="flex items-center gap-2 text-[#737373] hover:text-[#f5f5f5] text-xs">
            <LogOut className="w-4 h-4"/><span>Sign out</span>
          </button>
        </div>
      </div>
      <div className="ml-[232px]">
        <div className="h-14 border-b border-white/[0.08] bg-[#0e0e0e]/80 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-end px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#737373] font-mono">admin.riden.me</span>
            <div className="w-8 h-8 rounded-full bg-[#141414] border border-white/[0.08] flex items-center justify-center"><User className="w-4 h-4 text-[#a3a3a3]"/></div>
          </div>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
