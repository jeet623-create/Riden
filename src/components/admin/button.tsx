'use client'
import { ButtonHTMLAttributes, ReactNode } from 'react'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'|'lg'; children: ReactNode }
export function Button({ variant='primary', size='md', children, className='', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-all disabled:opacity-50'
  const v = { primary:'bg-[#1D9E75] text-white hover:bg-[#188f6a]', secondary:'bg-[#1a1a1a] text-[#f5f5f5] border border-white/[0.08] hover:border-white/[0.12]', ghost:'bg-transparent text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]', danger:'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] hover:bg-[#ef4444] hover:text-white' }
  const s = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-6 py-3 text-base' }
  return <button className={`${base} ${v[variant]} ${s[size]} ${className}`} {...props}>{children}</button>
}
