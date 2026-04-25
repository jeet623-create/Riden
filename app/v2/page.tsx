"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Wordmark } from "@/components/brand/Wordmark"
import { Nav } from "@/components/marketing/v2/Nav"
import { Footer } from "@/components/marketing/v2/Footer"
import { DotGrid } from "@/components/marketing/v2/DotGrid"
import { GrainOverlay } from "@/components/marketing/v2/GrainOverlay"
import { CustomCursor } from "@/components/marketing/v2/CustomCursor"
import { MagneticButton } from "@/components/marketing/v2/MagneticButton"
import { HeroParticles } from "@/components/marketing/v2/HeroParticles"
import { LiveCounters } from "@/components/marketing/v2/LiveCounters"

// Step 2 of 43.md — brand foundation showcase with a taste of Step 3 motion.
// /v2 lives OUTSIDE app/(marketing) so the existing marketing nav doesn't
// stack on top of our new Step 2 nav.

export const dynamic = "force-dynamic"

export default function V2Page() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#f3f1ea]">
      <GrainOverlay />
      <CustomCursor />

      <Nav />

      {/* HERO — Step 2 brand foundation with animated entrance + R3F particles */}
      <section className="relative min-h-[calc(100vh-56px)] overflow-hidden">
        <DotGrid />
        {!reduced && <HeroParticles />}

        <div className="relative z-[2] mx-auto flex min-h-[calc(100vh-56px)] max-w-[1280px] flex-col justify-center px-6 py-20">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]"
          >
            DIRECTION 09 · STEP 02 / 17
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="mt-8"
          >
            <Wordmark size="xl" className="text-[#f3f1ea]" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
            className="mt-6 max-w-2xl font-display italic text-2xl leading-tight text-[#9a9ca3] sm:text-3xl"
          >
            Coordinates Thailand&apos;s inbound tourism transport.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="mt-3 font-mono text-[11px] tracking-[0.22em] text-[#5a5d65]"
          >
            WHERE GEARS MEET GREEN.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.95 }}
            className="mt-12 flex flex-wrap items-center gap-3"
          >
            <MagneticButton href="/contact" variant="primary">
              Book a demo ↗
            </MagneticButton>
            <MagneticButton href="#primitives" variant="ghost">
              See the foundation
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-24 flex items-center gap-3"
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
      </section>

      {/* LIVE COUNTERS — Step 03 anchor */}
      <LiveCounters />

      {/* PRIMITIVES INVENTORY */}
      <section
        id="primitives"
        className="relative border-t border-[#23262e] bg-[#111318]"
      >
        <DotGrid />
        <div className="relative z-[2] mx-auto max-w-[1280px] px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]">
              STEP 02 / 17 · BRAND FOUNDATION
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.01em] text-[#f3f1ea] sm:text-5xl">
              Every primitive the site will lean on.
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <PrimitiveCard
                  label={card.label}
                  title={card.title}
                  body={card.body}
                >
                  {card.render()}
                </PrimitiveCard>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-14 font-display italic text-lg text-[#9a9ca3] sm:text-xl"
          >
            Step 02 of 17 complete. Home page untouched — visit{" "}
            <a href="/" className="text-[#1D9E75] underline">
              riden.me
            </a>
            {" "}to verify.
          </motion.p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function PrimitiveCard({
  label,
  title,
  body,
  children,
}: {
  label: string
  title: string
  body: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-[#23262e] bg-[#16191f] p-6">
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
        {label}
      </p>
      <h3 className="mt-2 font-display text-xl font-bold text-[#f3f1ea]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#9a9ca3]">
        {body}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  )
}

const cards = [
  {
    label: "01 WORDMARK",
    title: "Syne Bold + teal ↗",
    body:
      "Logo and arrow are one unit. Never show one without the other. Five sizes tuned against the source SVG.",
    render: () => (
      <div className="flex flex-col items-start gap-4">
        <Wordmark size="xs" />
        <Wordmark size="sm" />
        <Wordmark size="md" />
        <Wordmark size="lg" />
      </div>
    ),
  },
  {
    label: "02 TYPOGRAPHY",
    title: "Three faces, one role each",
    body:
      "Syne for wordmark + display. Inter Tight for body. JetBrains Mono for labels + metadata.",
    render: () => (
      <div className="space-y-3">
        <p className="font-display text-4xl font-bold tracking-tight text-[#f3f1ea]">
          Syne 700
        </p>
        <p className="text-base text-[#f3f1ea]">Inter Tight — the body face.</p>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#9a9ca3]">
          JETBRAINS MONO · 0.22EM
        </p>
        <p className="font-thai text-lg text-[#f3f1ea]">ไรเดน คือการประสานงาน</p>
      </div>
    ),
  },
  {
    label: "03 COLOR",
    title: "Ink, sand, teal. That's it.",
    body:
      "60% ink / 25% neutral / 10% teal / 5% sand. Line green only on LINE-connect UI.",
    render: () => (
      <div className="grid grid-cols-4 gap-2">
        {[
          { c: "#0a0b0e", n: "BG" },
          { c: "#111318", n: "SURFACE" },
          { c: "#23262e", n: "BORDER" },
          { c: "#f3f1ea", n: "INK" },
          { c: "#9a9ca3", n: "MUTED" },
          { c: "#1D9E75", n: "TEAL" },
          { c: "#EDE8DA", n: "SAND" },
          { c: "#06C755", n: "LINE" },
        ].map((s) => (
          <div key={s.n} className="space-y-1">
            <div
              className="h-16 rounded-sm border border-[#23262e]"
              style={{ background: s.c }}
            />
            <p className="font-mono text-[9px] tracking-[0.15em] text-[#5a5d65]">
              {s.n}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "04 MAGNETIC BUTTON",
    title: "Primary + ghost",
    body:
      "The button tracks your cursor when it's inside the bounding box. Falls off at the edges. Disabled on reduced-motion.",
    render: () => (
      <div className="flex flex-wrap gap-3">
        <MagneticButton variant="primary">Book a demo ↗</MagneticButton>
        <MagneticButton variant="ghost">See how it works</MagneticButton>
      </div>
    ),
  },
  {
    label: "05 DOT GRID",
    title: "28px × 1px, 4% alpha",
    body:
      "Non-interactive background texture. Absolute-positioned in any section container to keep the studio rhythm.",
    render: () => (
      <div className="relative h-32 overflow-hidden rounded-sm border border-[#23262e] bg-[#0a0b0e]">
        <DotGrid />
      </div>
    ),
  },
  {
    label: "06 GRAIN OVERLAY",
    title: "SVG noise · 3.5% · fixed",
    body:
      "Sits above the entire page at z-1. Adds the film-grain texture you feel more than you see.",
    render: () => (
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
        ACTIVE ON THIS PAGE · LOOK CLOSELY
      </p>
    ),
  },
  {
    label: "07 CUSTOM CURSOR",
    title: "8px teal dot + 28px ring",
    body:
      "Only on hover-capable fine-pointer devices. Ring scales on links + morphs into a rounded square on text.",
    render: () => (
      <div className="space-y-1 font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]">
        <p>· MOVE YOUR CURSOR HERE</p>
        <p>· HOVER A LINK</p>
        <p>· HOVER RAW TEXT</p>
      </div>
    ),
  },
  {
    label: "08 STEP 3 PREVIEW",
    title: "What lands next",
    body:
      "R3F particle field visible behind the hero already. Step 3 makes it the anchor, adds split-text reveal, scroll choreography, and the real CTA halo.",
    render: () => (
      <MagneticButton variant="ghost">Ready when you are</MagneticButton>
    ),
  },
]
