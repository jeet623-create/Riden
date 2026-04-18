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
  primary: { border: "border-l-[#1D9E75]", text: "text-[#1D9E75]", stroke: "#1D9E75", fill: "rgba(29, 158, 117, 0.1)" },
  amber: { border: "border-l-[#f59e0b]", text: "text-[#f59e0b]", stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.1)" },
  green: { border: "border-l-[#22c55e]", text: "text-[#22c55e]", stroke: "#22c55e", fill: "rgba(34, 197, 94, 0.1)" },
  blue: { border: "border-l-[#3b82f6]", text: "text-[#3b82f6]", stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.1)" },
}

function easeOutQuart(t: number): number { return 1 - Math.pow(1 - t, 4) }

export function StatCard({ label, value, subLabel, icon: Icon, accentColor = "primary", sparklineData }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)
  const colors = colorMap[accentColor]

  useEffect(() => {
    const duration = 1000
    startTimeRef.current = undefined
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime
      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      setDisplayValue(Math.round(easeOutQuart(progress) * value))
      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [value])

  const chartData = sparklineData?.map((v, i) => ({ value: v, index: i })) || []

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-surface border border-border rounded-xl p-5 relative overflow-hidden border-l-[3px] transition-all duration-150 ${colors.border} ${isHovered ? "border-border-strong" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-[10px] uppercase text-muted tracking-wider">{label}</span>
        <Icon className={`w-[18px] h-[18px] ${colors.text} opacity-60`} />
      </div>
      <div className="font-sans font-bold text-[28px] text-foreground mb-2">{displayValue.toLocaleString()}</div>
      <div className="flex items-end justify-between">
        {subLabel && <span className="text-xs text-muted">{subLabel}</span>}
        {chartData.length > 0 && (
          <div className="w-16 h-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="value" stroke={colors.stroke} strokeWidth={1.5} fill={colors.fill} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}