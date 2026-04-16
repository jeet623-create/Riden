'use client'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatCard } from '@/components/admin/stat-card'
import { TrendingUp, Banknote, UserCheck, Timer, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

const monthlyRevenue = [
  { month: 'Nov', revenue: 142000 },
  { month: 'Dec', revenue: 158000 },
  { month: 'Jan', revenue: 165000 },
  { month: 'Feb', revenue: 172000 },
  { month: 'Mar', revenue: 179000 },
  { month: 'Apr', revenue: 186000 },
]

const planBreakdown = [
  { plan: 'Starter', count: 18, amount: 2000 },
  { plan: 'Growth', count: 22, amount: 4000 },
  { plan: 'Pro', count: 7, amount: 6000 },
]

const recentPayments = [
  { company: 'Bangkok Express DMC', plan: 'Growth', date: '2026-04-15', amount: 4000 },
  { company: 'Phuket Premier DMC', plan: 'Pro', date: '2026-04-14', amount: 6000 },
  { company: 'Krabi Elite Travel', plan: 'Growth', date: '2026-04-13', amount: 4000 },
  { company: 'Pattaya Tours Co', plan: 'Starter', date: '2026-04-12', amount: 2000 },
  { company: 'Chiang Mai Adventures', plan: 'Starter', date: '2026-04-11', amount: 2000 },
]

const transactions = [
  { company: 'Bangkok Express DMC', email: 'contact@bangkokexpress.com', plan: 'growth', amount: 4000, start: '2026-04-15', end: '2026-05-15' },
  { company: 'Phuket Premier DMC', email: 'hello@phuketpremier.com', plan: 'pro', amount: 6000, start: '2026-04-14', end: '2026-05-14' },
  { company: 'Krabi Elite Travel', email: 'support@krabielite.com', plan: 'growth', amount: 4000, start: '2026-04-13', end: '2026-05-13' },
  { company: 'Pattaya Tours Co', email: 'info@pattayatours.com', plan: 'starter', amount: 2000, start: '2026-04-12', end: '2026-05-12' },
]

const totalMRR = planBreakdown.reduce((s, p) => s + p.count * p.amount, 0)

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
  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold">Finance</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-2)' }}>Revenue and subscription overview</p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors btn-active"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="MRR" value={`฿${totalMRR.toLocaleString()}`} sublabel="monthly recurring" color="teal" icon={<TrendingUp className="w-[18px] h-[18px]" />} />
        <StatCard label="Total Collected" value="฿842,000" sublabel="all time" color="green" icon={<Banknote className="w-[18px] h-[18px]" />} />
        <StatCard label="Active Subscribers" value={47} sublabel="paying now" color="blue" icon={<UserCheck className="w-[18px] h-[18px]" />} />
        <StatCard label="On Trial" value={8} sublabel="converting" color="amber" icon={<Timer className="w-[18px] h-[18px]" />} />
      </div>

      {/* MRR Trend Chart */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[14px] font-semibold">MRR Trend</h3>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="var(--text-2)" style={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-2)" style={{ fontSize: 12 }} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => `฿${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="var(--teal)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Plan Breakdown */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[14px] font-semibold">Plan Breakdown</h3>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>Active subscribers by plan</p>
          </div>
          <div className="p-6 space-y-4">
            {planBreakdown.map((item, i) => {
              const revenue = item.count * item.amount
              const pct = (revenue / totalMRR) * 100
              return (
                <motion.div 
                  key={item.plan}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-16">{item.plan}</span>
                      <span className="text-xs" style={{ color: 'var(--text-2)' }}>{item.count} DMCs</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
                      ฿{revenue.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--teal)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[14px] font-semibold">Recent Payments</h3>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>Latest activations</p>
          </div>
          <div className="p-6 space-y-3">
            {recentPayments.length > 0 ? recentPayments.map((p, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between py-2"
                style={{ borderBottom: i < recentPayments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <div>
                  <div className="text-[13px] font-medium mb-0.5">{p.company}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-2)' }}>{p.plan} · {p.date}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
                  +฿{p.amount.toLocaleString()}
                </div>
              </div>
            )) : (
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>No payments yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[14px] font-semibold">All Transactions</h3>
          <p className="text-xs" style={{ color: 'var(--text-2)' }}>{transactions.length} records</p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Company', 'Email', 'Plan', 'Amount', 'Start', 'End'].map(h => (
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
            {transactions.map((t, i) => (
              <tr 
                key={i} 
                className="transition-colors duration-120"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-4 py-3 text-sm font-medium">{t.company}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-2)' }}>{t.email}</td>
                <td className="px-4 py-3 capitalize" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{t.plan}</td>
                <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>฿{t.amount.toLocaleString()}</td>
                <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{t.start}</td>
                <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{t.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
