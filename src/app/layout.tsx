import type { Metadata } from 'next'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'RIDEN — ไรเด็น | DMC Portal',
  description: 'B2B Tourism Transport Coordination Platform for Thailand',
  icons: { icon: '/favicon.ico' },
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
              background: '#111A14',
              color: '#E8F5EB',
              border: '1px solid rgba(29,158,117,0.3)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#1D9E75', secondary: '#080E0B' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#080E0B' } },
          }}
        />
      </body>
    </html>
  )
}
