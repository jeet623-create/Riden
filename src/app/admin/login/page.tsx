'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const T = {
  en: { title:'Admin Login', sub:'RIDEN Master Control', email:'Email', pass:'Password', btn:'Sign In', err:'Invalid credentials or no admin access.' },
  th: { title:'เข้าสู่ระบบแอดมิน', sub:'ศูนย์ควบคุม RIDEN', email:'อีเมล', pass:'รหัสผ่าน', btn:'เข้าสู่ระบบ', err:'ข้อมูลไม่ถูกต้องหรือไม่มีสิทธิ์' },
}
export default function AdminLogin() {
  const router = useRouter()
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const t = T[lang]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const supabase = createClient()
    const { data: auth, error: ae } = await supabase.auth.signInWithPassword({ email, password })
    if (ae || !auth.user) { setError(t.err); setLoading(false); return }
    const { data: admin } = await supabase.from('admin_users').select('id,role,name,is_active').eq('email', email).single()
    if (!admin || !admin.is_active) { await supabase.auth.signOut(); setError(t.err); setLoading(false); return }
    localStorage.setItem('riden_admin', JSON.stringify({ role: admin.role, name: admin.name, lang }))
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-riden-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-riden-teal/5 rounded-full blur-[150px]" />
      <div className="w-full max-w-sm px-6 relative z-10">
        <div className="flex justify-end mb-6">
          <button onClick={() => setLang(lang==='en'?'th':'en')} className="glass px-3 py-1.5 rounded-lg text-xs text-riden-text hover:text-riden-white">
            {lang==='en'?'🇹🇭 ภาษาไทย':'🇬🇧 English'}
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-riden-teal rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="font-display text-xl font-700 text-riden-white tracking-wider">RIDEN</div>
              <div className="text-riden-teal text-xs font-mono tracking-widest">MASTER ADMIN</div>
            </div>
          </div>
          <p className="text-riden-text text-sm">{t.sub}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">{t.email}</label>
              <input type="email" className="riden-input" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">{t.pass}</label>
              <input type="password" className="riden-input" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : t.btn}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
