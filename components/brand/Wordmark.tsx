import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type WordmarkSize = "xs" | "sm" | "md" | "lg" | "xl"

interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: WordmarkSize
}

// Per-size values tuned against public/brand/riden-wordmark.svg (the brand-system source of truth).
// xl matches that SVG exactly (fontSize 72, arrow 32, stroke 4.5); smaller sizes use a slightly
// heavier stroke ratio so the raised arrow reads as bold rather than hairline in tight UI like nav.
const CONFIG: Record<WordmarkSize, { fs: number; arrow: number; gap: number; top: number; stroke: number }> = {
  xs: { fs: 14, arrow: 7,  gap: 2, top: 2,  stroke: 1.5 },
  sm: { fs: 22, arrow: 10, gap: 2, top: 3,  stroke: 2   },
  md: { fs: 28, arrow: 12, gap: 3, top: 4,  stroke: 2.5 },
  lg: { fs: 48, arrow: 21, gap: 5, top: 7,  stroke: 3.5 },
  xl: { fs: 72, arrow: 32, gap: 8, top: 10, stroke: 4.5 },
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
        style={{ fontSize: c.fs, lineHeight: 1 }}
      >
        Riden
      </span>
      <svg
        width={c.arrow}
        height={c.arrow}
        viewBox="0 0 32 32"
        fill="none"
        className="flex-shrink-0"
        style={{ marginLeft: c.gap, marginTop: c.top }}
        aria-hidden
      >
        <path
          d="M 4 28 L 28 4 M 28 4 L 14 4 M 28 4 L 28 18"
          stroke="#1D9E75"
          strokeWidth={c.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  )
}
