'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ company:'', contact:'', email:'', phone:'', country:'Thailand', password:'' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const sb = createClient()
    const { data, error } = await sb.auth.signUp({ email:form.email, password:form.password })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.user) {
      await sb.from('dmc_users').insert({ id:data.user.id, company_name:form.company, contact_person:form.contact, email:form.email, phone:form.phone, country:form.country, subscription_plan:'free', subscription_status:'trial', trial_ends_at:new Date(Date.now()+60*24*60*60*1000).toISOString() })
    }
    toast.success('Account created! Please check your email to verify.')
    router.push('/dashboard')
  }

  const FIELDS = [
    {k:'company',l:'Company name',t:'text',p:'Amazing Thailand Tours'},
    {k:'contact',l:'Contact person',t:'text',p:'Your full name'},
    {k:'email',l:'Email address',t:'email',p:'you@company.com'},
    {k:'phone',l:'Phone number',t:'tel',p:'+66 89 123 4567'},
    {k:'country',l:'Country',t:'text',p:'Thailand'},
    {k:'password',l:'Password',t:'password',p:'••••••••'},
  ] as const

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
      <div style={{flex:'0 0 44%',background:'#111',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'40px 48px'}}>
        <div style={{display:'flex',alignItems:'baseline',gap:5}}>
          <span style={{fontWeight:700,fontSize:16,letterSpacing:'-0.4px',color:'#fff'}}>RIDEN</span>
          <span style={{fontWeight:400,fontSize:9,letterSpacing:'1px',color:'rgba(255,255,255,0.4)'}}>ไรเด็น</span>
        </div>
        <div>
          <h1 style={{fontSize:48,fontWeight:700,letterSpacing:'-1px',lineHeight:1.05,color:'#fff',marginBottom:16}}>Join RIDEN.</h1>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.45)',lineHeight:1.7,maxWidth:300}}>Start your 60-day free trial. No credit card required.</p>
          <div style={{marginTop:32,display:'flex',flexDirection:'column' as const,gap:10}}>
            {['60 days free trial','No credit card needed','Cancel anytime'].map(f=>(
              <div key={f} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'rgba(255,255,255,0.5)'}}>
                <div style={{width:4,height:4,background:'var(--accent)',borderRadius:'50%'}}/>{f}
              </div>
            ))}
          </div>
        </div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.2)'}}>&copy; 2026 RIDEN Co., Ltd.</div>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
        <div style={{width:'100%',maxWidth:400}}>
          <h2 style={{fontSize:22,fontWeight:600,letterSpacing:'-0.3px',color:'var(--text-primary)',marginBottom:4}}>Create account</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginBottom:24}}>Fill in your details to get started</p>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column' as const,gap:12}}>
            {FIELDS.map(f=>(
              <div key={f.k}>
                <label style={{display:'block',fontSize:11,fontWeight:500,letterSpacing:'0.06em',textTransform:'uppercase' as const,color:'var(--text-tertiary)',marginBottom:5}}>{f.l}</label>
                <input type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} required placeholder={f.p} className="riden-input" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'11px',fontSize:14,marginTop:4,opacity:loading?0.6:1}}>
              {loading?'Creating account...':'Create account'}
            </button>
          </form>
          <p style={{textAlign:'center' as const,marginTop:16,fontSize:12,color:'var(--text-tertiary)'}}>
            Already have an account?{' '}<Link href="/login" style={{color:'var(--text-primary)',fontWeight:500,textDecoration:'none'}}>Sign in</Link>
          </p>
          <div style={{marginTop:20,paddingTop:16,borderTop:'0.5px solid var(--border)',textAlign:'center' as const}}>
            <Link href="/privacy" style={{fontSize:11,color:'var(--text-tertiary)',textDecoration:'none'}}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
