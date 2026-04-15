'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, PanelHeader, Table, TR, TD, Loading, PageHeader, Btn, Empty } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' })
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
    const [dr, opr] = await Promise.all([
      fetch(SUPA + '/rest/v1/drivers?is_verified=eq.false&is_active=eq.false&select=*&order=created_at.desc', { headers: H() }),
      fetch(SUPA + '/rest/v1/operators?is_verified=eq.false&select=*&order=created_at.desc', { headers: H() }),
    ])
    const [ddata, odata] = await Promise.all([dr.json(), opr.json()])
    setDrivers(Array.isArray(ddata) ? ddata : [])
    setOperators(Array.isArray(odata) ? odata : [])
    setLoading(false)
  }
  async function approveDriver(id: string) {
    await fetch(SUPA + '/functions/v1/admin-drivers', { method:'POST', headers:H(), body:JSON.stringify({ driver_id:id, action:'approve' }) })
    await load()
  }
  async function approveOperator(id: string) {
    await fetch(SUPA + '/rest/v1/operators?id=eq.' + id, { method:'PATCH', headers:H(), body:JSON.stringify({ is_verified:true, status:'active' }) })
    await load()
  }
  const total = drivers.length + operators.length
  if (loading) return <AdminShell><Loading /></AdminShell>
  return (
    <AdminShell>
      <PageHeader title="Pending Approvals" sub={total + ' item' + (total !== 1 ? 's' : '') + ' waiting for review'} />
      {total === 0 ? (
        <Panel>
          <div style={{padding:'60px',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12,opacity:0.3}}>✓</div>
            <div style={{fontSize:15,fontWeight:500,color:'var(--text-1)'}}>All clear!</div>
            <div style={{fontSize:13,color:'var(--text-3)',marginTop:4}}>No pending approvals</div>
          </div>
        </Panel>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {drivers.length > 0 && (
            <Panel>
              <PanelHeader title={'Drivers (' + drivers.length + ')'} sub="Awaiting license verification" />
              <Table columns={['NAME','VEHICLE','PLATE','LICENSE','PHONE','JOINED','PHOTO','']}>
                {drivers.map(d => (
                  <TR key={d.id}>
                    <TD><span style={{fontWeight:500}}>{d.full_name}</span></TD>
                    <TD muted>{d.vehicle_type?.replace(/_/g,' ')}</TD>
                    <TD mono>{d.vehicle_plate??'—'}</TD>
                    <TD mono muted>{d.license_number??'—'}</TD>
                    <TD muted>{d.phone??'—'}</TD>
                    <TD muted>{new Date(d.created_at).toLocaleDateString('en-GB')}</TD>
                    <TD>{d.vehicle_photo_url ? <img src={d.vehicle_photo_url} style={{width:52,height:34,objectFit:'cover',borderRadius:4,border:'1px solid var(--border)'}} alt="v" /> : <span style={{color:'var(--text-3)',fontSize:11}}>—</span>}</TD>
                    <TD><div style={{display:'flex',gap:6}}><Btn variant="teal" size="sm" onClick={()=>approveDriver(d.id)}>✓ Approve</Btn><Btn variant="ghost" size="sm" onClick={()=>router.push('/admin/drivers')}>View</Btn></div></TD>
                  </TR>
                ))}
              </Table>
            </Panel>
          )}
          {operators.length > 0 && (
            <Panel>
              <PanelHeader title={'Operators (' + operators.length + ')'} sub="Awaiting verification" />
              <Table columns={['COMPANY','PHONE','BASE','ALSO DRIVER','JOINED','']}>
                {operators.map(o => (
                  <TR key={o.id}>
                    <TD><span style={{fontWeight:500}}>{o.company_name}</span></TD>
                    <TD muted>{o.phone??'—'}</TD>
                    <TD muted>{o.base_location??'—'}</TD>
                    <TD muted>{o.is_also_driver?'Yes':'No'}</TD>
                    <TD muted>{new Date(o.created_at).toLocaleDateString('en-GB')}</TD>
                    <TD><Btn variant="teal" size="sm" onClick={()=>approveOperator(o.id)}>✓ Verify</Btn></TD>
                  </TR>
                ))}
              </Table>
            </Panel>
          )}
        </div>
      )}
    </AdminShell>
  )
}
