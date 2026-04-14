'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const D='#1A1A1A',Y='#D4E827'
const SUPA=(process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1'

export default function AdminPendingPage() {
  const [data,setData]=useState<{operators:any[],drivers:any[]}>({operators:[],drivers:[]})
  const [loading,setLoading]=useState(true)
  const [acting,setActing]=useState<string|null>(null)
  useEffect(()=>{load()},[])  
  async function load(){setLoading(true);const r=await fetch(SUPA+'/admin-pending?action=list');setData(await r.json());setLoading(false)}
  async function act(type:string,id:string,action:string,liu:string,name:string){
    setActing(id+action)
    const r=await fetch(SUPA+'/admin-pending',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,id,action,line_user_id:liu,name})})
    const d=await r.json()
    if(d.ok){toast.success(d.msg);load()}else toast.error(d.error||'Error')
    setActing(null)
  }
  function Section({title,items,type}:{title:string,items:any[],type:string}){
    return <div style={{marginBottom:36}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}><h2 style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:18,color:D,letterSpacing:'-0.02em'}}>{title}</h2><span style={{background:Y,color:D,fontSize:11,fontWeight:700,fontFamily:'var(--font-syne)',padding:'2px 8px',borderRadius:20}}>{items.length}</span></div>
      {items.length===0?<div style={{padding:24,background:'#fff',borderRadius:14,border:'0.5px solid #E8E8E8',fontSize:13,color:'#888',textAlign:'center' as const}}>All clear ✔</div>:
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
          {items.map((item:any)=>
            <div key={item.id} style={{background:'#fff',borderRadius:14,border:'0.5px solid #E8E8E8',padding:20}}>
              <div style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:15,color:D,marginBottom:5}}>{item.company_name||item.full_name}</div>
              {item.phone&&<div style={{fontSize:12,color:'#888',marginBottom:2}}>📞 {item.phone}</div>}
              {item.base_location&&<div style={{fontSize:12,color:'#888',marginBottom:2}}>📍 {item.base_location}</div>}
              {item.vehicle_type&&<div style={{fontSize:12,color:'#888',marginBottom:2}}>🚗 {item.vehicle_type?.replace('_',' ')} · {item.vehicle_plate}</div>}
              <div style={{fontSize:11,color:'#bbb',marginBottom:14}}>{new Date(item.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>act(type,item.id,'verify',item.line_user_id,item.company_name||item.full_name)} disabled={acting===item.id+'verify'} style={{flex:1,padding:'9px',background:D,color:Y,border:'none',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-syne)',opacity:acting===item.id+'verify'?0.6:1}}>{acting===item.id+'verify'?'...':'✓ Verify'}</button>
                <button onClick={()=>act(type,item.id,'reject',item.line_user_id,item.company_name||item.full_name)} disabled={acting===item.id+'reject'} style={{flex:1,padding:'9px',background:'#fff',color:'#CC0000',border:'0.5px solid rgba(204,0,0,0.4)',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-syne)',opacity:acting===item.id+'reject'?0.6:1}}>{acting===item.id+'reject'?'...':'× Reject'}</button>
              </div>
            </div>
          )}
        </div>}
    </div>
  }
  return <div style={{minHeight:'100vh',background:'#F5F5F5',fontFamily:'var(--font-space)'}}>
    <nav style={{background:D,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',position:'sticky',top:0,zIndex:50}}>
      <div style={{display:'inline-flex',alignItems:'baseline',gap:5}}><span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:20,letterSpacing:'-0.05em',color:Y}}>RIDEN</span><span style={{fontFamily:'var(--font-space)',fontWeight:500,fontSize:10,letterSpacing:'0.05em',opacity:0.55,color:Y}}>ไรเด็น</span></div>
      <div style={{display:'flex',gap:4}}><Link href="/admin/pending" style={{fontFamily:'var(--font-space)',fontSize:13,fontWeight:500,color:Y,opacity:1,textDecoration:'none',padding:'4px 10px'}}>Pending</Link><Link href="/admin/subscriptions" style={{fontFamily:'var(--font-space)',fontSize:13,fontWeight:500,color:Y,opacity:0.5,textDecoration:'none',padding:'4px 10px'}}>Subscriptions</Link></div>
    </nav>
    <main style={{maxWidth:1100,margin:'0 auto',padding:'clamp(20px,4vw,40px) 20px'}}>
      <h1 style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'clamp(22px,3vw,30px)',letterSpacing:'-0.03em',color:D,marginBottom:4}}>Pending Verification</h1>
      <p style={{fontSize:13,color:'#888',marginBottom:28}}>Verify operators and drivers to activate their accounts.</p>
      {loading?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:140,borderRadius:14}}/>)}</div>:<><Section title="Operators" items={data.operators} type="operator"/><Section title="Drivers" items={data.drivers} type="driver"/></>}
    </main>
  </div>
}
