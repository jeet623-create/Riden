"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Wordmark } from "@/components/brand/Wordmark"

const INK = "#0A0A0B"
const INK_TEXT = "#F5F4F0"
const INK_MUTED = "#6B6B70"
const SAND = "#EDE6D7"
const SAND_TEXT = "#1A1A1C"
const SAND_MUTED = "#8E887A"
const TEAL = "#1D9E75"

export default function DMCRegisterPage() {
  const router = useRouter()

  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message || "Registration failed.")
      toast.error(signUpError.message || "Registration failed.")
      setIsLoading(false)
      return
    }

    const authUser = signUpData.user
    if (!authUser) {
      setError("Sign-up returned no user. Please try again.")
      toast.error("Sign-up returned no user. Please try again.")
      setIsLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("dmc_users").insert({
      id: authUser.id,
      company_name: companyName,
      contact_person: contactPerson,
      email,
      phone: phone || null,
      country: country || null,
      subscription_plan: "trial",
      subscription_status: "active",
      is_active: true,
    })

    if (insertError) {
      setError(insertError.message)
      toast.error(insertError.message)
      setIsLoading(false)
      return
    }

    toast.success("Account created. Welcome to Riden.")
    router.push("/dmc/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      <div
        className="lg:w-[44%] lg:min-h-screen p-10 flex flex-col"
        style={{ background: INK, color: INK_TEXT }}
      >
        <div className="flex justify-between items-start gap-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: INK_MUTED }}>
            B2B Tourism Platform
          </span>
          <span className="font-display italic text-[13px] leading-[1.4] max-w-[220px] text-right" style={{ color: INK_MUTED }}>
            Built for Thailand's ground transport.
          </span>
        </div>

        <div className="flex-1 flex items-end">
          <div>
            <Wordmark size="xl" />
            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: INK_MUTED }}>
              Bangkok <span style={{ color: TEAL }}>·</span> Transport <span className="opacity-40">/</span> Coordination
            </div>
          </div>
        </div>

        <div className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: INK_MUTED }}>
          © 2026 <span style={{ color: TEAL }}>·</span> Bangkok
        </div>
      </div>

      <div
        className="flex-1 lg:min-h-screen relative flex items-center justify-center p-10"
        style={{ background: SAND, color: SAND_TEXT }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-[420px] w-full"
        >
          <h1 className="font-display italic font-semibold text-[32px] tracking-[-0.015em] leading-[1.1] mb-1" style={{ color: SAND_TEXT }}>
            Create your DMC account.
          </h1>
          <p className="text-[13px] mb-7" style={{ color: SAND_MUTED }}>
            60-day trial. No card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Company name" required>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Tours Co."
                  required
                  className={fieldClass}
                />
              </Field>
              <Field label="Contact person" required>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Somchai S."
                  required
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className={fieldClass}
              />
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className={`${fieldClass} pr-10`}
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
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Phone (optional)">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+66 ..."
                  className={fieldClass}
                />
              </Field>
              <Field label="Country (optional)">
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Thailand"
                  className={fieldClass}
                />
              </Field>
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
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-md font-medium text-[14px] text-white inline-flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: TEAL }}
            >
              {isLoading ? "..." : <>Create account <span aria-hidden>→</span></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t flex items-center justify-between" style={{ borderColor: "rgba(26,26,28,0.10)" }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: SAND_MUTED }}>
              Already have an account?
            </span>
            <Link href="/dmc/login" className="text-[13px] font-medium hover:opacity-75" style={{ color: TEAL }}>
              Sign in →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const fieldClass =
  "w-full h-10 px-3 rounded-md border text-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--studio-teal)] bg-white"

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-[0.15em] mb-1.5" style={{ color: SAND_MUTED }}>
        {label}{required ? " *" : ""}
      </label>
      {children}
    </div>
  )
}
