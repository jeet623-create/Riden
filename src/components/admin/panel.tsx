import { ReactNode } from 'react'
interface PanelProps { children: ReactNode; className?: string; title?: string; titleRight?: ReactNode }
export function Panel({ children, className='', title, titleRight }: PanelProps) {
  return (
    <div className={`bg-[#141414] border border-white/[0.08] rounded-xl ${className}`}>
      {title && <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]"><h3 className="font-medium">{title}</h3>{titleRight}</div>}
      <div className={title ? '' : 'p-6'}>{children}</div>
    </div>
  )
}
