'use client'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatCard } from '@/components/admin/stat-card'
import { DollarSign, TrendingUp, Users, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
const monthlyRevenue = [{month:'Nov',revenue:142000},{month:'Dec',revenue:158000},{month:'Jan',revenue:165000},{month:'Feb',revenue:172000},{month:'Mar',revenue:179000},{month:'Apr',revenue:186000}]
const planBreakdown = [{plan:'Starter',count:18,amount:2000},{plan:'Growth',count:22,amount:4000},{plan:'Pro',count:7,amount:6000}]
const recentPayments = [{company:'Bangkok Express DMC',plan:'Growth',date:'2026-04-15',amount:4000},{company:'Phuket Premier DMC',plan:'Pro',date:'2026-04-14',amount:6000},{company:'Krabi Elite Travel',plan:'Growth',date:'2026-04-13',amount:4000},{company:'Pattaya Tours Co',plan:'Starter',date:'2026-04-12',amount:2000}]
const transactions = [{company:'Bangkok Express DMC',email:'contact@bangkokexpress.com',plan:'growth',amount:'฿4,000',start:'2026-04-15',end:'2026-05-15'},{company:'Phuket Premier DMC',email:'hello@phuketpremier.com',plan:'pro',amount:'฿6,000',start:'2026-04-14',end:'2026-05-14'},{company:'Krabi Elite Travel',email:'support@krabielite.com',plan:'growth',amount:'฿4,000',start:'2026-04-13',end:'2026-05-13'}]
const tt = {contentStyle:{backgroundColor:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',fontFamily:'monospace'}}
const totalMRR = planBreakdown.reduce((s,p)=>s+p.count*p.amount,0)
export default function Page() {
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-medium">Finance</h1><button className="px-3 py-1.5 text-xs bg-[#1a1a1a] border border-white/[0.08] rounded-lg text-[#a3a3a3] hover:text-[#f5f5f5]">Export CSV</button></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Monthly Recurring Revenue" value="฿186,000" color="teal" icon={<DollarSign className="w-8 h-8"/>}/>
        <StatCard label="Total Collected (YTD)" value="฿842,000" color="green" icon={<TrendingUp className="w-8 h-8"/>}/>
        <StatCard label="Active Subscribers" value="47" color="blue" icon={<Users className="w-8 h-8"/>}/>
        <StatCard label="On Trial" value="8" color="amber" icon={<Clock className="w-8 h-8"/>}/>
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl mb-6">
        <div className="px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">MRR Trend</h3></div>
        <div className="p-6"><ResponsiveContainer width="100%" height={250}><BarChart data={monthlyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/><XAxis dataKey="month" stroke="#737373" style={{fontSize:12}}/><YAxis stroke="#737373" style={{fontSize:12}}/><Tooltip {...tt} formatter={(v:number)=>`฿${v.toLocaleString()}`}/><Bar dataKey="revenue" fill="#1D9E75" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#141414] border border-white/[0.08] rounded-xl"><div className="px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">Plan Breakdown</h3></div>
          <div className="p-6 space-y-4">{planBreakdown.map(item=>{const pct=(item.count*item.amount)/totalMRR*100;return<div key={item.plan}><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><span className="text-sm font-medium">{item.plan}</span><span className="text-xs text-[#737373]">{item.count} DMCs</span></div><span className="text-sm font-mono text-[#a3a3a3]">฿{(item.count*item.amount).toLocaleString()}/mo</span></div><div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden"><div className="h-full bg-[#1D9E75] rounded-full" style={{width:`${pct}%`}}/></div></div>})}</div>
        </div>
        <div className="bg-[#141414] border border-white/[0.08] rounded-xl"><div className="px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">Recent Payments</h3></div>
          <div className="p-6 space-y-3">{recentPayments.map((p,i)=><div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"><div><div className="text-sm font-medium mb-0.5">{p.company}</div><div className="text-xs text-[#737373]">{p.plan} • {p.date}</div></div><div className="text-sm font-mono text-[#22c55e]">+฿{p.amount.toLocaleString()}</div></div>)}</div>
        </div>
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">Recent Transactions</h3></div>
        <table className="w-full"><thead><tr className="border-b border-white/[0.08]">{['Company','Email','Plan','Amount','Start','End'].map(h=><th key={h} className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase">{h}</th>)}</tr></thead>
        <tbody>{transactions.map((t,i)=><tr key={i} className="border-b border-white/[0.04] hover:bg-[#1a1a1a]"><td className="px-4 py-3 text-sm font-medium">{t.company}</td><td className="px-4 py-3 text-sm text-[#737373]">{t.email}</td><td className="px-4 py-3 text-sm font-mono capitalize">{t.plan}</td><td className="px-4 py-3 text-sm font-mono text-[#22c55e]">{t.amount}</td><td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{t.start}</td><td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{t.end}</td></tr>)}</tbody></table>
      </div>
    </AdminShell>
  )
}
