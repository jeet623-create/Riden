'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const COUNTRIES = ['Thailand','China','South Korea','Japan','India','Singapore','Malaysia','Indonesia','UAE','Turkey','USA','UK','Australia','Germany','France','Other']
const D = '#1A1A1A', Y = '#D4E827'

export default function RegisterPage() {
  const router = useRouter()
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [country, setCountry] = useState('Thailand')
  const [lang, setLang] = useState('en')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const client = createClient()
    const { data: authData, error: authErr } = await client.auth.signUp({ email, password: pass })
    if (authErr) { setError(authErr.message); setLoading(false); return }
    if (authData.user) {
      const trialEnd = new Date(); trialEnd.setDate(trialEnd.getDate() + 60)
      await client.from('dmc_users').insert({ id: authData.user.id, company_name: company, email, country, language_preference: lang, subscription_plan: 'trial', subscription_status: 'trial', trial_ends_at: trialEnd.toISOString(), is_active: true })
    }
    router.push('/dashboard')
  }

  const inp: React.CSSProperties = { width:'100%', background:'#fff', border:'0.5px solid #E8E8E8', borderRadius:8, color:D, fontFamily:'var(--font-space)', fontSize:14, padding:'11px 14px', outline:'none', boxSizing:'border-box' as const }
  const lbl: React.CSSProperties = { display:'block', fontFamily:'var(--font-space)', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#555', marginBottom:7 }

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:'var(--font-space)' }}>
      <style>{'' +
        '.reg-layout{display:flex;flex-direction:column;min-height:100vh}' +
        '@media(min-width:900px){.reg-layout{flex-direction:row}.reg-left{flex:0 0 44%;min-height:100vh}.reg-right{flex:1}}' +
        '@media(max-width:600px){.reg-2col{grid-template-columns:1fr!important}}' +
        '' }</style>

      <div className="reg-layout">
        <div className="reg-left" style={{ background:Y, padding:'clamp(28px,5vw,52px)', display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:260 }}>
          <div style={{ display:'inline-flex', alignItems:'baseline', gap:5 }}>
            <span style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:20, letterSpacing:'-0.05em', color:D }}>RIDEN</span>
            <span style={{ fontFamily:'var(--font-space)', fontWeight:500, fontSize:10, letterSpacing:'0.05em', opacity:0.55, color:D }}>ไรเด็น</span>
          </div>
          <div>
            <h1 style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'clamp(32px,4.5vw,60px)', letterSpacing:'-0.04em', lineHeight:0.95, color:D, marginBottom:16 }}>
              {lang==='th' ? 'เริ่มขับเคลื่อนไทย.' : 'Start moving Thailand.'}
            </h1>
            <p style={{ fontSize:15, color:D, opacity:0.55, marginBottom:28, lineHeight:1.65, maxWidth:340 }}>
              {lang==='th' ? 'เข้าร่วมแพลตฟอร์ม B2B ที่ DMC ใช้ทั่วไทย' : 'The B2B platform trusted by DMCs across Thailand.'}
            </p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:D, color:Y, padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:700, fontFamily:'var(--font-syne)' }}>
              ✓ {lang==='th' ? 'ทดลอง 60 วัน ไม่ต้องใช้บัตรเครดิต' : '60 days free — no credit card needed'}
            </div>
          </div>
          <div style={{ display:'flex', gap:16 }}>
            <Link href="/privacy" style={{ fontSize:11, color:D, opacity:0.4, textDecoration:'none' }}>Privacy Policy</Link>
            <span style={{ fontSize:11, color:D, opacity:0.4 }}>© 2026 RIDEN</span>
          </div>
        </div>

        <div className="reg-right" style={{ background:'#fff', padding:'clamp(28px,5vw,52px)', display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:32 }}>
            <div style={{ display:'inline-flex', background:'#F5F5F5', border:'0.5px solid #E8E8E8', borderRadius:20, padding:2 }}>
              {['en','th'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding:'5px 14px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', border:'none', background: lang===l ? D : 'transparent', color: lang===l ? Y : '#888', fontFamily:'var(--font-syne)', transition:'all 150ms' }}>
                  {l==='en' ? 'EN' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxWidth:440 }}>
            <h2 style={{ fontFamily:'var(--font-syne)', fontWeight:700, fontSize:26, letterSpacing:'-0.03em', color:D, marginBottom:6 }}>Create your account</h2>
            <p style={{ fontSize:13, color:'#888', marginBottom:32 }}>DMC portal — free 60-day trial</p>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div><label style={lbl}>{lang==='th'?'ชื่อบริษัท':'Company name'}</label><input style={inp} value={company} onChange={e=>setCompany(e.target.value)} required placeholder="Amazing Thailand Tours" autoComplete="organization"/></div>
              <div><label style={lbl}>{lang==='th'?'อีเมล':'Email address'}</label><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com" autoComplete="email"/></div>
              <div><label style={lbl}>{lang==='th'?'รหัสผ่าน (อย่างน้อย 8 ตัว)':'Password (min 8 chars)'}</label><input style={inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} required minLength={8} placeholder="••••••••" autoComplete="new-password"/></div>
              <div className="reg-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={lbl}>{lang==='th'?'ประเทศ':'Country'}</label><select style={{ ...inp, cursor:'pointer' }} value={country} onChange={e=>setCountry(e.target.value)}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label style={lbl}>Language</label><select style={{ ...inp, cursor:'pointer' }} value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="th">ไทย</option></select></div>
              </div>
              {error && <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(204,0,0,0.05)', border:'0.5px solid rgba(204,0,0,0.3)', color:'#CC0000', fontSize:13 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ width:'100%', padding:14, background:loading?'#333':D, color:Y, border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'var(--font-syne)', transition:'background 150ms', marginTop:4, opacity:loading?0.7:1 }}>
                {loading ? '...' : (lang==='th'?'สร้างบัญชี':'Create account')}
              </button>
            </form>
            <p style={{ textAlign:'center', marginTop:24, fontSize:13, color:'#888' }}>
              {lang==='th'?'มีบัญชีอยู่แล้ว?':'Already have an account?'}{' '}
              <Link href="/login" style={{ color:D, fontWeight:700, textDecoration:'none', borderBottom:'1px solid '+Y }}>{lang==='th'?'เข้าสู่ระบบ':'Sign in'}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
