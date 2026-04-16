'use client'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatCard } from '@/components/admin/stat-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { Building2, Users, UserCheck, DollarSign, Calendar, Car, AlertCircle, FileText, RefreshCw } from 'lucide-react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

const bookingTrend = [
  {date:'Apr 10',bookings:12},{date:'Apr 11',bookings:19},{date:'Apr 12',bookings:15},
  {date:'Apr 13',bookings:22},{date:'Apr 14',bookings:28},{date:'Apr 15',bookings:25},{date:'Apr 16',bookings:23},
]
const revenueTrend = [
  {month:'Nov',revenue:142000},{month:'Dec',revenue:158000},{month:'Jan',revenue:165000},
  {month:'Feb',revenue:172000},{month:'Mar',revenue:179000},{month:'Apr',revenue:186000},
]
const recentBookings = [
  {ref:'RDN-2026-001',client:'Singapore Tours Ltd',dmc:'Bangkok Express DMC',days:'5',status:'confirmed',created:'2026-04-14'},
  {ref:'RDN-2026-002',client:'Euro Travel Group',dmc:'Chiang Mai Adventures',days:'3',status:'pending',created:'2026-04-14'},
  {ref:'RDN-2026-003',client:'Asia Pacific Tours',dmc:'Phuket Premier DMC',days:'7',status:'confirmed',created:'2026-04-13'},
  {ref:'RDN-2026-004',client:'Global Destinations',dmc:'Bangkok Express DMC',days:'4',status:'in_progress',created:'2026-04-13'},
  {ref:'RDN-2026-005',client:'Luxury Escapes Co',dmc:'Krabi Elite Travel',days:'6',status:'confirmed',created:'2026-04-12'},
]
const tt = {contentStyle:{backgroundColor:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',fontFamily:'monospace'}}

export default function Page() {
  const date = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-medium">Command Center</h1><p className="text-sm text-[#737373] font-mono mt-0.5">{date}</p></div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#1a1a1a] border border-white/[0.08] rounded-lg text-[#a3a3a3] hover:text-[#f5f5f5]"><RefreshCw className="w-4 h-4"/>Refresh</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Active DMCs" value="47" color="teal" icon={<Building2 className="w-8 h-8"/>}/>
        <StatCard label="Operators" value="182" color="blue" icon={<Users className="w-8 h-8"/>}/>
        <StatCard label="Verified Drivers" value="329" color="green" icon={<UserCheck className="w-8 h-8"/>}/>
        <StatCard label="Est. MRR" value="฿186,000" color="amber" icon={<DollarSign className="w-8 h-8"/>}/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Trips" value="23" color="green" icon={<Calendar className="w-8 h-8"/>}/>
        <StatCard label="Vehicles" value="456" color="grey" icon={<Car className="w-8 h-8"/>}/>
        <StatCard label="Pending Review" value="12" color="amber" icon={<AlertCircle className="w-8 h-8"/>}/>
        <StatCard label="Recent Bookings" value="89" color="blue" icon={<FileText className="w-8 h-8"/>}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#141414] border border-white/[0.08] rounded-xl">
          <div className="px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">7-Day Booking Trend</h3></div>
          <div className="p-6"><ResponsiveContainer width="100%" height={200}><AreaChart data={bookingTrend}><defs><linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3}/><stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/><XAxis dataKey="date" stroke="#737373" style={{fontSize:12}}/><YAxis stroke="#737373" style={{fontSize:12}}/><Tooltip {...tt}/><Area type="monotone" dataKey="bookings" stroke="#1D9E75" fillOpacity={1} fill="url(#cb)"/></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="bg-[#141414] border border-white/[0.08] rounded-xl">
          <div className="px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">MRR Growth</h3></div>
          <div className="p-6"><ResponsiveContainer width="100%" height={200}><LineChart data={revenueTrend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/><XAxis dataKey="month" stroke="#737373" style={{fontSize:12}}/><YAxis stroke="#737373" style={{fontSize:12}}/><Tooltip {...tt} formatter={(v:number)=>`฿${v.toLocaleString()}`}/><Line type="monotone" dataKey="revenue" stroke="#1D9E75" strokeWidth={2} dot={{fill:'#1D9E75',r:4}}/></LineChart></ResponsiveContainer></div>
        </div>
      </div>
      <div className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-[#f59e0b]"/><div><div className="text-sm font-medium text-[#f59e0b]">12 drivers pending approval</div><div className="text-xs text-[#a3a3a3]">Review driver applications to activate their accounts</div></div></div>
        <Link href="/admin/pending" className="px-3 py-1.5 text-xs bg-[#1a1a1a] border border-white/[0.08] rounded-lg text-[#a3a3a3] hover:text-[#f5f5f5]">Review</Link>
      </div>
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">Recent Bookings</h3><Link href="/admin/bookings" className="text-xs text-[#1D9E75] hover:underline">View all</Link></div>
        <table className="w-full"><thead><tr className="border-b border-white/[0.08]">{['Ref','Client','DMC','Days','Status','Created'].map(h=><th key={h} className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase">{h}</th>)}</tr></thead>
        <tbody>{recentBookings.map((b,i)=><tr key={i} className="border-b border-white/[0.04] hover:bg-[#1a1a1a]"><td className="px-4 py-3 text-sm font-mono text-[#1D9E75]">{b.ref}</td><td className="px-4 py-3 text-sm font-medium">{b.client}</td><td className="px-4 py-3 text-sm text-[#a3a3a3]">{b.dmc}</td><td className="px-4 py-3 text-sm font-mono">{b.days}</td><td className="px-4 py-3"><StatusBadge status={b.status}/></td><td className="px-4 py-3 text-sm font-mono text-[#a3a3a3]">{b.created}</td></tr>)}</tbody></table>
      </div>
    </AdminShell>
  )
}
