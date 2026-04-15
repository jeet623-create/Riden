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
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#fff',
            color: '#111',
            border: '0.5px solid #E4E4E4',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#19C977', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }} />
      </body>
    </html>
  )
}
