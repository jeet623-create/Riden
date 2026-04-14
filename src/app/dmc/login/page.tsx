'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/functions/v1';
export default function DMCLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function handleLogin() {
    if (!email || !password) { setError('Enter email and password'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(SUPA + '/dmc-auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.ok) { localStorage.setItem('dmc_id', data.dmc_id); localStorage.setItem('dmc_company', data.company_name); router.push('/dmc/dashboard'); }
      else setError(data.error || 'Login failed');
    } catch { setError('Connection error'); }
    setLoading(false);
  }
  return (
    <div style={{minHeight:'100vh',background:'#07100D',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:16,padding:40,width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:36}}>&#x1F697;</div>
          <div style={{fontSize:28,fontWeight:800,color:'#19C977'}}>RIDEN</div>
          <div style={{fontSize:14,color:'#7aab94'}}>DMC Portal</div>
        </div>
        {error && <div style={{background:'#2a0f0f',border:'1px solid #ff6b6b',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#ff6b6b'}}>{error}</div>}
        <div style={{fontSize:12,color:'#7aab94',marginBottom:4}}>Email</div>
        <input style={{width:'100%',background:'#0a1a15',border:'1px solid #1a3028',borderRadius:8,padding:'12px 14px',color:'#e8f5f0',fontSize:15,boxSizing:'border-box' as const,marginBottom:12}} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e=>e.key==='Enter'&&handleLogin()} />
        <div style={{fontSize:12,color:'#7aab94',marginBottom:4}}>Password</div>
        <input style={{width:'100%',background:'#0a1a15',border:'1px solid #1a3028',borderRadius:8,padding:'12px 14px',color:'#e8f5f0',fontSize:15,boxSizing:'border-box' as const,marginBottom:12}} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" onKeyDown={e=>e.key==='Enter'&&handleLogin()} />
        <button style={{width:'100%',background:'#19C977',color:'#07100D',border:'none',borderRadius:8,padding:14,fontWeight:700,fontSize:16,cursor:'pointer',opacity:loading?0.6:1}} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div style={{textAlign:'center',marginTop:20,fontSize:12,color:'#7aab94'}}>Contact RIDEN support to register.</div>
      </div>
    </div>
  );
}