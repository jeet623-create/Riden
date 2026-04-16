'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Btn } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

const VL: Record<string,string> = { sedan:'Sedan', suv:'SUV', van_9:'Van 9', van_12:'Van 12', minibus_15:'Minibus 15', minibus_20:'Minibus 20', coach_30:'Coach 30', coach_40plus:'Coach 40+', pickup:'Pickup' }

export default function PendingPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<any[]>([])
  const [operators, setOperators] = useState<any[]>([])
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
    const [d, op] = await Promise.all([
      fetch(SUPA+'/rest/v1/drivers?is_verified=eq.false&is_active=eq.false&select=*&order=joined_at.desc', { headers: H() }).then(r=>r.json()),
      fetch(SUPA+'/rest/v1/operators?verified_at=is.null&status=eq.active&select=*&order=created_at.desc', { headers: H() }).then(r=>r.json()),
    ])
    setDrivers(Array.isArray(d)?d:[])
    setOperators(Array.isArray(op)?op:[])
    setLoading(false)
  }

  async function approveDriver(id: string) {
    await fetch(SUPA+'/rest/v1/drivers?id=eq.'+id, { method:'PATCH', headers:{...H(),'Content-Type':'application/json'}, body: JSON.stringify({ is_verified:true, is_active:true }) })
    setDrivers(prev=>prev.filter(d=>d.id!==id))
  }

  async function rejectDriver(id: string) {
    await fetch(SUPA+'/rest/v1/drivers?id=eq.'+id, { method:'PATCH', headers:{...H(),'Content-Type':'application/json'}, body: JSON.stringify({ is_active:false }) })
    setDrivers(prev=>prev.filter(d=>d.id!==id))
  }

  async function verifyOperator(id: string) {
    await fetch(SUPA+'/rest/v1/operators?id=eq.'+id, { method:'PATCH', headers:{...H(),'Content-Type':'application/json'}, body: JSON.stringify({ verified_at: new Date().toISOString() }) })
    setOperators(prev=>prev.filter(o=>o.id!==id))
  }

  const total = drivers.length + operators.length

  if (loading) return <AdminShell><Loading /></AdminShell>

  if (total===0) return (
    <AdminShell>
      <PageHeader title='Pending Approvals' sub='0 items waiting for review' />
      <Panel>
        <div style={{padding:'60px 20px',textAlign:'center'}}>
          <div style={{fontSize:28,opacity:0.2,marginBottom:12}}>✓</div>
          <div style={{fontSize:15,fontWeight:500,color:'var(--text-1)',marginBottom:4}}>All clear!</div>
          <div style={{fontSize:13,color:'var(--text-3)'}}>No pending approvals</div>
        </div>
      </Panel>
    </AdminShell>
  )

  return (
    <AdminShell>
      <PageHeader title='Pending Approvals' sub={total+' items waiting for review'} />

      {drivers.length>0&&(
        <div style={{marginBottom:28}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-1)',margin:0}}>Drivers</h3>
            <span style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:20,padding:'2px 10px',fontSize:11,color:'var(--amber)',fontFamily:'var(--font-mono)'}}>{drivers.length}</span>
            <span style={{fontSize:12,color:'var(--text-3)'}}>Awaiting license verification</span>
          </div>
          <Panel>
            <Table columns={['PHOTO','NAME','VEHICLE','PLATE','LICENSE #','EXPIRY','PHONE','JOINED','ACTIONS']}>
              {drivers.map(d=>{
                const expired = d.license_expiry && new Date(d.license_expiry) < new Date()
                return (
                  <TR key={d.id}>
                    <TD>{d.vehicle_photo_url?<img src={d.vehicle_photo_url} style={{width:52,height:34,objectFit:'cover',borderRadius:4,border:'1px solid var(--border)',cursor:'zoom-in'}} alt='v' />:<span style={{fontSize:11,color:'var(--text-3)'}}>—</span>}</TD>
                    <TD><div style={{fontWeight:500,fontSize:13}}>{d.full_name}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{d.phone}</div></TD>
                    <TD muted>{VL[d.vehicle_type]||d.vehicle_type}</TD>
                    <TD mono muted>{d.vehicle_plate}</TD>
                    <TD mono muted>{d.license_number||'—'}</TD>
                    <TD><span style={{color:expired?'var(--red)':'var(--text-1)',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:expired?600:400}}>{d.license_expiry||'—'}{expired?' EXPIRED':''}</span></TD>
                    <TD muted>{d.phone||'—'}</TD>
                    <TD muted>{d.joined_at?new Date(d.joined_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}):'—'}</TD>
                    <TD>
                      <div style={{display:'flex',gap:6}}>
                        <Btn variant='teal' size='sm' onClick={()=>approveDriver(d.id)}>✓ Approve</Btn>
                        <Btn variant='ghost' size='sm' onClick={()=>router.push('/admin/drivers')}>View</Btn>
                      </div>
                    </TD>
                  </TR>
                )
              })}
            </Table>
          </Panel>
        </div>
      )}

      {operators.length>0&&(
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-1)',margin:0}}>Operators</h3>
            <span style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:20,padding:'2px 10px',fontSize:11,color:'var(--amber)',fontFamily:'var(--font-mono)'}}>{operators.length}</span>
            <span style={{fontSize:12,color:'var(--text-3)'}}>Awaiting business verification</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
            {operators.map(o=>(
              <div key={o.id} style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--r-xl)',padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div style={{fontWeight:600,fontSize:14}}>{o.company_name}</div>
                  <Badge status='pending' label='PENDING' />
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                  {[['Base',o.base_location||'—'],['Phone',o.phone||'—'],['Joined',o.created_at?new Date(o.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—'],['Also Driver',o.is_also_driver?'Yes':'No']].map(([k,v])=>(
                    <div key={k as string}>
                      <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-mono)',textTransform:'uppercase',letterSpacing:1,marginBottom:2}}>{k}</div>
                      <div style={{fontSize:12,color:'var(--text-1)'}}>{v}</div>
                    </div>
                  ))}
                </div>
                <Btn variant='teal' style={{width:'100%',justifyContent:'center'}} onClick={()=>verifyOperator(o.id)}>✓ Verify Operator</Btn>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  )
}
