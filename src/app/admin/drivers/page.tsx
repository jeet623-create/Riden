'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { X, ZoomIn, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Driver {
  id: number
  name: string
  vehicle: string
  plate: string
  phone: string
  location: string
  licenseNumber: string
  licenseExpiry: string
  status: string
  vehiclePhoto: string | null
}

const drivers: Driver[] = [
  { id: 1, name: 'Somchai Pattana', vehicle: 'Toyota Camry', plate: 'BKK-1234', phone: '+66 82 123 4567', location: 'Bangkok', licenseNumber: 'DL-12345678', licenseExpiry: '2027-06-15', status: 'pending', vehiclePhoto: null },
  { id: 2, name: 'Niran Chaiwong', vehicle: 'Honda Accord', plate: 'CMI-5678', phone: '+66 85 234 5678', location: 'Chiang Mai', licenseNumber: 'DL-23456789', licenseExpiry: '2026-12-20', status: 'active', vehiclePhoto: null },
  { id: 3, name: 'Prasert Suksawat', vehicle: 'Toyota Fortuner', plate: 'PKT-9012', phone: '+66 87 345 6789', location: 'Phuket', licenseNumber: 'DL-34567890', licenseExpiry: '2025-03-10', status: 'pending', vehiclePhoto: null },
  { id: 4, name: 'Wichai Yongyut', vehicle: 'Mercedes-Benz E-Class', plate: 'BKK-3456', phone: '+66 89 456 7890', location: 'Bangkok', licenseNumber: 'DL-45678901', licenseExpiry: '2028-09-25', status: 'active', vehiclePhoto: null },
  { id: 5, name: 'Anan Rattana', vehicle: 'BMW 5 Series', plate: 'KBI-7890', phone: '+66 81 567 8901', location: 'Krabi', licenseNumber: 'DL-56789012', licenseExpiry: '2026-01-05', status: 'inactive', vehiclePhoto: null },
  { id: 6, name: 'Sutin Nakornsri', vehicle: 'Toyota Alphard', plate: 'BKK-2345', phone: '+66 84 678 9012', location: 'Bangkok', licenseNumber: 'DL-67890123', licenseExpiry: '2027-04-18', status: 'pending', vehiclePhoto: null },
]

const filters = ['All', 'Pending', 'Active', 'Inactive']

