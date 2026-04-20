import type { Metadata } from "next"
import { PageHero, Section, SectionTitle, CTABlock } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "Riden — Pricing",
  description: "Simple, transparent pricing for Thai DMCs. Starter ฿2k / Growth ฿4k / Pro ฿6k / Custom. Free for operators and drivers. 60-day free trial.",
}

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For boutique DMCs",
    price: "฿2,000",
    per: "per month · billed annually",
    features: [
      "Unlimited bookings",
      "5 operator connections",
      "LINE integration · Thai",
      "Real-time GPS tracking",
      "Email support",
    ],
    cta: "Begin trial",
    ctaHref: "https://dmc.riden.me/dmc/register",
    featured: false,
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For scaling DMCs",
    price: "฿4,000",
    per: "per month · save 20% annually",
    features: [
      "Everything in Starter",
      "Unlimited operators",
      "Driver pool access",
      "Multi-user team logins",
      "Analytics dashboard",
      "Priority LINE support",
    ],
    cta: "Begin trial ↗",
    ctaHref: "https://dmc.riden.me/dmc/register",
    featured: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For enterprise DMCs",
    price: "฿6,000",
    per: "per month · SLA included",
    features: [
      "Everything in Growth",
      "White-label portal",
      "Custom booking fields",
      "API access",
      "Dedicated account manager",
      "SLA guarantees",
    ],
    cta: "Contact sales",
    ctaHref: "mailto:hello@riden.me",
    featured: false,
  },
]

const FAQS = [
  {
    q: "Is there really a 60-day free trial?",
    a: "Yes. Register with email, use the full platform for 60 days. No credit card required. Convert to paid via bank transfer or stripe.",
  },
  {
    q: "Do operators or drivers pay anything?",
    a: "No. Riden is free forever for operators and drivers. Our revenue comes entirely from DMC subscriptions. Operators get paid per completed trip; drivers per completed leg.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, up or down. Changes take effect at the start of your next billing cycle. If you downgrade mid-cycle, we prorate the difference as credit.",
  },
  {
    q: "What payment methods do you accept?",
    a: "For Thai customers: bank transfer via SCB/Kasikorn/Bangkok Bank, or PromptPay. For international customers on Pro: USD wire or Stripe. Invoices issued monthly.",
  },
  {
    q: "What's included in 'unlimited bookings'?",
    a: "You can create as many bookings as you need per month on any plan. Starter has a 5-operator cap; Growth and Pro have no caps.",
  },
  {
    q: "Is my data safe? PDPA?",
    a: "Yes. We are PDPA-compliant (Thailand's data protection law). Data is stored in Singapore (AWS ap-southeast-1). See our Privacy page for the full data-handling policy.",
  },
]

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="PRICING"
        title={<>Begin <span className="italic">free.</span></>}
        subtitle="Sixty days. No credit card. Cancel anytime. Operators and drivers pay nothing — ever."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(p => (
            <div key={p.id} className={`rounded-2xl p-7 flex flex-col ${p.featured ? "bg-primary/10 border border-primary/40" : "bg-white/[0.03] border border-white/10"}`}>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-2">{p.name}</div>
              <div className="font-display italic text-[18px] text-white/80 mb-4">{p.tagline}</div>
              <div className="font-display font-semibold text-[36px] tracking-[-0.02em]">{p.price}<span className="text-[16px] font-normal text-white/50 ml-1">/mo</span></div>
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/50 mt-1">{p.per}</div>
              <ul className="mt-6 mb-8 space-y-2.5 flex-1">
                {p.features.map(f => (
                  <li key={f} className="text-[14px] text-white/80 flex gap-2.5">
                    <span className="text-primary">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={p.ctaHref} className={`block text-center h-11 leading-[44px] rounded-md text-[14px] font-medium no-underline transition-colors ${p.featured ? "bg-primary text-white hover:bg-primary/90" : "border border-white/15 text-white hover:border-primary/60 hover:text-primary"}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-white/[0.02] border-y border-white/5">
        <SectionTitle
          eyebrow="FREQUENTLY ASKED"
          title={<>Questions, <span className="italic">answered.</span></>}
        />
        <div className="max-w-3xl space-y-2">
          {FAQS.map(f => (
            <details key={f.q} className="bg-white/[0.03] border border-white/10 rounded-lg px-5 py-4 group">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                <span className="font-display font-semibold text-[17px]">{f.q}</span>
                <span className="text-primary text-[18px] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-[14px] text-white/70 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section>
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-2xl p-10 text-center">
          <div className="font-mono text-[11px] tracking-[0.2em] text-primary mb-3">● ENTERPRISE</div>
          <h2 className="font-display font-semibold text-[32px] tracking-[-0.02em] leading-tight">
            Running <span className="italic">more than 500</span> bookings a month?
          </h2>
          <p className="mt-4 text-[15px] text-white/70 max-w-2xl mx-auto">
            We work with ASEAN enterprise DMC networks on white-label deployments, custom API integrations, and regional SLAs. Let's talk.
          </p>
          <a href="mailto:hello@riden.me" className="mt-6 inline-flex items-center gap-1.5 h-11 px-5 bg-primary text-white text-[14px] font-medium rounded-md hover:bg-primary/90 no-underline">
            Email sales <span>↗</span>
          </a>
        </div>
      </Section>

      <CTABlock
        title={<>Ready to <span className="italic">start?</span></>}
        subtitle="60 days free. No credit card."
        primaryHref="https://dmc.riden.me/dmc/register"
        primaryLabel="Begin trial"
        secondaryHref="/contact"
        secondaryLabel="Book a demo"
      />
    </>
  )
}
