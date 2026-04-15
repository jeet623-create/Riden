'use client';
import { useEffect, useState, useCallback } from 'react';
const API = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1/admin-pending';
const ADMIN_LINKS = [{h:'/admin',l:'Dashboard'},{h:'/admin/dmcs',l:'DMCs'},{h:'/admin/operators',l:'Operators'},{h:'/admin/drivers',l:'Drivers'},{h:'/admin/pending',l:'Pending'},{h:'/admin/subscriptions',l:'Subscriptions'}];
function AdminShell({active,children}:{active:string;children:React.ReactNode}) {
  return (<div style={{display:'flex',minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
    <div style={{width:220,background:'#fff',borderRight:'0.5px solid var(--border)',flexShrink:0,display:'flex',flexDirection:'column' as const,position:'sticky' as const,top:0,height:'100vh'}}>
      <div style={{padding:'20px 16px 14px',borderBottom:'0.5px solid var(--border)'}}><div style={{display:'flex',alignItems:'baseline',gap:5}}><span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span><span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span></div><div style={{fontSize:10,color:'var(--text-tertiary)',marginTop:1}}>Admin Panel</div></div>
      <nav style={{padding:8,flex:1}}>{ADMIN_LINKS.map(l=>(<a key={l.h} href={l.h} style={{display:'block',padding:'8px 10px',borderRadius:7,fontSize:13,fontWeight:l.h===active?500:400,color:l.h===active?'var(--text-primary)':'var(--text-secondary)',background:l.h===active?'var(--bg-page)':'transparent',textDecoration:'none',marginBottom:1}}>{l.l}</a>))}</nav>
    </div>
    <div style={{flex:1,minWidth:0,padding:'28px 24px'}}>{children}</div>
  </div>);
}
type Op = { id:string; company_name:string; phone:string; base_location:string; line_user_id:string; created_at:string };
type Dr = { id:string; full_name:string; vehicle_type:string; vehicle_plate:string; base_location:string; line_user_id:string; created_at:string };
export default function PendingPage() {
  const [ops,setOps]=useState<Op[]>([]);
  const [drs,setDrs]=useState<Dr[]>([]);
  const [tab,setTab]=useState<'op'|'dr'>('op');
  const [loading,setLoading]=useState(true);
  const [msg,setMsg]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);
    try{const res=await fetch(API+'?action=list');const data=await res.json();setOps(data.operators||[]);setDrs(data.drivers||[]);}catch(e){console.error(e);}
    setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);
  async function act(type:string,id:string,action:string,line_user_id:string,name:string){
    const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,id,action,line_user_id,name})});
    const data=await res.json();setMsg(data.msg||data.error||'Done');load();
  }
  const list = tab==='op' ? ops : drs;
  return (
    <AdminShell active="/admin/pending">
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',marginBottom:1}}>Pending Verification</h1>
        <p style={{fontSize:12,color:'var(--text-tertiary)'}}>Review and verify operators and drivers</p>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:16}}>
        <button onClick={()=>setTab('op')} style={{padding:'7px 16px',borderRadius:6,fontSize:12,fontWeight:500,border:'0.5px solid var(--border)',background:tab==='op'?'#111':'#fff',color:tab==='op'?'#fff':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)'}}>
          Operators ({ops.length})
        </button>
        <button onClick={()=>setTab('dr')} style={{padding:'7px 16px',borderRadius:6,fontSize:12,fontWeight:500,border:'0.5px solid var(--border)',background:tab==='dr'?'#111':'#fff',color:tab==='dr'?'#fff':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)'}}>
          Drivers ({drs.length})
        </button>
      </div>
      {msg&&<div style={{padding:'8px 12px',background:'rgba(25,201,119,0.06)',border:'0.5px solid rgba(25,201,119,0.2)',borderRadius:7,fontSize:12,color:'var(--accent)',marginBottom:12}}>{msg}</div>}
      {loading?(<div style={{padding:40,textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>):
      list.length===0?(<div style={{padding:40,textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>No pending {tab==='op'?'operators':'drivers'}.</div>):
      <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
        {tab==='op'?ops.map((op:Op)=>(
          <div key={op.id} className="riden-card" style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:500,fontSize:14,marginBottom:3}}>{op.company_name}</div>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>{op.phone||'—'} · {op.base_location||'—'}</div>
              <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>{new Date(op.created_at).toLocaleDateString('en-GB')}</div>
            </div>
            <div style={{display:'flex',gap:8,flexShrink:0}}>
              <button onClick={()=>act('operator',op.id,'verify',op.line_user_id,op.company_name)} style={{fontSize:12,padding:'5px 12px',borderRadius:6,background:'rgba(25,201,119,0.08)',color:'var(--accent)',border:'none',cursor:'pointer',fontWeight:500}}>✓ Verify</button>
              <button onClick={()=>act('operator',op.id,'reject',op.line_user_id,op.company_name)} style={{fontSize:12,padding:'5px 12px',borderRadius:6,background:'rgba(239,68,68,0.07)',color:'var(--danger)',border:'none',cursor:'pointer',fontWeight:500}}>Reject</button>
            </div>
          </div>
        )):drs.map((dr:Dr)=>(
          <div key={dr.id} className="riden-card" style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:500,fontSize:14,marginBottom:3}}>{dr.full_name}</div>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>{dr.vehicle_type?.replace(/_/g,' ').toUpperCase()||'—'} · {dr.vehicle_plate||'—'}</div>
              <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>{dr.base_location||'—'} · {new Date(dr.created_at).toLocaleDateString('en-GB')}</div>
            </div>
            <div style={{display:'flex',gap:8,flexShrink:0}}>
              <button onClick={()=>act('driver',dr.id,'verify',dr.line_user_id,dr.full_name)} style={{fontSize:12,padding:'5px 12px',borderRadius:6,background:'rgba(25,201,119,0.08)',color:'var(--accent)',border:'none',cursor:'pointer',fontWeight:500}}>✓ Verify</button>
              <button onClick={()=>act('driver',dr.id,'reject',dr.line_user_id,dr.full_name)} style={{fontSize:12,padding:'5px 12px',borderRadius:6,background:'rgba(239,68,68,0.07)',color:'var(--danger)',border:'none',cursor:'pointer',fontWeight:500}}>Reject</button>
            </div>
          </div>
        ))}
      </div>}
    </AdminShell>
  );
}
