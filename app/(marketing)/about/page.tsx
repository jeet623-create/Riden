import type { Metadata } from "next"
import { PageHero, Section, SectionTitle, CTABlock } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "About Riden — The coordination layer for Thai tourism",
  description:
    "RIDEN began with Sasiwimon Worrabot, an operator who saw the coordination gap every day. She brought the idea to Jeet Goswami — two decades in automotive infrastructure — and RIDEN was born.",
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="ABOUT"
        title={
          <>
            An innovation approach to <span className="italic">Thailand.</span>
          </>
        }
        subtitle="Made in Thailand. Made for the world."
      />

      {/* Origin story */}
      <Section>
        <div className="grid md:grid-cols-[2fr_1fr] gap-12 items-start">
          <div className="space-y-5 text-[16px] text-white/80 leading-[1.75] max-w-2xl">
            <p className="text-[18px] font-display text-white">
              RIDEN began with Sasiwimon Worrabot.
            </p>
            <p>
              After years inside Thailand's tourism and transport ecosystem, Sasi saw the same
              problem every single day — DMCs drowning in WhatsApp threads, operators juggling
              twenty LINE chats at once, drivers missing pickups because no one had a unified
              view. The coordination layer did not exist.
            </p>
            <p>
              She brought the idea to Jeet Goswami, a twenty-year veteran of automotive
              technology and founder of partkart.com, who had spent two decades building the
              infrastructure that moves parts across India. Together they saw that what
              Thailand's tourism transport needed was not another app for drivers — it was a
              coordination platform that lived where drivers already were: on LINE.
            </p>
            <p className="text-white">
              RIDEN was born in Bangkok. Built for Thailand. Designed for the world.
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 md:sticky md:top-24">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-3">
              MISSION
            </div>
            <p className="font-display italic text-[22px] leading-tight text-white">
              An innovation approach to Thailand. Made in Thailand. Made for the world.
            </p>
          </div>
        </div>
      </Section>

      {/* Founders — Sasi first */}
      <Section className="bg-white/[0.02] border-y border-white/5">
        <SectionTitle
          eyebrow="FOUNDERS"
          title={
            <>
              Built in <span className="italic">Bangkok.</span>
            </>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {[
            {
              name: "Sasiwimon Worrabot",
              role: "Co-Founder & COO",
              initials: "SW",
              location: "Bangkok, Thailand",
              bio: "Five years in communication and business operations. Thailand market strategist. The idea for RIDEN started with her.",
              linkedin: "#",
            },
            {
              name: "Jeet Goswami",
              role: "Co-Founder & CEO",
              initials: "JG",
              location: "India ↔ Bangkok",
              bio: "Twenty years in automotive technology. Founder of partkart.com. Two decades building coordination infrastructure for parts that move.",
              linkedin: "#",
            },
          ].map((p) => (
            <div
              key={p.name}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-7 flex gap-5 items-start"
            >
              <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#2ee5a0] flex items-center justify-center font-display font-bold text-[20px] text-white">
                {p.initials}
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold text-[20px] tracking-tight">
                  {p.name}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-primary mb-3">
                  {p.role}
                </div>
                <p className="text-[14px] text-white/75 leading-relaxed mb-3">{p.bio}</p>
                <div className="flex items-center gap-3 text-[12px] text-white/50 font-mono tracking-wide">
                  <span>{p.location}</span>
                  <a
                    href={p.linkedin}
                    className="text-primary hover:text-primary/80 no-underline"
                    aria-label={`${p.name} LinkedIn`}
                  >
                    LinkedIn ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Values — 3 principles */}
      <Section>
        <SectionTitle
          eyebrow="VALUES"
          title={
            <>
              How we <span className="italic">build.</span>
            </>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: "Built where drivers already are",
              desc: "No new app. No forced download. RIDEN is LINE-native because that's where Thai operators and drivers already coordinate — thousands of times a day.",
            },
            {
              title: "Thai first, world second",
              desc: "Start in Thailand. Solve it right. Then scale. Thai-language Flex Messages, THB pricing, Thai business rhythms — every decision earns its place in the home market before travelling.",
            },
            {
              title: "Operators stay sovereign",
              desc: "RIDEN coordinates; operators command. We give the tools. They keep the customer, the relationship, the margin, and the judgment. We are never between them and the driver.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-6 flex flex-col gap-3"
            >
              <h3 className="font-display font-semibold text-[18px] tracking-tight leading-tight">
                {v.title}
              </h3>
              <p className="text-[14px] text-white/65 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Press */}
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
        title={
          <>
            We're <span className="italic">hiring.</span>
          </>
        }
        subtitle="Product, engineering, ops, and partnerships. Bangkok-based. Remote Thailand OK."
        primaryHref="mailto:hello@riden.me?subject=Careers"
        primaryLabel="Email us"
      />
    </>
  )
}
