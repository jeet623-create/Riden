import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type MonogramSize = "xs" | "sm" | "md" | "lg" | "xl"
type MonogramVariant = "standard" | "solid"

interface MonogramProps extends HTMLAttributes<HTMLSpanElement> {
  size?: MonogramSize
  variant?: MonogramVariant
}

const SIZES: Record<MonogramSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
}

export function Monogram({ size = "md", variant = "standard", className, ...props }: MonogramProps) {
  const px = SIZES[size]
  const strokeWidth = variant === "solid" ? Math.max(2.2, px * 0.08) : Math.max(1.8, px * 0.06)
  const fontWeight = variant === "solid" ? 800 : 700
  const arrowPx = Math.round(px * 0.42)

  return (
    <span
      className={cn("relative inline-block leading-none align-top", className)}
      style={{ width: Math.round(px * 1.1), height: px }}
      aria-label="Riden"
      {...props}
    >
      <span
        className="font-display tracking-[-0.02em] text-current"
        style={{ fontSize: px, lineHeight: 1, fontWeight }}
      >
        R
      </span>
      <svg
        width={arrowPx}
        height={arrowPx}
        viewBox="0 0 16 16"
        fill="none"
        className="absolute"
        style={{ right: 0, top: 0 }}
        aria-hidden
      >
        <path
          d="M 4 12 L 12 4 M 12 4 L 7 4 M 12 4 L 12 9"
          stroke="#1D9E75"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  )
}
