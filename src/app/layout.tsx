import type { Metadata } from 'next'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'RIDEN ไรเด็น | DMC Portal',
  description: 'B2B Tourism Transport Coordination Platform for Thailand',
  icons: { icon: '/favicon.ico' },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#D4E827',
              border: '0.5px solid rgba(212,232,39,0.3)',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '13px',
              borderRadius: '8px',
            },
            success: { iconTheme: { primary: '#D4E827', secondary: '#1A1A1A' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#1A1A1A' } },
          }}
        />
      </body>
    </html>
  )
}
