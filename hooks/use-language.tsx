"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

export type Language = "en" | "th" | "zh" | "ko" | "tr"

export const SUPPORTED_LANGUAGES: Language[] = ["en", "th", "zh", "ko", "tr"]

const STORAGE_KEY = "riden_dmc_lang"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (translations: Partial<Record<Language, string>>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function isValidLang(v: string | null | undefined): v is Language {
  return !!v && (SUPPORTED_LANGUAGES as readonly string[]).includes(v)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isValidLang(stored)) setLanguageState(stored)
    } catch {}
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try { window.localStorage.setItem(STORAGE_KEY, lang) } catch {}
  }, [])

  const t = useCallback(
    (translations: Partial<Record<Language, string>>) =>
      translations[language] ?? translations.en ?? "",
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
