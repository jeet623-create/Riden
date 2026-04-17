'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarDays, Building2, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react'

const mockStats = [
  { label: 'TOTAL BOOKINGS', value: 24, icon: CalendarDays, color: 'var(--teal)', trend: '+12%' },
  { label: 'PENDING', value: 3, icon: Clock, color: 'var(--amber)', trend: null },
  { label: 'CONFIRMED', value: 18, icon: TrendingUp, color: 'var(--teal)', trend: '+8%' },
  { label: 'ACTIVE', value: 3, icon: Building2, color: 'var(--blue)', trend: null },
]

const mockBookings = [
  { id: 'BK-2024-001', client: 'Wellness Travel Co.', days: 5, status: 'confirmed', date: '2024-01-15' },
  { id: 'BK-2024-002', client: 'Adventure Tours Ltd.', days: 3, status: 'pending', date: '2024-01-16' },
  { id: 'BK-2024-003', client: 'Thai Experiences', days: 7, status: 'in_progress', date: '2024-01-14' },
  { id: 'BK-2024-004', client: 'Global DMC', days: 2, status: 'confirmed', date: '2024-01-17' },
]

const statusStyles: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  confirmed: { bg: 'var(--teal-10)', color: 'var(--teal)' },
  in_progress: { bg: 'rgba(59,130,246,0.1)', color: 'var(--blue)' },
  completed: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-2)' },
  cancelled: { bg: 'var(--red-dim)', color: 'var(--red)' },
}

export default function DMCDashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Welcome back to your DMC portal</p>
        </div>
        <Link
          href="/dmc/bookings/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ 
            background: 'var(--teal)', 
            color: '#fff',
            boxShadow: '0 4px 12px rgba(29,158,117,0.25)'
          }}
        >
          <Plus className="w-4 h-4" />
          New Booking
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 relative overflow-hidden transition-all hover:border-opacity-100"
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border)',
              borderLeftWidth: 3,
              borderLeftColor: stat.color
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <span 
                className="text-[10px] font-medium tracking-wider"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}
              >
                {stat.label}
              </span>
              <stat.icon className="w-[18px] h-[18px] opacity-60" style={{ color: stat.color }} />
            </div>
            <div 
              className="text-[28px] font-bold"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--text-1)' }}
            >
              {mounted ? stat.value : 0}
            </div>
            {stat.trend && (
              <div className="text-xs mt-1" style={{ color: 'var(--teal)' }}>
                {stat.trend} this month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div 
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Recent Bookings</h2>
          <Link 
            href="/dmc/bookings" 
            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--teal)' }}
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Table Header */}
        <div 
          className="grid grid-cols-5 gap-4 px-5 py-3"
          style={{ background: 'var(--bg-base)' }}
        >
          {['BOOKING ID', 'CLIENT', 'DAYS', 'STATUS', 'DATE'].map(h => (
            <div 
              key={h} 
              className="text-[10px] font-medium tracking-wider"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {mockBookings.map(booking => (
          <div 
            key={booking.id}
            className="grid grid-cols-5 gap-4 px-5 py-3.5 border-b transition-all hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'var(--border)' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)' }}>
              {booking.id}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-1)' }}>{booking.client}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
              {booking.days} day{booking.days > 1 ? 's' : ''}
            </div>
            <div>
              <span 
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ 
                  fontFamily: 'var(--font-mono)',
                  background: statusStyles[booking.status]?.bg,
                  color: statusStyles[booking.status]?.color
                }}
              >
                {booking.status === 'in_progress' && (
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                )}
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
              {booking.date}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/dmc/bookings"
          className="rounded-xl p-5 transition-all hover:border-[var(--teal)]"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <CalendarDays className="w-8 h-8 mb-3" style={{ color: 'var(--teal)' }} />
          <div className="font-semibold" style={{ color: 'var(--text-1)' }}>All Bookings</div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>View and manage all your bookings</div>
        </Link>

        <Link 
          href="/dmc/operators"
          className="rounded-xl p-5 transition-all hover:border-[var(--teal)]"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <Building2 className="w-8 h-8 mb-3" style={{ color: 'var(--teal)' }} />
          <div className="font-semibold" style={{ color: 'var(--text-1)' }}>Operators</div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Manage your preferred operators</div>
        </Link>
      </div>
    </div>
  )
}
