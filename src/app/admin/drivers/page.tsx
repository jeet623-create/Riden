'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { X, ZoomIn } from 'lucide-react'
const drivers = [
  {id:1,name:'Somchai Pattana',vehicle:'Toyota Camry',plate:'BKK-1234',phone:'+66 82 123 4567',location:'Bangkok',status:'pending'},
  {id:2,name:'Niran Chaiwong',vehicle:'Honda Accord',plate:'CMI-5678',phone:'+66 85 234 5678',location:'Chiang Mai',status:'active'},
  {id:3,name:'Prasert Suksawat',vehicle:'Toyota Fortuner',plate:'PKT-9012',phone:'+66 87 345 6789',location:'Phuket',status:'pending'},
  {id:4,name:'Wichai Yongyut',vehicle:'Mercedes-Benz E-Class',plate:'BKK-3456',phone:'+66 89 456 7890',location:'Bangkok',status:'active'},
  {id:5,name:'Anan Rattana',vehicle:'BMW 5 Series',plate:'KBI-7890',phone:'+66 81 567 8901',location:'Krabi',status:'inactive'},
  {id:6,name:'Sutin Nakornsri',vehicle:'Toyota Alphard',plate:'BKK-2345',phone:'+66 84 678 9012',location:'Bangkok',status:'pending'},
]
export default function Page() {
  const [tab, setTab] = useState('Pending')
  const [sel, setSel] = useState<typeof drivers[0]|null>(null)
  const [lightbox, setLightbox] = useState(false)
  const [rejection, setRejection] = useState('')
  const pendingCount = drivers.filter(d=>d.status==='pending').length
  const filtered = tab==='All'?drivers:drivers.filter(d=>d.status===tab.toLowerCase())
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><h1 className="text-2xl font-medium">Driver Verification</h1><span className="bg-[rgba(245,158,11,0.1)] text-[#f59e0b] px-3 py-1 rounded-full text-xs font-medium font-mono">{pendingCount} PENDING</span></div>
      </div>
      <div className="flex gap-2 mb-6">{['All','Pending','Active','Inactive'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab===t?'bg-[#1D9E75] text-white':'bg-[#141414] text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]'}`}>{t==='Pending'?`Pending (${pendingCount})`:t}</button>)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(d=>(
          <div key={d.id} className="bg-[#141414] border border-white/[0.08] rounded-lg overflow-hidden hover:border-white/[0.12] transition-all hover:-translate-y-0.5">
            <div className="h-[150px] bg-[#1a1a1a] relative flex items-center justify-center">
              <div className="text-[#737373] text-xs">Vehicle Photo</div>
              <div className="absolute top-2 right-2"><StatusBadge status={d.status} variant="small"/></div>
              {d.status==='pending'&&<div className="absolute top-2 left-2 bg-[#f59e0b] text-white px-2 py-0.5 rounded text-[10px] font-medium">REVIEW</div>}
            </div>
            <div className="p-4">
              <div className="font-medium mb-1">{d.name}</div>
              <div className="text-xs text-[#737373] mb-3">{d.vehicle} • {d.plate}</div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3"><div><div className="text-[#737373]">Phone</div><div className="font-mono text-[11px]">{d.phone}</div></div><div><div className="text-[#737373]">Location</div><div>{d.location}</div></div></div>
              {d.status==='pending'&&<div className="flex gap-2"><button onClick={()=>setSel(d)} className="flex-1 py-1.5 bg-[#1D9E75] text-white rounded-lg text-xs font-medium hover:bg-[#188f6a]">Approve</button><button onClick={()=>setSel(d)} className="flex-1 py-1.5 bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] rounded-lg text-xs font-medium">Reject</button></div>}
            </div>
          </div>
        ))}
      </div>
      {sel&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={()=>setSel(null)}>
          <div className="w-[440px] bg-[#141414] border-l border-white/[0.08] h-full overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6"><h2 className="text-lg font-medium">{sel.name}</h2><button onClick={()=>setSel(null)} className="text-[#737373] hover:text-[#f5f5f5]"><X className="w-5 h-5"/></button></div>
              <div className="h-[200px] bg-[#1a1a1a] rounded-lg mb-6 flex items-center justify-center cursor-pointer hover:bg-[#222]" onClick={()=>setLightbox(true)}><div className="text-center"><ZoomIn className="w-6 h-6 text-[#737373] mx-auto mb-2"/><div className="text-xs text-[#737373]">Click to enlarge</div></div></div>
              <div className="space-y-4 mb-6">{[['VEHICLE',sel.vehicle],['PLATE',sel.plate],['PHONE',sel.phone],['LOCATION',sel.location]].map(([l,v])=><div key={l}><div className="text-xs text-[#737373] mb-1">{l}</div><div className="text-sm font-mono">{v}</div></div>)}</div>
              {sel.status==='pending'&&<><div className="mb-4"><label className="text-xs text-[#737373] mb-2 block">REJECTION REASON (OPTIONAL)</label><textarea value={rejection} onChange={e=>setRejection(e.target.value)} placeholder="Enter reason..." rows={3} className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-[#f5f5f5] placeholder:text-[#737373] focus:outline-none focus:border-[#1D9E75] resize-none"/></div><div className="space-y-3"><button className="w-full py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#188f6a]">Approve Driver</button><button className="w-full py-2 bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] rounded-lg text-sm font-medium">Reject Application</button></div></>}
            </div>
          </div>
        </div>
      )}
      {lightbox&&<div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center" onClick={()=>setLightbox(false)}><div className="bg-[#1a1a1a] p-4 rounded-lg"><div className="text-center text-[#737373]">Vehicle Photo (Full Size)</div></div></div>}
    </AdminShell>
  )
}
