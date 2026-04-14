import type { Metadata } from 'next'
import { Syne, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RIDEN — ไรเด็น | DMC Portal',
  description: 'B2B Tourism Transport Coordination Platform for Thailand',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable + ' ' + spaceGrotesk.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: '0.5px solid #333',
              fontFamily: 'var(--font-space), sans-serif',
              fontSize: '14px',
              borderRadius: '8px',
            },
            success: { iconTheme: { primary: '#D4E827', secondary: '#1A1A1A' } },
            error: { iconTheme: { primary: '#FF4444', secondary: '#1A1A1A' } },
          }}
        />
      </body>
    </html>
  )
}
