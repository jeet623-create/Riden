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
  title: 'Riden — Thailand tourism transport coordination',
  description: 'B2B platform connecting DMCs, operators and drivers across Thailand.',
  icons: {
    icon: '/brand/riden-monogram.svg',
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
      </body>
    </html>
  )
}
