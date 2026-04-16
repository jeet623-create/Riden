'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { Car, X, ZoomIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Vehicle {
  id: number
  plate: string
  type: string
  brand: string
  color: string
  seats: number
  operator: string
  driver: string | null
  status: string
  photo: string | null
}

const vehicles: Vehicle[] = [
  { id: 1, plate: 'BKK-1234', type: 'Van 9', brand: 'Toyota HiAce', color: 'White', seats: 9, operator: 'Siam Transport Co', driver: 'Somchai P.', status: 'active', photo: null },
  { id: 2, plate: 'BKK-5678', type: 'Sedan', brand: 'Toyota Camry', color: 'Silver', seats: 4, operator: 'Siam Transport Co', driver: 'Niran C.', status: 'active', photo: null },
  { id: 3, plate: 'CMI-9012', type: 'SUV', brand: 'Toyota Fortuner', color: 'Black', seats: 7, operator: 'Northern Routes Ltd', driver: 'Prasert S.', status: 'active', photo: null },
  { id: 4, plate: 'PKT-3456', type: 'Van 12', brand: 'Mercedes-Benz V-Class', color: 'White', seats: 12, operator: 'Island Express', driver: null, status: 'inactive', photo: null },
  { id: 5, plate: 'PKT-7890', type: 'Sedan', brand: 'BMW 5 Series', color: 'Black', seats: 4, operator: 'Island Express', driver: 'Wichai Y.', status: 'active', photo: null },
  { id: 6, plate: 'BKK-2345', type: 'Van 9', brand: 'Toyota Alphard', color: 'White', seats: 9, operator: 'Siam Transport Co', driver: 'Sutin N.', status: 'active', photo: null },
]

const typeColors: Record<string, { bg: string; text: string }> = {
  'Van 9': { bg: 'var(--blue-bg)', text: 'var(--blue)' },
  'Van 12': { bg: 'var(--purple-bg)', text: 'var(--purple)' },
  'Sedan': { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-2)' },
  'SUV': { bg: 'var(--teal-10)', text: 'var(--teal)' },
  'Coach': { bg: 'var(--amber-bg)', text: 'var(--amber)' },
}

export default function Page() {
  const [q, setQ] = useState('')
  const [lightbox, setLightbox] = useState<string | null>(null)

  const filtered = vehicles.filter(v => 
    !q || 
    v.plate.toLowerCase().includes(q.toLowerCase()) || 
    v.brand.toLowerCase().includes(q.toLowerCase()) || 
    v.operator.toLowerCase().includes(q.toLowerCase())
  )

  const activeCount = vehicles.filter(v => v.status === 'active').length
  const unassignedCount = vehicles.filter(v => !v.driver).length

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold">Vehicles</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-2)' }}>{vehicles.length} vehicles registered</p>
        </div>
        <Input icon="search" placeholder="Search vehicles..." className="w-56" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: vehicles.length, color: 'var(--text-1)' },
          { label: 'Active', value: activeCount, color: 'var(--green)' },
          { label: 'Inactive', value: vehicles.length - activeCount, color: 'var(--amber)' },
          { label: 'Unassigned', value: unassignedCount, color: 'var(--red)' },
        ].map(s => (
          <div 
            key={s.label} 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="text-xs mb-2" style={{ color: 'var(--text-2)' }}>{s.label}</div>
            <div className="text-3xl font-medium" style={{ fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {filtered.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Photo', 'Plate', 'Type', 'Brand/Model', 'Seats', 'Operator', 'Driver', 'Status'].map(h => (
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
              {filtered.map(v => {
                const typeStyle = typeColors[v.type] || { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-2)' }
                return (
                  <tr 
                    key={v.id} 
                    className="transition-colors duration-120"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <div 
                        className="w-[52px] h-9 rounded-md flex items-center justify-center cursor-pointer"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                        onClick={() => v.photo && setLightbox(v.photo)}
                      >
                        {v.photo ? (
                          <img src={v.photo} alt="Vehicle" className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <ZoomIn className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--teal)' }}>{v.plate}</td>
                    <td className="px-4 py-3">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: typeStyle.bg, color: typeStyle.text }}
                      >
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{v.brand}</td>
                    <td className="px-4 py-3 text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>{v.seats}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-2)' }}>{v.operator}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: v.driver ? 'var(--text-2)' : 'var(--amber)', fontStyle: v.driver ? 'normal' : 'italic' }}>
                      {v.driver || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center">
            <Car className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-2)' }} />
            <p className="text-[14px] font-medium">No vehicles found</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightbox(null)}
          >
            <button 
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={lightbox} 
              alt="Vehicle" 
              className="max-w-[90vw] max-h-[90vh] rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
