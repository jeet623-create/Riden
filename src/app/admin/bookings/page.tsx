'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
const bookings = [
  {ref:'RDN-2026-001',client:'Singapore Tours Ltd',dmc:'Bangkok Express DMC',days:'5',type:'airport_transfer',status:'confirmed',created:'2026-04-14'},
  {ref:'RDN-2026-002',client:'Euro Travel Group',dmc:'Chiang Mai Adventures',days:'3',type:'city_tour',status:'pending',created:'2026-04-14'},
  {ref:'RDN-2026-003',client:'Asia Pacific Tours',dmc:'Phuket Premier DMC',days:'7',type:'multi_day',status:'confirmed',created:'2026-04-13'},
  {ref:'RDN-2026-004',client:'Global Destinations',dmc:'Bangkok Express DMC',days:'4',type:'private_charter',status:'in_progress',created:'2026-04-13'},
  {ref:'RDN-2026-005',client:'Luxury Escapes Co',dmc:'Krabi Elite Travel',days:'6',type:'multi_day',status:'confirmed',created:'2026-04-12'},
  {ref:'RDN-2026-006',client:'Adventure Seekers',dmc:'Chiang Mai Adventures',days:'2',type:'day_trip',status:'completed',created:'2026-04-10'},
  {ref:'RDN-2026-007',client:'Family Holidays Inc',dmc:'Pattaya Tours Co',days:'1',type:'airport_transfer',status:'cancelled',created:'2026-04-09'},
]
export default function Page() {
  const [tab, setTab] = useState('All')
  const [q, setQ] = useState('')
  const filtered = bookings.filter(b=>{
    const matchTab = tab==='All'||b.status===tab.toLowerCase().replace(' ','_')
    const matchQ = !q||b.ref.toLowerCase().includes(q.toLowerCase())||b.client.toLowerCase().includes(q.toLowerCase())
    return matchTab&&matchQ
  })
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-medium">Bookings</h1><p className="text-sm text-[#737373] font-mono mt-0.5">{bookings.length} total</p></div>
        <Input icon="search" placeholder="Search bookings..." className="w-64" value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto">{['All','Pending','Confirmed','In Progress','Completed','Cancelled'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${tab===t?'bg-[#1D9E75] text-white':'bg-[#141414] text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]'}`}>{t}</button>)}</div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-white/[0.08]">{['Ref','Client','DMC','Days','Type','Status','Created'].map(h=><th key={h} className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase">{h}</th>)}</tr></thead>
        <tbody>{filtered.map((b,i)=><tr key={i} className="border-b border-white/[0.04] hover:bg-[#1a1a1a] transition-colors cursor-pointer">
          <td className="px-4 py-3 text-sm font-mono text-[#1D9E75]">{b.ref}</td>
          <td className="px-4 py-3 text-sm font-medium">{b.client}</td>
          <td className="px-4 py-3 text-sm text-[#a3a3a3]">{b.dmc}</td>
          <td className="px-4 py-3 text-sm font-mono">{b.days}</td>
          <td className="px-4 py-3 text-sm capitalize">{b.type.replace(/_/g,' ')}</td>
          <td className="px-4 py-3"><StatusBadge status={b.status}/></td>
          <td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{b.created}</td>
        </tr>)}</tbody></table>
      </div>
    </AdminShell>
  )
}
