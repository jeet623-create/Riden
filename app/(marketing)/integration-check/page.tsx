"use client"

// Step 1 of 43.md: prove every required library compiles + runs on riden.me.
// This page is a throwaway — it'll be removed in Step 2 when the real cinematic
// hero replaces it.

export const dynamic = "force-dynamic"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { Torus } from "@react-three/drei"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"
import { CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

function SpinningTorus() {
  const ref = useRef<any>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.3
  })
  return (
    <Torus ref={ref} args={[1.3, 0.08, 24, 120]}>
      <meshBasicMaterial color="#1D9E75" wireframe />
    </Torus>
  )
}

export default function IntegrationCheckPage() {
  const [supabaseOk, setSupabaseOk] = useState<null | boolean>(null)
  const [lenisActive, setLenisActive] = useState(false)
  const [gsapScrollTriggered, setGsapScrollTriggered] = useState(false)
  const gsapTargetRef = useRef<HTMLDivElement | null>(null)

  // Supabase wiring proof
  useEffect(() => {
    try {
      createClient()
      setSupabaseOk(true)
    } catch {
      setSupabaseOk(false)
    }
  }, [])

  // Lenis smooth scroll proof
  useEffect(() => {
    if (typeof window === "undefined") return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    const lenis = new Lenis({ duration: 1.0, smoothWheel: true })
    setLenisActive(true)
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  // GSAP ScrollTrigger proof — fires when user scrolls the ghost marker into view
  useEffect(() => {
    if (!gsapTargetRef.current) return
    const tr = ScrollTrigger.create({
      trigger: gsapTargetRef.current,
      start: "top 80%",
      onEnter: () => setGsapScrollTriggered(true),
    })
    return () => tr.kill()
  }, [])

  const checks = [
    { label: "framer-motion (page entrance)", ok: true },
    { label: "@react-three/fiber + drei (torus)", ok: true },
    { label: "gsap + ScrollTrigger (scroll trip)", ok: gsapScrollTriggered, note: gsapScrollTriggered ? undefined : "scroll down to trip" },
    { label: "lenis (smooth scroll)", ok: lenisActive, note: lenisActive ? undefined : "reduced-motion disables lenis" },
    { label: "lucide-react (icons)", ok: true },
    { label: "tailwind + brand tokens", ok: true },
    { label: "supabase client", ok: supabaseOk },
  ]

  return (
    <main className="min-h-[200vh] bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-20 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-2"
        >
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted">
            STEP 01 · INTEGRATION DIAGNOSTIC
          </p>
          <h1 className="font-display italic text-4xl sm:text-5xl font-semibold leading-[1.05]">
            Scaffold wired.
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Every library the cinematic marketing site needs is compiling and
            running on production. This page is a throwaway — it gets replaced
            by the real hero in Step 2.
          </p>
        </motion.div>

        {/* Status grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {checks.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
            >
              <CheckCircle2
                className={
                  c.ok === true
                    ? "w-4 h-4 text-primary shrink-0"
                    : c.ok === false
                    ? "w-4 h-4 text-amber-400 shrink-0"
                    : "w-4 h-4 text-muted shrink-0"
                }
                strokeWidth={1.75}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm">{c.label}</div>
                {c.note && (
                  <div className="font-mono text-[10px] tracking-widest uppercase text-muted mt-0.5">
                    {c.note}
                  </div>
                )}
              </div>
              <span
                className={
                  "font-mono text-[10px] tracking-widest uppercase " +
                  (c.ok === true
                    ? "text-primary"
                    : c.ok === false
                    ? "text-amber-400"
                    : "text-muted")
                }
              >
                {c.ok === true ? "OK" : c.ok === false ? "off" : "…"}
              </span>
            </motion.div>
          ))}
        </div>

        {/* R3F canvas proof */}
        <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border bg-surface">
          <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
            <ambientLight intensity={0.4} />
            <SpinningTorus />
          </Canvas>
          <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-widest uppercase text-muted">
            REACT THREE FIBER · FIRST RENDER
          </p>
        </div>

        {/* Spacer forces scrolling so the GSAP trigger can fire */}
        <div className="py-20 text-center text-muted text-xs font-mono tracking-widest uppercase">
          ↓ SCROLL TO TRIGGER GSAP ↓
        </div>

        <div
          ref={gsapTargetRef}
          className="rounded-xl border border-border bg-surface px-6 py-10 text-center"
        >
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted">
            GSAP ScrollTrigger target
          </p>
          <p className="font-display italic text-2xl mt-2">
            {gsapScrollTriggered ? "Fired. GSAP works." : "Waiting for scroll…"}
          </p>
        </div>

        <footer className="pt-8 text-xs text-muted">
          Step 1 of 17 per <span className="font-mono">43.md</span>. Next:
          cinematic hero + full nav/footer.
        </footer>
      </section>
    </main>
  )
}
