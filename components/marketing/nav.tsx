"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { LANG_NAMES, SUPPORTED_LANGS, type Lang } from "@/lib/marketing-i18n"
import type { MarketingDict } from "@/lib/i18n/dict"
import { Wordmark } from "@/components/brand/Wordmark"

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return
  const maxAge = days * 86400
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

type NavProps = {
  lang: Lang
  dict: MarketingDict["nav"]
}

export function MarketingNav({ lang, dict }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  function switchLang(next: Lang) {
    if (next === lang) {
      setLangMenuOpen(false)
      return
    }
    setCookie("riden_lang", next)
    setLangMenuOpen(false)
    if (typeof window !== "undefined") window.location.reload()
  }

  const navItems: [string, string][] = [
    ["/for-dmcs", dict.forDmcs],
    ["/for-operators", dict.forOperators],
    ["/for-drivers", dict.forDrivers],
    ["/pricing", dict.pricing],
    ["/about", dict.about],
    ["/blog", dict.blog],
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(3,5,9,0.6)] backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="no-underline text-white">
          <Wordmark size="sm" />
        </Link>

        <ul className="hidden md:flex items-center gap-7 list-none">
          {navItems.map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                className="font-mono text-[12px] uppercase tracking-[0.08em] text-white/70 hover:text-white transition-colors no-underline"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen((o) => !o)}
              className="h-8 px-2.5 rounded-md text-[12px] font-mono text-white/60 hover:text-white transition-colors inline-flex items-center gap-1"
              aria-label="Change language"
            >
              {LANG_NAMES[lang]}
              <span className="text-[9px]">▾</span>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#0A0C10] border border-white/10 rounded-md overflow-hidden shadow-xl">
                {SUPPORTED_LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLang(l)}
                    className={`block w-full text-left px-3 py-1.5 text-[12px] whitespace-nowrap ${
                      l === lang
                        ? "bg-primary/15 text-primary"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {LANG_NAMES[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a
            href="https://dmc.riden.me/dmc/login"
            className="font-mono text-[12px] uppercase tracking-[0.08em] text-white/70 hover:text-white transition-colors no-underline"
          >
            {dict.login}
          </a>
          <a
            href="https://dmc.riden.me/dmc/register"
            className="inline-flex items-center gap-1 h-9 px-3.5 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary/90 transition-colors no-underline"
          >
            {dict.beginTrial} <span>↗</span>
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-white p-2"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0A0C10] flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
            <Wordmark size="sm" className="text-white" />
            <button
              onClick={() => setMobileOpen(false)}
              className="text-white p-2"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto">
            {[...navItems, ["/contact", dict.contact] as [string, string]].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-white font-display text-[20px] no-underline"
              >
                {label}
              </Link>
            ))}
            <div className="mt-6 flex flex-wrap gap-2">
              {SUPPORTED_LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  className={`h-10 min-w-[44px] px-3 rounded-md text-[12px] font-mono border ${
                    l === lang
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "border-white/10 text-white/60"
                  }`}
                >
                  {LANG_NAMES[l]}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <a
                href="https://dmc.riden.me/dmc/login"
                className="block text-center py-3 rounded-md border border-white/10 text-white no-underline"
              >
                {dict.login}
              </a>
              <a
                href="https://dmc.riden.me/dmc/register"
                className="block text-center py-3 rounded-md bg-primary text-white no-underline"
              >
                {dict.beginTrial} ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
