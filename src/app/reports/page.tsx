'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DmcShell } from '@/components/DmcShell'
import { StatCard, Panel, PanelHeader, Loading, PageHeader, Btn } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
export default function ReportsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      load(user.id)
    })
  }, [month])
  async function load(uid: string) {
    setLoading(true)
    const start = month + '-01'
    const end = new Date(parseInt(month.slice(0,4)), parseInt(month.slice(5,7)), 0).toISOString().slice(0,10)
    const r = await fetch(SUPA + '/rest/v1/bookings?dmc_id=eq.' + uid + '&created_at=gte.' + start + 'T00:00:00&created_at=lte.' + end + 'T23:59:59&select=*', { headers: H() })
    const d = await r.json()
    setBookings(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  function exportCSV() {
    const rows = bookings.map(b => [b.booking_ref,b.client_name,b.total_days,b.status,b.created_at].join(','))
    const csv = ['Ref,Client,Days,Status,Created',...rows].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'riden-report-' + month + '.csv'
    a.click()
  }
  const byStatus = bookings.reduce((acc:any, b) => { acc[b.status]=(acc[b.status]||0)+1; return acc }, {})
  if (loading) return <DmcShell><Loading /></DmcShell>
  return (
    <DmcShell>
      <PageHeader title="Reports" sub={'Monthly summary — ' + month}
        actions={
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'7px 12px',fontSize:13,color:'var(--text-1)',fontFamily:'var(--font-body)',outline:'none'}} />
            <Btn variant="secondary" onClick={exportCSV}>↓ CSV</Btn>
          </div>
        }
      />
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        <StatCard label="Total Bookings" value={bookings.length} icon="📋" color="var(--teal)" sub={month} />
        <StatCard label="Confirmed" value={byStatus.confirmed||0} icon="✓" color="var(--green)" sub="approved" />
        <StatCard label="Pending" value={byStatus.pending||0} icon="⏳" color="var(--amber)" sub="waiting" />
        <StatCard label="Completed" value={byStatus.completed||0} icon="✓✓" color="var(--text-2)" sub="done" />
      </div>
      <Panel>
        <PanelHeader title="Booking Breakdown" sub="Status distribution" />
        <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:12}}>
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:100,fontSize:12,color:'var(--text-2)',textTransform:'capitalize' as const}}>{status.replace(/_/g,' ')}</div>
              <div style={{flex:1,height:6,background:'var(--bg-elevated)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:(bookings.length?(count as number)/bookings.length*100:0)+'%',background:'var(--teal)',borderRadius:3,transition:'width 0.3s'}} />
              </div>
              <div style={{fontSize:13,fontFamily:'var(--font-mono)',minWidth:24}}>{count as number}</div>
            </div>
          ))}
          {bookings.length===0&&<div style={{color:'var(--text-3)',fontSize:13}}>No bookings this month</div>}
        </div>
      </Panel>
    </DmcShell>
  )
}