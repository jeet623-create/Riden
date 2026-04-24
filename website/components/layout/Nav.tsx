import Link from "next/link"
import { useTranslations } from "next-intl"
import { Wordmark } from "@/components/brand/Wordmark"

// Placeholder nav — real nav with magnetic CTA + locale toggle ships in Step 2.
export function Nav() {
  const t = useTranslations("nav")
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-6">
        <Link href="/" className="text-ink hover:opacity-80">
          <Wordmark size="sm" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-muted sm:flex">
          <Link href="/how-it-works" className="hover:text-ink">
            {t("howItWorks")}
          </Link>
          <Link href="/for-dmc" className="hover:text-ink">
            {t("forDmc")}
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            {t("pricing")}
          </Link>
          <Link href="/about" className="hover:text-ink">
            {t("about")}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-ink-muted hover:text-ink"
          >
            {t("login")}
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-teal px-3.5 py-1.5 text-sm font-medium text-bg hover:opacity-90"
          >
            {t("signup")}
          </Link>
        </div>
      </div>
    </header>
  )
}
