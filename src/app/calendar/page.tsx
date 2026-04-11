'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const STATUS_DOT: Record<string,string> = { pending:'bg-yellow-400', operator_notified:'bg-yellow-400', operator_accepted:'bg-blue-400', driver_assigned:'bg-blue-400', in_progress:'bg-green-400', completed:'bg-riden-teal', cancelled:'bg-red-400' }
const VEHICLE_SHORT: Record<string,string> = { sedan:'Sedan', van_9:'Van 9', van_12:'Van 12', minibus_15:'Bus 15', minibus_20:'Bus 20', coach_30:'Coach', coach_40plus:'Coach+', suv:'SUV', pickup:'Pickup' }

export default function CalendarPage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string|null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const start = `${year}-${String(month+1).padStart(2,'0')}-01`
      const end = new Date(year, month+1, 0).toISOString().split('T')[0]
      const { data } = await supabase.from('trips').select('id,trip_date,pickup_time,pickup_location,dropoff_location,status,vehicle_type,pax_count,bookings!inner(client_name,booking_ref,dmc_id)').eq('bookings.dmc_id', user.id).gte('trip_date', start).lte('trip_date', end).order('trip_date')
      setTrips((data ?? []) as any[]); setLoading(false)
    }
    load()
  }, [year, month, router])

  function prevMonth() { if(month===0){setYear(y=>y-1);setMonth(11)}else setMonth(m=>m-1); setSelectedDay(null) }
  function nextMonth() { if(month===11){setYear(y=>y+1);setMonth(0)}else setMonth(m=>m+1); setSelectedDay(null) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const tripsByDate: Record<string, any[]> = {}
  trips.forEach(t => { if(!tripsByDate[t.trip_date]) tripsByDate[t.trip_date]=[]; tripsByDate[t.trip_date].push(t) })

  function dateKey(day: number) { return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` }
  const today = now.toISOString().split('T')[0]
  const selectedTrips = selectedDay ? (tripsByDate[selectedDay] ?? []) : []

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-riden-muted hover:text-riden-text"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></Link>
          <div className="w-px h-5 bg-riden-border" />
          <span className="font-display text-riden-white font-600">📅 Calendar</span>
        </div>
        <Link href="/bookings/new"><button className="btn-primary px-4 py-2 text-sm">+ New Booking</button></Link>
      </nav>
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="btn-ghost w-10 h-10 flex items-center justify-center rounded-xl"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
              <h2 className="font-display text-xl font-700 text-riden-white">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="btn-ghost w-10 h-10 flex items-center justify-center rounded-xl"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d=><div key={d} className="text-center text-riden-muted text-xs font-mono py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day,i)=>{
                if(!day) return <div key={`e${i}`} className="h-20" />
                const key = dateKey(day)
                const dayTrips = tripsByDate[key] ?? []
                const isToday = key===today
                const isSelected = key===selectedDay
                return (
                  <button key={key} onClick={()=>setSelectedDay(isSelected?null:key)}
                    className={`h-20 rounded-xl p-2 text-left transition-all ${isSelected?'bg-riden-teal/20 border border-riden-teal':isToday?'bg-riden-teal/10 border border-riden-teal/30':'glass hover:bg-riden-card/50 border border-transparent'}`}>
                    <span className={`text-sm font-mono font-600 ${isToday?'text-riden-teal':'text-riden-white'}`}>{day}</span>
                    {dayTrips.length>0&&(
                      <div className="mt-1 space-y-0.5">
                        {dayTrips.slice(0,2).map((t:any)=>(
                          <div key={t.id} className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[t.status]??'bg-riden-muted'}`} />
                            <span className="text-riden-text text-xs truncate">{t.pickup_time?.slice(0,5)}</span>
                          </div>
                        ))}
                        {dayTrips.length>2&&<span className="text-riden-teal text-xs">+{dayTrips.length-2}</span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {[{label:'Pending',color:'bg-yellow-400'},{label:'Assigned',color:'bg-blue-400'},{label:'Active',color:'bg-green-400'},{label:'Completed',color:'bg-riden-teal'},{label:'Cancelled',color:'bg-red-400'}].map(l=>(
                <div key={l.label} className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${l.color}`} /><span className="text-riden-muted text-xs">{l.label}</span></div>
              ))}
            </div>
          </div>
          <div>
            {selectedDay ? (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-riden-border">
                  <h3 className="font-display font-600 text-riden-white">{new Date(selectedDay+'T00:00:00').toLocaleDateString('en',{weekday:'long',day:'numeric',month:'long'})}</h3>
                  <p className="text-riden-text text-xs mt-0.5">{selectedTrips.length} trip{selectedTrips.length!==1?'s':''}</p>
                </div>
                {selectedTrips.length===0 ? (
                  <div className="p-8 text-center"><div className="text-3xl mb-2">📅</div><p className="text-riden-text text-sm">No trips this day</p><Link href="/bookings/new"><button className="btn-primary px-4 py-2 text-sm mt-3">+ New Booking</button></Link></div>
                ) : (
                  <div className="divide-y divide-riden-border">
                    {selectedTrips.map((t:any)=>(
                      <div key={t.id} className="px-5 py-4 hover:bg-riden-card/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${STATUS_DOT[t.status]??'bg-riden-muted'}`} />
                          <span className="text-riden-teal text-xs font-mono">{t.pickup_time?.slice(0,5)}</span>
                          <span className="text-riden-white text-sm font-medium">{(t.bookings as any)?.client_name}</span>
                        </div>
                        <div className="text-riden-text text-xs ml-4">{t.pickup_location}</div>
                        <div className="text-riden-text text-xs ml-4 mt-0.5">→ {t.dropoff_location}</div>
                        <div className="text-riden-muted text-xs ml-4 mt-1">{VEHICLE_SHORT[t.vehicle_type]??t.vehicle_type} · {t.pax_count} pax</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-riden-white font-medium">Select a day</p>
                <p className="text-riden-text text-sm mt-1">Click any date to see trips</p>
                <div className="mt-6 text-left space-y-2">
                  <p className="text-riden-muted text-xs font-mono uppercase tracking-wider">This month</p>
                  <div className="flex justify-between"><span className="text-riden-text text-sm">Total trips</span><span className="text-riden-white font-mono">{trips.length}</span></div>
                  <div className="flex justify-between"><span className="text-riden-text text-sm">Completed</span><span className="text-green-400 font-mono">{trips.filter(t=>t.status==='completed').length}</span></div>
                  <div className="flex justify-between"><span className="text-riden-text text-sm">Upcoming</span><span className="text-blue-400 font-mono">{trips.filter(t=>['pending','operator_accepted','driver_assigned'].includes(t.status)).length}</span></div>
                  {loading&&<div className="text-center"><div className="w-4 h-4 border border-riden-teal/30 border-t-riden-teal rounded-full animate-spin mx-auto mt-2"/></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
