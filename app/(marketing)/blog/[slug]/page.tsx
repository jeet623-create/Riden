import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ARTICLES } from "../articles"
import { Section, CTABlock } from "@/components/marketing/primitives"
import { ArrowLeft } from "lucide-react"

export function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) return { title: "Not found · Riden" }
  return { title: `${article.title} · Riden`, description: article.dek }
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) notFound()
  const idx = ARTICLES.findIndex(a => a.slug === slug)

  return (
    <>
      <Section className="pt-16 pb-0">
        <Link href="/blog" className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.15em] text-white/50 hover:text-primary transition-colors no-underline">
          <ArrowLeft className="w-3 h-3" /> All articles
        </Link>
      </Section>

      <article className="px-6 lg:px-10 pt-8 pb-16 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-5">
          <span className="text-primary">● {article.category}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>

        <h1 className="font-display font-semibold tracking-[-0.02em] leading-[1.05] text-[36px] md:text-[48px] mb-5">
          {article.title}
        </h1>
        <p className="text-[18px] md:text-[20px] text-white/70 leading-relaxed mb-8 max-w-2xl">
          {article.dek}
        </p>
        <div className="flex items-center gap-3 pb-8 mb-10 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#2ee5a0] flex items-center justify-center font-display font-bold text-[13px]">
            {article.author.split(" ").map(s => s[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-display font-semibold text-[14px]">{article.author}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
              {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-xl mb-10 overflow-hidden relative bg-[#0A0C10] border border-white/5">
          <div
            className="absolute inset-0"
            style={{
              background: idx === 0
                ? "radial-gradient(ellipse at 20% 20%, rgba(29,158,117,0.4), transparent 60%)"
                : idx === 1
                  ? "radial-gradient(ellipse at 80% 30%, rgba(46,229,160,0.25), transparent 60%)"
                  : "radial-gradient(ellipse at 50% 70%, rgba(29,158,117,0.3), transparent 65%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display italic font-semibold text-[120px] tracking-[-0.02em] text-white/90">{idx + 1}</span>
          </div>
        </div>

        <div className="space-y-6 text-[17px] leading-[1.75] text-white/85">
          {article.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </article>

      <CTABlock
        title={<>Want this in your <span className="italic">inbox?</span></>}
        subtitle="We publish occasionally. No spam."
        primaryHref="/contact"
        primaryLabel="Subscribe"
      />
    </>
  )
}
