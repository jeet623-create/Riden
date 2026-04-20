import * as React from "react"

export function PageHero({
  eyebrow, title, subtitle, children,
}: {
  eyebrow: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="pt-24 pb-16 px-6 lg:px-10 border-b border-white/5 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(29,158,117,0.18),transparent_60%)]" />
      <div className="max-w-5xl mx-auto relative">
        <div className="font-mono text-[11px] tracking-[0.2em] text-primary mb-4">● {eyebrow}</div>
        <h1 className="font-display font-semibold tracking-[-0.02em] leading-[1.02] text-[44px] md:text-[64px]">
          {title}
        </h1>
        {subtitle && <p className="mt-6 text-[18px] text-white/70 max-w-2xl leading-relaxed">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}

export function Section({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={`py-20 px-6 lg:px-10 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  )
}

export function SectionTitle({
  eyebrow, title, subtitle, align = "left",
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: "left" | "center"
}) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-2xl"}`}>
      {eyebrow && <div className="font-mono text-[11px] tracking-[0.2em] text-primary mb-3">● {eyebrow}</div>}
      <h2 className="font-display font-semibold tracking-[-0.02em] leading-[1.08] text-[32px] md:text-[40px]">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-[16px] md:text-[17px] text-white/70 leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export function FeatureGrid({
  items,
}: {
  items: { icon?: React.ReactNode; title: string; desc: string }[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((it, i) => (
        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          {it.icon && <div className="text-primary mb-4 text-[28px]">{it.icon}</div>}
          <h3 className="font-display font-semibold text-[20px] tracking-tight mb-2">{it.title}</h3>
          <p className="text-[14px] text-white/70 leading-relaxed">{it.desc}</p>
        </div>
      ))}
    </div>
  )
}

export function CTABlock({
  title, subtitle, primaryHref, primaryLabel, secondaryHref, secondaryLabel,
}: {
  title: React.ReactNode
  subtitle?: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <section className="py-24 px-6 lg:px-10 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display font-semibold tracking-[-0.02em] leading-[1.05] text-[36px] md:text-[48px]">
          {title}
        </h2>
        {subtitle && <p className="mt-5 text-[17px] text-white/70">{subtitle}</p>}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a href={primaryHref} className="inline-flex items-center gap-1.5 h-11 px-5 bg-primary text-white text-[14px] font-medium rounded-md hover:bg-primary/90 transition-colors no-underline">
            {primaryLabel} <span>↗</span>
          </a>
          {secondaryHref && secondaryLabel && (
            <a href={secondaryHref} className="inline-flex items-center gap-1.5 h-11 px-5 border border-white/20 text-white text-[14px] font-medium rounded-md hover:border-primary/60 hover:text-primary transition-colors no-underline">
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

export function Quote({
  text, author, role,
}: { text: string; author: string; role: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-7">
      <p className="text-[16px] text-white leading-relaxed font-light mb-5">"{text}"</p>
      <div className="text-[13px]">
        <div className="font-display font-semibold">{author}</div>
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">{role}</div>
      </div>
    </div>
  )
}

export function StatCallout({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((it, i) => (
        <div key={i} className="text-center md:text-left">
          <div className="font-display font-semibold text-[44px] md:text-[56px] tracking-[-0.02em] leading-none text-primary">{it.value}</div>
          <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/50">{it.label}</div>
        </div>
      ))}
    </div>
  )
}
