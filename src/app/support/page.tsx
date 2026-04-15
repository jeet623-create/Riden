'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DmcShell } from '@/components/DmcShell'
import { Panel, Badge, Loading, PageHeader, Btn, Empty } from '@/components/ui'
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = () => ({ apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' })
export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uid, setUid] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showForm, setShowForm] = useState(false)
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUid(user.id); load(user.id)
    })
  }, [])
  async function load(id: string) {
    setLoading(true)
    const r = await fetch(SUPA + '/rest/v1/support_tickets?dmc_id=eq.' + id + '&select=*&order=created_at.desc', { headers: H() })
    const d = await r.json()
    setTickets(Array.isArray(d) ? d : [])
    setLoading(false)
  }
  async function submit() {
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    await fetch(SUPA + '/rest/v1/support_tickets', { method: 'POST', headers: H(), body: JSON.stringify({ dmc_id: uid, subject, message, status: 'open' }) })
    setSubject(''); setMessage(''); setSending(false); setShowForm(false); await load(uid)
  }
  if (loading) return <DmcShell><Loading /></DmcShell>
  return (
    <DmcShell>
      <PageHeader title="Support" sub={tickets.length + ' tickets'} actions={<Btn variant="teal" onClick={() => setShowForm(true)}>+ New Ticket</Btn>} />
      {showForm && (
        <Panel style={{ marginBottom: 20 }}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>New Support Ticket</div>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject..." style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '9px 14px', fontSize: 13, color: 'var(--text-1)', fontFamily: 'var(--font-body)', outline: 'none', width: '100%' }} onFocus={e => (e.target.style.borderColor = 'var(--teal)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." rows={5} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '9px 14px', fontSize: 13, color: 'var(--text-1)', fontFamily: 'var(--font-body)', outline: 'none', width: '100%', resize: 'none' }} onFocus={e => (e.target.style.borderColor = 'var(--teal)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
              <Btn variant="teal" onClick={submit} disabled={!subject.trim() || !message.trim() || sending}>{sending ? 'Sending...' : 'Submit Ticket'}</Btn>
            </div>
          </div>
        </Panel>
      )}
      <Panel>
        {tickets.length === 0 ? <Empty icon="message" message="No tickets yet. Need help? Create a ticket above." /> : (
          <div>
            {tickets.map(t => (
              <div key={t.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.subject || '(No subject)'}</div>
                  <Badge status={t.status || 'open'} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6, lineHeight: 1.5 }}>{t.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{new Date(t.created_at).toLocaleDateString('en-GB')}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </DmcShell>
  )
}