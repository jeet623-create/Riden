"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { THAILAND_PATH, CITIES, project } from "@/lib/geo/thailand"

// ThailandHero — live network map. Teal-only network, animated booking
// pulses Bangkok → cities, pulse rings on every hub, JetBrains Mono
// readouts at the corners (NETWORK · LIVE · 7 HUBS) so it reads as a
// real-time ops board rather than a static brochure illustration.

export function ThailandHero() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  const bkk = CITIES.find((c) => c.id === "bangkok")!
  const bkkPos = project(bkk.lng, bkk.lat)
  const totalActive = CITIES.reduce((sum, c) => sum + c.active, 0)
  const TEAL = "#2ee5a0"

  return (
    <div className="relative w-full max-w-[620px] aspect-[5/9] mx-auto">
      <svg
        viewBox="0 0 500 900"
        className="absolute inset-0 w-full h-full"
        aria-label="Riden network across Thailand"
      >
        <defs>
          <radialGradient id="thCityHalo">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.45" />
            <stop offset="60%" stopColor={TEAL} stopOpacity="0.08" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="thBkkHalo">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.7" />
            <stop offset="40%" stopColor={TEAL} stopOpacity="0.18" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
          </radialGradient>
          <filter id="thSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <clipPath id="thClip">
            <path d={THAILAND_PATH} />
          </clipPath>
        </defs>

        {/* City halos clipped to the country outline */}
        <g clipPath="url(#thClip)">
          {CITIES.map((city) => {
            const { x, y } = project(city.lng, city.lat)
            const r = city.primary ? 150 : 60
            return (
              <ellipse
                key={`halo-${city.id}`}
                cx={x}
                cy={y}
                rx={r}
                ry={r * 0.7}
                fill={city.primary ? "url(#thBkkHalo)" : "url(#thCityHalo)"}
              />
            )
          })}
        </g>

        {/* Soft outer glow on the country outline */}
        <path
          d={THAILAND_PATH}
          fill="none"
          stroke="rgba(46,229,160,0.28)"
          strokeWidth="5"
          strokeLinejoin="round"
          filter="url(#thSoft)"
        />

        {/* Crisp outline with breathing pulse */}
        <motion.path
          d={THAILAND_PATH}
          fill="none"
          stroke={TEAL}
          strokeWidth="1.1"
          strokeLinejoin="round"
          opacity={0.85}
          animate={reduced ? undefined : { opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bangkok → cities — dashed routes (booking corridors) */}
        {CITIES.filter((c) => !c.primary).map((city, i) => {
          const { x, y } = project(city.lng, city.lat)
          return (
            <motion.line
              key={`route-${city.id}`}
              x1={bkkPos.x}
              y1={bkkPos.y}
              x2={x}
              y2={y}
              stroke={TEAL}
              strokeWidth="0.85"
              strokeDasharray="3 5"
              opacity="0.4"
              animate={reduced ? undefined : { strokeDashoffset: [0, -16] }}
              transition={{
                duration: 1.8 + i * 0.25,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )
        })}

        {/* Booking pulses traveling along routes */}
        {!reduced &&
          CITIES.filter((c) => !c.primary).map((city, i) => {
            const { x, y } = project(city.lng, city.lat)
            return (
              <motion.circle
                key={`pulse-${city.id}`}
                r="3.2"
                fill={TEAL}
                initial={{ cx: bkkPos.x, cy: bkkPos.y, opacity: 0 }}
                animate={{
                  cx: [bkkPos.x, x],
                  cy: [bkkPos.y, y],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 2.6 + i * 0.35,
                  repeat: Infinity,
                  delay: i * 0.45,
                  ease: "linear",
                }}
              />
            )
          })}

        {/* City markers + pulse rings */}
        {CITIES.map((city, i) => {
          const { x, y } = project(city.lng, city.lat)
          const ringR = city.primary ? 12 : 8
          return (
            <g key={`marker-${city.id}`}>
              {!reduced && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={ringR}
                  fill="none"
                  stroke={TEAL}
                  strokeWidth="1"
                  animate={{
                    r: [ringR, ringR * 2.4, ringR],
                    opacity: [0.55, 0, 0.55],
                  }}
                  transition={{
                    duration: 2.4 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={city.primary ? 4.8 : 3.2}
                fill={TEAL}
                stroke="#020308"
                strokeWidth="1.4"
              />
            </g>
          )
        })}

        {/* City labels */}
        {CITIES.map((city) => {
          const { x, y } = project(city.lng, city.lat)
          const isBkk = city.primary
          return (
            <g key={`label-${city.id}`}>
              <text
                x={x + (isBkk ? 12 : 9)}
                y={y - (isBkk ? 4 : 2)}
                fill={isBkk ? "#ffffff" : "rgba(255,255,255,0.65)"}
                fontSize={isBkk ? "11" : "9"}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                style={{ letterSpacing: "0.18em" }}
                fontWeight={isBkk ? 700 : 500}
              >
                {city.name.toUpperCase()}
              </text>
              <text
                x={x + (isBkk ? 12 : 9)}
                y={y + (isBkk ? 8 : 9)}
                fill="rgba(255,255,255,0.4)"
                fontSize={isBkk ? "9" : "8"}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                style={{ letterSpacing: "0.18em" }}
              >
                {city.active} ACTIVE
              </text>
            </g>
          )
        })}
      </svg>

      {/* Corner readouts — control board feel */}
      <div className="pointer-events-none absolute left-0 top-0 font-mono text-[9px] tracking-[0.22em] text-white/40">
        <p>NETWORK · LIVE</p>
        <p className="mt-1 text-white/65">
          {CITIES.length} HUBS · {totalActive} ACTIVE
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 text-right font-mono text-[9px] tracking-[0.22em] text-white/40">
        <p>13.7563° N</p>
        <p>100.5018° E</p>
      </div>
    </div>
  )
}
