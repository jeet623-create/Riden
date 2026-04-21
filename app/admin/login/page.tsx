"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Shield } from "lucide-react"
import { Wordmark } from "@/components/brand/Wordmark"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams?.get("next") || "/admin/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      const signInPromise = supabase.auth.signInWithPassword({ email, password })
      const signInResult = await Promise.race([
        signInPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Sign-in timed out. Check your connection and try again.")), 15000)
        ),
      ])

      const { data, error: signInError } = signInResult
      if (signInError || !data?.user?.email) {
        console.error("signInWithPassword failed:", signInError)
        setError(signInError?.message || "Invalid email or password")
        setIsLoading(false)
        return
      }

      const { data: admin, error: adminErr } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", data.user.email)
        .eq("is_active", true)
        .maybeSingle()

      if (adminErr) {
        console.error("admin_users lookup failed:", adminErr)
        await supabase.auth.signOut()
        setError("Could not verify admin access: " + adminErr.message)
        setIsLoading(false)
        return
      }
      if (!admin) {
        await supabase.auth.signOut()
        setError("This account does not have admin access.")
        setIsLoading(false)
        return
      }

      const safeNext = nextPath.startsWith("/admin") ? nextPath : "/admin/dashboard"
      // Full nav forces the new session cookies to be sent on the very first server request,
      // sidestepping any RSC cache that might still think we're unauthenticated.
      window.location.assign(safeNext)
    } catch (err: any) {
      console.error("Admin login error:", err)
      setError(err?.message || "Sign-in failed. Check the console for details.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="max-w-[380px] w-full"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-dim flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" strokeWidth={1.75} />
          </div>
          <div className="flex items-baseline gap-2 mb-1 text-foreground">
            <Wordmark size="sm" />
            <span className="font-mono text-[9px] text-muted uppercase tracking-[0.15em]">ADMIN</span>
          </div>
          <p className="text-[13px] text-muted">Sign in to admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase text-muted tracking-[0.15em] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@riden.co"
              className="w-full h-10 px-3 rounded-md border border-input bg-surface text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase text-muted tracking-[0.15em] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-surface text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
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
                className="bg-danger-dim border border-danger/20 rounded-md px-3 py-2"
              >
                <p className="text-[12px] text-danger">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary text-primary-foreground rounded-md font-medium text-[14px] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? "..." : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] text-muted">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  )
}
