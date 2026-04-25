import Link from "next/link"
import { Wordmark } from "@/components/brand/Wordmark"

// Editorial footer — 4 columns of mono-labelled links, wordmark + tagline
// top-left, location chevron bottom-right. No icons, no newsletter form (those
// live on /contact).
const COLUMNS: {
  label: string
  items: { href: string; text: string }[]
}[] = [
  {
    label: "PRODUCT",
    items: [
      { href: "/for-dmcs", text: "For DMCs" },
      { href: "/for-operators", text: "For operators" },
      { href: "/for-drivers", text: "For drivers" },
      { href: "/pricing", text: "Pricing" },
    ],
  },
  {
    label: "STUDIO",
    items: [
      { href: "/about", text: "About" },
      { href: "/blog", text: "Journal" },
      { href: "/contact", text: "Contact" },
    ],
  },
  {
    label: "LEGAL",
    items: [
      { href: "/privacy", text: "Privacy" },
      { href: "/terms", text: "Terms" },
      { href: "/privacy#pdpa", text: "PDPA" },
    ],
  },
  {
    label: "STATUS",
    items: [
      { href: "/status", text: "System status" },
      { href: "/contact", text: "Support" },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative border-t border-[#23262e] bg-[#0a0b0e] text-[#f3f1ea]">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Wordmark size="md" />
            <p className="max-w-xs text-sm text-[#9a9ca3] leading-relaxed">
              Coordinates Thailand&apos;s inbound tourism transport. Made in
              Bangkok, made for the world.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.label} className="space-y-3">
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
                {col.label}
              </div>
              <ul className="space-y-2">
                {col.items.map((item: { href: string; text: string }) => (
                  <li key={item.href + item.text}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#9a9ca3] transition-colors hover:text-[#f3f1ea]"
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#23262e] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
            © {year} RIDEN (THAILAND) CO., LTD.
          </p>
          <p className="font-mono text-[10px] tracking-[0.22em] text-[#5a5d65]">
            ‹ BANGKOK · 13.7563°N, 100.5018°E
          </p>
        </div>
      </div>
    </footer>
  )
}
