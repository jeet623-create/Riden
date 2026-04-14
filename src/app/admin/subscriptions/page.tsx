'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const D='#1A1A1A',Y='#D4E827'
const SUPA=(process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1'
const PLANS=[{value:'trial',label:'Trial',price:'฿0',days:60},{value:'starter',label:'Starter',price:'฿2,000',days:30},{value:'growth',label:'Growth',price:'฿4,000',days:30},{value:'pro',label:'Pro',price:'฿6,000',days:30}]
const SC: Record<string,string>={active:'badge-confirmed',trial:'badge-pending',expired:'badge-cancelled',suspended:'badge-cancelled'}

export default function AdminSubsPage() {
  const [dmcs,setDmcs]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')
  const [sel,setSel]=useState<any>(null)
  const [plan,setPlan]=useState('starter')
  const [start,setStart]=useState('')
  const [end,setEnd]=useState('')
  const [notes,setNotes]=useState('')
  const [acting,setActing]=useState(false)
  useEffect(()=>{load()},[])  
  async function load(){setLoading(true);const r=await fetch(SUPA+'/admin-subscriptions');const d=await r.json();setDmcs(d.dmcs||[]);setLoading(false)}
  function sel2(d:any){setSel(d);const s=new Date().toISOString().split('T')[0];setStart(s);setEnd(new Date(Date.now()+(plan==='trial'?60:30)*864e5).toISOString().split('T')[0])}
  function updPlan(p:string){setPlan(p);if(!start)return;setEnd(new Date(new Date(start).getTime()+(p==='trial'?60:30)*864e5).toISOString().split('T')[0])}
  async function activate(){
    if(!sel||!plan||!start||!end){toast.error('Fill all fields');return}
    setActing(true)
    const {data:{user}}=await createClient().auth.getUser()
    const r=await fetch(SUPA+'/admin-subscriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dmc_id:sel.id,plan,start_date:start,end_date:end,admin_id:user?.id,notes})})
    const d=await r.json()
    if(d.ok){toast.success(d.dmc_name+' activated!');setSel(null);setNotes('');load()}else toast.error(d.error||'Error')
    setActing(false)
  }
  const inp:React.CSSProperties={width:'100%',background:'#F5F5F5',border:'0.5px solid #E8E8E8',borderRadius:8,color:D,fontFamily:'var(--font-space)',fontSize:13,padding:'9px 12px',outline:'none',boxSizing:'border-box' as const}
  const filtered=dmcs.filter((d:any)=>!search||d.company_name?.toLowerCase().includes(search.toLowerCase())||d.email?.toLowerCase().includes(search.toLowerCase()))
  return <div style={{minHeight:'100vh',background:'#F5F5F5',fontFamily:'var(--font-space)'}}>
    <style>{'@media(min-width:800px){.sl{display:grid!important;grid-template-columns:1fr 340px!important;gap:24px!important}}'}</style>
    <nav style={{background:D,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',position:'sticky',top:0,zIndex:50}}>
      <div style={{display:'inline-flex',alignItems:'baseline',gap:5}}><span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:20,letterSpacing:'-0.05em',color:Y}}>RIDEN</span><span style={{fontFamily:'var(--font-space)',fontWeight:500,fontSize:10,letterSpacing:'0.05em',opacity:0.55,color:Y}}>ไรเด็น</span></div>
      <div style={{display:'flex',gap:4}}><Link href="/admin/pending" style={{fontFamily:'var(--font-space)',fontSize:13,color:Y,opacity:0.5,textDecoration:'none',padding:'4px 10px'}}>Pending</Link><Link href="/admin/subscriptions" style={{fontFamily:'var(--font-space)',fontSize:13,color:Y,opacity:1,textDecoration:'none',padding:'4px 10px'}}>Subscriptions</Link></div>
    </nav>
    <main style={{maxWidth:1100,margin:'0 auto',padding:'clamp(20px,4vw,40px) 20px'}}>
      <h1 style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'clamp(22px,3vw,30px)',letterSpacing:'-0.03em',color:D,marginBottom:4}}>Subscriptions</h1>
      <p style={{fontSize:13,color:'#888',marginBottom:28}}>Activate plans after bank transfer confirmation.</p>
      <div className="sl" style={{display:'block'}}>
        <div>
          <input style={{...inp,marginBottom:14,background:'#fff'}} placeholder="Search DMC..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {loading?[1,2,3].map(i=><div key={i} className="skeleton" style={{height:64,borderRadius:14,marginBottom:8}}/>) :filtered.map((d:any)=>{
            const is=sel?.id===d.id
            return <div key={d.id} onClick={()=>sel2(d)} style={{background:is?D:'#fff',borderRadius:14,border:is?'2px solid '+D:'0.5px solid #E8E8E8',padding:'14px 16px',marginBottom:8,cursor:'pointer',transition:'all 150ms'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap' as const}}>
                <div><div style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:14,color:is?Y:D,marginBottom:2}}>{d.company_name}</div><div style={{fontSize:11,color:is?'rgba(212,232,39,0.4)':'#888'}}>{d.email} · {d.country||'—'}</div></div>
                <span className={'badge '+(SC[d.subscription_status||'trial']||'badge-neutral')} style={{flexShrink:0}}>{d.subscription_status||'trial'}</span>
              </div>
            </div>
          })}
        </div>
        <div style={{position:'sticky' as const,top:72,height:'fit-content'}}>
          <div style={{background:'#fff',borderRadius:14,border:sel?'2px solid '+D:'0.5px solid #E8E8E8',padding:24}}>
            {!sel?<div style={{textAlign:'center' as const,padding:'32px 0',color:'#888',fontSize:13}}><div style={{fontSize:24,marginBottom:8}}>←</div>Select a DMC</div>:
              <>
                <div style={{marginBottom:20}}><div style={{fontSize:10,color:'#888',marginBottom:4,fontFamily:'var(--font-space)',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase' as const}}>Activating for</div><div style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:17,color:D}}>{sel.company_name}</div><div style={{fontSize:12,color:'#888'}}>{sel.email}</div></div>
                <div style={{marginBottom:16}}><div style={{fontSize:10,color:'#888',marginBottom:8,fontFamily:'var(--font-space)',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase' as const}}>Plan</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>{PLANS.map(p=><button key={p.value} onClick={()=>updPlan(p.value)} style={{padding:'10px 8px',background:plan===p.value?D:'#F5F5F5',border:plan===p.value?'none':'0.5px solid #E8E8E8',borderRadius:8,cursor:'pointer',textAlign:'left' as const}}><div style={{fontSize:12,fontWeight:700,color:plan===p.value?Y:D}}>{p.label}</div><div style={{fontSize:11,color:plan===p.value?'rgba(212,232,39,0.5)':'#888'}}>{p.price}</div></button>)}</div></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}><div><div style={{fontSize:10,color:'#888',marginBottom:5,fontFamily:'var(--font-space)',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase' as const}}>Start</div><input style={inp} type="date" value={start} onChange={e=>setStart(e.target.value)}/></div><div><div style={{fontSize:10,color:'#888',marginBottom:5,fontFamily:'var(--font-space)',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase' as const}}>End</div><input style={inp} type="date" value={end} onChange={e=>setEnd(e.target.value)}/></div></div>
                <div style={{marginBottom:16}}><div style={{fontSize:10,color:'#888',marginBottom:5,fontFamily:'var(--font-space)',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase' as const}}>Notes</div><input style={inp} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Payment ref..."/></div>
                <button onClick={activate} disabled={acting} style={{width:'100%',padding:13,background:acting?'#333':D,color:Y,border:'none',borderRadius:8,fontSize:14,fontWeight:700,cursor:acting?'not-allowed':'pointer',fontFamily:'var(--font-syne)',marginBottom:8,opacity:acting?0.6:1}}>{acting?'...':'Activate ✓'}</button>
                <button onClick={()=>setSel(null)} style={{width:'100%',padding:8,background:'none',border:'none',color:'#888',fontSize:12,cursor:'pointer',fontFamily:'var(--font-space)'}}>Cancel</button>
              </>
            }
          </div>
        </div>
      </div>
    </main>
  </div>
}
