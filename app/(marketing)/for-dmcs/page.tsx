import type { Metadata } from "next"
import { PageHero, Section, SectionTitle, FeatureGrid, CTABlock } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "Riden for DMCs — Coordinate every booking in one portal",
  description: "Built for Thai Destination Management Companies. Portal-native bookings, LINE dispatch, real-time tracking.",
}

export default function ForDmcsPage() {
  return (
    <>
      <PageHero
        eyebrow="FOR DMCS"
        title={<>Built for Thai <span className="italic font-normal">DMCs.</span></>}
        subtitle="One portal replaces 5-20 WhatsApp threads per booking. Dispatch operators on LINE in Thai. Track every trip in real-time. From solo boutique shops to 500-booking-a-month enterprises."
      >
        <div className="flex flex-wrap gap-3">
          <a href="https://dmc.riden.me/dmc/register" className="inline-flex items-center gap-1.5 h-11 px-5 bg-primary text-white text-[14px] font-medium rounded-md hover:bg-primary/90 no-underline">
            Begin trial · 60 days free <span>↗</span>
          </a>
          <a href="/pricing" className="inline-flex items-center gap-1.5 h-11 px-5 border border-white/20 text-white text-[14px] font-medium rounded-md hover:border-primary/60 hover:text-primary no-underline">
            See pricing
          </a>
        </div>
      </PageHero>

      <Section>
        <SectionTitle
          eyebrow="THE DMC STACK"
          title={<>Three features that replace your whole <span className="italic">ops workflow.</span></>}
        />
        <FeatureGrid
          items={[
            {
              icon: "◐",
              title: "Portal-native bookings",
              desc: "12 fields, one form. Booking ID generated in under a second. Multi-day, multi-vehicle, multi-pax — all handled. Export to PDF or share with your customer instantly.",
            },
            {
              icon: "◎",
              title: "LINE dispatch in Thai",
              desc: "Operators accept bookings from their existing LINE chat. Thai Flex Messages with full context. No app to install. No training needed. Accept, split, or send to driver pool.",
            },
            {
              icon: "◉",
              title: "Real-time tracking",
              desc: "Every pickup, transit, and drop auto-stamped with GPS, timestamp, and trip code. Photo-verified. Foreign agents see proof before passengers unbuckle. Zero customer-service fires.",
            },
          ]}
        />
      </Section>

      <Section className="bg-white/[0.02] border-y border-white/5">
        <SectionTitle
          eyebrow="BEFORE vs AFTER"
          title={<>The workflow <span className="italic">transformation.</span></>}
        />
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/10">
                <th className="py-3 px-5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/50 w-[38%]">Step</th>
                <th className="py-3 px-5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/50">Before Riden</th>
                <th className="py-3 px-5 font-mono text-[11px] uppercase tracking-[0.1em] text-primary">With Riden</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Receive booking", "Email, Google Sheet, WhatsApp, back and forth", "One portal form. Booking ID in < 1 second"],
                ["Dispatch to operators", "5-20 WhatsApp threads per booking", "One LINE Flex Message per operator, in Thai"],
                ["Driver assignment", "Phone calls, voice messages", "Operator assigns in LINE, confirms instantly"],
                ["Trip execution", "Text customer for updates", "Auto GPS + photo stamps pushed to all parties"],
                ["Customer proof", "Manually forward photos hours later", "Foreign agent sees proof within minutes"],
                ["Invoicing", "Manual per-trip", "Monthly invoice auto-generated"],
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-b-0">
                  <td className="py-3 px-5 text-white/80 font-medium">{row[0]}</td>
                  <td className="py-3 px-5 text-white/50">{row[1]}</td>
                  <td className="py-3 px-5 text-white">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <SectionTitle
          eyebrow="IN THE PORTAL"
          title={<>Dense by design. <span className="italic">Ops-team-first.</span></>}
        />
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 md:p-8">
          <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-[#0A0C10] to-[#050608] border border-white/5 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(29,158,117,0.15),transparent_60%)]" />
            <div className="relative text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-3">DASHBOARD PREVIEW</div>
              <div className="font-display italic text-[28px] text-white/60">Screenshot placeholder</div>
              <div className="mt-2 text-[13px] text-white/40">Live dashboard mock coming in Phase 3n</div>
            </div>
          </div>
        </div>
      </Section>

      <CTABlock
        title={<>Start your 60-day free <span className="italic">trial.</span></>}
        subtitle="No credit card. Cancel anytime. Full platform access from day one."
        primaryHref="https://dmc.riden.me/dmc/register"
        primaryLabel="Begin trial"
        secondaryHref="/contact"
        secondaryLabel="Book a demo"
      />
    </>
  )
}
