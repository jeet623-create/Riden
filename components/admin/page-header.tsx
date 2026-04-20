import { ReactNode } from 'react'
interface PageHeaderProps { title: string; subtitle?: string; action?: ReactNode; badge?: ReactNode }
export function PageHeader({ title, subtitle, action, badge }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-medium">{title}</h1>{badge}</div>
      <div className="flex items-center gap-3">
        {subtitle && <div className="text-sm text-[#a3a3a3] font-mono">{subtitle}</div>}
        {action}
      </div>
    </div>
  )
}
