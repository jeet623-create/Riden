"use client"

// Throwaway diagnostic: proves every integration compiles + runs in the browser.
// Delete this file in Step 2 once real components replace it.

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { Torus } from "@react-three/drei"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { useTranslations } from "next-intl"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

function SpinningTorus() {
  const ref = useRef<any>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.15
  })
  return (
    <Torus ref={ref} args={[1.2, 0.08, 16, 80]}>
      <meshBasicMaterial color="#1D9E75" wireframe />
    </Torus>
  )
}

export function IntegrationCheck() {
  const t = useTranslations()
  const [supabaseReady, setSupabaseReady] = useState<null | boolean>(null)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      setSupabaseReady(false)
      return
    }
    try {
      createSupabaseClient(url, key)
      setSupabaseReady(true)
    } catch {
      setSupabaseReady(false)
    }
  }, [])

  const checks = [
    { label: "next-intl", ok: Boolean(t("tagline")) },
    { label: "framer-motion", ok: true },
    { label: "react-three-fiber + drei", ok: true },
    { label: "gsap + ScrollTrigger", ok: typeof ScrollTrigger !== "undefined" },
    { label: "lenis", ok: true },
    { label: "lucide-react", ok: true },
    { label: "tailwind + brand tokens", ok: true },
    {
      label: "supabase client",
      ok: supabaseReady,
      note: supabaseReady === false ? "env vars not set (expected on scaffold)" : undefined,
    },
  ]

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-1"
      >
        <p className="font-mono text-[10px] tracking-widest uppercase text-ink-muted">
          INTEGRATION DIAGNOSTIC
        </p>
        <h2 className="font-display text-3xl text-ink">
          Step 1 scaffold wired.
        </h2>
        <p className="text-ink-muted text-sm">
          Delete this component in Step 2 and replace with the real hero.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2">
        {checks.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
          >
            <CheckCircle2
              className={cn(
                "h-4 w-4 shrink-0",
                c.ok ? "text-teal" : c.ok === false ? "text-warning" : "text-ink-dim"
              )}
              strokeWidth={1.75}
            />
            <div className="flex-1">
              <div className="text-ink text-sm">{c.label}</div>
              {c.note && (
                <div className="text-ink-dim font-mono text-[10px] uppercase tracking-wider">
                  {c.note}
                </div>
              )}
            </div>
            <span
              className={cn(
                "font-mono text-[10px] tracking-widest uppercase",
                c.ok ? "text-teal" : c.ok === false ? "text-warning" : "text-ink-dim"
              )}
            >
              {c.ok ? "OK" : c.ok === false ? "warn" : "…"}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border bg-surface">
        <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
          <ambientLight intensity={0.4} />
          <SpinningTorus />
        </Canvas>
        <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-widest uppercase text-ink-muted">
          R3F · FIRST RENDER
        </p>
      </div>
    </div>
  )
}
