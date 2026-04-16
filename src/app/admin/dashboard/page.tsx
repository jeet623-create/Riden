'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!document.getElementById('stitch-tw')) {
      const cfg = document.createElement('script')
      cfg.id = 'stitch-tw-cfg'
      cfg.innerHTML = 'tailwind.config={darkMode:"class",theme:{extend:{colors:{"background":"#131313","surface-container-highest":"#353534","on-primary":"#003827","on-surface-variant":"#bccac1","outline":"#87948c","surface-variant":"#353534","surface-bright":"#3a3939","surface-container-lowest":"#0e0e0e","on-surface":"#e5e2e1","primary":"#68dbae","error-container":"#93000a","surface-container":"#201f1f","on-primary-container":"#003121","surface-container-high":"#2a2a2a","surface":"#131313","error":"#ffb4ab","surface-container-low":"#1c1b1b","primary-container":"#26a37a","outline-variant":"#3d4943","secondary":"#d0bcff","tertiary":"#c3d000","tertiary-container":"#8e9800","brand-teal":"#1D9E75"},fontFamily:{"headline":["DM Sans","sans-serif"],"body":["DM Sans","sans-serif"],"label":["DM Mono","monospace"],"brand":["Monoton","cursive"]}}}}'
      document.head.insertBefore(cfg, document.head.firstChild)
      const s = document.createElement('script')
      s.id = 'stitch-tw'
      s.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries'
      document.head.appendChild(s)
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@400;500;600;700&family=Monoton&display=swap'
      document.head.appendChild(l)
      const l2 = document.createElement('link')
      l2.rel = 'stylesheet'
      l2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0'
      document.head.appendChild(l2)
    }
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return }
      sb.from('admin_users').select('id').eq('id', user.id).single().then(({ data }) => {
        if (!data) router.push('/admin/login')
        else setLoaded(true)
      })
    })
  }, [])

  if (!loaded) return <div style={{minHeight:'100vh',background:'#0e0e0e'}} />

  return (
    <div className="dark">
      <style dangerouslySetInnerHTML={{__html: '.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24}.data-mono{font-family:'DM Mono',monospace}.brand-monoton{font-family:'Monoton',cursive}.glass-sidebar{background:rgba(14,14,14,0.8);backdrop-filter:blur(24px)}.ghost-border{border:1px solid rgba(135,148,140,0.15)}.animated-grid{background-size:40px 40px;background-image:linear-gradient(to right,rgba(29,158,117,0.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(29,158,117,0.05) 1px,transparent 1px);animation:grid-move 20s linear infinite}@keyframes grid-move{0%{background-position:0 0}100%{background-position:40px 40px}}'}} />
      <aside className="fixed left-0 top-0 h-screen w-64 glass-sidebar flex flex-col py-6 z-50">
<div className="px-6 mb-10 flex items-center gap-3">
<span className="brand-monoton text-brand-teal text-2xl">RIDEN</span>
<div className="flex flex-col">
<span className="font-bold text-[10px] tracking-widest text-on-surface-variant uppercase">Master Control</span>
</div>
</div>
<nav className="flex-1 space-y-1 overflow-y-auto">

<a className="flex items-center px-6 py-3 text-brand-teal border-l-2 border-brand-teal bg-surface-container-high transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">dashboard</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Dashboard</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">hub</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">DMCs</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">supervised_user_circle</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Operators</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">person</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Drivers</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">directions_car</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Vehicles</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">calendar_today</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Bookings</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">pending_actions</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Pending</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">subscriptions</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Subscriptions</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">payments</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Finance</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:text-brand-teal hover:bg-surface-container transition-all duration-300 ease-in-out" href="#">
<span className="material-symbols-outlined mr-3">contact_support</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Support</span>
</a>
</nav>
<div className="px-6 mt-auto space-y-4">
<div className="py-4 border-t border-outline-variant/10">
<div className="text-brand-teal data-mono text-xs font-bold">10:41 BKK</div>
<div className="text-[10px] text-on-surface-variant data-mono">BANGKOK (UTC+7)</div>
</div>
<a className="flex items-center py-2 text-on-surface-variant hover:text-error transition-colors" href="#">
<span className="material-symbols-outlined mr-3">logout</span>
<span className="data-mono text-[11px] uppercase tracking-[0.05em]">Logout</span>
</a>
</div>
</aside>

<main className="ml-64 flex-1 flex flex-col min-h-screen">

<header className="sticky top-0 z-40 flex justify-between items-center w-full px-8 py-3 bg-[#141414] border-none flat no shadows">
<div className="flex items-center gap-4">
<span className="brand-monoton text-brand-teal text-xl tracking-widest">admin.riden.me</span>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 text-on-surface-variant">
<button className="hover:bg-[#1a1a1a] p-2 rounded transition-colors material-symbols-outlined">language</button>
<button className="hover:bg-[#1a1a1a] p-2 rounded transition-colors material-symbols-outlined">dark_mode</button>
<button className="hover:bg-[#1a1a1a] p-2 rounded transition-colors material-symbols-outlined">notifications</button>
</div>
<div className="h-8 w-8 rounded-full bg-brand-teal/20 flex items-center justify-center border border-brand-teal/30">
<span className="text-brand-teal font-bold text-xs">JG</span>
</div>
</div>
</header>

<div className="px-8 py-8 space-y-8">

<div className="flex justify-between items-end">
<div>
<h1 className="text-[22px] font-bold text-on-surface leading-none mb-1">Command Center</h1>
<p className="text-[13px] text-on-surface-variant data-mono uppercase tracking-wider">Thursday 16 April Â· Bangkok</p>
</div>
<button className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-high transition-all ghost-border">
<span className="material-symbols-outlined text-[18px]">refresh</span>
<span>Refresh</span>
</button>
</div>

<div className="relative w-full">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full bg-surface-container border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-brand-teal transition-all" placeholder="Search bookings, DMCs, operators..." type="text"/>
</div>

<div className="bg-tertiary/10 border-l-4 border-tertiary p-4 flex items-center justify-between rounded-lg">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-tertiary">priority_high</span>
<span className="text-on-surface font-medium">12 driver(s) waiting for approval in the pool</span>
</div>
<button className="text-tertiary text-sm font-bold flex items-center gap-1 hover:underline">
                    Review <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<div className="bg-surface p-5 rounded-lg border-t-2 border-brand-teal relative overflow-hidden group">
<div className="flex flex-col">
<span className="data-mono text-[10px] text-on-surface-variant uppercase tracking-[0.1em] mb-3">Active DMCs</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-bold text-on-surface data-mono">42</span>
<span className="text-[11px] text-on-surface-variant data-mono uppercase">companies</span>
</div>
</div>
</div>
<div className="bg-surface p-5 rounded-lg border-t-2 border-secondary relative overflow-hidden group">
<div className="flex flex-col">
<span className="data-mono text-[10px] text-on-surface-variant uppercase tracking-[0.1em] mb-3">Operators</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-bold text-on-surface data-mono">128</span>
<span className="text-[11px] text-on-surface-variant data-mono uppercase">fleet owners</span>
</div>
</div>
</div>
<div className="bg-surface p-5 rounded-lg border-t-2 border-primary relative overflow-hidden group">
<div className="flex flex-col">
<span className="data-mono text-[10px] text-on-surface-variant uppercase tracking-[0.1em] mb-3">Verified Drivers</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-bold text-on-surface data-mono">1,024</span>
<span className="text-[11px] text-on-surface-variant data-mono uppercase">in pool</span>
</div>
</div>
</div>
<div className="bg-surface p-5 rounded-lg border-t-2 border-tertiary relative overflow-hidden group">
<div className="flex flex-col">
<span className="data-mono text-[10px] text-on-surface-variant uppercase tracking-[0.1em] mb-3">Est. MRR</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-bold text-on-surface data-mono">à¸¿2.4M</span>
<span className="text-[11px] text-on-surface-variant data-mono uppercase">monthly</span>
</div>
</div>
</div>

<div className="bg-surface p-5 rounded-lg border-t-2 border-primary relative overflow-hidden group">
<div className="flex flex-col">
<span className="data-mono text-[10px] text-on-surface-variant uppercase tracking-[0.1em] mb-3">Active Trips</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-bold text-on-surface data-mono">87</span>
<span className="text-[11px] text-on-surface-variant data-mono uppercase">running now</span>
</div>
</div>
</div>
<div className="bg-surface p-5 rounded-lg border-t-2 border-on-surface-variant relative overflow-hidden group">
<div className="flex flex-col">
<span className="data-mono text-[10px] text-on-surface-variant uppercase tracking-[0.1em] mb-3">Vehicles</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-bold text-on-surface data-mono">1,540</span>
<span className="text-[11px] text-on-surface-variant data-mono uppercase">active fleet</span>
</div>
</div>
</div>
<div className="bg-surface p-5 rounded-lg border-t-2 border-tertiary relative overflow-hidden group">
<div className="flex flex-col">
<span className="data-mono text-[10px] text-on-surface-variant uppercase tracking-[0.1em] mb-3">Pending Review</span>
<div className="flex items-baseline gap-2 text-tertiary">
<span className="text-3xl font-bold data-mono">12</span>
<span className="text-[11px] data-mono uppercase">need approval</span>
</div>
</div>
</div>
<div className="bg-surface p-5 rounded-lg border-t-2 border-secondary relative overflow-hidden group">
<div className="flex flex-col">
<span className="data-mono text-[10px] text-on-surface-variant uppercase tracking-[0.1em] mb-3">Recent Bookings</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-bold text-on-surface data-mono">412</span>
<span className="text-[11px] text-on-surface-variant data-mono uppercase">latest</span>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

<div className="lg:col-span-2 bg-surface p-6 rounded-lg ghost-border">
<div className="flex justify-between items-center mb-10">
<h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant data-mono">Revenue Overview</h3>
<div className="flex gap-4">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-brand-teal"></div>
<span className="text-[11px] data-mono uppercase text-on-surface-variant">Last 6 Months</span>
</div>
</div>
</div>
<div className="h-48 flex items-end justify-between gap-4">
<div className="flex flex-col items-center flex-1 gap-2">
<div className="w-full bg-brand-teal/20 h-[30%] rounded-t-sm transition-all hover:bg-brand-teal"></div>
<span className="text-[10px] data-mono text-outline">NOV</span>
</div>
<div className="flex flex-col items-center flex-1 gap-2">
<div className="w-full bg-brand-teal/20 h-[45%] rounded-t-sm transition-all hover:bg-brand-teal"></div>
<span className="text-[10px] data-mono text-outline">DEC</span>
</div>
<div className="flex flex-col items-center flex-1 gap-2">
<div className="w-full bg-brand-teal/20 h-[60%] rounded-t-sm transition-all hover:bg-brand-teal"></div>
<span className="text-[10px] data-mono text-outline">JAN</span>
</div>
<div className="flex flex-col items-center flex-1 gap-2">
<div className="w-full bg-brand-teal/20 h-[50%] rounded-t-sm transition-all hover:bg-brand-teal"></div>
<span className="text-[10px] data-mono text-outline">FEB</span>
</div>
<div className="flex flex-col items-center flex-1 gap-2">
<div className="w-full bg-brand-teal/20 h-[85%] rounded-t-sm transition-all hover:bg-brand-teal"></div>
<span className="text-[10px] data-mono text-outline">MAR</span>
</div>
<div className="flex flex-col items-center flex-1 gap-2">
<div className="w-full bg-brand-teal h-[100%] rounded-t-sm transition-all"></div>
<span className="text-[10px] data-mono text-outline font-bold">APR</span>
</div>
</div>
</div>

<div className="bg-surface p-6 rounded-lg ghost-border">
<h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant data-mono mb-8">Subscription Breakdown</h3>
<div className="space-y-6">
<div className="space-y-2">
<div className="flex justify-between text-[11px] data-mono text-on-surface-variant uppercase">
<span>Starter</span>
<span className="text-on-surface">12%</span>
</div>
<div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
<div className="bg-brand-teal h-full w-[12%]"></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-[11px] data-mono text-on-surface-variant uppercase">
<span>Growth</span>
<span className="text-on-surface">54%</span>
</div>
<div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
<div className="bg-brand-teal h-full w-[54%]"></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-[11px] data-mono text-on-surface-variant uppercase">
<span>Pro</span>
<span className="text-on-surface">34%</span>
</div>
<div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
<div className="bg-brand-teal h-full w-[34%]"></div>
</div>
</div>
</div>
</div>
</div>

<section className="bg-surface rounded-lg overflow-hidden ghost-border">
<div className="px-6 py-4 flex justify-between items-center bg-surface-container-high/30">
<h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant data-mono">Recent Bookings</h3>
<a className="text-brand-teal text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline" href="#">
                        View all <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
</a>
</div>
<div className="min-h-[240px] flex flex-col items-center justify-center py-12 text-center">
<div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
<span className="material-symbols-outlined text-outline text-3xl">calendar_today</span>
</div>
<p className="text-on-surface-variant text-sm font-medium mb-1">No bookings yet</p>
<p className="text-outline text-xs data-mono">Incoming logistics data will appear here in real-time.</p>
</div>
</section>
</div>
</main>
    </div>
  )
}
