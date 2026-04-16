'use client'
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'
import { Search } from 'lucide-react'
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { icon?: 'search' }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className='', icon, ...props }, ref) => {
  const base = 'bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-[#f5f5f5] placeholder:text-[#737373] focus:outline-none focus:border-[#1D9E75] transition-colors w-full'
  if (icon === 'search') return <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]"/><input ref={ref} className={`${base} pl-10 ${className}`} {...props}/></div>
  return <input ref={ref} className={`${base} ${className}`} {...props}/>
})
Input.displayName = 'Input'
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className='', ...props }, ref) => (
  <textarea ref={ref} className={`bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-[#f5f5f5] placeholder:text-[#737373] focus:outline-none focus:border-[#1D9E75] resize-none w-full ${className}`} {...props}/>
))
Textarea.displayName = 'Textarea'
