'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Notif = { id:string; type:string; title:string; body:string; link:string|null; is_read:boolean; created_at:string }
const ICONS: Record<string,string> = { booking_confirmed:'✅', operator_accepted:'🚐', driver_assigned:'👤', trip_started:'🟢', trip_completed:'🏁', payment_due:'💳', payment_confirmed:'✅', operator_declined:'❌', support_reply:'🎧', system:'📢' }

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string|null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const unread = notifs.filter(n=>!n.is_read).length

  useEffect(() => {
    const sb = createClient()
    async function init() {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await sb.from('notifications').select('*').eq('dmc_id', user.id).order('created_at',{ascending:false}).limit(20)
      setNotifs(data ?? [])
      const ch = sb.channel('notifs').on('postgres_changes',{ event:'INSERT', schema:'public', table:'notifications', filter:`dmc_id=eq.${user.id}` },(p) => {
        setNotifs(prev => [p.new as Notif, ...prev])
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission==='granted') {
          new Notification((p.new as Notif).title, { body:(p.new as Notif).body })
        }
      }).subscribe()
      return () => { sb.removeChannel(ch) }
    }
    init()
  }, [])

  useEffect(() => {
    function h(e: MouseEvent) { if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  async function markAllRead() {
    if (!userId) return
    await createClient().from('notifications').update({is_read:true}).eq('dmc_id',userId).eq('is_read',false)
    setNotifs(prev => prev.map(n=>({...n,is_read:true})))
  }

  async function markRead(id:string) {
    await createClient().from('notifications').update({is_read:true}).eq('id',id)
    setNotifs(prev => prev.map(n=>n.id===id?{...n,is_read:true}:n))
  }

  async function enablePush() {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission==='default') {
      const p = await Notification.requestPermission()
      if (p==='granted') new Notification('Riden Alerts Enabled',{body:'You will now receive booking updates.'})
    }
  }

  function ago(d:string) {
    const m = Math.floor((Date.now()-new Date(d).getTime())/60000)
    if(m<1) return 'just now'; if(m<60) return m+'m ago'
    const h=Math.floor(m/60); if(h<24) return h+'h ago'
    return Math.floor(h/24)+'d ago'
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={()=>setOpen(!open)} className="relative w-9 h-9 flex items-center justify-center rounded-xl glass glass-hover text-riden-text hover:text-riden-white transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {unread>0&&<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-mono font-700 animate-pulse">{unread>9?'9+':unread}</span>}
      </button>
      {open&&(
        <div className="absolute right-0 top-11 w-80 glass rounded-2xl border border-riden-border shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-riden-border flex items-center justify-between">
            <span className="font-display font-600 text-riden-white text-sm">Notifications</span>
            <div className="flex items-center gap-3">
              {typeof window!=='undefined'&&'Notification' in window&&Notification.permission!=='granted'&&(
                <button onClick={enablePush} className="text-riden-teal text-xs hover:underline">Enable alerts</button>
              )}
              {unread>0&&<button onClick={markAllRead} className="text-riden-muted text-xs hover:text-riden-text">Mark all read</button>}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length===0?(
              <div className="p-6 text-center"><div className="text-3xl mb-2">🔔</div><p className="text-riden-text text-sm">No notifications yet</p></div>
            ):notifs.map(n=>(
              <div key={n.id} onClick={()=>markRead(n.id)} className={`px-4 py-3 border-b border-riden-border/50 hover:bg-riden-card/50 cursor-pointer ${!n.is_read?'bg-riden-teal/5':''}`}>
                {n.link?(
                  <Link href={n.link} className="block">
                    <div className="flex items-start gap-3"><span className="text-lg flex-shrink-0">{ICONS[n.type]??'📢'}</span><div className="flex-1 min-w-0"><div className="flex items-center gap-1 mb-0.5"><span className="text-riden-white text-xs font-medium truncate">{n.title}</span>{!n.is_read&&<div className="w-1.5 h-1.5 bg-riden-teal rounded-full flex-shrink-0" />}</div><p className="text-riden-text text-xs truncate">{n.body}</p><span className="text-riden-muted text-xs">{ago(n.created_at)}</span></div></div>
                  </Link>
                ):(
                  <div className="flex items-start gap-3"><span className="text-lg flex-shrink-0">{ICONS[n.type]??'📢'}</span><div className="flex-1 min-w-0"><div className="flex items-center gap-1 mb-0.5"><span className="text-riden-white text-xs font-medium truncate">{n.title}</span>{!n.is_read&&<div className="w-1.5 h-1.5 bg-riden-teal rounded-full flex-shrink-0" />}</div><p className="text-riden-text text-xs truncate">{n.body}</p><span className="text-riden-muted text-xs">{ago(n.created_at)}</span></div></div>
                )}
              </div>
            ))}
          </div>
          {notifs.length>0&&<div className="px-4 py-2 border-t border-riden-border text-center"><span className="text-riden-muted text-xs">Last 20 notifications</span></div>}
        </div>
      )}
    </div>
  )
}
