'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = ['general','booking','payment','driver','technical','billing','other']
const PRIORITIES = ['low','normal','high','urgent']
const STATUS_COLORS: Record<string,string> = { open:'badge-pending', in_progress:'badge-progress', resolved:'badge-completed', closed:'badge-cancelled' }

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject:'', message:'', category:'general', priority:'normal' })
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await sb.from('support_tickets').select('*').eq('dmc_id', user.id).order('created_at',{ascending:false})
      setTickets(data??[]); setLoading(false)
    }
    load()
  }, [router])

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    const { error } = await sb.from('support_tickets').insert({ dmc_id:user.id, source:'dmc_portal', subject:form.subject, message:form.message, category:form.category, priority:form.priority })
    if (error) { toast.error(error.message); setSubmitting(false); return }
    toast.success('Ticket submitted! We will respond within 24 hours.')
    setShowForm(false); setForm({ subject:'', message:'', category:'general', priority:'normal' })
    const { data } = await sb.from('support_tickets').select('*').eq('dmc_id', user.id).order('created_at',{ascending:false})
    setTickets(data??[]); setSubmitting(false)
  }

  async function openTicket(ticket: any) {
    setSelected(ticket)
    const { data } = await createClient().from('support_replies').select('*').eq('ticket_id',ticket.id).order('created_at').neq('is_internal',true)
    setReplies(data??[])
  }

  async function sendReply() {
    if (!replyText.trim()) return
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    await sb.from('support_replies').insert({ ticket_id:selected.id, sender_type:'dmc', sender_id:user?.id, message:replyText })
    setReplyText('')
    const { data } = await createClient().from('support_replies').select('*').eq('ticket_id',selected.id).order('created_at').neq('is_internal',true)
    setReplies(data??[])
    toast.success('Reply sent!')
  }

  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-riden-muted hover:text-riden-text"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></Link>
          <div className="w-px h-5 bg-riden-border" />
          <span className="font-display text-riden-white font-600">🎧 Support</span>
        </div>
        <button onClick={()=>setShowForm(true)} className="btn-primary px-4 py-2 text-sm">+ New Ticket</button>
      </nav>
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {loading ? <div className="text-center text-riden-text py-12">Loading...</div> : (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 glass rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-riden-border"><h2 className="font-display font-600 text-riden-white text-sm">Your Tickets ({tickets.length})</h2></div>
              {tickets.length===0 ? (
                <div className="p-8 text-center"><div className="text-4xl mb-3">🎧</div><p className="text-riden-text text-sm mb-4">No tickets yet</p><button onClick={()=>setShowForm(true)} className="btn-primary px-5 py-2.5 text-sm">Create First Ticket</button></div>
              ) : (
                <div className="divide-y divide-riden-border">
                  {tickets.map((tk:any)=>(
                    <div key={tk.id} onClick={()=>openTicket(tk)} className={`px-4 py-3 cursor-pointer hover:bg-riden-card/50 transition-colors ${selected?.id===tk.id?'bg-riden-teal/10 border-l-2 border-riden-teal':''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-riden-teal">{tk.ticket_ref}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[tk.status]||'badge-pending'}`}>{tk.status}</span>
                      </div>
                      <div className="text-riden-white text-sm truncate">{tk.subject}</div>
                      <div className="text-riden-muted text-xs mt-0.5">{new Date(tk.created_at).toLocaleDateString('en',{month:'short',day:'numeric'})}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:col-span-3">
              {!selected ? (
                <div className="glass rounded-xl p-12 text-center"><div className="text-4xl mb-3">💬</div><p className="text-riden-text">Select a ticket to view details and replies</p></div>
              ) : (
                <div className="glass rounded-xl overflow-hidden flex flex-col h-[500px]">
                  <div className="px-5 py-4 border-b border-riden-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-riden-teal">{selected.ticket_ref}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[selected.status]||'badge-pending'}`}>{selected.status}</span>
                    </div>
                    <div className="font-display font-600 text-riden-white">{selected.subject}</div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    <div className="glass rounded-xl p-3"><div className="text-xs text-riden-muted mb-1">Your Message</div><div className="text-riden-white text-sm">{selected.message}</div></div>
                    {replies.map((r:any)=>(
                      <div key={r.id} className={`rounded-xl p-3 ${r.sender_type==='admin'?'bg-riden-teal/10 ml-4':'glass mr-4'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-riden-muted">{r.sender_type==='admin'?'🛡️ RIDEN Support':'👤 You'}</span>
                          <span className="text-xs text-riden-muted">{new Date(r.created_at).toLocaleString('en',{hour:'2-digit',minute:'2-digit'})}</span>
                        </div>
                        <div className="text-riden-white text-sm">{r.message}</div>
                      </div>
                    ))}
                    {selected.status==='resolved' && <div className="text-center text-green-400 text-sm py-2">✅ This ticket has been resolved</div>}
                  </div>
                  {selected.status!=='resolved'&&selected.status!=='closed' && (
                    <div className="px-5 py-4 border-t border-riden-border flex gap-3">
                      <input className="riden-input flex-1 text-sm" placeholder="Type your reply..." value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendReply()} />
                      <button onClick={sendReply} disabled={!replyText.trim()} className="btn-primary px-4 py-2 text-sm">Send</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-display font-700 text-riden-white text-lg mb-5">New Support Ticket</h2>
            <form onSubmit={submitTicket} className="space-y-4">
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Subject *</label><input className="riden-input" placeholder="Brief description of your issue" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Category</label>
                  <select className="riden-input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{colorScheme:'dark'}}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Priority</label>
                  <select className="riden-input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{colorScheme:'dark'}}>
                    {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Message *</label><textarea className="riden-input resize-none" rows={4} placeholder="Describe your issue in detail..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required /></div>
              <div className="flex gap-3">
                <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost flex-1 py-3">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3">{submitting?'Submitting...':'Submit Ticket'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
