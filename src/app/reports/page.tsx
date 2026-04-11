'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const BOOKING_TYPES: Record<string,string> = { airport_transfer:'✈️ Airport Transfer', sightseeing:'🏗️ Sightseeing', hotel_transfer:'🏨 Hotel Transfer', day_tour:'🌅 Day Tour', custom:'✏️ Custom' }

export default function ReportsPage() {
  const router = useRouter()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const start = `${year}-${String(month+1).padStart(2,'0')}-01`
      const end = new Date(year, month+1, 0).toISOString().split('T')[0]
      const { data } = await supabase.from('bookings').select('*, trips(id,status), payments(status)').eq('dmc_id', user.id).gte('created_at', start).lte('created_at', end+'T23:59:59').order('created_at', { ascending: false })
      setBookings(data ?? []); setLoading(false)
    }
    load()
  }, [month, year, router])

  const totalBookings = bookings.length
  const completed = bookings.filter(b => b.status === 'completed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length
  const pending = bookings.filter(b => b.status === 'pending').length
  const totalTrips = bookings.reduce((sum, b) => sum + (b.trips?.length ?? 0), 0)
  const totalPax = bookings.reduce((sum, b) => sum + (b.adults_count||0) + (b.children_count||0), 0)
  const byType = bookings.reduce((acc: Record<string,number>, b) => { acc[b.booking_type] = (acc[b.booking_type] || 0) + 1; return acc }, {})

  function exportCSV() {
    const headers = ['Ref','Client','Type','Days','Pax','Status','Created']
    const rows = bookings.map(b => [b.booking_ref, b.client_name, b.booking_type, b.total_days, (b.adults_count||0)+(b.children_count||0), b.status, new Date(b.created_at).toLocaleDateString('en')])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `RIDEN_${MONTHS[month]}_${year}.csv`; a.click()
  }

  const STATUS_BADGE: Record<string,string> = { completed:'badge-completed', cancelled:'badge-cancelled', in_progress:'badge-progress', pending:'badge-pending', confirmed:'badge-confirmed' }
  const years = [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1]

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-riden-muted hover:text-riden-text"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></Link>
          <div className="w-px h-5 bg-riden-border" />
          <span className="font-display text-riden-white font-600">📊 Reports</span>
        </div>
        <button onClick={exportCSV} className="btn-ghost px-4 py-2 text-sm">⬇️ Export CSV</button>
      </nav>
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <select className="riden-input text-sm w-auto" value={month} onChange={e=>setMonth(Number(e.target.value))} style={{colorScheme:'dark'}}>
            {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
          <select className="riden-input text-sm w-auto" value={year} onChange={e=>setYear(Number(e.target.value))} style={{colorScheme:'dark'}}>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <h2 className="font-display text-xl font-700 text-riden-white ml-2">{MONTHS[month]} {year}</h2>
        </div>
        {loading ? <div className="flex items-center gap-3 text-riden-text"><div className="w-5 h-5 border-2 border-riden-teal/30 border-t-riden-teal rounded-full animate-spin" />Loading...</div> : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[{label:'Total Bookings',value:totalBookings,icon:'📋',color:'text-riden-teal'},{label:'Completed',value:completed,icon:'✅',color:'text-green-400'},{label:'Total Trips',value:totalTrips,icon:'🚗',color:'text-blue-400'},{label:'Total Pax',value:totalPax,icon:'👥',color:'text-purple-400'}].map(s=>(
                <div key={s.label} className="glass rounded-xl p-5"><div className="text-2xl mb-2">{s.icon}</div><div className={`font-display text-3xl font-700 ${s.color}`}>{s.value}</div><div className="text-riden-text text-xs mt-1">{s.label}</div></div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="glass rounded-xl p-5">
                <h3 className="font-display font-600 text-riden-white text-sm mb-4">Booking Status</h3>
                <div className="space-y-3">
                  {[{label:'Completed',count:completed,color:'bg-green-400'},{label:'In Progress',count:bookings.filter(b=>b.status==='in_progress').length,color:'bg-blue-400'},{label:'Pending',count:pending,color:'bg-yellow-400'},{label:'Cancelled',count:cancelled,color:'bg-red-400'}].map(s=>(
                    <div key={s.label}>
                      <div className="flex justify-between mb-1"><span className="text-riden-text text-xs">{s.label}</span><span className="text-riden-white text-xs font-mono">{s.count}</span></div>
                      <div className="h-1.5 bg-riden-border rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full`} style={{width: totalBookings>0?`${(s.count/totalBookings)*100}%`:'0%'}} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-xl p-5">
                <h3 className="font-display font-600 text-riden-white text-sm mb-4">By Booking Type</h3>
                {Object.keys(byType).length===0 ? <p className="text-riden-muted text-sm">No bookings this month</p> : (
                  <div className="space-y-2">
                    {Object.entries(byType).sort(([,a],[,b])=>(b as number)-(a as number)).map(([type,count])=>(
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-riden-text text-sm">{BOOKING_TYPES[type]??type}</span>
                        <div className="flex items-center gap-2"><div className="h-1.5 bg-riden-teal rounded-full" style={{width:`${((count as number)/totalBookings)*80}px`}} /><span className="text-riden-white text-sm font-mono">{count as number}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-riden-border flex items-center justify-between">
                <h3 className="font-display font-600 text-riden-white text-sm">All Bookings — {MONTHS[month]} {year}</h3>
                <span className="text-riden-muted text-xs font-mono">{totalBookings} bookings</span>
              </div>
              {bookings.length===0 ? (
                <div className="p-12 text-center"><div className="text-4xl mb-3">📊</div><p className="text-riden-white font-medium">No bookings this month</p></div>
              ) : (
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b border-riden-border"><tr className="text-riden-muted text-xs font-mono uppercase">{['Ref','Client','Type','Days','Pax','Status','Date'].map(h=><th key={h} className="text-left px-5 py-3">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-riden-border">{bookings.map(b=>(
                    <Link key={b.id} href={`/bookings/${b.id}`}>
                      <tr className="hover:bg-riden-card/50 cursor-pointer">
                        <td className="px-5 py-3 font-mono text-riden-teal text-xs">{b.booking_ref}</td>
                        <td className="px-5 py-3 text-riden-white">{b.client_name}</td>
                        <td className="px-5 py-3 text-riden-text text-xs capitalize">{b.booking_type?.replace(/_/g,' ')}</td>
                        <td className="px-5 py-3 text-riden-text">{b.total_days}</td>
                        <td className="px-5 py-3 text-riden-text">{(b.adults_count||0)+(b.children_count||0)}</td>
                        <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[b.status]||'badge-pending'}`}>{b.status}</span></td>
                        <td className="px-5 py-3 text-riden-muted text-xs">{new Date(b.created_at).toLocaleDateString('en',{day:'numeric',month:'short'})}</td>
                      </tr>
                    </Link>
                  ))}</tbody></table></div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
