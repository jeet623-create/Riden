'use client'
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase'

export default function AdminBookings() {
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const title = lang==='en'?'All Bookings':'การจองทั้งหมด'
  const STATUS_COLORS: Record<string,string> = { pending:'badge-pending', confirmed:'badge-confirmed', in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled' }

  useEffect(() => {
    const s = localStorage.getItem('riden_admin'); if(s) setLang(JSON.parse(s).lang||'en')
    async function load() {
      const { data } = await createClient().from('bookings').select('*, dmc_users(company_name)').order('created_at',{ascending:false}).limit(200)
      setItems(data??[]); setLoading(false)
    }
    load()
  }, [])

  const filtered = items.filter(d => {
    const ms = !search || d.booking_ref?.toLowerCase().includes(search.toLowerCase()) || d.client_name?.toLowerCase().includes(search.toLowerCase()) || (d.dmc_users as any)?.company_name?.toLowerCase().includes(search.toLowerCase())
    const mst = statusFilter==='all' || d.status===statusFilter
    return ms && mst
  })

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-700 text-riden-white">{title}</h1>
        <p className="text-riden-text text-sm">{filtered.length} bookings</p>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-riden-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="riden-input pl-9 text-sm" placeholder="Search ref, client, DMC..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="riden-input text-sm w-auto" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{colorScheme:'dark'}}>
          {['all','pending','confirmed','in_progress','completed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-riden-text text-sm">Loading...</div> :
         filtered.length===0 ? <div className="p-8 text-center text-riden-text text-sm">No bookings found</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-riden-border">
                <tr className="text-riden-muted text-xs font-mono uppercase">
                  {['Ref','DMC','Client','Type','Days','Pax','Status','Date'].map(h=><th key={h} className="text-left px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-riden-border">
                {filtered.map((d:any)=>(
                  <tr key={d.id} className="hover:bg-riden-card/30">
                    <td className="px-4 py-3 font-mono text-riden-teal text-xs">{d.booking_ref}</td>
                    <td className="px-4 py-3 text-riden-text text-xs">{(d.dmc_users as any)?.company_name||'-'}</td>
                    <td className="px-4 py-3 text-riden-white">{d.client_name}</td>
                    <td className="px-4 py-3 text-riden-text text-xs">{d.booking_type}</td>
                    <td className="px-4 py-3 text-riden-text">{d.total_days}</td>
                    <td className="px-4 py-3 text-riden-text">{(d.adults_count||0)+(d.children_count||0)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[d.status]||'badge-pending'}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-riden-muted text-xs">{new Date(d.created_at).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
