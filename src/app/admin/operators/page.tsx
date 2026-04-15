'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
const API = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1';
const PG: React.CSSProperties = { minHeight:'100vh', background:'#07100D', color:'#e8f5f0', fontFamily:'Inter,sans-serif', padding:'24px 20px' };
const CARD: React.CSSProperties = { background:'#0d1e19', border:'1px solid #1a3028', borderRadius:12, padding:16, marginBottom:12 };
const TEAL = '#19C977';
const NAVS = [{h:'/admin',l:'Dashboard'},{h:'/admin/dmcs',l:'DMCs'},{h:'/admin/operators',l:'Operators',a:true},{h:'/admin/drivers',l:'Drivers'},{h:'/admin/pending',l:'Pending'},{h:'/admin/subscriptions',l:'Subscriptions'}];
export default function AdminOperatorsPage() {
  const [ops,setOps]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [acting,setActing]=useState<string|null>(null);
  const [msg,setMsg]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);
    try { const r=await fetch(API+'/admin-pending?action=list_operators'); const d=await r.json(); setOps(d.all_operators||[]); } catch(e){console.error(e);}
    setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);
  async function act(id:string,action:string,liu:string,name:string){
    setActing(id+action);
    const r=await fetch(API+'/admin-pending',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'operator',id,action,line_user_id:liu,name})});
    const d=await r.json();
    setMsg(d.msg||d.error||'Done');
    load();
    setActing(null);
  }
  const filtered=ops.filter((o:any)=>!search||o.company_name?.toLowerCase().includes(search.toLowerCase())||o.phone?.includes(search));
  const btnV:React.CSSProperties={background:TEAL,color:'#07100D',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:12,cursor:'pointer'};
  const btnS:React.CSSProperties={background:'transparent',color:'#ff6b6b',border:'1px solid #ff6b6b',borderRadius:8,padding:'6px 14px',fontWeight:600,fontSize:12,cursor:'pointer'};
  return (
    <div style={PG}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,margin:0}}>Operator Management</h1>
        <span style={{fontSize:11,color:'#7aab94'}}>{ops.length} total</span>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' as const}}>{NAVS.map(n=><Link key={n.h} href={n.h} style={{padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:600,background:(n as any).a?TEAL:'#0f1f1a',color:(n as any).a?'#07100D':'#7aab94',textDecoration:'none'}}>{n.l}</Link>)}</div>
      <div style={{marginBottom:16}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or phone..." style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:8,color:'#e8f5f0',padding:'9px 14px',fontSize:13,outline:'none',width:'100%',maxWidth:360,boxSizing:'border-box' as const}}/></div>
      {msg&&<div style={{background:'#0f2a1f',border:'1px solid '+TEAL,borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:TEAL}}>{msg}</div>}
      {loading?<div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>Loading...</div>:
      filtered.length===0?<div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>No operators found.</div>:
      filtered.map((o:any)=>(
        <div key={o.id} style={CARD}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap' as const}}>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,marginBottom:3}}>{o.company_name}</div>
              <div style={{fontSize:12,color:'#7aab94'}}>{o.phone||'—'} · {o.base_location||'—'}</div>
              <div style={{fontSize:11,color:o.is_verified?TEAL:'#F59E0B',marginTop:2}}>{o.is_verified?'✓ Verified':'Pending verification'}</div>
            </div>
            <div style={{display:'flex',gap:8,flexShrink:0}}>
              <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:600,background:o.status==='active'?'rgba(25,201,119,0.15)':'rgba(245,158,11,0.1)',color:o.status==='active'?TEAL:'#F59E0B'}}>{o.status||'pending'}</span>
              {!o.is_verified&&<button onClick={()=>act(o.id,'verify',o.line_user_id,o.company_name)} disabled={acting===o.id+'verify'} style={{...btnV,opacity:acting===o.id+'verify'?0.5:1}}>✓ Verify</button>}
              {o.status!=='suspended'&&o.is_verified&&<button onClick={()=>act(o.id,'suspend',o.line_user_id,o.company_name)} disabled={acting===o.id+'suspend'} style={btnS}>Suspend</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
