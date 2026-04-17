"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

type Language = "en" | "th" | "zh"

const T = {
  en: { welcome: "Welcome back", sub: "Sign in to your DMC portal", email: "EMAIL ADDRESS", password: "PASSWORD", forgot: "Forgot password?", signin: "Sign in", register: "Register", noAccount: "Don't have an account?", error: "Invalid email or password", loading: "..." },
  th: { welcome: "ยินดีต้อนรับ", sub: "เข้าสู่ระบบพอร์ทัล DMC", email: "อีเมล", password: "รหัสผ่าน", forgot: "ลืมรหัสผ่าน?", signin: "เข้าสู่ระบบ", register: "สมัคร", noAccount: "ยังไม่มีบัญชี?", error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", loading: "..." },
  zh: { welcome: "欢迎回来", sub: "登录您的DMC门户", email: "电子邮件", password: "密码", forgot: "忘记密码？", signin: "登录", register: "注册", noAccount: "没有账户？", error: "邮箱或密码错误", loading: "..." },
}

export default function DMCLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const t = T[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const sb = createClient()
    const { data, error: authError } = await sb.auth.signInWithPassword({ email, password })
    if (authError || !data.user) { setError(t.error); setIsLoading(false); return }
    const { data: dmc } = await sb.from("dmc_users").select("id").eq("id", data.user.id).single()
    if (!dmc) { await sb.auth.signOut(); setError(t.error); setIsLoading(false); return }
    router.push("/dmc/dashboard")
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", overflow: "hidden" }}>
      {/* LEFT PANEL - Always dark */}
      <div style={{ width: "44%", background: "#111111", display: "flex", flexDirection: "column", padding: 48 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>RIDEN</span>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>ไรเด็น</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 16 }}>
            B2B TOURISM TRANSPORT · THAILAND
          </div>
          <h1 style={{ fontWeight: 700, fontSize: 52, color: "white", letterSpacing: -1, lineHeight: 1.05, margin: 0 }}>
            Move<br />Thailand.
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 320, marginTop: 16 }}>
            The B2B platform connecting DMCs, operators and drivers — seamlessly.
          </p>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2026 RIDEN Co., Ltd.</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "var(--bg-base,#080808)", position: "relative" }}>
        {/* Language toggle */}
        <div style={{ position: "absolute", top: 24, right: 24, display: "flex", gap: 4 }}>
          {(["en","th","zh"] as Language[]).map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)}
              style={{ padding: "4px 12px", borderRadius: 8, fontFamily: "monospace", fontSize: 11, cursor: "pointer", transition: "all 150ms", background: language === lang ? "var(--text-1,#f0f0f0)" : "transparent", color: language === lang ? "var(--bg-base,#080808)" : "var(--text-3,#555)", border: `1px solid ${language === lang ? "transparent" : "var(--border,#242)"}` }}>
              {lang === "en" ? "EN" : lang === "th" ? "TH" : "中文"}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          style={{ maxWidth: 380, width: "100%" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: "var(--text-1,#f0f0f0)", marginBottom: 4 }}>{t.welcome}</h1>
          <p style={{ fontSize: 13, color: "var(--text-2,#999)", marginBottom: 28 }}>{t.sub}</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontFamily: "monospace", fontSize: 11, textTransform: "uppercase", color: "var(--text-2,#999)", display: "block", marginBottom: 6 }}>{t.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border,#242)", background: "var(--bg-elevated,#1a1a1a)", color: "var(--text-1,#f0f0f0)", fontSize: 14, outline: "none", transition: "border-color 150ms" }}
                onFocus={e => e.target.style.borderColor = "#1D9E75"}
                onBlur={e => e.target.style.borderColor = "var(--border,#242)"} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontFamily: "monospace", fontSize: 11, textTransform: "uppercase", color: "var(--text-2,#999)" }}>{t.password}</label>
                <Link href="/dmc/forgot-password" style={{ fontSize: 12, color: "#1D9E75", textDecoration: "none" }}>{t.forgot}</Link>
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ width: "100%", height: 40, padding: "0 40px 0 12px", borderRadius: 8, border: "1px solid var(--border,#242)", background: "var(--bg-elevated,#1a1a1a)", color: "var(--text-1,#f0f0f0)", fontSize: 14, outline: "none", transition: "border-color 150ms" }}
                  onFocus={e => e.target.style.borderColor = "#1D9E75"}
                  onBlur={e => e.target.style.borderColor = "var(--border,#242)"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3,#555)" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#ef4444" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={isLoading}
              style={{ width: "100%", height: 44, background: "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, transition: "all 150ms" }}>
              {isLoading ? t.loading : t.signin}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "var(--text-2,#999)" }}>
            {t.noAccount}{" "}
            <Link href="/register" style={{ color: "#1D9E75", textDecoration: "none" }}>{t.register}</Link>
          </p>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border,#242)", textAlign: "center" }}>
            <Link href="/privacy" style={{ fontSize: 11, color: "var(--text-2,#999)", textDecoration: "none" }}>Privacy Policy</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
