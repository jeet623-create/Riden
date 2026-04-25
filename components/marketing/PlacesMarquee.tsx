"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

// Cinematic horizontal marquee — Thai place names scrolling endlessly,
// big italic Syne, teal pulse dot between each. Background outline of
// Thailand drifts slowly in parallax. Sits where the press strip used
// to be, says "we are everywhere in Thailand" without claiming press
// we don't have.

const PLACES = [
  "Bangkok",
  "Chiang Mai",
  "Phuket",
  "Krabi",
  "Pattaya",
  "Hua Hin",
  "Koh Samui",
  "Chiang Rai",
  "Ayutthaya",
  "Sukhothai",
  "Pai",
  "Khao Lak",
  "Koh Phi Phi",
  "Hat Yai",
  "Udon Thani",
  "Kanchanaburi",
]

export function PlacesMarquee() {
  const [reduced, setReduced] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  useEffect(() => {
    if (reduced) return
    const el = sectionRef.current
    if (!el) return

    let raf = 0
    function update() {
      const rect = el!.getBoundingClientRect()
      const vh = window.innerHeight
      const total = vh + rect.height
      const progress = Math.min(
        1,
        Math.max(0, (vh - rect.top) / total)
      )
      setScrollProgress(progress)
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  // Build the loop track twice for seamless infinite scroll
  const track = [...PLACES, ...PLACES]

  return (
    <section
      ref={sectionRef}
      className="relative z-10 overflow-hidden border-y border-white/5 bg-[#020308] py-20 md:py-28"
    >
      {/* Parallax Thailand silhouette in the background — drifts as you scroll */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-end opacity-[0.06]"
        style={{
          transform: reduced
            ? "translateY(0)"
            : `translateY(${(scrollProgress - 0.5) * -80}px) translateX(${(scrollProgress - 0.5) * 40}px)`,
        }}
      >
        <ThailandSilhouette />
      </motion.div>

      {/* Soft teal glow pinned to the left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[40%]"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 0% 50%, rgba(46,229,160,0.10), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-baseline justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#2ee5a0]">
              <span className="mr-3 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[#2ee5a0] motion-safe:animate-pulse" />
              WHERE WE RUN
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              From Bangkok to the islands.
            </h2>
          </div>
          <p className="hidden text-right font-mono text-[10px] tracking-[0.22em] text-white/40 sm:block">
            77 PROVINCES
            <br />
            ONE NETWORK
          </p>
        </div>
      </div>

      {/* Infinite marquee track */}
      <div className="relative mt-10">
        {/* Edge fades so names enter and exit gracefully */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#020308] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#020308] to-transparent"
        />

        <motion.div
          className="flex w-max items-center gap-12"
          animate={
            reduced
              ? undefined
              : { x: ["0%", "-50%"] }
          }
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {track.map((place, i) => (
            <div key={`${place}-${i}`} className="flex items-center gap-12">
              <span className="font-display text-[clamp(40px,7vw,88px)] font-semibold italic leading-none tracking-[-0.03em] text-white/85">
                {place}
              </span>
              <span className="inline-block h-2 w-2 rounded-full bg-[#2ee5a0] shadow-[0_0_18px_rgba(46,229,160,0.7)]" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Tail line under the marquee */}
      <div className="relative mx-auto mt-10 max-w-6xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="mt-6 font-mono text-[10px] tracking-[0.22em] text-white/40">
          BUILT IN BANGKOK · COORDINATING ACROSS THE KINGDOM
        </p>
      </div>
    </section>
  )
}

function ThailandSilhouette() {
  return (
    <svg
      viewBox="0 0 500 900"
      className="h-[120%] w-auto"
      aria-hidden
    >
      <path
        d="M334.14 534.81 L325.41 512.71 L315.82 500.06 L312.93 502.32 L314.43 510.45 L307.95 504.42 L297.38 501.95 L295.43 495.93 L300.72 491.24 L297.12 494.21 L297.86 487.61 L295.84 489.71 L295.84 486.82 L292.01 487.10 L296.04 493.72 L293.35 493.87 L284.95 485.35 L286.45 480.97 L283.60 478.95 L280.31 479.32 L283.15 485.13 L276.78 476.80 L276.65 481.43 L265.84 470.79 L245.13 477.44 L225.46 472.31 L218.72 477.30 L211.78 474.00 L210.56 470.66 L215.47 464.44 L212.18 457.88 L216.29 452.85 L212.99 447.08 L216.97 440.88 L215.03 435.27 L219.12 431.33 L219.99 423.05 L201.18 422.26 L195.96 419.53 L196.30 416.04 L194.99 421.63 L180.78 423.91 L177.09 421.81 L163.87 428.07 L158.50 434.30 L166.92 449.56 L158.36 473.08 L161.91 501.78 L150.67 517.97 L149.83 529.04 L139.40 542.22 L135.08 553.65 L136.08 562.04 L130.74 565.80 L131.64 581.90 L127.57 581.66 L123.47 593.07 L115.50 602.71 L118.16 612.21 L110.22 612.64 L116.35 620.07 L110.22 627.98 L109.81 647.02 L120.45 670.98 L115.21 674.32 L116.37 680.59 L129.45 682.49 L133.08 677.62 L149.01 675.14 L153.93 680.54 L158.76 718.45 L169.30 731.55 L171.80 731.04 L168.52 723.95 L173.84 727.93 L186.92 786.62 L194.92 802.80 L186.04 799.27 L184.88 783.56 L182.08 780.49 L176.94 783.36 L179.80 772.67 L177.90 767.82 L173.25 768.27 L169.33 771.98 L171.38 783.35 L177.31 793.56 L182.75 795.34 L185.98 805.09 L193.80 806.70 L195.56 801.88 L206.26 816.45 L220.09 824.09 L241.15 822.93 L237.60 818.18 L253.42 824.99 L266.17 845.59 L284.11 860.28 L283.33 870.11 L267.89 891.55 L259.88 890.00 L253.45 881.19 L235.06 888.71 L232.88 895.08 L227.51 898.19 L218.17 888.38 L224.93 879.57 L225.10 860.95 L210.30 861.54 L208.67 850.78 L204.16 846.05 L198.26 848.97 L183.77 844.30 L176.39 833.56 L170.65 833.85 L168.29 849.12 L166.88 843.63 L164.48 845.24 L152.83 829.78 L142.01 822.84 L141.62 813.82 L145.72 807.82 L141.52 807.99 L141.21 805.12 L137.74 807.18 L134.40 803.51 L137.11 792.71 L133.90 797.21 L131.44 792.18 L129.21 798.52 L123.70 796.05 L118.62 777.95 L108.96 769.09 L106.64 773.65 L103.17 771.78 L105.33 759.57 L102.86 760.85 L96.31 751.93 L87.52 753.60 L83.52 737.00 L78.81 738.05 L80.68 732.10 L67.16 735.89 L69.22 741.98 L66.96 746.07 L58.74 741.75 L53.54 722.76 L54.15 719.91 L56.73 722.74 L54.76 711.17 L57.24 703.65 L64.96 692.50 L61.47 693.06 L64.41 690.29 L60.85 681.98 L63.74 680.95 L68.88 661.50 L73.28 660.44 L69.25 658.12 L72.27 655.08 L71.05 651.52 L75.34 649.77 L71.90 647.85 L76.37 643.72 L72.18 644.08 L79.22 637.08 L77.59 634.61 L84.55 620.46 L88.71 604.01 L86.71 594.00 L100.11 583.95 L101.28 576.38 L104.47 577.13 L113.87 567.29 L127.96 536.75 L133.49 535.14 L138.69 524.55 L132.05 511.86 L133.43 504.93 L128.11 505.61 L125.19 478.64 L114.55 470.09 L111.00 454.50 L106.74 450.71 L107.27 442.67 L112.51 439.16 L110.27 409.84 L106.55 400.46 L97.34 387.46 L74.27 369.80 L56.15 343.99 L51.22 325.79 L52.21 318.89 L58.51 314.70 L64.60 316.74 L65.68 310.46 L74.99 310.75 L76.42 273.20 L74.23 268.94 L82.12 264.19 L89.72 265.14 L95.39 248.76 L91.64 243.28 L81.15 254.50 L79.26 243.84 L68.85 228.13 L71.99 217.89 L66.54 209.66 L59.50 207.50 L40.64 180.88 L27.34 169.64 L22.39 161.25 L27.03 152.88 L18.93 136.41 L20.09 132.50 L11.10 133.36 L3.06 117.71 L12.47 121.33 L26.53 116.51 L25.20 99.55 L21.30 95.09 L30.41 83.83 L27.80 66.59 L32.66 56.32 L42.16 52.00 L43.13 42.10 L55.81 50.45 L73.37 49.78 L89.75 41.89 L95.20 45.39 L101.24 41.01 L102.19 27.72 L105.56 24.09 L111.77 22.84 L118.79 26.43 L131.57 20.91 L126.23 7.52 L140.00 11.67 L156.97 3.32 L169.79 15.76 L175.02 7.68 L181.21 6.65 L188.16 18.68 L193.37 20.66 L189.52 37.41 L183.28 45.56 L188.94 58.89 L194.44 60.67 L198.41 57.86 L205.54 61.46 L213.08 53.54 L235.41 57.55 L230.50 67.87 L234.27 82.87 L239.67 89.36 L233.63 98.17 L234.21 111.23 L222.04 125.17 L229.49 131.50 L230.07 147.78 L220.29 157.97 L214.40 177.47 L228.11 183.52 L243.33 167.36 L248.11 167.90 L254.62 158.97 L263.63 156.31 L267.29 146.56 L274.07 148.76 L284.43 138.09 L290.00 138.91 L304.30 151.36 L315.45 153.71 L315.19 160.62 L320.41 162.48 L319.82 159.14 L330.52 152.70 L341.54 151.57 L349.30 135.92 L356.87 133.62 L353.81 128.05 L362.90 124.34 L390.34 133.70 L398.81 131.77 L425.71 171.18 L445.99 185.83 L443.72 239.86 L459.25 255.10 L461.79 264.49 L483.46 271.22 L479.80 276.68 L482.86 283.91 L496.48 291.02 L494.30 305.69 L486.75 310.90 L491.90 315.75 L484.75 324.13 L493.63 332.77 L487.45 345.12 L488.54 358.55 L483.09 366.76 L467.56 372.66 L461.15 379.69 L456.78 369.63 L444.74 366.05 L431.12 370.85 L409.35 368.20 L391.97 372.06 L379.46 369.27 L377.21 365.84 L347.51 373.30 L334.44 381.41 L321.35 407.01 L312.04 412.57 L315.34 416.45 L299.54 418.92 L299.30 436.40 L308.94 453.26 L308.29 472.52 L325.12 487.08 L320.96 502.64 L334.15 527.59 L334.14 534.81 Z"
        fill="#2ee5a0"
      />
    </svg>
  )
}
