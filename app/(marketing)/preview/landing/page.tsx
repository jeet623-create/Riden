import type { Metadata } from "next"
import { AmbientStarfield } from "@/components/marketing/hero/AmbientStarfield"
import { SatelliteGlow } from "@/components/marketing/hero/SatelliteGlow"
import { ThailandHero } from "@/components/marketing/hero/ThailandHero"
import {
  LiveEventCardsDesktop,
  LiveEventCardsMobile,
} from "@/components/marketing/hero/LiveEventCards"
import { NasaBar } from "@/components/marketing/hero/NasaBar"

export const metadata: Metadata = {
  title: "Landing preview — Riden",
  robots: { index: false, follow: false },
}

export default function LandingPreviewPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] -mt-16 pt-16 overflow-hidden bg-[#05080e]">
      <AmbientStarfield />
      <SatelliteGlow />
      <NasaBar />

      <section className="relative z-10 flex flex-col items-center justify-start px-4 pt-10 md:pt-16 pb-16">
        {/* Pill */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em]"
          style={{
            borderColor: "rgba(46,229,160,0.3)",
            background: "rgba(29,158,117,0.08)",
            color: "rgba(237,230,215,0.85)",
          }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2ee5a0] motion-safe:animate-pulse" />
          77 PROVINCES · ONE NETWORK · ALWAYS ON
        </div>

        {/* H1 */}
        <h1
          className="font-display text-center italic font-semibold text-white leading-[1.05] mb-5"
          style={{
            fontSize: "clamp(36px, 7vw, 80px)",
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          Where Thailand moves at night
          <span className="not-italic text-[#2ee5a0] font-medium ml-1">↗</span>
        </h1>

        <p
          className="text-center text-white/70 mb-3"
          style={{
            fontFamily: "var(--font-body, var(--font-inter)), system-ui, sans-serif",
            fontSize: "clamp(15px, 1.6vw, 18px)",
            maxWidth: 640,
          }}
        >
          Every booking. Every driver. Every province. Live.
        </p>
        <p
          className="text-center text-white/50 mb-10"
          style={{
            fontFamily: "var(--font-body, var(--font-inter)), system-ui, sans-serif",
            fontSize: "clamp(13px, 1.3vw, 15px)",
            maxWidth: 640,
          }}
        >
          An innovation approach to Thailand. Made in Thailand. Made for the world.
        </p>

        {/* Map + desktop event cards */}
        <div className="relative w-full max-w-5xl flex justify-center">
          <LiveEventCardsDesktop />
          <ThailandHero />
        </div>

        {/* Mobile ticker */}
        <div className="md:hidden mt-8 w-full">
          <LiveEventCardsMobile />
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <a
            href="https://dmc.riden.me/dmc/register"
            className="inline-flex items-center justify-center rounded-full bg-[#2ee5a0] text-[#05080e] px-6 h-11 text-sm font-medium no-underline hover:bg-[#1D9E75] transition-colors"
          >
            Begin trial ↗
          </a>
          <a
            href="/for-dmcs"
            className="inline-flex items-center justify-center rounded-full border border-white/20 text-white px-6 h-11 text-sm no-underline hover:bg-white/5 transition-colors"
          >
            See the coordination layer
          </a>
        </div>
      </section>
    </div>
  )
}
