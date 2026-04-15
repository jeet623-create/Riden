'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Btn, Empty } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' })
const PRICES: Record<string,number> = { starter:2000, growth:4000, pro:6000 }
export default function SubscriptionsPage() {
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
  const [dmcs, setDmcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<{dmcId:string;plan:string;months:string;notes:string}|null>(null)
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
    const [sr, dr] = await Promise.all([
      fetch(SUPA + '/rest/v1/subscriptions?select=*,dmc_users(company_name,email)&order=activated_at.desc', { headers: H() }),
      fetch(SUPA + '/rest/v1/dmc_users?select=id,company_name,email,subscription_status&order=company_name', { headers: H() }),
    ])
    const [sd, dd] = await Promise.all([sr.json(), dr.json()])
    setSubs(Array.isArray(sd) ? sd : [])
    setDmcs(Array.isArray(dd) ? dd : [])
    setLoading(false)
  }
  async function activate() {
    if (!form?.dmcId || !form.plan) return
    setActivating(true)
    const months = parseInt(form.months) || 1
    const start = new Date()
    const end = new Date(start); end.setMonth(end.getMonth() + months)
    const price = (PRICES[form.plan] || 0) * months
    await fetch(SUPA + '/rest/v1/subscriptions', { method:'POST', headers:H(), body:JSON.stringify({ dmc_id:form.dmcId, plan:form.plan, price_thb:price, start_date:start.toISOString().slice(0,10), end_date:end.toISOString().slice(0,10), notes:form.notes, activated_at:new Date().toISOString() }) })
    await fetch(SUPA + '/rest/v1/dmc_users?id=eq.' + form.dmcId, { method:'PATCH', headers:H(), body:JSON.stringify({ subscription_plan:form.plan, subscription_status:'active' }) })
    setActivating(false); setForm(null); await load()
  }
  if (loading) return <AdminShell><Loading /></AdminShell>
  return (
    <AdminShell>
      {form !== null && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}} onClick={()=>setForm(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:440,background:'var(--bg-surface)',borderRadius:16,border:'1px solid var(--border)',padding:28,display:'flex',flexDirection:'column',gap:16}}>
            <div style={{fontSize:16,fontWeight:600}}>Activate Subscription</div>
            <div>
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-3)',letterSpacing:1,marginBottom:6}}>DMC COMPANY</div>
              <select value={form.dmcId} onChange={e=>setForm(f=>f?{...f,dmcId:e.target.value}:f)} style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'8px 12px',fontSize:13,color:'var(--text-1)',fontFamily:'var(--font-body)',outline:'none'}}>
                <option value="">Select DMC...</option>
                {dmcs.map(d=><option key={d.id} value={d.id}>{d.company_name} ({d.email})</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-3)',letterSpacing:1,marginBottom:8}}>PLAN</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {['starter','growth','pro'].map(p=>(
                  <button key={p} onClick={()=>setForm(f=>f?{...f,plan:p}:f)} style={{padding:'10px',borderRadius:'var(--r)',border:'1px solid ' + (form.plan===p?'var(--teal)':'var(--border)'),background:form.plan===p?'var(--teal-10)':'var(--bg-elevated)',color:form.plan===p?'var(--teal)':'var(--text-2)',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:13,textTransform:'capitalize' as const}}>
                    <div style={{fontWeight:600}}>{p}</div>
                    <div style={{fontSize:11,fontFamily:'var(--font-mono)',marginTop:2}}>฿{PRICES[p].toLocaleString()}/mo</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-3)',letterSpacing:1,marginBottom:6}}>MONTHS</div>
              <input type="number" min="1" max="24" value={form.months} onChange={e=>setForm(f=>f?{...f,months:e.target.value}:f)} style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'8px 12px',fontSize:13,color:'var(--text-1)',fontFamily:'var(--font-mono)',outline:'none'}} />
            </div>
            <div>
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text-3)',letterSpacing:1,marginBottom:6}}>NOTES</div>
              <input value={form.notes} onChange={e=>setForm(f=>f?{...f,notes:e.target.value}:f)} placeholder="Payment ref, notes..." style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'8px 12px',fontSize:13,color:'var(--text-1)',fontFamily:'var(--font-body)',outline:'none'}} />
            </div>
            {form.plan && form.dmcId && <div style={{background:'var(--teal-10)',border:'1px solid var(--teal-20)',borderRadius:'var(--r)',padding:'10px 14px',fontSize:12,fontFamily:'var(--font-mono)',color:'var(--teal)'}}>Total: ฿{((PRICES[form.plan]||0)*(parseInt(form.months)||1)).toLocaleString()} · {parseInt(form.months)||1} month{parseInt(form.months)>1?'s':''}</div>}
            <div style={{display:'flex',gap:10}}>
              <Btn variant="secondary" onClick={()=>setForm(null)} style={{flex:1}}>Cancel</Btn>
              <Btn variant="teal" onClick={activate} disabled={!form.dmcId||!form.plan||activating} style={{flex:1}}>{activating?'Activating...':'✓ Activate'}</Btn>
            </div>
          </div>
        </div>
      )}
      <PageHeader title="Subscriptions" sub="Manual bank transfer activation" actions={<Btn variant="teal" onClick={()=>setForm({dmcId:'',plan:'',months:'1',notes:''})}>+ Activate Plan</Btn>} />
      <Panel>
        {subs.length === 0 ? <Empty icon="💳" message="No subscriptions yet" /> : (
          <Table columns={['COMPANY','EMAIL','PLAN','AMOUNT','START','END','STATUS']}>
            {subs.map(s => {
              const expired = new Date(s.end_date) < new Date()
              return (
                <TR key={s.id}>
                  <TD><span style={{fontWeight:500}}>{(s.dmc_users as any)?.company_name??'—'}</span></TD>
                  <TD muted>{(s.dmc_users as any)?.email??'—'}</TD>
                  <TD mono muted style={{textTransform:'capitalize' as const}}>{s.plan}</TD>
                  <TD mono style={{color:'var(--green)'}}>฿{(s.price_thb||0).toLocaleString()}</TD>
                  <TD muted>{s.start_date?new Date(s.start_date).toLocaleDateString('en-GB'):'—'}</TD>
                  <TD muted>{s.end_date?new Date(s.end_date).toLocaleDateString('en-GB'):'—'}</TD>
                  <TD><Badge status={expired?'expired':'active'} /></TD>
                </TR>
              )
            })}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}
