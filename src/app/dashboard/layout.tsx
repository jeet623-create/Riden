import type { Metadata } from 'next'
import '../globals.css'
export const metadata: Metadata = { title: 'RIDEN DMC', description: 'RIDEN DMC Portal' }
export default function DmcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}