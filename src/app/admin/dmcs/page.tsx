'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { X } from 'lucide-react'

const dmcs = [
  {id:1,company:'Bangkok Express DMC',contact:'Somchai P.',email:'contact@bangkokexpress.com',country:'Thailand',plan:'growth',status:'active',bookings:47,joined:'2025-11-15'},
  {id:2,company:'Chiang Mai Adventures',contact:'Niran C.',email:'info@cmadventures.com',country:'Thailand',plan:'starter',status:'trial',bookings:12,joined:'2026-04-01'},
  {id:3,company:'Phuket Premier DMC',contact:'Prasert S.',email:'hello@phuketpremier.com',country:'Thailand',plan:'pro',status:'active',bookings:89,joined:'2025-08-15'},
  {id:4,company:'Krabi Elite Travel',contact:'Wichai Y.',email:'support@krabielite.com',country:'Thailand',plan:'growth',status:'active',bookings:34,joined:'2026-01-10'},
  {id:5,company:'Korea DMC Bangkok',contact:'Kim J.',email:'ops@koreabkk.com',country:'South Korea',plan:'starter',status:'active',bookings:21,joined:'2026-02-20'},
  {id:6,company:'Euro Adventures Thailand',contact:'Mueller H.',email:'hello@euroadv.com',country:'Germany',plan:'growth',status:'suspended',bookings:8,joined:'2026-03-01'},
]

export default function Page() {
  const [sel, setSel] = useState<typeof dmcs[0]|null>(null)
  const [q, setQ] = useState('')
  const filtered = dmcs.filter(d=>!q||d.company.toLowerCase().includes(q.toLowerCase())||d.email.toLowerCase().includes(q.toLowerCase()))
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-medium">DMCs</h1><p className="text-sm text-[#737373] font-mono mt-0.5">{dmcs.length} registered companies</p></div>
        <Input icon="search" placeholder="Search DMCs..." className="w-64" value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/[0.08]">{['Company','Contact','Email','Country','Plan','Bookings','Status',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase">{h}</th>)}</tr></thead>
          <tbody>{filtered.map((d,i)=>(
            <tr key={i} className="border-b border-white/[0.04] hover:bg-[#1a1a1a] transition-colors">
              <td className="px-4 py-3 text-sm font-medium">{d.company}</td>
              <td className="px-4 py-3 text-sm text-[#a3a3a3]">{d.contact}</td>
              <td className="px-4 py-3 text-sm text-[#737373] font-mono">{d.email}</td>
              <td className="px-4 py-3 text-sm">{d.country}</td>
              <td className="px-4 py-3 text-sm font-mono capitalize text-[#1D9E75]">{d.plan}</td>
              <td className="px-4 py-3 text-sm font-mono">{d.bookings}</td>
              <td className="px-4 py-3"><StatusBadge status={d.status}/></td>
              <td className="px-4 py-3"><button onClick={()=>setSel(d)} className="px-3 py-1 text-xs bg-transparent text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a] rounded-lg border border-white/[0.08]">Details</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {sel&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={()=>setSel(null)}>
          <div className="w-[440px] bg-[#141414] border-l border-white/[0.08] h-full overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div><h2 className="text-lg font-medium mb-1">{sel.company}</h2><StatusBadge status={sel.status}/></div>
                <button onClick={()=>setSel(null)} className="text-[#737373] hover:text-[#f5f5f5]"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4 mb-6">{[['CONTACT',sel.contact],['EMAIL',sel.email],['COUNTRY',sel.country],['PLAN',sel.plan],['BOOKINGS',String(sel.bookings)],['JOINED',sel.joined]].map(([l,v])=>(
                <div key={l}><div className="text-xs text-[#737373] mb-1">{l}</div><div className="text-sm font-mono">{v}</div></div>
              ))}</div>
              <div className="space-y-3">
                <button className="w-full py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#188f6a]">Send Message</button>
                {sel.status==='suspended'
                  ? <button className="w-full py-2 bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.2)] rounded-lg text-sm font-medium">Reactivate</button>
                  : <button className="w-full py-2 bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] rounded-lg text-sm font-medium">Suspend</button>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
