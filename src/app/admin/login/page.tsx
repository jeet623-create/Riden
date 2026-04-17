'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
type Lang = 'en' | 'th' | 'zh'
const T = {
  en:{title:'RIDEN Admin',sub:'RIDEN Master Control',email:'EMAIL',password:'PASSWORD',signin:'Sign In',error:'Invalid email or password',signing:'Signing in...'},
  th:{title:'RIDEN แอดมิน',sub:'ระบบควบคุมหลัก',email:'อีเมล',password:'รหัสผ่าน',signin:'เข้าสู่ระบบ',error:'อีเมลหรือรหัสผ่านไม่ถูกต้อง',signing:'กำลังเข้าสู่ระบบ...'},
  zh:{title:'RIDEN 管理员',sub:'主控制系统',email:'电子邮件',password:'密码',signin:'登录',error:'邮箱或密码错误',signing:'登录中...'},
}
export default function AdminLoginPage() {
  const router = useRouter()
  const [lang,setLang] = useState<Lang>('en')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [showPass,setShowPass] = useState(false)
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  const t = T[lang]
  useEffect(() => { document.documentElement.setAttribute('data-theme','dark') }, [])
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const sb = createClient()
    const {data,error:authError} = await sb.auth.signInWithPassword({email,password})
    if (authError||!data.user) { setError(t.error); setLoading(false); return }
    const {data:admin} = await sb.from('admin_users').select('id').eq('id',data.user.id).single()
    if (!admin) { await sb.auth.signOut(); setError(t.error); setLoading(false); return }
    router.push('/admin/dashboard')
  }
  return (
    <div className="min-h-screen flex items-center justify-center dot-grid" style={{background:'var(--bg-base)',fontFamily:'var(--font-body)'}}>
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.2}}
        style={{width:420,background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:20,padding:40,position:'relative'}}>
        <div style={{position:'absolute',top:20,right:20,display:'flex',gap:4}}>
          {(['en','th','zh'] as Lang[]).map(l=>(
            <button key={l} onClick={()=>setLang(l)}
              style={{padding:'3px 10px',borderRadius:99,fontSize:11,fontFamily:'var(--font-mono)',cursor:'pointer',border:`1px solid ${lang===l?'var(--teal-20)':'var(--border)'}`,background:lang===l?'var(--teal-10)':'transparent',color:lang===l?'var(--teal)':'var(--text-3)'}}>
              {l==='en'?'EN':l==='th'?'TH':'中文'}
            </button>
          ))}
        </div>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:44,height:44,background:'var(--teal-10)',border:'1px solid var(--teal-20)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div style={{fontFamily:'var(--font-brand)',fontSize:22,color:'var(--text-1)',letterSpacing:4}}>RIDEN</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--teal)',letterSpacing:3,textTransform:'uppercase',marginTop:4}}>MASTER ADMIN</div>
          <div style={{fontSize:13,color:'var(--text-3)',marginTop:4}}>{t.sub}</div>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:2,display:'block',marginBottom:6}}>{t.email}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@riden.me" required
              style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,height:40,padding:'0 12px',fontSize:14,color:'var(--text-1)',outline:'none',transition:'border-color 150ms'}}
              onFocus={e=>e.target.style.borderColor='var(--teal)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          </div>
          <div>
            <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:2,display:'block',marginBottom:6}}>{t.password}</label>
            <div style={{position:'relative'}}>
              <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,height:40,padding:'0 40px 0 12px',fontSize:14,color:'var(--text-1)',outline:'none',transition:'border-color 150ms'}}
                onFocus={e=>e.target.style.borderColor='var(--teal)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-3)'}}>
                {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              style={{background:'var(--red-bg)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 12px',fontSize:12,color:'var(--red)'}}>{error}</motion.div>}
          </AnimatePresence>
          <button type="submit" disabled={loading}
            style={{width:'100%',height:44,background:'var(--teal)',color:'white',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,transition:'all 150ms'}}>
            {loading?t.signing:t.signin}
          </button>
        </form>
      </motion.div>
      <div style={{position:'fixed',bottom:20,fontSize:11,color:'var(--text-3)',fontFamily:'var(--font-mono)'}}>© 2026 RIDEN Co., Ltd.</div>
    </div>
  )
}
