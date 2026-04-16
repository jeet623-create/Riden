'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/admin/input'

const vehicles = [
  {id:1,plate:'BKK-1234',type:'Van 9',brand:'Toyota HiAce',color:'White',seats:9,operator:'Siam Transport Co',driver:'Somchai P.',status:'active'},
  {id:2,plate:'BKK-5678',type:'Sedan',brand:'Toyota Camry',color:'Silver',seats:4,operator:'Siam Transport Co',driver:'Niran C.',status:'active'},
  {id:3,plate:'CMI-9012',type:'SUV',brand:'Toyota Fortuner',color:'Black',seats:7,operator:'Northern Routes Ltd',driver:'Prasert S.',status:'active'},
  {id:4,plate:'PKT-3456',type:'Van 12',brand:'Mercedes-Benz V-Class',color:'White',seats:12,operator:'Island Express',driver:'Unassigned',status:'inactive'},
  {id:5,plate:'PKT-7890',type:'Sedan',brand:'BMW 5 Series',color:'Black',seats:4,operator:'Island Express',driver:'Wichai Y.',status:'active'},
  {id:6,plate:'BKK-2345',type:'Van 9',brand:'Toyota Alphard',color:'White',seats:9,operator:'Siam Transport Co',driver:'Sutin N.',status:'active'},
]

export default function Page() {
  const [q, setQ] = useState('')
  const filtered = vehicles.filter(v=>!q||v.plate.toLowerCase().includes(q.toLowerCase())||v.brand.toLowerCase().includes(q.toLowerCase())||v.operator.toLowerCase().includes(q.toLowerCase()))
  const active = vehicles.filter(v=>v.status==='active').length
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-medium">Vehicles</h1><p className="text-sm text-[#737373] font-mono mt-0.5">{vehicles.length} total · {active} active</p></div>
        <Input icon="search" placeholder="Search vehicles..." className="w-64" value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[{label:'Total',value:vehicles.length,color:'var(--text-1)'},{label:'Active',value:active,color:'#22c55e'},{label:'Inactive',value:vehicles.length-active,color:'#f59e0b'},{label:'Unassigned',value:vehicles.filter(v=>v.driver==='Unassigned').length,color:'#ef4444'}].map(s=>(
          <div key={s.label} className="bg-[#141414] border border-white/[0.08] rounded-xl p-5">
            <div className="text-[#737373] text-xs mb-2">{s.label}</div>
            <div className="font-mono text-3xl font-medium" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/[0.08]">{['Plate','Type','Brand','Color','Seats','Operator','Driver','Status'].map(h=><th key={h} className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase">{h}</th>)}</tr></thead>
          <tbody>{filtered.map((v,i)=>(
            <tr key={i} className="border-b border-white/[0.04] hover:bg-[#1a1a1a] transition-colors">
              <td className="px-4 py-3 text-sm font-mono font-medium text-[#1D9E75]">{v.plate}</td>
              <td className="px-4 py-3 text-sm text-[#737373]">{v.type}</td>
              <td className="px-4 py-3 text-sm font-medium">{v.brand}</td>
              <td className="px-4 py-3 text-sm text-[#a3a3a3]">{v.color}</td>
              <td className="px-4 py-3 text-sm font-mono text-center">{v.seats}</td>
              <td className="px-4 py-3 text-sm text-[#a3a3a3]">{v.operator}</td>
              <td className="px-4 py-3 text-sm" style={{color:v.driver==='Unassigned'?'#f59e0b':'inherit'}}>{v.driver}</td>
              <td className="px-4 py-3"><StatusBadge status={v.status}/></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </AdminShell>
  )
}
