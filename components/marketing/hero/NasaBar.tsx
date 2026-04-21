"use client"

import { useEffect, useState } from "react"

function useBangkokTime() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const tick = () => {
      const t = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      setTime(t)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  return time
}

export function NasaBar() {
  const time = useBangkokTime()
  return (
    <div
      className="absolute left-4 top-[72px] md:left-10 md:top-[88px] flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]"
      style={{ color: "rgba(237,230,215,0.65)" }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 motion-safe:animate-pulse"
        aria-hidden
      />
      <span>LIVE</span>
      <span className="opacity-40">·</span>
      <span>NASA VIIRS + RIDEN NETWORK</span>
      <span className="opacity-40 hidden sm:inline">·</span>
      <span className="hidden sm:inline">{time} ICT</span>
    </div>
  )
}
