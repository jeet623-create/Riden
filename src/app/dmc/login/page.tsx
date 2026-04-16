'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function DMCLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    localStorage.setItem('riden_dmc', JSON.stringify({ email: email || 'demo@dmc.com', name: 'DMC User' }))
    router.push('/dmc/dashboard')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#050505' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#080808' }}>
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d9a3, #00b386)' }}
            >
              <span className="text-black font-bold text-lg">R</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">RIDEN</span>
          </div>
        </div>
        
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Move<br />Thailand.
          </h1>
          <p className="text-white/50 text-sm">Premium transport coordination platform</p>
        </div>
        
        <div className="text-white/30 text-xs">
          © 2024 RIDEN. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div 
        className="flex-1 flex items-center justify-center p-8 relative"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,217,163,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,163,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">DMC Portal</h2>
            <p className="text-white/50 text-sm">Sign in to manage your fleet</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-12 px-4 rounded-full text-sm outline-none transition-all"
                style={{
                  background: '#111',
                  border: '1.5px solid #222',
                  color: '#fff'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#00d9a3'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,217,163,0.15)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#222'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-full text-sm outline-none transition-all"
                  style={{
                    background: '#111',
                    border: '1.5px solid #222',
                    color: '#fff'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#00d9a3'
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,217,163,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#222'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #00d9a3, #00b386)',
                color: '#000',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 20px rgba(0,217,163,0.25)'
              }}
            >
              {loading ? '...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
