'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Booking = { id:string; booking_ref:string; client_name:string; booking_type:string; total_days:number; status:string; created_at:string; adults_count:number }
const STATUS_FILTER = ['all','pending','confirmed','in_progress','completed','cancelled']
const STATUS_BADGE: Record<string,string> = { pending:'badge-warning', confirmed:'badge-confirmed', in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled' }
const STATUS_LABELS: Record<string,string> = { pending:'Pending', confirmed:'Confirmed', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' }

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const { data:{ user } } = await sb.auth.getUser()
      if (!user) { router.push('/login'); return }
      let q = sb.from('bookings').select('id,booking_ref,client_name,booking_type,total_days,status,created_at,adults_count').eq('dmc_id',user.id).order('created_at',{ascending:false})
      if (filter!=='all') q = q.eq('status',filter)
      const { data } = await q
      setBookings(data??[]); setLoading(false)
    }
    load()
  }, [filter, router])

  const filtered = bookings.filter(b => b.client_name.toLowerCase().includes(search.toLowerCase()) || b.booking_ref.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
      <nav style={{background:'var(--bg-page)',borderBottom:'0.5px solid var(--border)',height:52,display:'flex',alignItems:'center',position:'sticky' as const,top:0,zIndex:50}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <Link href="/dashboard" style={{color:'var(--text-tertiary)',textDecoration:'none',display:'flex',alignItems:'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </Link>
            <div style={{width:'0.5px',height:16,background:'var(--border)'}}/>
            <a href="/dashboard" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
              <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
            </a>
            <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>All Bookings</span>
          </div>
          <Link href="/bookings/new"><button className="btn-primary" style={{padding:'6px 14px',fontSize:13}}>+ New Booking</button></Link>
        </div>
      </nav>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'24px'}}>
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap' as const}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search client or ref..." className="riden-input" style={{maxWidth:260,padding:'7px 12px'}}/>
          <div style={{display:'flex',gap:4,flexWrap:'wrap' as const}}>
            {STATUS_FILTER.map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,border:'0.5px solid var(--border)',background:filter===s?'#111':'#fff',color:filter===s?'#fff':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)',transition:'all 0.1s'}}>
                {s==='all'?'All':STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="riden-card">
          {loading?(
            <div style={{padding:24}}>{[1,2,3,4].map(i=><div key={i} style={{height:44,background:'var(--bg-page)',borderRadius:6,marginBottom:8}}/>)}</div>
          ):filtered.length===0?(
            <div style={{padding:'48px 24px',textAlign:'center' as const}}>
              <p style={{fontWeight:500,fontSize:15,color:'var(--text-primary)',marginBottom:4}}>No bookings found</p>
              <p style={{fontSize:13,color:'var(--text-tertiary)',marginBottom:16}}>Create your first booking to get started</p>
              <Link href="/bookings/new"><button className="btn-primary">+ New Booking</button></Link>
            </div>
          ):(
            <div style={{overflowX:'auto' as const}}>
              <table className="riden-table">
                <thead><tr><th>Ref</th><th>Client</th><th>Type</th><th>Days</th><th>Pax</th><th>Date</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {filtered.map(b=>(
                    <tr key={b.id} style={{cursor:'pointer'}} onClick={()=>router.push('/bookings/'+b.id)}>
                      <td><span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)'}}>{b.booking_ref}</span></td>
                      <td style={{fontWeight:500}}>{b.client_name}</td>
                      <td style={{color:'var(--text-secondary)',textTransform:'capitalize' as const}}>{b.booking_type?.replace(/_/g,' ')}</td>
                      <td style={{color:'var(--text-secondary)'}}>{b.total_days}d</td>
                      <td style={{color:'var(--text-secondary)'}}>{b.adults_count}</td>
                      <td style={{color:'var(--text-secondary)',fontFamily:'var(--font-mono)',fontSize:11}}>{new Date(b.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</td>
                      <td><span className={'badge '+(STATUS_BADGE[b.status]||'badge-pending')}>{STATUS_LABELS[b.status]||b.status}</span></td>
                      <td style={{color:'var(--text-tertiary)',fontSize:12}}>→</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
