'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DMCsPage() {
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
      <aside className="fixed left-0 top-0 h-full w-64 z-[60] bg-[#0e0e0e]/80 backdrop-blur-3xl flex flex-col h-full py-8">
<div className="px-6 mb-10">
<h1 className="font-brand text-xl text-[#1D9E75] tracking-widest">PRECISION</h1>
<div className="mt-4 flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[#1D9E75]">admin_panel_settings</span>
</div>
<div>
<p className="text-sm font-bold font-headline leading-tight">Admin Panel</p>
<p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider">Precision Concierge</p>
</div>
</div>
</div>
<nav className="flex-1 space-y-1 px-4 overflow-y-auto no-scrollbar">

<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#1D9E75] border-l-2 border-[#1D9E75] bg-[#1a1a1a]" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span>Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#1D9E75] border-l-2 border-[#1D9E75] bg-[#1a1a1a]" href="#">
<span className="material-symbols-outlined" data-icon="business_center">business_center</span>
<span>DMCs</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#bccac1] opacity-70 hover:bg-[#141414] hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
<span>Operators</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#bccac1] opacity-70 hover:bg-[#141414] hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined" data-icon="steering_wheel">steering_wheel_heat</span>
<span>Drivers</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#bccac1] opacity-70 hover:bg-[#141414] hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined" data-icon="directions_car">directions_car</span>
<span>Vehicles</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#bccac1] opacity-70 hover:bg-[#141414] hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
<span>Bookings</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#bccac1] opacity-70 hover:bg-[#141414] hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined" data-icon="pending_actions">pending_actions</span>
<span>Pending</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#bccac1] opacity-70 hover:bg-[#141414] hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined" data-icon="loyalty">loyalty</span>
<span>Subscriptions</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#bccac1] opacity-70 hover:bg-[#141414] hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined" data-icon="payments">payments</span>
<span>Finance</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-[#bccac1] opacity-70 hover:bg-[#141414] hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined" data-icon="support_agent">support_agent</span>
<span>Support</span>
</a>
</nav>
<div className="px-4 mt-6 pt-6 border-t border-outline-variant/10">
<button className="w-full py-3 bg-primary-container text-on-primary-container rounded-lg font-bold text-xs uppercase tracking-widest hover:scale-[0.98] transition-transform">
                New Booking
            </button>
<div className="mt-4 space-y-1">
<a className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-[#bccac1] opacity-70 hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined text-sm" data-icon="settings">settings</span>
<span>Settings</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-[#bccac1] opacity-70 hover:text-[#1D9E75]" href="#">
<span className="material-symbols-outlined text-sm" data-icon="logout">logout</span>
<span>Logout</span>
</a>
</div>
</div>
</aside>

<main className="ml-64 min-h-screen flex flex-col bg-[#0e0e0e]">

<header className="h-16 px-8 flex items-center justify-between bg-[#0e0e0e]/80 backdrop-blur-xl z-50 sticky top-0">
<div className="flex items-center gap-8">
<div className="flex flex-col">
<h2 className="text-[22px] font-bold text-on-surface leading-tight">DMC Management</h2>
<span className="text-[13px] text-on-surface-variant">42 companies registered</span>
</div>
</div>
<div className="flex items-center gap-4">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">dark_mode</span>
</button>
<div className="h-8 w-[1px] bg-outline-variant/20"></div>
<div className="flex items-center gap-3">
<span className="text-sm font-medium">Admin</span>
<div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center overflow-hidden">
<img alt="Admin profile avatar" className="w-full h-full object-cover" data-alt="Close up portrait of a professional man in a dark suite with soft studio lighting and dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE0a8zzCOAY-jh-Udjew84OSXAkevupDBsNuOT5t2IwDXY9d76LTwpTCqnt-5CJZVDI6byMmmsx_fsB5cgv_dSYj6RM9VVO9YmGnXqIjH0uQiufstdhwk3mvOu5rj7UQNd5abD5YS4tFnORcw7x8BuVyfEKP9eWT1_IK7xEvmbIATfm4cgyDTB1_rlmg8k38fImUfxTmpSt7Tsw47IlTsrlFVcjjluHBWp39vDqI0OGxVOh2CYRfoSWbAJIB99lh46W-lyscXQ0sYi"/>
</div>
</div>
</div>
</header>
<div className="p-8 space-y-6 flex-1 overflow-y-auto pr-[420px]">

<div className="flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center bg-surface p-1 rounded-lg">
<button className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#1a1a1a] text-[#1D9E75]">ALL</button>
<button className="px-4 py-1.5 text-xs font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-colors">TRIAL</button>
<button className="px-4 py-1.5 text-xs font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-colors">ACTIVE</button>
<button className="px-4 py-1.5 text-xs font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-colors">EXPIRED</button>
<button className="px-4 py-1.5 text-xs font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-colors">SUSPENDED</button>
</div>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
<input className="w-[240px] bg-surface border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/30 placeholder:text-on-surface-variant/50" placeholder="Search company or email..." type="text"/>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div className="bg-surface p-[14px_16px] rounded-lg border-t-2 border-on-surface-variant/20">
<p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Total Companies</p>
<p className="text-[24px] font-bold font-headline mt-1">42</p>
</div>
<div className="bg-surface p-[14px_16px] rounded-lg border-t-2 border-[#1D9E75]">
<p className="text-[10px] font-label uppercase tracking-widest text-[#1D9E75]">Active Subs</p>
<p className="text-[24px] font-bold font-headline mt-1">31</p>
</div>
<div className="bg-surface p-[14px_16px] rounded-lg border-t-2 border-secondary">
<p className="text-[10px] font-label uppercase tracking-widest text-secondary">Trialing</p>
<p className="text-[24px] font-bold font-headline mt-1">8</p>
</div>
<div className="bg-surface p-[14px_16px] rounded-lg border-t-2 border-error">
<p className="text-[10px] font-label uppercase tracking-widest text-error">Expired</p>
<p className="text-[24px] font-bold font-headline mt-1">3</p>
</div>
</div>

<div className="bg-surface rounded-xl overflow-hidden shadow-2xl">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low/50">
<th className="px-6 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-medium">Company</th>
<th className="px-6 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-medium">Country</th>
<th className="px-6 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-medium">Plan</th>
<th className="px-6 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-medium">Status</th>
<th className="px-6 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-medium text-right">Bookings</th>
<th className="px-6 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-medium">Joined</th>
<th className="px-6 py-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">

<tr className="hover:bg-surface-container-low transition-colors group bg-[#1a1a1a]">
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="font-bold text-sm">Global Logistics Co.</span>
<span className="text-xs text-on-surface-variant">billing@globallogistics.com</span>
</div>
</td>
<td className="px-6 py-4 text-xs text-on-surface-variant">United Kingdom</td>
<td className="px-6 py-4">
<span className="font-label text-[11px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10">GROWTH</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#1D9E75]/10 w-fit">
<span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]"></span>
<span className="font-label text-[10px] font-bold text-[#1D9E75]">ACTIVE</span>
</div>
</td>
<td className="px-6 py-4 text-right font-label text-sm text-on-surface-variant">1,482</td>
<td className="px-6 py-4 text-xs text-on-surface-variant">Oct 12, 2023</td>
<td className="px-6 py-4 text-right">
<button className="text-xs font-bold text-primary hover:underline">Details</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="font-bold text-sm">Alps Concierge</span>
<span className="text-xs text-on-surface-variant">ops@alpsconcierge.ch</span>
</div>
</td>
<td className="px-6 py-4 text-xs text-on-surface-variant">Switzerland</td>
<td className="px-6 py-4">
<span className="font-label text-[11px] font-bold text-secondary px-2 py-0.5 rounded bg-secondary/10">TRIAL</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 px-2 py-1 rounded-full bg-secondary/10 w-fit">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
<span className="font-label text-[10px] font-bold text-secondary">TRIAL</span>
</div>
</td>
<td className="px-6 py-4 text-right font-label text-sm text-on-surface-variant">42</td>
<td className="px-6 py-4 text-xs text-on-surface-variant">Jan 04, 2024</td>
<td className="px-6 py-4 text-right">
<button className="text-xs font-bold text-primary hover:underline">Details</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="font-bold text-sm">Desert Safaris Ltd</span>
<span className="text-xs text-on-surface-variant">info@desertsafaris.ae</span>
</div>
</td>
<td className="px-6 py-4 text-xs text-on-surface-variant">United Arab Emirates</td>
<td className="px-6 py-4">
<span className="font-label text-[11px] font-bold text-tertiary px-2 py-0.5 rounded bg-tertiary/10">PRO</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#1D9E75]/10 w-fit">
<span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]"></span>
<span className="font-label text-[10px] font-bold text-[#1D9E75]">ACTIVE</span>
</div>
</td>
<td className="px-6 py-4 text-right font-label text-sm text-on-surface-variant">8,920</td>
<td className="px-6 py-4 text-xs text-on-surface-variant">Jun 18, 2022</td>
<td className="px-6 py-4 text-right">
<button className="text-xs font-bold text-primary hover:underline">Details</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="font-bold text-sm">Zenith Travel</span>
<span className="text-xs text-on-surface-variant">admin@zenith.jp</span>
</div>
</td>
<td className="px-6 py-4 text-xs text-on-surface-variant">Japan</td>
<td className="px-6 py-4">
<span className="font-label text-[11px] font-bold text-on-surface-variant px-2 py-0.5 rounded bg-surface-variant">STARTER</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 px-2 py-1 rounded-full bg-error/10 w-fit">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
<span className="font-label text-[10px] font-bold text-error">SUSPENDED</span>
</div>
</td>
<td className="px-6 py-4 text-right font-label text-sm text-on-surface-variant">211</td>
<td className="px-6 py-4 text-xs text-on-surface-variant">Sep 30, 2023</td>
<td className="px-6 py-4 text-right">
<button className="text-xs font-bold text-primary hover:underline">Details</button>
</td>
</tr>
</tbody>
</table>
<div className="p-4 flex items-center justify-between border-t border-outline-variant/10">
<span className="text-xs text-on-surface-variant font-label">Showing 1-10 of 42 results</span>
<div className="flex gap-2">
<button className="p-1 px-3 border border-outline-variant/20 rounded text-xs hover:bg-surface-variant transition-colors disabled:opacity-30" disabled="">PREV</button>
<button className="p-1 px-3 border border-outline-variant/20 rounded text-xs hover:bg-surface-variant transition-colors">NEXT</button>
</div>
</div>
</div>
</div>

<aside className="fixed right-0 top-0 h-full w-[420px] bg-[#141414] border-l border-outline-variant/10 z-[70] flex flex-col shadow-[-40px_0_60px_-15px_rgba(0,0,0,0.5)]">
<header className="p-8 pb-4 flex items-start justify-between">
<div>
<h3 className="text-xl font-bold font-headline">Global Logistics Co.</h3>
<div className="flex items-center gap-2 mt-2">
<span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-tighter">
<span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
                            LINE
                        </span>
<span className="text-xs text-on-surface-variant font-label">ID: DMC-2023-991</span>
</div>
</div>
<button className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant">
<span className="material-symbols-outlined">close</span>
</button>
</header>
<div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">

<section>
<h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">Account Info</h4>
<div className="grid grid-cols-2 gap-y-6">
<div>
<p className="text-[10px] text-on-surface-variant/60 font-label uppercase">Contact Name</p>
<p className="text-sm font-medium mt-1">Marcus Sterling</p>
</div>
<div>
<p className="text-[10px] text-on-surface-variant/60 font-label uppercase">Phone</p>
<p className="text-sm font-medium mt-1">+44 20 7946 0958</p>
</div>
<div className="col-span-2">
<p className="text-[10px] text-on-surface-variant/60 font-label uppercase">Address</p>
<p className="text-sm font-medium mt-1">22 Baker Street, London, NW1 6XE</p>
</div>
</div>
</section>

<section>
<h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">Subscription</h4>
<div className="p-5 bg-[#1a1a1a] rounded-xl flex items-center justify-between border-l-4 border-primary">
<div>
<p className="text-lg font-bold">Growth Plan</p>
<p className="text-xs text-on-surface-variant">$499 / Month â¢ Billed Monthly</p>
</div>
<span className="bg-primary/10 text-primary px-3 py-1 text-[11px] font-bold rounded-full font-label">ACTIVE</span>
</div>
<div className="mt-4 flex items-center justify-between text-xs px-2">
<span className="text-on-surface-variant">Next billing date: Feb 12, 2024</span>
<button className="text-primary font-bold hover:underline">Change Plan</button>
</div>
</section>

<section>
<h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">Activity Insights</h4>
<div className="grid grid-cols-2 gap-4">
<div className="p-4 bg-[#1a1a1a] rounded-xl">
<p className="text-[10px] text-on-surface-variant font-label uppercase">This Month</p>
<p className="text-xl font-bold font-mono-data mt-1">248</p>
<p className="text-[10px] text-[#1D9E75] mt-1 font-medium flex items-center">
<span className="material-symbols-outlined text-xs">trending_up</span>
                                12.5% vs last month
                            </p>
</div>
<div className="p-4 bg-[#1a1a1a] rounded-xl">
<p className="text-[10px] text-on-surface-variant font-label uppercase">Total Bookings</p>
<p className="text-xl font-bold font-mono-data mt-1">1,482</p>
<p className="text-[10px] text-on-surface-variant/40 mt-1">Member since Oct 2023</p>
</div>
</div>
</section>

<section className="pt-4 border-t border-outline-variant/10">
<h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">Management Actions</h4>
<div className="space-y-3">
<button className="w-full py-3 bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
                            Activate License
                        </button>
<div className="grid grid-cols-2 gap-3">
<button className="py-3 bg-surface-container-highest hover:bg-surface-container-high text-on-surface rounded-lg font-bold text-xs uppercase tracking-tight transition-all">
                                Reset Password
                            </button>
<button className="py-3 bg-error-container/20 hover:bg-error-container/30 text-error rounded-lg font-bold text-xs uppercase tracking-tight transition-all">
                                Suspend Account
                            </button>
</div>
<button className="w-full py-3 border border-error/30 text-error/60 hover:text-error hover:bg-error/5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
                            Delete Data Record
                        </button>
</div>
</section>
</div>
</aside>
</main>
    </div>
  )
}
