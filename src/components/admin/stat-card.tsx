'use client'
import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
interface StatCardProps { label: string; value: string | number; trend?: { value: string; direction: 'up' | 'down' }; color?: 'teal'|'blue'|'green'|'amber'|'grey'|'purple'; icon?: ReactNode }
const colorMap: Record<string,string> = { teal:'from-[#1D9E75]',blue:'from-[#3b82f6]',green:'from-[#22c55e]',amber:'from-[#f59e0b]',grey:'from-[#737373]',purple:'from-[#a855f7]' }
export function StatCard({ label, value, trend, color='teal', icon }: StatCardProps) {
  return (
    <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colorMap[color]} to-transparent`}/>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-[#737373] text-xs mb-2">{label}</div>
          <div className="font-mono text-3xl font-medium mb-1">{value}</div>
          {trend && <div className={`flex items-center gap-1 text-xs ${trend.direction==='up'?'text-[#22c55e]':'text-[#ef4444]'}`}>{trend.direction==='up'?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}<span>{trend.value}</span></div>}
        </div>
        {icon && <div className="text-[#737373] opacity-20">{icon}</div>}
      </div>
    </div>
  )
}
