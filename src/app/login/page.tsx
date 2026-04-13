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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLang((localStorage.getItem('riden_lang') as 'en'|'th') || 'en')
  }, [])

  const T = {
    en: { h:'Move Thailand.', sub:'The B2B platform connecting DMCs, operators and drivers — seamlessly.', email:'Email address', pass:'Password', btn:'Sign in', noAcc:"Don't have an account?", reg:'Register', forgot:'Forgot password?', welcome:'Welcome back', portal:'Sign in to your DMC portal' },
    th: { h:'ขับเคลื่อนไทย.', sub:'แพลตฟอร์ม B2B เชื่อมต่อ DMC ผู้ประกอบการ และคนขับ', email:'อีเมล', pass:'รหัสผ่าน', btn:'เข้าสู่ระบบ', noAcc:'ยังไม่มีบัญชี?', reg:'สมัคร', forgot:'ลืมรหัสผ่าน?', welcome:'ยินดีต้อนรับ', portal:'เข้าสู่ระบบพอร์ทัล DMC' }
  }
  const t = T[lang]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const { error: err } = await createClient().auth.signInWithPassword({ email, password: pass })
    if (err) { setError(err.message); setLoading(false) } else router.push('/dashboard')
  }

  function switchLang(l: 'en'|'th') { setLang(l); localStorage.setItem('riden_lang', l) }

  const TEAL = '#19C977'
  const BG = '#07100D'
  const S2 = '#111F15'
  const S3 = '#16271A'
  const BORDER = 'rgba(255,255,255,0.08)'
  const TEXT = '#EDF5F0'
  const TEXT2 = '#7A9A87'
  const TEXT3 = '#3D5C47'

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:BG, fontFamily:"'Inter',-apple-system,sans-serif", WebkitFontSmoothing:'antialiased' }}>
      {/* Ambient glow */}
      <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, pointerEvents:'none', background:'radial-gradient(ellipse 60% 40% at 30% 50%, rgba(25,201,119,0.07) 0%, transparent 60%)' }} />

      {/* ── Left brand panel ── */}
      <div style={{ flex:'0 0 42%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'44px 48px', borderRight:`1px solid ${BORDER}`, background:'linear-gradient(160deg, rgba(25,201,119,0.04) 0%, transparent 50%)', position:'relative' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:TEAL, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 24px rgba(25,201,119,0.4), 0 0 0 1px rgba(25,201,119,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span style={{ fontWeight:800, fontSize:20, letterSpacing:'-0.04em', color:TEXT }}>RIDEN</span>
        </div>

        {/* Main content */}
        <div>
          <div style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.12em', textTransform:'uppercase', color:TEAL, marginBottom:20, opacity:0.8 }}>B2B Tourism Transport · Thailand</div>
          <h1 style={{ fontSize:58, fontWeight:900, letterSpacing:'-0.05em', lineHeight:1.0, color:TEXT, marginBottom:20 }}>{t.h}</h1>
          <p style={{ fontSize:16, color:TEXT2, lineHeight:1.65, maxWidth:340, marginBottom:48 }}>{t.sub}</p>

          {/* Stats row */}
          <div style={{ display:'flex', gap:36 }}>
            {[['12+','Edge Functions'],['15','DB Tables'],['3','Countries']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize:30, fontWeight:800, letterSpacing:'-0.04em', color:TEAL, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', color:TEXT3, marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Link href="/privacy" style={{ fontSize:12, color:TEXT3, textDecoration:'none' }}>Privacy Policy</Link>
          <span style={{ color:BORDER }}>·</span>
          <span style={{ fontSize:12, color:TEXT3 }}>© 2026 RIDEN Co., Ltd.</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:48, position:'relative' }}>
        {/* Lang toggle — top right */}
        <div style={{ position:'absolute', top:28, right:32 }}>
          <div style={{ display:'inline-flex', background:S3, border:`1px solid ${BORDER}`, borderRadius:100, padding:3, gap:2 }}>
            {(['en','th'] as const).map(l => (
              <button key={l} onClick={() => switchLang(l)} style={{ padding:'5px 14px', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.15s', background: lang===l ? TEAL : 'transparent', color: lang===l ? '#fff' : TEXT2, boxShadow: lang===l ? '0 1px 4px rgba(25,201,119,0.4)' : 'none', fontFamily:'inherit' }}>
                {l === 'en' ? 'EN' : 'ไทย'}
              </button>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div style={{ width:'100%', maxWidth:400, background:S2, border:`1px solid ${BORDER}`, borderRadius:20, padding:'40px 36px', boxShadow:'0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}>
          <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.03em', color:TEXT, marginBottom:6 }}>{t.welcome}</h2>
          <p style={{ fontSize:14, color:TEXT2, marginBottom:32 }}>{t.portal}</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', color:TEXT3, marginBottom:8 }}>{t.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="company@example.com" style={{ width:'100%', background:S3, border:`1px solid ${BORDER}`, borderRadius:10, color:TEXT, fontSize:14, padding:'11px 14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor=TEAL, e.target.style.boxShadow='0 0 0 3px rgba(25,201,119,0.12)')}
                onBlur={e => (e.target.style.borderColor=BORDER, e.target.style.boxShadow='none')} />
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', color:TEXT3 }}>{t.pass}</label>
                <span style={{ fontSize:12, color:TEAL, cursor:'pointer' }}>{t.forgot}</span>
              </div>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="••••••••" style={{ width:'100%', background:S3, border:`1px solid ${BORDER}`, borderRadius:10, color:TEXT, fontSize:14, padding:'11px 14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor=TEAL, e.target.style.boxShadow='0 0 0 3px rgba(25,201,119,0.12)')}
                onBlur={e => (e.target.style.borderColor=BORDER, e.target.style.boxShadow='none')} />
            </div>
            {error && <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#F87171', fontSize:13 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', background:loading?'#148f55':TEAL, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', marginTop:4, transition:'all 0.15s', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(25,201,119,0.3)', letterSpacing:'-0.01em' }}
              onMouseEnter={e => { if(!loading)(e.currentTarget.style.background='#20D980', e.currentTarget.style.transform='translateY(-1px)', e.currentTarget.style.boxShadow='0 8px 24px rgba(25,201,119,0.4)') }}
              onMouseLeave={e => { if(!loading)(e.currentTarget.style.background=TEAL, e.currentTarget.style.transform='', e.currentTarget.style.boxShadow='0 4px 16px rgba(25,201,119,0.3)') }}>
              {loading ? '...' : t.btn}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, fontSize:13, color:TEXT2 }}>
            {t.noAcc}{' '}
            <Link href="/register" style={{ color:TEAL, textDecoration:'none', fontWeight:700 }}>{t.reg}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}