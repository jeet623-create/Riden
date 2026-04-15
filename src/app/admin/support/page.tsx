'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AdminShell } from '@/components/AdminShell'
import { Panel, Badge, Loading, PageHeader, Btn, Empty } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' })
export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any|null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('all')
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
    const r = await fetch(SUPA + '/rest/v1/support_tickets?select=*,dmc_users(company_name,email)&order=created_at.desc', { headers: H() })
    const d = await r.json()
    setTickets(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    await fetch(SUPA + '/rest/v1/support_replies', { method:'POST', headers:H(), body:JSON.stringify({ ticket_id:selected.id, message:reply, sender:'admin' }) })
    await fetch(SUPA + '/rest/v1/support_tickets?id=eq.' + selected.id, { method:'PATCH', headers:H(), body:JSON.stringify({ status:'replied', updated_at:new Date().toISOString() }) })
    setReply(''); setSending(false); await load()
    setSelected((prev: any) => prev ? { ...prev, status: 'replied' } : null)
  }
  async function closeTicket(id: string) {
    await fetch(SUPA + '/rest/v1/support_tickets?id=eq.' + id, { method:'PATCH', headers:H(), body:JSON.stringify({ status:'closed' }) })
    await load(); setSelected(null)
  }
  const filtered = tickets.filter(t => filter === 'all' || t.status === filter)
  const open = tickets.filter(t => t.status === 'open').length
  if (loading) return <AdminShell><Loading /></AdminShell>
  return (
    <AdminShell>
      <div style={{ display:'flex', gap:20, height:'calc(100vh - 120px)' }}>
        <div style={{ width:340, flexShrink:0, display:'flex', flexDirection:'column', gap:12 }}>
          <PageHeader title="Support Inbox" sub={open > 0 ? open + ' open tickets' : 'All clear'} />
          <div style={{ display:'flex', gap:6 }}>
            {['all','open','replied','closed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:'5px 12px', borderRadius:20, fontSize:11, border:'1px solid ' + (filter===f?'var(--teal-20)':'var(--border)'), background:filter===f?'var(--teal-10)':'transparent', color:filter===f?'var(--teal)':'var(--text-3)', cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'capitalize' as const }}>{f}</button>
            ))}
          </div>
          <Panel style={{ flex:1, overflowY:'auto' }}>
            {filtered.length === 0 ? <Empty icon="💬" message="No tickets" /> : (
              <div>
                {filtered.map(t => (
                  <div key={t.id} onClick={() => setSelected(t)} style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer', background: selected?.id === t.id ? 'var(--bg-hover)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = selected?.id === t.id ? 'var(--bg-hover)' : 'transparent')}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:500 }}>{(t.dmc_users as any)?.company_name ?? 'Unknown'}</span>
                      <Badge status={t.status ?? 'open'} />
                    </div>
                    <div style={{ fontSize:12, fontWeight:500, marginBottom:3 }}>{t.subject ?? '(No subject)'}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{t.message}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginTop:4, fontFamily:'var(--font-mono)' }}>{new Date(t.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ height:56 }} />
          {!selected ? (
            <Panel style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><Empty icon="💬" message="Select a ticket to view" /></Panel>
          ) : (
            <Panel style={{ flex:1, display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:3 }}>{selected.subject ?? '(No subject)'}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>{(selected.dmc_users as any)?.company_name ?? '—'} · {(selected.dmc_users as any)?.email ?? selected.user_email}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Badge status={selected.status ?? 'open'} />
                  {selected.status !== 'closed' && <Btn variant="ghost" size="sm" onClick={() => closeTicket(selected.id)}>Close</Btn>}
                </div>
              </div>
              <div style={{ flex:1, padding:'20px 24px', overflowY:'auto' }}>
                <div style={{ background:'var(--bg-elevated)', borderRadius:'var(--r-lg)', padding:'14px 18px', fontSize:14, lineHeight:1.6, marginBottom:16 }}>{selected.message}</div>
                <div style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text-3)' }}>RECEIVED — {new Date(selected.created_at).toLocaleString('en-GB')}</div>
              </div>
              {selected.status !== 'closed' && (
                <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
                  <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." style={{ flex:1, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'10px 14px', fontSize:13, color:'var(--text-1)', fontFamily:'var(--font-body)', resize:'none', outline:'none', height:80 }}
                    onFocus={e => (e.target.style.borderColor = 'var(--teal)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <Btn variant="teal" onClick={sendReply} disabled={!reply.trim()||sending}>{sending?'Sending...':'Send'}</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setReply('')}>Clear</Btn>
                  </div>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </AdminShell>
  )
}