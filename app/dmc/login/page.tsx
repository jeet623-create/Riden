"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Wordmark } from "@/components/brand/Wordmark"

type Language = "en" | "th" | "zh"

const INK = "#0A0A0B"
const INK_TEXT = "#F5F4F0"
const INK_MUTED = "#6B6B70"
const SAND = "#EDE6D7"
const SAND_TEXT = "#1A1A1C"
const SAND_MUTED = "#8E887A"
const TEAL = "#1D9E75"

export default function DMCLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialError = searchParams.get("error") === "no_profile"
    ? "No DMC account linked to this login. Contact Riden support."
    : ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(initialError)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const [resent, setResent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNeedsConfirm(false)
    setIsLoading(true)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      const msg = signInError.message
      if (/email.*confirm/i.test(msg) || /not.*confirm/i.test(msg)) {
        setNeedsConfirm(true)
        setError("Email not confirmed. Check your inbox for the verification link.")
      } else {
        setError(msg || "Invalid email or password")
      }
      setIsLoading(false)
      return
    }
    router.push("/dmc/dashboard")
    router.refresh()
  }

  async function resendConfirmation() {
    if (!email) return
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email })
    if (!resendError) setResent(true)
    else setError(resendError.message)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* LEFT — Ink panel, Direction 09 composition */}
      <div
        className="lg:w-[44%] lg:min-h-screen p-10 flex flex-col"
        style={{ background: INK, color: INK_TEXT }}
      >
        {/* Top row: eyebrow left, italic tagline right */}
        <div className="flex justify-between items-start gap-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: INK_MUTED }}>
            B2B Tourism Platform
          </span>
          <span className="font-display italic text-[13px] leading-[1.4] max-w-[220px] text-right" style={{ color: INK_MUTED }}>
            Built for Thailand's ground transport.
          </span>
        </div>

        {/* Grows to fill; wordmark aligns to bottom → sits ~60% down */}
        <div className="flex-1 flex items-end">
          <div>
            <Wordmark size="xl" />
            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: INK_MUTED }}>
              Bangkok <span style={{ color: TEAL }}>·</span> Transport <span className="opacity-40">/</span> Coordination
            </div>
          </div>
        </div>

        {/* Bottom-left copyright */}
        <div className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: INK_MUTED }}>
          © 2026 <span style={{ color: TEAL }}>·</span> Bangkok
        </div>
      </div>

      {/* RIGHT — Sand panel, form */}
      <div
        className="flex-1 lg:min-h-screen relative flex items-center justify-center p-10"
        style={{ background: SAND, color: SAND_TEXT }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-[380px] w-full"
        >
          <h1 className="font-display italic font-semibold text-[32px] tracking-[-0.015em] leading-[1.1] mb-1" style={{ color: SAND_TEXT }}>
            Welcome back.
          </h1>
          <p className="text-[13px] mb-7" style={{ color: SAND_MUTED }}>
            Sign in to your DMC portal.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.15em] mb-1.5" style={{ color: SAND_MUTED }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full h-10 px-3 rounded-md border text-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--studio-teal)]"
                style={{
                  background: "#FFFFFF",
                  borderColor: "rgba(26,26,28,0.12)",
                  color: SAND_TEXT,
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: SAND_MUTED }}>
                  Password
                </label>
                <Link href="/dmc/forgot-password" className="text-[12px] hover:opacity-75" style={{ color: TEAL }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 px-3 pr-10 rounded-md border text-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--studio-teal)]"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "rgba(26,26,28,0.12)",
                    color: SAND_TEXT,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75"
                  style={{ color: SAND_MUTED }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-md px-3 py-2"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <p className="text-[12px]" style={{ color: "#EF4444" }}>{error}</p>
                  {needsConfirm && !resent && (
                    <button type="button" onClick={resendConfirmation} className="mt-1.5 text-[12px] hover:underline" style={{ color: TEAL }}>
                      Resend confirmation email →
                    </button>
                  )}
                  {resent && <p className="mt-1.5 text-[12px]" style={{ color: TEAL }}>Confirmation email sent. Check your inbox.</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-md font-medium text-[14px] text-white inline-flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: TEAL }}
            >
              {isLoading ? "..." : <>Sign in <span aria-hidden>→</span></>}
            </button>
          </form>

          {/* Divider + register */}
          <div className="mt-8 pt-6 border-t flex items-center justify-between" style={{ borderColor: "rgba(26,26,28,0.10)" }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: SAND_MUTED }}>
              New to Riden?
            </span>
            <Link href="/dmc/register" className="text-[13px] font-medium hover:opacity-75" style={{ color: TEAL }}>
              Register →
            </Link>
          </div>
        </motion.div>

        {/* Language switcher bottom-right */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase">
          {(["en", "th", "zh"] as Language[]).map((lang, i) => (
            <div key={lang} className="flex items-center gap-2">
              {i > 0 && <span style={{ color: TEAL }}>·</span>}
              <button
                onClick={() => setLanguage(lang)}
                className="hover:opacity-75 transition-opacity"
                style={{ color: language === lang ? SAND_TEXT : SAND_MUTED, fontWeight: language === lang ? 500 : 400 }}
              >
                {lang === "en" ? "EN" : lang === "th" ? "TH" : "中"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
