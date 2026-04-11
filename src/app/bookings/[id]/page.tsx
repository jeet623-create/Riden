'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<string,string> = { pending:'Pending', operator_notified:'Operator Notified', operator_accepted:'Operator Accepted', pool_sent:'Sent to Pool', driver_assigned:'Driver Assigned', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled', emergency:'Emergency' }
const STATUS_BADGE: Record<string,string> = { pending:'badge-pending', operator_notified:'badge-pending', operator_accepted:'badge-confirmed', pool_sent:'badge-pending', driver_assigned:'badge-confirmed', in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled', emergency:'badge-cancelled' }
const VEHICLE_LABELS: Record<string,string> = { sedan:'Sedan', van_9:'Van 9', van_12:'Van 12', minibus_15:'Minibus 15', minibus_20:'Minibus 20', coach_30:'Coach 30', coach_40plus:'Coach 40+', suv:'SUV', pickup:'Pickup' }
const TYPE_ICONS: Record<string,string> = { airport_transfer:'✈️', sightseeing:'🏗️', hotel_transfer:'🏨', day_tour:'🌅', custom:'✏️' }

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const [bkRes, trRes] = await Promise.all([
        supabase.from('bookings').select('*, operators(company_name, phone)').eq('id', bookingId).eq('dmc_id', user.id).single(),
        supabase.from('trips').select('*, drivers(full_name, phone, vehicle_plate, vehicle_brand_model), operators(company_name)').eq('booking_id', bookingId).order('day_number')
      ])
      if (bkRes.error || !bkRes.data) { router.push('/bookings'); return }
      setBooking(bkRes.data); setTrips(trRes.data ?? []); setLoading(false)
    }
    load()
  }, [bookingId, router])

  async function handleCancel() {
    if (!confirm('Cancel this booking?')) return
    setCancelling(true)
    const sb = createClient()
    await sb.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
    await sb.from('trips').update({ status: 'cancelled' }).eq('booking_id', bookingId)
    toast.success('Booking cancelled'); router.push('/bookings')
  }

  async function renotifyOperator() {
    const { error } = await createClient().functions.invoke('booking-created', { body: { bookingId } })
    if (error) { toast.error('Failed to notify'); return }
    toast.success('Operator notified via LINE!')
  }

  if (loading) return <div className="min-h-screen bg-riden-black flex items-center justify-center"><div className="w-10 h-10 border-2 border-riden-teal/30 border-t-riden-teal rounded-full animate-spin" /></div>
  if (!booking) return null

  const allCompleted = trips.length > 0 && trips.every(t => t.status === 'completed')
  const anyActive = trips.some(t => t.status === 'in_progress')

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/bookings" className="text-riden-muted hover:text-riden-text"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></Link>
          <div className="w-px h-5 bg-riden-border" />
          <span className="font-display text-riden-white font-600">Booking Detail</span>
        </div>
        <div className="flex items-center gap-3">
          {anyActive && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-400/10"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span className="text-green-400 text-xs">Live Trip</span></div>}
          <span className="font-mono text-xs text-riden-teal">{booking.booking_ref}</span>
        </div>
      </nav>
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1"><span className="text-2xl">{TYPE_ICONS[booking.booking_type] ?? '🚗'}</span><h1 className="font-display text-2xl font-700 text-riden-white">{booking.client_name}</h1></div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[booking.status] ?? 'badge-pending'}`}>{STATUS_LABELS[booking.status] ?? booking.status}</span>
            </div>
            <div className="text-right"><div className="text-riden-muted text-xs mb-1">Created</div><div className="text-riden-text text-sm">{new Date(booking.created_at).toLocaleDateString('en',{day:'numeric',month:'short',year:'numeric'})}</div></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{label:'Days',value:booking.total_days},{label:'Passengers',value:`${booking.adults_count+(booking.children_count||0)} pax`},{label:'Type',value:booking.booking_type?.replace(/_/g,' ')},{label:'Flight',value:booking.flight_number||'—'}].map(s=>(
              <div key={s.label} className="glass rounded-xl p-3"><div className="text-riden-muted text-xs mb-1">{s.label}</div><div className="text-riden-white font-medium capitalize">{s.value}</div></div>
            ))}
          </div>
          {booking.special_requirements && <div className="mt-4 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20"><span className="text-yellow-400 text-xs font-mono">SPECIAL: </span><span className="text-riden-text text-sm">{booking.special_requirements}</span></div>}
          {booking.notes && <div className="mt-2 p-3 rounded-xl bg-riden-card/50"><span className="text-riden-muted text-xs font-mono">NOTES: </span><span className="text-riden-text text-sm">{booking.notes}</span></div>}
        </div>
        <div>
          <h2 className="font-display font-600 text-riden-white mb-3">Trip Days ({trips.length})</h2>
          <div className="space-y-3">
            {trips.map((trip:any)=>(
              <div key={trip.id} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 bg-riden-teal rounded-lg flex items-center justify-center text-white text-sm font-mono font-700">{trip.day_number}</div><div><div className="text-riden-white font-medium">Day {trip.day_number}</div><div className="text-riden-text text-xs">{new Date(trip.trip_date).toLocaleDateString('en',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div></div></div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[trip.status]??'badge-pending'}`}>{STATUS_LABELS[trip.status]??trip.status}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {[['⏰ Time',trip.pickup_time?.slice(0,5)??'—'],['📍 From',trip.pickup_location],['🏁 To',trip.dropoff_location],['🚐 Car',VEHICLE_LABELS[trip.vehicle_type]??trip.vehicle_type]].map(([l,v])=>(
                      <div key={l} className="flex items-start gap-2"><span className="text-riden-muted text-xs w-14 pt-0.5">{l}</span><span className="text-riden-white text-sm">{v}</span></div>
                    ))}
                  </div>
                  <div className="glass rounded-xl p-3">
                    {trip.drivers ? (<><div className="text-riden-teal text-xs font-mono mb-2">DRIVER ASSIGNED</div><div className="text-riden-white font-medium">{trip.drivers.full_name}</div>{trip.drivers.phone&&<div className="text-riden-text text-xs mt-1">📞 {trip.drivers.phone}</div>}{trip.drivers.vehicle_plate&&<div className="text-riden-muted text-xs mt-0.5">🚗 {trip.drivers.vehicle_brand_model} · {trip.drivers.vehicle_plate}</div>}</>) : trip.operators ? (<><div className="text-yellow-400 text-xs font-mono mb-2">OPERATOR ASSIGNED</div><div className="text-riden-white font-medium">{trip.operators.company_name}</div><div className="text-riden-muted text-xs mt-1">Awaiting driver assignment</div></>) : (<><div className="text-riden-muted text-xs font-mono mb-2">NO ASSIGNMENT YET</div><div className="text-riden-text text-xs">Waiting for operator to respond</div></>)}
                    {trip.status==='in_progress'&&trip.tracking_token&&(<a href={`https://zfnwxetjxfvsijpaefqb.supabase.co/functions/v1/driver-location-tracker?token=${trip.tracking_token}`} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 text-riden-teal text-xs hover:underline"><div className="w-2 h-2 bg-riden-teal rounded-full animate-pulse" />Track live →</a>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-600 text-riden-white text-sm mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {booking.status==='pending'&&<button onClick={renotifyOperator} className="btn-primary px-5 py-2.5 text-sm">📱 Re-notify Operator via LINE</button>}
            {!allCompleted&&booking.status!=='cancelled'&&<button onClick={handleCancel} disabled={cancelling} className="px-5 py-2.5 rounded-xl border border-red-400/30 text-red-400 hover:bg-red-400/10 text-sm">{cancelling?'Cancelling...':'✕ Cancel Booking'}</button>}
            <Link href="/bookings"><button className="btn-ghost px-5 py-2.5 text-sm">← Back to Bookings</button></Link>
          </div>
        </div>
      </main>
    </div>
  )
}