export default function Page() {
  const [tab, setTab] = useState('Pending')
  const [sel, setSel] = useState<Driver | null>(null)
  const [lightbox, setLightbox] = useState(false)
  const [rejection, setRejection] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const pendingCount = drivers.filter(d => d.status === 'pending').length
  const filtered = tab === 'All' ? drivers : drivers.filter(d => d.status === tab.toLowerCase())

  const handleAction = async (action: 'approve' | 'reject', driver: Driver) => {
    setLoading(action)
    await new Promise(r => setTimeout(r, 800))
    setLoading(null)
    setSel(null)
    setRejection('')
    toast.success(action === 'approve' ? `${driver.name} has been approved` : `${driver.name} has been rejected`)
  }

  const isLicenseExpired = (date: string) => new Date(date) < new Date()

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-bold">Driver Verification</h1>
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'var(--amber-bg)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.2)', fontFamily: 'var(--font-mono)' }}
          >
            {pendingCount} pending
          </span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6">
        {filters.map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className="px-4 py-2 rounded-full text-sm font-medium transition-all btn-active"
            style={{
              background: tab === t ? 'var(--teal)' : 'var(--bg-surface)',
              color: tab === t ? '#fff' : 'var(--text-2)',
              border: tab === t ? 'none' : '1px solid var(--border)'
            }}
          >
            {t === 'Pending' ? `Pending (${pendingCount})` : t}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl overflow-hidden card-hover cursor-pointer"
              style={{ 
                background: 'var(--bg-surface)', 
                border: d.status === 'pending' ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--border)'
              }}
              onClick={() => setSel(d)}
            >
              {/* Image */}
              <div 
                className="h-[148px] relative flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)' }}
              >
                {d.vehiclePhoto ? (
                  <img src={d.vehiclePhoto} alt="Vehicle" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px]" style={{ color: 'var(--text-2)' }}>No photo uploaded</span>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={d.status} variant="small" />
                </div>
                {d.status === 'pending' && (
                  <div 
                    className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: 'var(--amber)', color: '#000' }}
                  >
                    REVIEW
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-3.5">
                <div className="font-medium text-[14px] mb-0.5">{d.name}</div>
                <div className="text-[11px] mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
                  {d.vehicle} · {d.plate}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <div>
                    <div style={{ color: 'var(--text-2)' }}>Phone</div>
                    <div style={{ fontFamily: 'var(--font-mono)' }}>{d.phone}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-2)' }}>Location</div>
                    <div>{d.location}</div>
                  </div>
                </div>
                {d.status === 'pending' && (
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setSel(d); handleAction('approve', d) }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium btn-active"
                      style={{ background: 'var(--teal)', color: '#fff' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSel(d)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium btn-active"
                      style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-2)' }} />
          <p className="text-[14px] font-medium">No drivers found</p>
          <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>Try selecting a different filter</p>
        </div>
      )}

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
              onClick={() => { setSel(null); setRejection('') }}
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
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-[16px] font-semibold">{sel.name}</h2>
                  <button
                    onClick={() => { setSel(null); setRejection('') }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Vehicle Photo */}
                <div className="mb-4">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                    Vehicle Photo
                  </span>
                  <div 
                    className="mt-2 h-56 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                    onClick={() => setLightbox(true)}
                  >
                    {sel.vehiclePhoto ? (
                      <img src={sel.vehiclePhoto} alt="Vehicle" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center">
                        <ZoomIn className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--text-2)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-2)' }}>No photo available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="rounded-xl p-4 space-y-3 mb-6" style={{ background: 'var(--bg-elevated)' }}>
                  {[
                    ['Phone', sel.phone],
                    ['Vehicle', sel.vehicle],
                    ['Plate', sel.plate],
                    ['License #', sel.licenseNumber],
                    ['License Expiry', sel.licenseExpiry],
                    ['Base', sel.location],
                  ].map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>{key}</span>
                      <span 
                        className="text-[13px]"
                        style={{ 
                          color: key === 'License Expiry' && isLicenseExpired(value) ? 'var(--red)' : 'var(--text-1)',
                          fontFamily: ['Phone', 'Plate', 'License #', 'License Expiry'].includes(key) ? 'var(--font-mono)' : 'var(--font-body)'
                        }}
                      >
                        {value}
                        {key === 'License Expiry' && isLicenseExpired(value) && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
                            EXPIRED
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pending Actions */}
                {sel.status === 'pending' && (
                  <>
                    <div className="mb-4">
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                        Rejection Reason (optional)
                      </label>
                      <textarea
                        value={rejection}
                        onChange={e => setRejection(e.target.value)}
                        placeholder="Enter reason..."
                        rows={3}
                        className="mt-2 w-full rounded-xl p-3 text-sm resize-none outline-none transition-colors"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAction('approve', sel)}
                        disabled={loading === 'approve'}
                        className="w-full py-2.5 rounded-lg text-sm font-medium transition-all btn-active flex items-center justify-center gap-2"
                        style={{ background: 'var(--teal)', color: '#fff', opacity: loading === 'approve' ? 0.7 : 1 }}
                      >
                        {loading === 'approve' && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                        Approve Driver
                      </button>
                      <button
                        onClick={() => handleAction('reject', sel)}
                        disabled={loading === 'reject'}
                        className="w-full py-2.5 rounded-lg text-sm font-medium transition-all btn-active flex items-center justify-center gap-2"
                        style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', opacity: loading === 'reject' ? 0.7 : 1 }}
                      >
                        {loading === 'reject' && <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(239,68,68,0.3)', borderTopColor: 'var(--red)' }} />}
                        Reject Application
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && sel?.vehiclePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightbox(false)}
          >
            <button 
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={sel.vehiclePhoto} 
              alt="Vehicle" 
              className="max-w-[90vw] max-h-[90vh] rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  )
}
