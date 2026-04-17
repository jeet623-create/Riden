'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Search, Check } from 'lucide-react'

const vehicleTypes = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'van_9', label: 'Van 9 seats' },
  { value: 'van_12', label: 'Van 12 seats' },
  { value: 'minibus_15', label: 'Minibus 15' },
  { value: 'minibus_20', label: 'Minibus 20' },
  { value: 'coach_30', label: 'Coach 30+' },
]

const bookingTypes = [
  { value: 'airport_transfer', label: 'Airport Transfer' },
  { value: 'hotel_transfer', label: 'Hotel Transfer' },
  { value: 'full_day', label: 'Full Day' },
  { value: 'multi_day', label: 'Multi Day' },
  { value: 'custom', label: 'Custom' },
]

const mockOperators = [
  { id: 'op1', company: 'Bangkok Premium Transport', ridenId: 'OP-1042', location: 'Bangkok' },
  { id: 'op2', company: 'Chiang Mai Transfers', ridenId: 'OP-2156', location: 'Chiang Mai' },
]

export default function CreateBookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clientName: '',
    sourceAgent: '',
    bookingType: 'full_day',
    flightNumber: '',
    adults: 2,
    children: 0,
    specialRequirements: '',
    notes: '',
    operatorId: '',
    sendToPool: false,
  })
  const [days, setDays] = useState([
    { date: '', pickupTime: '09:00', pickup: '', dropoff: '', vehicleType: 'van_9' }
  ])
  const [operatorSearch, setOperatorSearch] = useState('')
  const [searchResults, setSearchResults] = useState<typeof mockOperators>([])

  function addDay() {
    setDays([...days, { date: '', pickupTime: '09:00', pickup: '', dropoff: '', vehicleType: 'van_9' }])
  }

  function removeDay(index: number) {
    if (days.length > 1) {
      setDays(days.filter((_, i) => i !== index))
    }
  }

  function updateDay(index: number, field: string, value: string) {
    setDays(days.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  function handleOperatorSearch(q: string) {
    setOperatorSearch(q)
    if (q.length >= 2) {
      setSearchResults(mockOperators.filter(op =>
        op.company.toLowerCase().includes(q.toLowerCase()) ||
        op.ridenId.toLowerCase().includes(q.toLowerCase())
      ))
    } else {
      setSearchResults([])
    }
  }

  function selectOperator(op: typeof mockOperators[0]) {
    setForm({ ...form, operatorId: op.id, sendToPool: false })
    setOperatorSearch(op.company)
    setSearchResults([])
  }

  async function handleSubmit() {
    if (!form.clientName) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    router.push('/dmc/bookings')
  }

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
  }

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-2)',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dmc/bookings"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Create Booking</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>Fill in the details for your new booking</p>
        </div>
      </div>

      {/* Client Information */}
      <div 
        className="rounded-xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--teal)' }}>Client Information</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2" style={labelStyle}>Client Name *</label>
            <input
              type="text"
              value={form.clientName}
              onChange={e => setForm({ ...form, clientName: e.target.value })}
              placeholder="Tourist or agent name"
              className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label className="block mb-2" style={labelStyle}>Source Agent</label>
            <input
              type="text"
              value={form.sourceAgent}
              onChange={e => setForm({ ...form, sourceAgent: e.target.value })}
              placeholder="Agency name"
              className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2" style={labelStyle}>Booking Type</label>
            <select
              value={form.bookingType}
              onChange={e => setForm({ ...form, bookingType: e.target.value })}
              className="w-full h-11 px-4 rounded-lg text-sm outline-none"
              style={inputStyle}
            >
              {bookingTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2" style={labelStyle}>Flight Number</label>
            <input
              type="text"
              value={form.flightNumber}
              onChange={e => setForm({ ...form, flightNumber: e.target.value })}
              placeholder="Optional"
              className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2" style={labelStyle}>Adults</label>
            <input
              type="number"
              value={form.adults}
              onChange={e => setForm({ ...form, adults: parseInt(e.target.value) || 1 })}
              min={1}
              className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label className="block mb-2" style={labelStyle}>Children</label>
            <input
              type="number"
              value={form.children}
              onChange={e => setForm({ ...form, children: parseInt(e.target.value) || 0 })}
              min={0}
              className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2" style={labelStyle}>Special Requirements</label>
          <input
            type="text"
            value={form.specialRequirements}
            onChange={e => setForm({ ...form, specialRequirements: e.target.value })}
            placeholder="Child seat, wheelchair, English driver..."
            className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div>
          <label className="block mb-2" style={labelStyle}>Notes for Operator</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Any special instructions"
            rows={3}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all resize-none"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* Trip Days */}
      <div 
        className="rounded-xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: 'var(--teal)' }}>Trip Days ({days.length})</h2>
          <button
            onClick={addDay}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ border: '1px solid var(--teal)', color: 'var(--teal)' }}
          >
            <Plus className="w-4 h-4" /> Add Day
          </button>
        </div>

        {days.map((day, i) => (
          <div 
            key={i}
            className="rounded-lg p-4 mb-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>Day {i + 1}</span>
              {days.length > 1 && (
                <button
                  onClick={() => removeDay(i)}
                  className="p-1 rounded transition-colors hover:bg-red-500/10"
                  style={{ color: 'var(--red)' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block mb-1.5" style={labelStyle}>Date *</label>
                <input
                  type="date"
                  value={day.date}
                  onChange={e => updateDay(i, 'date', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Pickup Time</label>
                <input
                  type="time"
                  value={day.pickupTime}
                  onChange={e => updateDay(i, 'pickupTime', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1.5" style={labelStyle}>Pickup Location *</label>
              <input
                type="text"
                value={day.pickup}
                onChange={e => updateDay(i, 'pickup', e.target.value)}
                placeholder="Hotel name or address"
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1.5" style={labelStyle}>Dropoff Location *</label>
              <input
                type="text"
                value={day.dropoff}
                onChange={e => updateDay(i, 'dropoff', e.target.value)}
                placeholder="Destination"
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>Vehicle Type</label>
              <select
                value={day.vehicleType}
                onChange={e => updateDay(i, 'vehicleType', e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={inputStyle}
              >
                {vehicleTypes.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Send To */}
      <div 
        className="rounded-xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--teal)' }}>Send To</h2>

        <div className="mb-4">
          <label className="block mb-2" style={labelStyle}>Search Preferred Operator</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-2)' }} />
            <input
              type="text"
              value={operatorSearch}
              onChange={e => handleOperatorSearch(e.target.value)}
              placeholder="Type operator name or RIDEN ID..."
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {searchResults.length > 0 && (
            <div 
              className="rounded-lg mt-2 overflow-hidden"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              {searchResults.map(op => (
                <div
                  key={op.id}
                  onClick={() => selectOperator(op)}
                  className="px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-surface)]"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="font-medium" style={{ color: 'var(--text-1)' }}>{op.company}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                    {op.ridenId} | {op.location}
                  </div>
                </div>
              ))}
            </div>
          )}

          {form.operatorId && (
            <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--teal)' }}>
              <Check className="w-4 h-4" /> Operator selected
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.sendToPool}
            onChange={e => setForm({ ...form, sendToPool: e.target.checked, operatorId: '' })}
            className="w-4 h-4 rounded"
            style={{ accentColor: 'var(--teal)' }}
          />
          <span className="text-sm" style={{ color: 'var(--text-2)' }}>Send directly to Pool</span>
        </label>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !form.clientName}
        className="w-full h-12 rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          background: 'var(--teal)',
          color: '#fff',
          opacity: loading || !form.clientName ? 0.6 : 1,
          cursor: loading || !form.clientName ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(29,158,117,0.25)'
        }}
      >
        {loading ? 'Creating...' : 'Create Booking & Send to Operator'}
      </button>
    </div>
  )
}
