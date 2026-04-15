'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year] = useState(new Date().getFullYear())

  // Current month data
  const [bookings, setBookings] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  // Previous month data for comparison
  const [prevBookings, setPrevBookings] = useState<any[]>([])

  // Computed stats
  const [stats, setStats] = useState({ total:0, completed:0, cancelled:0, pending:0, inProgress:0 })
  const [prevStats, setPrevStats] = useState({ total:0, completed:0 })
  const [onTimeRate, setOnTimeRate] = useState<number|null>(null)
  const [topOperators, setTopOperators] = useState<{name:string;trips:number;completed:number}[]>([])
  const [topRoutes, setTopRoutes] = useState<{route:string;count:number}[]>([])
  const [paymentPending, setPaymentPending] = useState(0)

  useEffect(() => { load() }, [month, year])

  async function load() {
    setLoading(true)
    const sb = createClient()
    const { data:{user} } = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Current month range
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month+1, 0, 23, 59, 59).toISOString()

    // Previous month range
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const prevStart = new Date(prevYear, prevMonth, 1).toISOString()
    const prevEnd = new Date(prevYear, prevMonth+1, 0, 23, 59, 59).toISOString()

    const [bRes, tRes, pRes, pbRes] = await Promise.all([
      sb.from('bookings').select('*').eq('dmc_id', user.id).gte('created_at', start).lte('created_at', end),
      sb.from('trips').select('*, operators(company_name)').eq('dmc_id', user.id).gte('trip_date', new Date(year,month,1).toISOString().slice(0,10)).lte('trip_date', new Date(year,month+1,0).toISOString().slice(0,10)),
      sb.from('payments').select('*, trips!inner(booking_id, bookings!inner(dmc_id))').eq('trips.bookings.dmc_id', user.id).eq('status','pending'),
      sb.from('bookings').select('id,status').eq('dmc_id', user.id).gte('created_at', prevStart).lte('created_at', prevEnd),
    ])

    const bks = bRes.data ?? []
    const trs = tRes.data ?? []
    const pms = pRes.data ?? []
    const pbks = pbRes.data ?? []

    setBookings(bks)
    setTrips(trs)
    setPayments(pms)
    setPrevBookings(pbks)
    setPaymentPending(pms.length)

    // Current stats
    setStats({
      total: bks.length,
      completed: bks.filter((b:any) => b.status==='completed').length,
      cancelled: bks.filter((b:any) => b.status==='cancelled').length,
      pending: bks.filter((b:any) => b.status==='pending').length,
      inProgress: bks.filter((b:any) => b.status==='in_progress').length,
    })

    // Previous month stats
    setPrevStats({
      total: pbks.length,
      completed: pbks.filter((b:any) => b.status==='completed').length,
    })

    // On-time completion rate — completed trips / total assigned trips
    const completedTrips = trs.filter((t:any) => t.status==='completed').length
    const assignedTrips = trs.filter((t:any) => t.status!=='pending' && t.status!=='in_pool').length
    setOnTimeRate(assignedTrips > 0 ? Math.round((completedTrips / assignedTrips) * 100) : null)

    // Top operators by trip count
    const opMap: Record<string,{name:string;trips:number;completed:number}> = {}
    for (const t of trs) {
      if (!t.operator_id) continue
      const name = (t.operators as any)?.company_name || 'Unknown'
      if (!opMap[t.operator_id]) opMap[t.operator_id] = { name, trips:0, completed:0 }
      opMap[t.operator_id].trips++
      if (t.status==='completed') opMap[t.operator_id].completed++
    }
    setTopOperators(Object.values(opMap).sort((a,b) => b.trips-a.trips).slice(0,5))

    // Most common routes
    const routeMap: Record<string,number> = {}
    for (const t of trs) {
      if (!t.pickup_location || !t.dropoff_location) continue
      const route = t.pickup_location.slice(0,20) + ' → ' + t.dropoff_location.slice(0,20)
      routeMap[route] = (routeMap[route]||0) + 1
    }
    setTopRoutes(Object.entries(routeMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([route,count])=>({route,count})))

    setLoading(false)
  }

  function exportCSV() {
    const rows = [
      ['Booking Ref','Client','Type','Days','Status','Created'],
      ...bookings.map((b:any) => [b.booking_ref, b.client_name, b.booking_type?.replace(/_/g,' '), b.total_days, b.status, new Date(b.created_at).toLocaleDateString('en-GB')])
    ]
    const csv = rows.map(r => r.map(v => '"'+(v||'')+'"').join(',')).join('
')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'riden-report-'+MONTHS[month]+'-'+year+'.csv'
    a.click()
  }

  function delta(curr:number, prev:number) {
    if (prev===0) return null
    const pct = Math.round(((curr-prev)/prev)*100)
    return pct
  }

  const bookingDelta = delta(stats.total, prevStats.total)
  const completedDelta = delta(stats.completed, prevStats.completed)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
      <nav style={{background:'var(--bg-page)',borderBottom:'0.5px solid var(--border)',height:52,display:'flex',alignItems:'center',position:'sticky' as const,top:0,zIndex:50}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <a href="/dashboard" style={{color:'var(--text-tertiary)',textDecoration:'none',display:'flex'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
            <div style={{width:'0.5px',height:16,background:'var(--border)'}}/>
            <a href="/dashboard" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
              <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
            </a>
            <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Reports — {MONTHS[month]} {year}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="riden-input" style={{width:'auto',padding:'5px 10px',fontSize:12}}>
              {MONTHS.map((m,i)=><option key={m} value={i}>{m} {year}</option>)}
            </select>
            <button onClick={exportCSV} className="btn-ghost" style={{padding:'6px 12px',fontSize:12}}>Export CSV</button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px'}}>

        {/* KPI STATS — with last month comparison */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
          {[
            {l:'Total Bookings',   v:stats.total,       prev:prevStats.total,     d:bookingDelta,   c:'var(--text-primary)'},
            {l:'Completed',        v:stats.completed,   prev:prevStats.completed, d:completedDelta, c:'var(--success)'},
            {l:'In Progress',      v:stats.inProgress,  prev:null,                d:null,           c:'var(--accent)'},
            {l:'Pending',          v:stats.pending,     prev:null,                d:null,           c:'var(--warning)'},
            {l:'Cancelled',        v:stats.cancelled,   prev:null,                d:null,           c:'var(--danger)'},
          ].map(s=>(
            <div key={s.l} className="riden-card" style={{padding:'14px 16px'}}>
              <div style={{fontSize:24,fontWeight:600,letterSpacing:'-0.5px',color:s.c,lineHeight:1,marginBottom:4}}>{loading?'—':s.v}</div>
              <div style={{fontSize:10,fontWeight:500,color:'var(--text-tertiary)',textTransform:'uppercase' as const,letterSpacing:'0.06em',marginBottom:s.d!==null?4:0}}>{s.l}</div>
              {s.d!==null&&!loading&&(
                <div style={{fontSize:10,color:s.d>=0?'var(--success)':'var(--danger)',fontWeight:500}}>
                  {s.d>=0?'↑':''}{s.d<0?'↓':''}{Math.abs(s.d)}% vs last month
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SECOND ROW — on-time rate + payment pending */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:20}}>
          <div className="riden-card" style={{padding:'16px'}}>
            <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:8}}>On-Time Completion Rate</div>
            {loading ? (
              <div style={{fontSize:28,fontWeight:600,color:'var(--text-primary)'}}>—</div>
            ) : onTimeRate === null ? (
              <div style={{fontSize:13,color:'var(--text-tertiary)'}}>No assigned trips this month</div>
            ) : (
              <>
                <div style={{fontSize:32,fontWeight:600,letterSpacing:'-0.5px',color:onTimeRate>=80?'var(--success)':onTimeRate>=60?'var(--warning)':'var(--danger)',marginBottom:6}}>{onTimeRate}%</div>
                <div style={{height:6,background:'var(--bg-page)',borderRadius:3,overflow:'hidden' as const}}>
                  <div style={{height:'100%',width:onTimeRate+'%',background:onTimeRate>=80?'var(--success)':onTimeRate>=60?'var(--warning)':'var(--danger)',borderRadius:3,transition:'width 0.5s'}}/>
                </div>
                <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:4}}>{trips.filter((t:any)=>t.status==='completed').length} completed of {trips.filter((t:any)=>t.status!=='pending'&&t.status!=='in_pool').length} assigned trips</div>
              </>
            )}
          </div>

          <div className="riden-card" style={{padding:'16px'}}>
            <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:8}}>Payments Pending</div>
            <div style={{fontSize:32,fontWeight:600,letterSpacing:'-0.5px',color:paymentPending>0?'var(--warning)':'var(--success)',marginBottom:4}}>{loading?'—':paymentPending}</div>
            <div style={{fontSize:12,color:'var(--text-tertiary)'}}>trips awaiting payment confirmation</div>
            {paymentPending>0&&<a href="/payments" style={{fontSize:11,color:'var(--accent)',textDecoration:'none',marginTop:4,display:'block'}}>View payments →</a>}
          </div>

          <div className="riden-card" style={{padding:'16px'}}>
            <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:8}}>Trip Activity</div>
            <div style={{fontSize:32,fontWeight:600,letterSpacing:'-0.5px',color:'var(--text-primary)',marginBottom:4}}>{loading?'—':trips.length}</div>
            <div style={{fontSize:12,color:'var(--text-tertiary)'}}>{MONTHS[month]} total trips across all bookings</div>
          </div>
        </div>

        {/* THIRD ROW — top operators + top routes */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>

          {/* Top Operators */}
          <div className="riden-card" style={{overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)',fontSize:12,fontWeight:500}}>Top Operators by Performance</div>
            {loading?(
              <div style={{padding:16,color:'var(--text-tertiary)',fontSize:12}}>Loading...</div>
            ):topOperators.length===0?(
              <div style={{padding:16,color:'var(--text-tertiary)',fontSize:12}}>No operator data for {MONTHS[month]}</div>
            ):(
              <div style={{padding:'8px 0'}}>
                {topOperators.map((op,i)=>(
                  <div key={op.name} style={{padding:'8px 16px',display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:20,height:20,borderRadius:5,background:'var(--bg-page)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'var(--text-tertiary)',flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)',marginBottom:1}}>{op.name}</div>
                      <div style={{fontSize:11,color:'var(--text-tertiary)'}}>{op.trips} trip{op.trips!==1?'s':''} · {op.completed} completed</div>
                    </div>
                    {op.trips>0&&(
                      <div style={{fontSize:11,fontWeight:500,color:Math.round(op.completed/op.trips*100)>=80?'var(--success)':'var(--warning)'}}>
                        {Math.round(op.completed/op.trips*100)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Common Routes */}
          <div className="riden-card" style={{overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)',fontSize:12,fontWeight:500}}>Most Common Routes</div>
            {loading?(
              <div style={{padding:16,color:'var(--text-tertiary)',fontSize:12}}>Loading...</div>
            ):topRoutes.length===0?(
              <div style={{padding:16,color:'var(--text-tertiary)',fontSize:12}}>No route data for {MONTHS[month]}</div>
            ):(
              <div style={{padding:'8px 0'}}>
                {topRoutes.map((r,i)=>(
                  <div key={r.route} style={{padding:'8px 16px',display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:20,height:20,borderRadius:5,background:'var(--bg-page)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'var(--text-tertiary)',flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:500,color:'var(--text-primary)',marginBottom:1}}>{r.route}</div>
                    </div>
                    <div style={{fontSize:11,fontWeight:500,color:'var(--text-secondary)',flexShrink:0}}>{r.count}x</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOOKINGS TABLE */}
        <div className="riden-card" style={{overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:13,fontWeight:500}}>{MONTHS[month]} {year} — {bookings.length} bookings</span>
            <button onClick={exportCSV} className="btn-ghost" style={{padding:'4px 10px',fontSize:11}}>Download CSV</button>
          </div>
          {loading?(
            <div style={{padding:24,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>
          ):bookings.length===0?(
            <div style={{padding:'32px 24px',textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>No bookings for {MONTHS[month]} {year}.</div>
          ):(
            <div style={{overflowX:'auto' as const}}>
              <table className="riden-table">
                <thead><tr><th>Ref</th><th>Client</th><th>Type</th><th>Days</th><th>Status</th><th>Created</th></tr></thead>
                <tbody>{bookings.map((b:any)=>(
                  <tr key={b.id} style={{cursor:'pointer'}} onClick={()=>window.location.href='/bookings/'+b.id}>
                    <td><span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)'}}>{b.booking_ref}</span></td>
                    <td style={{fontWeight:500}}>{b.client_name}</td>
                    <td style={{color:'var(--text-secondary)',textTransform:'capitalize' as const}}>{b.booking_type?.replace(/_/g,' ')}</td>
                    <td style={{color:'var(--text-secondary)'}}>{b.total_days}d</td>
                    <td><span className={'badge '+(b.status==='completed'?'badge-completed':b.status==='cancelled'?'badge-cancelled':b.status==='in_progress'?'badge-progress':'badge-warning')}>{b.status}</span></td>
                    <td style={{color:'var(--text-secondary)',fontFamily:'var(--font-mono)',fontSize:11}}>{new Date(b.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
