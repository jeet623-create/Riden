"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Slow-drifting teal particle field. ~900 points, subtle. This is the Step 3
// preview running inside the Step 2 hero so you can see the cinematic direction.
// No text, no content — purely a background. Honours prefers-reduced-motion
// via the parent checking it before mounting this canvas.

function Field() {
  const ref = useRef<THREE.Points>(null)
  const count = 900

  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Uniform distribution in a flat-ish cloud
      const r = Math.pow(Math.random(), 0.6) * 6
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * 0.7
      pos[i * 3]     = Math.cos(theta) * r
      pos[i * 3 + 1] = Math.sin(phi) * r * 0.55
      pos[i * 3 + 2] = Math.sin(theta) * r * 0.6 - 1
    }
    return { positions: pos }
  }, [])

  useFrame((state, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.04
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#1D9E75"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  )
}

export function HeroParticles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <Field />
      </Canvas>
    </div>
  )
}
