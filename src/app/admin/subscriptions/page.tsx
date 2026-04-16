'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
const subs = [
  {company:'Bangkok Express DMC',email:'contact@bangkokexpress.com',plan:'growth',amount:'฿4,000',start:'2025-11-20',end:'2026-11-20',status:'active'},
  {company:'Chiang Mai Adventures',email:'info@cmadventures.com',plan:'starter',amount:'฿2,000',start:'2026-04-01',end:'2026-04-30',status:'trial'},
  {company:'Phuket Premier DMC',email:'hello@phuketpremier.com',plan:'pro',amount:'฿6,000',start:'2025-08-15',end:'2026-08-15',status:'active'},
  {company:'Krabi Elite Travel',email:'support@krabielite.com',plan:'growth',amount:'฿4,000',start:'2026-01-10',end:'2027-01-10',status:'active'},
]
const plans = [{name:'Starter',price:2000},{name:'Growth',price:4000},{name:'Pro',price:6000}]
export default function Page() {
  const [modal, setModal] = useState(false)
  const [plan, setPlan] = useState('Growth')
  const [months, setMonths] = useState(12)
  const [dmc, setDmc] = useState('')
  const [errors, setErrors] = useState<Record<string,string>>({})
  const total = (plans.find(p=>p.name===plan)?.price??0)*months
  const activate = () => {
    const e: Record<string,string> = {}
    if(!dmc) e.dmc='Please select a DMC'
    if(months<1||months>24) e.months='Months must be between 1 and 24'
    setErrors(e); if(!Object.keys(e).length){setModal(false);setDmc('');setMonths(12);setErrors({})}
  }
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-medium">Subscriptions</h1><p className="text-sm text-[#737373] font-mono mt-0.5">Manage DMC subscription plans</p></div>
        <button onClick={()=>setModal(true)} className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#188f6a]">Activate Plan</button>
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-white/[0.08]">{['Company','Email','Plan','Amount','Start','End','Status'].map(h=><th key={h} className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase">{h}</th>)}</tr></thead>
        <tbody>{subs.map((s,i)=><tr key={i} className="border-b border-white/[0.04] hover:bg-[#1a1a1a]">
          <td className="px-4 py-3 text-sm font-medium">{s.company}</td><td className="px-4 py-3 text-sm text-[#737373]">{s.email}</td>
          <td className="px-4 py-3 text-sm font-mono capitalize">{s.plan}</td><td className="px-4 py-3 text-sm font-mono text-[#22c55e]">{s.amount}</td>
          <td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{s.start}</td><td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{s.end}</td>
          <td className="px-4 py-3"><StatusBadge status={s.status}/></td>
        </tr>)}</tbody></table>
      </div>
      {modal&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setModal(false)}>
          <div className="bg-[#141414] border border-white/[0.08] rounded-xl max-w-md w-full" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-white/[0.08]"><h2 className="text-lg font-medium">Activate Subscription</h2></div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs text-[#737373] mb-2 block">DMC COMPANY</label>
                <select value={dmc} onChange={e=>{setDmc(e.target.value);setErrors({...errors,dmc:''})}} className={`w-full bg-[#1a1a1a] border rounded-lg px-4 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:border-[#1D9E75] ${errors.dmc?'border-[#ef4444]':'border-white/[0.08]'}`}>
                  <option value="">Select DMC...</option><option value="new">New DMC Company</option><option value="bkk">Bangkok Express DMC</option><option value="pkt">Phuket Premier DMC</option>
                </select>{errors.dmc&&<div className="text-xs text-[#ef4444] mt-1">{errors.dmc}</div>}
              </div>
              <div><label className="text-xs text-[#737373] mb-2 block">PLAN</label>
                <div className="grid grid-cols-3 gap-2">{plans.map(p=><button key={p.name} onClick={()=>setPlan(p.name)} className={`p-3 rounded-lg border text-center transition-all ${plan===p.name?'bg-[rgba(29,158,117,0.1)] border-[#1D9E75] text-[#1D9E75]':'bg-[#1a1a1a] border-white/[0.08] text-[#a3a3a3]'}`}><div className="text-xs font-medium mb-1">{p.name}</div><div className="font-mono text-xs">฿{p.price.toLocaleString()}/mo</div></button>)}</div>
              </div>
              <div><label className="text-xs text-[#737373] mb-2 block">MONTHS</label>
                <input type="number" value={months} onChange={e=>{setMonths(Number(e.target.value));setErrors({...errors,months:''})}} min="1" max="24" className={`w-full bg-[#1a1a1a] border rounded-lg px-4 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:border-[#1D9E75] ${errors.months?'border-[#ef4444]':'border-white/[0.08]'}`}/>
                {errors.months&&<div className="text-xs text-[#ef4444] mt-1">{errors.months}</div>}
              </div>
              <div className="bg-[rgba(29,158,117,0.1)] border border-[rgba(29,158,117,0.2)] rounded-lg p-4 flex items-center justify-between"><span className="text-sm text-[#737373]">Total Amount</span><span className="font-mono text-xl text-[#1D9E75]">฿{total.toLocaleString()}</span></div>
            </div>
            <div className="p-6 border-t border-white/[0.08] flex gap-3"><button onClick={()=>setModal(false)} className="flex-1 py-2 bg-[#1a1a1a] border border-white/[0.08] text-[#a3a3a3] rounded-lg text-sm">Cancel</button><button onClick={activate} className="flex-1 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium">Activate</button></div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
