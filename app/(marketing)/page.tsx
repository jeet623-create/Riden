"use client"

import { motion } from "framer-motion"
import { Wordmark } from "@/components/brand/Wordmark"
import { DotGrid } from "@/components/marketing/v2/DotGrid"
import { MagneticButton } from "@/components/marketing/v2/MagneticButton"
import { ThailandNetwork } from "@/components/marketing/v2/ThailandNetwork"
import { LiveCounters } from "@/components/marketing/v2/LiveCounters"
import { HomeFinalCta } from "@/components/marketing/v2/HomeFinalCta"

export default function MarketingHome() {
  return (
    <div className="bg-[#0a0b0e] text-[#f3f1ea]">
      {/* HERO — copy on the left, live Thailand network on the right */}
      <section
        id="network"
        className="relative min-h-[calc(100vh-56px)] overflow-hidden"
      >
        <DotGrid />

        <div className="relative z-[2] mx-auto grid min-h-[calc(100vh-56px)] max-w-[1280px] grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* LEFT — copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]"
            >
              <span className="mr-3 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[#1D9E75] motion-safe:animate-pulse" />
              BUILT IN BANGKOK · LIVE NETWORK
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="mt-8"
            >
              <Wordmark size="xl" className="text-[#f3f1ea]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
              className="mt-6 max-w-xl font-display text-3xl font-bold leading-[1.05] tracking-[-0.01em] text-[#f3f1ea] sm:text-5xl"
            >
              The coordination layer for Thailand&apos;s inbound tourism.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-[#9a9ca3] sm:text-lg"
            >
              Every booking. Every driver. Every province. One live system —
              replacing WhatsApp threads, Excel sheets, and missed pickups
              with a network that just runs.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="mt-6 font-mono text-[11px] tracking-[0.22em] text-[#5a5d65]"
            >
              WHERE GEARS MEET GREEN.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <MagneticButton href="/contact" variant="primary">
                Book a demo ↗
              </MagneticButton>
              <MagneticButton href="#signal" variant="ghost">
                See it run
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="mt-16 flex items-center gap-3"
            >
              <span className="font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
                SCROLL
              </span>
              <div className="relative h-10 w-px overflow-hidden bg-[#23262e]">
                <motion.div
                  className="absolute left-0 top-0 h-full w-px bg-[#1D9E75]"
                  animate={{ y: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT — live Thailand network */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative mx-auto w-full max-w-[480px] lg:max-w-none"
          >
            <ThailandNetwork />
          </motion.div>
        </div>
      </section>

      {/* LIVE SIGNAL — counters */}
      <div id="signal">
        <LiveCounters />
      </div>

      {/* CLOSING CTA */}
      <HomeFinalCta />
    </div>
  )
}
