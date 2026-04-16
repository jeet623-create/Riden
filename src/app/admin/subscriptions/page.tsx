'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const subs = [
  { company: 'Bangkok Express DMC', email: 'contact@bangkokexpress.com', plan: 'growth', amount: 4000, start: '2025-11-20', end: '2026-11-20', status: 'active' },
  { company: 'Chiang Mai Adventures', email: 'info@cmadventures.com', plan: 'starter', amount: 2000, start: '2026-04-01', end: '2026-04-30', status: 'trial' },
  { company: 'Phuket Premier DMC', email: 'hello@phuketpremier.com', plan: 'pro', amount: 6000, start: '2025-08-15', end: '2026-08-15', status: 'active' },
  { company: 'Krabi Elite Travel', email: 'support@krabielite.com', plan: 'growth', amount: 4000, start: '2026-01-10', end: '2027-01-10', status: 'active' },
]

const plans = [
  { name: 'starter', price: 2000 },
  { name: 'growth', price: 4000 },
  { name: 'pro', price: 6000 },
]

const dmcOptions = [
  { id: 'new', name: 'New DMC Company' },
  { id: 'bkk', name: 'Bangkok Express DMC' },
  { id: 'pkt', name: 'Phuket Premier DMC' },
  { id: 'cmi', name: 'Chiang Mai Adventures' },
]

export default function Page() {
  const [modal, setModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('growth')
  const [months, setMonths] = useState(12)
  const [selectedDmc, setSelectedDmc] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedPlanPrice = plans.find(p => p.name === selectedPlan)?.price ?? 0
  const total = selectedPlanPrice * months

  const handleActivate = async () => {
    if (!selectedDmc) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setModal(false)
    setSelectedDmc('')
    setNotes('')
    setMonths(12)
    toast.success('Subscription activated successfully')
  }

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold">Subscriptions</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-2)' }}>Manual bank transfer activation</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium btn-active"
          style={{ background: 'var(--teal)', color: '#fff' }}
        >
          + Activate Plan
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Company', 'Email', 'Plan', 'Amount', 'Start', 'End', 'Status'].map(h => (
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
            {subs.map((s, i) => (
              <tr 
                key={i} 
                className="transition-colors duration-120"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-4 py-3 text-sm font-medium">{s.company}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-2)' }}>{s.email}</td>
                <td className="px-4 py-3 capitalize" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{s.plan}</td>
                <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>฿{s.amount.toLocaleString()}</td>
                <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{s.start}</td>
                <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{s.end}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Activation Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-[460px] rounded-2xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                  <h2 className="text-[15px] font-semibold">Activate Subscription</h2>
                  <button
                    onClick={() => setModal(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* DMC Select */}
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                      DMC Company
                    </label>
                    <select
                      value={selectedDmc}
                      onChange={e => setSelectedDmc(e.target.value)}
                      className="mt-2 w-full h-10 px-3 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                    >
                      <option value="">Select DMC...</option>
                      {dmcOptions.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Selection */}
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                      Plan
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {plans.map(p => (
                        <button
                          key={p.name}
                          onClick={() => setSelectedPlan(p.name)}
                          className="p-3 rounded-lg text-center transition-all btn-active"
                          style={{
                            background: selectedPlan === p.name ? 'var(--teal-10)' : 'var(--bg-elevated)',
                            border: selectedPlan === p.name ? '1px solid var(--teal-20)' : '1px solid var(--border)',
                            color: selectedPlan === p.name ? 'var(--teal)' : 'var(--text-2)'
                          }}
                        >
                          <div className="text-xs font-semibold capitalize mb-1">{p.name}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>฿{p.price.toLocaleString()}/mo</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Months */}
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                      Months
                    </label>
                    <input
                      type="number"
                      value={months}
                      onChange={e => setMonths(Math.max(1, Math.min(24, Number(e.target.value))))}
                      min={1}
                      max={24}
                      className="mt-2 w-full h-10 px-3 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Optional notes..."
                      className="mt-2 w-full h-10 px-3 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                    />
                  </div>

                  {/* Total Preview */}
                  <AnimatePresence>
                    {selectedDmc && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg p-3"
                        style={{ background: 'var(--teal-10)', border: '1px solid var(--teal-20)' }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}>
                          Total: ฿{total.toLocaleString()} · {months} month{months !== 1 ? 's' : ''}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setModal(false)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleActivate}
                    disabled={!selectedDmc || loading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium btn-active flex items-center justify-center gap-2"
                    style={{ 
                      background: 'var(--teal)', 
                      color: '#fff', 
                      opacity: !selectedDmc || loading ? 0.5 : 1,
                      cursor: !selectedDmc || loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                    Activate
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
