import type { Metadata } from "next"
import Link from "next/link"
import { AmbientStarfield } from "@/components/marketing/hero/AmbientStarfield"
import { SatelliteGlow } from "@/components/marketing/hero/SatelliteGlow"
import { ThailandHero } from "@/components/marketing/hero/ThailandHero"
import {
  LiveEventCardsDesktop,
  LiveEventCardsMobile,
} from "@/components/marketing/hero/LiveEventCards"
import { NasaBar } from "@/components/marketing/hero/NasaBar"
import { DemoForm } from "@/components/marketing/demo-form"

export const metadata: Metadata = {
  title: "Riden — A coordination layer for Thailand",
  description:
    "Every booking. Every driver. Every province. Live. An innovation approach to Thailand. Made in Thailand. Made for the world.",
}

const METRICS = [
  { v: "77", u: "", label: "Provinces" },
  { v: "2.4", u: "k", label: "Operators" },
  { v: "12.8", u: "k /mo", label: "Trips" },
  { v: "99.2", u: "%", label: "On-time" },
]

const PLANS = [
  {
    name: "Starter",
    tag: "For boutique DMCs",
    price: "฿2,000",
    per: "Billed annually",
    features: [
      "Unlimited bookings",
      "5 operator connections",
      "LINE integration · Thai",
      "Real-time GPS tracking",
      "Email support",
    ],
    cta: { label: "Begin trial", href: "https://dmc.riden.me/dmc/register" },
    featured: false,
  },
  {
    name: "Growth",
    tag: "For scaling DMCs",
    price: "฿4,000",
    per: "Billed annually · Save 20%",
    features: [
      "Everything in Starter",
      "Unlimited operators",
      "Driver pool access",
      "Multi-user team logins",
      "Analytics dashboard",
      "Priority LINE support",
    ],
    cta: { label: "Begin trial ↗", href: "https://dmc.riden.me/dmc/register" },
    featured: true,
  },
  {
    name: "Pro",
    tag: "For enterprise DMCs",
    price: "฿6,000",
    per: "Billed annually · SLA included",
    features: [
      "Everything in Growth",
      "White-label DMC portal",
      "Custom booking fields",
      "API access",
      "Dedicated account manager",
      "SLA guarantees",
    ],
    cta: { label: "Contact sales", href: "mailto:hello@riden.me" },
    featured: false,
  },
] as const

const TESTIMONIALS = [
  {
    initials: "Pc",
    name: "Pailin Chaiyapan",
    role: "Head of Ops · Siam Horizon Tours",
    quote:
      "We cut 14 WhatsApp threads per multi-day booking down to one portal view. Our ops team gets their evenings back.",
  },
  {
    initials: "Ns",
    name: "Nattapong Srisawat",
    role: "Founder · Andaman Blue DMC",
    quote:
      "The LINE Flex Message dispatch is the feature I didn't know I needed. My operators accept bookings in 30 seconds.",
  },
  {
    initials: "Kr",
    name: "Kanya Rojanathana",
    role: "MD · Ruen Thai Travel Group",
    quote:
      "Seven days of multi-vehicle coordination, five countries in the booking chain, one dashboard. RIDEN is what ground transport needed.",
  },
]

