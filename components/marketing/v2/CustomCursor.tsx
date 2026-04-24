"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

// 8px teal dot + 28px ring. Only renders on devices that can actually hover
// with a fine pointer (per 43.md). Ring scales 2x when hovering a link/button,
// morphs into a rounded square when hovering raw text.
export function CustomCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const [enabled, setEnabled] = useState(false)
  const [variant, setVariant] = useState<"default" | "link" | "text">("default")

  const dotX = useSpring(x, { stiffness: 500, damping: 28, mass: 0.4 })
  const dotY = useSpring(y, { stiffness: 500, damping: 28, mass: 0.4 })
  const ringX = useSpring(x, { stiffness: 300, damping: 25, mass: 0.4 })
  const ringY = useSpring(y, { stiffness: 300, damping: 25, mass: 0.4 })

  const enabledRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!canHover || reduce) return
    enabledRef.current = true
    setEnabled(true)

    function move(e: MouseEvent) {
      x.set(e.clientX)
      y.set(e.clientY)
      const el = e.target as HTMLElement | null
      if (!el) return
      const isLink = !!el.closest("a, button, [role='button'], [data-magnetic]")
      const isText = !!el.closest("p, h1, h2, h3, h4, h5, h6, pre, li, span")
      setVariant(isLink ? "link" : isText ? "text" : "default")
    }

    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [x, y])

  if (!enabled) return null

  return (
    <>
      {/* Inner dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[60]"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
      >
        <div
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor: "var(--studio-teal, #1D9E75)",
          }}
        />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[60] mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: variant === "link" ? 56 : variant === "text" ? 34 : 28,
          height: variant === "link" ? 56 : variant === "text" ? 34 : 28,
          borderRadius: variant === "text" ? 6 : 9999,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div
          className="h-full w-full"
          style={{
            border: "1px solid rgba(243,241,234,0.7)",
            borderRadius: "inherit",
          }}
        />
      </motion.div>
    </>
  )
}
