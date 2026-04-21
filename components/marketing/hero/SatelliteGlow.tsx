"use client"

export function SatelliteGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden hidden sm:block">
      <div
        className="absolute rounded-full motion-safe:animate-[drift-a_18s_ease-in-out_infinite]"
        style={{
          top: "12%",
          left: "18%",
          width: 480,
          height: 480,
          background:
            "radial-gradient(circle at center, rgba(46,229,160,0.28) 0%, rgba(46,229,160,0.08) 45%, transparent 75%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute rounded-full motion-safe:animate-[drift-b_24s_ease-in-out_infinite]"
        style={{
          bottom: "8%",
          right: "10%",
          width: 520,
          height: 520,
          background:
            "radial-gradient(circle at center, rgba(29,158,117,0.25) 0%, rgba(29,158,117,0.06) 50%, transparent 80%)",
          filter: "blur(48px)",
        }}
      />
      <style jsx global>{`
        @keyframes drift-a {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, -24px); }
        }
        @keyframes drift-b {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-32px, 20px); }
        }
      `}</style>
    </div>
  )
}
