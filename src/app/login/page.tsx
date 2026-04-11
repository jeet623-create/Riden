'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-riden-black flex items-center justify-center relative overflow-hidden">

      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-riden-teal/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-riden-teal/3 rounded-full blur-[100px]" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-riden-teal rounded-full animate-pulse-teal" />
      <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-riden-teal/60 rounded-full animate-pulse-teal" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-riden-teal/40 rounded-full animate-pulse-teal" style={{animationDelay: '2s'}} />

      <div className="w-full max-w-md px-6 relative z-10">

        {/* Logo */}
        <div className="text-center mb-10 stagger">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-riden-teal rounded-xl flex items-center justify-center shadow-teal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <path d="M15 19l2 2 4-4"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
              </svg>
            </div>
            <span className="font-display text-2xl font-800 text-riden-white tracking-wider">RIDEN</span>
          </div>
          <h1 className="font-display text-3xl font-700 text-riden-white mb-2">
            Welcome back
          </h1>
          <p className="text-riden-text text-sm">Sign in to your DMC portal</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-card stagger">
          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="riden-input"
                placeholder="your@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-riden-text text-xs font-mono uppercase tracking-widest">
                  Password
                </label>
                <Link href="/forgot-password" className="text-riden-teal text-xs hover:text-riden-teal-light transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className="riden-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-riden-border text-center">
            <p className="text-riden-text text-sm">
              New to RIDEN?{' '}
              <Link href="/register" className="text-riden-teal hover:text-riden-teal-light font-medium transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-riden-muted text-xs mt-8 font-mono">
          ไรเด็น — Where Gears Meet Green
        </p>
      </div>
    </div>
  )
}
