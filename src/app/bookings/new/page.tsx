'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

type TripDay = {
  day_number: number
  trip_date: string
  pickup_time: string
  pickup_location: string
  dropoff_location: string
}

type Operator = { id: string; company_name: string }

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan', emoji: '🚗', seats: 4 },
  { value: 'van_9', label: 'Van 9 seats', emoji: '🚐', seats: 9 },
  { value: 'van_12', label: 'Van 12 seats', emoji: '🚐', seats: 12 },
  { value: 'minibus_15', label: 'Minibus 15', emoji: '🚌', seats: 15 },
  { value: 'minibus_20', label: 'Minibus 20', emoji: '🚌', seats: 20 },
  { value: 'coach_30', label: 'Coach 30', emoji: '🚎', seats: 30 },
  { value: 'coach_40plus', label: 'Coach 40+', emoji: '🚎', seats: 40 },
  { value: 'suv', label: 'SUV', emoji: '🚙', seats: 7 },
  { value: 'pickup', label: 'Pickup Truck', emoji: '🛻', seats: 5 },
]

const BOOKING_TYPES = [
  { value: 'airport_transfer', label: 'Airport Transfer', icon: '✈️' },
  { value: 'sightseeing', label: 'Sightseeing Tour', icon: '🏛️' },
  { value: 'hotel_transfer', label: 'Hotel Transfer', icon: '🏨' },
  { value: 'day_tour', label: 'Day Tour', icon: '🌅' },
  { value: 'custom', label: 'Custom', icon: '✏️' },
]

