// Marketing site i18n — simple cookie-based language detection.
// EN + TH are primary (hand-written). ZH/KO/AR/HI/JA are auto-translated
// and need native-speaker review before launch.
// No i18next dependency — just object lookups.

export const SUPPORTED_LANGS = ["en", "th", "zh", "ko", "ar", "hi", "ja"] as const
export type Lang = typeof SUPPORTED_LANGS[number]

export const LANG_NAMES: Record<Lang, string> = {
  en: "EN",
  th: "ไทย",
  zh: "中文",
  ko: "한국어",
  ar: "العربية",
  hi: "हिंदी",
  ja: "日本語",
}

// Map Vercel x-vercel-ip-country → preferred language
export function countryToLang(country: string | null | undefined): Lang {
  if (!country) return "en"
  const c = country.toUpperCase()
  if (c === "TH") return "th"
  if (["CN", "HK", "TW"].includes(c)) return "zh"
  if (c === "KR") return "ko"
  if (["SA", "AE", "EG", "JO", "KW", "OM", "QA"].includes(c)) return "ar"
  if (["IN", "NP"].includes(c)) return "hi"
  if (c === "JP") return "ja"
  return "en"
}

export function isRTL(lang: Lang): boolean {
  return lang === "ar"
}
