'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { ClipboardList } from 'lucide-react'

const bookings = [
  { ref: 'BK-2026-001', client: 'Singapore Tours Ltd', dmc: 'Bangkok Express DMC', days: 5, type: 'airport_transfer', status: 'confirmed', created: '2026-04-14' },
  { ref: 'BK-2026-002', client: 'Euro Travel Group', dmc: 'Chiang Mai Adventures', days: 3, type: 'city_tour', status: 'pending', created: '2026-04-14' },
  { ref: 'BK-2026-003', client: 'Asia Pacific Tours', dmc: 'Phuket Premier DMC', days: 7, type: 'multi_day', status: 'confirmed', created: '2026-04-13' },
  { ref: 'BK-2026-004', client: 'Global Destinations', dmc: 'Bangkok Express DMC', days: 4, type: 'private_charter', status: 'in_progress', created: '2026-04-13' },
  { ref: 'BK-2026-005', client: 'Luxury Escapes Co', dmc: 'Krabi Elite Travel', days: 6, type: 'multi_day', status: 'confirmed', created: '2026-04-12' },
  { ref: 'BK-2026-006', client: 'Adventure Seekers', dmc: 'Chiang Mai Adventures', days: 2, type: 'day_trip', status: 'completed', created: '2026-04-10' },
  { ref: 'BK-2026-007', client: 'Family Holidays Inc', dmc: 'Pattaya Tours Co', days: 1, type: 'airport_transfer', status: 'cancelled', created: '2026-04-09' },
]

const filters = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']

export default function Page() {
  const [tab, setTab] = useState('All')
  const [q, setQ] = useState('')

  const filtered = bookings.filter(b => {
    const matchTab = tab === 'All' || b.status === tab.toLowerCase().replace(' ', '_')
    const matchQ = !q || b.ref.toLowerCase().includes(q.toLowerCase()) || b.client.toLowerCase().includes(q.toLowerCase())
    return matchTab && matchQ
  })

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold">Bookings</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-2)' }}>{bookings.length} total</p>
        </div>
        <Input icon="search" placeholder="Search bookings..." className="w-56" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filters.map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap btn-active"
            style={{
              background: tab === t ? 'var(--teal)' : 'var(--bg-surface)',
              color: tab === t ? '#fff' : 'var(--text-2)',
              border: tab === t ? 'none' : '1px solid var(--border)'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {filtered.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Ref', 'Client', 'DMC', 'Days', 'Type', 'Status', 'Created'].map(h => (
                  <th 
                    key={h} 
                    className="text-left px-4 py-3 uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr 
                  key={i} 
                  className="transition-colors duration-120 cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--teal)' }}>{b.ref}</td>
                  <td className="px-4 py-3 text-sm font-medium">{b.client}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-2)' }}>{b.dmc}</td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>{b.days}d</td>
                  <td className="px-4 py-3 text-sm capitalize">{b.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} showPulse={b.status === 'in_progress'} />
                  </td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>{b.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-2)' }} />
            <p className="text-[14px] font-medium">No bookings found</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
