"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { BrandMark } from "@/components/brand/BrandMark"

type Language = "en" | "th" | "zh"

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
      {/* Left — Ink panel with brand moment */}
      <div
        className="lg:w-[44%] p-12 lg:min-h-screen flex"
        style={{ background: "#0A0A0B", color: "#F5F4F0" }}
      >
        <BrandMark
          eyebrow="B2B Tourism Transport"
          headline={<><em className="italic font-normal">Move</em><br />Thailand.</>}
          description="The B2B platform connecting DMCs, operators and drivers — seamlessly."
          footer="© 2026 Riden Co., Ltd."
        />
      </div>

      {/* Right — Sand panel with form */}
      <div
        className="flex-1 flex items-center justify-center p-10 relative"
        style={{ background: "#EDE6D7", color: "#1A1A1C" }}
      >
        <div className="absolute top-6 right-6 flex gap-1">
          {(["en", "th", "zh"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] tracking-wider transition-colors ${
                language === lang ? "bg-[#1A1A1C] text-[#F5F4F0]" : "bg-transparent border border-[rgba(26,26,28,0.15)] text-[#8E887A] hover:text-[#1A1A1C]"
              }`}
            >
              {lang === "en" ? "EN" : lang === "th" ? "TH" : "中文"}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-[380px] w-full">
          <h1 className="font-display font-semibold text-[26px] tracking-[-0.01em] text-[#1A1A1C] mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-[#8E887A] mb-7">Sign in to your DMC portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase text-[#8E887A] tracking-[0.15em] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full h-10 px-3 rounded-md border text-[14px] transition-colors focus:outline-none"
                style={{
                  background: "#FFFFFF",
                  borderColor: "rgba(26,26,28,0.15)",
                  color: "#1A1A1C",
                }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[11px] uppercase text-[#8E887A] tracking-[0.15em]">Password</label>
                <Link href="/dmc/forgot-password" className="text-[12px] text-[#1D9E75] hover:opacity-80">
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
                  className="w-full h-10 px-3 pr-10 rounded-md border text-[14px] transition-colors focus:outline-none"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "rgba(26,26,28,0.15)",
                    color: "#1A1A1C",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E887A] hover:text-[#1A1A1C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <p className="text-[12px] text-[#EF4444]">{error}</p>
                  {needsConfirm && !resent && (
                    <button type="button" onClick={resendConfirmation} className="mt-1.5 text-[12px] text-[#1D9E75] hover:underline">
                      Resend confirmation email →
                    </button>
                  )}
                  {resent && <p className="mt-1.5 text-[12px] text-[#1D9E75]">Confirmation email sent. Check your inbox.</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-md font-medium text-[14px] text-white transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#1D9E75" }}
            >
              {isLoading ? "..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-[#8E887A]">
            {"Don't have an account? "}
            <Link href="/dmc/register" className="text-[#1D9E75] hover:opacity-80">Register</Link>
          </p>
          <div className="mt-6 pt-4 border-t" style={{ borderColor: "rgba(26,26,28,0.08)" }}>
            <Link href="/privacy" className="block text-center text-[11px] text-[#8E887A] hover:text-[#1A1A1C]">Privacy Policy</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
