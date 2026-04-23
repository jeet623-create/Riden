"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { SUPPORTED_LANGS, type Lang } from "@/lib/marketing-i18n"
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

const LANG_LABEL: Record<Lang, string> = { en: "EN", th: "TH" }

export function MarketingNav({ lang, dict }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function switchLang(next: Lang) {
    if (next === lang) return
    setCookie("riden_lang", next)
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

        <div className="hidden md:flex items-center gap-4">
          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center rounded-full border border-white/10 p-0.5 bg-white/[0.02]"
          >
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                aria-pressed={l === lang}
                className={`h-7 px-2.5 rounded-full text-[11px] font-mono tracking-[0.1em] transition-colors ${
                  l === lang
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {LANG_LABEL[l]}
              </button>
            ))}
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
          className="md:hidden text-white w-11 h-11 -mr-2 flex items-center justify-center"
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
              className="text-white w-11 h-11 -mr-2 flex items-center justify-center"
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
            <div className="mt-6 inline-flex items-center rounded-full border border-white/10 p-0.5 bg-white/[0.02] self-start">
              {SUPPORTED_LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  aria-pressed={l === lang}
                  className={`h-9 px-4 rounded-full text-[12px] font-mono tracking-[0.1em] transition-colors ${
                    l === lang
                      ? "bg-white/10 text-white"
                      : "text-white/50"
                  }`}
                >
                  {LANG_LABEL[l]}
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
