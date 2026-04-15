'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

type Operator = { id:string; company_name:string; phone:string|null; base_location:string|null; status:string; is_verified:boolean; line_user_id:string|null; total_trips:number; riden_id:string|null }

export default function DMCOperatorsPage() {
  const router = useRouter()
  const [operators, setOperators] = useState<Operator[]>([])
  const [preferred, setPreferred] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])
  async function load() {
    const sb = createClient()
    const { data:{ user } } = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }
    const [{ data:ops }, { data:dmc }] = await Promise.all([
      sb.from('operators').select('*').order('company_name'),
      sb.from('dmc_users').select('preferred_operator_ids').eq('id', user.id).single()
    ])
    setOperators(ops??[])
    setPreferred(dmc?.preferred_operator_ids??[])
    setLoading(false)
  }
  async function togglePreferred(opId:string) {
    const sb = createClient()
    const { data:{ user } } = await sb.auth.getUser()
    if (!user) return
    const isPref = preferred.includes(opId)
    const next = isPref ? preferred.filter(id=>id!==opId) : [...preferred, opId]
    await sb.from('dmc_users').update({ preferred_operator_ids:next }).eq('id', user.id)
    setPreferred(next)
    const op = operators.find(o=>o.id===opId)
    toast.success(isPref ? 'Removed from preferred' : (op?.company_name||'')+' added to preferred')
  }

  const filtered = operators.filter(o=>!search||o.company_name?.toLowerCase().includes(search.toLowerCase())||o.base_location?.toLowerCase().includes(search.toLowerCase()))
  const sorted = [...filtered.filter(o=>preferred.includes(o.id)), ...filtered.filter(o=>!preferred.includes(o.id))]

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
      <nav style={{background:'var(--bg-page)',borderBottom:'0.5px solid var(--border)',height:52,display:'flex',alignItems:'center',position:'sticky' as const,top:0,zIndex:50}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <a href="/dashboard" style={{color:'var(--text-tertiary)',textDecoration:'none',display:'flex'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
            <div style={{width:'0.5px',height:16,background:'var(--border)'}}/>
            <a href="/dashboard" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
              <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
            </a>
            <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Operators</span>
          </div>
          <div style={{fontSize:12,color:'var(--warning)',fontWeight:500}}>{preferred.length} preferred</div>
        </div>
      </nav>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px'}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',marginBottom:4}}>Transport Operators</h1>
          <p style={{fontSize:12,color:'var(--text-tertiary)'}}>Star operators as preferred — they appear first when dispatching bookings.</p>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search operators..." className="riden-input" style={{marginBottom:16,padding:'8px 12px'}}/>
        {loading ? (
          <div style={{padding:40,textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>
        ) : sorted.length === 0 ? (
          <div style={{padding:40,textAlign:'center' as const}}>
            <p style={{fontWeight:500,fontSize:15,marginBottom:4}}>No operators yet</p>
            <p style={{fontSize:12,color:'var(--text-tertiary)'}}>Operators register via the RIDEN LINE bot.</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
            {sorted.map(op => {
              const isPref = preferred.includes(op.id)
              return (
                <div key={op.id} className="riden-card" style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:14,opacity:op.status==='active'?1:0.6,borderColor:isPref?'var(--warning)':'var(--border)'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:isPref?'rgba(245,158,11,0.08)':'var(--bg-page)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:isPref?'var(--warning)':'var(--text-primary)',flexShrink:0,fontFamily:'var(--font-sans)'}}>
                    {op.company_name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2,flexWrap:'wrap' as const}}>
                      <span style={{fontWeight:500,fontSize:14,color:'var(--text-primary)'}}>{op.company_name}</span>
                      {isPref && <span className="badge badge-warning" style={{fontSize:9,padding:'1px 6px'}}>PREFERRED</span>}
                      {op.is_verified && <span className="badge badge-progress" style={{fontSize:9,padding:'1px 6px'}}>VERIFIED</span>}
                    </div>
                    <div style={{display:'flex',gap:12,fontSize:12,color:'var(--text-secondary)',flexWrap:'wrap' as const}}>
                      {op.base_location && <span>{op.base_location}</span>}
                      {op.phone && <span>{op.phone}</span>}
                      <span>{op.total_trips||0} trips</span>
                    </div>
                  </div>
                  <button onClick={()=>togglePreferred(op.id)} style={{width:34,height:34,borderRadius:8,background:isPref?'rgba(245,158,11,0.08)':'transparent',border:'0.5px solid '+(isPref?'var(--warning)':'var(--border)'),cursor:'pointer',fontSize:16,color:isPref?'var(--warning)':'var(--text-tertiary)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.1s',fontFamily:'var(--font-sans)'}}>
                    {isPref ? '★' : '☆'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
