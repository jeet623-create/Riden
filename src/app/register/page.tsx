'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { toast.error(authError.message); setLoading(false); return }

    if (authData.user) {
      const { error: dbError } = await supabase.from('dmc_users').insert({
        id: authData.user.id,
        company_name: companyName,
        email,
        country,
        subscription_plan: 'trial',
        subscription_status: 'active',
      })
      if (dbError) { toast.error('Account created but profile setup failed. Contact support.'); }
    }

    toast.success('Account created! You have 60 days free trial.')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-riden-black flex items-center justify-center relative overflow-hidden py-10">
      <div className="absolute inset-0 bg-grid-pattern opacity-100" />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-riden-teal/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-8 stagger">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-riden-teal rounded-xl flex items-center justify-center shadow-teal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <path d="M15 19l2 2 4-4"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
              </svg>
            </div>
            <span className="font-display text-2xl font-800 text-riden-white tracking-wider">RIDEN</span><span className="text-riden-muted text-xs ml-1 font-400 tracking-widest">ไรเด็น</span>
          </div>
          <h1 className="font-display text-3xl font-700 text-riden-white mb-2">Create account</h1>
          <p className="text-riden-text text-sm">60 days free trial â no credit card needed</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-card stagger">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Company Name *</label>
              <input className="riden-input" placeholder="e.g. Bangkok Travel Co." value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Email Address *</label>
              <input type="email" className="riden-input" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Country</label>
              <input className="riden-input" placeholder="e.g. Thailand" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
            <div>
              <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">Password *</label>
              <input type="password" className="riden-input" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <div className="glass rounded-xl p-4 mt-2">
              <p className="text-riden-text text-xs">ð Free Trial includes:</p>
              <ul className="mt-2 space-y-1">
                {['60 days free', '30 bookings included', 'Full LINE bot automation', 'Live driver tracking'].map(item => (
                  <li key={item} className="text-riden-teal text-xs flex items-center gap-2">
                    <span>â</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create Free Account â'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-riden-border text-center">
            <p className="text-riden-text text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-riden-teal hover:text-riden-teal-light font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-riden-muted text-xs mt-8 font-mono">à¹à¸£à¹à¸à¹à¸ â Where Gears Meet Green</p>
      </div>
      <p className="text-center mt-3"><Link href="/privacy" className="text-riden-muted text-xs hover:text-riden-teal transition-colors">Privacy Policy</Link><span className="text-riden-border mx-2">·</span><span className="text-riden-muted text-xs">Thailand PDPA</span></p>
    </div>
  )
}
