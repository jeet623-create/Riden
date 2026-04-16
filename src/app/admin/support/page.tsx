'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Badge, Loading, Btn } from '@/components/ui'

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY })

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return }
      sb.from('admin_users').select('id').eq('id', user.id).single().then(({ data }) => {
        if (!data) router.push('/admin/login'); else load()
      })
    })
  }, [])

  async function load() {
    setLoading(true)
    const r = await fetch(SUPA+'/rest/v1/support_tickets?select=*,dmc_users(company_name,email)&order=created_at.desc', { headers: H() })
    const d = await r.json()
    setTickets(Array.isArray(d)?d:[])
    setLoading(false)
  }

  async function sendReply() {
    if (!reply.trim()||!selected) return
    setSending(true)
    await fetch(SUPA+'/rest/v1/support_replies', { method:'POST', headers:{...H(),'Content-Type':'application/json','Prefer':'return=minimal'}, body: JSON.stringify({ ticket_id:selected.id, message:reply.trim(), is_admin:true }) })
    await fetch(SUPA+'/rest/v1/support_tickets?id=eq.'+selected.id, { method:'PATCH', headers:{...H(),'Content-Type':'application/json'}, body: JSON.stringify({ status:'replied' }) })
    setReply('')
    setSending(false)
    load()
  }

  async function closeTicket() {
    if (!selected) return
    await fetch(SUPA+'/rest/v1/support_tickets?id=eq.'+selected.id, { method:'PATCH', headers:{...H(),'Content-Type':'application/json'}, body: JSON.stringify({ status:'closed' }) })
    setTickets(prev=>prev.map(t=>t.id===selected.id?{...t,status:'closed'}:t))
    setSelected((p: any)=>({...p,status:'closed'}))
  }

  const filtered = tickets.filter(t => {
    const ms = !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || (t.dmc_users as any)?.company_name?.toLowerCase().includes(search.toLowerCase())
    const mf = filter==='all' || t.status===filter
    return ms && mf
  })

  function ago(d: string) {
    const m = Math.floor((Date.now()-new Date(d).getTime())/60000)
    if(m<1) return 'just now'
    if(m<60) return m+'m ago'
    const h=Math.floor(m/60)
    if(h<24) return h+'h ago'
    return Math.floor(h/24)+'d ago'
  }

  if (loading) return <AdminShell><Loading /></AdminShell>

  return (
    <AdminShell>
      <div style={{ display:'flex', height:'calc(100vh - 112px)', gap:0, margin:-28, marginTop:0 }}>
        {/* Left panel */}
        <div style={{ width:340, borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' as const, flexShrink:0 }}>
          <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:16, fontWeight:600, color:'var(--text-1)' }}>Support Inbox</div>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>{tickets.length===0?'All clear':tickets.filter(t=>t.status==='open').length+' open'}</span>
            </div>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:12 }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search tickets...' style={{ width:'100%', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'6px 10px 6px 28px', fontSize:12, color:'var(--text-1)', outline:'none' }} onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </div>
            <div style={{ display:'flex', gap:4, marginTop:10 }}>
              {['all','open','replied','closed'].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{ padding:'4px 10px', borderRadius:20, fontSize:11, cursor:'pointer', border:'1px solid', background:filter===f?'var(--teal-10)':'transparent', borderColor:filter===f?'var(--teal-20)':'var(--border)', color:filter===f?'var(--teal)':'var(--text-3)', textTransform:'capitalize' as const, fontFamily:'var(--font-body)' }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto' as const }}>
            {filtered.length===0?(
              <div style={{ padding:'40px 20px', textAlign:'center' as const, color:'var(--text-3)', fontSize:13 }}>No tickets</div>
            ):filtered.map(t=>(
              <div key={t.id} onClick={()=>setSelected(t)} style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background 0.1s', background:selected?.id===t.id?'var(--bg-hover)':'transparent' }} onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-hover)')} onMouseLeave={e=>(e.currentTarget.style.background=selected?.id===t.id?'var(--bg-hover)':'transparent')}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:'var(--text-1)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, paddingRight:8 }}>{(t.dmc_users as any)?.company_name||'Unknown'}</span>
                  <Badge status={t.status||'open'} />
                </div>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--text-2)', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{t.subject}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, marginBottom:4 }}>{t.message?.substring(0,80)}...</div>
                <div style={{ fontSize:10, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>{t.created_at?ago(t.created_at):''}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Right panel */}
        <div style={{ flex:1, display:'flex', flexDirection:'column' as const }}>
          {!selected?(
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ textAlign:'center' as const, color:'var(--text-3)' }}>
                <div style={{ fontSize:32, marginBottom:8, opacity:0.3 }}>💬</div>
                <div style={{ fontSize:14 }}>Select a ticket to view</div>
              </div>
            </div>
          ):(
            <>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:'var(--text-1)', marginBottom:3 }}>{selected.subject}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>{(selected.dmc_users as any)?.company_name} · {(selected.dmc_users as any)?.email}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <Badge status={selected.status||'open'} />
                  {selected.status!=='closed'&&<Btn variant='ghost' size='sm' onClick={closeTicket}>Close</Btn>}
                </div>
              </div>
              <div style={{ flex:1, padding:'20px 24px', overflowY:'auto' as const }}>
                <div style={{ background:'var(--bg-elevated)', borderRadius:'var(--r-xl)', padding:'14px 18px', marginBottom:8, lineHeight:1.6, fontSize:14, color:'var(--text-1)' }}>{selected.message}</div>
                <div style={{ fontSize:10, color:'var(--text-3)', fontFamily:'var(--font-mono)', marginBottom:20 }}>RECEIVED — {selected.created_at?new Date(selected.created_at).toLocaleString('en-GB'):'—'}</div>
              </div>
              {selected.status!=='closed'&&(
                <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
                  <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder='Type your reply...' rows={3} style={{ flex:1, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'10px 12px', fontSize:13, color:'var(--text-1)', outline:'none', resize:'none' as const, fontFamily:'var(--font-body)' }} onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
                  <div style={{ display:'flex', flexDirection:'column' as const, gap:6 }}>
                    <Btn variant='teal' size='sm' disabled={!reply.trim()||sending} onClick={sendReply}>{sending?'Sending...':'Send'}</Btn>
                    <Btn variant='ghost' size='sm' onClick={()=>setReply('')}>Clear</Btn>
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
