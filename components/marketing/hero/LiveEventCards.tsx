"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

type Event = {
  kind: string
  id: string
  route: string
  age: string
}

const EVENTS: Event[] = [
  { kind: "BOOKING CREATED", id: "BK-2026-4187", route: "Bangkok → Phuket", age: "2s" },
  { kind: "DRIVER VERIFIED", id: "Somchai",      route: "Chiang Mai",       age: "14s" },
  { kind: "PAYMENT CLEARED", id: "฿4,200 THB",   route: "Krabi",            age: "22s" },
  { kind: "TRIP COMPLETED",  id: "BK-2026-4091", route: "Pattaya → Bangkok", age: "32s" },
]

function Card({ evt }: { evt: Event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35 }}
      className="rounded-lg border-l-2 border-l-[#2ee5a0] px-3 py-2"
      style={{
        background: "rgba(5,8,14,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 10,
        color: "rgba(237,230,215,0.85)",
        letterSpacing: "0.08em",
        minWidth: 220,
      }}
    >
      <div style={{ color: "#2ee5a0" }}>{evt.kind}</div>
      <div style={{ marginTop: 2 }}>
        {evt.id} · {evt.route}
      </div>
      <div style={{ marginTop: 2, color: "rgba(237,230,215,0.4)" }}>{evt.age} ago</div>
    </motion.div>
  )
}

function useRotation(list: Event[], intervalMs = 1800) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % list.length), intervalMs)
    return () => clearInterval(id)
  }, [list.length, intervalMs])
  return list[idx]
}

/** Desktop stacking of 4 cards on left + right of hero. */
export function LiveEventCardsDesktop() {
  const leftEvents = [EVENTS[0], EVENTS[1]]
  const rightEvents = [EVENTS[2], EVENTS[3]]
  return (
    <div aria-hidden className="pointer-events-none hidden md:block">
      <div className="absolute left-6 top-1/4 flex flex-col gap-3">
        {leftEvents.map((e, i) => (
          <AnimatePresence mode="wait" key={`left-${i}`}>
            <Card key={e.id} evt={e} />
          </AnimatePresence>
        ))}
      </div>
      <div className="absolute right-6 top-1/3 flex flex-col gap-3">
        {rightEvents.map((e, i) => (
          <AnimatePresence mode="wait" key={`right-${i}`}>
            <Card key={e.id} evt={e} />
          </AnimatePresence>
        ))}
      </div>
    </div>
  )
}

/** Mobile horizontal marquee ticker below hero. */
export function LiveEventCardsMobile() {
  const current = useRotation(EVENTS)
  return (
    <div aria-hidden className="md:hidden w-full overflow-hidden px-4">
      <AnimatePresence mode="wait">
        <Card key={current.id} evt={current} />
      </AnimatePresence>
    </div>
  )
}
