'use client'
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string,string> = { open:'badge-pending', in_progress:'badge-progress', resolved:'badge-completed', closed:'badge-cancelled' }
const PRIORITY_COLORS: Record<string,string> = { low:'text-riden-muted', normal:'text-blue-400', high:'text-yellow-400', urgent:'text-red-400' }
const SOURCE_ICONS: Record<string,string> = { dmc_portal:'🏢', line_operator:'📱', line_driver:'🚗', admin:'🛡️' }

export default function AdminSupport() {
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [tickets, setTickets] = useState<any[]>([])
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const t = lang==='en' ? { title:'Support Tickets', open:'Open', inProgress:'In Progress', resolved:'Resolved', all:'All', noData:'No tickets found', send:'Send Reply', resolve:'Resolve', close:'Close', internal:'Internal note (not shown to user)', yourReply:'Your reply...' } : { title:'ต๋วซัพพอร์ต', open:'เปิดอยู่', inProgress:'กำลังดำเนินการ', resolved:'แก้ไขแล้ว', all:'ทั้งหมด', noData:'ไม่พบต๋ว', send:'ส่งคำตอบ', resolve:'แก้ไขแล้ว', close:'ปิด', internal:'บันทึกภายใน', yourReply:'คำตอบของคุณ...' }

  useEffect(() => {
    const s = localStorage.getItem('riden_admin'); if(s) setLang(JSON.parse(s).lang||'en')
    loadTickets()
  }, [])

  async function loadTickets() {
    const { data } = await createClient().from('support_tickets').select('*, dmc_users(company_name), operators(company_name), drivers(full_name)').order('created_at',{ascending:false})
    setTickets(data??[]); setLoading(false)
  }

  async function loadReplies(ticketId: string) {
    const { data } = await createClient().from('support_replies').select('*').eq('ticket_id', ticketId).order('created_at')
    setReplies(data??[])
  }

  async function openTicket(ticket: any) {
    setSelected(ticket); setReplyText(''); setIsInternal(false)
    await loadReplies(ticket.id)
    if (ticket.status === 'open') {
      await createClient().from('support_tickets').update({status:'in_progress'}).eq('id',ticket.id)
      loadTickets()
    }
  }

  async function sendReply() {
    if (!replyText.trim()) return
    const { error } = await createClient().from('support_replies').insert({ ticket_id:selected.id, sender_type:'admin', message:replyText, is_internal:isInternal })
    if (error) { toast.error(error.message); return }
    toast.success('Reply sent!'); setReplyText(''); loadReplies(selected.id)
  }

  async function updateStatus(id:string, status:string) {
    await createClient().from('support_tickets').update({status}).eq('id',id)
    toast.success('Updated!'); loadTickets()
    if (selected?.id===id) setSelected({...selected,status})
  }

  const filtered = tickets.filter(tk => statusFilter==='all' || tk.status===statusFilter)
  const openCount = tickets.filter(tk=>tk.status==='open').length
  const ipCount = tickets.filter(tk=>tk.status==='in_progress').length

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-700 text-riden-white">{t.title}</h1>
        <p className="text-riden-text text-sm">{openCount} open · {ipCount} in progress</p>
      </div>
      <div className="flex gap-2 mb-6">
        {[['all',t.all],['open',t.open],['in_progress',t.inProgress],['resolved',t.resolved]].map(([v,l])=>(
          <button key={v} onClick={()=>setStatusFilter(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter===v?'bg-riden-teal text-white':'glass text-riden-text hover:text-riden-white'}`}>{l}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 glass rounded-xl overflow-hidden">
          {loading ? <div className="p-8 text-center text-riden-text text-sm">Loading...</div> :
           filtered.length===0 ? <div className="p-8 text-center text-riden-text text-sm">{t.noData}</div> : (
            <div className="divide-y divide-riden-border">
              {filtered.map((tk:any)=>(
                <div key={tk.id} onClick={()=>openTicket(tk)} className={`px-4 py-3 cursor-pointer hover:bg-riden-card/50 transition-colors ${selected?.id===tk.id?'bg-riden-teal/10 border-l-2 border-riden-teal':''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span>{SOURCE_ICONS[tk.source]||'📩'}</span>
                      <span className="font-mono text-xs text-riden-teal">{tk.ticket_ref}</span>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[tk.status]||'badge-pending'}`}>{tk.status}</span>
                  </div>
                  <div className="text-riden-white text-sm truncate">{tk.subject}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${PRIORITY_COLORS[tk.priority]||'text-riden-muted'}`}>● {tk.priority}</span>
                    <span className="text-riden-muted text-xs">{new Date(tk.created_at).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="glass rounded-xl p-12 text-center"><div className="text-4xl mb-3">🎧</div><p className="text-riden-text">Select a ticket to view and reply</p></div>
          ) : (
            <div className="glass rounded-xl overflow-hidden flex flex-col h-[600px]">
              <div className="px-5 py-4 border-b border-riden-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-riden-teal">{selected.ticket_ref}</span>
                  <div className="flex gap-2">
                    {selected.status!=='resolved' && <button onClick={()=>updateStatus(selected.id,'resolved')} className="text-xs text-green-400 hover:underline">{t.resolve}</button>}
                    {selected.status!=='closed' && <button onClick={()=>updateStatus(selected.id,'closed')} className="text-xs text-riden-muted hover:underline">{t.close}</button>}
                  </div>
                </div>
                <div className="font-display font-600 text-riden-white">{selected.subject}</div>
                <div className="flex gap-4 mt-1 text-xs text-riden-muted">
                  <span>{SOURCE_ICONS[selected.source]} {selected.source}</span>
                  <span className={PRIORITY_COLORS[selected.priority]}>● {selected.priority}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                <div className="glass rounded-xl p-3"><div className="text-xs text-riden-muted mb-1">Original Message</div><div className="text-riden-white text-sm">{selected.message}</div></div>
                {replies.map((r:any)=>(
                  <div key={r.id} className={`rounded-xl p-3 ${r.sender_type==='admin'?'bg-riden-teal/10 ml-4':'glass mr-4'} ${r.is_internal?'border border-yellow-400/30':''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-riden-muted">{r.sender_type==='admin'?'👤 Admin':r.sender_type}</span>
                      {r.is_internal && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">Internal</span>}
                      <span className="text-xs text-riden-muted ml-auto">{new Date(r.created_at).toLocaleString('en',{hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                    <div className="text-riden-white text-sm">{r.message}</div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-riden-border">
                <textarea className="riden-input resize-none w-full mb-3 text-sm" rows={3} placeholder={t.yourReply} value={replyText} onChange={e=>setReplyText(e.target.value)} />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-riden-text cursor-pointer">
                    <input type="checkbox" checked={isInternal} onChange={e=>setIsInternal(e.target.checked)} className="accent-yellow-400" />
                    {t.internal}
                  </label>
                  <button onClick={sendReply} disabled={!replyText.trim()} className="btn-primary px-5 py-2 text-sm">{t.send}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
