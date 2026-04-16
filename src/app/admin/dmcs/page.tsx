'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { X, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface DMC {
  id: number
  company: string
  contact: string
  email: string
  country: string
  language: string
  plan: string
  status: string
  trialEnds: string | null
  lineConnected: boolean
  joined: string
}

const dmcs: DMC[] = [
  { id: 1, company: 'Bangkok Express DMC', contact: 'Somchai P.', email: 'contact@bangkokexpress.com', country: 'Thailand', language: 'en', plan: 'growth', status: 'active', trialEnds: null, lineConnected: true, joined: '2025-11-15' },
  { id: 2, company: 'Chiang Mai Adventures', contact: 'Niran C.', email: 'info@cmadventures.com', country: 'Thailand', language: 'th', plan: 'starter', status: 'trial', trialEnds: '2026-04-30', lineConnected: false, joined: '2026-04-01' },
  { id: 3, company: 'Phuket Premier DMC', contact: 'Prasert S.', email: 'hello@phuketpremier.com', country: 'Thailand', language: 'en', plan: 'pro', status: 'active', trialEnds: null, lineConnected: true, joined: '2025-08-15' },
  { id: 4, company: 'Krabi Elite Travel', contact: 'Wichai Y.', email: 'support@krabielite.com', country: 'Thailand', language: 'en', plan: 'growth', status: 'active', trialEnds: null, lineConnected: true, joined: '2026-01-10' },
  { id: 5, company: 'Korea DMC Bangkok', contact: 'Kim J.', email: 'ops@koreabkk.com', country: 'South Korea', language: 'en', plan: 'starter', status: 'active', trialEnds: null, lineConnected: false, joined: '2026-02-20' },
  { id: 6, company: 'Euro Adventures Thailand', contact: 'Mueller H.', email: 'hello@euroadv.com', country: 'Germany', language: 'en', plan: 'growth', status: 'suspended', trialEnds: null, lineConnected: false, joined: '2026-03-01' },
]

const filters = ['all', 'trial', 'active', 'expired', 'suspended']

export default function Page() {
  const [sel, setSel] = useState<DMC | null>(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = dmcs.filter(d => {
    const matchQuery = !q || d.company.toLowerCase().includes(q.toLowerCase()) || d.email.toLowerCase().includes(q.toLowerCase())
    const matchFilter = filter === 'all' || d.status === filter
    return matchQuery && matchFilter
  })

  const handleAction = async (action: 'activate' | 'suspend', dmc: DMC) => {
    setLoading(action)
    await new Promise(r => setTimeout(r, 800))
    setLoading(null)
    setSel(null)
    toast.success(action === 'activate' ? `${dmc.company} has been activated` : `${dmc.company} has been suspended`)
  }

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold">DMC Management</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-2)' }}>{dmcs.length} companies registered</p>
        </div>
        <Input icon="search" placeholder="Search company or email..." className="w-60" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-5">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-medium capitalize transition-all btn-active"
            style={{
              background: filter === f ? 'var(--teal)' : 'var(--bg-surface)',
              color: filter === f ? '#fff' : 'var(--text-2)',
              border: filter === f ? 'none' : '1px solid var(--border)'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {filtered.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Company', 'Email', 'Country', 'Plan', 'Status', 'Trial Ends', 'Joined', ''].map(h => (
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
              {filtered.map(d => (
                <tr 
                  key={d.id} 
                  className="transition-colors duration-120"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3 text-sm font-medium">{d.company}</td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{d.email}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-2)' }}>{d.country}</td>
                  <td className="px-4 py-3 capitalize" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{d.plan}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{d.trialEnds || '-'}</td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{d.joined}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSel(d)}
                      className="px-3 py-1 text-xs rounded-lg transition-colors"
                      style={{ background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-2)' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-1)' }}>No DMCs found</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {sel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSel(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
              className="fixed right-0 top-0 h-full w-[440px] z-50 overflow-y-auto"
              style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                  <div>
                    <h2 className="text-[16px] font-semibold mb-1">{sel.company}</h2>
                    <StatusBadge status={sel.status} />
                  </div>
                  <button
                    onClick={() => setSel(null)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Grid */}
                <div className="rounded-xl p-4 space-y-3 mb-6" style={{ background: 'var(--bg-elevated)' }}>
                  {[
                    ['Email', sel.email],
                    ['Country', sel.country],
                    ['Language', sel.language.toUpperCase()],
                    ['Plan', sel.plan],
                    ['Status', sel.status],
                    ['Trial Ends', sel.trialEnds || '-'],
                    ['Joined', sel.joined],
                  ].map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>{key}</span>
                      <span className="text-[13px] capitalize">{value}</span>
                    </div>
                  ))}
                </div>

                {/* LINE Status */}
                <div className="flex items-center justify-between mb-6">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>LINE</span>
                  {sel.lineConnected ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--teal-10)', color: 'var(--teal)' }}>
                      LINE Connected
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-2)', fontSize: 13 }}>-</span>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {sel.status !== 'active' && (
                    <button
                      onClick={() => handleAction('activate', sel)}
                      disabled={loading === 'activate'}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all btn-active flex items-center justify-center gap-2"
                      style={{ background: 'var(--teal)', color: '#fff', opacity: loading === 'activate' ? 0.7 : 1 }}
                    >
                      {loading === 'activate' ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : null}
                      Activate Account
                    </button>
                  )}
                  {sel.status !== 'suspended' && (
                    <button
                      onClick={() => handleAction('suspend', sel)}
                      disabled={loading === 'suspend'}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all btn-active flex items-center justify-center gap-2"
                      style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', opacity: loading === 'suspend' ? 0.7 : 1 }}
                    >
                      {loading === 'suspend' ? (
                        <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(239,68,68,0.3)', borderTopColor: 'var(--red)' }} />
                      ) : null}
                      Suspend Account
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
