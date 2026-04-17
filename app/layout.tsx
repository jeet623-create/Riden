import type { Metadata } from 'next'
import { DM_Sans, DM_Mono, Monoton, Sarabun, Noto_Sans_SC } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-dm-sans" })
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-dm-mono" })
const monoton = Monoton({ subsets: ["latin"], weight: ["400"], variable: "--font-monoton" })
const sarabun = Sarabun({ subsets: ["thai","latin"], weight: ["400","500","600","700"], variable: "--font-sarabun" })
const notoSansSC = Noto_Sans_SC({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-noto-sans-sc" })

export const metadata: Metadata = {
  title: 'RIDEN - Thailand Tourism Transport Coordination',
  description: 'B2B SaaS platform for Thailand tourism transport operators and DMC companies',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${dmMono.variable} ${monoton.variable} ${sarabun.variable} ${notoSansSC.variable} font-sans antialiased bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000, classNames: { success: 'border-l-[3px] border-l-primary', error: 'border-l-[3px] border-l-red' } }} />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}