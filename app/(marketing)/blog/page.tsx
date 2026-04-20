import type { Metadata } from "next"
import Link from "next/link"
import { PageHero, Section } from "@/components/marketing/primitives"
import { ARTICLES } from "./articles"

export const metadata: Metadata = {
  title: "Riden — Blog",
  description: "Field notes on Thai tourism, transport, and the coordination layer we're building.",
}

export default function BlogIndex() {
  return (
    <>
      <PageHero
        eyebrow="BLOG"
        title={<>Field <span className="italic">notes.</span></>}
        subtitle="Essays from the team. Thai tourism, ground transport, coordination infrastructure, and what we learn along the way."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARTICLES.map((a, i) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="group no-underline block">
              <article className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-colors h-full">
                <div className="aspect-[16/9] bg-gradient-to-br from-[#0A0C10] via-[#0E1014] to-[#050608] relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-80"
                    style={{
                      background: i === 0
                        ? "radial-gradient(ellipse at 20% 20%, rgba(29,158,117,0.4), transparent 60%)"
                        : i === 1
                          ? "radial-gradient(ellipse at 80% 30%, rgba(46,229,160,0.25), transparent 60%)"
                          : "radial-gradient(ellipse at 50% 70%, rgba(29,158,117,0.3), transparent 65%)",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display italic font-semibold text-[52px] tracking-[-0.02em] text-white/90">{i + 1}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">
                    <span className="text-primary">● {a.category}</span>
                    <span>·</span>
                    <span>{a.readTime}</span>
                  </div>
                  <h2 className="font-display font-semibold text-[22px] leading-tight tracking-[-0.01em] mb-3 group-hover:text-primary transition-colors">{a.title}</h2>
                  <p className="text-[14px] text-white/70 leading-relaxed mb-4">{a.dek}</p>
                  <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
                    {a.author} · {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}
