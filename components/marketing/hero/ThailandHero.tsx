"use client"

import { motion } from "framer-motion"
import { THAILAND_PATH, CITIES, project } from "@/lib/geo/thailand"

export function ThailandHero() {
  const bkk = CITIES.find((c) => c.id === "bangkok")!
  const bkkPos = project(bkk.lng, bkk.lat)

  return (
    <div className="relative w-full max-w-[620px] aspect-[5/9] mx-auto">
      <svg viewBox="0 0 500 900" className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <radialGradient id="bkkGlow">
            <stop offset="0%" stopColor="#fff5c0" stopOpacity="0.95" />
            <stop offset="18%" stopColor="#ffd88a" stopOpacity="0.7" />
            <stop offset="45%" stopColor="#ff9955" stopOpacity="0.35" />
            <stop offset="80%" stopColor="#cc5522" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#cc5522" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cityGlow">
            <stop offset="0%" stopColor="#ffd680" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#ff8844" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pulseRing">
            <stop offset="0%" stopColor="#2ee5a0" stopOpacity="0" />
            <stop offset="70%" stopColor="#2ee5a0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2ee5a0" stopOpacity="0" />
          </radialGradient>
          <filter id="outlineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="packetGlow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <clipPath id="thaiClip">
            <path d={THAILAND_PATH} />
          </clipPath>
        </defs>

        {/* Satellite city lights INSIDE Thailand */}
        <g clipPath="url(#thaiClip)">
          {CITIES.map((city) => {
            const { x, y } = project(city.lng, city.lat)
            const radius = city.primary ? 135 : city.active >= 3 ? 50 : 30
            return (
              <ellipse
                key={`glow-${city.id}`}
                cx={x}
                cy={y}
                rx={radius}
                ry={radius * 0.72}
                fill={city.primary ? "url(#bkkGlow)" : "url(#cityGlow)"}
              />
            )
          })}
        </g>

        {/* Thailand outline — soft outer glow */}
        <path
          d={THAILAND_PATH}
          fill="none"
          stroke="rgba(46,229,160,0.3)"
          strokeWidth="6"
          strokeLinejoin="round"
          filter="url(#outlineGlow)"
        />

        {/* Thailand outline — crisp teal line with breathing pulse */}
        <motion.path
          d={THAILAND_PATH}
          fill="none"
          stroke="#2ee5a0"
          strokeWidth="1.4"
          strokeLinejoin="round"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Connection lines Bangkok → each city */}
        {CITIES.filter((c) => !c.primary).map((city, i) => {
          const { x, y } = project(city.lng, city.lat)
          return (
            <motion.line
              key={`line-${city.id}`}
              x1={bkkPos.x}
              y1={bkkPos.y}
              x2={x}
              y2={y}
              stroke="#2ee5a0"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.4"
              animate={{ strokeDashoffset: [0, -16] }}
              transition={{ duration: 1 + i * 0.2, repeat: Infinity, ease: "linear" }}
            />
          )
        })}

        {/* Data packets flying Bangkok → each city */}
        {CITIES.filter((c) => !c.primary).map((city, i) => {
          const { x, y } = project(city.lng, city.lat)
          return (
            <motion.circle
              key={`packet-${city.id}`}
              r="4"
              fill="#2ee5a0"
              filter="url(#packetGlow)"
              initial={{ cx: bkkPos.x, cy: bkkPos.y, opacity: 0 }}
              animate={{
                cx: [bkkPos.x, x],
                cy: [bkkPos.y, y],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2.5 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear",
              }}
            />
          )
        })}

        {/* City markers with pulse rings */}
        {CITIES.map((city, i) => {
          const { x, y } = project(city.lng, city.lat)
          return (
            <g key={`marker-${city.id}`}>
              <motion.circle
                cx={x}
                cy={y}
                r={city.primary ? 14 : 9}
                fill="url(#pulseRing)"
                animate={{
                  r: city.primary ? [14, 28, 14] : [9, 18, 9],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              />
              <circle
                cx={x}
                cy={y}
                r={city.primary ? 5 : 3.5}
                fill="#2ee5a0"
                stroke="#fff"
                strokeWidth={city.primary ? 1.8 : 1.2}
              />
              {city.primary && (
                <text
                  x={x + 10}
                  y={y + 2}
                  fill="#fff"
                  fontSize="11"
                  fontFamily="system-ui"
                  fontWeight="700"
                >
                  {city.name.toUpperCase()}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
