'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Trip = { id:string; trip_date:string; pickup_time:string; pickup_location:string; dropoff_location:string; vehicle_type:string; status:string; booking_id:string; bookings?:{ client_name:string; booking_ref:string } }
const STATUS_BADGE: Record<string,string> = { pending:'badge-warning', assigned:'badge-progress', in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled', in_pool:'badge-warning' }
const STATUS_LABELS: Record<string,string> = { pending:'Pending', assigned:'Assigned', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled', in_pool:'In Pool' }

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  const load = useCallback(async () => {
    const sb = createClient()
    const { data:{ user } } = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }
    let q = sb.from('trips').select('*,bookings(client_name,booking_ref)').eq('dmc_id', user.id).order('trip_date',{ascending:false}).limit(100)
    if (filter==='active') q = q.in('status',['in_progress','assigned','driver_assigned'])
    else if (filter==='today') q = q.eq('trip_date', new Date().toISOString().slice(0,10))
    else if (filter==='pending') q = q.in('status',['pending','in_pool'])
    const { data } = await q
    setTrips(data??[]); setLoading(false)
  }, [filter, router])

  useEffect(() => { load() }, [load])

  const FILTERS = ['active','today','pending','all']

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
      <nav style={{background:'var(--bg-page)',borderBottom:'0.5px solid var(--border)',height:52,display:'flex',alignItems:'center',position:'sticky' as const,top:0,zIndex:50}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',alignItems:'center',gap:14}}>
          <a href="/dashboard" style={{color:'var(--text-tertiary)',textDecoration:'none',display:'flex'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
          <div style={{width:'0.5px',height:16,background:'var(--border)'}}/>
          <a href="/dashboard" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
            <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
            <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
          </a>
          <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Live Trips</span>
          {trips.filter(t=>t.status==='in_progress').length>0&&(
            <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--accent)'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',display:'inline-block'}}/>
              {trips.filter(t=>t.status==='in_progress').length} live
            </span>
          )}
        </div>
      </nav>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'24px'}}>
        <div style={{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap' as const}}>
          {FILTERS.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,border:'0.5px solid var(--border)',background:filter===f?'#111':'#fff',color:filter===f?'#fff':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)',textTransform:'capitalize' as const,transition:'all 0.1s'}}>
              {f==='active'?'Active Now':f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        {loading?(
          <div style={{padding:40,textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>
        ):trips.length===0?(
          <div className="riden-card" style={{padding:'40px 24px',textAlign:'center' as const}}>
            <p style={{fontWeight:500,fontSize:15,marginBottom:4}}>No trips found</p>
            <p style={{fontSize:12,color:'var(--text-tertiary)'}}>No {filter} trips at the moment.</p>
          </div>
        ):(
          <div className="riden-card" style={{overflow:'hidden'}}>
            <div style={{overflowX:'auto' as const}}>
              <table className="riden-table">
                <thead><tr><th>Trip ID</th><th>Date</th><th>Time</th><th>Client</th><th>Route</th><th>Vehicle</th><th>Status</th></tr></thead>
                <tbody>
                  {trips.map(t=>(
                    <tr key={t.id}>
                      <td><span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)'}}>{t.id}</span></td>
                      <td style={{color:'var(--text-secondary)',fontFamily:'var(--font-mono)',fontSize:11}}>{t.trip_date}</td>
                      <td style={{color:'var(--text-secondary)'}}>{t.pickup_time?.slice(0,5)||'—'}</td>
                      <td style={{fontWeight:500}}>{t.bookings?.client_name||'—'}</td>
                      <td style={{color:'var(--text-secondary)',fontSize:12,maxWidth:200,overflow:'hidden' as const,textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{t.pickup_location} → {t.dropoff_location}</td>
                      <td style={{color:'var(--text-secondary)',textTransform:'capitalize' as const}}>{t.vehicle_type?.replace(/_/g,' ')}</td>
                      <td><span className={'badge '+(STATUS_BADGE[t.status]||'badge-pending')}>{STATUS_LABELS[t.status]||t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
