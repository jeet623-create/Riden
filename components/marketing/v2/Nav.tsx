"use client"

import Link from "next/link"
import { Wordmark } from "@/components/brand/Wordmark"
import { MagneticButton } from "./MagneticButton"

// Editorial nav — thin top bar, Syne wordmark on the left, mono links across,
// teal "begin trial" CTA on the right. No emoji, no gradient, no shadow.
const LINKS = [
  { href: "/v2#how", label: "PRODUCT" },
  { href: "/v2#for", label: "FOR" },
  { href: "/pricing", label: "PRICING" },
  { href: "/about", label: "STUDIO" },
]

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#23262e]/70 bg-[#0a0b0e]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
        <Link
          href="/v2"
          className="text-[#f3f1ea] transition-opacity hover:opacity-80"
          aria-label="Riden home"
        >
          <Wordmark size="sm" />
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3] transition-colors hover:text-[#f3f1ea]"
            >
              <span className="relative">
                {l.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#1D9E75] transition-transform duration-200 hover:scale-x-100"
                />
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dmc/login"
            className="hidden font-mono text-[10px] tracking-[0.22em] text-[#9a9ca3] hover:text-[#f3f1ea] sm:inline"
          >
            LOG IN
          </Link>
          <MagneticButton href="/dmc/register">Begin trial ↗</MagneticButton>
        </div>
      </div>
    </header>
  )
}
