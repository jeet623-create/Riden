'use client'
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const T = {
  en: { title:'Dashboard', sub:'System overview', dmcs:'Total DMCs', operators:'Operators', drivers:'Drivers', bookings:'Bookings Today', active:'Active Trips', pending:'Pending Support', trial:'On Trial', loading:'Loading...', quickActions:'Quick Actions', addDmc:'Add DMC', addOperator:'Add Operator', addDriver:'Add Driver', viewSupport:'View Tickets', recentBookings:'Recent Bookings', noBookings:'No bookings yet', viewAll:'View all →' },
  th: { title:'แดชบอร์ด', sub:'ภาพรวมระบบ', dmcs:'DMC ทั้งหมด', operators:'ผู้ประกอบการ', drivers:'คนขับ', bookings:'การจองวันนี้', active:'ทริปที่กำลังดำเนินการ', pending:'รอซัพพอร์ต', trial:'ทดลองใช้', loading:'กำลังโหลด...', quickActions:'ดำเนินการด่วน', addDmc:'เพิ่ม DMC', addOperator:'เพิ่มผู้ประกอบการ', addDriver:'เพิ่มคนขับ', viewSupport:'ดูต๋ว', recentBookings:'การจองล่าสุด', noBookings:'ยังไม่มีการจอง', viewAll:'ดูทั้งหมด →' },
}

export default function AdminDashboard() {
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [stats, setStats] = useState({ dmcs:0, operators:0, drivers:0, bookings_today:0, active_trips:0, pending_support:0, trial_dmcs:0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('riden_admin')
    if (stored) { const info = JSON.parse(stored); setLang(info.lang||'en') }
  }, [])

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const today = new Date().toISOString().split('T')[0]
      const [dmcRes, opRes, drRes, bkToday, activeRes, supportRes, trialRes, recentRes] = await Promise.all([
        sb.from('dmc_users').select('id',{count:'exact',head:true}),
        sb.from('operators').select('id',{count:'exact',head:true}),
        sb.from('drivers').select('id',{count:'exact',head:true}),
        sb.from('bookings').select('id',{count:'exact',head:true}).gte('created_at', today),
        sb.from('trips').select('id',{count:'exact',head:true}).eq('status','in_progress'),
        sb.from('support_tickets').select('id',{count:'exact',head:true}).eq('status','open'),
        sb.from('dmc_users').select('id',{count:'exact',head:true}).eq('subscription_plan','trial'),
        sb.from('bookings').select('id,booking_ref,client_name,status,created_at,dmc_id,dmc_users(company_name)').order('created_at',{ascending:false}).limit(5),
      ])
      setStats({ dmcs:dmcRes.count??0, operators:opRes.count??0, drivers:drRes.count??0, bookings_today:bkToday.count??0, active_trips:activeRes.count??0, pending_support:supportRes.count??0, trial_dmcs:trialRes.count??0 })
      setRecentBookings(recentRes.data??[])
      setLoading(false)
    }
    load()
  }, [])

  const t = T[lang]
  const STATUS_COLORS: Record<string,string> = { pending:'badge-pending', confirmed:'badge-confirmed', in_progress:'badge-progress', completed:'badge-completed', cancelled:'badge-cancelled' }

  const statCards = [
    { label: t.dmcs, value: stats.dmcs, icon: '🏢', sub: stats.trial_dmcs+' '+t.trial, color: 'text-riden-teal', href: '/admin/dmc' },
    { label: t.operators, value: stats.operators, icon: '🚐', color: 'text-blue-400', href: '/admin/operators' },
    { label: t.drivers, value: stats.drivers, icon: '👤', color: 'text-purple-400', href: '/admin/drivers' },
    { label: t.bookings, value: stats.bookings_today, icon: '📋', color: 'text-yellow-400', href: '/admin/bookings' },
    { label: t.active, value: stats.active_trips, icon: '🟢', color: 'text-green-400', href: '/admin/bookings' },
    { label: t.pending, value: stats.pending_support, icon: '🎧', color: stats.pending_support>0?'text-red-400':'text-riden-text', alert: stats.pending_support>0, href: '/admin/support' },
  ]

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-700 text-riden-white">{t.title}</h1>
        <p className="text-riden-text text-sm">{t.sub}</p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-riden-text"><div className="w-5 h-5 border-2 border-riden-teal/30 border-t-riden-teal rounded-full animate-spin"/>{t.loading}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {statCards.map(s => (
              <Link href={s.href} key={s.label}>
                <div className={`glass glass-hover rounded-xl p-4 cursor-pointer relative ${s.alert?'border border-red-400/20':''}`}>
                  {s.alert && <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full animate-pulse"/>}
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className={`font-display text-2xl font-700 ${s.color}`}>{s.value}</div>
                  <div className="text-riden-text text-xs mt-1">{s.label}</div>
                  {s.sub && <div className="text-riden-muted text-xs mt-0.5">{s.sub}</div>}
                </div>
              </Link>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-riden-border flex items-center justify-between">
                <h2 className="font-display font-600 text-riden-white text-sm">{t.recentBookings}</h2>
                <Link href="/admin/bookings" className="text-riden-teal text-xs hover:underline">{t.viewAll}</Link>
              </div>
              {recentBookings.length===0 ? (
                <div className="p-8 text-center text-riden-text text-sm">{t.noBookings}</div>
              ) : (
                <div className="divide-y divide-riden-border">
                  {recentBookings.map((b:any) => (
                    <div key={b.id} className="px-5 py-3 flex items-center justify-between hover:bg-riden-card/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-riden-teal">{b.booking_ref}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${STATUS_COLORS[b.status]||'badge-pending'}`}>{b.status}</span>
                        </div>
                        <div className="text-riden-white text-sm">{b.client_name}</div>
                        <div className="text-riden-muted text-xs">{(b.dmc_users as any)?.company_name}</div>
                      </div>
                      <div className="text-riden-muted text-xs">{new Date(b.created_at).toLocaleDateString('en',{month:'short',day:'numeric'})}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="glass rounded-xl p-5">
              <h2 className="font-display font-600 text-riden-white text-sm mb-4">{t.quickActions}</h2>
              <div className="space-y-2">
                {[
                  { label: t.addDmc, href: '/admin/dmc', icon: '🏢' },
                  { label: t.addOperator, href: '/admin/operators', icon: '🚐' },
                  { label: t.addDriver, href: '/admin/drivers', icon: '👤' },
                  { label: t.viewSupport, href: '/admin/support', icon: '🎧' },
                ].map(a => (
                  <Link href={a.href} key={a.label}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl btn-ghost cursor-pointer mb-1 text-sm text-riden-text hover:text-riden-white">
                      <span>{a.icon}</span><span>{a.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  )
}
