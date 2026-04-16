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
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, var(--bg-base) 0%, #0a1628 100%)'
      }}
    >
      {/* Animated background elements */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2300d9a3%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px'
        }}
        aria-hidden="true"
      />

      {/* Top right controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        {/* Language toggle */}
        <div 
          className="flex rounded-lg overflow-hidden backdrop-blur-sm"
          style={{ 
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.3)'
          }}
        >
          {(['en', 'th', 'zh'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              className="px-3 py-2 text-xs font-semibold transition-all"
              style={{
                background: lang === l ? 'rgba(0,217,163,0.2)' : 'transparent',
                color: lang === l ? 'var(--teal)' : 'rgba(255,255,255,0.6)',
                borderRight: l !== 'zh' ? '1px solid rgba(255,255,255,0.1)' : 'none'
              }}
            >
              {l === 'en' ? 'EN' : l === 'th' ? 'ไทย' : '中文'}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
          style={{ 
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.3)',
            color: 'rgba(255,255,255,0.6)'
          }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md px-6 relative z-10"
      >
        {/* Header section */}
        <div className="text-center mb-12">
          {/* Logo */}
          <motion.div 
            className="inline-flex items-center justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(0,217,163,0.2), rgba(0,217,163,0.05))',
                border: '2px solid rgba(0,217,163,0.3)',
                boxShadow: '0 8px 32px rgba(0,217,163,0.1)'
              }}
            >
              <span style={{ 
                fontFamily: 'var(--font-brand)', 
                fontSize: 32, 
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--teal), #00a878)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'var(--teal)'
              }}>
                R
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <h1 
            style={{ 
              fontFamily: 'var(--font-brand)',
              fontSize: 28,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: -0.5,
              marginBottom: 8
            }}
          >
            {t.title}
          </h1>

          {/* Subtitle */}
          <p style={{ 
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: 12
          }}>
            {t.label}
          </p>

          {/* Description */}
          <p style={{ 
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 6
          }}>
            {t.sub}
          </p>
        </div>

        {/* Form container */}
        <motion.div 
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{ 
            background: 'rgba(10, 22, 40, 0.8)',
            border: '1px solid rgba(0,217,163,0.15)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)'
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email field */}
            <div>
              <label 
                className="block mb-3 text-xs font-semibold"
                style={{ 
                  color: '#fff',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}
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
                className="w-full h-14 px-5 rounded-full text-base outline-none transition-all duration-200 placeholder:text-gray-400"
                style={{ 
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  color: '#1a1a2e',
                  fontSize: 16,
                  fontWeight: 500
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#00d9a3'
                  e.target.style.boxShadow = '0 0 0 4px rgba(0,217,163,0.2)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password field */}
            <div>
              <label 
                className="block mb-3 text-xs font-semibold"
                style={{ 
                  color: '#fff',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}
              >
                {t.pass}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full h-14 px-5 pr-14 rounded-full text-base outline-none transition-all duration-200 placeholder:text-gray-400"
                  style={{ 
                    background: '#ffffff',
                    border: '2px solid #e2e8f0',
                    color: '#1a1a2e',
                    fontSize: 16,
                    fontWeight: 500
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#00d9a3'
                    e.target.style.boxShadow = '0 0 0 4px rgba(0,217,163,0.2)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: '#64748b' }}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl p-4 mt-4"
                  style={{ 
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fca5a5',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full text-base font-bold transition-all duration-200 flex items-center justify-center gap-2 mt-8"
              style={{ 
                background: loading ? 'rgba(0,217,163,0.6)' : 'linear-gradient(135deg, #00d9a3, #00b386)',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(0,217,163,0.35)',
                border: 'none',
                fontSize: 16,
                letterSpacing: 0.5
              }}
              whileHover={!loading ? { y: -2, boxShadow: '0 12px 32px rgba(0,217,163,0.45)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <motion.div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTopColor: '#fff',
                      borderRightColor: '#fff'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  {t.loading}
                </>
              ) : t.btn}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            © {t.copyright}
          </p>
        </div>
      </motion.div>

      {/* Animated gradient orbs in background */}
      <div 
        className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: 'var(--teal)', animation: 'float 8s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <div 
        className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-5 blur-3xl"
        style={{ background: 'var(--teal)', animation: 'float 12s ease-in-out infinite reverse' }}
        aria-hidden="true"
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }
      `}</style>
    </div>
  )
}
