import type { Config } from "tailwindcss"

// Brand tokens locked — do not recolor the teal (#1D9E75).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0b0e",
        surface: "#111318",
        "surface-2": "#16191f",
        border: "#23262e",
        ink: "#f3f1ea",
        "ink-muted": "#9a9ca3",
        "ink-dim": "#5a5d65",
        teal: "#1D9E75",
        "teal-dim": "rgba(29,158,117,0.14)",
        sand: "#EDE8DA",
        "line-green": "#06C755",
        // functional
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        display: ["var(--font-syne)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: [
          "var(--font-inter)",
          "var(--font-thai)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
        thai: ["var(--font-thai)", "sans-serif"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      letterSpacing: {
        tight: "-0.02em",
        wider: "0.15em",
        widest: "0.22em",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(rgba(243,241,234,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-grid": "28px 28px",
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-rise": "fade-rise 200ms ease-out",
        pulse: "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
