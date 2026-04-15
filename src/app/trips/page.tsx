'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DmcShell } from '@/components/DmcShell'
import { Panel, Table, TR, TD, Badge, Loading, PageHeader, Empty } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })
export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      load(user.id)
    })
  }, [])
  async function load(uid: string) {
    setLoading(true)
    const r = await fetch(SUPA + '/rest/v1/trips?select=*,bookings(booking_ref,client_name,dmc_id)&order=pickup_time.desc&limit=50', { headers: H() })
    const d = await r.json()
    const arr = Array.isArray(d) ? d.filter((t:any)=>(t.bookings as any)?.dmc_id===uid) : []
    setTrips(arr)
    setLoading(false)
  }
  if (loading) return <DmcShell><Loading /></DmcShell>
  return (
    <DmcShell>
      <PageHeader title="Trips" sub={trips.length + ' trips'} />
      <Panel>
        {trips.length===0?<Empty icon="🗺️" message="No trips yet" />:(
          <Table columns={['BOOKING','CLIENT','PICKUP','FROM','STATUS','DRIVER']}>
            {trips.map(t=>(
              <TR key={t.id}>
                <TD mono style={{color:'var(--teal)'}}>{(t.bookings as any)?.booking_ref||'—'}</TD>
                <TD><span style={{fontWeight:500}}>{(t.bookings as any)?.client_name||'—'}</span></TD>
                <TD muted>{t.pickup_time?new Date(t.pickup_time).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—'}</TD>
                <TD muted style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{t.pickup_location||'—'}</TD>
                <TD><Badge status={t.status||'pending'} /></TD>
                <TD muted>{t.driver_name||'Not assigned'}</TD>
              </TR>
            ))}
          </Table>
        )}
      </Panel>
    </DmcShell>
  )
}