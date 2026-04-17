import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'RIDEN Admin', description: 'RIDEN Admin Panel' }
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