export default function NewBookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [operators, setOperators] = useState<Operator[]>([])

  // Form state
  const [clientName, setClientName] = useState('')
  const [bookingType, setBookingType] = useState('airport_transfer')
  const [totalDays, setTotalDays] = useState(1)
  const [flightNumber, setFlightNumber] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [vehicleType, setVehicleType] = useState('van_9')
  const [preferredOperator, setPreferredOperator] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')
  const [notes, setNotes] = useState('')
  const [tripDays, setTripDays] = useState<TripDay[]>([{
    day_number: 1, trip_date: '', pickup_time: '08:00',
    pickup_location: '', dropoff_location: ''
  }])

  useEffect(() => {
    async function loadOperators() {
      const supabase = createClient()
      const { data } = await supabase.from('operators').select('id, company_name').eq('status', 'active')
      setOperators(data ?? [])
    }
    loadOperators()
  }, [])

  useEffect(() => {
    // Update trip days array when totalDays changes
    setTripDays(prev => {
      const newDays = [...prev]
      while (newDays.length < totalDays) {
        newDays.push({
          day_number: newDays.length + 1,
          trip_date: '',
          pickup_time: '08:00',
          pickup_location: newDays[newDays.length - 1]?.dropoff_location ?? '',
          dropoff_location: ''
        })
      }
      return newDays.slice(0, totalDays)
    })
  }, [totalDays])

  function updateTripDay(index: number, field: keyof TripDay, value: string) {
    setTripDays(prev => prev.map((day, i) => i === index ? { ...day, [field]: value } : day))
  }

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    try {
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          dmc_id: user.id,
          client_name: clientName,
          booking_type: bookingType,
          total_days: totalDays,
          flight_number: flightNumber || null,
          adults_count: adults,
          children_count: children,
          preferred_operator_id: preferredOperator || null,
          special_requirements: specialRequirements || null,
          notes: notes || null,
          status: 'pending'
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Create trips for each day
      const tripsData = tripDays.map(day => ({
        id: `${booking.booking_ref}-${day.day_number}`,
        booking_id: booking.id,
        day_number: day.day_number,
        trip_date: day.trip_date,
        pickup_time: day.pickup_time,
        pickup_location: day.pickup_location,
        dropoff_location: day.dropoff_location,
        vehicle_type: vehicleType,
        pax_count: adults + children,
        operator_id: preferredOperator || null,
        status: 'pending'
      }))

      const { error: tripsError } = await supabase.from('trips').insert(tripsData)
      if (tripsError) throw tripsError

      // Fire booking-created edge function
      await supabase.functions.invoke('booking-created', {
        body: { bookingId: booking.id }
      })

      toast.success('Booking created! Operator will be notified via LINE.')
      router.push(`/bookings/${booking.id}`)

    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create booking')
      setLoading(false)
    }
  }

  const pax = adults + children

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-riden-muted hover:text-riden-text transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <div className="w-px h-5 bg-riden-border" />
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-riden-teal rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </span>
          <span className="font-display text-riden-white font-600">New Booking</span>
        </div>

        {/* Step indicator */}
        <div className="ml-auto flex items-center gap-2">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-600 transition-all ${
                s === step ? 'bg-riden-teal text-white' :
                s < step ? 'bg-riden-teal/30 text-riden-teal' :
                'bg-riden-border text-riden-muted'
              }`}>{s}</div>
              {s < 3 && <div className={`w-8 h-px ${s < step ? 'bg-riden-teal' : 'bg-riden-border'}`} />}
            </div>
          ))}
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-8">

        {/* Step 1 - Client & Trip Info */}
        {step === 1 && (
          <div className="stagger">
            <h2 className="font-display text-2xl font-700 text-riden-white mb-1">Client & Trip Details</h2>
            <p className="text-riden-text text-sm mb-8">Basic information about the booking</p>

            <div className="glass rounded-2xl p-6 space-y-6">

              {/* Client Name */}
              <div>
                <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Client / Tourist Name *</label>
                <input className="riden-input" placeholder="e.g. Tanaka Family" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>

              {/* Booking Type */}
              <div>
                <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-3">Booking Type *</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {BOOKING_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setBookingType(type.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        bookingType === type.value
                          ? 'border-riden-teal bg-riden-teal/10 text-riden-teal'
                          : 'border-riden-border text-riden-muted hover:border-riden-teal/40 hover:text-riden-text'
                      }`}
                    >
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className="text-xs font-medium leading-tight">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Days & Flight */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Number of Days *</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setTotalDays(Math.max(1, totalDays-1))} className="btn-ghost w-10 h-10 flex items-center justify-center text-lg">-</button>
                    <span className="font-display text-2xl font-700 text-riden-white w-8 text-center">{totalDays}</span>
                    <button type="button" onClick={() => setTotalDays(Math.min(30, totalDays+1))} className="btn-ghost w-10 h-10 flex items-center justify-center text-lg">+</button>
                  </div>
                </div>
                {bookingType === 'airport_transfer' && (
                  <div>
                    <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Flight Number</label>
                    <input className="riden-input" placeholder="e.g. TG204" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} />
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-3">Passengers</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Adults', val: adults, set: setAdults },
                    { label: 'Children', val: children, set: setChildren },
                  ].map(({ label, val, set }) => (
                    <div key={label} className="glass rounded-xl p-4 flex items-center justify-between">
                      <span className="text-riden-text text-sm">{label}</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => set(Math.max(0, val-1))} className="w-7 h-7 rounded-lg border border-riden-border text-riden-text hover:border-riden-teal hover:text-riden-teal transition-all text-sm">-</button>
                        <span className="font-display font-700 text-riden-white w-5 text-center">{val}</span>
                        <button type="button" onClick={() => set(val+1)} className="w-7 h-7 rounded-lg border border-riden-border text-riden-text hover:border-riden-teal hover:text-riden-teal transition-all text-sm">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-riden-muted text-xs mt-2 font-mono">Total: {pax} passenger{pax !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <button
              onClick={() => { if(!clientName) { toast.error('Client name required'); return; } setStep(2) }}
              className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2 text-base"
            >
              Continue to Route Details
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {/* Step 2 - Route & Vehicle */}
        {step === 2 && (
          <div className="stagger">
            <h2 className="font-display text-2xl font-700 text-riden-white mb-1">Route & Vehicle</h2>
            <p className="text-riden-text text-sm mb-8">Set pickup/dropoff for each day</p>

            {/* Vehicle type */}
            <div className="glass rounded-2xl p-6 mb-4">
              <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-3">Vehicle Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_TYPES.map(v => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setVehicleType(v.value)}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      vehicleType === v.value
                        ? 'border-riden-teal bg-riden-teal/10'
                        : 'border-riden-border hover:border-riden-teal/40'
                    }`}
                  >
                    <div className="text-lg mb-1">{v.emoji}</div>
                    <div className={`text-xs font-medium ${vehicleType === v.value ? 'text-riden-teal' : 'text-riden-text'}`}>{v.label}</div>
                    <div className="text-riden-muted text-xs">{v.seats} seats</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trip days */}
            {tripDays.map((day, i) => (
              <div key={i} className="glass rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 bg-riden-teal rounded-lg flex items-center justify-center text-white text-xs font-mono font-700">{day.day_number}</div>
                  <span className="font-display font-600 text-riden-white">Day {day.day_number}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Date *</label>
                    <input type="date" className="riden-input" value={day.trip_date} onChange={e => updateTripDay(i, 'trip_date', e.target.value)} style={{colorScheme: 'dark'}} />
                  </div>
                  <div>
                    <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Pickup Time *</label>
                    <input type="time" className="riden-input" value={day.pickup_time} onChange={e => updateTripDay(i, 'pickup_time', e.target.value)} style={{colorScheme: 'dark'}} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">📍 Pickup Location *</label>
                    <input className="riden-input" placeholder="e.g. Suvarnabhumi Airport" value={day.pickup_location} onChange={e => updateTripDay(i, 'pickup_location', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">🏁 Dropoff Location *</label>
                    <input className="riden-input" placeholder="e.g. Centara Grand Hotel Bangkok" value={day.dropoff_location} onChange={e => updateTripDay(i, 'dropoff_location', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-ghost px-6 py-4">← Back</button>
              <button
                onClick={() => {
                  const incomplete = tripDays.find(d => !d.trip_date || !d.pickup_location || !d.dropoff_location)
                  if (incomplete) { toast.error(`Complete Day ${incomplete.day_number} details`); return; }
                  setStep(3)
                }}
                className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"
              >
                Continue to Operator
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Operator & Notes */}
        {step === 3 && (
          <div className="stagger">
            <h2 className="font-display text-2xl font-700 text-riden-white mb-1">Operator & Notes</h2>
            <p className="text-riden-text text-sm mb-8">Optional — select preferred operator and add notes</p>

            <div className="glass rounded-2xl p-6 space-y-5 mb-4">

              <div>
                <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Preferred Operator (Optional)</label>
                <select className="riden-input" value={preferredOperator} onChange={e => setPreferredOperator(e.target.value)} style={{colorScheme: 'dark'}}>
                  <option value="">Send to best available operator</option>
                  {operators.map(op => (
                    <option key={op.id} value={op.id}>{op.company_name}</option>
                  ))}
                </select>
                <p className="text-riden-muted text-xs mt-1.5">If not selected, system will find the best operator automatically</p>
              </div>

              <div>
                <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Special Requirements</label>
                <input className="riden-input" placeholder="Child seat, wheelchair access, English-speaking driver..." value={specialRequirements} onChange={e => setSpecialRequirements(e.target.value)} />
              </div>

              <div>
                <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Notes for Operator</label>
                <textarea
                  className="riden-input resize-none"
                  rows={3}
                  placeholder="Any additional instructions..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="glass rounded-2xl p-6 mb-6 border-riden-teal/20">
              <h3 className="font-display font-600 text-riden-white text-sm mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-riden-text">Client</span><span className="text-riden-white font-medium">{clientName}</span></div>
                <div className="flex justify-between"><span className="text-riden-text">Type</span><span className="text-riden-white">{BOOKING_TYPES.find(t => t.value === bookingType)?.label}</span></div>
                <div className="flex justify-between"><span className="text-riden-text">Days</span><span className="text-riden-white">{totalDays} day{totalDays > 1 ? 's' : ''}</span></div>
                <div className="flex justify-between"><span className="text-riden-text">Vehicle</span><span className="text-riden-white">{VEHICLE_TYPES.find(v => v.value === vehicleType)?.label}</span></div>
                <div className="flex justify-between"><span className="text-riden-text">Passengers</span><span className="text-riden-white">{adults + children} pax</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-ghost px-6 py-4">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1 py-4 flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>🚀 Create Booking & Notify Operator</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
