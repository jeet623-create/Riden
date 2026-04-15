'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Btn, Empty, Input } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' })

export default function OperatorsPage() {
  const router = useRouter()
  const [ops, setOps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any|null>(null)
  const [vehicles, setVehicles] = useState<any[]>([])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return }
      sb.from('admin_users').select('id').eq('id', user.id).single().then(({ data }) => {
        if (!data) router.push('/admin/login')
        else load()
      })
    })
  }, [])

  async function load() {
    setLoading(true)
    const r = await fetch(`${SUPA}/rest/v1/operators?select=*&order=created_at.desc`, { headers: H() })
    const d = await r.json()
    setOps(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function selectOp(op: any) {
    setSelected(op)
    const r = await fetch(`${SUPA}/rest/v1/vehicles?operator_id=eq.${op.id}&select=*`, { headers: H() })
    const d = await r.json()
    setVehicles(Array.isArray(d) ? d : [])
  }

  async function verify(id: string) {
    await fetch(`${SUPA}/rest/v1/operators?id=eq.${id}`, { method: 'PATCH', headers: H(), body: JSON.stringify({ is_verified: true, status: 'active' }) })
    await load(); setSelected(null)
  }

  async function suspend(id: string) {
    await fetch(`${SUPA}/rest/v1/operators?id=eq.${id}`, { method: 'PATCH', headers: H(), body: JSON.stringify({ status: 'suspended' }) })
    await load(); setSelected(null)
  }

  const filtered = ops.filter(o => !search || o.company_name?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'flex-end',backdropFilter:'blur(4px)'}} onClick={() => setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:440,height:'100vh',background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',padding:28,overflowY:'auto',display:'flex',flexDirection:'column',gap:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:600}}>{selected.company_name}</div>
              <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',fontSize:18}}>×</button>
            </div>
            <div style={{background:'var(--bg-elevated)',borderRadius:'var(--r)',padding:16,display:'flex',flexDirection:'column',gap:10}}>
              {[['Phone',selected.phone??'—'],['Base',selected.base_location??'—'],['Also Driver',selected.is_also_driver?'Yes':'No'],['Verified',selected.is_verified?'Yes':'No'],['Status',selected.status??'—'],].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                  <span style={{color:'var(--text-3)'}}>{k}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:12}}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-3)',letterSpacing:1,marginBottom:8}}>FLEET ({vehicles.length})</div>
              {vehicles.length === 0 ? <div style={{fontSize:12,color:'var(--text-3)'}}>No vehicles</div> : (
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {vehicles.map(v=>(
                    <div key={v.id} style={{background:'var(--bg-elevated)',borderRadius:'var(--r)',padding:'10px 12px',fontSize:12}}>
                      <span style={{color:'var(--text-1)'}}>{v.type?.replace(/_/g,' ')} · {v.plate}</span>
                      <span style={{color:'var(--text-3)',marginLeft:8}}>{v.brand_model??''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {!selected.is_verified && <Btn variant="teal" onClick={()=>verify(selected.id)}>✓ Verify Operator</Btn>}
              {selected.status !== 'suspended' && <Btn variant="danger" onClick={()=>suspend(selected.id)}>Suspend</Btn>}
            </div>
          </div>
        </div>
      )}

      <PageHeader title="Operators" sub={`${ops.length} fleet owners registered`}
        actions={<Input value={search} onChange={setSearch} placeholder="Search operator..." style={{width:220}} />}
      />

      <Panel>
        {filtered.length === 0 ? <Empty icon="🚐" message="No operators found" /> : (
          <Table columns={['COMPANY','PHONE','BASE','ALSO DRIVER','VERIFIED','STATUS','JOINED','']}>
            {filtered.map(o=>(
              <TR key={o.id} onClick={()=>selectOp(o)}>
                <TD><span style={{fontWeight:500}}>{o.company_name}</span></TD>
                <TD mono muted>{o.phone??'—'}</TD>
                <TD muted>{o.base_location??'—'}</TD>
                <TD muted>{o.is_also_driver?'Yes':'No'}</TD>
                <TD muted>{o.is_verified?'Yes':'No'}</TD>
                <TD><Badge status={o.status??'inactive'} /></TD>
                <TD muted>{new Date(o.created_at).toLocaleDateString('en-GB')}</TD>
                <TD><Btn variant="ghost" size="sm">Details →</Btn></TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}
