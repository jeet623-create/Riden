'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { StatCard, Panel, PanelHeader, Table, TR, TD, Loading, PageHeader, Btn } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

export default function FinancePage() {
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
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
    const r = await fetch(SUPA+'/rest/v1/subscriptions?select=*,dmc_users(company_name,email)&order=activated_at.desc', { headers: H() })
    const d = await r.json()
    setSubs(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  const mrr = subs.filter(s=>{
    const end = new Date(s.end_date)
    return end > new Date()
  }).reduce((acc,s)=>acc+(s.price_thb||0),0)

  const totalCollected = subs.reduce((acc,s)=>acc+(s.price_thb||0),0)
  const activeSubs = subs.filter(s=>new Date(s.end_date)>new Date()).length
  const onTrial = subs.filter(s=>s.plan==='trial').length

  const planCounts = { starter: subs.filter(s=>s.plan==='starter').length, growth: subs.filter(s=>s.plan==='growth').length, pro: subs.filter(s=>s.plan==='pro').length }
  const total = planCounts.starter + planCounts.growth + planCounts.pro || 1

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      <PageHeader title='Finance' sub='Revenue and subscription overview' actions={<Btn variant='secondary' size='sm'>↓ Export CSV</Btn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <StatCard label='MRR' value={'฿'+mrr.toLocaleString()} sub='monthly recurring' icon='📈' color='var(--teal)' />
        <StatCard label='Total Collected' value={'฿'+totalCollected.toLocaleString()} sub='all time' icon='💰' color='var(--green)' />
        <StatCard label='Active Subscribers' value={activeSubs} sub='paying now' icon='✓' color='var(--blue)' />
        <StatCard label='On Trial' value={onTrial} sub='converting' icon='⏱' color='var(--purple)' />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
        <Panel>
          <PanelHeader title='Monthly Revenue' sub='Last 6 months' />
          <div style={{ padding:'20px 24px', display:'flex', alignItems:'flex-end', gap:8, height:140 }}>
            {['Nov','Dec','Jan','Feb','Mar','Apr'].map((m,i)=>(
              <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ width:'100%', background: i===5?'var(--teal)':'var(--bg-elevated)', borderRadius:'4px 4px 0 0', height:[30,45,35,60,50,80][i], transition:'height 0.3s' }} />
                <span style={{ fontSize:9, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>{m}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title='Plan Breakdown' sub='Active subscribers by plan' />
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
            {[['Starter',planCounts.starter,'฿2,000/mo'],['Growth',planCounts.growth,'฿4,000/mo'],['Pro',planCounts.pro,'฿6,000/mo']].map(([label,count,price])=>(
              <div key={label as string} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, color:'var(--text-2)', width:60 }}>{label}</span>
                <div style={{ flex:1, height:6, background:'var(--bg-elevated)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:((count as number)/total*100)+'%', background:'var(--teal)', borderRadius:3 }} />
                </div>
                <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-3)', width:24, textAlign:'right' as const }}>{count as number}</span>
                <span style={{ fontSize:11, color:'var(--text-3)', width:80 }}>{price}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title='All Transactions' sub={subs.length+' records'} />
        {subs.length===0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'var(--text-3)', fontSize:13 }}>No transactions yet</div>
        ) : (
          <Table columns={['COMPANY','EMAIL','PLAN','AMOUNT','START','END']}>
            {subs.map(s=>(
              <TR key={s.id}>
                <TD><span style={{ fontWeight:500 }}>{(s.dmc_users as any)?.company_name||'—'}</span></TD>
                <TD muted>{(s.dmc_users as any)?.email||'—'}</TD>
                <TD mono muted style={{ textTransform:'capitalize' as const }}>{s.plan}</TD>
                <TD mono style={{ color:'var(--green)' }}>฿{(s.price_thb||0).toLocaleString()}</TD>
                <TD muted>{s.start_date ? new Date(s.start_date).toLocaleDateString('en-GB') : '—'}</TD>
                <TD muted>{s.end_date ? new Date(s.end_date).toLocaleDateString('en-GB') : '—'}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}
