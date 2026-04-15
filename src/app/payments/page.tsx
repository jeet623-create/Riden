'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Payment = { id:string; trip_id:string; status:string; proof_photo_url:string|null; confirmed_at:string|null; reminder_count:number; trips:{ trip_date:string; pickup_location:string; dropoff_location:string; bookings:{ client_name:string; booking_ref:string } } }
const STATUS_LABELS: Record<string,string> = { pending:'Awaiting Proof', proof_uploaded:'Proof Uploaded — Confirm?', confirmed:'Confirmed', disputed:'Disputed' }
const STATUS_BADGE: Record<string,string> = { pending:'badge-warning', proof_uploaded:'badge-progress', confirmed:'badge-completed', disputed:'badge-cancelled' }

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const { data:{ user } } = await sb.auth.getUser()
      if (!user) { router.push('/login'); return }
      let q = sb.from('payments').select('id,trip_id,status,proof_photo_url,confirmed_at,reminder_count,trips!inner(trip_date,pickup_location,dropoff_location,bookings!inner(client_name,booking_ref,dmc_id))').eq('trips.bookings.dmc_id', user.id).order('trips(trip_date)',{ascending:false}).limit(50)
      setPayments((await q).data as unknown as Payment[]??[])
      setLoading(false)
    }
    load()
  }, [router])

  async function confirmPayment(paymentId:string) {
    const sb = createClient()
    const { data:{ user } } = await sb.auth.getUser()
    if (!user) return
    const { error } = await sb.from('payments').update({ status:'confirmed', confirmed_by:user.id, confirmed_at:new Date().toISOString() }).eq('id', paymentId)
    if (error) { toast.error('Failed to confirm'); return }
    toast.success('Payment confirmed!')
    setPayments(prev=>prev.map(p=>p.id===paymentId?{...p,status:'confirmed'}:p))
  }

  const FILTERS = ['all','pending','proof_uploaded','confirmed']
  const filtered = filter==='all' ? payments : payments.filter(p=>p.status===filter)

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
            <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Payments</span>
          </div>
        </div>
      </nav>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
          {[
            {l:'Pending',v:payments.filter(p=>p.status==='pending').length,c:'var(--warning)'},
            {l:'Awaiting Confirmation',v:payments.filter(p=>p.status==='proof_uploaded').length,c:'var(--accent)'},
            {l:'Confirmed',v:payments.filter(p=>p.status==='confirmed').length,c:'var(--success)'},
          ].map(s=>(
            <div key={s.l} className="riden-card" style={{padding:'14px 16px'}}>
              <div style={{fontSize:24,fontWeight:600,letterSpacing:'-0.5px',color:s.c,lineHeight:1,marginBottom:4}}>{s.v}</div>
              <div style={{fontSize:10,fontWeight:500,color:'var(--text-tertiary)',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:4,marginBottom:14,flexWrap:'wrap' as const}}>
          {FILTERS.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,border:'0.5px solid var(--border)',background:filter===f?'#111':'#fff',color:filter===f?'#fff':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)',transition:'all 0.1s'}}>
              {f==='all'?'All':f.replace('_',' ')}
            </button>
          ))}
        </div>
        {loading?(
          <div style={{padding:40,textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>
        ):filtered.length===0?(
          <div className="riden-card" style={{padding:'40px 24px',textAlign:'center' as const}}>
            <p style={{fontWeight:500,fontSize:15,marginBottom:4}}>No payments found</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
            {filtered.map(p=>(
              <div key={p.id} className="riden-card" style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap' as const}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)'}}>{p.trips?.bookings?.booking_ref}</span>
                    <span className={'badge '+STATUS_BADGE[p.status]}>{STATUS_LABELS[p.status]}</span>
                  </div>
                  <div style={{fontWeight:500,fontSize:13,marginBottom:2}}>{p.trips?.bookings?.client_name}</div>
                  <div style={{fontSize:12,color:'var(--text-secondary)'}}>{p.trips?.trip_date} · {p.trips?.pickup_location} → {p.trips?.dropoff_location}</div>
                  {p.reminder_count>0&&<div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>{p.reminder_count} reminder{p.reminder_count>1?'s':''} sent</div>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  {p.proof_photo_url&&<a href={p.proof_photo_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'var(--accent)',textDecoration:'none',padding:'5px 10px',borderRadius:6,border:'0.5px solid rgba(25,201,119,0.2)',background:'var(--accent-bg)'}}>View Proof</a>}
                  {p.status==='proof_uploaded'&&<button onClick={()=>confirmPayment(p.id)} className="btn-primary" style={{padding:'6px 12px',fontSize:12}}>✓ Confirm</button>}
                  {p.status==='confirmed'&&<span style={{fontSize:12,color:'var(--success)'}}>✓ Done</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
