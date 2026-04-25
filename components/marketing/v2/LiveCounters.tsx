"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { CountUp } from "./CountUp"
import { DotGrid } from "./DotGrid"

type Counters = {
  bookings_this_month: number
  active_dmcs: number
  trips_in_progress: number
  fetched_at: string
  source: "live" | "fallback"
}

const POLL_MS = 15_000

export function LiveCounters() {
  const [data, setData] = useState<Counters | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/marketing/live-counters", {
          cache: "no-store",
        })
        if (!res.ok) return
        const json = (await res.json()) as Counters
        if (!cancelled) setData(json)
      } catch {
        // swallow — keep last good value
      }
    }

    load()
    const id = setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <section className="relative border-t border-[#23262e] bg-[#0a0b0e]">
      <DotGrid />
      <div className="relative z-[2] mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex items-end justify-between gap-6"
        >
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]">
              STEP 03 · LIVE SIGNAL
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.01em] text-[#f3f1ea] sm:text-5xl">
              The network, in motion right now.
            </h2>
          </div>
          <PulseDot live={data?.source === "live"} />
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-md border border-[#23262e] bg-[#23262e] sm:grid-cols-3">
          <Stat
            label="BOOKINGS COORDINATED · THIS MONTH"
            value={data?.bookings_this_month ?? 0}
            ready={!!data}
          />
          <Stat
            label="DMCS ON THE NETWORK"
            value={data?.active_dmcs ?? 0}
            ready={!!data}
          />
          <Stat
            label="TRIPS IN PROGRESS · LIVE"
            value={data?.trips_in_progress ?? 0}
            ready={!!data}
            pulse
          />
        </div>

        <p className="mt-6 font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
          {data?.source === "fallback"
            ? "OFFLINE · CACHED VALUES"
            : data
              ? `LIVE · UPDATED ${formatRel(data.fetched_at)}`
              : "CONNECTING..."}
        </p>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  ready,
  pulse,
}: {
  label: string
  value: number
  ready: boolean
  pulse?: boolean
}) {
  return (
    <div className="relative bg-[#0a0b0e] p-8 sm:p-10">
      <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]">
        {pulse && (
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1D9E75] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
          </span>
        )}
        {label}
      </p>
      <p className="mt-6 font-display text-5xl font-bold tracking-[-0.02em] text-[#f3f1ea] sm:text-6xl">
        {ready ? <CountUp value={value} /> : <span className="text-[#23262e]">0</span>}
      </p>
    </div>
  )
}

function PulseDot({ live }: { live: boolean }) {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="relative inline-flex h-2 w-2">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1D9E75] opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${live ? "bg-[#1D9E75]" : "bg-[#5a5d65]"}`}
        />
      </span>
      <span className="font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]">
        {live ? "LIVE FEED" : "OFFLINE"}
      </span>
    </div>
  )
}

function formatRel(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const s = Math.floor(diff / 1000)
  if (s < 5) return "JUST NOW"
  if (s < 60) return `${s}S AGO`
  const m = Math.floor(s / 60)
  return `${m}M AGO`
}
