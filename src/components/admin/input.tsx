'use client'
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'
import { Search } from 'lucide-react'
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { icon?:'search' }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className='', icon, ...props }, ref) => {
  const base = 'bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 h-9 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--teal)] transition-colors w-full'
  if (icon==='search') return <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]"/><input ref={ref} className={`${base} pl-9 ${className}`} {...props}/></div>
  return <input ref={ref} className={`${base} ${className}`} {...props}/>
})
Input.displayName = 'Input'
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className='', ...props }, ref) => (
  <textarea ref={ref} className={`bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--teal)] resize-none w-full ${className}`} {...props}/>
))
Textarea.displayName = 'Textarea'
