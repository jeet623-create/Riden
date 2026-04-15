'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DmcShell } from '@/components/DmcShell'
import { Badge, Loading, PageHeader, Btn } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
const STATUS_COLOR: Record<string,string> = { pending:'var(--amber)',confirmed:'var(--teal)',in_progress:'var(--green)',completed:'var(--text-3)',cancelled:'var(--red)' }
export default function CalendarPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date())
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      load(user.id)
    })
  }, [month])
  async function load(uid: string) {
    setLoading(true)
    const start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString()
    const end = new Date(month.getFullYear(), month.getMonth()+1, 0, 23, 59).toISOString()
    const r = await fetch(SUPA + '/rest/v1/trips?select=*,bookings(booking_ref,client_name,dmc_id)&pickup_time=gte.' + start + '&pickup_time=lte.' + end, { headers: H() })
    const d = await r.json()
    const arr = Array.isArray(d) ? d.filter((t:any)=>(t.bookings as any)?.dmc_id===uid) : []
    setTrips(arr)
    setLoading(false)
  }
  const year = month.getFullYear(), mon = month.getMonth()
  const firstDay = new Date(year, mon, 1).getDay()
  const daysInMonth = new Date(year, mon+1, 0).getDate()
  const monthName = month.toLocaleDateString('en-GB',{month:'long',year:'numeric'})
  const cells = Array.from({length: Math.ceil((firstDay+daysInMonth)/7)*7}, (_,i) => {
    const day = i - firstDay + 1
    if (day < 1 || day > daysInMonth) return null
    return day
  })
  const tripsForDay = (day: number) => trips.filter(t => {
    if (!t.pickup_time) return false
    return new Date(t.pickup_time).getDate() === day
  })
  if (loading) return <DmcShell><Loading /></DmcShell>
  return (
    <DmcShell>
      <PageHeader title="Calendar" sub={monthName}
        actions={
          <div style={{display:'flex',gap:8}}>
            <Btn variant="secondary" size="sm" onClick={()=>setMonth(new Date(year,mon-1,1))}>←</Btn>
            <Btn variant="secondary" size="sm" onClick={()=>setMonth(new Date())}>Today</Btn>
            <Btn variant="secondary" size="sm" onClick={()=>setMonth(new Date(year,mon+1,1))}>→</Btn>
          </div>
        }
      />
      <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid var(--border)'}}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
            <div key={d} style={{padding:'10px',textAlign:'center',fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-3)',letterSpacing:1}}>{d}</div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {cells.map((day, i) => {
            const dayTrips = day ? tripsForDay(day) : []
            const isToday = day === new Date().getDate() && mon === new Date().getMonth() && year === new Date().getFullYear()
            return (
              <div key={i} style={{minHeight:100,padding:8,borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:day?'transparent':'rgba(0,0,0,0.2)',position:'relative' as const}}>
                {day && <div style={{fontSize:12,fontFamily:'var(--font-mono)',color:isToday?'var(--teal)':'var(--text-3)',marginBottom:6,fontWeight:isToday?700:400}}>{day}</div>}
                {dayTrips.slice(0,3).map(t=>(
                  <div key={t.id} style={{fontSize:10,padding:'2px 6px',borderRadius:4,marginBottom:3,background:STATUS_COLOR[t.status]+'20',color:STATUS_COLOR[t.status],overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const,cursor:'pointer'}}
                    title={(t.bookings as any)?.client_name + ' - ' + (t.pickup_location||'')}>
                    {new Date(t.pickup_time).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})} {(t.bookings as any)?.client_name||'Trip'}
                  </div>
                ))}
                {dayTrips.length > 3 && <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>+{dayTrips.length-3} more</div>}
              </div>
            )
          })}
        </div>
      </div>
    </DmcShell>
  )
}