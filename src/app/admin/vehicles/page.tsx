'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Empty, Input } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<any[]>([])
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
    const r = await fetch(SUPA + '/rest/v1/vehicles?select=*,operators(company_name)&order=created_at.desc', { headers: H() })
    const d = await r.json()
    setVehicles(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  const filtered = vehicles.filter(v => !search || v.plate?.toLowerCase().includes(search.toLowerCase()) || v.brand_model?.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <AdminShell><Loading /></AdminShell>
  return (
    <AdminShell>
      <PageHeader title="Vehicles" sub={vehicles.length + ' registered vehicles'} actions={<Input value={search} onChange={setSearch} placeholder="Search plate or model..." style={{width:220}} />} />
      <Panel>
        {filtered.length === 0 ? <Empty icon="🚗" message="No vehicles found" /> : (
          <Table columns={['TYPE','PLATE','BRAND/MODEL','SEATS','OPERATOR','STATUS','PHOTO']}>
            {filtered.map(v => (
              <TR key={v.id}>
                <TD mono muted>{v.type?.replace(/_/g,' ')}</TD>
                <TD mono><span style={{fontWeight:500}}>{v.plate}</span></TD>
                <TD muted>{v.brand_model??'—'}</TD>
                <TD mono muted>{v.seats??'—'}</TD>
                <TD muted>{(v.operators as any)?.company_name??'—'}</TD>
                <TD><Badge status={v.status??'inactive'} /></TD>
                <TD>{v.photo_url ? <img src={v.photo_url} style={{width:52,height:34,objectFit:'cover',borderRadius:4,border:'1px solid var(--border)'}} alt="v" /> : <span style={{fontSize:11,color:'var(--text-3)'}}>—</span>}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}
