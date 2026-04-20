import { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Wordmark } from "./Wordmark"

interface BrandMarkProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string
  headline?: ReactNode
  description?: ReactNode
  footer?: ReactNode
}

/**
 * Brand signature block for auth / marketing pages.
 * Combines Wordmark + editorial headline + supporting copy.
 */
export function BrandMark({ eyebrow, headline, description, footer, className, ...props }: BrandMarkProps) {
  return (
    <div className={cn("flex flex-col h-full", className)} {...props}>
      <Wordmark size="sm" />
      <div className="flex-1 flex flex-col justify-center">
        {eyebrow && (
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] mb-4 opacity-30">
            {eyebrow}
          </span>
        )}
        {headline && (
          <h1 className="font-display font-semibold text-[52px] tracking-[-0.015em] leading-[1.05]">
            {headline}
          </h1>
        )}
        {description && (
          <p className="text-[14px] leading-[1.7] max-w-[320px] mt-4 opacity-50">
            {description}
          </p>
        )}
      </div>
      {footer && <div className="text-[11px] opacity-25">{footer}</div>}
    </div>
  )
}
