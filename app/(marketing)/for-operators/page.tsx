import type { Metadata } from "next"
import { PageHero, Section, SectionTitle, FeatureGrid, CTABlock } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "Riden for Operators — Stay in LINE. Get more bookings.",
  description: "For Thai transport operators. Accept bookings from LINE. No app to download. Paid per trip.",
}

export default function ForOperatorsPage() {
  return (
    <>
      <PageHero
        eyebrow="FOR OPERATORS"
        title={<>Stay in <span className="italic">LINE.</span><br/>Get more bookings.</>}
        subtitle="Thai DMCs dispatch trips directly to your existing LINE chat. No app to install. No training. No subscription fees. You accept or decline — simple as that."
      >
        <div className="flex flex-wrap gap-3">
          <a href="https://line.me/R/ti/p/@ridenth" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 h-11 px-5 bg-[#06C755] text-white text-[14px] font-medium rounded-md hover:bg-[#06C755]/90 no-underline">
            Add on LINE <span>↗</span>
          </a>
          <a href="/pricing" className="inline-flex items-center gap-1.5 h-11 px-5 border border-white/20 text-white text-[14px] font-medium rounded-md hover:border-primary/60 hover:text-primary no-underline">
            How it works
          </a>
        </div>
      </PageHero>

      <Section>
        <SectionTitle
          eyebrow="WHY OPERATORS CHOOSE RIDEN"
          title={<>Built around how Thai operators <span className="italic">actually work.</span></>}
        />
        <FeatureGrid
          items={[
            { icon: "◐", title: "No app to download", desc: "If you already use LINE, you already have Riden. We meet you where you are — no installs, no logins, no friction." },
            { icon: "◎", title: "Thai language, first-class", desc: "Every Flex Message, every prompt, every notification — native Thai. Built by people who work with Thai operators every day." },
            { icon: "◉", title: "Paid per trip, no subscription", desc: "You pay nothing to be on Riden. DMCs pay for the portal. You just accept trips and get paid on completion." },
          ]}
        />
      </Section>

      <Section className="bg-white/[0.02] border-y border-white/5">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <SectionTitle
              eyebrow="THE LINE FLOW"
              title={<>A booking arrives like a <span className="italic">normal message.</span></>}
              subtitle="Flex Message format with accept / split / pool buttons. Tap Accept, the DMC sees confirmation in their portal. Tap Send to Pool, drivers bid directly."
            />
          </div>
          <div className="bg-[#0E1014] border border-white/10 rounded-xl p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold">R</div>
                <div className="bg-white/[0.06] rounded-lg rounded-tl-none px-4 py-3 text-[13px] max-w-[320px]">
                  <span className="text-[10px] text-primary font-mono">ใหม่</span> · BK-2026-101<br/>
                  กรุงเทพ → พัทยา · 9 ที่นั่ง · 09:00
                </div>
              </div>
              <div className="flex items-start gap-2 justify-end">
                <div className="bg-primary text-white rounded-lg rounded-tr-none px-4 py-3 text-[13px]">ACCEPT ALL · 7 DAYS ✓</div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[11px]">✓</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold">R</div>
                <div className="bg-white/[0.06] rounded-lg rounded-tl-none px-4 py-3 text-[13px] max-w-[320px]">
                  <span className="text-[10px] text-primary font-mono">ยืนยัน</span> · DMC notified. Trip scheduled.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-2xl p-10 text-center">
          <div className="font-mono text-[11px] tracking-[0.2em] text-primary mb-3">● FOREVER FREE FOR OPERATORS</div>
          <h2 className="font-display font-semibold text-[36px] tracking-[-0.02em] leading-tight">
            Operators never pay Riden. <span className="italic block md:inline">Ever.</span>
          </h2>
          <p className="mt-5 text-[16px] text-white/70 max-w-xl mx-auto">
            Our revenue comes from DMC subscriptions. As an operator, you get unlimited access to booking opportunities — and you only get paid when you complete a trip.
          </p>
        </div>
      </Section>

      <CTABlock
        title={<>Join <span className="italic">2,400+</span> operators already on Riden.</>}
        subtitle="Add our LINE OA, share a verification photo, and you're in."
        primaryHref="https://line.me/R/ti/p/@ridenth"
        primaryLabel="Add on LINE"
        secondaryHref="/contact"
        secondaryLabel="Talk to sales"
      />
    </>
  )
}
