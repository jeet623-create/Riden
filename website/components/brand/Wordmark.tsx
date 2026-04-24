import { cn } from "@/lib/utils"

// Syne Bold + teal ↗ arrow. Treat as one unit — never show wordmark without arrow.
export function Wordmark({
  className,
  size = "md",
}: {
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClass =
    size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-2xl"

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-display font-bold tracking-tight",
        sizeClass,
        className
      )}
      aria-label="Riden"
    >
      <span>Riden</span>
      <svg
        viewBox="0 0 12 12"
        className="inline-block h-[0.45em] w-[0.45em] translate-y-[-0.35em] text-teal"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M2 10 L10 2" />
        <path d="M4 2 L10 2 L10 8" />
      </svg>
    </span>
  )
}
