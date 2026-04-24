import type { Metadata } from "next"
import { Wordmark } from "@/components/brand/Wordmark"
import { Nav } from "@/components/marketing/v2/Nav"
import { Footer } from "@/components/marketing/v2/Footer"
import { DotGrid } from "@/components/marketing/v2/DotGrid"
import { GrainOverlay } from "@/components/marketing/v2/GrainOverlay"
import { CustomCursor } from "@/components/marketing/v2/CustomCursor"
import { MagneticButton } from "@/components/marketing/v2/MagneticButton"

// Step 2 of 43.md — brand foundation showcase.
// One page with Nav / Hero placeholder / Footer using every new primitive.
// The real cinematic hero + 3D canvas lands in Step 3.

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Brand foundation — v2",
  description:
    "Step 2 preview: nav, footer, dot grid, grain overlay, custom cursor, magnetic button.",
}

export default function V2Page() {
  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#f3f1ea]">
      <GrainOverlay />
      <CustomCursor />

      <Nav />

      {/* Hero placeholder. Real hero (R3F particle field + scroll indicator
          + split-text reveal + tagline in mono) ships in Step 3. */}
      <section className="relative min-h-[calc(100vh-56px)] overflow-hidden">
        <DotGrid />

        <div className="relative z-[2] mx-auto flex min-h-[calc(100vh-56px)] max-w-[1280px] flex-col justify-center px-6 py-20">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]">
            DIRECTION 09 · STEP 02 / 17
          </p>

          <div className="mt-8">
            <Wordmark size="xl" className="text-[#f3f1ea]" />
          </div>

          <p className="mt-6 max-w-2xl font-display italic text-2xl leading-tight text-[#9a9ca3] sm:text-3xl">
            Coordinates Thailand&apos;s inbound tourism transport.
          </p>

          <p className="mt-3 font-mono text-[11px] tracking-[0.22em] text-[#5a5d65]">
            WHERE GEARS MEET GREEN.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <MagneticButton href="/contact" variant="primary">
              Book a demo ↗
            </MagneticButton>
            <MagneticButton href="#primitives" variant="ghost">
              See the foundation
            </MagneticButton>
          </div>

          <div className="mt-24 flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
            <span>SCROLL</span>
            <div className="h-8 w-px bg-gradient-to-b from-[#5a5d65] to-transparent" />
          </div>
        </div>
      </section>

      {/* Primitives inventory — so you can see exactly what Step 2 delivered */}
      <section
        id="primitives"
        className="relative border-t border-[#23262e] bg-[#111318]"
      >
        <DotGrid />
        <div className="relative z-[2] mx-auto max-w-[1280px] px-6 py-20">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]">
            STEP 02 / 17 · BRAND FOUNDATION
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.01em] text-[#f3f1ea] sm:text-5xl">
            Every primitive the site will lean on.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <PrimitiveCard
              label="01 WORDMARK"
              title="Syne Bold + teal ↗"
              body="Logo and arrow are one unit. Never show one without the other. Five sizes tuned against the source SVG."
            >
              <div className="flex flex-col items-start gap-4">
                <Wordmark size="xs" />
                <Wordmark size="sm" />
                <Wordmark size="md" />
                <Wordmark size="lg" />
              </div>
            </PrimitiveCard>

            <PrimitiveCard
              label="02 TYPOGRAPHY"
              title="Three faces, one role each"
              body="Syne for wordmark + display. Inter Tight for body. JetBrains Mono for labels + metadata."
            >
              <div className="space-y-3">
                <p className="font-display text-4xl font-bold tracking-tight text-[#f3f1ea]">
                  Syne 700
                </p>
                <p className="text-base text-[#f3f1ea]">
                  Inter Tight — the body face.
                </p>
                <p className="font-mono text-[11px] tracking-[0.22em] text-[#9a9ca3]">
                  JETBRAINS MONO · 0.22EM
                </p>
                <p className="font-thai text-lg text-[#f3f1ea]">
                  ไรเดน คือการประสานงาน
                </p>
              </div>
            </PrimitiveCard>

            <PrimitiveCard
              label="03 COLOR"
              title="Ink, sand, teal. That&apos;s it."
              body="60% ink / 25% neutral / 10% teal / 5% sand. Line green only on LINE-connect UI."
            >
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
            </PrimitiveCard>

            <PrimitiveCard
              label="04 MAGNETIC BUTTON"
              title="Primary + ghost"
              body="The button tracks your cursor when it&apos;s inside the bounding box. Falls off at the edges. Disabled on reduced-motion."
            >
              <div className="flex flex-wrap gap-3">
                <MagneticButton variant="primary">Book a demo ↗</MagneticButton>
                <MagneticButton variant="ghost">See how it works</MagneticButton>
              </div>
            </PrimitiveCard>

            <PrimitiveCard
              label="05 DOT GRID"
              title="28px × 1px, 4% alpha"
              body="Non-interactive background texture. Absolute-positioned in any section container to keep the studio rhythm."
            >
              <div className="relative h-32 rounded-sm border border-[#23262e] bg-[#0a0b0e] overflow-hidden">
                <DotGrid />
              </div>
            </PrimitiveCard>

            <PrimitiveCard
              label="06 GRAIN OVERLAY"
              title="SVG noise · 3.5% · fixed"
              body="Sits above the entire page at z-1. Adds the film-grain texture you feel more than you see. Honors reduced-motion (no motion to reduce)."
            >
              <p className="font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
                ACTIVE ON THIS PAGE · LOOK CLOSELY
              </p>
            </PrimitiveCard>

            <PrimitiveCard
              label="07 CUSTOM CURSOR"
              title="8px teal dot + 28px ring"
              body="Only on hover-capable fine-pointer devices (no touch, no reduced-motion). Ring scales on links + morphs into a rounded square on text."
            >
              <div className="space-y-1 font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3]">
                <p>· MOVE YOUR CURSOR HERE</p>
                <p>· HOVER A LINK</p>
                <p>· HOVER RAW TEXT</p>
              </div>
            </PrimitiveCard>

            <PrimitiveCard
              label="08 STEP 3 PREVIEW"
              title="What lands next"
              body="R3F particle field in the hero (~800 teal points, drifting). Giant Syne wordmark with arrow animating in last. JetBrains-Mono tagline. Two magnetic CTAs. Scroll indicator that shrinks."
            >
              <MagneticButton variant="ghost">Ready when you are</MagneticButton>
            </PrimitiveCard>
          </div>

          <p className="mt-14 font-display italic text-lg text-[#9a9ca3] sm:text-xl">
            Step 02 of 17 complete. Home page untouched — visit{" "}
            <a href="/" className="text-[#1D9E75] underline">
              riden.me
            </a>
            {" "}to verify.
          </p>
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
