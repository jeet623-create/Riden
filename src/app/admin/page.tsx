'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { StatCard, Panel, PanelHeader, Table, TR, TD, Badge, Loading, PageHeader, Btn } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ dmcs:0, operators:0, drivers:0, vehicles:0, trips_active:0, pending_drivers:0, bookings:0, mrr:0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/admin/login'); return }
    const { data } = await sb.from('admin_users').select('id').eq('id', user.id).single()
    if (!data) { router.push('/admin/login'); return }
    await loadData()
    setLoading(false)
  }

  async function loadData() {
    const h = { apikey: KEY, Authorization: `Bearer ${KEY}` }
    try {
      const [dmcR, opR, drR, vR, tripR, pendR, bookR] = await Promise.all([
        fetch(`${SUPA}/rest/v1/dmc_users?select=id,subscription_plan,subscription_status`, { headers: h }),
        fetch(`${SUPA}/rest/v1/operators?select=id`, { headers: h }),
        fetch(`${SUPA}/rest/v1/drivers?select=id&is_verified=eq.true`, { headers: h }),
        fetch(`${SUPA}/rest/v1/vehicles?select=id&status=eq.active`, { headers: h }),
        fetch(`${SUPA}/rest/v1/trips?select=id&status=eq.in_progress`, { headers: h }),
        fetch(`${SUPA}/rest/v1/drivers?select=id&is_verified=eq.false&is_active=eq.false`, { headers: h }),
        fetch(`${SUPA}/rest/v1/bookings?select=id,booking_ref,client_name,status,total_days,created_at,dmc_users(company_name)&order=created_at.desc&limit=8`, { headers: h }),
      ])
      const [dmcs,ops,drs,vs,trips,pend,books] = await Promise.all([dmcR,opR,drR,vR,tripR,pendR,bookR].map(r=>r.json()))
      const PRICES: Record<string,number> = { starter:2000, growth:4000, pro:6000 }
      const mrr = (dmcs||[]).filter((d:any)=>d.subscription_status==='active').reduce((s:number,d:any)=>s+(PRICES[d.subscription_plan]||0),0)
      setStats({ dmcs: dmcs?.length??0, operators: ops?.length??0, drivers: drs?.length??0, vehicles: vs?.length??0, trips_active: trips?.length??0, pending_drivers: pend?.length??0, bookings: books?.length??0, mrr })
      setRecentBookings(Array.isArray(books) ? books : [])
    } catch(e) { console.error(e) }
  }

  if (loading) return <AdminShell><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><Loading /></div></AdminShell>

  return (
    <AdminShell>
      <PageHeader
        title="Command Center"
        sub={`${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})} · Bangkok`}
        actions={<Btn variant="secondary" size="sm" icon="⟳" onClick={loadData}>Refresh</Btn>}
      />

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:16}}>
        <StatCard label="Active DMCs"      value={stats.dmcs}         icon="🏢" color="var(--teal)"   sub="companies" />
        <StatCard label="Operators"        value={stats.operators}    icon="🚐" color="var(--blue)"   sub="fleet owners" />
        <StatCard label="Verified Drivers" value={stats.drivers}      icon="🧑‍✈️" color="var(--green)"  sub="in pool" />
        <StatCard label="Est. MRR"         value={`฿${stats.mrr.toLocaleString()}`} icon="📊" color="var(--amber)" sub="monthly" />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        <StatCard label="Active Trips"    value={stats.trips_active}    icon="🗺️" color="var(--green)"  sub="running now" />
        <StatCard label="Vehicles"        value={stats.vehicles}        icon="🚗" color="var(--text-2)" sub="active fleet" />
        <StatCard label="Pending Review"  value={stats.pending_drivers} icon="⏳" color="var(--amber)"  sub="need approval" />
        <StatCard label="Recent Bookings" value={stats.bookings}        icon="📋" color="var(--blue)"   sub="latest" />
      </div>

      {stats.pending_drivers > 0 && (
        <div style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'var(--r-lg)',padding:'14px 20px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:16}}>⏳</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--amber)'}}>{stats.pending_drivers} driver{stats.pending_drivers>1?'s':''} waiting for approval</div>
              <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>Review vehicle photos and license documents</div>
            </div>
          </div>
          <Btn variant="secondary" size="sm" onClick={()=>router.push('/admin/drivers')}>Review →</Btn>
        </div>
      )}

      <Panel>
        <PanelHeader title="Recent Bookings" sub="Latest activity across all DMCs" actions={<Btn variant="ghost" size="sm" onClick={()=>router.push('/admin/bookings')}>View all →</Btn>} />
        {recentBookings.length === 0
          ? <div style={{padding:'40px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>No bookings yet</div>
          : <Table columns={['REF','CLIENT','DMC','DAYS','STATUS','CREATED']}>
              {recentBookings.map(b => (
                <TR key={b.id}>
                  <TD mono style={{color:'var(--teal)'}}>{b.booking_ref || b.id?.slice(0,8)}</TD>
                  <TD><span style={{fontWeight:500}}>{b.client_name}</span></TD>
                  <TD muted>{(b.dmc_users as any)?.company_name ?? '—'}</TD>
                  <TD mono muted>{b.total_days}d</TD>
                  <TD><Badge status={b.status??'pending'} /></TD>
                  <TD muted>{new Date(b.created_at).toLocaleDateString('en-GB')}</TD>
                </TR>
              ))}
            </Table>
        }
      </Panel>
    </AdminShell>
  )
}
