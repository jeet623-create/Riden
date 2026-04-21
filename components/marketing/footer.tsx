import Link from "next/link"
import { Wordmark } from "@/components/brand/Wordmark"
import type { MarketingDict } from "@/lib/i18n/dict"

type FooterProps = {
  dict: MarketingDict["footer"]
}

export function MarketingFooter({ dict }: FooterProps) {
  const COLUMNS: { heading: string; links: [string, string][] }[] = [
    {
      heading: dict.product,
      links: [
        ["/for-dmcs", "For DMCs"],
        ["/for-operators", "For Operators"],
        ["/for-drivers", "For Drivers"],
        ["/pricing", "Pricing"],
      ],
    },
    {
      heading: dict.company,
      links: [
        ["/about", "About"],
        ["/blog", "Blog"],
        ["/contact", "Contact"],
      ],
    },
    {
      heading: dict.support,
      links: [
        ["mailto:support@riden.me", "support@riden.me"],
        ["/status", "System status"],
        ["/blog", "Field notes"],
      ],
    },
    {
      heading: dict.legal,
      links: [
        ["/privacy", "Privacy"],
        ["/terms", "Terms"],
        ["/privacy#pdpa", "PDPA"],
      ],
    },
  ]

  return (
    <footer className="bg-[#030509] border-t border-white/5 pt-20 pb-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          <div className="col-span-2 md:col-span-1 max-w-xs">
            <Wordmark size="md" className="text-white" />
            <p className="mt-4 text-[13px] leading-relaxed text-white/60">{dict.tagline}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h5 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
                {col.heading}
              </h5>
              <ul className="space-y-2.5">
                {col.links.map(([href, label]) => {
                  const isExt = href.startsWith("mailto:") || href.startsWith("http")
                  const LinkTag: any = isExt ? "a" : Link
                  return (
                    <li key={href}>
                      <LinkTag
                        href={href}
                        className="text-[13px] text-white/70 hover:text-primary transition-colors no-underline"
                      >
                        {label}
                      </LinkTag>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.1em] text-white/40">
          <span>{dict.copyright}</span>
          <span>{dict.pdpa}</span>
          <Link href="/status" className="inline-flex items-center gap-1.5 text-primary no-underline">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            {dict.operational}
          </Link>
        </div>
      </div>
    </footer>
  )
}
