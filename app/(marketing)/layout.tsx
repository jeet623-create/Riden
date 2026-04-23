import { MarketingNav } from "@/components/marketing/nav"
import { MarketingFooter } from "@/components/marketing/footer"
import { readLang, getDict } from "@/lib/i18n"
import { isRTL } from "@/lib/marketing-i18n"

// Opt into dynamic rendering so each request reads the riden_lang cookie fresh.
export const dynamic = "force-dynamic"

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const lang = await readLang()
  const dict = getDict(lang)
  const rtl = isRTL(lang)

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      lang={lang}
      className={`bg-[#030509] text-white min-h-screen flex flex-col ${
        lang === "th" ? "font-thai" : ""
      }`}
    >
      <MarketingNav lang={lang} dict={dict.nav} />
      <main className="flex-1 pt-16">{children}</main>
      <MarketingFooter dict={dict.footer} />
    </div>
  )
}
