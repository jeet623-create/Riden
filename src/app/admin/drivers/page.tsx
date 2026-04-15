'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Badge, Loading, PageHeader, Btn, Empty } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' })
const VL: Record<string,string> = { sedan:'Sedan',suv:'SUV',van_9:'Van 9',van_12:'Van 12',minibus_15:'Minibus 15',minibus_20:'Minibus 20',coach_30:'Coach 30+',pickup:'Pickup' }

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'pending'|'active'|'inactive'>('all')
  const [selected, setSelected] = useState<any|null>(null)
  const [rejReason, setRejReason] = useState('')
  const [acting, setActing] = useState(false)
  const [lightbox, setLightbox] = useState<string|null>(null)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return }
      sb.from('admin_users').select('id').eq('id', user.id).single().then(({ data }) => {
        if (!data) router.push('/admin/login'); else load()
      })
    })
  }, [])

  async function load() {
    setLoading(true)
    const r = await fetch(`${SUPA}/rest/v1/drivers?select=*&order=created_at.desc`, { headers: H() })
    const d = await r.json()
    setDrivers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function approve(id: string) {
    setActing(true)
    await fetch(`${SUPA}/functions/v1/admin-drivers`, { method:'POST', headers:H(), body:JSON.stringify({ driver_id:id, action:'approve' }) })
    await load(); setSelected(null); setActing(false)
  }

  async function reject(id: string) {
    setActing(true)
    await fetch(`${SUPA}/functions/v1/admin-drivers`, { method:'POST', headers:H(), body:JSON.stringify({ driver_id:id, action:'reject', rejection_reason:rejReason }) })
    await load(); setSelected(null); setRejReason(''); setActing(false)
  }

  const filtered = drivers.filter(d => {
    if (filter==='pending') return !d.is_verified && !d.is_active
    if (filter==='active') return d.is_verified && d.is_active
    if (filter==='inactive') return !d.is_active && d.is_verified
    return true
  })
  const pending = drivers.filter(d => !d.is_verified && !d.is_active).length

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      {lightbox && (
        <div onClick={()=>setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out'}}>
          <img src={lightbox} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:12,objectFit:'contain'}} />
          <div onClick={()=>setLightbox(null)} style={{position:'absolute',top:24,right:32,color:'var(--text-1)',fontSize:28,cursor:'pointer'}}>×</div>
        </div>
      )}

      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'flex-end',backdropFilter:'blur(4px)'}} onClick={()=>setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:440,height:'100vh',background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',padding:28,overflowY:'auto',display:'flex',flexDirection:'column',gap:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:600}}>{selected.full_name}</div>
              <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',fontSize:18}}>×</button>
            </div>
            <div>
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-3)',letterSpacing:1,marginBottom:8}}>VEHICLE PHOTO</div>
              {selected.vehicle_photo_url
                ? <img src={selected.vehicle_photo_url} onClick={()=>setLightbox(selected.vehicle_photo_url)} style={{width:'100%',borderRadius:12,objectFit:'cover',maxHeight:220,cursor:'zoom-in',border:'1px solid var(--border)'}} />
                : <div style={{height:160,background:'var(--bg-elevated)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,border:'1px solid var(--border)'}}><span style={{fontSize:28,opacity:0.3}}>🚗</span><span style={{fontSize:12,color:'var(--text-3)'}}>No photo</span></div>
              }
            </div>
            <div style={{background:'var(--bg-elevated)',borderRadius:'var(--r)',padding:16,display:'flex',flexDirection:'column',gap:10}}>
              {[['Phone',selected.phone??'—'],['Vehicle',`${VL[selected.vehicle_type]||selected.vehicle_type} — ${selected.vehicle_plate}`],['License',selected.license_number??'—'],['Expiry',selected.license_expiry??'—'],['Base',selected.base_location??'—'],['Registered',new Date(selected.created_at).toLocaleDateString('en-GB')]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                  <span style={{color:'var(--text-3)'}}>{k}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:12}}>{v}</span>
                </div>
              ))}
            </div>
            {!selected.is_verified && !selected.is_active && (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <Btn variant="teal" onClick={()=>approve(selected.id)} disabled={acting}>{acting?'Processing...':'✓ Approve Driver'}</Btn>
                <input value={rejReason} onChange={e=>setRejReason(e.target.value)} placeholder="Rejection reason (sent via LINE)..." style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'8px 12px',fontSize:12,color:'var(--text-1)',fontFamily:'var(--font-body)',width:'100%',outline:'none'}} />
                <Btn variant="danger" onClick={()=>reject(selected.id)} disabled={acting}>{acting?'Processing...':'✕ Reject & Notify'}</Btn>
              </div>
            )}
            {selected.is_active && <Btn variant="secondary" onClick={async()=>{ await fetch(`${SUPA}/rest/v1/drivers?id=eq.${selected.id}`,{method:'PATCH',headers:H(),body:JSON.stringify({is_active:false,is_available:false})}); await load(); setSelected(null) }}>Suspend Driver</Btn>}
          </div>
        </div>
      )}

      <PageHeader title="Driver Verification" sub="Review vehicle photos and approve drivers"
        actions={pending>0?<div style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'var(--r)',padding:'6px 14px'}}><span style={{color:'var(--amber)',fontSize:12,fontWeight:600}}>⏳ {pending} pending</span></div>:undefined}
      />

      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {(['all','pending','active','inactive'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 14px',borderRadius:20,border:`1px solid ${filter===f?'var(--teal-20)':'var(--border)'}`,background:filter===f?'var(--teal-10)':'transparent',color:filter===f?'var(--teal)':'var(--text-3)',fontSize:12,cursor:'pointer',fontFamily:'var(--font-body)',textTransform:'capitalize' as const}}>{f}{f==='pending'&&pending>0?` (${pending})":''}</button>
        ))}
      </div>

      {filtered.length === 0 ? <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,padding:60,textAlign:'center',color:'var(--text-3)'}}>No drivers in this category</div> : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {filtered.map(d=>{
            const isPending = !d.is_verified && !d.is_active
            const isActive = d.is_verified && d.is_active
            return (
              <div key={d.id} onClick={()=>setSelected(d)} style={{background:'var(--bg-surface)',border:`1px solid ${isPending?'rgba(245,158,11,0.25)':'var(--border)'}`,borderRadius:12,overflow:'hidden',cursor:'pointer',transition:'border-color 0.15s, transform 0.15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-strong)';e.currentTarget.style.transform='translateY(-1px)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor=isPending?'rgba(245,158,11,0.25)':'var(--border)';e.currentTarget.style.transform='none'}}>
                <div style={{height:150,background:'var(--bg-elevated)',position:'relative',overflow:'hidden'}}>
                  {d.vehicle_photo_url ? <img src={d.vehicle_photo_url} onClick={e=>{e.stopPropagation();setLightbox(d.vehicle_photo_url)}} style={{width:'100%',height:'100%',objectFit:'cover',cursor:'zoom-in'}} /> : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',flexDirection:'column',gap:6}}><span style={{fontSize:28,opacity:0.3}}>🚗</span><span style={{fontSize:11,color:'var(--text-3)'}}>No photo</span></div>}
                  <div style={{position:'absolute',top:8,right:8}}><Badge status={isActive?'active':isPending?'pending':'inactive'} /></div>
                  {isPending && <div style={{position:'absolute',top:8,left:8,background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:20,padding:'2px 8px',fontSize:10,fontFamily:'var(--font-mono)',color:'var(--amber)'}}>REVIEW</div>}
                </div>
                <div style={{padding:'12px 14px'}}>
                  <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{d.full_name}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8}}>{VL[d.vehicle_type]||d.vehicle_type} · {d.vehicle_plate}</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,fontSize:11,color:'var(--text-3)'}}>
                    <span>📞 {d.phone||'—'}</span><span>📍 {d.base_location||'—'}</span>
                  </div>
                </div>
                {isPending && <div style={{padding:'0 12px 12px',display:'flex',gap:8}}>
                  <Btn variant="teal" size="sm" style={{flex:1}} onClick={e=>{e.stopPropagation();approve(d.id)}}>✓ Approve</Btn>
                  <Btn variant="danger" size="sm" style={{flex:1}} onClick={e=>{e.stopPropagation();setSelected(d)}}>✕ Reject</Btn>
                </div>}
              </div>
            )
          })}
        </div>
      )}
    </AdminShell>
  )
}
