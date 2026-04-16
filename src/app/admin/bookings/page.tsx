'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Input, StatCard } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

const BOOK_TYPE_MAP: Record<string,string> = { airport_transfer:'Airport Transfer', sightseeing:'Sightseeing', hotel_transfer:'Hotel Transfer', day_tour:'Day Tour', custom:'Custom' }

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
    const r = await fetch(SUPA+'/rest/v1/bookings?select=*,dmc_users(company_name)&order=created_at.desc&limit=100', { headers: H() })
    const d = await r.json()
    setBookings(Array.isArray(d)?d:[])
    setLoading(false)
  }

  const filtered = bookings.filter(b => {
    const ms = !search || b.booking_ref?.toLowerCase().includes(search.toLowerCase()) || b.client_name?.toLowerCase().includes(search.toLowerCase())
    const mf = filter==='all' || b.status===filter
    return ms && mf
  })

  const counts = { total:bookings.length, pending:bookings.filter(b=>b.status==='pending').length, inProgress:bookings.filter(b=>b.status==='in_progress').length, completed:bookings.filter(b=>b.status==='completed').length }

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      <PageHeader title='Bookings' sub={bookings.length+' total bookings'} actions={<Input value={search} onChange={setSearch} placeholder='Search ref or client...' style={{width:200}} />} />

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        <StatCard label='Total' value={counts.total} color='var(--text-2)' />
        <StatCard label='Pending' value={counts.pending} color='var(--amber)' />
        <StatCard label='In Progress' value={counts.inProgress} color='var(--blue)' />
        <StatCard label='Completed' value={counts.completed} color='var(--green)' />
      </div>

      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {['all','pending','confirmed','in_progress','completed','cancelled'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:500,cursor:'pointer',border:'1px solid',transition:'all 0.12s',background:filter===f?'var(--teal-10)':'transparent',borderColor:filter===f?'var(--teal-20)':'var(--border)',color:filter===f?'var(--teal)':'var(--text-3)',textTransform:'capitalize',fontFamily:'var(--font-body)'}}>{f.replace('_',' ')}</button>
        ))}
      </div>

      <Panel>
        {filtered.length===0?(
          <div style={{padding:'40px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>No bookings found</div>
        ):(
          <Table columns={['REF','CLIENT','DMC','DAYS','TYPE','STATUS','CREATED']}>
            {filtered.map(b=>(
              <TR key={b.id}>
                <TD mono style={{color:'var(--teal)'}}>{b.booking_ref||'—'}</TD>
                <TD><span style={{fontWeight:500}}>{b.client_name||'—'}</span></TD>
                <TD muted>{(b.dmc_users as any)?.company_name||'—'}</TD>
                <TD mono muted>{b.total_days?b.total_days+'d':'—'}</TD>
                <TD muted>{BOOK_TYPE_MAP[b.booking_type]||b.booking_type||'—'}</TD>
                <TD><Badge status={b.status||'pending'} /></TD>
                <TD muted>{b.created_at?new Date(b.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'}):'—'}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </AdminShell>
  )
}
