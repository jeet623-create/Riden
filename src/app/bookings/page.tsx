'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Shell from '@/components/Shell'

const D='#1A1A1A',Y='#D4E827'
const OPTS=['all','pending','confirmed','in_progress','completed','cancelled']
const SC: Record<string,string>={pending:'badge-pending',operator_notified:'badge-pending',confirmed:'badge-confirmed',in_progress:'badge-progress',completed:'badge-completed',cancelled:'badge-cancelled'}

export default function BookingsPage() {
  const router=useRouter()
  const [bookings,setBookings]=useState<any[]>([])
  const [filter,setFilter]=useState('all')
  const [search,setSearch]=useState('')
  const [loading,setLoading]=useState(true)

  const load=useCallback(async()=>{
    const c=createClient()
    const {data:{user}}=await c.auth.getUser()
    if(!user){router.push('/login');return}
    let q=c.from('bookings').select('*').eq('dmc_id',user.id).order('created_at',{ascending:false})
    if(filter!=='all')q=q.eq('status',filter)
    const {data}=await q
    setBookings(data??[])
    setLoading(false)
  },[filter])

  useEffect(()=>{load()},[load])

  const filtered=search?bookings.filter(b=>b.client_name?.toLowerCase().includes(search.toLowerCase())||b.id?.toLowerCase().includes(search.toLowerCase())):bookings

  return (
    <Shell title="Bookings" action={<Link href="/bookings/new" style={{display:'inline-flex',alignItems:'center',gap:6,background:D,color:Y,padding:'9px 18px',borderRadius:8,fontSize:13,fontWeight:700,textDecoration:'none',fontFamily:'var(--font-syne)'}}>+ New Booking</Link>}>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap' as const,alignItems:'center'}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>{OPTS.map(s=><button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',border:filter===s?'none':'0.5px solid #E8E8E8',background:filter===s?D:'#fff',color:filter===s?Y:'#555',fontFamily:'var(--font-syne)',transition:'all 150ms',whiteSpace:'nowrap' as const}}>{s==='all'?'All':s.replace('_',' ')}</button>)}</div>
        <input style={{flex:1,minWidth:160,background:'#fff',border:'0.5px solid #E8E8E8',borderRadius:8,color:D,fontFamily:'var(--font-space)',fontSize:13,padding:'7px 12px',outline:'none'}} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div style={{background:'#fff',borderRadius:14,border:'0.5px solid #E8E8E8',overflow:'hidden'}}>
        {loading?<div style={{padding:20}}>{[1,2,3,4,5].map(i=><div key={i} className="skeleton" style={{height:44,marginBottom:8,borderRadius:6}}/>)}</div>:filtered.length===0?<div style={{padding:'48px 20px',textAlign:'center' as const,color:'#888',fontSize:14}}>No bookings.{!search&&<> <Link href="/bookings/new" style={{color:D,fontWeight:700,textDecoration:'none'}}>Create one →</Link></>}</div>:<div style={{overflowX:'auto' as const}}><table className="riden-table"><thead><tr><th>ID</th><th>Client</th><th>Days</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>{filtered.map(b=><tr key={b.id}><td style={{fontFamily:'var(--font-space)',fontWeight:600,fontSize:12}}>{b.id}</td><td style={{fontWeight:500}}>{b.client_name}</td><td>{b.total_days}</td><td><span className={'badge '+(SC[b.status]||'badge-neutral')}>{b.status?.replace('_',' ')}</span></td><td style={{fontSize:12,color:'#888'}}>{new Date(b.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</td><td><Link href={'/bookings/'+b.id} style={{fontSize:12,color:'#555',textDecoration:'none',fontWeight:600}}>View →</Link></td></tr>)}</tbody></table></div>}
      </div>
    </Shell>
  )
}
