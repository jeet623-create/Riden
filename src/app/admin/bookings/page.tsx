'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Empty, Input } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
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
    const r = await fetch(SUPA + '/rest/v1/bookings?select=*,dmc_users(company_name)&order=created_at.desc&limit=100', { headers: H() })
    const d = await r.json()
    setBookings(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  const filtered = bookings.filter(b => {
    const ms = !search || b.booking_ref?.includes(search) || b.client_name?.toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'all' || b.status === filter
    return ms && mf
  })
  if (loading) return <AdminShell><Loading /></AdminShell>
  return (
    <AdminShell>
      <PageHeader title="Bookings" sub={bookings.length + ' total bookings'} actions={<Input value={search} onChange={setSearch} placeholder="Search ref or client..." style={{width:220}} />} />
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {['all','pending','confirmed','in_progress','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{padding:'6px 12px',borderRadius:20,textTransform:'capitalize' as const,border:'1px solid ' + (filter===f?'var(--teal-20)':'var(--border)'),background:filter===f?'var(--teal-10)':'transparent',color:filter===f?'var(--teal)':'var(--text-3)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-body)'}}>{f.replace(/_/g,' ')}</button>
        ))}
      </div>
      <Panel>
        {filtered.length === 0 ? <Empty icon="📋" message="No bookings found" /> : (
          <Table columns={['REF','CLIENT','DMC','DAYS','TYPE','STATUS','CREATED']}>
            {filtered.map(b => (
              <TR key={b.id}>
                <TD mono style={{color:'var(--teal)'}}>{b.booking_ref || b.id?.slice(0,8)}</TD>
                <TD><span style={{fontWeight:500}}>{b.client_name}</span></TD>
                <TD muted>{(b.dmc_users as any)?.company_name??'—'}</TD>
                <TD mono muted>{b.total_days}d</TD>
                <TD muted style={{textTransform:'capitalize' as const}}>{(b.booking_type||'').replace(/_/g,' ')}</TD>
                <TD><Badge status={b.status??'pending'} /></TD>
                <TD muted>{new Date(b.created_at).toLocaleDateString('en-GB')}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}
