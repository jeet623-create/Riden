'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [theme, setTheme] = useState<'dark'|'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('admin_theme') as 'dark'|'light' || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('admin_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const T = {
    en: { title:'RIDEN', sub:'MASTER ADMIN', label:'RIDEN Master Control', email:'EMAIL', pass:'PASSWORD', btn:'Sign In', err:'Invalid credentials or no admin access.' },
    th: { title:'RIDEN', sub:'MASTER ADMIN', label:'ศูนย์ควบคุม RIDEN', email:'อีเมล', pass:'รหัสผ่าน', btn:'เข้าสู่ระบบ', err:'ข้อมูลไม่ถูกต้อง' },
  }
  const t = T[lang]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const supabase = createClient()
    const { data: auth, error: ae } = await supabase.auth.signInWithPassword({ email, password })
    if (ae || !auth.user) { setError(t.err); setLoading(false); return }
    const { data: admin } = await supabase.from('admin_users').select('id,role,name').eq('id', auth.user.id).single()
    if (!admin) { await supabase.auth.signOut(); setError(t.err); setLoading(false); return }
    router.push('/admin')
  }

  const inp: React.CSSProperties = { width:'100%', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'10px 12px', fontSize:13, color:'var(--text-1)', outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.15s' }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-body)', position:'relative' }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{ position:'absolute', top:20, right:20, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16 }}>
        {theme==='dark'?'☀️':'🌙'}
      </button>
      {/* Lang toggle */}
      <button onClick={()=>setLang(lang==='en'?'th':'en')} style={{ position:'absolute', top:20, right:68, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'0 10px', height:36, fontSize:11, color:'var(--text-3)', cursor:'pointer', fontFamily:'var(--font-body)' }}>
        {lang==='en'?'🇹🇭 ภาษาไทย':'🇬🇧 English'}
      </button>

      {/* Card */}
      <div style={{ width:'100%', maxWidth:400, padding:'0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, background:'var(--teal)', borderRadius:14, marginBottom:14 }}>
            <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>
          </div>
          <div style={{ fontFamily:'var(--font-brand)', fontSize:20, letterSpacing:4, color:'var(--text-1)', marginBottom:4 }}>{t.title}</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--teal)', letterSpacing:3, marginBottom:8 }}>{t.sub}</div>
          <div style={{ fontSize:13, color:'var(--text-3)' }}>{t.label}</div>
        </div>

        {/* Form card */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text-3)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>{t.email}</label>
              <input type='email' value={email} onChange={e=>setEmail(e.target.value)} required autoFocus placeholder='admin@riden.me' style={inp} onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text-3)', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>{t.pass}</label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder='••••••••' style={{...inp, paddingRight:40}} onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
                <button type='button' onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--text-3)' }}>
                  {showPass?'👁️':'👁️'}
                </button>
              </div>
            </div>
            {error&&(
              <div style={{ background:'var(--red-bg)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'var(--r)', padding:'9px 12px', fontSize:12, color:'var(--red)' }}>{error}</div>
            )}
            <button type='submit' disabled={loading} style={{ width:'100%', padding:'11px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:'var(--r)', fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, transition:'all 0.12s', fontFamily:'var(--font-body)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading?(
                <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></>
              ):t.btn}
            </button>
          </form>
        </div>

        <div style={{ textAlign:'center', marginTop:24, fontSize:11, color:'var(--text-3)' }}>© 2026 RIDEN Co., Ltd.</div>
      </div>
    </div>
  )
}
