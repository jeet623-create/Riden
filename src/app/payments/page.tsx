'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DmcShell } from '@/components/DmcShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Empty, Btn } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
export default function PaymentsPage() {
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
  const [dmc, setDmc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      load(user.id)
    })
  }, [])
  async function load(uid: string) {
    setLoading(true)
    const [dr, sr] = await Promise.all([
      fetch(SUPA + '/rest/v1/dmc_users?id=eq.' + uid + '&select=*', { headers: H() }),
      fetch(SUPA + '/rest/v1/subscriptions?dmc_id=eq.' + uid + '&select=*&order=activated_at.desc', { headers: H() }),
    ])
    const [dd, sd] = await Promise.all([dr.json(), sr.json()])
    if (Array.isArray(dd) && dd[0]) setDmc(dd[0])
    setSubs(Array.isArray(sd) ? sd : [])
    setLoading(false)
  }
  if (loading) return <DmcShell><Loading /></DmcShell>
  const expired = dmc?.subscription_status === 'expired'
  const trial = dmc?.subscription_status === 'trial'
  return (
    <DmcShell>
      <PageHeader title="Payments & Plan" sub="Subscription and billing history" />
      <div style={{background:'var(--bg-surface)',border:'1px solid '+(expired?'rgba(239,68,68,0.3)':trial?'rgba(245,158,11,0.3)':'var(--teal-20)'),borderRadius:12,padding:'20px 24px',marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:12,fontFamily:'var(--font-mono)',color:'var(--text-3)',letterSpacing:1,marginBottom:6}}>CURRENT PLAN</div>
            <div style={{fontSize:22,fontWeight:700,textTransform:'capitalize'}}>{dmc?.subscription_plan||'trial'}</div>
            <div style={{fontSize:13,color:'var(--text-3)',marginTop:4}}>
              Status: <span style={{color:expired?'var(--red)':trial?'var(--amber)':'var(--green)',fontWeight:500}}>{dmc?.subscription_status||'trial'}</span>
              {dmc?.subscription_status==='trial' && dmc?.trial_ends_at && <span> Â· Trial ends {new Date(dmc.trial_ends_at).toLocaleDateString('en-GB')}</span>}
            </div>
          </div>
          {(expired||trial) && <Btn variant="teal" onClick={()=>router.push('/support')}>Upgrade Plan</Btn>}
        </div>
      </div>
      <Panel>
        <div style={{padding:'14px 24px',borderBottom:'1px solid var(--border)',fontSize:13,fontWeight:600}}>Payment History</div>
        {subs.length===0?<Empty icon="ð³" message="No payment history yet" />:(
          <Table columns={['PLAN','AMOUNT','START','END','STATUS']}>
            {subs.map(s=>{
              const exp = new Date(s.end_date) < new Date()
              return (
                <TR key={s.id}>
                  <TD mono muted style={{textTransform:'capitalize' as const}}>{s.plan}</TD>
                  <TD mono style={{color:'var(--green)'}}>à¸¿{(s.price_thb||0).toLocaleString()}</TD>
                  <TD muted>{s.start_date?new Date(s.start_date).toLocaleDateString('en-GB'):'â'}</TD>
                  <TD muted>{s.end_date?new Date(s.end_date).toLocaleDateString('en-GB'):'â'}</TD>
                  <TD><Badge status={exp?'expired':'active'} /></TD>
                </TR>
              )
            })}
          </Table>
        )}
      </Panel>
    </DmcShell>
  )
}