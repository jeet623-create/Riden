"use client"

import { useMemo } from "react"

const STAR_COUNT = 80

export function AmbientStarfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        key: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() < 0.7 ? 1 : 2,
        opacity: 0.25 + Math.random() * 0.55,
        delay: Math.random() * 5,
      })),
    [],
  )

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(13,20,30,0.85) 0%, rgba(5,8,14,1) 75%)",
      }}
    >
      {stars.map((s) => (
        <span
          key={s.key}
          className="absolute rounded-full bg-white motion-safe:animate-[twinkle_4s_ease-in-out_infinite]"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--o, 0.4); }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  )
}
