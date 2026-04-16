'use client'
import { useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusBadge } from '@/components/admin/status-badge'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Ticket {
  id: number
  company: string
  status: string
  subject: string
  message: string
  email: string
  date: string
  fullMessage: string
}

const initialTickets: Ticket[] = [
  { id: 1, company: 'Bangkok Express DMC', status: 'open', subject: 'Payment processing issue', message: 'We are experiencing difficulties processing our subscription payment.', email: 'contact@bangkokexpress.com', date: '2026-04-15 10:30', fullMessage: 'We are experiencing difficulties processing our subscription payment. When we try to update our payment method, we get an error message. Could you please help us resolve this issue?' },
  { id: 2, company: 'Chiang Mai Adventures', status: 'replied', subject: 'Question about driver verification', message: 'How long does the driver verification process typically take?', email: 'info@cmadventures.com', date: '2026-04-14 14:20', fullMessage: 'How long does the driver verification process typically take? We have submitted 3 driver applications and want to know when we can expect them to be approved.' },
  { id: 3, company: 'Phuket Premier DMC', status: 'open', subject: 'Upgrade to Pro plan', message: 'We would like to upgrade our account from Growth to Pro plan...', email: 'hello@phuketpremier.com', date: '2026-04-13 09:15', fullMessage: 'We would like to upgrade our account from Growth to Pro plan. Can you help us with this upgrade and let us know if there will be any changes to our billing cycle?' },
  { id: 4, company: 'Krabi Elite Travel', status: 'closed', subject: 'Feature request: Calendar export', message: 'It would be great to have an option to export our booking calendar...', email: 'support@krabielite.com', date: '2026-04-10 16:45', fullMessage: 'It would be great to have an option to export our booking calendar to external calendar applications like Google Calendar. Is this something you are planning to add?' },
]

export default function Page() {
  const [tab, setTab] = useState('all')
  const [tickets, setTickets] = useState(initialTickets)
  const [sel, setSel] = useState<Ticket | null>(tickets[0])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = tab === 'all' ? tickets : tickets.filter(t => t.status === tab)
  const openCount = tickets.filter(t => t.status === 'open').length

  const handleSendReply = async () => {
    if (!reply.trim() || !sel) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setTickets(prev => prev.map(t => t.id === sel.id ? { ...t, status: 'replied' } : t))
    setSel(prev => prev ? { ...prev, status: 'replied' } : null)
    setReply('')
    setLoading(false)
    toast.success('Reply sent successfully')
  }

  const handleCloseTicket = async () => {
    if (!sel) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    setTickets(prev => prev.map(t => t.id === sel.id ? { ...t, status: 'closed' } : t))
    setSel(prev => prev ? { ...prev, status: 'closed' } : null)
    setLoading(false)
    toast.success('Ticket closed')
  }

  return (
    <AdminShell>
      <div className="flex gap-0 h-[calc(100vh-56px)]">
        {/* Left Panel - Ticket List */}
        <div 
          className="w-[340px] flex-shrink-0 flex flex-col"
          style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Support Inbox</h2>
              {openCount > 0 ? (
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--amber-bg)', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}
                >
                  {openCount} open
                </span>
              ) : (
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--teal-10)', color: 'var(--teal)' }}
                >
                  All clear
                </span>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            {['all', 'open', 'replied', 'closed'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all btn-active"
                style={{
                  background: tab === t ? 'var(--teal)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-2)',
                  border: tab === t ? 'none' : '1px solid var(--border)'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(t => (
              <button
                key={t.id}
                onClick={() => setSel(t)}
                className="w-full text-left p-4 transition-colors"
                style={{ 
                  background: sel?.id === t.id ? 'var(--bg-elevated)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                  borderLeft: sel?.id === t.id ? '2px solid var(--teal)' : '2px solid transparent'
                }}
                onMouseEnter={e => { if (sel?.id !== t.id) e.currentTarget.style.background = 'var(--bg-elevated)' }}
                onMouseLeave={e => { if (sel?.id !== t.id) e.currentTarget.style.background = 'transparent' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium">{t.company}</span>
                  <StatusBadge status={t.status} variant="small" />
                </div>
                <div className="text-[12px] font-medium mb-0.5">{t.subject}</div>
                <div className="text-[11px] truncate mb-1.5" style={{ color: 'var(--text-2)' }}>{t.message}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}>{t.date}</div>
              </button>
            )) : (
              <div className="py-20 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-2)' }} />
                <p className="text-xs" style={{ color: 'var(--text-2)' }}>No tickets</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Ticket Detail */}
        <div className="flex-1 flex flex-col" style={{ background: 'var(--bg-base)' }}>
          {sel ? (
            <>
              {/* Header */}
              <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-[15px] font-semibold">{sel.subject}</h3>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={sel.status} />
                    {sel.status !== 'closed' && (
                      <button
                        onClick={handleCloseTicket}
                        className="px-3 py-1 text-xs rounded-lg transition-colors"
                        style={{ background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-[12px]" style={{ color: 'var(--text-2)' }}>
                  {sel.company} · {sel.email}
                </div>
              </div>

              {/* Message */}
              <div className="flex-1 overflow-y-auto p-6">
                <div 
                  className="rounded-2xl p-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <p className="text-sm leading-relaxed">{sel.fullMessage}</p>
                </div>
                <div className="mt-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}>
                  Received: {sel.date}
                </div>
              </div>

              {/* Reply Area */}
              {sel.status !== 'closed' && (
                <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full rounded-xl p-3 text-sm resize-none outline-none transition-colors mb-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendReply}
                      disabled={!reply.trim() || loading}
                      className="px-4 py-2 rounded-lg text-sm font-medium btn-active flex items-center gap-2"
                      style={{ 
                        background: 'var(--teal)', 
                        color: '#fff', 
                        opacity: !reply.trim() || loading ? 0.5 : 1,
                        cursor: !reply.trim() || loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading && <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                      Send Reply
                    </button>
                    <button
                      onClick={() => setReply('')}
                      className="px-4 py-2 rounded-lg text-sm transition-colors"
                      style={{ background: 'transparent', color: 'var(--text-2)' }}
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleCloseTicket}
                      className="px-4 py-2 rounded-lg text-sm ml-auto"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                    >
                      Close Ticket
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-2)' }} />
                <p style={{ color: 'var(--text-2)' }}>Select a ticket</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
