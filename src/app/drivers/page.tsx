'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DmcShell } from '@/components/DmcShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Empty, Input } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
const VL: Record<string,string> = { sedan:'Sedan',suv:'SUV',van_9:'Van 9',van_12:'Van 12',minibus_15:'Minibus 15',minibus_20:'Minibus 20',coach_30:'Coach 30+',pickup:'Pickup' }
export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      load()
    })
  }, [])
  async function load() {
    setLoading(true)
    const r = await fetch(SUPA + '/rest/v1/drivers?is_active=eq.true&is_verified=eq.true&select=*&order=full_name', { headers: H() })
    const d = await r.json()
    setDrivers(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  const filtered = drivers.filter(d => !search || d.full_name?.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <DmcShell><Loading /></DmcShell>
  return (
    <DmcShell>
      <PageHeader title="Drivers" sub={drivers.length + ' verified drivers'} actions={<Input value={search} onChange={setSearch} placeholder="Search driver..." style={{width:200}} />} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
        {filtered.length===0?<div style={{gridColumn:'1/-1'}}><Panel><Empty icon="🧑‍✈️" message="No drivers available" /></Panel></div>:(
          filtered.map(d=>(
            <div key={d.id} style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',transition:'border-color 0.15s'}} onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--border-strong)')} onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)') }>
              {d.vehicle_photo_url
                ?<img src={d.vehicle_photo_url} style={{width:'100%',height:140,objectFit:'cover'}} alt="vehicle" />
                :<div style={{height:140,background:'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,opacity:0.3}}>🚗</div>
              }
              <div style={{padding:'12px 14px'}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{d.full_name}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8}}>{VL[d.vehicle_type]||d.vehicle_type} · {d.vehicle_plate}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:11,color:'var(--text-3)'}}>📍 {d.base_location||'—'}</span>
                  <Badge status={d.is_available?'active':'inactive'} label={d.is_available?'Available':'Busy'} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DmcShell>
  )
}