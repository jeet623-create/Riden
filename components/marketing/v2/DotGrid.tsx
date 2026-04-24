// 28px grid of 1px dots at rgba(243,241,234,0.03). Stays in the background —
// non-interactive, no motion. Use as `<DotGrid />` at the top of a section
// container with `relative` positioning.
export function DotGrid({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={"pointer-events-none absolute inset-0 " + className}
      style={{
        backgroundImage:
          "radial-gradient(rgba(243,241,234,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  )
}
