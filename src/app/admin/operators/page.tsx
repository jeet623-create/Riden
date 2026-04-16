'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'
import { Check, X } from 'lucide-react'
const operators = [
  {id:1,company:'Siam Transport Co',phone:'+66 2 123 4567',base:'Bangkok',alsoDriver:true,verified:true,status:'active',joined:'2025-11-15',fleet:[{type:'Sedan',plate:'BKK-1234',model:'Toyota Camry'},{type:'Van',plate:'BKK-5678',model:'Toyota Hiace'}]},
  {id:2,company:'Northern Routes Ltd',phone:'+66 53 234 5678',base:'Chiang Mai',alsoDriver:false,verified:true,status:'active',joined:'2026-01-20',fleet:[{type:'SUV',plate:'CMI-9012',model:'Toyota Fortuner'}]},
  {id:3,company:'Island Express',phone:'+66 76 345 6789',base:'Phuket',alsoDriver:true,verified:false,status:'in_pool',joined:'2026-04-10',fleet:[{type:'Van',plate:'PKT-3456',model:'Mercedes-Benz V-Class'},{type:'Sedan',plate:'PKT-7890',model:'BMW 5 Series'}]},
]
export default function Page() {
  const [sel, setSel] = useState<typeof operators[0]|null>(null)
  const [q, setQ] = useState('')
  const filtered = operators.filter(o=>!q||o.company.toLowerCase().includes(q.toLowerCase())||o.base.toLowerCase().includes(q.toLowerCase()))
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-medium">Operators</h1><p className="text-sm text-[#737373] font-mono mt-0.5">{operators.length} operators</p></div>
        <Input icon="search" placeholder="Search operators..." className="w-64" value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-white/[0.08]">{['Company','Phone','Base','Also Driver','Verified','Status','Joined',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase">{h}</th>)}</tr></thead>
        <tbody>{filtered.map((o,i)=><tr key={i} className="border-b border-white/[0.04] hover:bg-[#1a1a1a] transition-colors">
          <td className="px-4 py-3 text-sm font-medium">{o.company}</td>
          <td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{o.phone}</td>
          <td className="px-4 py-3 text-sm">{o.base}</td>
          <td className="px-4 py-3">{o.alsoDriver?<Check className="w-4 h-4 text-[#22c55e]"/>:<span className="text-[#737373]">-</span>}</td>
          <td className="px-4 py-3">{o.verified?<Check className="w-4 h-4 text-[#22c55e]"/>:<span className="text-[#737373]">-</span>}</td>
          <td className="px-4 py-3"><StatusBadge status={o.status}/></td>
          <td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{o.joined}</td>
          <td className="px-4 py-3"><button onClick={()=>setSel(o)} className="px-3 py-1 text-xs bg-transparent text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a] rounded-lg border border-white/[0.08]">Details</button></td>
        </tr>)}</tbody></table>
      </div>
      {sel&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={()=>setSel(null)}>
          <div className="w-[440px] bg-[#141414] border-l border-white/[0.08] h-full overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6"><div><h2 className="text-lg font-medium mb-1">{sel.company}</h2><StatusBadge status={sel.status}/></div><button onClick={()=>setSel(null)} className="text-[#737373] hover:text-[#f5f5f5]"><X className="w-5 h-5"/></button></div>
              <div className="space-y-4 mb-6">{[['PHONE',sel.phone],['BASE',sel.base],['ALSO DRIVER',sel.alsoDriver?'Yes':'No'],['VERIFIED',sel.verified?'Yes':'No'],['JOINED',sel.joined]].map(([l,v])=><div key={l}><div className="text-xs text-[#737373] mb-1">{l}</div><div className="text-sm font-mono">{v}</div></div>)}</div>
              <div className="mb-6"><div className="text-xs text-[#737373] mb-3">FLEET ({sel.fleet.length})</div><div className="space-y-2">{sel.fleet.map((v,i)=><div key={i} className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-3"><div className="flex justify-between mb-1"><span className="text-sm font-medium">{v.type}</span><span className="text-xs text-[#737373] font-mono">{v.plate}</span></div><div className="text-xs text-[#a3a3a3]">{v.model}</div></div>)}</div></div>
              <div className="space-y-3">{!sel.verified&&<button className="w-full py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#188f6a]">Verify Operator</button>}<button className="w-full py-2 bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] rounded-lg text-sm font-medium">Suspend</button></div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
