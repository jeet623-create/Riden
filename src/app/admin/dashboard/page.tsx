'use client'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatCard } from '@/components/admin/stat-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { Building2, Users, UserCheck, DollarSign, Map, Car, Clock, ClipboardList, RefreshCw, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const bookingTrend = [
  { date: 'Apr 10', bookings: 12 },
  { date: 'Apr 11', bookings: 19 },
  { date: 'Apr 12', bookings: 15 },
  { date: 'Apr 13', bookings: 22 },
  { date: 'Apr 14', bookings: 28 },
  { date: 'Apr 15', bookings: 25 },
  { date: 'Apr 16', bookings: 23 },
]

const revenueTrend = [
  { month: 'Nov', revenue: 142000 },
  { month: 'Dec', revenue: 158000 },
  { month: 'Jan', revenue: 165000 },
  { month: 'Feb', revenue: 172000 },
  { month: 'Mar', revenue: 179000 },
  { month: 'Apr', revenue: 186000 },
]

const recentBookings = [
  { ref: 'BK-2026-001', client: 'Singapore Tours Ltd', dmc: 'Bangkok Express DMC', days: 5, status: 'confirmed', created: '2026-04-14' },
  { ref: 'BK-2026-002', client: 'Euro Travel Group', dmc: 'Chiang Mai Adventures', days: 3, status: 'pending', created: '2026-04-14' },
  { ref: 'BK-2026-003', client: 'Asia Pacific Tours', dmc: 'Phuket Premier DMC', days: 7, status: 'confirmed', created: '2026-04-13' },
  { ref: 'BK-2026-004', client: 'Global Destinations', dmc: 'Bangkok Express DMC', days: 4, status: 'in_progress', created: '2026-04-13' },
  { ref: 'BK-2026-005', client: 'Luxury Escapes Co', dmc: 'Krabi Elite Travel', days: 6, status: 'confirmed', created: '2026-04-12' },
]

const pendingDrivers = 12

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
  },
}

export default function Page() {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  const staggerDelay = (i: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } })

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold" style={{ fontFamily: 'var(--font-body)' }}>Command Center</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-2)' }}>{date} · Bangkok</p>
        </div>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors btn-active"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Row 1 */}
      <motion.div {...staggerDelay(0)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Active DMCs" value={47} sublabel="companies" color="teal" icon={<Building2 className="w-[18px] h-[18px]" />} />
        <StatCard label="Operators" value={182} sublabel="fleet owners" color="blue" icon={<Users className="w-[18px] h-[18px]" />} />
        <StatCard label="Verified Drivers" value={329} sublabel="in pool" color="green" icon={<UserCheck className="w-[18px] h-[18px]" />} />
        <StatCard label="Est. MRR" value="฿186,000" sublabel="monthly recurring" color="amber" icon={<DollarSign className="w-[18px] h-[18px]" />} />
      </motion.div>

      {/* Stats Row 2 */}
      <motion.div {...staggerDelay(1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Trips" value={23} sublabel="running now" color="green" icon={<Map className="w-[18px] h-[18px]" />} />
        <StatCard label="Vehicles" value={456} sublabel="active fleet" color="grey" icon={<Car className="w-[18px] h-[18px]" />} />
        <StatCard label="Pending Review" value={12} sublabel="need approval" color="amber" icon={<Clock className="w-[18px] h-[18px]" />} />
        <StatCard label="Recent Bookings" value={89} sublabel="this week" color="blue" icon={<ClipboardList className="w-[18px] h-[18px]" />} />
      </motion.div>

      {/* Alert Banner */}
      <AnimatePresence>
        {pendingDrivers > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-3.5 px-5 flex items-center justify-between mb-6"
            style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" style={{ color: 'var(--amber)' }} />
              <div>
                <div className="text-[13px] font-medium" style={{ color: 'var(--amber)' }}>{pendingDrivers} drivers waiting for approval</div>
                <div className="text-xs" style={{ color: 'var(--text-2)' }}>Review driver applications to activate their accounts</div>
              </div>
            </div>
            <Link 
              href="/admin/pending"
              className="px-3 py-1.5 text-xs rounded-lg transition-colors"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              Review
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts */}
      <motion.div {...staggerDelay(2)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Booking Trend */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[14px] font-semibold">7-Day Booking Trend</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={bookingTrend}>
                <defs>
                  <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-2)" style={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-2)" style={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="bookings" stroke="var(--teal)" strokeWidth={2} fillOpacity={1} fill="url(#bookingGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MRR Growth */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[14px] font-semibold">MRR Growth</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-2)" style={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-2)" style={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => `฿${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="var(--teal)" strokeWidth={2} dot={{ fill: 'var(--teal)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div {...staggerDelay(3)} className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-[14px] font-semibold">Recent Bookings</h3>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>Latest platform activity</p>
          </div>
          <Link href="/admin/bookings" className="text-xs hover:underline" style={{ color: 'var(--teal)' }}>
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Ref', 'Client', 'DMC', 'Days', 'Status', 'Created'].map(h => (
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
              {recentBookings.map((b, i) => (
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
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>{b.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AdminShell>
  )
}
