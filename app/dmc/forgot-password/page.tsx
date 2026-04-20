"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dmc/reset-password`,
    })
    if (resetError) {
      setError(resetError.message)
      setIsLoading(false)
      return
    }
    setSent(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-background">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-[380px] w-full">
        <h1 className="font-semibold text-[22px] tracking-tight text-foreground mb-1">Reset password</h1>
        <p className="text-[13px] text-muted mb-7">Enter your email and we'll send you a reset link</p>

        {sent ? (
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-4">
            <p className="text-[13px] text-foreground font-medium mb-1">Check your email</p>
            <p className="text-[12px] text-muted">We sent a password reset link to <span className="text-foreground">{email}</span>. It'll expire in 1 hour.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase text-muted mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required />
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
              {isLoading ? "..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[12px] text-muted">
          <Link href="/dmc/login" className="text-primary hover:text-primary/80 transition-colors">← Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
