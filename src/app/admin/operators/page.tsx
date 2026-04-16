'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Input, Btn, StatCard } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

export default function OperatorsPage() {
  const router = useRouter()
  const [ops, setOps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [fleet, setFleet] = useState<any[]>([])

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
    const r = await fetch(SUPA+'/rest/v1/operators?select=*&order=created_at.desc', { headers: H() })
    const d = await r.json()
    setOps(Array.isArray(d)?d:[])
    setLoading(false)
  }

  async function loadFleet(opId: string) {
    const r = await fetch(SUPA+'/rest/v1/vehicles?operator_id=eq.'+opId+'&select=*', { headers: H() })
    const d = await r.json()
    setFleet(Array.isArray(d)?d:[])
  }

  const filtered = ops.filter(o => {
    const ms = !search || o.company_name?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search)
    const mf = filter==='all' || o.status===filter
    return ms && mf
  })

  const counts = { all:ops.length, verified:ops.filter(o=>o.verified_at).length, alsoDriver:ops.filter(o=>o.is_also_driver).length }

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      <PageHeader title='Operators' sub={ops.length+' fleet owners registered'} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        <StatCard label='Total' value={counts.all} color='var(--text-2)' />
        <StatCard label='Verified' value={counts.verified} color='var(--teal)' />
        <StatCard label='Also Drivers' value={counts.alsoDriver} color='var(--blue)' />
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,gap:8}}>
        <div style={{display:'flex',gap:6}}>
          {['all','active','inactive','suspended'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:500,cursor:'pointer',border:'1px solid',transition:'all 0.12s',background:filter===f?'var(--teal-10)':'transparent',borderColor:filter===f?'var(--teal-20)':'var(--border)',color:filter===f?'var(--teal)':'var(--text-3)',textTransform:'capitalize' as const,fontFamily:'var(--font-body)'}}>{f}</button>
          ))}
        </div>
        <Input value={search} onChange={setSearch} placeholder='Search operator...' style={{width:220}} />
      </div>
      <Panel>
        {filtered.length===0?(
          <div style={{padding:'40px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>No operators found</div>
        ):(
          <Table columns={['COMPANY','CONTACT','PHONE','BASE','VERIFIED','STATUS']}>
            {filtered.map(o=>(
              <TR key={o.id} onClick={()=>{ setSelected(o); loadFleet(o.id); }}>
                <TD>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:32,height:32,borderRadius:'var(--r)',background:'var(--teal-10)',border:'1px solid var(--teal-20)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:'var(--teal)',flexShrink:0}}>{o.company_name?.charAt(0)?.toUpperCase()||'?'}</div>
                    <span style={{fontWeight:500}}>{o.company_name}</span>
                  </div>
                </TD>
                <TD muted>{o.contact_name||'—'}</TD>
                <TD mono muted>{o.phone||'—'}</TD>
                <TD muted>{o.base_location||'—'}</TD>
                <TD muted>{o.verified_at?<span style={{color:'var(--teal)'}}>✓ Verified</span>:'—'}</TD>
                <TD><Badge status={o.status||'inactive'} /></TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
      {selected&&(
        <div style={{position:'fixed',top:0,right:0,bottom:0,width:440,background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',zIndex:100,overflowY:'auto' as const,padding:24,boxShadow:'-4px 0 24px rgba(0,0,0,0.3)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
            <div style={{fontSize:16,fontWeight:600,color:'var(--text-1)'}}>{selected.company_name}</div>
            <button onClick={()=>setSelected(null)} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',width:28,height:28,cursor:'pointer',color:'var(--text-2)',fontSize:14}}>×</button>
          </div>
          <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase' as const,letterSpacing:1,marginBottom:10}}>Operator Information</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            {[['Contact',selected.contact_name||'—'],['Phone',selected.phone||'—'],['Base Location',selected.base_location||'—'],['Also Driver',selected.is_also_driver?'Yes':'No'],['Verified',selected.verified_at?'✓ Certified':'Pending'],['Status',selected.status||'—']].map(([k,v])=>(
              <div key={k as string}>
                <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase' as const,letterSpacing:1,marginBottom:3}}>{k}</div>
                <div style={{fontSize:13,color:'var(--text-1)'}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <span style={{fontSize:13,fontWeight:500,color:'var(--text-1)'}}>Fleet Inventory ({fleet.length})</span>
            </div>
            {fleet.length===0?<div style={{fontSize:12,color:'var(--text-3)',padding:'12px 0'}}>No vehicles</div>:(
              <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
                {fleet.map(v=>(
                  <div key={v.id} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:16}}>🚐</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500}}>{v.brand_model||v.type}</div>
                      <div style={{fontSize:11,color:'var(--text-3)'}}>{v.plate}</div>
                    </div>
                    <Badge status='active' label={v.type?.replace(/_/g,' ')} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn variant='teal' style={{flex:1,justifyContent:'center'}}>✓ Verify Operator</Btn>
            <Btn variant='danger' style={{flex:1,justifyContent:'center'}}>Suspend</Btn>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
