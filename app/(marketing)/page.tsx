import type { Metadata } from "next"
import Link from "next/link"
import { AmbientStarfield } from "@/components/marketing/hero/AmbientStarfield"
import { SatelliteGlow } from "@/components/marketing/hero/SatelliteGlow"
import { ThailandHero } from "@/components/marketing/hero/ThailandHero"
import { LiveEventCards } from "@/components/marketing/hero/LiveEventCards"
import { DemoForm } from "@/components/marketing/demo-form"
import { Reveal } from "@/components/marketing/Reveal"
import { PlacesMarquee } from "@/components/marketing/PlacesMarquee"
import { readLang, getDict } from "@/lib/i18n"

export const metadata: Metadata = {
  title: "Riden — The coordination layer for Thai tourism",
  description:
    "Every booking. Every driver. Every province. Live. Built in Thailand, for the world.",
}

export default async function MarketingHome() {
  const lang = await readLang()
  const d = getDict(lang)

  return (
    <div className="bg-[#05080e] text-white">
      {/* ============ HERO ============ */}
      <section className="relative -mt-16 pt-16 overflow-hidden bg-[#020308]">
        <AmbientStarfield />
        <SatelliteGlow />

        {/* Soft top-and-bottom vignette for cinematic framing */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, transparent 35%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-10 md:pt-16 pb-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 xl:gap-24 items-center">
            {/* ─── LEFT: Content column ─── */}
            <div className="flex flex-col items-start">
              <Reveal immediate delay={0.05}>
                <div
                  className="mb-7 inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.22em]"
                  style={{
                    borderColor: "rgba(46,229,160,0.25)",
                    background: "rgba(29,158,117,0.05)",
                    color: "rgba(237,230,215,0.8)",
                  }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2ee5a0] motion-safe:animate-pulse" />
                  {d.hero.pill}
                </div>
              </Reveal>

              <Reveal immediate delay={0.15} y={28}>
                <h1
                  className="font-display font-semibold text-white mb-6"
                  style={{
                    fontSize: "clamp(40px, 6.2vw, 76px)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.035em",
                  }}
                >
                  {d.hero.titleLine1}
                  <br />
                  {d.hero.titleLine2Pre}{" "}
                  <em className="text-[#2ee5a0] font-medium italic">{d.hero.titleEmphasis}</em>
                  <span className="not-italic text-[#2ee5a0] font-medium ml-1.5">{d.hero.arrow}</span>
                </h1>
              </Reveal>

              <Reveal immediate delay={0.3}>
                <p className="text-white/70 text-[17px] md:text-[19px] font-light leading-[1.55] mb-10 max-w-[520px]">
                  {d.hero.sub1}
                </p>
              </Reveal>

              <Reveal immediate delay={0.42}>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-10">
                  <a
                    href="https://dmc.riden.me/dmc/register"
                    className="inline-flex items-center justify-center rounded-full bg-[#2ee5a0] text-[#05080e] px-7 h-12 min-w-[180px] text-[14px] font-medium no-underline hover:bg-white transition-colors"
                  >
                    {d.hero.ctaPrimary} ↗
                  </a>
                  <Link
                    href="/for-dmcs"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 text-white px-7 h-12 min-w-[180px] text-[14px] no-underline hover:bg-white/5 hover:border-white/30 transition-colors"
                  >
                    {d.hero.ctaSecondary}
                  </Link>
                </div>
              </Reveal>

              <Reveal immediate delay={0.55}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/5 w-full max-w-[520px]">
                  {[
                    { v: "77", l: "PROVINCES" },
                    { v: "7", l: "LANGUAGES" },
                    { v: "60d", l: "FREE TRIAL" },
                  ].map((s) => (
                    <div key={s.l} className="flex items-baseline gap-2">
                      <span className="font-display font-semibold text-white text-[18px] tracking-[-0.02em]">
                        {s.v}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                        {s.l}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
                  {d.hero.sub2}
                </p>
              </Reveal>
            </div>

            {/* ─── RIGHT: Thailand map visual ─── */}
            <Reveal immediate delay={0.35} y={18}>
              <div className="relative w-full flex justify-center lg:justify-end">
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 55% at 55% 45%, rgba(46,229,160,0.22), transparent 70%)",
                    filter: "blur(28px)",
                  }}
                />
                <div className="relative w-full max-w-[340px] lg:max-w-[380px]">
                  <LiveEventCards />
                  <ThailandHero />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ METRIC STRIP ============ */}
      <section className="relative z-10 border-y border-white/5 bg-black/40">
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {[
            { v: "77", u: "", label: "PROVINCES COVERED" },
            { v: "7", u: "", label: "LANGUAGES" },
            { v: "24/7", u: "", label: "LINE COORDINATION" },
            { v: "60", u: "d", label: "FREE TRIAL" },
          ].map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08}>
              <div className="text-center md:text-left">
                <div className="font-display font-semibold text-[48px] md:text-[64px] leading-none tracking-[-0.04em] text-white">
                  {m.v}
                  <span className="text-[#2ee5a0] text-[20px] md:text-[24px] font-medium ml-0.5 tracking-normal">
                    {m.u}
                  </span>
                </div>
                <div className="mt-3 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-white/45">
                  {m.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ WHY NOW (INVESTOR SECTION) ============ */}
      <section className="relative z-10 bg-[#05080e] border-b border-white/5 overflow-hidden">
        {/* Ambient cinematic backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(46,229,160,0.08), transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-36">
          <Reveal>
            <div className="max-w-3xl mb-16 md:mb-20">
              <div className="font-mono text-[11px] tracking-[0.22em] text-[#2ee5a0] mb-4">
                {d.whyNow.kicker}
              </div>
              <h2 className="font-display text-[40px] md:text-[64px] font-semibold leading-[1.05] tracking-[-0.03em] mb-6">
                {d.whyNow.title1}{" "}
                <span className="italic text-white/75">{d.whyNow.titleItalic}</span>
              </h2>
              <p className="text-white/60 text-[16px] md:text-[19px] leading-[1.55] max-w-[620px] font-light">
                {d.whyNow.sub}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {d.whyNow.cards.map((c, i) => (
              <Reveal key={c.tag} delay={i * 0.12}>
                <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.015] p-7 md:p-8 overflow-hidden transition-colors hover:border-[#2ee5a0]/30 hover:bg-white/[0.03] h-full">
                  <div
                    className="absolute top-0 left-0 h-px w-16 bg-gradient-to-r from-[#2ee5a0] to-transparent opacity-40 group-hover:opacity-80 group-hover:w-24 transition-all"
                    aria-hidden
                  />
                  <div className="font-mono text-[10px] tracking-[0.22em] text-[#2ee5a0] mb-5">
                    {String(i + 1).padStart(2, "0")} · {c.tag}
                  </div>
                  <div className="font-display font-semibold text-[28px] md:text-[32px] leading-[1.05] tracking-[-0.025em] mb-4">
                    {c.headline}
                  </div>
                  <p className="text-white/60 text-[14px] md:text-[15px] leading-[1.6] font-light">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CHAPTERS ============ */}
      <section className="relative z-10 bg-[#05080e] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col gap-28 md:gap-36">
          <Chapter
            kicker={d.chapters.dmc.kicker}
            titlePlain={d.chapters.dmc.titleStart}
            titleItalic={d.chapters.dmc.titleItalic}
            body={d.chapters.dmc.body}
          >
            <div
              className="rounded-2xl border p-5 max-w-sm"
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
            kicker={d.chapters.operator.kicker}
            titlePlain={d.chapters.operator.titleStart}
            titleItalic={d.chapters.operator.titleItalic}
            body={d.chapters.operator.body}
            align="right"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 w-full max-w-sm flex flex-col gap-2.5">
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

          <Chapter
            kicker={d.chapters.driver.kicker}
            titlePlain={d.chapters.driver.titleStart}
            titleItalic={d.chapters.driver.titleItalic}
            body={d.chapters.driver.body}
          >
            <div className="w-full max-w-sm">
              <div className="flex md:grid md:grid-cols-3 gap-2.5 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
                {[
                  {
                    stamp: "09:03 · BKK",
                    src: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80",
                    alt: "Bangkok pickup",
                  },
                  {
                    stamp: "11:47 · HWY7",
                    src: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80",
                    alt: "Thai highway in transit",
                  },
                  {
                    stamp: "12:15 · PTY",
                    src: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80",
                    alt: "Pattaya drop-off",
                  },
                ].map((card) => (
                  <div
                    key={card.stamp}
                    className="relative flex-shrink-0 md:flex-shrink aspect-square w-[70%] md:w-auto snap-center overflow-hidden rounded-xl border border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.src}
                      alt={card.alt}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
                    />
                    {/* Vignette + GPS-stamp overlay */}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30"
                    />
                    {/* Crosshair tick marks — feels like an ops camera grab */}
                    <div
                      aria-hidden
                      className="absolute left-2 top-2 h-3 w-3 border-l border-t border-[#2ee5a0]/80"
                    />
                    <div
                      aria-hidden
                      className="absolute right-2 top-2 h-3 w-3 border-r border-t border-[#2ee5a0]/80"
                    />
                    <div
                      aria-hidden
                      className="absolute left-2 bottom-2 h-3 w-3 border-l border-b border-[#2ee5a0]/80"
                    />
                    <div
                      aria-hidden
                      className="absolute right-2 bottom-2 h-3 w-3 border-r border-b border-[#2ee5a0]/80"
                    />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between font-mono text-[9px] tracking-[0.12em] text-white/85">
                      <span>{card.stamp}</span>
                      <span className="text-[#2ee5a0]">●</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Chapter>

          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <div className="font-mono text-[11px] tracking-[0.22em] text-[#2ee5a0] mb-3">
                {d.chapters.network.kicker}
              </div>
              <h2 className="font-display text-[36px] md:text-[56px] font-semibold leading-[1.05] tracking-[-0.03em] mb-6">
                {d.chapters.network.title1}{" "}
                <span className="italic">{d.chapters.network.titleItalic}</span>
              </h2>
              <p className="text-white/65 text-[16px] md:text-[18px] leading-[1.6] font-light">
                {d.chapters.network.body}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="relative z-10 bg-[#030509] border-b border-white/5 py-28 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16 md:mb-20">
              <div className="font-mono text-[11px] tracking-[0.22em] text-[#2ee5a0] mb-4">
                {d.pricing.kicker}
              </div>
              <h2 className="font-display text-[44px] md:text-[68px] font-semibold leading-none tracking-[-0.035em] mb-5">
                {d.pricing.titleStart} <span className="italic">{d.pricing.titleItalic}</span>
                <span className="text-[#2ee5a0] font-medium ml-1">↗</span>
              </h2>
              <p className="text-white/55 text-[15px] md:text-[17px] font-light">{d.pricing.sub}</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {(["starter", "growth", "pro"] as const).map((key, idx) => {
              const p = d.pricing.plans[key]
              const meta = PLAN_META[key]
              return (
                <Reveal key={key} delay={idx * 0.1}>
                <div
                  className={`relative rounded-2xl p-8 flex flex-col h-full transition-transform ${
                    meta.featured
                      ? "border border-[#2ee5a0]/50 bg-gradient-to-b from-[rgba(29,158,117,0.10)] to-[rgba(29,158,117,0.02)] md:-translate-y-2"
                      : "border border-white/[0.08] bg-white/[0.015] hover:border-white/20"
                  }`}
                >
                  {meta.featured && (
                    <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#2ee5a0] to-transparent" />
                  )}
                  {meta.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#2ee5a0] text-[#05080e] font-mono text-[9px] tracking-[0.18em] uppercase">
                      Most chosen
                    </div>
                  )}
                  <div className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase mb-1.5">
                    {p.name}
                  </div>
                  <div className="font-display font-semibold text-[20px] tracking-[-0.01em] leading-snug mb-6 text-white/90">
                    {p.tag}
                  </div>
                  <div className="font-display font-semibold text-[52px] tracking-[-0.035em] leading-none">
                    {meta.price}
                    <span className="text-[14px] font-mono text-white/45 ml-1.5 tracking-normal">
                      {d.pricing.perMo}
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-[11px] tracking-[0.1em] text-white/45">{p.per}</div>
                  <ul className="mt-8 flex flex-col gap-2.5 list-none p-0 text-[14px] text-white/75 font-light">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2.5 before:content-['✓'] before:text-[#2ee5a0] before:flex-shrink-0"
                      >
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={meta.cta}
                    className={`mt-9 inline-flex items-center justify-center h-12 rounded-full text-[13px] font-medium no-underline transition-colors ${
                      meta.featured
                        ? "bg-[#2ee5a0] text-[#05080e] hover:bg-white"
                        : "border border-white/20 text-white hover:bg-white/5 hover:border-white/40"
                    }`}
                  >
                    {p.cta}
                  </a>
                </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative z-10 bg-[#05080e] border-b border-white/5 py-28">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14 md:mb-16">
              <div className="font-mono text-[11px] tracking-[0.22em] text-[#2ee5a0] mb-3">
                {d.testimonials.kicker}
              </div>
              <h2 className="font-display text-[34px] md:text-[48px] font-semibold leading-tight tracking-[-0.025em]">
                {d.testimonials.title}
                <span className="text-[#2ee5a0] font-medium ml-1.5">↗</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {d.testimonials.items.map((t, i) => {
              const meta = TESTIMONIAL_META[i]
              return (
                <Reveal key={meta.name} delay={i * 0.1}>
                <figure
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 flex flex-col h-full"
                >
                  <blockquote className="text-white/85 text-[17px] leading-[1.6] font-light mb-7 flex-1 italic">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-[#05080e] bg-gradient-to-br from-white to-[#2ee5a0]">
                      {meta.initials}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-[14px]">{meta.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50 mt-0.5">
                        {t.role}
                      </div>
                    </div>
                  </figcaption>
                </figure>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ PLACES MARQUEE — cinematic Thailand reel ============ */}
      <PlacesMarquee />

      {/* ============ DEMO FORM ============ */}
      <section id="demo" className="relative z-10 bg-[#030509] border-b border-white/5 py-28">
        <div className="max-w-xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <div className="font-mono text-[11px] tracking-[0.22em] text-[#2ee5a0] mb-3">
                {d.demo.kicker}
              </div>
              <h2 className="font-display text-[34px] md:text-[48px] font-semibold leading-tight tracking-[-0.025em] mb-4">
                {d.demo.titleStart} <span className="italic">{d.demo.titleItalic}</span>
                <span className="text-[#2ee5a0] font-medium ml-1.5">↗</span>
              </h2>
              <p className="text-white/55 text-[15px] font-light">{d.demo.sub}</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <DemoForm kind="demo" />
          </Reveal>
        </div>
      </section>

      {/* ============ CLOSER ============ */}
      <section className="relative z-10 bg-[#05080e] py-32 md:py-40 text-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(46,229,160,0.12), transparent 70%)",
          }}
        />
        <Reveal>
        <div className="relative max-w-4xl mx-auto px-6">
          <h2
            className="font-display font-semibold leading-[0.95] tracking-[-0.04em] mb-8"
            style={{ fontSize: "clamp(56px, 11vw, 128px)" }}
          >
            {d.closer.title1}{" "}
            <span className="italic">
              {d.closer.titleItalic}
              <span className="not-italic text-[#2ee5a0] font-medium ml-1.5">↗</span>
            </span>
          </h2>
          <p className="text-white/65 text-[17px] md:text-[19px] mb-10 font-light max-w-xl mx-auto leading-[1.55]">
            {d.closer.sub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <a
              href="https://dmc.riden.me/dmc/register"
              className="inline-flex items-center justify-center rounded-full bg-[#2ee5a0] text-[#05080e] px-8 h-12 text-[14px] font-medium no-underline hover:bg-white transition-colors"
            >
              {d.closer.ctaPrimary} ↗
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-full border border-white/20 text-white px-8 h-12 text-[14px] no-underline hover:bg-white/5 hover:border-white/40 transition-colors"
            >
              {d.closer.ctaSecondary}
            </a>
          </div>
        </div>
        </Reveal>
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
      <Reveal>
        <div className="font-mono text-[11px] tracking-[0.22em] text-[#2ee5a0] mb-4 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2ee5a0]" />
          {kicker}
        </div>
        <h2 className="font-display text-[38px] md:text-[56px] font-semibold leading-[1.05] tracking-[-0.03em] mb-6">
          {titlePlain} <span className="italic">{titleItalic}</span>
        </h2>
        <p className="text-white/65 text-[16px] md:text-[18px] leading-[1.6] max-w-prose font-light">
          {body}
        </p>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="flex justify-center md:justify-start">{children}</div>
      </Reveal>
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
