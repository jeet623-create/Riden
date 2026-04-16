'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { StatCard, Panel, PanelHeader, Table, TR, TD, Badge, Loading, Btn } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ dmcs:0, operators:0, drivers:0, vehicles:0, pending:0 })
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
    const [d, op, dr, v, b, p] = await Promise.all([
      fetch(SUPA+'/rest/v1/dmc_users?select=id', { headers: H() }).then(r=>r.json()),
      fetch(SUPA+'/rest/v1/operators?select=id', { headers: H() }).then(r=>r.json()),
      fetch(SUPA+'/rest/v1/drivers?is_verified=eq.true&select=id', { headers: H() }).then(r=>r.json()),
      fetch(SUPA+'/rest/v1/vehicles?status=eq.active&select=id', { headers: H() }).then(r=>r.json()),
      fetch(SUPA+'/rest/v1/bookings?select=id,booking_ref,client_name,total_days,status,created_at&order=created_at.desc&limit=8', { headers: H() }).then(r=>r.json()),
      fetch(SUPA+'/rest/v1/drivers?is_verified=eq.false&is_active=eq.false&select=id', { headers: H() }).then(r=>r.json()),
    ])
    setStats({ dmcs:Array.isArray(d)?d.length:0, operators:Array.isArray(op)?op.length:0, drivers:Array.isArray(dr)?dr.length:0, vehicles:Array.isArray(v)?v.length:0, pending:Array.isArray(p)?p.length:0 })
    setBookings(Array.isArray(b)?b:[])
    setLoading(false)
  }

  const date = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+' · Bangkok'
  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      <div style={{marginBottom:24,display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:-0.5,color:'var(--text-1)',margin:0}}>Command Center</h1>
          <p style={{fontSize:13,color:'var(--text-3)',marginTop:4}}>{date}</p>
        </div>
        <Btn variant='secondary' size='sm' icon='↺' onClick={load}>Refresh</Btn>
      </div>
      <div style={{position:'relative',marginBottom:28}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',fontSize:14}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search bookings, DMCs, operators...' style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'9px 12px 9px 36px',fontSize:13,color:'var(--text-1)',outline:'none',fontFamily:'var(--font-body)'}} onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
      </div>
      {stats.pending>0&&(
        <div style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'var(--r-lg)',padding:'12px 20px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:13,color:'var(--amber)',fontWeight:500}}>⚠️ {stats.pending} driver(s) waiting for approval in the pool</span>
          <Btn variant='ghost' size='sm' onClick={()=>router.push('/admin/pending')}>Review →</Btn>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:16}}>
        <StatCard label='Active DMCs' value={stats.dmcs} sub='companies' icon='🏢' color='var(--teal)' />
        <StatCard label='Operators' value={stats.operators} sub='fleet owners' icon='🚐' color='var(--blue)' />
        <StatCard label='Verified Drivers' value={stats.drivers} sub='in pool' icon='🧑‍✈️' color='var(--green)' />
        <StatCard label='Est. MRR' value={'฿0'} sub='monthly' icon='📊' color='var(--amber)' />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        <StatCard label='Active Trips' value={0} sub='running now' icon='🗺️' color='var(--green)' />
        <StatCard label='Vehicles' value={stats.vehicles} sub='active fleet' icon='🚗' color='var(--text-2)' />
        <StatCard label='Pending Review' value={stats.pending} sub='need approval' icon='⏳' color='var(--amber)' />
        <StatCard label='Recent Bookings' value={bookings.length} sub='latest' icon='📋' color='var(--blue)' />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:28}}>
        <Panel>
          <PanelHeader title='Revenue Overview' sub='Last 6 months' />
          <div style={{padding:'20px 24px',display:'flex',alignItems:'flex-end',gap:8,height:120}}>
            {['Nov','Dec','Jan','Feb','Mar','Apr'].map((m,i)=>(
              <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{width:'100%',background:i===5?'var(--teal)':'var(--bg-elevated)',borderRadius:'4px 4px 0 0',height:[30,45,35,60,50,80][i]}} />
                <span style={{fontSize:9,color:'var(--text-3)',fontFamily:'var(--font-mono)'}}>{m}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title='Subscription Breakdown' />
          <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
            {[['Starter','12%'],['Growth','54%'],['Pro','34%']].map(([l,p])=>(
              <div key={l as string}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:12,color:'var(--text-2)'}}>{l}</span>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-3)'}}>{p}</span>
                </div>
                <div style={{height:6,background:'var(--bg-elevated)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:p as string,background:'var(--teal)',borderRadius:3}} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel>
        <PanelHeader title='Recent Bookings' sub='Latest activity across all DMCs' actions={<Btn variant='ghost' size='sm' onClick={()=>router.push('/admin/bookings')}>View all →</Btn>} />
        {bookings.length===0?(
          <div style={{padding:'40px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>No bookings yet</div>
        ):(
          <Table columns={['REF','CLIENT','DAYS','STATUS','CREATED']}>
            {bookings.map(b=>(
              <TR key={b.id}>
                <TD mono style={{color:'var(--teal)'}}>{b.booking_ref||'—'}</TD>
                <TD><span style={{fontWeight:500}}>{b.client_name||'—'}</span></TD>
                <TD mono muted>{b.total_days?b.total_days+'d':'—'}</TD>
                <TD><Badge status={b.status||'pending'} /></TD>
                <TD muted>{b.created_at?new Date(b.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}):'—'}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}
