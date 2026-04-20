'use client'
import { ReactNode, useEffect, useState } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  color?: 'teal' | 'blue' | 'green' | 'amber' | 'red' | 'grey' | 'purple'
  icon?: ReactNode
  sparkData?: number[]
}

const colorMap: Record<string, { accent: string; border: string }> = {
  teal:   { accent: 'var(--teal)',   border: 'var(--teal)' },
  blue:   { accent: 'var(--blue)',   border: 'var(--blue)' },
  green:  { accent: 'var(--green)',  border: 'var(--green)' },
  amber:  { accent: 'var(--amber)',  border: 'var(--amber)' },
  red:    { accent: 'var(--red)',    border: 'var(--red)' },
  grey:   { accent: 'var(--text-2)', border: 'var(--text-3)' },
  purple: { accent: 'var(--purple)', border: 'var(--purple)' },
}

const defaultSpark = [4, 7, 5, 9, 6, 11, 8, 13, 10, 15, 12, 17]

export function StatCard({ label, value, sublabel, color = 'teal', icon, sparkData }: StatCardProps) {
  const { accent, border } = colorMap[color] || colorMap.teal
  const data = (sparkData || defaultSpark).map(v => ({ v }))
  const [display, setDisplay] = useState(0)
  const numericValue = typeof value === 'number' ? value : null

  useEffect(() => {
    if (numericValue === null) return
    let start = 0
    const end = numericValue
    const duration = 900
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, 16)
    return () => clearInterval(timer)
  }, [numericValue])

  return (
    <div
      className="relative rounded-xl p-5 overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${border}` }}
    >
      {/* Label + Icon */}
      <div className="flex items-start justify-between mb-3">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        {icon && <span style={{ color: accent, opacity: 0.6 }}>{icon}</span>}
      </div>

      {/* Value */}
      <div className="mb-1" style={{ fontFamily: 'var(--font-body)', fontSize: 28, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>
        {numericValue !== null ? display.toLocaleString() : value}
      </div>

      {/* Sublabel + Sparkline */}
      <div className="flex items-end justify-between mt-2">
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{sublabel}</span>
        <div style={{ width: 64, height: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={accent} strokeWidth={1.5} fill={`url(#sg-${color})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
