'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Input, Btn, StatCard } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

const VL: Record<string,string> = { sedan:'Sedan', suv:'SUV', van_9:'Van 9', van_12:'Van 12', minibus_15:'Minibus 15', minibus_20:'Minibus 20', coach_30:'Coach 30', coach_40plus:'Coach 40+', pickup:'Pickup' }

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
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
    const r = await fetch(SUPA+'/rest/v1/drivers?select=*&order=joined_at.desc', { headers: H() })
    const d = await r.json()
    setDrivers(Array.isArray(d)?d:[])
    setLoading(false)
  }

  async function approve(id: string) {
    await fetch(SUPA+'/rest/v1/drivers?id=eq.'+id, { method:'PATCH', headers:{...H(),'Content-Type':'application/json'}, body: JSON.stringify({ is_verified:true, is_active:true }) })
    setDrivers(prev=>prev.map(d=>d.id===id?{...d,is_verified:true,is_active:true}:d))
    if (selected?.id===id) setSelected((prev: any)=>({...prev,is_verified:true,is_active:true}))
  }

  async function reject(id: string) {
    await fetch(SUPA+'/rest/v1/drivers?id=eq.'+id, { method:'PATCH', headers:{...H(),'Content-Type':'application/json'}, body: JSON.stringify({ is_active:false }) })
    setDrivers(prev=>prev.map(d=>d.id===id?{...d,is_active:false}:d))
  }

  const filtered = drivers.filter(d => {
    const ms = !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.vehicle_plate?.toLowerCase().includes(search.toLowerCase()) || d.license_number?.toLowerCase().includes(search.toLowerCase())
    if (filter==='all') return ms
    if (filter==='pending') return ms && !d.is_verified && !d.is_active
    if (filter==='active') return ms && d.is_verified && d.is_active
    if (filter==='inactive') return ms && !d.is_active
    return ms
  })

  const pending = drivers.filter(d=>!d.is_verified&&!d.is_active).length
  const active = drivers.filter(d=>d.is_verified&&d.is_active).length

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      <PageHeader title='Driver Verification' sub='Review and approve drivers' actions={pending>0?<span style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:20,padding:'4px 12px',fontSize:12,color:'var(--amber)',fontFamily:'var(--font-mono)'}}>{pending} pending</span>:undefined} />

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        <StatCard label='Total' value={drivers.length} color='var(--text-2)' />
        <StatCard label='Verified' value={active} color='var(--teal)' />
        <StatCard label='Pending' value={pending} color='var(--amber)' />
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,gap:8}}>
        <div style={{display:'flex',gap:6}}>
          {[{k:'all',l:'All'},{k:'pending',l:pending>0?'Pending ('+pending+')':'Pending'},{k:'active',l:'Active'},{k:'inactive',l:'Inactive'}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:500,cursor:'pointer',border:'1px solid',transition:'all 0.12s',background:filter===f.k?'var(--teal-10)':'transparent',borderColor:filter===f.k?'var(--teal-20)':'var(--border)',color:filter===f.k?'var(--teal)':'var(--text-3)',fontFamily:'var(--font-body)'}}>{f.l}</button>
          ))}
        </div>
        <Input value={search} onChange={setSearch} placeholder='Search driver, plate, license...' style={{width:240}} />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
        {filtered.length===0?(
          <div style={{gridColumn:'1/-1',padding:'60px',textAlign:'center',color:'var(--text-3)',fontSize:13,background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)'}}>No drivers in this category</div>
        ):filtered.map(d => {
          const isPending = !d.is_verified && !d.is_active
          return (
            <div key={d.id} style={{background:'var(--bg-surface)',border:'1px solid '+(isPending?'rgba(245,158,11,0.3)':'var(--border)'),borderRadius:'var(--r-xl)',overflow:'hidden',cursor:'pointer',transition:'border-color 0.15s'}} onClick={()=>setSelected(d)}>
              {d.vehicle_photo_url
                ?<img src={d.vehicle_photo_url} style={{width:'100%',height:140,objectFit:'cover'}} alt='vehicle' />
                :<div style={{height:140,background:'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8}}><span style={{fontSize:24,opacity:0.3}}>🚗</span><span style={{fontSize:11,color:'var(--text-3)'}}>No vehicle photo</span></div>
              }
              {isPending&&<div style={{background:'var(--amber)',color:'#000',fontSize:10,fontWeight:700,padding:'3px 10px',fontFamily:'var(--font-mono)'}}>PENDING</div>}
              <div style={{padding:'12px 14px'}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:2}}>{d.full_name}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8}}>{VL[d.vehicle_type]||d.vehicle_type} · {d.vehicle_plate}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:isPending?10:0}}>📞 {d.phone||'—'} · {d.base_location||'—'}</div>
                {isPending&&(
                  <div style={{display:'flex',gap:8}} onClick={e=>e.stopPropagation()}>
                    <Btn variant='teal' size='sm' style={{flex:1,justifyContent:'center'}} onClick={()=>approve(d.id)}>Approve</Btn>
                    <Btn variant='danger' size='sm' onClick={()=>reject(d.id)}>×</Btn>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected&&(
        <div style={{position:'fixed',top:0,right:0,bottom:0,width:440,background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',zIndex:100,overflowY:'auto',padding:24,boxShadow:'-4px 0 24px rgba(0,0,0,0.3)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontSize:15,fontWeight:600,color:'var(--text-1)'}}>Driver Dossier</div>
            <button onClick={()=>setSelected(null)} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',width:28,height:28,cursor:'pointer',color:'var(--text-2)',fontSize:14}}>×</button>
          </div>
          {selected.vehicle_photo_url&&(
            <img src={selected.vehicle_photo_url} style={{width:'100%',height:200,objectFit:'cover',borderRadius:'var(--r-lg)',marginBottom:16,cursor:'zoom-in'}} onClick={()=>setLightbox(selected.vehicle_photo_url)} alt='vehicle' />
          )}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:16,fontWeight:600,color:'var(--text-1)'}}>{selected.full_name}</div>
            <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
              <Badge status={selected.is_verified?'active':'pending'} label={selected.is_verified?'Verified':'Pending'} />
              <span style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--font-mono)'}}>{selected.base_location}</span>
            </div>
          </div>
          <div style={{background:'var(--bg-elevated)',borderRadius:'var(--r)',padding:14,marginBottom:16}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[['Vehicle',VL[selected.vehicle_type]||selected.vehicle_type],['Plate',selected.vehicle_plate],['License #',selected.license_number||'—'],['Expiry',selected.license_expiry?(new Date(selected.license_expiry)<new Date()?<span style={{color:'var(--red)',fontWeight:600}}>{selected.license_expiry} EXPIRED</span>:selected.license_expiry):'—'],['Phone',selected.phone||'—'],['Base',selected.base_location||'—']].map(([k,v]:any)=>(
                <div key={k as string}>
                  <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>{k}</div>
                  <div style={{fontSize:13,color:'var(--text-1)'}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {(!selected.is_verified)&&(
            <div style={{display:'flex',gap:8}}>
              <Btn variant='teal' style={{flex:1,justifyContent:'center'}} onClick={()=>approve(selected.id)}>✓ Approve Driver</Btn>
              <Btn variant='danger' style={{flex:1,justifyContent:'center'}} onClick={()=>reject(selected.id)}>Reject</Btn>
            </div>
          )}
        </div>
      )}

      {lightbox&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setLightbox(null)}>
          <img src={lightbox} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:'var(--r-lg)'}} alt='photo' />
          <button style={{position:'absolute',top:20,right:20,background:'transparent',border:'none',color:'#fff',fontSize:28,cursor:'pointer'}}>×</button>
        </div>
      )}
    </AdminShell>
  )
}
