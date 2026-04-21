import type { Metadata } from 'next'
import { Syne, Inter_Tight, JetBrains_Mono, IBM_Plex_Sans_Thai, Noto_Sans_SC } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-syne',
  display: 'swap',
})
const inter = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})
const thai = IBM_Plex_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500'],
  variable: '--font-thai',
  display: 'swap',
})
const sc = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sc',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://riden.me'),
  title: {
    default: 'Riden — A coordination layer for Thailand',
    template: '%s · Riden',
  },
  description: 'Riden orchestrates Thai ground transport — one portal for DMCs, LINE dispatch for operators, real-time tracking for drivers. An innovation approach to Thailand. Made in Thailand. Made for the world.',
  keywords: ['Thailand', 'DMC', 'transport', 'tourism', 'LINE', 'bookings', 'ground transport', 'Bangkok'],
  authors: [{ name: 'Riden (Thailand) Co., Ltd.' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://riden.me',
    title: 'Riden — A coordination layer for Thailand',
    description: 'One portal for DMCs. LINE dispatch for operators. Real-time tracking for drivers. The coordination layer Thai tourism has been waiting for.',
    siteName: 'Riden',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Riden — A coordination layer for Thailand',
    description: 'One portal for DMCs. LINE dispatch for operators. Real-time tracking for drivers.',
  },
  alternates: {
    canonical: 'https://riden.me',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${inter.variable} ${jetbrains.variable} ${thai.variable} ${sc.variable} font-sans antialiased bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              classNames: {
                success: 'border-l-[3px] border-l-primary',
                error: 'border-l-[3px] border-l-danger',
              },
            }}
          />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {/* TODO: replace GA_MEASUREMENT_ID_HERE with real ID */}
        {/* <Script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID_HERE" /> */}
        {/* TODO: Meta Pixel — replace FB_PIXEL_ID_HERE */}
        {/* <Script id="fb-pixel">{`!function(f,b,e,v,n,t,s){...fbq('init','FB_PIXEL_ID_HERE');}`}</Script> */}
        {/* TODO: TikTok Pixel — replace TT_PIXEL_ID_HERE */}
        {/* <Script id="tt-pixel">{`!function(w,d,t){... ttq.load('TT_PIXEL_ID_HERE');}`}</Script> */}
      </body>
    </html>
  )
}
