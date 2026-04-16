'use client'
import { AdminShell } from '@/components/admin/admin-shell'
import { CheckCircle2 } from 'lucide-react'
const pendingDrivers = [
  {name:'Somchai Pattana',vehicle:'Toyota Camry',plate:'BKK-1234',license:'DL-12345678',phone:'+66 82 123 4567',joined:'2026-04-14'},
  {name:'Prasert Suksawat',vehicle:'Toyota Fortuner',plate:'PKT-9012',license:'DL-23456789',phone:'+66 87 345 6789',joined:'2026-04-13'},
  {name:'Sutin Nakornsri',vehicle:'Toyota Alphard',plate:'BKK-2345',license:'DL-34567890',phone:'+66 84 678 9012',joined:'2026-04-12'},
]
const pendingOperators = [
  {company:'Island Express',phone:'+66 76 345 6789',base:'Phuket',alsoDriver:true,joined:'2026-04-10'},
]
export default function Page() {
  const total = pendingDrivers.length+pendingOperators.length
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-medium">Pending Approvals</h1><p className="text-sm text-[#737373] font-mono mt-0.5">{total} items</p></div>
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl mb-6">
        <div className="px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">Drivers ({pendingDrivers.length})</h3></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-white/[0.08]">{['Name','Vehicle','Plate','License','Phone','Joined','Photo','Actions'].map((h,i)=><th key={i} className={`px-4 py-3 text-xs text-[#737373] font-medium uppercase ${i===7?'text-right':'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{pendingDrivers.map((d,i)=><tr key={i} className="border-b border-white/[0.04]">
          <td className="px-4 py-3 text-sm font-medium">{d.name}</td><td className="px-4 py-3 text-sm">{d.vehicle}</td>
          <td className="px-4 py-3 text-sm font-mono">{d.plate}</td><td className="px-4 py-3 text-sm font-mono">{d.license}</td>
          <td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{d.phone}</td><td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{d.joined}</td>
          <td className="px-4 py-3"><div className="w-8 h-8 bg-[#1a1a1a] rounded border border-white/[0.08]"/></td>
          <td className="px-4 py-3 text-right"><div className="flex gap-2 justify-end"><button className="px-3 py-1 bg-[#1D9E75] text-white rounded-lg text-xs font-medium">Approve</button><button className="px-3 py-1 bg-transparent text-[#a3a3a3] border border-white/[0.08] rounded-lg text-xs hover:text-[#f5f5f5]">View</button></div></td>
        </tr>)}</tbody></table></div>
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl">
        <div className="px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">Operators ({pendingOperators.length})</h3></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-white/[0.08]">{['Company','Phone','Base','Also Driver','Joined','Actions'].map((h,i)=><th key={i} className={`px-4 py-3 text-xs text-[#737373] font-medium uppercase ${i===5?'text-right':'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{pendingOperators.map((o,i)=><tr key={i} className="border-b border-white/[0.04]">
          <td className="px-4 py-3 text-sm font-medium">{o.company}</td><td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{o.phone}</td>
          <td className="px-4 py-3 text-sm">{o.base}</td><td className="px-4 py-3 text-sm">{o.alsoDriver?'Yes':'No'}</td>
          <td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{o.joined}</td>
          <td className="px-4 py-3 text-right"><button className="px-3 py-1 bg-[#1D9E75] text-white rounded-lg text-xs font-medium">Verify</button></td>
        </tr>)}</tbody></table></div>
      </div>
    </AdminShell>
  )
}
