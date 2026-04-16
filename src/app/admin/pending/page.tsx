'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { CheckCircle2, ZoomIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const initialDrivers = [
  { id: 1, name: 'Somchai Pattana', vehicle: 'Toyota Camry', plate: 'BKK-1234', license: 'DL-12345678', phone: '+66 82 123 4567', joined: '2026-04-14' },
  { id: 2, name: 'Prasert Suksawat', vehicle: 'Toyota Fortuner', plate: 'PKT-9012', license: 'DL-23456789', phone: '+66 87 345 6789', joined: '2026-04-13' },
  { id: 3, name: 'Sutin Nakornsri', vehicle: 'Toyota Alphard', plate: 'BKK-2345', license: 'DL-34567890', phone: '+66 84 678 9012', joined: '2026-04-12' },
]

const initialOperators = [
  { id: 1, company: 'Island Express', phone: '+66 76 345 6789', base: 'Phuket', alsoDriver: true, joined: '2026-04-10' },
]

export default function Page() {
  const [pendingDrivers, setPendingDrivers] = useState(initialDrivers)
  const [pendingOperators, setPendingOperators] = useState(initialOperators)
  const [loadingDriver, setLoadingDriver] = useState<number | null>(null)
  const [loadingOperator, setLoadingOperator] = useState<number | null>(null)

  const total = pendingDrivers.length + pendingOperators.length

  const approveDriver = async (id: number, name: string) => {
    setLoadingDriver(id)
    await new Promise(r => setTimeout(r, 600))
    setPendingDrivers(prev => prev.filter(d => d.id !== id))
    setLoadingDriver(null)
    toast.success(`${name} has been approved`)
  }

  const verifyOperator = async (id: number, name: string) => {
    setLoadingOperator(id)
    await new Promise(r => setTimeout(r, 600))
    setPendingOperators(prev => prev.filter(o => o.id !== id))
    setLoadingOperator(null)
    toast.success(`${name} has been verified`)
  }

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold">Pending Approvals</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-2)' }}>{total} items waiting for review</p>
        </div>
      </div>

      {/* All Clear State */}
      {total === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-20 text-center rounded-xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--teal)', opacity: 0.4 }} />
          <p className="text-[15px] font-medium">All clear!</p>
          <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>No pending approvals</p>
        </motion.div>
      ) : (
        <>
          {/* Drivers Section */}
          {pendingDrivers.length > 0 && (
            <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="font-medium">Drivers ({pendingDrivers.length})</h3>
                <p className="text-xs" style={{ color: 'var(--text-2)' }}>Awaiting license verification</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Name', 'Vehicle', 'Plate', 'License', 'Phone', 'Joined', 'Photo', 'Actions'].map((h, i) => (
                        <th 
                          key={h} 
                          className={`px-4 py-3 uppercase tracking-wider ${i === 7 ? 'text-right' : 'text-left'}`}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDrivers.map(d => (
                      <tr 
                        key={d.id} 
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="px-4 py-3 text-sm font-medium">{d.name}</td>
                        <td className="px-4 py-3 text-sm">{d.vehicle}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{d.plate}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{d.license}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{d.phone}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{d.joined}</td>
                        <td className="px-4 py-3">
                          <div 
                            className="w-[52px] h-[34px] rounded flex items-center justify-center"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                          >
                            <ZoomIn className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => approveDriver(d.id, d.name)}
                              disabled={loadingDriver === d.id}
                              className="px-3 py-1 rounded-lg text-xs font-medium transition-all btn-active flex items-center gap-1.5"
                              style={{ background: 'var(--teal)', color: '#fff', opacity: loadingDriver === d.id ? 0.7 : 1 }}
                            >
                              {loadingDriver === d.id && <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                              Approve
                            </button>
                            <button
                              className="px-3 py-1 rounded-lg text-xs transition-colors"
                              style={{ background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Operators Section */}
          {pendingOperators.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="font-medium">Operators ({pendingOperators.length})</h3>
                <p className="text-xs" style={{ color: 'var(--text-2)' }}>Awaiting verification</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Company', 'Phone', 'Base', 'Also Driver', 'Joined', 'Actions'].map((h, i) => (
                        <th 
                          key={h} 
                          className={`px-4 py-3 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOperators.map(o => (
                      <tr 
                        key={o.id} 
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="px-4 py-3 text-sm font-medium">{o.company}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{o.phone}</td>
                        <td className="px-4 py-3 text-sm">{o.base}</td>
                        <td className="px-4 py-3 text-sm">{o.alsoDriver ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{o.joined}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => verifyOperator(o.id, o.company)}
                            disabled={loadingOperator === o.id}
                            className="px-3 py-1 rounded-lg text-xs font-medium transition-all btn-active flex items-center gap-1.5 ml-auto"
                            style={{ background: 'var(--teal)', color: '#fff', opacity: loadingOperator === o.id ? 0.7 : 1 }}
                          >
                            {loadingOperator === o.id && <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  )
}
