'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

type Lang = 'en' | 'th' | 'zh'

const T = {
  en: { title: 'RIDEN', sub: 'MASTER ADMIN', label: 'RIDEN Master Control', email: 'EMAIL', pass: 'PASSWORD', btn: 'Sign In', loading: 'Signing in...', err: 'Invalid email or password', copyright: '2026 RIDEN Co., Ltd.' },
  th: { title: 'RIDEN', sub: 'MASTER ADMIN', label: 'ศูนย์ควบคุม RIDEN', email: 'อีเมล', pass: 'รหัสผ่าน', btn: 'เข้าสู่ระบบ', loading: 'กำลังเข้าสู่ระบบ...', err: 'ข้อมูลไม่ถูกต้อง', copyright: '2026 RIDEN Co., Ltd.' },
  zh: { title: 'RIDEN', sub: 'MASTER ADMIN', label: 'RIDEN 主控中心', email: '电子邮件', pass: '密码', btn: '登录', loading: '登录中...', err: '凭据无效', copyright: '2026 RIDEN Co., Ltd.' },
}

export default function AdminLogin() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('riden_lang') as Lang
    if (savedLang) setLang(savedLang)
  }, [])

  const changeLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem('riden_lang', newLang)
  }

  const t = T[lang]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(resolve => setTimeout(resolve, 600))
    localStorage.setItem('riden_admin', JSON.stringify({ email: email || 'admin@riden.me', name: 'Admin', role: 'superadmin', lang }))
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      {/* Dot grid overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ 
          backgroundImage: 'radial-gradient(circle, var(--teal) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-[420px] rounded-2xl p-10"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Language toggle - top right of card */}
        <div className="absolute top-4 right-4 flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['en', 'th', 'zh'] as Lang[]).map((l, i) => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              className="px-2.5 py-1.5 text-[10px] font-semibold transition-colors"
              style={{
                background: lang === l ? 'var(--bg-elevated)' : 'transparent',
                color: lang === l ? 'var(--text-1)' : 'var(--text-2)',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none'
              }}
            >
              {l === 'en' ? 'EN' : l === 'th' ? 'TH' : '中文'}
            </button>
          ))}
        </div>

        {/* Logo section - centered */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl"
            style={{ background: 'var(--teal-10)', border: '1px solid var(--teal-20)' }}
          >
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: 20, color: 'var(--teal)' }}>R</span>
          </div>
          <div className="mt-3" style={{ fontFamily: 'var(--font-brand)', fontSize: 22, color: 'var(--text-1)' }}>{t.title}</div>
          <div className="mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: 3, textTransform: 'uppercase' }}>{t.sub}</div>
          <div className="mt-1" style={{ fontSize: 13, color: 'var(--text-2)' }}>{t.label}</div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: 2, textTransform: 'uppercase' }}>
              {t.email}
            </label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@riden.me"
              className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px var(--teal-10)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: 2, textTransform: 'uppercase' }}>
              {t.pass}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pr-10 rounded-lg text-sm outline-none transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px var(--teal-10)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-2)' }}>
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
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontSize: 12 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{ background: 'var(--teal)', color: '#fff', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <motion.div className="w-4 h-4 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                {t.loading}
              </>
            ) : t.btn}
          </motion.button>
        </form>

        {/* Copyright */}
        <div className="text-center mt-8" style={{ fontSize: 11, color: 'var(--text-2)' }}>
          © {t.copyright}
        </div>
      </motion.div>
    </div>
  )
}
