"use client"

import { motion } from "framer-motion"
import { MagneticButton } from "./MagneticButton"
import { DotGrid } from "./DotGrid"

export function HomeFinalCta() {
  return (
    <section className="relative border-t border-[#23262e] bg-[#0a0b0e]">
      <DotGrid />
      <div className="relative z-[2] mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]"
        >
          THE INVITATION
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.01em] text-[#f3f1ea] sm:text-6xl"
        >
          Run your DMC like a network.
          <br />
          <span className="text-[#9a9ca3]">Not a group chat.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-[#9a9ca3] sm:text-lg"
        >
          60-day free trial. No credit card. Onboard your team and your
          drivers in an afternoon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <MagneticButton href="/dmc/register" variant="primary">
            Begin trial ↗
          </MagneticButton>
          <MagneticButton href="/contact" variant="ghost">
            Talk to a founder
          </MagneticButton>
        </motion.div>

        <p className="mt-12 max-w-md font-mono text-[10px] leading-relaxed tracking-[0.22em] text-[#5a5d65]">
          MADE IN BANGKOK · COORDINATING TRIPS ACROSS 7 PROVINCES · LIVE SINCE
          2026
        </p>
      </div>
    </section>
  )
}