export default function MarketingHome() {
  return (
    <div className="bg-[#05080e] text-white">
      {/* ============ HERO ============ */}
      <section className="relative min-h-[calc(100vh-4rem)] -mt-16 pt-16 overflow-hidden">
        <AmbientStarfield />
        <SatelliteGlow />
        <NasaBar />

        <div className="relative z-10 flex flex-col items-center justify-start px-4 pt-10 md:pt-16 pb-10 md:pb-16">
          <div
            className="mb-6 md:mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em]"
            style={{
              borderColor: "rgba(46,229,160,0.3)",
              background: "rgba(29,158,117,0.08)",
              color: "rgba(237,230,215,0.85)",
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2ee5a0] motion-safe:animate-pulse" />
            77 PROVINCES · ONE NETWORK · ALWAYS ON
          </div>

          <h1
            className="font-display text-center italic font-semibold text-white leading-[1.05] mb-5"
            style={{
              fontSize: "clamp(36px, 8vw, 80px)",
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            Where Thailand moves at night
            <span className="not-italic text-[#2ee5a0] font-medium ml-1">↗</span>
          </h1>

          <p className="text-center text-white/70 mb-3 text-[15px] md:text-[18px] max-w-[640px]">
            Every booking. Every driver. Every province. Live.
          </p>
          <p className="text-center text-white/50 mb-10 text-[13px] md:text-[15px] max-w-[640px]">
            An innovation approach to Thailand. Made in Thailand. Made for the world.
          </p>

          <div className="relative w-full max-w-5xl flex justify-center">
            <LiveEventCardsDesktop />
            <ThailandHero />
          </div>

          <div className="md:hidden mt-8 w-full">
            <LiveEventCardsMobile />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <a
              href="https://dmc.riden.me/dmc/register"
              className="inline-flex items-center justify-center rounded-full bg-[#2ee5a0] text-[#05080e] px-6 h-11 min-w-[180px] text-sm font-medium no-underline hover:bg-[#1D9E75] transition-colors"
            >
              Begin trial ↗
            </a>
            <Link
              href="/for-dmcs"
              className="inline-flex items-center justify-center rounded-full border border-white/20 text-white px-6 h-11 min-w-[180px] text-sm no-underline hover:bg-white/5 transition-colors"
            >
              See the coordination layer
            </Link>
          </div>
        </div>
      </section>

      {/* ============ METRIC STRIP ============ */}
      <section className="relative z-10 border-y border-white/5 bg-black/40">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center md:text-left">
              <div className="font-display font-bold text-[36px] md:text-[48px] leading-none tracking-[-0.03em] text-white">
                {m.v}
                <span className="text-[#2ee5a0] text-[18px] md:text-[22px] font-medium ml-0.5">
                  {m.u}
                </span>
              </div>
              <div className="mt-2 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white/50">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CHAPTERS ============ */}
      <section className="relative z-10 bg-[#05080e] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col gap-24 md:gap-32">
          <Chapter
            num="01"
            role="The DMC"
            titlePlain="Bookings begin in"
            titleItalic="Bangkok."
            body="A Thai tour company receives a booking from a foreign travel agent. Seven days. Multi-vehicle. Twelve fields — one form. The portal generates the booking ID before the DMC has finished their coffee."
          >
            <div
              className="rounded-xl border p-5 max-w-sm"
              style={{
                background: "rgba(29,158,117,0.06)",
                borderColor: "rgba(46,229,160,0.2)",
              }}
            >
              <div className="font-mono text-[10px] tracking-[0.15em] text-[#2ee5a0] mb-2.5">
                ▸ BK-2026-101
              </div>
              <div className="font-display font-semibold text-[18px] tracking-tight mb-3">
                Bangkok → Pattaya
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Chip color="teal">VAN 9</Chip>
                <Chip>2 ADULTS · 1 CHILD</Chip>
                <Chip>09:00 · 7 DAYS</Chip>
              </div>
            </div>
          </Chapter>

          <Chapter
            num="02"
            role="The Operator"
            titlePlain="Dispatched on"
            titleItalic="LINE. In Thai."
            body="A Thai Flex Message lands in the operator's existing LINE chat. No new app. No training. Accept in full, split by day, or send to the driver pool — all from within LINE."
            align="right"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 w-full max-w-sm flex flex-col gap-2.5">
              <LineRow who="R" msg={<><span className="text-[#2ee5a0] text-[10px]">ใหม่</span> · BK-2026-101<br />กรุงเทพ → พัทยา · 9 ที่นั่ง</>} />
              <LineRow who="✓" user msg="ACCEPT ALL · 7 DAYS ✓" out />
              <LineRow who="R" msg={<><span className="text-[#2ee5a0] text-[10px]">ยืนยัน</span> · Somchai กข1234<br />ส่งให้ DMC แล้ว</>} />
            </div>
          </Chapter>

          <Chapter
            num="03"
            role="The Driver"
            titlePlain="Photographed."
            titleItalic="GPS-stamped."
            body="Pickup → transit → drop. Each moment captured, auto-stamped with latitude, longitude, UTC time, and trip code. The agent in Seoul sees proof before the passenger unbuckles."
          >
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm">
              {[
                "09:03 · BKK",
                "11:47 · HWY7",
                "12:15 · PTY",
              ].map((stamp) => (
                <div
                  key={stamp}
                  className="aspect-square rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-2.5 flex flex-col justify-end"
                >
                  <div className="font-mono text-[9px] tracking-[0.1em] text-white/60">
                    {stamp}
                  </div>
                </div>
              ))}
            </div>
          </Chapter>

          <div className="text-center max-w-2xl mx-auto">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3">
              ● CHAPTER 04 · THE NETWORK
            </div>
            <h2 className="font-display text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-[-0.025em] mb-5">
              Every route.{" "}
              <span className="italic">Every province.</span>
            </h2>
            <p className="text-white/70 text-[16px] md:text-[18px] leading-relaxed">
              From Suvarnabhumi airport transfers to Chiang Rai hill treks, from Phuket island
              hops to Hua Hin weekend escapes — RIDEN coordinates every corner of Thai tourism
              transport, every hour of every day.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="relative z-10 bg-[#030509] border-b border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3">
              ● CHAPTER 05 · PRICING
            </div>
            <h2 className="font-display text-[40px] md:text-[56px] font-semibold leading-none tracking-[-0.03em] mb-4">
              Begin <span className="italic">free</span>
              <span className="text-[#2ee5a0] font-medium ml-1">↗</span>
            </h2>
            <p className="text-white/60 text-[16px] md:text-[18px]">
              Sixty days · No credit card · Cancel anytime
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-7 flex flex-col ${
                  p.featured
                    ? "border-2 border-[#2ee5a0] bg-[rgba(29,158,117,0.08)]"
                    : "border border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase mb-1">
                  {p.name}
                </div>
                <div className="font-display font-semibold text-[22px] tracking-tight leading-tight mb-1.5">
                  {p.tag}
                </div>
                <div className="font-display font-bold text-[40px] tracking-[-0.03em] leading-none mt-4">
                  {p.price}
                  <span className="text-[14px] font-mono text-white/50 ml-1 tracking-normal">
                    /mo
                  </span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-white/50">{p.per}</div>
                <ul className="mt-6 flex flex-col gap-2.5 list-none p-0 text-[14px] text-white/80">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 before:content-['✓'] before:text-[#2ee5a0] before:flex-shrink-0">
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={p.cta.href}
                  className={`mt-7 inline-flex items-center justify-center h-11 rounded-lg text-sm font-medium no-underline transition-colors ${
                    p.featured
                      ? "bg-[#2ee5a0] text-[#05080e] hover:bg-[#1D9E75]"
                      : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {p.cta.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative z-10 bg-[#05080e] border-b border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3">
              ● FROM THE FIELD
            </div>
            <h2 className="font-display text-[32px] md:text-[40px] font-semibold leading-tight tracking-[-0.02em]">
              What Thai DMCs are saying
              <span className="text-[#2ee5a0] font-medium ml-1">↗</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-7 flex flex-col"
              >
                <p className="text-white/85 text-[16px] leading-relaxed font-light mb-6 flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-white bg-gradient-to-br from-[#2ee5a0] to-[#1D9E75]">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[14px]">{t.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/50">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRESS TICKER ============ */}
      <section className="relative z-10 bg-[#030509] border-b border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-white/60 text-[14px]">
          Featured in:{" "}
          <span className="text-white">Bangkok Post</span> ·{" "}
          <span className="text-white">TTG Asia</span> ·{" "}
          <span className="text-white">Nikkei Asia</span> ·{" "}
          <span className="text-white">e27</span> ·{" "}
          <span className="text-white">Tech in Asia</span>
        </div>
      </section>

      {/* ============ DEMO FORM ============ */}
      <section
        id="demo"
        className="relative z-10 bg-[#030509] border-b border-white/5 py-24"
      >
        <div className="max-w-xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3">
              ● REQUEST A DEMO
            </div>
            <h2 className="font-display text-[32px] md:text-[40px] font-semibold leading-tight tracking-[-0.02em] mb-3">
              See RIDEN in <span className="italic">action</span>
              <span className="text-[#2ee5a0] font-medium ml-1">↗</span>
            </h2>
            <p className="text-white/60 text-[15px]">
              30-minute walkthrough. Portal, LINE flow, driver app. In Thai or English.
            </p>
          </div>
          <DemoForm kind="demo" />
        </div>
      </section>

      {/* ============ CLOSER ============ */}
      <section className="relative z-10 bg-[#05080e] py-28 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-[48px] md:text-[80px] font-semibold leading-none tracking-[-0.03em] mb-6">
            Coordinate{" "}
            <span className="italic">
              Thailand
              <span className="not-italic text-[#2ee5a0] font-medium ml-1">↗</span>
            </span>
          </h2>
          <p className="text-white/70 text-[16px] md:text-[18px] mb-8">
            60-day free trial. No credit card. No setup fee. Full platform access from day one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <a
              href="https://dmc.riden.me/dmc/register"
              className="inline-flex items-center justify-center rounded-full bg-[#2ee5a0] text-[#05080e] px-7 h-12 text-sm font-medium no-underline hover:bg-[#1D9E75] transition-colors"
            >
              Begin trial · Free 60 days ↗
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-full border border-white/20 text-white px-7 h-12 text-sm no-underline hover:bg-white/5 transition-colors"
            >
              Book a demo
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function Chapter({
  num,
  role,
  titlePlain,
  titleItalic,
  body,
  align = "left",
  children,
}: {
  num: string
  role: string
  titlePlain: string
  titleItalic: string
  body: string
  align?: "left" | "right"
  children: React.ReactNode
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${
        align === "right" ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2ee5a0]" />
          CHAPTER {num} · {role.toUpperCase()}
        </div>
        <h2 className="font-display text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-[-0.025em] mb-5">
          {titlePlain} <span className="italic">{titleItalic}</span>
        </h2>
        <p className="text-white/70 text-[16px] md:text-[18px] leading-relaxed max-w-prose">
          {body}
        </p>
      </div>
      <div className="flex justify-center md:justify-start">{children}</div>
    </div>
  )
}

function Chip({ children, color }: { children: React.ReactNode; color?: "teal" }) {
  return (
    <span
      className={`font-mono text-[9px] px-2 py-1 rounded-sm ${
        color === "teal"
          ? "bg-[rgba(29,158,117,0.18)] text-[#2ee5a0]"
          : "bg-white/5 text-white/60"
      }`}
    >
      {children}
    </span>
  )
}

function LineRow({
  who,
  msg,
  out,
  user,
}: {
  who: string
  msg: React.ReactNode
  out?: boolean
  user?: boolean
}) {
  return (
    <div className={`flex items-end gap-2 ${out ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-display font-bold flex-shrink-0 ${
          user ? "bg-[#2ee5a0] text-[#05080e]" : "bg-white/10 text-white/80"
        }`}
      >
        {who}
      </div>
      <div
        className={`rounded-xl px-3 py-2 text-[12px] max-w-[75%] ${
          out
            ? "bg-[#2ee5a0] text-[#05080e] font-mono tracking-wider"
            : "bg-white/5 text-white/85"
        }`}
      >
        {msg}
      </div>
    </div>
  )
}
