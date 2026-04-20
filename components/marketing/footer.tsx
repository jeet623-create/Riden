import Link from "next/link"

const COLUMNS: { heading: string; links: [string, string][] }[] = [
  {
    heading: "Product",
    links: [
      ["/for-dmcs", "For DMCs"],
      ["/for-operators", "For Operators"],
      ["/for-drivers", "For Drivers"],
      ["/pricing", "Pricing"],
    ],
  },
  {
    heading: "Company",
    links: [
      ["/about", "About"],
      ["/blog", "Blog"],
      ["/contact", "Contact"],
    ],
  },
  {
    heading: "Support",
    links: [
      ["mailto:support@riden.me", "support@riden.me"],
      ["/status", "System status"],
      ["/blog", "Field notes"],
    ],
  },
  {
    heading: "Legal",
    links: [
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
      ["/privacy#pdpa", "PDPA"],
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="bg-[#030509] border-t border-white/5 pt-20 pb-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          <div className="col-span-2 md:col-span-1 max-w-xs">
            <div className="inline-flex items-baseline">
              <span className="font-display font-bold text-[26px] tracking-[-0.04em] text-white">Riden</span>
              <span className="text-primary text-[16px] font-normal">↗</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-white/60">
              A coordination layer for Thai ground transport. Built in Bangkok. Made for the world.
            </p>
          </div>
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <h5 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">{col.heading}</h5>
              <ul className="space-y-2.5">
                {col.links.map(([href, label]) => {
                  const isExt = href.startsWith("mailto:") || href.startsWith("http")
                  const LinkTag: any = isExt ? "a" : Link
                  return (
                    <li key={href}>
                      <LinkTag href={href} className="text-[13px] text-white/70 hover:text-primary transition-colors no-underline">
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
          <span>© 2026 RIDEN · Bangkok · Thailand</span>
          <span>PDPA compliant · data stored in Singapore</span>
          <Link href="/status" className="inline-flex items-center gap-1.5 text-primary no-underline">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            All systems operational
          </Link>
        </div>
      </div>
    </footer>
  )
}
