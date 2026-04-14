'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'en'|'th'>('en')

  useEffect(() => {
    setLang((localStorage.getItem('riden_lang') as 'en'|'th') || 'en')
  }, [])

  const T = {
    en: {
      headline: 'Move Thailand.',
      sub: 'The B2B platform connecting DMCs, operators and drivers.',
      welcome: 'Welcome back',
      portal: 'Sign in to your DMC portal',
      email: 'Email address',
      pass: 'Password',
      forgot: 'Forgot password?',
      btn: 'Sign in',
      noAcc: "Don't have an account?",
      reg: 'Register',
    },
    th: {
      headline: 'ขับเคลื่อนไทย.',
      sub: 'แพลตฟอร์ม B2B เชื่อมต่อ DMC ผู้ประกอบการ และคนขับ',
      welcome: 'ยินดีต้อนรับ',
      portal: 'เข้าสู่ระบบพอร์ทัล DMC',
      email: 'อีเมล',
      pass: 'รหัสผ่าน',
      forgot: 'ลืมรหัสผ่าน?',
      btn: 'เข้าสู่ระบบ',
      noAcc: 'ยังไม่มีบัญชี?',
      reg: 'สมัคร',
    }
  }
  const t = T[lang]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await createClient().auth.signInWithPassword({ email, password: pass })
    if (err) { setError(err.message); setLoading(false) }
    else router.push('/dashboard')
  }

  function switchLang(l: 'en'|'th') { setLang(l); localStorage.setItem('riden_lang', l) }

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:'var(--font-space)', background:'#fff' }}>

      {/* ── Left: brand panel (yellow) — hidden on mobile ── */}
      <div style={{
        flex:'0 0 44%',
        background:'var(--yellow)',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        padding:'44px 48px',
        position:'relative',
      }} className="hide-mobile">

        {/* Logo */}
        <div className="riden-logo">
          <span className="riden-logo-main" style={{ fontSize:22, color:'var(--dark)' }}>RIDEN</span>
          <span className="riden-logo-thai" style={{ fontSize:11, color:'var(--dark)' }}>ไรเด็น</span>
        </div>

        {/* Main copy */}
        <div>
          <p style={{ fontFamily:'var(--font-space)', fontSize:11, fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--dark)', opacity:0.5, marginBottom:20 }}>B2B Tourism Transport · Thailand</p>
          <h1 style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'clamp(52px,5.5vw,76px)', letterSpacing:'-0.04em', lineHeight:0.95, color:'var(--dark)', marginBottom:24 }}>{t.headline}</h1>
          <p style={{ fontSize:16, color:'var(--dark)', opacity:0.55, lineHeight:1.65, maxWidth:320, marginBottom:52 }}>{t.sub}</p>

          {/* Stat blocks */}
          <div style={{ display:'flex', gap:40 }}>
            {[['12+','Edge Functions'],['20','DB Tables'],['3','Countries']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:36, letterSpacing:'-0.04em', color:'var(--dark)', lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:'var(--font-space)', fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--dark)', opacity:0.45, marginTop:5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Link href="/privacy" style={{ fontFamily:'var(--font-space)', fontSize:11, color:'var(--dark)', opacity:0.45, textDecoration:'none' }}>Privacy Policy</Link>
          <span style={{ color:'var(--dark)', opacity:0.2 }}>·</span>
          <span style={{ fontFamily:'var(--font-space)', fontSize:11, color:'var(--dark)', opacity:0.45 }}>© 2026 RIDEN Co., Ltd.</span>
        </div>
      </div>

      {/* ── Right: form panel (white) ── */}
      <div style={{
        flex:1,
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        padding:'clamp(24px, 5vw, 64px)',
        background:'#fff',
        position:'relative',
        minHeight:'100vh',
      }}>

        {/* Mobile logo */}
        <div style={{ position:'absolute', top:24, left:24 }} className="hide-desktop">
          <div className="riden-logo">
            <span className="riden-logo-main" style={{ fontSize:20, color:'var(--dark)' }}>RIDEN</span>
            <span className="riden-logo-thai" style={{ fontSize:10, color:'var(--dark)' }}>ไรเด็น</span>
          </div>
        </div>

        {/* Lang toggle */}
        <div style={{ position:'absolute', top:24, right:24 }}>
          <div style={{ display:'inline-flex', background:'var(--gray5)', border:'0.5px solid var(--gray4)', borderRadius:20, padding:2 }}>
            {(['en','th'] as const).map(l => (
              <button key={l} onClick={() => switchLang(l)} style={{
                padding:'5px 14px', borderRadius:20, fontSize:11, fontWeight:600,
                cursor:'pointer', border:'none', transition:'all 150ms',
                background: lang===l ? 'var(--dark)' : 'transparent',
                color: lang===l ? 'var(--yellow)' : 'var(--gray2)',
                fontFamily:'var(--font-syne)',
              }}>
                {l === 'en' ? 'EN' : 'ไทย'}
              </button>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div style={{ width:'100%', maxWidth:420 }} className="anim-fade-up">

          <div style={{ marginBottom:36 }}>
            <h2 style={{ fontFamily:'var(--font-syne)', fontWeight:700, fontSize:28, letterSpacing:'-0.03em', color:'var(--dark)', marginBottom:6, lineHeight:1.15 }}>{t.welcome}</h2>
            <p style={{ fontSize:14, color:'var(--gray2)', lineHeight:1.5 }}>{t.portal}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Email */}
            <div>
              <label style={{ display:'block', fontFamily:'var(--font-space)', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray2)', marginBottom:7 }}>{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="company@example.com"
                className="input"
                style={{ fontSize:14 }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                <label style={{ fontFamily:'var(--font-space)', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray2)' }}>{t.pass}</label>
                <span style={{ fontSize:12, color:'var(--dark)', opacity:0.4, cursor:'pointer', fontFamily:'var(--font-space)' }}>{t.forgot}</span>
              </div>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input"
                style={{ fontSize:14 }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(255,68,68,0.06)', border:'0.5px solid rgba(255,68,68,0.3)', color:'#CC0000', fontSize:13, fontFamily:'var(--font-space)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ padding:'14px', fontSize:14, marginTop:4, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '...' : t.btn}
            </button>

          </form>

          <p style={{ textAlign:'center', marginTop:28, fontSize:13, color:'var(--gray2)', fontFamily:'var(--font-space)' }}>
            {t.noAcc}{' '}
            <Link href="/register" style={{ color:'var(--dark)', fontWeight:700, textDecoration:'none', borderBottom:'1px solid var(--yellow)' }}>{t.reg}</Link>
          </p>

          {/* Mobile: show stat strip */}
          <div className="hide-desktop" style={{ marginTop:48, display:'flex', justifyContent:'center', gap:32 }}>
            {[['12+','Functions'],['20','Tables'],['3','Countries']].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:24, letterSpacing:'-0.04em', color:'var(--dark)', lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:'var(--font-space)', fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray2)', marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
