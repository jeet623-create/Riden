import { ReactNode } from 'react'
interface PanelProps { children:ReactNode; className?:string; title?:string; titleRight?:ReactNode }
export function Panel({ children, className='', title, titleRight }: PanelProps) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{background:'var(--bg-surface)',border:'1px solid var(--border)'}}>
      {title && <div className="flex items-center justify-between px-6 py-4" style={{borderBottom:'1px solid var(--border)'}}><h3 className="font-semibold text-sm">{title}</h3>{titleRight}</div>}
      <div className={title?'':'p-6'}>{children}</div>
    </div>
  )
}
