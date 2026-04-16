'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'

type Lang = 'en' | 'th' | 'zh'

const T = {
  en: { 
    title: 'RIDEN', 
    sub: 'MASTER ADMIN', 
    label: 'RIDEN Master Control', 
    email: 'EMAIL', 
    pass: 'PASSWORD', 
    btn: 'Sign In', 
    loading: 'Signing in...',
    err: 'Invalid credentials or no admin access.',
    copyright: '2026 RIDEN Co., Ltd.'
  },
  th: { 
    title: 'RIDEN', 
    sub: 'MASTER ADMIN', 
    label: 'ศูนย์ควบคุม RIDEN', 
    email: 'อีเมล', 
    pass: 'รหัสผ่าน', 
    btn: 'เข้าสู่ระบบ', 
    loading: 'กำลังเข้าสู่ระบบ...',
    err: 'ข้อมูลไม่ถูกต้อง',
    copyright: '2026 RIDEN Co., Ltd.'
  },
  zh: { 
    title: 'RIDEN', 
    sub: 'MASTER ADMIN', 
    label: 'RIDEN 主控中心', 
    email: '电子邮件', 
    pass: '密码', 
    btn: '登录', 
    loading: '登录中...',
    err: '凭据无效或无管理员权限。',
    copyright: '2026 RIDEN Co., Ltd.'
  },
}

export default function AdminLogin() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('riden_theme') as 'dark' | 'light'
    const savedLang = localStorage.getItem('riden_lang') as Lang
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    if (savedLang) setLang(savedLang)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('riden_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const changeLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem('riden_lang', newLang)
  }

  const t = T[lang]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Mock login - accept any email/password for demo
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (email && password) {
      localStorage.setItem('riden_admin', JSON.stringify({ 
        email, 
        name: 'Admin', 
        role: 'superadmin',
        lang 
      }))
      router.push('/admin/dashboard')
    } else {
      setError(t.err)
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{ 
        background: 'var(--bg-base)',
        backgroundImage: 'radial-gradient(circle, rgba(29,158,117,0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }}
    >
      {/* Top right controls */}
      <div className="absolute top-5 right-5 flex items-center gap-2">
        {/* Language toggle */}
        <div 
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {(['en', 'th', 'zh'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              className="px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: lang === l ? 'var(--bg-elevated)' : 'transparent',
                color: lang === l ? 'var(--text-1)' : 'var(--text-2)',
                borderRight: l !== 'zh' ? '1px solid var(--border)' : 'none'
              }}
            >
              {l === 'en' ? 'EN' : l === 'th' ? 'TH' : '中文'}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" style={{ color: 'var(--text-2)' }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: 'var(--text-2)' }} />
          )}
        </button>
      </div>

      {/* Card */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-[420px] px-6"
      >
        {/* Logo section */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3.5"
            style={{ background: 'var(--teal-10)', border: '1px solid var(--teal-20)' }}
          >
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: 20, color: 'var(--teal)' }}>R</span>
          </div>
          <div style={{ fontFamily: 'var(--font-brand)', fontSize: 22, color: 'var(--text-1)', letterSpacing: 3 }}>{t.title}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: 3, marginTop: 4 }}>{t.sub}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{t.label}</div>
        </div>

        {/* Form card */}
        <div 
          className="rounded-2xl p-7"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label 
                className="block mb-1.5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: 2, textTransform: 'uppercase' }}
              >
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@riden.me"
                className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-colors"
                style={{ 
                  background: 'var(--bg-elevated)', 
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Password */}
            <div>
              <label 
                className="block mb-1.5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: 2, textTransform: 'uppercase' }}
              >
                {t.pass}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-lg text-sm outline-none transition-colors"
                  style={{ 
                    background: 'var(--bg-elevated)', 
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-2)' }}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg p-3"
                  style={{ 
                    background: 'var(--red-bg)', 
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: 'var(--red)',
                    fontSize: 12
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{ 
                background: 'var(--teal)', 
                color: '#fff',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseDown={e => {
                if (!loading) e.currentTarget.style.transform = 'scale(0.97)'
              }}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? (
                <>
                  <div 
                    className="w-4 h-4 rounded-full animate-spin"
                    style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
                  {t.loading}
                </>
              ) : t.btn}
            </button>
          </form>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6" style={{ fontSize: 11, color: 'var(--text-2)' }}>
          © {t.copyright}
        </div>
      </motion.div>
    </div>
  )
}
