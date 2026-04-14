'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Booking = { id: string; booking_ref: string; client_name: string; booking_type: string; total_days: number; status: string; created_at: string; adults_count: number }
const STATUS_FILTER = ['all','pending','confirmed','in_progress','completed','cancelled']
const STATUS_LABELS: Record<string,string> = { pending:'Pending', confirmed:'Confirmed', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' }
const STATUS_BADGE: Record<string,string> = { pending:'badge-pending', confirmed:'badge-confirmed', in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled' }
const TYPE_ICONS: Record<string,string> = { airport_transfer:'✈️', sightseeing:'🏛️', hotel_transfer:'🏨', day_tour:'🌅', custom:'✏️' }

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      let query = supabase.from('bookings').select('id,booking_ref,client_name,booking_type,total_days,status,created_at,adults_count').eq('dmc_id', user.id).order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data } = await query
      setBookings(data ?? [])
      setLoading(false)
    }
    load()
  }, [filter, router])

  const filtered = bookings.filter(b => b.client_name.toLowerCase().includes(search.toLowerCase()) || b.booking_ref.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-riden-muted hover:text-riden-text">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </Link>
          <div className="w-px h-5 bg-riden-border" />
          <span className="font-display text-riden-white font-600">📋 All Bookings</span>
        </div>
        <Link href="/bookings/new">
          <button className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>New Booking
          </button>
        </Link>
      </nav>
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-riden-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="riden-input pl-10" placeholder="Search by client name or booking ref..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTER.map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-riden-teal text-white' : 'glass text-riden-text hover:text-riden-white'}`}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-riden-teal/30 border-t-riden-teal rounded-full animate-spin mx-auto mb-3" />
              <p className="text-riden-text text-sm">Loading bookings...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-riden-white font-medium mb-2">No bookings found</p>
              <p className="text-riden-text text-sm mb-6">Create your first booking to get started</p>
              <Link href="/bookings/new"><button className="btn-primary px-6 py-3">Create First Booking</button></Link>
            </div>
          ) : (
            <>
              <div className="px-6 py-3 border-b border-riden-border">
                <p className="text-riden-muted text-xs font-mono">{filtered.length} booking{filtered.length !== 1 ? 's' : ''} found</p>
              </div>
              <div className="divide-y divide-riden-border">
                {filtered.map(b => (
                  <Link href={`/bookings/${b.id}`} key={b.id}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-riden-card/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-riden-teal/10 rounded-xl flex items-center justify-center text-lg">{TYPE_ICONS[b.booking_type] ?? '🚗'}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-riden-teal">{b.booking_ref}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[b.status] ?? 'badge-pending'}`}>{STATUS_LABELS[b.status] ?? b.status}</span>
                          </div>
                          <p className="text-riden-white font-medium">{b.client_name}</p>
                          <p className="text-riden-muted text-xs mt-0.5">{b.total_days} day{b.total_days > 1 ? 's' : ''} · {b.adults_count} pax</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-riden-text text-sm">{new Date(b.created_at).toLocaleDateString('en',{day:'numeric',month:'short',year:'numeric'})}</p>
                        <svg className="text-riden-muted group-hover:text-riden-teal transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
