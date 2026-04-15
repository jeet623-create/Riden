'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ReportsPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ total:0, completed:0, cancelled:0, pending:0, inProgress:0 })
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year] = useState(new Date().getFullYear())

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const { data:{ user } } = await sb.auth.getUser()
      if (!user) { router.push('/login'); return }
      const start = new Date(year, month, 1).toISOString()
      const end = new Date(year, month+1, 0, 23, 59, 59).toISOString()
      const { data } = await sb.from('bookings').select('*').eq('dmc_id', user.id).gte('created_at', start).lte('created_at', end)
      const bks = data??[]
      setBookings(bks)
      setStats({ total:bks.length, completed:bks.filter(b=>b.status==='completed').length, cancelled:bks.filter(b=>b.status==='cancelled').length, pending:bks.filter(b=>b.status==='pending').length, inProgress:bks.filter(b=>b.status==='in_progress').length })
      setLoading(false)
    }
    load()
  }, [month, year, router])

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  function exportCSV() {
    const rows = [['Booking Ref','Client','Type','Days','Status','Created'],...bookings.map(b=>[b.booking_ref,b.client_name,b.booking_type,b.total_days,b.status,b.created_at])]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='riden-report-'+MONTHS[month]+'-'+year+'.csv'; a.click()
  }

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
            <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Reports</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="riden-input" style={{width:'auto',padding:'5px 10px',fontSize:12}}>
              {MONTHS.map((m,i)=><option key={m} value={i}>{m} {year}</option>)}
            </select>
            <button onClick={exportCSV} className="btn-ghost" style={{padding:'6px 12px',fontSize:12}}>Export CSV</button>
          </div>
        </div>
      </nav>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
          {[
            {l:'Total',v:stats.total,c:'var(--text-primary)'},
            {l:'Completed',v:stats.completed,c:'var(--success)'},
            {l:'In Progress',v:stats.inProgress,c:'var(--accent)'},
            {l:'Pending',v:stats.pending,c:'var(--warning)'},
            {l:'Cancelled',v:stats.cancelled,c:'var(--danger)'},
          ].map(s=>(
            <div key={s.l} className="riden-card" style={{padding:'14px 16px'}}>
              <div style={{fontSize:24,fontWeight:600,letterSpacing:'-0.5px',color:s.c,lineHeight:1,marginBottom:4}}>{loading?'—':s.v}</div>
              <div style={{fontSize:10,fontWeight:500,color:'var(--text-tertiary)',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div className="riden-card" style={{overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)',fontSize:13,fontWeight:500}}>
            {MONTHS[month]} {year} — {bookings.length} bookings
          </div>
          {loading?(<div style={{padding:24,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>):
          bookings.length===0?(<div style={{padding:'32px 24px',textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>No bookings for {MONTHS[month]} {year}.</div>):(
            <div style={{overflowX:'auto' as const}}>
              <table className="riden-table">
                <thead><tr><th>Ref</th><th>Client</th><th>Type</th><th>Days</th><th>Status</th><th>Created</th></tr></thead>
                <tbody>{bookings.map((b:any)=>(
                  <tr key={b.id}>
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
