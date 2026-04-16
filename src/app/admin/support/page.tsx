'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { MessageSquare } from 'lucide-react'
const tickets = [
  {id:1,company:'Bangkok Express DMC',status:'open',subject:'Payment processing issue',message:'We are experiencing difficulties processing our subscription payment.',email:'contact@bangkokexpress.com',date:'2026-04-15 10:30',fullMessage:'We are experiencing difficulties processing our subscription payment. When we try to update our payment method, we get an error message. Could you please help us resolve this issue?'},
  {id:2,company:'Chiang Mai Adventures',status:'replied',subject:'Question about driver verification',message:'How long does the driver verification process typically take?',email:'info@cmadventures.com',date:'2026-04-14 14:20',fullMessage:'How long does the driver verification process typically take? We have submitted 3 driver applications and want to know when we can expect them to be approved.'},
  {id:3,company:'Phuket Premier DMC',status:'open',subject:'Upgrade to Pro plan',message:'We would like to upgrade our account from Growth to Pro plan...',email:'hello@phuketpremier.com',date:'2026-04-13 09:15',fullMessage:'We would like to upgrade our account from Growth to Pro plan. Can you help us with this upgrade and let us know if there will be any changes to our billing cycle?'},
  {id:4,company:'Krabi Elite Travel',status:'closed',subject:'Feature request: Calendar export',message:'It would be great to have an option to export our booking calendar...',email:'support@krabielite.com',date:'2026-04-10 16:45',fullMessage:'It would be great to have an option to export our booking calendar to external calendar applications like Google Calendar. Is this something you are planning to add?'},
]
export default function Page() {
  const [tab, setTab] = useState('Open')
  const [sel, setSel] = useState(tickets[0])
  const [reply, setReply] = useState('')
  const filtered = tab==='All'?tickets:tickets.filter(t=>t.status===tab.toLowerCase())
  const openCount = tickets.filter(t=>t.status==='open').length
  return (
    <AdminShell>
      <div className="flex gap-6 h-[calc(100vh-88px)]">
        <div className="w-[340px] flex-shrink-0">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4"><h1 className="text-xl font-medium">Support Inbox</h1><span className="bg-[rgba(29,158,117,0.1)] text-[#1D9E75] px-2.5 py-1 rounded-full text-xs font-medium font-mono">{openCount} OPEN</span></div>
            <div className="flex gap-2 mb-4">{['All','Open','Replied','Closed'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${tab===t?'bg-[#1D9E75] text-white':'bg-[#141414] text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]'}`}>{t}</button>)}</div>
          </div>
          <div className="space-y-2">{filtered.map(t=><button key={t.id} onClick={()=>setSel(t)} className={`w-full text-left p-4 rounded-lg border transition-all ${sel?.id===t.id?'bg-[#1a1a1a] border-white/[0.12]':'bg-[#141414] border-white/[0.08] hover:border-white/[0.12]'}`}><div className="flex items-start justify-between mb-2"><span className="text-sm font-medium">{t.company}</span><StatusBadge status={t.status} variant="small"/></div><div className="text-sm font-medium mb-1">{t.subject}</div><div className="text-xs text-[#737373] mb-2 line-clamp-2">{t.message}</div><div className="text-[10px] text-[#737373] font-mono">{t.date}</div></button>)}</div>
        </div>
        <div className="flex-1 bg-[#141414] border border-white/[0.08] rounded-lg flex flex-col">
          {sel?(
            <>
              <div className="p-6 border-b border-white/[0.08]"><div className="flex items-start justify-between mb-2"><h2 className="text-lg font-medium">{sel.subject}</h2><StatusBadge status={sel.status}/></div><div className="text-sm text-[#737373]">{sel.company} • {sel.email}</div></div>
              <div className="flex-1 p-6 overflow-y-auto"><div className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-4 mb-4"><p className="text-sm mb-3">{sel.fullMessage}</p><div className="text-xs text-[#737373] font-mono">Received: {sel.date}</div></div></div>
              <div className="p-6 border-t border-white/[0.08]">
                <label className="text-xs text-[#737373] mb-2 block">REPLY</label>
                <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..." rows={4} className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-[#f5f5f5] placeholder:text-[#737373] focus:outline-none focus:border-[#1D9E75] resize-none mb-3"/>
                <div className="flex gap-2"><button className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#188f6a]">Send Reply</button><button onClick={()=>setReply('')} className="px-4 py-2 bg-transparent text-[#a3a3a3] hover:text-[#f5f5f5] rounded-lg text-sm">Clear</button>{sel.status==='open'&&<button className="px-4 py-2 bg-[#1a1a1a] border border-white/[0.08] text-[#a3a3a3] rounded-lg text-sm ml-auto">Close Ticket</button>}</div>
              </div>
            </>
          ):(
            <div className="flex-1 flex items-center justify-center"><div className="text-center"><MessageSquare className="w-12 h-12 text-[#737373] mx-auto mb-3 opacity-20"/><p className="text-[#737373]">Select a ticket to view</p></div></div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
