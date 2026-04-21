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
import { readLang, getDict } from "@/lib/i18n"

export const metadata: Metadata = {
  title: "Riden — A coordination layer for Thailand",
  description:
    "Every booking. Every driver. Every province. Live. An innovation approach to Thailand. Made in Thailand. Made for the world.",
}

export default async function MarketingHome() {
  const lang = await readLang()
  const d = getDict(lang)

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
            {d.hero.pill}
          </div>

          <h1
            className="font-display text-center italic font-semibold text-white leading-[1.05] mb-5"
            style={{
              fontSize: "clamp(36px, 8vw, 80px)",
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            {d.hero.h1}
            <span className="not-italic text-[#2ee5a0] font-medium ml-1">{d.hero.arrow}</span>
          </h1>

          <p className="text-center text-white/70 mb-3 text-[15px] md:text-[18px] max-w-[640px]">
            {d.hero.sub1}
          </p>
          <p className="text-center text-white/50 mb-10 text-[13px] md:text-[15px] max-w-[640px]">
            {d.hero.sub2}
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
              {d.hero.ctaPrimary} ↗
            </a>
            <Link
              href="/for-dmcs"
              className="inline-flex items-center justify-center rounded-full border border-white/20 text-white px-6 h-11 min-w-[180px] text-sm no-underline hover:bg-white/5 transition-colors"
            >
              {d.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ============ METRIC STRIP ============ */}
      <section className="relative z-10 border-y border-white/5 bg-black/40">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: "77", u: "", label: d.metrics.provinces },
            { v: "2.4", u: "k", label: d.metrics.operators },
            { v: "12.8", u: "k /mo", label: d.metrics.trips },
            { v: "99.2", u: "%", label: d.metrics.ontime },
          ].map((m) => (
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
          {/* Chapter 01 — DMC */}
          <Chapter
            kicker={d.chapters.dmc.kicker}
            titlePlain={d.chapters.dmc.titleStart}
            titleItalic={d.chapters.dmc.titleItalic}
            body={d.chapters.dmc.body}
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

          {/* Chapter 02 — Operator */}
          <Chapter
            kicker={d.chapters.operator.kicker}
            titlePlain={d.chapters.operator.titleStart}
            titleItalic={d.chapters.operator.titleItalic}
            body={d.chapters.operator.body}
            align="right"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 w-full max-w-sm flex flex-col gap-2.5">
              <LineRow
                who="R"
                msg={
                  <>
                    <span className="text-[#2ee5a0] text-[10px]">{d.chapters.operator.lineNew}</span> · BK-2026-101
                    <br />กรุงเทพ → พัทยา · 9 ที่นั่ง
                  </>
                }
              />
              <LineRow who="✓" user msg="ACCEPT ALL · 7 DAYS ✓" out />
              <LineRow
                who="R"
                msg={
                  <>
                    <span className="text-[#2ee5a0] text-[10px]">{d.chapters.operator.lineConfirm}</span> · Somchai กข1234
                    <br />ส่งให้ DMC แล้ว
                  </>
                }
              />
            </div>
          </Chapter>

          {/* Chapter 03 — Driver */}
          <Chapter
            kicker={d.chapters.driver.kicker}
            titlePlain={d.chapters.driver.titleStart}
            titleItalic={d.chapters.driver.titleItalic}
            body={d.chapters.driver.body}
          >
            <div className="w-full max-w-sm">
              {/* Mobile: horizontal swipe carousel. Desktop: 3-col grid. */}
              <div className="flex md:grid md:grid-cols-3 gap-2.5 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
                {["09:03 · BKK", "11:47 · HWY7", "12:15 · PTY"].map((stamp) => (
                  <div
                    key={stamp}
                    className="flex-shrink-0 md:flex-shrink aspect-square w-[70%] md:w-auto snap-center rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-2.5 flex flex-col justify-end"
                  >
                    <div className="font-mono text-[9px] tracking-[0.1em] text-white/60">
                      {stamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Chapter>

          {/* Chapter 04 — Network (centered) */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3">
              {d.chapters.network.kicker}
            </div>
            <h2 className="font-display text-[36px] md:text-[52px] font-semibold leading-[1.05] tracking-[-0.025em] mb-5">
              {d.chapters.network.title1}{" "}
              <span className="italic">{d.chapters.network.titleItalic}</span>
            </h2>
            <p className="text-white/70 text-[16px] md:text-[18px] leading-relaxed">
              {d.chapters.network.body}
            </p>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="relative z-10 bg-[#030509] border-b border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3">
              {d.pricing.kicker}
            </div>
            <h2 className="font-display text-[40px] md:text-[56px] font-semibold leading-none tracking-[-0.03em] mb-4">
              {d.pricing.titleStart} <span className="italic">{d.pricing.titleItalic}</span>
              <span className="text-[#2ee5a0] font-medium ml-1">↗</span>
            </h2>
            <p className="text-white/60 text-[16px] md:text-[18px]">{d.pricing.sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {(["starter", "growth", "pro"] as const).map((key) => {
              const p = d.pricing.plans[key]
              const meta = PLAN_META[key]
              return (
                <div
                  key={key}
                  className={`rounded-2xl p-7 flex flex-col ${
                    meta.featured
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
                    {meta.price}
                    <span className="text-[14px] font-mono text-white/50 ml-1 tracking-normal">
                      {d.pricing.perMo}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-white/50">{p.per}</div>
                  <ul className="mt-6 flex flex-col gap-2.5 list-none p-0 text-[14px] text-white/80">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2 before:content-['✓'] before:text-[#2ee5a0] before:flex-shrink-0"
                      >
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={meta.cta}
                    className={`mt-7 inline-flex items-center justify-center h-11 rounded-lg text-sm font-medium no-underline transition-colors ${
                      meta.featured
                        ? "bg-[#2ee5a0] text-[#05080e] hover:bg-[#1D9E75]"
                        : "border border-white/20 text-white hover:bg-white/5"
                    }`}
                  >
                    {p.cta}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative z-10 bg-[#05080e] border-b border-white/5 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3">
              {d.testimonials.kicker}
            </div>
            <h2 className="font-display text-[32px] md:text-[40px] font-semibold leading-tight tracking-[-0.02em]">
              {d.testimonials.title}
              <span className="text-[#2ee5a0] font-medium ml-1">↗</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {d.testimonials.items.map((t, i) => {
              const meta = TESTIMONIAL_META[i]
              return (
                <div
                  key={meta.name}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-7 flex flex-col"
                >
                  <p className="text-white/85 text-[16px] leading-relaxed font-light mb-6 flex-1">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-white bg-gradient-to-br from-[#2ee5a0] to-[#1D9E75]">
                      {meta.initials}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-[14px]">{meta.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/50">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ PRESS TICKER ============ */}
      <section className="relative z-10 bg-[#030509] border-b border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-white/60 text-[14px]">
          {d.press.featuredIn}:{" "}
          <span className="text-white">Bangkok Post</span> ·{" "}
          <span className="text-white">TTG Asia</span> ·{" "}
          <span className="text-white">Nikkei Asia</span> ·{" "}
          <span className="text-white">e27</span> ·{" "}
          <span className="text-white">Tech in Asia</span>
        </div>
      </section>

      {/* ============ DEMO FORM ============ */}
      <section id="demo" className="relative z-10 bg-[#030509] border-b border-white/5 py-24">
        <div className="max-w-xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[#2ee5a0] mb-3">
              {d.demo.kicker}
            </div>
            <h2 className="font-display text-[32px] md:text-[40px] font-semibold leading-tight tracking-[-0.02em] mb-3">
              {d.demo.titleStart} <span className="italic">{d.demo.titleItalic}</span>
              <span className="text-[#2ee5a0] font-medium ml-1">↗</span>
            </h2>
            <p className="text-white/60 text-[15px]">{d.demo.sub}</p>
          </div>
          <DemoForm kind="demo" />
        </div>
      </section>

      {/* ============ CLOSER ============ */}
      <section className="relative z-10 bg-[#05080e] py-28 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-[48px] md:text-[80px] font-semibold leading-none tracking-[-0.03em] mb-6">
            {d.closer.title1}{" "}
            <span className="italic">
              {d.closer.titleItalic}
              <span className="not-italic text-[#2ee5a0] font-medium ml-1">↗</span>
            </span>
          </h2>
          <p className="text-white/70 text-[16px] md:text-[18px] mb-8">{d.closer.sub}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <a
              href="https://dmc.riden.me/dmc/register"
              className="inline-flex items-center justify-center rounded-full bg-[#2ee5a0] text-[#05080e] px-7 h-12 text-sm font-medium no-underline hover:bg-[#1D9E75] transition-colors"
            >
              {d.closer.ctaPrimary} ↗
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-full border border-white/20 text-white px-7 h-12 text-sm no-underline hover:bg-white/5 transition-colors"
            >
              {d.closer.ctaSecondary}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

const PLAN_META = {
  starter: { price: "฿2,000", cta: "https://dmc.riden.me/dmc/register", featured: false },
  growth:  { price: "฿4,000", cta: "https://dmc.riden.me/dmc/register", featured: true  },
  pro:     { price: "฿6,000", cta: "mailto:hello@riden.me",             featured: false },
} as const

const TESTIMONIAL_META = [
  { initials: "Pc", name: "Pailin Chaiyapan" },
  { initials: "Ns", name: "Nattapong Srisawat" },
  { initials: "Kr", name: "Kanya Rojanathana" },
] as const

function Chapter({
  kicker,
  titlePlain,
  titleItalic,
  body,
  align = "left",
  children,
}: {
  kicker: string
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
          {kicker}
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
