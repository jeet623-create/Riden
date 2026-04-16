'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { Check, X, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Operator {
  id: number
  company: string
  phone: string
  base: string
  alsoDriver: boolean
  verified: boolean
  status: string
  joined: string
  fleet: { type: string; plate: string; model: string }[]
}

const operators: Operator[] = [
  { id: 1, company: 'Siam Transport Co', phone: '+66 2 123 4567', base: 'Bangkok', alsoDriver: true, verified: true, status: 'active', joined: '2025-11-15', fleet: [{ type: 'Sedan', plate: 'BKK-1234', model: 'Toyota Camry' }, { type: 'Van', plate: 'BKK-5678', model: 'Toyota Hiace' }] },
  { id: 2, company: 'Northern Routes Ltd', phone: '+66 53 234 5678', base: 'Chiang Mai', alsoDriver: false, verified: true, status: 'active', joined: '2026-01-20', fleet: [{ type: 'SUV', plate: 'CMI-9012', model: 'Toyota Fortuner' }] },
  { id: 3, company: 'Island Express', phone: '+66 76 345 6789', base: 'Phuket', alsoDriver: true, verified: false, status: 'pending', joined: '2026-04-10', fleet: [{ type: 'Van', plate: 'PKT-3456', model: 'Mercedes-Benz V-Class' }, { type: 'Sedan', plate: 'PKT-7890', model: 'BMW 5 Series' }] },
  { id: 4, company: 'Krabi Transfers', phone: '+66 75 456 7890', base: 'Krabi', alsoDriver: true, verified: true, status: 'active', joined: '2026-02-05', fleet: [{ type: 'Van', plate: 'KBI-1122', model: 'Toyota Alphard' }] },
]

export default function Page() {
  const [sel, setSel] = useState<Operator | null>(null)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = operators.filter(o => !q || o.company.toLowerCase().includes(q.toLowerCase()) || o.base.toLowerCase().includes(q.toLowerCase()))

  const handleAction = async (action: 'verify' | 'suspend', op: Operator) => {
    setLoading(action)
    await new Promise(r => setTimeout(r, 800))
    setLoading(null)
    setSel(null)
    toast.success(action === 'verify' ? `${op.company} has been verified` : `${op.company} has been suspended`)
  }

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold">Operators</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-2)' }}>{operators.length} fleet owners</p>
        </div>
        <Input icon="search" placeholder="Search operators..." className="w-56" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {filtered.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Company', 'Phone', 'Base', 'Also Driver', 'Verified', 'Status', 'Joined', ''].map(h => (
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
              {filtered.map(o => (
                <tr 
                  key={o.id} 
                  className="transition-colors duration-120"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3 text-sm font-medium">{o.company}</td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{o.phone}</td>
                  <td className="px-4 py-3 text-sm">{o.base}</td>
                  <td className="px-4 py-3">
                    {o.alsoDriver ? <Check className="w-4 h-4" style={{ color: 'var(--teal)' }} /> : <span style={{ color: 'var(--text-2)' }}>-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {o.verified ? <Check className="w-4 h-4" style={{ color: 'var(--green)' }} /> : <span style={{ color: 'var(--text-2)' }}>-</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{o.joined}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSel(o)}
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
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-2)' }} />
            <p className="text-[14px] font-medium">No operators found</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>Try adjusting your search</p>
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
                    ['Phone', sel.phone],
                    ['Base', sel.base],
                    ['Also Driver', sel.alsoDriver ? 'Yes' : 'No'],
                    ['Verified', sel.verified ? 'Yes' : 'No'],
                    ['Joined', sel.joined],
                  ].map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>{key}</span>
                      <span className="text-[13px]">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Fleet */}
                <div className="mb-6">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                    Fleet ({sel.fleet.length})
                  </span>
                  <div className="mt-3 space-y-2">
                    {sel.fleet.length > 0 ? sel.fleet.map((v, i) => (
                      <div 
                        key={i} 
                        className="p-2.5 rounded-lg"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}
                          >
                            {v.type}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)' }}>{v.plate}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-2)' }}>{v.model}</span>
                      </div>
                    )) : (
                      <p className="text-xs" style={{ color: 'var(--text-2)' }}>No vehicles assigned</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {!sel.verified && (
                    <button
                      onClick={() => handleAction('verify', sel)}
                      disabled={loading === 'verify'}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all btn-active flex items-center justify-center gap-2"
                      style={{ background: 'var(--teal)', color: '#fff', opacity: loading === 'verify' ? 0.7 : 1 }}
                    >
                      {loading === 'verify' && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                      Verify Operator
                    </button>
                  )}
                  <button
                    onClick={() => handleAction('suspend', sel)}
                    disabled={loading === 'suspend'}
                    className="w-full py-2.5 rounded-lg text-sm font-medium transition-all btn-active flex items-center justify-center gap-2"
                    style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', opacity: loading === 'suspend' ? 0.7 : 1 }}
                  >
                    {loading === 'suspend' && <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(239,68,68,0.3)', borderTopColor: 'var(--red)' }} />}
                    Suspend
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
