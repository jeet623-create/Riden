'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { StatCard, Panel, PanelHeader, Table, TR, TD, Loading, PageHeader, Btn, Empty } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
const PRICES: Record<string,number> = { starter:2000, growth:4000, pro:6000 }
export default function FinancePage() {
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
  const [dmcs, setDmcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      fetch(SUPA + '/rest/v1/dmc_users?select=id,subscription_plan,subscription_status', { headers: H() }),
    ])
    const [sd, dd] = await Promise.all([sr.json(), dr.json()])
    setSubs(Array.isArray(sd) ? sd : [])
    setDmcs(Array.isArray(dd) ? dd : [])
    setLoading(false)
  }
  function exportCSV() {
    const rows = subs.map(s => [(s.dmc_users as any)?.company_name,(s.dmc_users as any)?.email,s.plan,s.price_thb,s.start_date,s.end_date].join(','))
    const csv = ['Company,Email,Plan,Amount,Start,End',...rows].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'riden-finance-' + new Date().toISOString().slice(0,7) + '.csv'
    a.click()
  }
  const activeDmcs = dmcs.filter(d => d.subscription_status === 'active')
  const mrr = activeDmcs.reduce((s, d) => s + (PRICES[d.subscription_plan] || 0), 0)
  const total = subs.reduce((s, sub) => s + (sub.price_thb || 0), 0)
  const breakdown: Record<string,number> = { starter: 0, growth: 0, pro: 0 }
  activeDmcs.forEach(d => { if (d.subscription_plan in breakdown) breakdown[d.subscription_plan]++ })
  if (loading) return <AdminShell><Loading /></AdminShell>
  return (
    <AdminShell>
      <PageHeader title="Finance" sub="Revenue and subscription overview" actions={<Btn variant="secondary" onClick={exportCSV}>Export CSV</Btn>} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        <StatCard label="MRR" value={'฿' + mrr.toLocaleString()} icon="📈" color="var(--teal)" sub="monthly recurring" />
        <StatCard label="Total Collected" value={'฿' + total.toLocaleString()} icon="💰" color="var(--green)" sub="all time" />
        <StatCard label="Active Subscribers" value={activeDmcs.length} icon="✓" color="var(--blue)" sub="paying now" />
        <StatCard label="On Trial" value={dmcs.filter(d=>d.subscription_status==='trial').length} icon="⏱" color="var(--amber)" sub="converting" />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
        <Panel>
          <PanelHeader title="Plan Breakdown" sub="Active subscribers by plan" />
          <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:14}}>
            {Object.entries(breakdown).map(([plan, count]) => (
              <div key={plan} style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:80,fontSize:12,color:'var(--text-2)',textTransform:'capitalize' as const,fontWeight:500}}>{plan}</div>
                <div style={{flex:1,height:4,background:'var(--bg-elevated)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:(activeDmcs.length?count/activeDmcs.length*100:0)+'%',background:'var(--teal)',borderRadius:2}} />
                </div>
                <div style={{fontSize:13,fontFamily:'var(--font-mono)',minWidth:20}}>{count}</div>
                <div style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-3)',minWidth:80}}>฿{(PRICES[plan]*count).toLocaleString()}/mo</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Recent Payments" sub="Latest activations" />
          <div style={{padding:'4px 0'}}>
            {subs.slice(0,5).map(s=>(
              <div key={s.id} style={{padding:'12px 24px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{(s.dmc_users as any)?.company_name||'—'}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:2,textTransform:'capitalize' as const}}>{s.plan} · {s.start_date?new Date(s.start_date).toLocaleDateString('en-GB'):'—'}</div>
                </div>
                <div style={{fontSize:14,fontFamily:'var(--font-mono)',color:'var(--green)',fontWeight:500}}>+฿{(s.price_thb||0).toLocaleString()}</div>
              </div>
            ))}
            {subs.length===0&&<Empty icon="💳" message="No payments yet" />}
          </div>
        </Panel>
      </div>
      <Panel>
        <PanelHeader title="All Transactions" sub={subs.length + ' records'} />
        {subs.length===0?<Empty icon="💳" message="No transactions yet" />:(
          <Table columns={['COMPANY','EMAIL','PLAN','AMOUNT','START','END']}>
            {subs.map(s=>(
              <TR key={s.id}>
                <TD><span style={{fontWeight:500}}>{(s.dmc_users as any)?.company_name||'—'}</span></TD>
                <TD muted>{(s.dmc_users as any)?.email||'—'}</TD>
                <TD mono muted style={{textTransform:'capitalize' as const}}>{s.plan}</TD>
                <TD mono style={{color:'var(--green)'}}>฿{(s.price_thb||0).toLocaleString()}</TD>
                <TD muted>{s.start_date?new Date(s.start_date).toLocaleDateString('en-GB'):'—'}</TD>
                <TD muted>{s.end_date?new Date(s.end_date).toLocaleDateString('en-GB'):'—'}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}