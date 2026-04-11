'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Stats = {
  activeTrips: number
  pendingConfirmations: number
  completedThisWeek: number
  paymentsPending: number
}

type Booking = {
  id: string
  booking_ref: string
  client_name: string
  total_days: number
  status: string
  created_at: string
}

type Alert = {
  id: string
  booking_ref: string
  client_name: string
  trip_date: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{email: string, company: string} | null>(null)
  const [stats, setStats] = useState<Stats>({ activeTrips: 0, pendingConfirmations: 0, completedThisWeek: 0, paymentsPending: 0 })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }

      const { data: dmc } = await supabase
        .from('dmc_users')
        .select('company_name')
        .eq('id', authUser.id)
        .single()

      setUser({ email: authUser.email!, company: dmc?.company_name ?? 'Your Company' })

      // Fetch stats
      const [bookingsRes, activeRes, completedRes, paymentsRes] = await Promise.all([
        supabase.from('bookings').select('id').eq('dmc_id', authUser.id).eq('status', 'pending'),
        supabase.from('trips').select('id').eq('status', 'in_progress'),
        supabase.from('bookings').select('id').eq('dmc_id', authUser.id).eq('status', 'completed').gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString()),
        supabase.from('payments').select('id').eq('status', 'pending'),
      ])

      setStats({
        pendingConfirmations: bookingsRes.data?.length ?? 0,
        activeTrips: activeRes.data?.length ?? 0,
        completedThisWeek: completedRes.data?.length ?? 0,
        paymentsPending: paymentsRes.data?.length ?? 0,
      })

      // Fetch recent bookings
      const { data: recent } = await supabase
        .from('bookings')
        .select('id, booking_ref, client_name, total_days, status, created_at')
        .eq('dmc_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentBookings(recent ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-pending', confirmed: 'badge-confirmed',
      in_progress: 'badge-progress', completed: 'badge-completed', cancelled: 'badge-cancelled'
    }
    const labels: Record<string, string> = {
      pending: 'Pending', confirmed: 'Confirmed',
      in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled'
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'badge-pending'}`}>
        {labels[status] ?? status}
      </span>
    )
  }

  if (loading) return (
    <div className="min-h-screen bg-riden-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-riden-teal/30 border-t-riden-teal rounded-full animate-spin mx-auto mb-4" />
        <p className="text-riden-text text-sm font-mono">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

      {/* Top Nav */}
      <nav className="relative z-50 border-b border-riden-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-riden-teal rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <path d="M15 19l2 2 4-4"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
              </svg>
            </div>
            <span className="font-display font-700 text-riden-white tracking-wider">RIDEN</span>
            <span className="text-riden-border">|</span>
            <span className="text-riden-text text-sm">{user?.company}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-riden-muted text-xs font-mono hidden md:block">
              {time.toLocaleTimeString('en', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
            </span>
            <Link href="/bookings/new">
              <button className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                New Booking
              </button>
            </Link>
            <button onClick={handleLogout} className="btn-ghost px-3 py-2 text-sm">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8 stagger">
          <h1 className="font-display text-3xl font-700 text-riden-white mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </h1>
          <p className="text-riden-text">Here's what's happening with your bookings today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
          {[
            { label: 'Active Trips', value: stats.activeTrips, icon: '🚗', color: 'text-riden-teal', alert: false },
            { label: 'Pending Confirm', value: stats.pendingConfirmations, icon: '⏳', color: 'text-yellow-400', alert: stats.pendingConfirmations > 0 },
            { label: 'Completed (7d)', value: stats.completedThisWeek, icon: '✅', color: 'text-green-400', alert: false },
            { label: 'Payments Due', value: stats.paymentsPending, icon: '💳', color: 'text-blue-400', alert: stats.paymentsPending > 0 },
          ].map((stat) => (
            <div key={stat.label} className={`glass glass-hover rounded-xl p-5 relative overflow-hidden ${stat.alert ? 'border-yellow-400/20' : ''}`}>
              {stat.alert && <div className="absolute top-3 right-3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className={`font-display text-3xl font-800 ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-riden-text text-xs font-mono uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Alert strip */}
        {stats.pendingConfirmations > 0 && (
          <div className="mb-6 glass rounded-xl px-5 py-4 border-red-500/20 flex items-center gap-3 animate-fade-in">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <p className="text-red-300 text-sm">
              <span className="font-medium">{stats.pendingConfirmations} booking{stats.pendingConfirmations > 1 ? 's' : ''}</span> awaiting confirmation from operators
            </p>
            <Link href="/bookings" className="ml-auto text-riden-teal text-sm hover:underline">View all →</Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-riden-border flex items-center justify-between">
                <h2 className="font-display font-600 text-riden-white">Recent Bookings</h2>
                <Link href="/bookings" className="text-riden-teal text-sm hover:text-riden-teal-light transition-colors">
                  View all →
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-riden-text text-sm mb-4">No bookings yet</p>
                  <Link href="/bookings/new">
                    <button className="btn-primary px-5 py-2.5 text-sm">Create First Booking</button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-riden-border">
                  {recentBookings.map((booking) => (
                    <Link href={`/bookings/${booking.id}`} key={booking.id}>
                      <div className="px-6 py-4 flex items-center justify-between hover:bg-riden-card/50 transition-colors cursor-pointer">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-riden-teal">{booking.booking_ref}</span>
                            {statusBadge(booking.status)}
                          </div>
                          <p className="text-riden-white text-sm font-medium">{booking.client_name}</p>
                          <p className="text-riden-muted text-xs mt-0.5">{booking.total_days} day{booking.total_days > 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-riden-text text-xs">
                            {new Date(booking.created_at).toLocaleDateString('en', {month: 'short', day: 'numeric'})}
                          </p>
                          <svg className="ml-auto mt-2 text-riden-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="glass rounded-xl p-6">
              <h2 className="font-display font-600 text-riden-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { label: 'New Booking', icon: '➕', href: '/bookings/new', primary: true },
                  { label: 'View All Bookings', icon: '📋', href: '/bookings', primary: false },
                  { label: 'Active Trips', icon: '🚗', href: '/trips', primary: false },
                  { label: 'Payments', icon: '💳', href: '/payments', primary: false },
                ].map((action) => (
                  <Link href={action.href} key={action.label}>
                    <button className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                      action.primary
                        ? 'btn-primary py-3'
                        : 'btn-ghost text-riden-text hover:text-riden-white'
                    }`}>
                      <span>{action.icon}</span>
                      <span className="text-sm">{action.label}</span>
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-display font-600 text-riden-white text-sm mb-4">System Status</h3>
              <div className="space-y-3">
                {[
                  { label: 'LINE Bot', status: 'Operational' },
                  { label: 'Booking Engine', status: 'Operational' },
                  { label: 'Live Tracking', status: 'Operational' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-riden-text text-xs">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-riden-teal rounded-full animate-pulse" />
                      <span className="text-riden-teal text-xs">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
