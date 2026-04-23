"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  /** Delay before the fade-up starts, in seconds. */
  delay?: number
  /** How far below the final position the element starts. */
  y?: number
  /** If true, animates on mount instead of on scroll-into-view. */
  immediate?: boolean
  /** Extra classes on the wrapper. */
  className?: string
  /** Override the default ease/duration. */
  duration?: number
  /** Render as an inline span instead of a block div. */
  as?: "div" | "span"
}

/**
 * Reveal — cinematic fade-up used across the marketing home.
 * Default behaviour fires when the element scrolls into view; pass
 * `immediate` for above-the-fold entrance cascades.
 *
 * Respects prefers-reduced-motion: if the user has reduced motion on,
 * the children appear instantly without movement.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  immediate = false,
  className,
  duration = 0.7,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion()
  const initial = reduce ? { opacity: 1, y: 0 } : { opacity: 0, y }
  const target = { opacity: 1, y: 0 }
  const transition = { duration, delay, ease: [0.22, 1, 0.36, 1] as const }

  if (as === "span") {
    return (
      <motion.span
        className={className}
        initial={initial}
        {...(immediate
          ? { animate: target }
          : { whileInView: target, viewport: { once: true, amount: 0.25 } })}
        transition={transition}
      >
        {children}
      </motion.span>
    )
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      {...(immediate
        ? { animate: target }
        : { whileInView: target, viewport: { once: true, amount: 0.25 } })}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
