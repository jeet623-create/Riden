"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { THAILAND_PATH, CITIES, project } from "@/lib/geo/thailand"

export function ThailandNetwork() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  const bkk = CITIES.find((c) => c.id === "bangkok")!
  const bkkPos = project(bkk.lng, bkk.lat)

  return (
    <div className="relative aspect-[5/9] w-full max-w-[520px]">
      <svg
        viewBox="0 0 500 900"
        className="absolute inset-0 h-full w-full"
        aria-label="Riden network across Thailand"
      >
        <defs>
          <radialGradient id="v2CityHalo">
            <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#1D9E75" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="v2BkkHalo">
            <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#1D9E75" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
          </radialGradient>
          <filter id="v2Soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <clipPath id="v2ThaiClip">
            <path d={THAILAND_PATH} />
          </clipPath>
        </defs>

        {/* City halos clipped to Thailand */}
        <g clipPath="url(#v2ThaiClip)">
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
                fill={city.primary ? "url(#v2BkkHalo)" : "url(#v2CityHalo)"}
              />
            )
          })}
        </g>

        {/* Soft outer glow on outline */}
        <path
          d={THAILAND_PATH}
          fill="none"
          stroke="rgba(29,158,117,0.25)"
          strokeWidth="5"
          strokeLinejoin="round"
          filter="url(#v2Soft)"
        />

        {/* Crisp outline */}
        <motion.path
          d={THAILAND_PATH}
          fill="none"
          stroke="#1D9E75"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity={0.8}
          animate={reduced ? undefined : { opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bangkok → cities — dashed routes */}
        {CITIES.filter((c) => !c.primary).map((city, i) => {
          const { x, y } = project(city.lng, city.lat)
          return (
            <motion.line
              key={`route-${city.id}`}
              x1={bkkPos.x}
              y1={bkkPos.y}
              x2={x}
              y2={y}
              stroke="#1D9E75"
              strokeWidth="0.75"
              strokeDasharray="3 5"
              opacity="0.35"
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
                r="3"
                fill="#1D9E75"
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
                  stroke="#1D9E75"
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
                r={city.primary ? 4.5 : 3}
                fill="#1D9E75"
                stroke="#0a0b0e"
                strokeWidth="1.5"
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
                fill={isBkk ? "#f3f1ea" : "#9a9ca3"}
                fontSize={isBkk ? "11" : "9"}
                fontFamily="var(--font-mono, ui-monospace), monospace"
                style={{ letterSpacing: "0.18em" }}
                fontWeight={isBkk ? 600 : 500}
              >
                {city.name.toUpperCase()}
              </text>
              <text
                x={x + (isBkk ? 12 : 9)}
                y={y + (isBkk ? 8 : 9)}
                fill="#5a5d65"
                fontSize={isBkk ? "9" : "8"}
                fontFamily="var(--font-mono, ui-monospace), monospace"
                style={{ letterSpacing: "0.18em" }}
              >
                {city.active} ACTIVE
              </text>
            </g>
          )
        })}
      </svg>

      {/* Corner readouts — make it feel like a control board, not a map */}
      <div className="pointer-events-none absolute left-0 top-0 font-mono text-[9px] tracking-[0.22em] text-[#5a5d65]">
        <p>NETWORK · LIVE</p>
        <p className="mt-1 text-[#9a9ca3]">7 HUBS · 26 ACTIVE</p>
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 text-right font-mono text-[9px] tracking-[0.22em] text-[#5a5d65]">
        <p>13.7563° N</p>
        <p>100.5018° E</p>
      </div>
    </div>
  )
}
