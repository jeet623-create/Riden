import { useTranslations } from "next-intl"
import { Nav } from "@/components/layout/Nav"
import { Footer } from "@/components/layout/Footer"
import { IntegrationCheck } from "@/components/_diagnostics/IntegrationCheck"

export default function HomePlaceholder() {
  const t = useTranslations()
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1240px] px-6 pt-20 pb-20 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2228%22 height=%2228%22><circle cx=%221%22 cy=%221%22 r=%221%22 fill=%22rgba(243,241,234,0.03)%22/></svg>')]">
        <section className="space-y-6">
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink-muted">
            DIRECTION 09 · SCAFFOLD
          </p>
          <h1 className="font-display text-5xl sm:text-7xl font-bold text-ink leading-[1.02] tracking-tight">
            Riden<span className="text-teal"> ↗</span>
          </h1>
          <p className="font-mono text-sm tracking-[0.22em] uppercase text-ink-muted">
            {t("tagline")}
          </p>
          <p className="max-w-xl text-ink-muted">
            {t("home.heroLead")}
          </p>
        </section>

        <div className="my-14 h-px w-full bg-border" />

        <IntegrationCheck />
      </main>
      <Footer />
    </>
  )
}
