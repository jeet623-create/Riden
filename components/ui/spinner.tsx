import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('animate-spin rounded-full border-2 border-t-transparent border-primary size-4', className)} {...props} />
  )
}

export { Spinner }
