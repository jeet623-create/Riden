'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
const API = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1';
const PG: React.CSSProperties = { minHeight:'100vh', background:'#07100D', color:'#e8f5f0', fontFamily:'Inter,sans-serif', padding:'24px 20px' };
const CARD: React.CSSProperties = { background:'#0d1e19', border:'1px solid #1a3028', borderRadius:12, padding:16, marginBottom:12 };
const TEAL = '#19C977';
const NAVS = [{h:'/admin',l:'Dashboard'},{h:'/admin/dmcs',l:'DMCs'},{h:'/admin/operators',l:'Operators'},{h:'/admin/drivers',l:'Drivers',a:true},{h:'/admin/pending',l:'Pending'},{h:'/admin/subscriptions',l:'Subscriptions'}];
export default function AdminDriversPage() {
  const [drs,setDrs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [acting,setActing]=useState<string|null>(null);
  const [msg,setMsg]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);
    try { const r=await fetch(API+'/admin-pending?action=list_drivers'); const d=await r.json(); setDrs(d.all_drivers||[]); } catch(e){console.error(e);}
    setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);
  async function act(id:string,action:string,liu:string,name:string){
    setActing(id+action);
    const r=await fetch(API+'/admin-pending',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'driver',id,action,line_user_id:liu,name})});
    const d=await r.json();
    setMsg(d.msg||d.error||'Done');
    load();
    setActing(null);
  }
  const filtered=drs.filter((d:any)=>!search||d.full_name?.toLowerCase().includes(search.toLowerCase())||d.phone?.includes(search)||d.vehicle_plate?.includes(search));
  const btnV:React.CSSProperties={background:TEAL,color:'#07100D',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:12,cursor:'pointer'};
  const btnS:React.CSSProperties={background:'transparent',color:'#ff6b6b',border:'1px solid #ff6b6b',borderRadius:8,padding:'6px 14px',fontWeight:600,fontSize:12,cursor:'pointer'};
  return (
    <div style={PG}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,margin:0}}>Driver Management</h1>
        <span style={{fontSize:11,color:'#7aab94'}}>{drs.length} total</span>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' as const}}>{NAVS.map(n=><Link key={n.h} href={n.h} style={{padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:600,background:(n as any).a?TEAL:'#0f1f1a',color:(n as any).a?'#07100D':'#7aab94',textDecoration:'none'}}>{n.l}</Link>)}</div>
      <div style={{marginBottom:16}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, plate..." style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:8,color:'#e8f5f0',padding:'9px 14px',fontSize:13,outline:'none',width:'100%',maxWidth:360,boxSizing:'border-box' as const}}/></div>
      {msg&&<div style={{background:'#0f2a1f',border:'1px solid '+TEAL,borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:TEAL}}>{msg}</div>}
      {loading?<div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>Loading...</div>:
      filtered.length===0?<div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>No drivers found.</div>:
      filtered.map((d:any)=>(
        <div key={d.id} style={CARD}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap' as const}}>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,marginBottom:3}}>{d.full_name}</div>
              <div style={{fontSize:12,color:'#7aab94'}}>{d.phone||'—'} · {d.vehicle_type||'—'} · {d.vehicle_plate||'—'}</div>
              <div style={{fontSize:11,color:'#7aab94',marginTop:2}}>{d.base_location||'—'}</div>
              <div style={{fontSize:11,color:d.is_verified?TEAL:'#F59E0B',marginTop:2}}>{d.is_verified?'✓ Verified':'Pending verification'} · {d.is_available?'🟢 Available':'🔴 Unavailable'}</div>
            </div>
            <div style={{display:'flex',gap:8,flexShrink:0}}>
              {!d.is_verified&&<button onClick={()=>act(d.id,'verify',d.line_user_id,d.full_name)} disabled={acting===d.id+'verify'} style={{...btnV,opacity:acting===d.id+'verify'?0.5:1}}>✓ Verify</button>}
              <button onClick={()=>act(d.id,'reject',d.line_user_id,d.full_name)} disabled={acting===d.id+'reject'} style={{...btnS,opacity:acting===d.id+'reject'?0.5:1}}>Suspend</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
