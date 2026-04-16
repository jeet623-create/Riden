'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  function enterDemo() {
    localStorage.setItem('riden_user', JSON.stringify({ email: 'demo@riden.me', name: 'Demo User' }))
    router.push('/admin/dashboard')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    localStorage.setItem('riden_user', JSON.stringify({ email: email || 'demo@riden.me', name: 'Demo User' }))
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL - Dark branding */}
      <div className="hidden lg:flex w-[44%] bg-[#111111] flex-col p-12 relative">
        <div className="flex items-baseline gap-2">
          <span className="text-white font-bold text-base">RIDEN</span>
          <span className="text-white/40 text-[9px] font-mono">ไรเด็น</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-white/30 text-[11px] font-mono uppercase tracking-wider mb-4">
            B2B TOURISM TRANSPORT
          </p>
          <h1 className="text-white text-[52px] font-bold tracking-tight leading-[1.05]">
            Move<br />Thailand.
          </h1>
          <p className="text-white/45 text-sm leading-[1.7] max-w-[320px] mt-4">
            The B2B platform connecting DMCs, operators and drivers — seamlessly.
          </p>
        </div>
        
        <p className="text-white/20 text-[11px]">© 2026 RIDEN Co., Ltd.</p>
      </div>

      {/* RIGHT PANEL - Grid backdrop + form */}
      <div 
        className="flex-1 flex items-center justify-center p-6 lg:p-10 relative"
        style={{
          background: '#0a0a0a',
          backgroundImage: `
            linear-gradient(rgba(29, 158, 117, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(29, 158, 117, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      >
        <div className="w-full max-w-[400px]">
          <h2 className="text-white text-[22px] font-semibold tracking-tight mb-1">
            Welcome back
          </h2>
          <p className="text-white/50 text-[13px] mb-8">
            Sign in to your DMC portal
          </p>

          {/* BIG DEMO BUTTON */}
          <button
            type="button"
            onClick={enterDemo}
            className="w-full h-14 rounded-full text-base font-bold mb-6 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #00d9a3 0%, #00b386 100%)',
              color: '#000',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 217, 163, 0.3)'
            }}
          >
            ENTER DEMO MODE
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-mono">OR SIGN IN</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-[11px] font-mono uppercase tracking-wider mb-2">
                EMAIL ADDRESS
              </label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-12 px-5 rounded-full text-sm outline-none transition-all"
                style={{
                  background: '#1a1a1a',
                  border: '1.5px solid #333',
                  color: '#fff'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#00d9a3'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,217,163,0.15)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#333'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/50 text-[11px] font-mono uppercase tracking-wider">
                  PASSWORD
                </label>
                <button type="button" className="text-[#00d9a3] text-xs hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-5 pr-12 rounded-full text-sm outline-none transition-all"
                  style={{
                    background: '#1a1a1a',
                    border: '1.5px solid #333',
                    color: '#fff'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#00d9a3'
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,217,163,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#333'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full text-sm font-semibold transition-all mt-2"
              style={{
                background: '#222',
                border: '1.5px solid #333',
                color: '#fff',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-white/40 text-xs mt-6">
            Don&apos;t have an account?{' '}
            <button className="text-white font-medium hover:underline">Register</button>
          </p>
        </div>
      </div>
    </div>
  )
}
