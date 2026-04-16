'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Btn, StatCard } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

const PLANS = [
  { id:'starter', label:'Starter', price:'฿2,000/mo' },
  { id:'growth', label:'Growth', price:'฿4,000/mo' },
  { id:'pro', label:'Pro', price:'฿6,000/mo' },
]

export default function SubscriptionsPage() {
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
  const [dmcs, setDmcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ dmc_id:'', plan:'starter', months:1, notes:'' })
  const [activating, setActivating] = useState(false)

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
    const [s, d] = await Promise.all([
      fetch(SUPA+'/rest/v1/subscriptions?select=*,dmc_users(company_name,email)&order=activated_at.desc', { headers: H() }).then(r=>r.json()),
      fetch(SUPA+'/rest/v1/dmc_users?select=id,company_name,email&order=company_name', { headers: H() }).then(r=>r.json()),
    ])
    setSubs(Array.isArray(s)?s:[])
    setDmcs(Array.isArray(d)?d:[])
    setLoading(false)
  }

  async function activate() {
    setActivating(true)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + form.months)
    const priceMap: Record<string,number> = { starter:2000, growth:4000, pro:6000 }
    await fetch(SUPA+'/rest/v1/subscriptions', { method:'POST', headers:{...H(),'Content-Type':'application/json','Prefer':'return=minimal'}, body: JSON.stringify({ dmc_id:form.dmc_id, plan:form.plan, price_thb:priceMap[form.plan]*form.months, start_date:startDate.toISOString().split('T')[0], end_date:endDate.toISOString().split('T')[0], notes:form.notes }) })
    await fetch(SUPA+'/rest/v1/dmc_users?id=eq.'+form.dmc_id, { method:'PATCH', headers:{...H(),'Content-Type':'application/json'}, body: JSON.stringify({ subscription_plan:form.plan, subscription_status:'active' }) })
    setShowModal(false)
    setActivating(false)
    load()
  }

  const active = subs.filter(s=>new Date(s.end_date)>new Date()).length
  const trial = subs.filter(s=>s.plan==='trial').length
  const mrr = subs.filter(s=>new Date(s.end_date)>new Date()).reduce((a,s)=>a+(s.price_thb||0),0)
  const priceMap: Record<string,number> = { starter:2000, growth:4000, pro:6000 }
  const total = priceMap[form.plan] * form.months

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      <PageHeader title='Subscriptions' sub='Manual bank transfer activation' actions={<Btn variant='teal' size='sm' onClick={()=>setShowModal(true)}>+ Activate Plan</Btn>} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        <StatCard label='Total Subs' value={subs.length} color='var(--text-2)' />
        <StatCard label='Active' value={active} color='var(--teal)' />
        <StatCard label='Trial' value={trial} color='var(--purple)' />
        <StatCard label='MRR' value={'฿'+mrr.toLocaleString()} color='var(--amber)' />
      </div>
      <Panel>
        {subs.length===0?(
          <div style={{padding:'40px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>No subscriptions yet</div>
        ):(
          <Table columns={['COMPANY','EMAIL','PLAN','AMOUNT','START','END','STATUS']}>
            {subs.map(s=>{
              const isActive = new Date(s.end_date)>new Date()
              return (
                <TR key={s.id}>
                  <TD><span style={{fontWeight:500}}>{(s.dmc_users as any)?.company_name||'—'}</span></TD>
                  <TD muted>{(s.dmc_users as any)?.email||'—'}</TD>
                  <TD mono muted style={{textTransform:'capitalize' as const}}>{s.plan}</TD>
                  <TD mono style={{color:'var(--green)'}}>฿{(s.price_thb||0).toLocaleString()}</TD>
                  <TD muted>{s.start_date?new Date(s.start_date).toLocaleDateString('en-GB'):'—'}</TD>
                  <TD muted>{s.end_date?new Date(s.end_date).toLocaleDateString('en-GB'):'—'}</TD>
                  <TD><Badge status={isActive?'active':'expired'} /></TD>
                </TR>
              )
            })}
          </Table>
        )}
      </Panel>
      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:14,width:'100%',maxWidth:440,padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:600,color:'var(--text-1)'}}>Activate Subscription</div>
              <button onClick={()=>setShowModal(false)} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',width:28,height:28,cursor:'pointer',color:'var(--text-2)',fontSize:14}}>×</button>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase' as const,letterSpacing:1,marginBottom:6}}>DMC Company</div>
              <select value={form.dmc_id} onChange={e=>setForm({...form,dmc_id:e.target.value})} style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'8px 12px',fontSize:13,color:'var(--text-1)',outline:'none'}}>
                <option value=''>Select DMC...</option>
                {dmcs.map(d=><option key={d.id} value={d.id}>{d.company_name} ({d.email})</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase' as const,letterSpacing:1,marginBottom:8}}>Plan</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                {PLANS.map(p=>(
                  <button key={p.id} onClick={()=>setForm({...form,plan:p.id})} style={{padding:'9px 8px',border:'1px solid',borderRadius:'var(--r)',cursor:'pointer',textAlign:'left' as const,background:form.plan===p.id?'var(--teal-10)':'var(--bg-elevated)',borderColor:form.plan===p.id?'var(--teal)':'var(--border)',transition:'all 0.12s'}}>
                    <div style={{fontSize:12,fontWeight:500,color:form.plan===p.id?'var(--teal)':'var(--text-1)'}}>{p.label}</div>
                    <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)'}}>{p.price}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              <div>
                <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase' as const,letterSpacing:1,marginBottom:6}}>Months</div>
                <input type='number' min={1} max={24} value={form.months} onChange={e=>setForm({...form,months:parseInt(e.target.value)||1})} style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'8px 12px',fontSize:13,color:'var(--text-1)',outline:'none'}} />
              </div>
              <div>
                <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase' as const,letterSpacing:1,marginBottom:6}}>Notes</div>
                <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder='Payment ref...' style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'8px 12px',fontSize:13,color:'var(--text-1)',outline:'none'}} />
              </div>
            </div>
            <div style={{background:'var(--teal-10)',border:'1px solid var(--teal-20)',borderRadius:'var(--r)',padding:'10px 14px',marginBottom:16,fontSize:12,fontFamily:'var(--font-mono)',color:'var(--teal)'}}>
              Total: ฿{total.toLocaleString()} · {form.months} month(s)
            </div>
            <div style={{display:'flex',gap:8}}>
              <Btn variant='secondary' style={{flex:1,justifyContent:'center'}} onClick={()=>setShowModal(false)}>Cancel</Btn>
              <Btn variant='teal' style={{flex:1,justifyContent:'center'}} disabled={!form.dmc_id||activating} onClick={activate}>{activating?'Activating...':'✓ Activate'}</Btn>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
