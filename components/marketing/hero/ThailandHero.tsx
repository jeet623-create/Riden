"use client"

import { motion } from "framer-motion"
import {
  THAILAND_PATH_D,
  THAILAND_VIEWBOX,
  CITY_LIGHTS,
  ACTIVE_CITIES,
  CONNECTIONS,
  type CityTier,
} from "@/lib/geo/thailand-path"

// Tier → size mapping for satellite city lights (radial gradient ellipses)
const TIER_SIZE: Record<CityTier, { rx: number; ry: number; opacity: number }> = {
  1: { rx: 22, ry: 18, opacity: 1 },     // Bangkok — core
  2: { rx: 13, ry: 11, opacity: 0.85 },  // Large
  3: { rx:  9, ry:  8, opacity: 0.7 },   // Medium
  4: { rx:  6, ry:  5, opacity: 0.6 },   // Small
  5: { rx:  4, ry: 3.5, opacity: 0.5 },  // Tiny
}

const cityByName = Object.fromEntries(
  [...CITY_LIGHTS, ...ACTIVE_CITIES].map((c) => [c.name, c]),
)

export function ThailandHero() {
  const { width: W, height: H } = THAILAND_VIEWBOX

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] h-auto"
        aria-label="Thailand — live transport network"
      >
        <defs>
          {/* Radial gradient for satellite lights: orange-gold core */}
          <radialGradient id="cityLightGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff5c0" stopOpacity="1" />
            <stop offset="30%" stopColor="#ffcc66" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#ff8844" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#cc5522" stopOpacity="0" />
          </radialGradient>
          {/* Bangkok special: white core */}
          <radialGradient id="bangkokGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="15%" stopColor="#fff5c0" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#ffcc66" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#ff8844" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#cc5522" stopOpacity="0" />
          </radialGradient>
          <clipPath id="thailandClip">
            <path d={THAILAND_PATH_D} />
          </clipPath>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Halo glow stroke (behind everything) */}
        <path
          d={THAILAND_PATH_D}
          fill="none"
          stroke="rgba(46,229,160,0.25)"
          strokeWidth={4}
          strokeLinejoin="round"
        />

        {/* Thailand fill */}
        <path
          d={THAILAND_PATH_D}
          fill="rgba(29,158,117,0.04)"
          stroke="rgba(46,229,160,0.65)"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* Satellite city lights — clipped to border */}
        <g clipPath="url(#thailandClip)" filter="url(#softGlow)">
          {CITY_LIGHTS.map((c) => {
            const s = TIER_SIZE[c.tier]
            return (
              <ellipse
                key={c.name}
                cx={c.x}
                cy={c.y}
                rx={s.rx}
                ry={s.ry}
                fill={c.tier === 1 ? "url(#bangkokGrad)" : "url(#cityLightGrad)"}
                opacity={s.opacity}
              />
            )
          })}
        </g>

        {/* Dashed connection lines from Bangkok */}
        {CONNECTIONS.map(([a, b], i) => {
          const from = cityByName[a]
          const to = cityByName[b]
          if (!from || !to) return null
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#2ee5a0"
              strokeWidth={0.8}
              strokeDasharray="3 4"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )
        })}

        {/* Active city markers (7 pulsing teal dots with white ring) */}
        {ACTIVE_CITIES.map((c, i) => (
          <g key={`marker-${c.name}`}>
            <motion.circle
              cx={c.x}
              cy={c.y}
              r={5}
              fill="rgba(46,229,160,0.3)"
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
              style={{ transformOrigin: `${c.x}px ${c.y}px` }}
            />
            <circle cx={c.x} cy={c.y} r={3.5} fill="#ffffff" />
            <circle cx={c.x} cy={c.y} r={2.5} fill="#2ee5a0" />
          </g>
        ))}

        {/* Bangkok subtitle label */}
        <g>
          <text
            x={cityByName["Bangkok"].x + 30}
            y={cityByName["Bangkok"].y + 4}
            fill="#2ee5a0"
            fontSize={10}
            fontFamily="var(--font-mono), ui-monospace, monospace"
            letterSpacing={1.5}
          >
            BANGKOK
          </text>
          <text
            x={cityByName["Bangkok"].x + 30}
            y={cityByName["Bangkok"].y + 16}
            fill="rgba(237,230,215,0.6)"
            fontSize={8}
            fontFamily="var(--font-mono), ui-monospace, monospace"
            letterSpacing={1.2}
          >
            12 ACTIVE
          </text>
        </g>
      </svg>
    </div>
  )
}
