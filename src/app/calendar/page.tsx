'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Trip = { id:string; trip_date:string; pickup_time:string; pickup_location:string; dropoff_location:string; vehicle_type:string; status:string; booking_id:string; bookings?: { client_name:string; booking_ref:string } }
const STATUS_COLOR: Record<string,string> = { pending:'var(--warning)', assigned:'var(--accent)', in_progress:'var(--accent)', completed:'var(--success)', cancelled:'var(--danger)' }
const STATUS_BG: Record<string,string> = { pending:'rgba(245,158,11,0.08)', assigned:'rgba(25,201,119,0.08)', in_progress:'rgba(25,201,119,0.08)', completed:'rgba(34,197,94,0.08)', cancelled:'rgba(239,68,68,0.06)' }

export default function CalendarPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selected, setSelected] = useState<Trip[]>([])
  const [selectedDay, setSelectedDay] = useState<string|null>(null)

  const load = useCallback(async () => {
    const sb = createClient()
    const { data:{ user } } = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().slice(0,10)
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).toISOString().slice(0,10)
    const { data } = await sb.from('trips').select('*,bookings(client_name,booking_ref)').eq('dmc_id', user.id).gte('trip_date', start).lte('trip_date', end).order('trip_date')
    setTrips(data??[]); setLoading(false)
  }, [currentDate, router])

  useEffect(() => { load() }, [load])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const monthName = currentDate.toLocaleDateString('en-US', { month:'long', year:'numeric' })

  function tripsByDay(day:number) {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return trips.filter(t => t.trip_date === d)
  }
  function selectDay(day:number) {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    setSelectedDay(d); setSelected(trips.filter(t=>t.trip_date===d))
  }

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const today = new Date().toISOString().slice(0,10)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
      <nav style={{background:'var(--bg-page)',borderBottom:'0.5px solid var(--border)',height:52,display:'flex',alignItems:'center',position:'sticky' as const,top:0,zIndex:50}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <a href="/dashboard" style={{color:'var(--text-tertiary)',textDecoration:'none',display:'flex'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
            <div style={{width:'0.5px',height:16,background:'var(--border)'}}/>
            <a href="/dashboard" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
              <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
            </a>
            <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Calendar</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>setCurrentDate(new Date(year,month-1,1))} className="btn-ghost" style={{padding:'5px 10px',fontSize:13}}>←</button>
            <span style={{fontSize:13,fontWeight:500,minWidth:130,textAlign:'center' as const}}>{monthName}</span>
            <button onClick={()=>setCurrentDate(new Date(year,month+1,1))} className="btn-ghost" style={{padding:'5px 10px',fontSize:13}}>→</button>
          </div>
        </div>
      </nav>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'24px',display:'grid',gridTemplateColumns:selected.length>0?'1fr 280px':'1fr',gap:16}}>
        <div className="riden-card" style={{overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'0.5px solid var(--border)'}}>
            {DAYS.map(d=><div key={d} style={{padding:'8px 0',textAlign:'center' as const,fontSize:11,fontWeight:500,color:'var(--text-tertiary)',letterSpacing:'0.04em'}}>{d}</div>)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
            {Array.from({length:firstDay}).map((_,i)=><div key={'e'+i} style={{minHeight:72,borderBottom:'0.5px solid var(--bg-page)',borderRight:'0.5px solid var(--bg-page)'}}/>)}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day = i+1
              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const dayTrips = tripsByDay(day)
              const isToday = dateStr === today
              const isSel = dateStr === selectedDay
              return (
                <div key={day} onClick={()=>selectDay(day)}
                  style={{minHeight:72,borderBottom:'0.5px solid var(--bg-page)',borderRight:'0.5px solid var(--bg-page)',padding:'6px 8px',cursor:'pointer',background:isSel?'rgba(25,201,119,0.04)':'transparent',transition:'background 0.1s'}}>
                  <div style={{fontSize:12,fontWeight:isToday?600:400,color:isToday?'var(--accent)':'var(--text-primary)',marginBottom:3,width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:isToday?'rgba(25,201,119,0.1)':'transparent'}}>{day}</div>
                  <div style={{display:'flex',flexDirection:'column' as const,gap:2}}>
                    {dayTrips.slice(0,2).map(t=>(
                      <div key={t.id} style={{fontSize:9,padding:'1px 5px',borderRadius:3,background:STATUS_BG[t.status]||'var(--bg-page)',color:STATUS_COLOR[t.status]||'var(--text-secondary)',whiteSpace:'nowrap' as const,overflow:'hidden',textOverflow:'ellipsis'}}>
                        {t.pickup_time?.slice(0,5)} {t.bookings?.client_name||t.pickup_location}
                      </div>
                    ))}
                    {dayTrips.length>2&&<div style={{fontSize:9,color:'var(--text-tertiary)'}}>+{dayTrips.length-2} more</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {selected.length>0&&(
          <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
            <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)',marginBottom:4}}>
              {new Date(selectedDay!+'T00:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
              <span style={{fontSize:12,color:'var(--text-tertiary)',marginLeft:6}}>{selected.length} trip{selected.length>1?'s':''}</span>
            </div>
            {selected.map(t=>(
              <div key={t.id} className="riden-card" style={{padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)'}}>{t.trip_date}</span>
                  <span className={'badge '+(t.status==='completed'?'badge-completed':t.status==='cancelled'?'badge-cancelled':t.status==='in_progress'?'badge-progress':'badge-warning')}>{t.status}</span>
                </div>
                <div style={{fontWeight:500,fontSize:13,marginBottom:3}}>{t.bookings?.client_name||'Unknown'}</div>
                <div style={{fontSize:12,color:'var(--text-secondary)'}}>{t.pickup_location} → {t.dropoff_location}</div>
                <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:4}}>{t.pickup_time?.slice(0,5)} · {t.vehicle_type}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
