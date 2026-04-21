export function HeroAtmosphere() {
  return (
    <>
      {/* Vignette — dark edges */}
      <div
        className="absolute inset-0 pointer-events-none z-40"
        style={{ boxShadow: "inset 0 0 180px 40px rgba(0,0,0,0.85)" }}
        aria-hidden
      />
      {/* Film grain — subtle noise */}
      <div
        className="absolute inset-0 pointer-events-none z-40 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' /></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.6'/></svg>")`,
          animation: "ridenGrain 0.8s steps(3) infinite",
        }}
        aria-hidden
      />
    </>
  )
}
