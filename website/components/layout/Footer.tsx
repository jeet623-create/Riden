import { useTranslations } from "next-intl"
import { Wordmark } from "@/components/brand/Wordmark"

// Placeholder footer — full editorial footer ships in Step 2.
export function Footer() {
  const t = useTranslations("footer")
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <Wordmark size="sm" />
            <p className="text-ink-muted text-sm">{t("tagline")}</p>
          </div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink-dim">
            ‹ BANGKOK · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}
