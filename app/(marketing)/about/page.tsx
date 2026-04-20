import type { Metadata } from "next"
import { PageHero, Section, SectionTitle, CTABlock } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "About Riden — The coordination layer for Thai tourism",
  description: "Founded in Bangkok. Built for the world. Meet the team behind Riden.",
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="ABOUT"
        title={<>We're building the coordination layer for <span className="italic">Thai tourism.</span></>}
        subtitle="Founded in 2026 in Bangkok. Currently orchestrating transport across 77 provinces for Thai DMCs and their global agent networks."
      />

      <Section>
        <div className="grid md:grid-cols-[2fr_1fr] gap-12 items-start">
          <div className="space-y-5 text-[16px] text-white/80 leading-[1.7] max-w-2xl">
            <p>
              Riden was founded in early 2026 in Bangkok by Jeet and Sasi, after a decade of watching Thai ground transport operate entirely through WhatsApp threads, verbal agreements, and trust. Twenty-million tourists a year pass through Thailand. Nearly every one of them rides in a vehicle coordinated by a DMC who depends on personal phone calls to get them there.
            </p>
            <p>
              The pattern we saw: a Thai DMC receives a booking from a foreign agent. What follows is a cascade — fifteen WhatsApp messages to find an operator, three voice notes to align on price, a handoff to a driver who may or may not show up on time, and a panicked call to the customer the next morning. The work is invisible, but it's immense. And it breaks at scale.
            </p>
            <p>
              Riden's bet is simple: if we move the coordination into one portal for DMCs, one LINE Flex Message for operators, and one photo-verified trail for drivers, the entire industry gets faster, more reliable, and more profitable — without changing the relationships or the trust that make Thai tourism work.
            </p>
            <p>
              We're a small team. We write our own code. We work with real DMCs every day. We're building for the long term — not the next round.
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-3">MISSION</div>
            <p className="font-display italic text-[22px] leading-tight text-white">
              Make Thai ground transport work as elegantly as the Thai people who run it.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-white/[0.02] border-y border-white/5">
        <SectionTitle
          eyebrow="THE TEAM"
          title={<>Built in <span className="italic">Bangkok.</span></>}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          {[
            { name: "Jeet Ariyapraveetrakul", role: "Co-founder · Product", initials: "JA", bio: "10 years in Thai tourism ops. Previously scaled a boutique DMC to 800 bookings/mo." },
            { name: "Sasi Kittiaram", role: "Co-founder · Engineering", initials: "SK", bio: "Full-stack. Built Riden's core platform. Previously at a Bangkok fintech." },
          ].map(p => (
            <div key={p.name} className="bg-white/[0.03] border border-white/10 rounded-xl p-6 flex gap-4">
              <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#2ee5a0] flex items-center justify-center font-display font-bold text-[18px]">{p.initials}</div>
              <div>
                <div className="font-display font-semibold text-[18px]">{p.name}</div>
                <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/50 mb-2">{p.role}</div>
                <p className="text-[14px] text-white/70 leading-relaxed">{p.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionTitle
          eyebrow="VALUES"
          title={<>How we <span className="italic">build.</span></>}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Meet people in LINE", desc: "Thai tourism runs on LINE. We don't force new apps. We integrate into the channels our users already live in." },
            { title: "Photos over phone calls", desc: "Every trip moment gets GPS-stamped and photo-verified. Proof, not promises." },
            { title: "Transparent revenue", desc: "Operators and drivers see what they earn. No opaque cuts. No platform fees hidden in dispatch." },
            { title: "Build for Thailand first", desc: "Thai-language Flex Messages, THB pricing, Thai business hours. Global after, not before." },
          ].map(v => (
            <div key={v.title} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="font-display font-semibold text-[17px] tracking-tight mb-2">{v.title}</h3>
              <p className="text-[13px] text-white/60 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-white/[0.02] border-y border-white/5">
        <div className="text-center max-w-2xl mx-auto">
          <div className="font-mono text-[11px] tracking-[0.2em] text-primary mb-3">● PRESS</div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center text-[14px] text-white/70 font-display">
            <span>Bangkok Post</span>
            <span>TTG Asia</span>
            <span>Nikkei Asia</span>
            <span>e27</span>
            <span>Tech in Asia</span>
            <span>Techsauce</span>
          </div>
        </div>
      </Section>

      <CTABlock
        title={<>We're <span className="italic">hiring.</span></>}
        subtitle="Product, engineering, ops, and partnerships. Bangkok-based. Remote Thailand OK."
        primaryHref="mailto:hello@riden.me?subject=Careers"
        primaryLabel="Email us"
      />
    </>
  )
}
