'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Btn, Empty, Input } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' })
export default function AdminDmcPage() {
  const router = useRouter()
  const [dmcs, setDmcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any|null>(null)
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
    const r = await fetch(SUPA + '/rest/v1/dmc_users?select=*&order=created_at.desc', { headers: H() })
    const d = await r.json()
    setDmcs(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  async function setStatus(id: string, status: string) {
    await fetch(SUPA + '/rest/v1/dmc_users?id=eq.' + id, { method:'PATCH', headers:H(), body:JSON.stringify({ subscription_status: status }) })
    await load(); setSelected(null)
  }
  const filtered = dmcs.filter(d => !search || d.company_name?.toLowerCase().includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <AdminShell><Loading /></AdminShell>
  return (
    <AdminShell>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'flex-end',backdropFilter:'blur(4px)'}} onClick={()=>setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:420,height:'100vh',background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',padding:28,overflowY:'auto',display:'flex',flexDirection:'column',gap:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:600}}>{selected.company_name}</div>
              <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',fontSize:18}}>x</button>
            </div>
            <div style={{background:'var(--bg-elevated)',borderRadius:'var(--r)',padding:16,display:'flex',flexDirection:'column',gap:10}}>
              {[['Email',selected.email],['Country',selected.country||'No data'],['Plan',selected.subscription_plan||'No data'],['Status',selected.subscription_status||'No data'],['Joined',new Date(selected.created_at).toLocaleDateString('en-GB')]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                  <span style={{color:'var(--text-3)'}}>{k}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:12}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {selected.subscription_status !== 'active' && <Btn variant="teal" onClick={()=>setStatus(selected.id,'active')}>Activate Account</Btn>}
              {selected.subscription_status !== 'suspended' && <Btn variant="danger" onClick={()=>setStatus(selected.id,'suspended')}>Suspend Account</Btn>}
            </div>
          </div>
        </div>
      )}
      <PageHeader title="DMC Management" sub={dmcs.length + ' companies registered'}
        actions={<Input value={search} onChange={setSearch} placeholder="Search company or email..." style={{width:240}} />}
      />
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {['all','trial','active','expired','suspended'].map(f=>(
          <button key={f} onClick={()=>{}} style={{padding:'6px 14px',borderRadius:20,border:'1px solid var(--border)',background:'transparent',color:'var(--text-3)',fontSize:12,cursor:'pointer',fontFamily:'var(--font-body)',textTransform:'capitalize' as const}}>{f}</button>
        ))}
      </div>
      <Panel>
        {filtered.length===0?<Empty icon="CompanyIcon" message="No DMCs found" />:(
          <Table columns={['COMPANY','EMAIL','COUNTRY','PLAN','STATUS','JOINED','']}>
            {filtered.map(d=>(
              <TR key={d.id} onClick={()=>setSelected(d)}>
                <TD><span style={{fontWeight:500}}>{d.company_name}</span></TD>
                <TD muted>{d.email}</TD>
                <TD muted>{d.country||'No data'}</TD>
                <TD mono muted>{d.subscription_plan||'No data'}</TD>
                <TD><Badge status={d.subscription_status||'inactive'} /></TD>
                <TD muted>{new Date(d.created_at).toLocaleDateString('en-GB')}</TD>
                <TD><Btn variant="ghost" size="sm">Details</Btn></TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}