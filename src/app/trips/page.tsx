'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Trip = { id: string; trip_date: string; pickup_time: string; pickup_location: string; dropoff_location: string; status: string; vehicle_type: string; pax_count: number; bookings: { booking_ref: string; client_name: string } }
const STATUS_LABELS: Record<string,string> = { pending:'Pending', operator_notified:'Notified', operator_accepted:'Accepted', pool_sent:'Pool Sent', driver_assigned:'Driver Set', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled', emergency:'Emergency' }
const STATUS_BADGE: Record<string,string> = { pending:'badge-pending', operator_notified:'badge-pending', operator_accepted:'badge-confirmed', pool_sent:'badge-pending', driver_assigned:'badge-confirmed', in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled', emergency:'badge-cancelled' }
const VEHICLE_LABELS: Record<string,string> = { sedan:'Sedan', van_9:'Van 9', van_12:'Van 12', minibus_15:'Minibus 15', minibus_20:'Minibus 20', coach_30:'Coach 30', coach_40plus:'Coach 40+', suv:'SUV', pickup:'Pickup' }

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const today = new Date().toISOString().split('T')[0]
      let query = supabase.from('trips').select('id,trip_date,pickup_time,pickup_location,dropoff_location,status,vehicle_type,pax_count,bookings!inner(booking_ref,client_name)').eq('bookings.dmc_id', user.id).order('trip_date', { ascending: filter === 'upcoming' })
      if (filter === 'upcoming') query = query.gte('trip_date', today)
      if (filter === 'past') query = query.lt('trip_date', today)
      if (filter === 'active') query = query.in('status', ['driver_assigned','in_progress'])
      const { data } = await query.limit(50)
      setTrips((data ?? []) as unknown as Trip[])
      setLoading(false)
    }
    load()
  }, [filter, router])

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-riden-muted hover:text-riden-text"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></Link>
        <div className="w-px h-5 bg-riden-border" />
        <span className="font-display text-riden-white font-600">🚗 Trips</span>
      </nav>
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          {[['upcoming','Upcoming'],['active','Active Now'],['past','Past'],['all','All']].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === val ? 'bg-riden-teal text-white' : 'glass text-riden-text hover:text-riden-white'}`}>{label}</button>
          ))}
        </div>
        <div className="glass rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-riden-teal/30 border-t-riden-teal rounded-full animate-spin mx-auto mb-3" /><p className="text-riden-text text-sm">Loading trips...</p></div>
          ) : trips.length === 0 ? (
            <div className="p-12 text-center"><div className="text-5xl mb-4">🚗</div><p className="text-riden-white font-medium mb-2">No trips found</p><p className="text-riden-text text-sm">Create a booking to see trips here</p></div>
          ) : (
            <div className="divide-y divide-riden-border">
              {trips.map(t => (
                <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-riden-card/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <div className="text-riden-teal font-display font-700 text-lg leading-none">{new Date(t.trip_date).getDate()}</div>
                      <div className="text-riden-muted text-xs">{new Date(t.trip_date).toLocaleDateString('en',{month:'short'})}</div>
                    </div>
                    <div className="w-px h-10 bg-riden-border" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-riden-white font-medium text-sm">{t.bookings?.client_name ?? '-'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[t.status] ?? 'badge-pending'}`}>{STATUS_LABELS[t.status] ?? t.status}</span>
                      </div>
                      <p className="text-riden-text text-xs">{t.pickup_time?.slice(0,5)} · {t.pickup_location} → {t.dropoff_location}</p>
                      <p className="text-riden-muted text-xs mt-0.5">{VEHICLE_LABELS[t.vehicle_type] ?? t.vehicle_type} · {t.pax_count} pax</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-riden-muted">{t.bookings?.booking_ref ?? '-'}</span>
                    {t.status === 'in_progress' && <div className="mt-1 flex items-center gap-1 justify-end"><div className="w-2 h-2 bg-riden-teal rounded-full animate-pulse" /><span className="text-riden-teal text-xs">Live</span></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
