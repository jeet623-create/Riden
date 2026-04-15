'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = ['general','booking','payment','driver','technical','billing','other']
const PRIORITIES = ['low','normal','high','urgent']
const STATUS_BADGE: Record<string,string> = { open:'badge-warning', in_progress:'badge-progress', resolved:'badge-completed', closed:'badge-pending' }

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
      const { data:{ user } } = await sb.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await sb.from('support_tickets').select('*').eq('dmc_id', user.id).order('created_at',{ascending:false})
      setTickets(data??[]); setLoading(false)
    }
    load()
  }, [router])

  async function submitTicket(e:React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    const sb = createClient()
    const { data:{ user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('support_tickets').insert({ dmc_id:user.id, source:'dmc_portal', subject:form.subject, message:form.message, category:form.category, priority:form.priority })
    toast.success('Ticket submitted! We will respond within 24 hours.')
    setShowForm(false); setForm({ subject:'', message:'', category:'general', priority:'normal' })
    const { data } = await createClient().from('support_tickets').select('*').eq('dmc_id', user.id).order('created_at',{ascending:false})
    setTickets(data??[]); setSubmitting(false)
  }

  async function openTicket(ticket:any) {
    setSelected(ticket)
    const { data } = await createClient().from('support_replies').select('*').eq('ticket_id',ticket.id).order('created_at').neq('is_internal',true)
    setReplies(data??[])
  }

  async function sendReply() {
    if (!replyText.trim()) return
    const sb = createClient()
    const { data:{ user } } = await sb.auth.getUser()
    await sb.from('support_replies').insert({ ticket_id:selected.id, sender_type:'dmc', sender_id:user?.id, message:replyText })
    setReplyText('')
    const { data } = await createClient().from('support_replies').select('*').eq('ticket_id',selected.id).order('created_at').neq('is_internal',true)
    setReplies(data??[]); toast.success('Reply sent!')
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
      <nav style={{background:'var(--bg-page)',borderBottom:'0.5px solid var(--border)',height:52,display:'flex',alignItems:'center',position:'sticky' as const,top:0,zIndex:50}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <a href="/dashboard" style={{color:'var(--text-tertiary)',textDecoration:'none',display:'flex'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
            <div style={{width:'0.5px',height:16,background:'var(--border)'}}/>
            <a href="/dashboard" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
              <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
            </a>
            <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Support</span>
          </div>
          <button onClick={()=>setShowForm(true)} className="btn-primary" style={{padding:'6px 14px',fontSize:12}}>+ New Ticket</button>
        </div>
      </nav>

      {showForm&&(
        <div style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.4)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div className="riden-card" style={{width:'100%',maxWidth:480,padding:28}}>
            <h2 style={{fontSize:18,fontWeight:600,marginBottom:20}}>New Support Ticket</h2>
            <form onSubmit={submitTicket} style={{display:'flex',flexDirection:'column' as const,gap:12}}>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:5}}>Subject</label>
                <input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="riden-input" placeholder="Brief description" required/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:5}}>Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="riden-input">{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label style={{display:'block',fontSize:11,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:5}}>Priority</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="riden-input">{PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}</select>
                </div>
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:5}}>Message</label>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="riden-input" rows={4} style={{resize:'vertical' as const}} placeholder="Describe your issue..." required/>
              </div>
              <div style={{display:'flex',gap:8,marginTop:4}}>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost" style={{flex:1,padding:'9px'}}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{flex:1,padding:'9px',justifyContent:'center',opacity:submitting?0.6:1}}>{submitting?'...':'Submit Ticket'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{maxWidth:1000,margin:'0 auto',padding:'24px',display:'grid',gridTemplateColumns:selected?'1fr 1fr':'1fr',gap:16}}>
        <div>
          {loading?(<div style={{padding:40,textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>):
          tickets.length===0?(
            <div className="riden-card" style={{padding:'48px 24px',textAlign:'center' as const}}>
              <p style={{fontWeight:500,fontSize:15,marginBottom:4}}>No tickets yet</p>
              <p style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:16}}>Need help? Create a support ticket.</p>
              <button onClick={()=>setShowForm(true)} className="btn-primary">Create First Ticket</button>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
              {tickets.map((tk:any)=>(
                <div key={tk.id} onClick={()=>openTicket(tk)} className="riden-card" style={{padding:'12px 16px',cursor:'pointer',borderColor:selected?.id===tk.id?'var(--accent)':'var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)'}}>{tk.ticket_ref||tk.id.slice(0,8)}</span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span className={'badge '+(STATUS_BADGE[tk.status]||'badge-pending')} style={{fontSize:10}}>{tk.status}</span>
                      <span style={{fontSize:10,color:'var(--text-tertiary)'}}>{new Date(tk.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
                    </div>
                  </div>
                  <div style={{fontWeight:500,fontSize:13,marginBottom:2}}>{tk.subject}</div>
                  <div style={{fontSize:11,color:'var(--text-secondary)',textTransform:'capitalize' as const}}>{tk.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected&&(
          <div className="riden-card" style={{overflow:'hidden',display:'flex',flexDirection:'column' as const,maxHeight:600}}>
            <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)'}}>
              <div style={{fontWeight:500,fontSize:14,marginBottom:2}}>{selected.subject}</div>
              <div style={{fontSize:11,color:'var(--text-tertiary)',textTransform:'capitalize' as const}}>{selected.category} · {selected.priority}</div>
            </div>
            <div style={{flex:1,overflowY:'auto' as const,padding:16,display:'flex',flexDirection:'column' as const,gap:10}}>
              <div style={{background:'var(--bg-page)',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:'var(--text-tertiary)',marginBottom:4}}>Your message</div>
                <div style={{fontSize:13,color:'var(--text-primary)'}}>{selected.message}</div>
              </div>
              {replies.map((r:any)=>(
                <div key={r.id} style={{background:r.sender_type==='admin'?'var(--accent-bg)':'var(--bg-page)',borderRadius:8,padding:'10px 12px',marginLeft:r.sender_type==='admin'?16:0,marginRight:r.sender_type==='dmc'?16:0}}>
                  <div style={{fontSize:10,color:'var(--text-tertiary)',marginBottom:4}}>{r.sender_type==='admin'?'RIDEN Support':'You'} · {new Date(r.created_at).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</div>
                  <div style={{fontSize:13}}>{r.message}</div>
                </div>
              ))}
            </div>
            {selected.status!=='resolved'&&selected.status!=='closed'&&(
              <div style={{padding:'12px 16px',borderTop:'0.5px solid var(--border)',display:'flex',gap:8}}>
                <input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendReply()} className="riden-input" style={{flex:1,padding:'7px 10px'}} placeholder="Type reply..."/>
                <button onClick={sendReply} disabled={!replyText.trim()} className="btn-primary" style={{padding:'7px 12px',fontSize:12}}>Send</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
