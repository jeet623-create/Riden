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
    setLang((localStorage.getItem('riden_lang') as 'en'|'th')||'en')
  }, [])

  const T = {
    en:{ h:'Welcome back', sub:'Sign in to your DMC portal', email:'Email address', pass:'Password',
      btn:'Sign in', noAcc:"Don't have an account?", reg:'Register', forgot:'Forgot password?',
      tagline:'B2B Tourism Transport Coordination · Thailand' },
    th:{ h:'ยินดีต้อนรับ', sub:'เข้าสู่ระบบพอร์ทัล DMC',
      email:'อีเมล', pass:'รหัสผ่าน',
      btn:'เข้าสู่ระบบ', noAcc:'ยังไม่มีบัญชี?',
      reg:'สมัคร', forgot:'ลืมรหัสผ่าน?',
      tagline:'B2B ประเทศไทย' },
  }
  const t = T[lang]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    // Mock login - skip Supabase for demo
    await new Promise(resolve => setTimeout(resolve, 500))
    localStorage.setItem('riden_user', JSON.stringify({ email: email || 'demo@riden.me', name: 'Demo User' }))
    router.push('/dashboard')
  }
  
  function skipLogin() {
    localStorage.setItem('riden_user', JSON.stringify({ email: 'demo@riden.me', name: 'Demo User' }))
    router.push('/dashboard')
  }
  function switchLang(l:'en'|'th') { setLang(l); localStorage.setItem('riden_lang',l) }

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>

      {/* Left panel */}
      <div style={{flex:'0 0 44%',background:'#111',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'40px 48px'}}>
        <div style={{display:'flex',alignItems:'baseline',gap:5}}>
          <span style={{fontWeight:700,fontSize:16,letterSpacing:'-0.4px',color:'#fff'}}>RIDEN</span>
          <span style={{fontWeight:400,fontSize:9,letterSpacing:'1px',color:'rgba(255,255,255,0.4)'}}>ไรเด็น</span>
        </div>
        <div>
          <div style={{fontSize:11,fontFamily:'var(--font-mono)',letterSpacing:'0.1em',color:'rgba(255,255,255,0.3)',marginBottom:16,textTransform:'uppercase' as const}}>{t.tagline}</div>
          <h1 style={{fontSize:52,fontWeight:700,letterSpacing:'-1px',lineHeight:1.05,color:'#fff',marginBottom:16}}>Move<br/>Thailand.</h1>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.45)',lineHeight:1.7,maxWidth:320}}>The B2B platform connecting DMCs, operators and drivers — seamlessly.</p>
        </div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.2)'}}>&copy; 2026 RIDEN Co., Ltd.</div>
      </div>

      {/* Right form */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,position:'relative'}}>
        <div style={{position:'absolute',top:24,right:24,display:'flex',gap:4}}>
          {(['en','th'] as const).map(l=>(
            <button key={l} onClick={()=>switchLang(l)} style={{padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:500,border:'0.5px solid var(--border)',background:lang===l?'#111':'transparent',color:lang===l?'#fff':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)'}}>
              {l==='en'?'EN':'TH'}
            </button>
          ))}
        </div>
        <div style={{width:'100%',maxWidth:380}}>
          <h2 style={{fontSize:22,fontWeight:600,letterSpacing:'-0.3px',color:'var(--text-primary)',marginBottom:4}}>{t.h}</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginBottom:28}}>{t.sub}</p>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:500,letterSpacing:'0.06em',textTransform:'uppercase' as const,color:'var(--text-tertiary)',marginBottom:6}}>{t.email}</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com" className="riden-input" />
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <label style={{fontSize:11,fontWeight:500,letterSpacing:'0.06em',textTransform:'uppercase' as const,color:'var(--text-tertiary)'}}>{t.pass}</label>
                <span style={{fontSize:12,color:'var(--accent)',cursor:'pointer'}}>{t.forgot}</span>
              </div>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required placeholder="••••••••" className="riden-input" />
            </div>
            {error&&<div style={{padding:'9px 12px',borderRadius:7,background:'rgba(239,68,68,0.06)',border:'0.5px solid rgba(239,68,68,0.2)',color:'var(--danger)',fontSize:12}}>{error}</div>}
            
            {/* Skip Login Button - DEMO MODE */}
            <button 
              type="button"
              onClick={skipLogin}
              style={{
                width:'100%',
                padding:'14px',
                marginTop:8,
                borderRadius:10,
                border:'none',
                background:'#00d9a3',
                color:'#000',
                fontSize:15,
                fontWeight:700,
                cursor:'pointer'
              }}
            >
              SKIP LOGIN - ENTER DEMO
            </button>

            <div style={{display:'flex',alignItems:'center',gap:12,margin:'16px 0'}}>
              <div style={{flex:1,height:1,background:'var(--border)'}}></div>
              <span style={{fontSize:11,color:'var(--text-tertiary)'}}>OR</span>
              <div style={{flex:1,height:1,background:'var(--border)'}}></div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'11px',fontSize:14,opacity:loading?0.6:1}}>
              {loading?'...':t.btn}
            </button>
          </form>
          <p style={{textAlign:'center' as const,marginTop:20,fontSize:12,color:'var(--text-tertiary)'}}>
            {t.noAcc}{' '}<Link href="/register" style={{color:'var(--text-primary)',fontWeight:500,textDecoration:'none'}}>{t.reg}</Link>
          </p>
          <div style={{marginTop:28,paddingTop:20,borderTop:'0.5px solid var(--border)',textAlign:'center' as const}}>
            <Link href="/privacy" style={{fontSize:11,color:'var(--text-tertiary)',textDecoration:'none'}}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
