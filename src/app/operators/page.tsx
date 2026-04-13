'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Operator = { id:string; company_name:string; contact_name:string|null; phone:string|null; email:string|null; base_location:string|null; status:string; is_verified:boolean; line_user_id:string|null; total_trips:number; rating:number|null }

const TEAL = '#19C977'

export default function DMCOperatorsPage() {
  const router = useRouter()
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const F = "'Inter',-apple-system,sans-serif"
  const FM = "'JetBrains Mono',monospace"
  const BG = '#07100D', S2 = '#111F15', S3 = '#16271A'
  const BORDER = 'rgba(255,255,255,0.08)', BORDER_HI = 'rgba(255,255,255,0.14)'
  const TEXT = '#EDF5F0', TEXT2 = '#7A9A87', TEXT3 = '#3D5C47'

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await createClient().from('operators').select('*').order('company_name')
    setOperators(data ?? []); setLoading(false)
  }

  async function toggleStatus(op: Operator) {
    const next = op.status === 'active' ? 'inactive' : 'active'
    await createClient().from('operators').update({ status: next }).eq('id', op.id)
    toast.success(`${op.company_name} ${next === 'active' ? 'activated' : 'deactivated'}`)
    load()
  }

  const filtered = operators.filter(o => !search || o.company_name?.toLowerCase().includes(search.toLowerCase()) || o.base_location?.toLowerCase().includes(search.toLowerCase()))
  const active = operators.filter(o => o.status === 'active').length
  const inactive = operators.filter(o => o.status !== 'active').length

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:F, WebkitFontSmoothing:'antialiased' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');input::placeholder{color:${TEXT3}};`}</style>

      <nav style={{ borderBottom:`1px solid ${BORDER}`, background:'rgba(7,16,13,0.9)', backdropFilter:'blur(20px)', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link href="/dashboard" style={{ color:TEXT2, textDecoration:'none', fontSize:13 }}>← Dashboard</Link>
          <span style={{ color:BORDER_HI }}>|</span>
          <span style={{ fontWeight:700, fontSize:15, color:TEXT }}>My Operators</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:12, color:TEXT2 }}><span style={{ color:TEAL, fontWeight:700 }}>{active}</span> active</span>
          <span style={{ fontSize:12, color:TEXT3 }}>{inactive} inactive</span>
        </div>
      </nav>

      <main style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color:TEXT, marginBottom:4 }}>Transport Operators</h1>
            <p style={{ fontSize:13, color:TEXT2 }}>Activate or deactivate operators. Active operators receive job notifications via LINE.</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:20 }}>
          <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:TEXT3 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input style={{ width:'100%', background:S3, border:`1px solid ${BORDER}`, borderRadius:10, color:TEXT, fontFamily:F, fontSize:14, padding:'10px 14px 10px 38px', outline:'none', boxSizing:'border-box' as const }} placeholder="Search operators..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:TEXT2 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:48 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🚗</div>
            <p style={{ color:TEXT, fontWeight:600, marginBottom:4 }}>No operators yet</p>
            <p style={{ color:TEXT2, fontSize:13 }}>Operators are added by RIDEN admin. Contact support to add operators.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(op => (
              <div key={op.id} style={{ background:S2, border:`1px solid ${op.status === 'active' ? BORDER_HI : BORDER}`, borderRadius:16, padding:'18px 20px', display:'flex', alignItems:'center', gap:16, transition:'all 0.15s', opacity: op.status === 'active' ? 1 : 0.65 }}>
                {/* Avatar */}
                <div style={{ width:44, height:44, borderRadius:12, background: op.status === 'active' ? 'rgba(25,201,119,0.12)' : S3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color: op.status === 'active' ? TEAL : TEXT3, flexShrink:0 }}>
                  {op.company_name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:3 }}>
                    <span style={{ fontWeight:700, fontSize:15, color:TEXT }}>{op.company_name}</span>
                    {op.is_verified && <span style={{ fontSize:10, background:'rgba(25,201,119,0.12)', color:TEAL, padding:'2px 7px', borderRadius:100, fontFamily:FM }}>VERIFIED</span>}
                    {op.line_user_id && <span style={{ fontSize:10, background:'rgba(96,165,250,0.1)', color:'#60A5FA', padding:'2px 7px', borderRadius:100, fontFamily:FM }}>📱 LINE</span>}
                  </div>
                  <div style={{ display:'flex', gap:16, fontSize:12, color:TEXT2 }}>
                    {op.base_location && <span>📍 {op.base_location}</span>}
                    {op.phone && <span>📞 {op.phone}</span>}
                    <span>🚗 {op.total_trips || 0} trips</span>
                    {op.rating && <span>★ {Number(op.rating).toFixed(1)}</span>}
                  </div>
                </div>

                {/* Status + toggle */}
                <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                  <span style={{ fontSize:11, fontFamily:FM, padding:'3px 9px', borderRadius:100, background: op.status === 'active' ? 'rgba(25,201,119,0.1)' : 'rgba(122,154,135,0.1)', color: op.status === 'active' ? TEAL : TEXT3, border:`1px solid ${op.status === 'active' ? 'rgba(25,201,119,0.2)' : BORDER}` }}>
                    {op.status.toUpperCase()}
                  </span>
                  <div onClick={()=>toggleStatus(op)} style={{ width:44, height:24, borderRadius:100, background: op.status === 'active' ? TEAL : S3, border:`1px solid ${op.status === 'active' ? TEAL : BORDER_HI}`, cursor:'pointer', position:'relative', transition:'all 0.2s', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:2, left: op.status === 'active' ? 22 : 2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop:24, padding:'16px 20px', background:S2, border:`1px solid ${BORDER}`, borderRadius:14 }}>
          <p style={{ fontSize:13, color:TEXT2, margin:0 }}>ℹ️ <strong style={{ color:TEXT }}>Active operators</strong> receive new booking notifications via LINE. <strong style={{ color:TEXT }}>Inactive operators</strong> are hidden from booking dispatch but remain in the system.</p>
        </div>
      </main>
    </div>
  )
}