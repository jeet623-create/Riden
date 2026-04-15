'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DmcShell } from '@/components/DmcShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Empty, Input } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
export default function OperatorsPage() {
  const router = useRouter()
  const [ops, setOps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      load()
    })
  }, [])
  async function load() {
    setLoading(true)
    const r = await fetch(SUPA + '/rest/v1/operators?status=eq.active&select=*&order=company_name', { headers: H() })
    const d = await r.json()
    setOps(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  const filtered = ops.filter(o => !search || o.company_name?.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <DmcShell><Loading /></DmcShell>
  return (
    <DmcShell>
      <PageHeader title="Operators" sub={ops.length + ' available operators'} actions={<Input value={search} onChange={setSearch} placeholder="Search operator..." style={{width:200}} />} />
      <Panel>
        {filtered.length===0?<Empty icon="🚐" message="No operators available" />:(
          <Table columns={['COMPANY','PHONE','BASE','ALSO DRIVER','STATUS']}>
            {filtered.map(o=>(
              <TR key={o.id}>
                <TD><span style={{fontWeight:500}}>{o.company_name}</span></TD>
                <TD muted>{o.phone||'—'}</TD>
                <TD muted>{o.base_location||'—'}</TD>
                <TD muted>{o.is_also_driver?'Yes':'No'}</TD>
                <TD><Badge status={o.status||'inactive'} /></TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </DmcShell>
  )
}