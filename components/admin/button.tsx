'use client'
import { ButtonHTMLAttributes, ReactNode } from 'react'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?:'primary'|'secondary'|'ghost'|'danger'; size?:'sm'|'md'|'lg'; children:ReactNode }
export function Button({ variant='primary', size='md', children, className='', ...props }: ButtonProps) {
  const v = { primary:'bg-[var(--teal)] text-white hover:opacity-90', secondary:'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-1)] hover:border-[var(--border-strong)]', ghost:'bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-elevated)]', danger:'bg-[var(--red-bg)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] hover:bg-[var(--red)] hover:text-white' }
  const s = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-6 py-3 text-base' }
  return <button className={`inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-[0.97] ${v[variant]} ${s[size]} ${className}`} {...props}>{children}</button>
}
