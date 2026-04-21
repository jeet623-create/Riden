import { cookies } from "next/headers"
import { SUPPORTED_LANGS, type Lang } from "../marketing-i18n"
import type { MarketingDict } from "./dict"
import { en } from "./dict/en"
import { th } from "./dict/th"
import { zh } from "./dict/zh"
import { ko } from "./dict/ko"
import { ar } from "./dict/ar"
import { hi } from "./dict/hi"
import { ja } from "./dict/ja"

export type { MarketingDict } from "./dict"

const DICTS: Record<Lang, MarketingDict> = { en, th, zh, ko, ar, hi, ja }

export function getDict(lang: Lang): MarketingDict {
  return DICTS[lang] ?? DICTS.en
}

/**
 * Server-only helper: reads the `riden_lang` cookie set by middleware
 * (either explicitly by the user toggle, or by IP-based defaulting).
 * Falls back to English if missing or unknown.
 */
export async function readLang(): Promise<Lang> {
  const c = await cookies()
  const v = c.get("riden_lang")?.value
  if (v && (SUPPORTED_LANGS as readonly string[]).includes(v)) return v as Lang
  return "en"
}
