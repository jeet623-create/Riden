'use client'
import { ReactNode, useEffect, useState } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  color?: 'teal' | 'blue' | 'green' | 'amber' | 'grey' | 'purple' | 'red'
  icon?: ReactNode
  sparklineData?: number[]
}

const colorMap: Record<string, { border: string; icon: string }> = {
  teal: { border: 'var(--teal)', icon: 'var(--teal)' },
  blue: { border: 'var(--blue)', icon: 'var(--blue)' },
  green: { border: 'var(--green)', icon: 'var(--green)' },
  amber: { border: 'var(--amber)', icon: 'var(--amber)' },
  grey: { border: 'var(--text-3)', icon: 'var(--text-3)' },
  purple: { border: 'var(--purple)', icon: 'var(--purple)' },
  red: { border: 'var(--red)', icon: 'var(--red)' },
}

// Animate number counting
function useCountUp(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [target, duration])
  
  return count
}

export function StatCard({ label, value, sublabel, color = 'teal', icon, sparklineData }: StatCardProps) {
  const colors = colorMap[color]
  
  // Parse numeric value for count-up animation
  const numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/[^0-9]/g, '')) || 0 
    : value
  const animatedValue = useCountUp(numericValue)
  
  // Format the displayed value
  const displayValue = typeof value === 'string'
    ? value.replace(/\d+/, animatedValue.toLocaleString())
    : animatedValue.toLocaleString()

  // Generate sparkline data if not provided
  const sparkData = sparklineData || [4, 7, 5, 9, 6, 8, 7, 10, 8, 12]

  return (
    <div 
      className="relative overflow-hidden rounded-xl p-5 transition-all duration-150 card-hover"
      style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border)',
        borderLeftWidth: 3,
        borderLeftColor: colors.border
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <span 
          className="uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}
        >
          {label}
        </span>
        {icon && (
          <div style={{ color: colors.icon, opacity: 0.6 }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div 
        className="font-bold mb-1"
        style={{ fontFamily: 'var(--font-body)', fontSize: 28 }}
      >
        {displayValue}
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between">
        {sublabel && (
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
            {sublabel}
          </span>
        )}
        
        {/* Sparkline */}
        <div className="w-16 h-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData.map((v, i) => ({ v }))}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.border} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.border} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="v" 
                stroke={colors.border} 
                strokeWidth={1.5}
                fill={`url(#gradient-${color})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
