'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DmcShell } from '@/components/DmcShell'
import { StatCard, Panel, PanelHeader, Table, TR, TD, Badge, Loading, PageHeader, Btn } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
export default function DmcDashboard() {
  const router = useRouter()
  const [dmc, setDmc] = useState<any>(null)
  const [stats, setStats] = useState({ bookings:0, trips:0, drivers:0, pending:0 })
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      sb.from('dmc_users').select('*').eq('id', user.id).single().then(({ data }) => {
        if (!data) { router.push('/login'); return }
        setDmc(data); load(user.id)
      })
    })
  }, [])
  async function load(uid: string) {
    setLoading(true)
    const [br, tr, rr] = await Promise.all([
      fetch(SUPA + '/rest/v1/bookings?dmc_id=eq.' + uid + '&select=id,status', { headers: H() }),
      fetch(SUPA + '/rest/v1/trips?select=id&status=eq.in_progress', { headers: H() }),
      fetch(SUPA + '/rest/v1/bookings?dmc_id=eq.' + uid + '&select=id,booking_ref,client_name,status,total_days,created_at&order=created_at.desc&limit=6', { headers: H() }),
    ])
    const [bd, td, rd] = await Promise.all([br.json(), tr.json(), rr.json()])
    const bArr = Array.isArray(bd) ? bd : []
    setStats({ bookings: bArr.length, trips: td?.length||0, drivers: 0, pending: bArr.filter((b:any)=>b.status==='pending').length })
    setRecent(Array.isArray(rd) ? rd : [])
    setLoading(false)
  }
  if (loading) return <DmcShell><Loading /></DmcShell>
  return (
    <DmcShell>
      <PageHeader
        title={'Welcome back' + (dmc?.company_name ? ', ' + dmc.company_name : '') + '!'}
        sub={new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}) + ' · Bangkok'}
        actions={<Btn variant="teal" onClick={()=>router.push('/bookings')}>+ New Booking</Btn>}
      />
      {dmc?.subscription_status === 'trial' && (
        <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:12,padding:'14px 20px',marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:13,color:'var(--amber)',fontWeight:500}}>⏱ Trial account — upgrade to unlock all features</div>
          <Btn variant="secondary" size="sm" onClick={()=>router.push('/support')}>Contact us</Btn>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        <StatCard label="Total Bookings" value={stats.bookings} icon="📋" color="var(--teal)" sub="all time" />
        <StatCard label="Pending" value={stats.pending} icon="⏳" color="var(--amber)" sub="awaiting dispatch" />
        <StatCard label="Active Trips" value={stats.trips} icon="🗺️" color="var(--green)" sub="running now" />
        <StatCard label="Plan" value={dmc?.subscription_plan||'trial'} icon="💳" color="var(--blue)" sub="subscription" />
      </div>
      <Panel>
        <PanelHeader title="Recent Bookings" sub="Your latest activity" actions={<Btn variant="ghost" size="sm" onClick={()=>router.push('/bookings')}>View all →</Btn>} />
        {recent.length===0
          ?<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>No bookings yet. <span style={{color:'var(--teal)',cursor:'pointer'}} onClick={()=>router.push('/bookings')}>Create your first one</span></div>
          :<Table columns={['REF','CLIENT','DAYS','STATUS','DATE']}>
            {recent.map(b=>(
              <TR key={b.id}>
                <TD mono style={{color:'var(--teal)'}}>{b.booking_ref||b.id?.slice(0,8)}</TD>
                <TD><span style={{fontWeight:500}}>{b.client_name}</span></TD>
                <TD mono muted>{b.total_days}d</TD>
                <TD><Badge status={b.status||'pending'} /></TD>
                <TD muted>{new Date(b.created_at).toLocaleDateString('en-GB')}</TD>
              </TR>
            ))}
          </Table>
        }
      </Panel>
    </DmcShell>
  )
}