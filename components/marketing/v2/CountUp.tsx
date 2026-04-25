"use client"

import { animate, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type Props = {
  value: number
  duration?: number
  className?: string
}

export function CountUp({ value, duration = 1.4, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: false, margin: "-20% 0px" })
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!ref.current) return
    if (!inView) return

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced) {
      setDisplay(value)
      fromRef.current = value
      return
    }

    const controls = animate(fromRef.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => {
        fromRef.current = value
      },
    })
    return () => controls.stop()
  }, [value, duration, inView])

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-US")}
    </span>
  )
}
