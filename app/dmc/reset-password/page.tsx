"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Wordmark } from "@/components/brand/Wordmark"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)

  // Supabase's auth client auto-processes the recovery token from the URL hash
  // on the PASSWORD_RECOVERY event. We just wait for that.
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true)
    })
    // If no token in URL at all, show an error after a short delay
    const t = setTimeout(() => {
      if (!window.location.hash.includes("access_token")) {
        setError("No reset token found. Request a new reset link.")
      }
    }, 500)
    return () => { subscription.unsubscribe(); clearTimeout(t) }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError("Passwords do not match"); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    setIsLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }
    router.push("/dmc/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-background">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-[380px] w-full">
        <Link href="/" className="inline-block mb-8 text-foreground no-underline">
          <Wordmark size="sm" />
        </Link>
        <h1 className="font-semibold text-[22px] tracking-tight text-foreground mb-1">Set new password</h1>
        <p className="text-[13px] text-muted mb-7">Enter a new password for your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase text-muted mb-1.5">New password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase text-muted mb-1.5">Confirm password</label>
            <input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required minLength={8} />
          </div>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-dim border border-red/20 rounded-lg px-3 py-2">
                <p className="text-[12px] text-red">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button type="submit" disabled={isLoading || !ready}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium text-[14px] hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors">
            {isLoading ? "..." : ready ? "Update password" : "Verifying link..."}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-muted">
          <Link href="/dmc/login" className="text-primary hover:text-primary/80 transition-colors">← Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
