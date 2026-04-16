import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'RIDEN | Admin Portal',
  description: 'B2B Tourism Transport Coordination Platform for Thailand - Admin Portal',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1D9E75',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#080808]">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-surface)',
              color: 'var(--text-1)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              borderRadius: '12px',
            },
            className: 'riden-toast',
          }}
          theme="dark"
        />
      </body>
    </html>
  )
}
