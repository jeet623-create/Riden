import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type WordmarkSize = "xs" | "sm" | "md" | "lg" | "xl"

interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: WordmarkSize
}

const CONFIG: Record<WordmarkSize, { fontSize: number; arrow: number; gap: number; mt: number }> = {
  xs: { fontSize: 14, arrow: 8, gap: 3, mt: 0 },
  sm: { fontSize: 18, arrow: 10, gap: 4, mt: 1 },
  md: { fontSize: 28, arrow: 14, gap: 5, mt: 2 },
  lg: { fontSize: 48, arrow: 22, gap: 8, mt: 3 },
  xl: { fontSize: 72, arrow: 32, gap: 12, mt: 4 },
}

export function Wordmark({ size = "md", className, ...props }: WordmarkProps) {
  const c = CONFIG[size]
  return (
    <span
      className={cn("inline-flex items-start leading-none", className)}
      aria-label="Riden"
      {...props}
    >
      <span
        className="font-display font-bold tracking-[-0.02em] text-current"
        style={{ fontSize: c.fontSize, lineHeight: 1 }}
      >
        Riden
      </span>
      <svg
        width={c.arrow}
        height={c.arrow}
        viewBox="0 0 16 16"
        fill="none"
        className="flex-shrink-0"
        style={{ marginLeft: c.gap, marginTop: c.mt }}
        aria-hidden
      >
        <path
          d="M 4 12 L 12 4 M 12 4 L 7 4 M 12 4 L 12 9"
          stroke="#1D9E75"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  )
}
