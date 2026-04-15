'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
type Payment = { id:string; trip_id:string; status:string; proof_photo_url:string|null; confirmed_at:string|null; reminder_count:number; trips:{ trip_date:string; pickup_location:string; dropoff_location:string; bookings:{ client_name:string; booking_ref:string } } }
const STATUS_LABELS: Record<string,string> = { pending:'Awaiting Proof', proof_uploaded:'Proof Uploaded — Confirm?', confirmed:'Confirmed', disputed:'Disputed' }
const STATUS_BADGE: Record<string,string> = { pending:'badge-pending', proof_uploaded:'badge-progress', confirmed:'badge-completed', disputed:'badge-cancelled' }
export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('payments').select('id,trip_id,status,proof_photo_url,confirmed_at,reminder_count,trips!inner(trip_date,pickup_location,dropoff_location,bookings!inner(client_name,booking_ref,dmc_id))').eq('trips.bookings.dmc_id', user.id).order('trips(trip_date)',{ascending:false}).limit(50)
      setPayments((data??[]) as unknown as Payment[])
      setLoading(false)
    }
    load()
  }, [router])
  async function confirmPayment(paymentId: string) {
    const supabase = createClient()
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('payments').update({ status:'confirmed', confirmed_by:user.id, confirmed_at:new Date().toISOString() }).eq('id', paymentId)
    if (error) { toast.error('Failed to confirm'); return }
    toast.success('Payment confirmed!')
    setPayments(prev => prev.map(p => p.id===paymentId ? {...p, status:'confirmed'} : p))
  }
  const confirmed = payments.filter(p => p.status==='confirmed')
  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-riden-muted hover:text-riden-text"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></Link>
        <div className="w-px h-5 bg-riden-border" />
        <span className="font-display text-riden-white font-600">💳 Payments</span>
      </nav>
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label:'Pending', value:payments.filter(p=>p.status==='pending').length, color:'text-yellow-400' },
            { label:'Awaiting Confirmation', value:payments.filter(p=>p.status==='proof_uploaded').length, color:'text-blue-400' },
            { label:'Confirmed', value:confirmed.length, color:'text-riden-teal' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-5">
              <div className={'font-display text-3xl font-700 '+s.color+' mb-1'}>{s.value}</div>
              <div className="text-riden-text text-xs font-mono uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
        {loading ? (
          <div className="glass rounded-2xl p-12 text-center"><div className="w-8 h-8 border-2 border-riden-teal/30 border-t-riden-teal rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="space-y-3">
            {payments.length===0 ? (
              <div className="glass rounded-2xl p-12 text-center"><div className="text-5xl mb-4">💳</div><p className="text-riden-white font-medium">No payments yet</p><p className="text-riden-text text-sm mt-1">Payments appear here after trips are completed</p></div>
            ) : payments.map(p => (
              <div key={p.id} className="glass rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-riden-white font-medium">{p.trips?.bookings?.client_name??'-'}</span>
                    <span className={'px-2 py-0.5 rounded-full text-xs font-medium '+STATUS_BADGE[p.status]}>{STATUS_LABELS[p.status]}</span>
                  </div>
                  <p className="text-riden-text text-xs">{p.trips?.trip_date} · {p.trips?.pickup_location} → {p.trips?.dropoff_location}</p>
                  <p className="text-riden-muted text-xs mt-0.5 font-mono">{p.trips?.bookings?.booking_ref}</p>
                </div>
                <div className="flex items-center gap-3">
                  {p.proof_photo_url && <a href={p.proof_photo_url} target="_blank" rel="noopener noreferrer" className="text-riden-teal text-xs hover:underline">View Proof</a>}
                  {p.status==='proof_uploaded' && <button onClick={()=>confirmPayment(p.id)} className="btn-primary px-4 py-2 text-sm">✅ Confirm</button>}
                  {p.status==='confirmed' && <span className="text-riden-teal text-sm">✅</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
