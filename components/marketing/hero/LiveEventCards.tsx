"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

const EVENTS = [
  { id: 1, title: "NEW BOOKING",    line1: "BK-2026-4187",      line2: "Bangkok → Phuket · 7d · ฿28,400", side: "left"  },
  { id: 2, title: "DRIVER ACCEPTED", line1: "Somchai · กข 1234", line2: "LINE confirmed · 14s",             side: "left"  },
  { id: 3, title: "PICKUP PHOTO",   line1: "Hotel Suvarnabhumi", line2: "GPS · 13.68°N 100.74°E",           side: "right" },
  { id: 4, title: "PAYMENT CLEARED", line1: "฿4,200 · Trip T301", line2: "Krabi completed · 22s",           side: "right" },
] as const

export function LiveEventCards() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const i = setInterval(() => setIdx((p) => (p + 1) % EVENTS.length), 1800)
    return () => clearInterval(i)
  }, [])

  const event = EVENTS[idx]
  const sideClass = event.side === "left" ? "left-4 md:left-8" : "right-4 md:right-8"
  const xInit = event.side === "left" ? -30 : 30

  return (
    <div className="hidden md:block absolute top-1/2 w-full pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: xInit }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className={`absolute ${sideClass} bg-[rgba(10,15,22,0.92)] backdrop-blur-md border-l-2 border-[#2ee5a0] border border-white/10 rounded-lg px-4 py-3 min-w-[200px]`}
        >
          <div className="text-[#2ee5a0] font-mono text-[10px] font-bold tracking-widest mb-1">
            {event.title}
          </div>
          <div className="text-white/90 text-[11px] font-mono">{event.line1}</div>
          <div className="text-white/50 text-[9px] font-mono mt-0.5">{event.line2}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
