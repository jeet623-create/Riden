import type { Metadata } from 'next'
import '../globals.css'
export const metadata: Metadata = { title: 'RIDEN Admin', description: 'RIDEN Admin Panel' }
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}