'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send } from 'lucide-react'
import { toast } from 'sonner'

const tickets = [
  {id:1,company:'Bangkok Express DMC',email:'contact@bangkokexpress.com',subject:'Payment processing issue',message:'We are experiencing difficulties processing our subscription payment. When we try to update our payment method, we get an error message.',status:'open',date:'2026-04-15 10:30'},
  {id:2,company:'Chiang Mai Adventures',email:'info@cmadventures.com',subject:'Question about driver verification',message:'How long does the driver verification process typically take? We have submitted 3 driver applications.',status:'replied',date:'2026-04-14 14:20'},
  {id:3,company:'Phuket Premier DMC',email:'hello@phuketpremier.com',subject:'Upgrade to Pro plan',message:'We would like to upgrade our account from Growth to Pro plan. Can you help us with this?',status:'open',date:'2026-04-13 09:15'},
  {id:4,company:'Krabi Elite Travel',email:'support@krabielite.com',subject:'Feature request: Calendar export',message:'It would be great to have an option to export our booking calendar to Google Calendar.',status:'closed',date:'2026-04-10 16:45'},
]

export default function SupportPage() {
  const [tab,setTab] = useState('All')
  const [sel,setSel] = useState(tickets[0])
  const [reply,setReply] = useState('')
  const [sending,setSending] = useState(false)
  const openCount = tickets.filter(t=>t.status==='open').length
  const filtered = tab==='All'?tickets:tickets.filter(t=>t.status===tab.toLowerCase())

  async function sendReply() {
    if(!reply.trim()) return
    setSending(true)
    await new Promise(r=>setTimeout(r,800))
    toast.success('Reply sent')
    setReply('')
    setSending(false)
  }

  return (
    <AdminShell>
      <div style={{display:'flex',gap:0,height:'calc(100vh - 88px)',overflow:'hidden'}}>
        {/* Left panel */}
        <div style={{width:340,flexShrink:0,display:'flex',flexDirection:'column',borderRight:'1px solid var(--border)'}}>
          <div style={{padding:'20px 16px 0',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <h1 style={{fontSize:18,fontWeight:600}}>Support Inbox</h1>
              {openCount>0&&<span style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.2)',color:'var(--amber)',borderRadius:99,padding:'2px 10px',fontFamily:'var(--font-mono)',fontSize:11}}>{openCount} open</span>}
            </div>
            <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
              {['All','Open','Replied','Closed'].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  style={{padding:'4px 12px',borderRadius:99,fontSize:11,cursor:'pointer',border:`1px solid ${tab===t?'var(--teal-20)':'var(--border)'}`,background:tab===t?'var(--teal-10)':'transparent',color:tab===t?'var(--teal)':'var(--text-3)',transition:'all 150ms'}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {filtered.map(t=>(
              <div key={t.id} onClick={()=>setSel(t)}
                style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',cursor:'pointer',background:sel?.id===t.id?'var(--bg-elevated)':'transparent',borderLeft:`2px solid ${sel?.id===t.id?'var(--teal)':'transparent'}`,transition:'all 120ms'}}
                onMouseEnter={e=>{if(sel?.id!==t.id)e.currentTarget.style.background='var(--bg-elevated)'}}
                onMouseLeave={e=>{if(sel?.id!==t.id)e.currentTarget.style.background='transparent'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:500}}>{t.company}</span>
                  <StatusBadge status={t.status} variant="small"/>
                </div>
                <div style={{fontSize:12,fontWeight:500,marginBottom:3}}>{t.subject}</div>
                <div style={{fontSize:11,color:'var(--text-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:4}}>{t.message}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)'}}>{t.date}</div>
              </div>
            ))}
            {filtered.length===0&&(
              <div style={{padding:48,textAlign:'center',color:'var(--text-3)'}}>
                <MessageSquare size={32} style={{margin:'0 auto 8px',opacity:0.2}}/>
                <div style={{fontSize:13}}>No tickets</div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{flex:1,display:'flex',flexDirection:'column',background:'var(--bg-surface)'}}>
          {!sel?(
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,color:'var(--text-3)'}}>
              <MessageSquare size={40} style={{opacity:0.2}}/>
              <div style={{fontSize:13}}>Select a ticket to view</div>
            </div>
          ):(
            <>
              <div style={{padding:'18px 24px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{sel.subject}</div>
                  <div style={{fontSize:12,color:'var(--text-2)'}}>{sel.company} · {sel.email}</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <StatusBadge status={sel.status}/>
                  {sel.status!=='closed'&&(
                    <button onClick={()=>toast.success('Ticket closed')} style={{padding:'5px 12px',borderRadius:6,fontSize:11,background:'transparent',border:'1px solid var(--border)',color:'var(--text-2)',cursor:'pointer'}}>Close</button>
                  )}
                </div>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
                <div style={{background:'var(--bg-elevated)',borderRadius:16,padding:'14px 18px',fontSize:14,lineHeight:1.6,maxWidth:600}}>{sel.message}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',marginTop:8}}>RECEIVED — {sel.date}</div>
              </div>
              {sel.status!=='closed'&&(
                <div style={{padding:'16px 24px',borderTop:'1px solid var(--border)'}}>
                  <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..." rows={4}
                    style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:12,padding:'10px 14px',fontSize:13,color:'var(--text-1)',resize:'none',outline:'none',fontFamily:'var(--font-body)',transition:'border-color 150ms'}}
                    onFocus={e=>e.target.style.borderColor='var(--teal)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                  <div style={{display:'flex',gap:8,marginTop:10}}>
                    <button onClick={sendReply} disabled={!reply.trim()||sending}
                      style={{display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:500,background:'var(--teal)',color:'white',border:'none',cursor:!reply.trim()||sending?'not-allowed':'pointer',opacity:!reply.trim()||sending?0.5:1}}>
                      <Send size={14}/>{sending?'Sending...':'Send Reply'}
                    </button>
                    <button onClick={()=>setReply('')} style={{padding:'7px 14px',borderRadius:8,fontSize:12,background:'transparent',border:'1px solid var(--border)',color:'var(--text-2)',cursor:'pointer'}}>Clear</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
