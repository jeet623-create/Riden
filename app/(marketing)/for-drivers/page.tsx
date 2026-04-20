import type { Metadata } from "next"
import { PageHero, Section, SectionTitle, FeatureGrid, StatCallout, CTABlock } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "Riden for Drivers — Drive more. Keep more.",
  description: "Transparent bidding, photo-verified trips, simple LINE-native verification for Thai drivers.",
}

export default function ForDriversPage() {
  return (
    <>
      <PageHero
        eyebrow="FOR DRIVERS"
        title={<>Drive more.<br/>Keep <span className="italic">more.</span></>}
        subtitle="Fair bidding on each trip. Photo-verified completion. No app to install. Register in 3 minutes via LINE. Operators assign you. DMCs pay fast."
      >
        <div className="flex flex-wrap gap-3">
          <a href="https://line.me/R/ti/p/@ridenth" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 h-11 px-5 bg-[#06C755] text-white text-[14px] font-medium rounded-md hover:bg-[#06C755]/90 no-underline">
            Join pool on LINE <span>↗</span>
          </a>
        </div>
      </PageHero>

      <Section>
        <SectionTitle
          eyebrow="WHAT DRIVERS GET"
          title={<>Three things that change your <span className="italic">day.</span></>}
        />
        <FeatureGrid
          items={[
            { icon: "◐", title: "Fair bidding system", desc: "Each trip lists its route, vehicle type, timing, and pax. You see what you'd earn before you bid. First acceptable bid wins." },
            { icon: "◎", title: "Transparent earnings", desc: "No opaque surge. No cuts you didn't agree to. Every trip is a known amount. Payouts weekly via bank or PromptPay." },
            { icon: "◉", title: "3-minute verification", desc: "Submit license photo + vehicle photo via LINE. Admin approves in hours, not weeks. Then you're in the pool." },
          ]}
        />
      </Section>

      <Section className="bg-white/[0.02] border-y border-white/5">
        <SectionTitle
          align="center"
          eyebrow="THE NUMBERS"
          title={<>Already one of Thailand's largest <span className="italic">verified driver pools.</span></>}
        />
        <StatCallout
          items={[
            { label: "VERIFIED DRIVERS", value: "2,400+" },
            { label: "TRIPS PER MONTH", value: "12.8k" },
            { label: "AVG TRIP VALUE", value: "฿3.2k" },
          ]}
        />
      </Section>

      <CTABlock
        title={<>Ready to <span className="italic">drive?</span></>}
        subtitle="Add our LINE OA. Tell us about your vehicle. Upload your license. You're verified within 24 hours."
        primaryHref="https://line.me/R/ti/p/@ridenth"
        primaryLabel="Add on LINE"
        secondaryHref="/contact"
        secondaryLabel="Questions?"
      />
    </>
  )
}
