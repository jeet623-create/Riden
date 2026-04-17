'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Eye } from 'lucide-react'

const mockBookings = [
  { id: 'BK-2024-001', client: 'Wellness Travel Co.', type: 'multi_day', days: 5, pax: 8, status: 'confirmed', date: '2024-01-15' },
  { id: 'BK-2024-002', client: 'Adventure Tours Ltd.', type: 'transfer', days: 1, pax: 4, status: 'pending', date: '2024-01-16' },
  { id: 'BK-2024-003', client: 'Thai Experiences', type: 'multi_day', days: 7, pax: 12, status: 'in_progress', date: '2024-01-14' },
  { id: 'BK-2024-004', client: 'Global DMC', type: 'full_day', days: 2, pax: 6, status: 'confirmed', date: '2024-01-17' },
  { id: 'BK-2024-005', client: 'Asia Pacific Tours', type: 'transfer', days: 1, pax: 2, status: 'completed', date: '2024-01-10' },
  { id: 'BK-2024-006', client: 'Premium Journeys', type: 'multi_day', days: 10, pax: 20, status: 'pending', date: '2024-01-18' },
]

const statusStyles: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  confirmed: { bg: 'var(--teal-10)', color: 'var(--teal)' },
  in_progress: { bg: 'rgba(59,130,246,0.1)', color: 'var(--blue)' },
  completed: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-2)' },
  cancelled: { bg: 'var(--red-dim)', color: 'var(--red)' },
}

const filters = ['all', 'pending', 'confirmed', 'in_progress', 'completed']

export default function DMCBookingsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = mockBookings.filter(b => {
    if (activeFilter !== 'all' && b.status !== activeFilter) return false
    if (search && !b.client.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Bookings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Manage all your transport bookings</p>
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

      {/* Filters & Search */}
      <div className="flex items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeFilter === f ? 'var(--teal-10)' : 'transparent',
                border: activeFilter === f ? '1px solid var(--teal-20)' : '1px solid var(--border)',
                color: activeFilter === f ? 'var(--teal)' : 'var(--text-2)'
              }}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-2)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="h-9 pl-9 pr-4 rounded-lg text-sm outline-none transition-all"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
              width: 220
            }}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* Table */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Table Header */}
        <div 
          className="grid grid-cols-7 gap-4 px-5 py-3"
          style={{ background: 'var(--bg-base)' }}
        >
          {['BOOKING ID', 'CLIENT', 'TYPE', 'DAYS', 'PAX', 'STATUS', 'DATE'].map(h => (
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
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 opacity-30">📋</div>
            <div className="font-medium" style={{ color: 'var(--text-1)' }}>No bookings found</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Try adjusting your filters</div>
          </div>
        ) : (
          filtered.map(booking => (
            <div 
              key={booking.id}
              className="grid grid-cols-7 gap-4 px-5 py-3.5 border-b transition-all hover:bg-[var(--bg-elevated)] cursor-pointer group"
              style={{ borderColor: 'var(--border)' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}>
                {booking.id}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{booking.client}</div>
              <div className="text-sm capitalize" style={{ color: 'var(--text-2)' }}>{booking.type.replace('_', ' ')}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
                {booking.days}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
                {booking.pax}
              </div>
              <div>
                <span 
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
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
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
                  {booking.date}
                </span>
                <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-2)' }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
