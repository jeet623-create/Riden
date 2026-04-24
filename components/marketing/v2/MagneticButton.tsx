"use client"

import { ReactNode, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: "primary" | "ghost"
  className?: string
  strength?: number // px of displacement at peak
}

// Magnetic hover: the button tracks the cursor toward it within its bounding
// box, falling off at the edges. No-op on touch / reduced motion. Can render
// as a <Link> (if href given) or a <button>.
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  strength = 14,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 300, damping: 24, mass: 0.3 })
  const y = useSpring(my, { stiffness: 300, damping: 24, mass: 0.3 })

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = (e.clientX - cx) / (r.width / 2)
    const dy = (e.clientY - cy) / (r.height / 2)
    mx.set(dx * strength)
    my.set(dy * strength)
  }
  function onLeave() {
    mx.set(0); my.set(0)
  }

  const base =
    "inline-flex items-center gap-2 rounded-md px-5 py-3 text-[13px] font-medium font-mono uppercase tracking-[0.15em] transition-colors"
  const variantCls =
    variant === "primary"
      ? "bg-[#1D9E75] text-[#0a0b0e] hover:bg-[#23b886]"
      : "border border-[rgba(243,241,234,0.2)] text-[#f3f1ea] hover:border-[#1D9E75] hover:text-[#1D9E75]"

  const inner = (
    <motion.span
      style={{ x, y }}
      className={cn(base, variantCls, className)}
      data-magnetic
    >
      {children}
    </motion.span>
  )

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="inline-block"
    >
      {href ? (
        <Link href={href}>{inner}</Link>
      ) : (
        <button type="button" onClick={onClick} className="inline-block">
          {inner}
        </button>
      )}
    </motion.div>
  )
}
