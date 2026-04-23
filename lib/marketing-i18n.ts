// Marketing site i18n — English and Thai only.
// EN is the default; TH is hand-written by native speakers.
// No i18next dependency — just object lookups.

export const SUPPORTED_LANGS = ["en", "th"] as const
export type Lang = typeof SUPPORTED_LANGS[number]

export const LANG_NAMES: Record<Lang, string> = {
  en: "EN",
  th: "ไทย",
}

// Map Vercel x-vercel-ip-country → preferred language.
// Thailand defaults to Thai; everywhere else defaults to English.
export function countryToLang(country: string | null | undefined): Lang {
  if (!country) return "en"
  return country.toUpperCase() === "TH" ? "th" : "en"
}

export function isRTL(_lang: Lang): boolean {
  return false
}
