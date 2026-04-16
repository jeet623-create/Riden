'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Input, Btn, StatCard } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

export default function AdminDMCs() {
  const router = useRouter()
  const [dmcs, setDmcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)

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
    const r = await fetch(SUPA+'/rest/v1/dmc_users?select=*&order=created_at.desc', { headers: H() })
    const d = await r.json()
    setDmcs(Array.isArray(d)?d:[])
    setLoading(false)
  }

  const filtered = dmcs.filter(d=>{
    const ms = !search||d.company_name?.toLowerCase().includes(search.toLowerCase())||d.email?.toLowerCase().includes(search.toLowerCase())
    const mf = filter==='all'||d.subscription_status===filter
    return ms&&mf
  })

  const counts = { all:dmcs.length, trial:dmcs.filter(d=>d.subscription_status==='trial').length, active:dmcs.filter(d=>d.subscription_status==='active').length, expired:dmcs.filter(d=>d.subscription_status==='expired').length, suspended:dmcs.filter(d=>d.subscription_status==='suspended').length }

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      <PageHeader title='DMC Management' sub={dmcs.length+' companies registered'} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        <StatCard label='Total' value={counts.all} color='var(--text-2)' />
        <StatCard label='Active' value={counts.active} color='var(--teal)' />
        <StatCard label='Trial' value={counts.trial} color='var(--purple)' />
        <StatCard label='Expired' value={counts.expired} color='var(--red)' />
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap' as const,gap:8}}>
        <div style={{display:'flex',gap:6}}>
          {['all','trial','active','expired','suspended'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:500,cursor:'pointer',border:'1px solid',transition:'all 0.12s',background:filter===f?'var(--teal-10)':'transparent',borderColor:filter===f?'var(--teal-20)':'var(--border)',color:filter===f?'var(--teal)':'var(--text-3)',textTransform:'capitalize' as const,fontFamily:'var(--font-body)'}}>{f}</button>
          ))}
        </div>
        <Input value={search} onChange={setSearch} placeholder='Search company or email...' style={{width:240}} />
      </div>
      <Panel>
        {filtered.length===0?(
          <div style={{padding:'40px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>No DMCs found</div>
        ):(
          <Table columns={['COMPANY','EMAIL','COUNTRY','PLAN','STATUS','JOINED']}>
            {filtered.map(d=>(
              <TR key={d.id} onClick={()=>setSelected(d)}>
                <TD><span style={{fontWeight:500}}>{d.company_name}</span></TD>
                <TD muted>{d.email}</TD>
                <TD muted>{d.country||'—'}</TD>
                <TD mono muted style={{textTransform:'capitalize' as const}}>{d.subscription_plan||'free'}</TD>
                <TD><Badge status={d.subscription_status||'trial'} /></TD>
                <TD muted>{d.created_at?new Date(d.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—'}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
      {selected&&(
        <div style={{position:'fixed',top:0,right:0,bottom:0,width:420,background:'var(--bg-surface)',borderLeft:'1px solid var(--border)',zIndex:100,overflowY:'auto' as const,padding:24,boxShadow:'-4px 0 24px rgba(0,0,0,0.3)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
            <div>
              <div style={{fontSize:16,fontWeight:600,color:'var(--text-1)',marginBottom:4}}>{selected.company_name}</div>
              <Badge status={selected.line_user_id?'active':'inactive'} label={selected.line_user_id?'● LINE':'○ No LINE'} />
            </div>
            <button onClick={()=>setSelected(null)} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',width:28,height:28,cursor:'pointer',color:'var(--text-2)',fontSize:14}}>×</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            {[['Email',selected.email],['Country',selected.country||'—'],['Contact',selected.contact_person||'—'],['Phone',selected.phone||'—'],['Address',selected.address||'—'],['City',selected.city||'—'],['Plan',selected.subscription_plan||'—'],['Status',selected.subscription_status||'—']].map(([k,v])=>(
              <div key={k as string}>
                <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase' as const,letterSpacing:1,marginBottom:3}}>{k}</div>
                <div style={{fontSize:13,color:'var(--text-1)'}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
            <Btn variant='teal' style={{width:'100%',justifyContent:'center'}}>✓ Activate Account</Btn>
            <Btn variant='danger' style={{width:'100%',justifyContent:'center'}}>Suspend Account</Btn>
            <Btn variant='secondary' style={{width:'100%',justifyContent:'center'}}>Reset Password</Btn>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
