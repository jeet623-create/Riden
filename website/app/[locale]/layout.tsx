import type { Metadata } from "next"
import { Syne, Inter_Tight, JetBrains_Mono, IBM_Plex_Sans_Thai } from "next/font/google"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider"
import { Toaster } from "sonner"
import "../globals.css"

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
})

const inter = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
})

const thai = IBM_Plex_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600"],
  variable: "--font-thai",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Riden — Where Gears Meet Green",
    template: "%s · Riden",
  },
  description:
    "Riden coordinates Thailand's inbound tourism transport. B2B SaaS for DMCs, operators, and drivers.",
  metadataBase: new URL("https://riden.me"),
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html
      lang={locale}
      className={`${syne.variable} ${inter.variable} ${mono.variable} ${thai.variable}`}
    >
      <body className="bg-bg text-ink antialiased grain">
        <NextIntlClientProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
          <Toaster theme="dark" richColors position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
