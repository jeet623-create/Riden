'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
const API = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1';
const PG: React.CSSProperties = { minHeight:'100vh', background:'#07100D', color:'#e8f5f0', fontFamily:'Inter,sans-serif', padding:'24px 20px' };
const CARD: React.CSSProperties = { background:'#0d1e19', border:'1px solid #1a3028', borderRadius:12, padding:16, marginBottom:12 };
const TEAL = '#19C977';
const NAVS = [{h:'/admin',l:'Dashboard'},{h:'/admin/dmcs',l:'DMCs',a:true},{h:'/admin/operators',l:'Operators'},{h:'/admin/drivers',l:'Drivers'},{h:'/admin/pending',l:'Pending'},{h:'/admin/subscriptions',l:'Subscriptions'}];
export default function AdminDmcsPage() {
  const [dmcs,setDmcs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [acting,setActing]=useState<string|null>(null);
  const [msg,setMsg]=useState('');
  useEffect(()=>{load();},[]);
  async function load(){setLoading(true);const r=await fetch(API+'/admin-subscriptions');const d=await r.json();setDmcs(d.dmcs||[]);setLoading(false);}
  async function suspend(id:string,name:string){
    if(!confirm('Suspend '+name+'?'))return;
    setActing(id);
    await fetch(API+'/admin-subscriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dmc_id:id,action:'suspend'})});
    setMsg(name+' suspended.');
    load();
    setActing(null);
  }
  const filtered=dmcs.filter(d=>!search||d.company_name?.toLowerCase().includes(search.toLowerCase())||d.email?.toLowerCase().includes(search.toLowerCase()));
  const badge=(s:string)=>({ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:600 as const, background:s==='active'?'rgba(25,201,119,0.15)':s==='suspended'?'rgba(248,113,113,0.1)':'rgba(245,158,11,0.1)', color:s==='active'?TEAL:s==='suspended'?'#F87171':'#F59E0B' });
  return (
    <div style={PG}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,margin:0}}>DMC Management</h1>
        <span style={{fontSize:11,color:'#7aab94'}}>{dmcs.length} total</span>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' as const}}>
        {NAVS.map(n=><Link key={n.h} href={n.h} style={{padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:600,background:(n as any).a?TEAL:'#0f1f1a',color:(n as any).a?'#07100D':'#7aab94',textDecoration:'none'}}>{n.l}</Link>)}
      </div>
      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..." style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:8,color:'#e8f5f0',padding:'9px 14px',fontSize:13,outline:'none',width:'100%',maxWidth:360,boxSizing:'border-box' as const}}/>
      </div>
      {msg&&<div style={{background:'#0f2a1f',border:'1px solid '+TEAL,borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:TEAL}}>{msg}</div>}
      {loading?<div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>Loading...</div>:
      filtered.length===0?<div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>No DMCs found.</div>:
      filtered.map((d:any)=>(
        <div key={d.id} style={CARD}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap' as const}}>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,marginBottom:3}}>{d.company_name}</div>
              <div style={{fontSize:12,color:'#7aab94'}}>{d.email} · {d.country||'—'}</div>
              {d.trial_ends_at&&<div style={{fontSize:11,color:'#5a7a6a',marginTop:2}}>Trial ends: {new Date(d.trial_ends_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              <span style={badge(d.subscription_status||'trial')}>{d.subscription_status||'trial'}</span>
              <span style={{fontSize:11,color:'#7aab94',textTransform:'capitalize' as const}}>{d.subscription_plan||'trial'}</span>
              <Link href="/admin/subscriptions" style={{fontSize:12,padding:'5px 12px',borderRadius:6,background:'rgba(25,201,119,0.1)',color:TEAL,textDecoration:'none',fontWeight:600}}>Activate</Link>
              {d.subscription_status!=='suspended'&&<button onClick={()=>suspend(d.id,d.company_name)} disabled={acting===d.id} style={{fontSize:12,padding:'5px 12px',borderRadius:6,background:'rgba(248,113,113,0.1)',color:'#F87171',border:'none',cursor:'pointer',fontWeight:600,opacity:acting===d.id?0.5:1}}>Suspend</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
