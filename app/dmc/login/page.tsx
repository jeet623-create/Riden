"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

type Language = "en" | "th" | "zh"

export default function DMCLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    if (email === "demo@riden.co" && password === "demo123") {
      router.push("/dmc/dashboard")
    } else {
      setError("Invalid email or password")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-row overflow-hidden">
      <div className="w-[44%] bg-[#111111] flex-col p-12 hidden lg:flex">
        <div className="flex items-baseline gap-2">
          <span className="font-sans font-bold text-[16px] text-white">RIDEN</span>
          <span className="font-mono text-[9px] text-white/40">ไรเด็น</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <span className="font-mono text-[11px] uppercase text-white/30 tracking-wider mb-4">B2B TOURISM TRANSPORT</span>
          <h1 className="font-sans font-bold text-[52px] text-white tracking-tight leading-[1.05]">Move<br />Thailand.</h1>
          <p className="text-[14px] text-white/45 leading-[1.7] max-w-[320px] mt-4">The B2B platform connecting DMCs, operators and drivers — seamlessly.</p>
        </div>
        <div className="text-[11px] text-white/20">© 2026 RIDEN Co., Ltd.</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-10 relative bg-background">
        <div className="absolute top-6 right-6 flex gap-1">
          {(["en", "th", "zh"] as Language[]).map((lang) => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] transition-all ${language === lang ? "bg-foreground text-background" : "bg-transparent border border-border text-muted hover:text-foreground"}`}>
              {lang === "en" ? "EN" : lang === "th" ? "TH" : "中文"}
            </button>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-[380px] w-full">
          <h1 className="font-semibold text-[22px] tracking-tight text-foreground mb-1">Welcome back</h1>
          <p className="text-[13px] text-muted mb-7">Sign in to your DMC portal</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase text-muted mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[11px] uppercase text-muted">Password</label>
                <Link href="/dmc/forgot-password" className="text-[12px] text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-dim border border-red/20 rounded-lg px-3 py-2">
                  <p className="text-[12px] text-red">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button type="submit" disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium text-[14px] hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors">
              {isLoading ? "..." : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-[12px] text-muted">
            {"Don't have an account? "}
            <Link href="/register" className="text-primary hover:text-primary/80 transition-colors">Register</Link>
          </p>
          <div className="mt-6 pt-4 border-t border-border">
            <Link href="/privacy" className="block text-center text-[11px] text-muted hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}