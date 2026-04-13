'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'en'|'th'>(() => typeof window !== 'undefined' ? (localStorage.getItem('riden_lang') as 'en'|'th' || 'en') : 'en')
  const T = {
    en:{h:'Move Thailand.',sub:'The B2B platform connecting DMCs, operators and drivers seamlessly.',email:'Email',pass:'Password',btn:'Sign in',noAcc:"Don't have an account?",reg:'Register',forgot:'Forgot password?'},
    th:{h:'ขับเคลื่อนไทย.',sub:'แพลตฟอร์ม B2B ที่เชื่อมต่อ DMC ผู้ประกอบการ และคนขับ',email:'อีเมล',pass:'รหัสผ่าน',btn:'เข้าสู่ระบบ',noAcc:'ยังไม่มีบัญชี?',reg:'สมัคร',forgot:'ลืมรหัสผ่าน?'}
  }
  const t = T[lang]
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const {error:err} = await createClient().auth.signInWithPassword({email,password:pass})
    if (err) {setError(err.message);setLoading(false)} else router.push('/dashboard')
  }
  function toggleLang(l: 'en'|'th') { setLang(l); localStorage.setItem('riden_lang',l) }
  return (
    <div className="page-bg" style={{minHeight:'100vh',display:'flex',position:'relative'}}>
      <div className="grid-bg" />
      <div className="anim-fade-in" style={{flex:'0 0 44%',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'48px 52px',borderRight:'1px solid var(--c-border)',background:'linear-gradient(160deg,rgba(25,201,119,0.05) 0%,transparent 60%)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,background:'var(--c-teal)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 20px rgba(25,201,119,0.35)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span style={{fontWeight:800,fontSize:22,letterSpacing:'-0.04em'}}>RIDEN</span>
        </div>
        <div>
          <h1 className="t-display anim-fade-up s1" style={{fontSize:52,marginBottom:16}}>{t.h}</h1>
          <p className="anim-fade-up s2" style={{fontSize:16,color:'var(--c-text2)',lineHeight:1.6,maxWidth:340}}>{t.sub}</p>
          <div className="anim-fade-up s3" style={{display:'flex',gap:40,marginTop:48}}>
            {[['12+','Edge Functions'],['15','DB Tables'],['3','Countries']].map(([n,l])=>(
              <div key={l}><div style={{fontSize:28,fontWeight:800,letterSpacing:'-0.04em',color:'var(--c-teal)'}}>{n}</div><div className="t-label" style={{marginTop:2}}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <Link href="/privacy" style={{fontSize:12,color:'var(--c-text3)',textDecoration:'none'}}>Privacy Policy</Link>
          <span style={{color:'var(--c-border-hi)'}}>·</span>
          <span style={{fontSize:12,color:'var(--c-text3)'}}>© 2026 RIDEN Co., Ltd.</span>
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:48,position:'relative'}}>
        <div style={{position:'absolute',top:32,right:32}}>
          <div className="toggle-pill">
            {(['en','th'] as const).map(l=>(<button key={l} className={`toggle-opt ${lang===l?'on':''}`} onClick={()=>toggleLang(l)}>{l==='en'?'EN':'ไทย'}</button>))}
          </div>
        </div>
        <div className="anim-fade-up" style={{width:'100%',maxWidth:380}}>
          <h2 className="t-heading" style={{fontSize:26,marginBottom:8}}>{lang==='en'?'Welcome back':'ยินดีต้อนรับ'}</h2>
          <p style={{color:'var(--c-text2)',fontSize:14,marginBottom:36}}>{lang==='en'?'Sign in to your DMC portal':'เข้าสู่ระบบพอร์ทัล DMC'}</p>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div><label className="t-label" style={{display:'block',marginBottom:8}}>{t.email}</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="company@example.com" /></div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><label className="t-label">{t.pass}</label><span style={{fontSize:12,color:'var(--c-teal)',cursor:'pointer'}}>{t.forgot}</span></div>
              <input className="input" type="password" value={pass} onChange={e=>setPass(e.target.value)} required placeholder="••••••••" />
            </div>
            {error&&<div style={{padding:'10px 14px',borderRadius:10,background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',color:'var(--c-error)',fontSize:13}}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{width:'100%',padding:'12px',marginTop:8,fontSize:15}}>{loading?'...':t.btn}</button>
          </form>
          <p style={{textAlign:'center',marginTop:28,fontSize:13,color:'var(--c-text2)'}}>{t.noAcc} <Link href="/register" style={{color:'var(--c-teal)',textDecoration:'none',fontWeight:600}}>{t.reg}</Link></p>
        </div>
      </div>
    </div>
  )
}