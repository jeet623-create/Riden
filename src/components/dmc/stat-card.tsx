"use client"

import { useEffect, useState, useRef } from "react"
import { LucideIcon } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface StatCardProps {
  label: string
  value: number
  subLabel?: string
  icon: LucideIcon
  accentColor?: "primary" | "amber" | "green" | "blue"
  sparklineData?: number[]
}

const colorMap = {
  primary: { border: "3px solid #1D9E75", text: "#1D9E75", stroke: "#1D9E75", fill: "rgba(29,158,117,0.1)" },
  amber: { border: "3px solid #f59e0b", text: "#f59e0b", stroke: "#f59e0b", fill: "rgba(245,158,11,0.1)" },
  green: { border: "3px solid #22c55e", text: "#22c55e", stroke: "#22c55e", fill: "rgba(34,197,94,0.1)" },
  blue: { border: "3px solid #3b82f6", text: "#3b82f6", stroke: "#3b82f6", fill: "rgba(59,130,246,0.1)" },
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

export function StatCard({ label, value, subLabel, icon: Icon, accentColor = "primary", sparklineData }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const colors = colorMap[accentColor]
  const defaultSparkline = [4,7,5,9,6,11,8,13,10,15,12,17]
  const data = (sparklineData || defaultSparkline).map(v => ({ v }))

  useEffect(() => {
    const duration = 900
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      const eased = easeOutQuart(progress)
      setDisplayValue(Math.round(eased * value))
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [value])

  return (
    <div style={{
      background: "var(--bg-surface,#111)",
      border: "1px solid var(--border,#242424)",
      borderLeft: colors.border,
      borderRadius: 12,
      padding: 20,
      position: "relative",
      overflow: "hidden",
      transition: "box-shadow 200ms"
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontFamily:"var(--font-mono,monospace)",fontSize:10,color:"var(--text-2,#999)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
        <Icon size={18} color={colors.text} style={{opacity:0.6}} />
      </div>
      <div style={{fontFamily:"var(--font-body,sans-serif)",fontSize:28,fontWeight:700,color:"var(--text-1,#f0f0f0)",lineHeight:1,marginBottom:4}}>
        {displayValue.toLocaleString()}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        {subLabel && <span style={{fontSize:12,color:"var(--text-2,#999)"}}>{subLabel}</span>}
        <div style={{width:64,height:24}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`sg-${accentColor}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.stroke} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={colors.stroke} strokeWidth={1.5} fill={`url(#sg-${accentColor})`} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
