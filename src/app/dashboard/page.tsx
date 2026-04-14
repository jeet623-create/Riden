'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Shell from '@/components/Shell'

const Y = '#D4E827', D = '#1A1A1A'

function Stat({ n, label, bg, color }: { n:number|string, label:string, bg:string, color:string }) {
  return (
    <div style={{ background:bg, borderRadius:14, padding:'24px 20px', border: bg==='#fff'?'0.5px solid #E8E8E8':'none', flex:'1 1 140px', minWidth:120 }}>
      <div style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'clamp(28px,4vw,40px)', letterSpacing:'-0.04em', color, lineHeight:1 }}>{n}</div>
      <div style={{ fontFamily:'var(--font-space)', fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase' as const, color, opacity:0.5, marginTop:8 }}>{label}</div>
    </div>
  )
}

const SC: Record<string,string> = { pending:'badge-pending', operator_notified:'badge-pending', confirmed:'badge-confirmed', in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled' }

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ active:0, pending:0, done:0, pay:0 })
  const [bks, setBks] = useState<any[]>([])
  const [lineLinked, setLineLinked] = useState<boolean|null>(null)
  const [lineCode, setLineCode] = useState('')
  const [lineLoading, setLineLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState<string|null>(null)
  const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1'

  useEffect(() => { load() }, [])

  async function load() {
    const c = createClient()
    const { data:{ user } } = await c.auth.getUser()
    if (!user) { router.push('/login'); return }
    const now = new Date(), wa = new Date(now.getTime()-7*864e5)
    const [{ data:b },{ data:t },{ data:d }] = await Promise.all([
      c.from('bookings').select('id,status,client_name,created_at,total_days').eq('dmc_id',user.id).order('created_at',{ascending:false}).limit(20),
      c.from('trips').select('id,status,trip_date,pickup_time').in('status',['in_progress','assigned']).limit(100),
      c.from('dmc_users').select('line_user_id').eq('id',user.id).single()
    ])
    setBks(b?.slice(0,5)??[])
    setStats({ active:t?.filter((x:any)=>x.status==='in_progress').length??0, pending:b?.filter((x:any)=>['pending','operator_notified'].includes(x.status)).length??0, done:b?.filter((x:any)=>x.status==='completed'&&new Date(x.created_at)>wa).length??0, pay:b?.filter((x:any)=>x.status==='confirmed').length??0 })
    setLineLinked(!!d?.line_user_id)
    const in4h = new Date(now.getTime()+4*36e5)
    const urg = t?.filter((x:any)=>{ if(!x.trip_date||!x.pickup_time)return false; const p=new Date(x.trip_date+'T'+x.pickup_time); return p<=in4h&&p>=now&&x.status!=='in_progress' })
    if(urg&&urg.length>0) setAlert(urg.length+' trip'+(urg.length>1?'s':'')+' with no driver in the next 4 hours')
    setLoading(false)
  }

  async function getCode() {
    setLineLoading(true)
    const { data:{ user } } = await createClient().auth.getUser()
    if(!user) return
    const r = await fetch(SUPA+'/dmc-link-line',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dmc_id:user.id})})
    const d = await r.json()
    if(d.already_linked) setLineLinked(true)
    else if(d.code) setLineCode(d.code)
    setLineLoading(false)
  }

  return (
    <Shell title="Dashboard" action={<Link href="/bookings/new" style={{display:'inline-flex',alignItems:'center',gap:6,background:D,color:Y,padding:'9px 18px',borderRadius:8,fontSize:13,fontWeight:700,textDecoration:'none',fontFamily:'var(--font-syne)'}}>+ New Booking</Link>}>
      {alert&&<div style={{background:D,color:Y,padding:'12px 18px',borderRadius:8,marginBottom:20,fontSize:13,fontFamily:'var(--font-syne)',fontWeight:600,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><span>⚠ {alert}</span><button onClick={()=>setAlert(null)} style={{background:'none',border:'none',color:Y,opacity:0.5,cursor:'pointer',fontSize:20,lineHeight:1,padding:0}}>×</button></div>}
      {lineLinked===false&&<div style={{background:'#fff',border:'0.5px solid #E8E8E8',borderRadius:14,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap' as const}}><div><div style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:13,color:D,marginBottom:2}}>Link LINE for Emergency Alerts</div><div style={{fontSize:12,color:'#888'}}>Get instant LINE messages if a driver cancels.</div></div>{!lineCode?<button onClick={getCode} disabled={lineLoading} style={{background:D,color:Y,border:'none',borderRadius:8,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-syne)',opacity:lineLoading?0.6:1}}>{lineLoading?'...':'Get Code'}</button>:<div style={{textAlign:'right' as const}}><div style={{fontSize:10,color:'#888',marginBottom:4}}>Type in RIDEN LINE bot:</div><div style={{fontFamily:'var(--font-space)',fontSize:20,fontWeight:700,letterSpacing:3,color:D,background:Y,padding:'6px 14px',borderRadius:6,display:'inline-block'}}>{lineCode}</div></div>}</div>}
      {lineLinked===true&&<div style={{background:Y,borderRadius:10,padding:'10px 16px',marginBottom:20,fontSize:13,fontFamily:'var(--font-syne)',fontWeight:600,color:D}}>✓ LINE linked — you will receive emergency alerts on LINE.</div>}

      {loading?<div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap' as const}}>{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{flex:'1 1 120px',height:88,minWidth:110,borderRadius:14}}/>)}</div>:<div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap' as const}}><Stat n={stats.active} label="Active trips" bg={Y} color={D}/><Stat n={stats.pending} label="Pending" bg={D} color={Y}/><Stat n={stats.done} label="Done this week" bg="#fff" color={D}/><Stat n={stats.pay} label="Payment pending" bg="#fff" color={D}/></div>}

      <div style={{background:'#fff',borderRadius:14,border:'0.5px solid #E8E8E8',overflow:'hidden'}}>
        <div style={{padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid #E8E8E8'}}><span style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:15,color:D}}>Recent Bookings</span><Link href="/bookings" style={{fontSize:12,color:'#888',textDecoration:'none'}}>View all →</Link></div>
        {loading?<div style={{padding:20}}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:40,marginBottom:8,borderRadius:6}}/>)}</div>:bks.length===0?<div style={{padding:'40px 20px',textAlign:'center' as const,color:'#888',fontSize:14}}>No bookings yet. <Link href="/bookings/new" style={{color:D,fontWeight:700,textDecoration:'none'}}>Create first booking →</Link></div>:<div style={{overflowX:'auto' as const}}><table className="riden-table"><thead><tr><th>ID</th><th>Client</th><th>Days</th><th>Status</th><th></th></tr></thead><tbody>{bks.map(b=><tr key={b.id}><td style={{fontFamily:'var(--font-space)',fontWeight:600,fontSize:12}}>{b.id}</td><td style={{fontWeight:500}}>{b.client_name}</td><td>{b.total_days}</td><td><span className={'badge '+(SC[b.status]||'badge-neutral')}>{b.status?.replace('_',' ')}</span></td><td><Link href={'/bookings/'+b.id} style={{fontSize:12,color:'#888',textDecoration:'none'}}>View →</Link></td></tr>)}</tbody></table></div>}
      </div>
    </Shell>
  )
}
