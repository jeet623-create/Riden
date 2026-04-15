'use client';
import { useEffect, useState } from 'react';

const API = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1';
const ADMIN_LINKS = [{h:'/admin',l:'Dashboard'},{h:'/admin/dmcs',l:'DMCs'},{h:'/admin/operators',l:'Operators'},{h:'/admin/drivers',l:'Drivers'},{h:'/admin/pending',l:'Pending'},{h:'/admin/subscriptions',l:'Subscriptions'}];

function AdminShell({active,children}:{active:string;children:React.ReactNode}) {
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
      <div style={{width:220,background:'#fff',borderRight:'0.5px solid var(--border)',flexShrink:0,display:'flex',flexDirection:'column' as const,position:'sticky' as const,top:0,height:'100vh'}}>
        <div style={{padding:'20px 16px 14px',borderBottom:'0.5px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'baseline',gap:5}}>
            <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
            <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
          </div>
          <div style={{fontSize:10,color:'var(--text-tertiary)',marginTop:1}}>Admin Panel</div>
        </div>
        <nav style={{padding:8,flex:1}}>
          {ADMIN_LINKS.map(l=>(
            <a key={l.h} href={l.h} style={{display:'block',padding:'8px 10px',borderRadius:7,fontSize:13,fontWeight:l.h===active?500:400,color:l.h===active?'var(--text-primary)':'var(--text-secondary)',background:l.h===active?'var(--bg-page)':'transparent',textDecoration:'none',marginBottom:1}}>{l.l}</a>
          ))}
        </nav>
      </div>
      <div style={{flex:1,minWidth:0,padding:'28px 24px'}}>{children}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,setStats]=useState({dmcs:0,pending:0,ops:0,drs:0,revenue:0});
  const [dmcs,setDmcs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{load();},[]);
  async function load(){
    try{
      const [s,p]=await Promise.all([fetch(API+'/admin-subscriptions').then(r=>r.json()),fetch(API+'/admin-pending?action=list').then(r=>r.json())]);
      const d=s.dmcs||[];
      setStats({dmcs:d.length,pending:(p.operators?.length||0)+(p.drivers?.length||0),ops:p.operators?.length||0,drs:p.drivers?.length||0,revenue:d.filter((x:any)=>x.subscription_status==='active').length*2000});
      setDmcs(d.slice(0,8));
    }catch(e){console.error(e);}
    setLoading(false);
  }
  const STATS=[
    {l:'Total DMCs',v:stats.dmcs,c:'var(--text-primary)'},
    {l:'Pending Verify',v:stats.pending,c:'var(--warning)'},
    {l:'Operators',v:stats.ops,c:'var(--accent)'},
    {l:'Drivers',v:stats.drs,c:'var(--accent)'},
    {l:'Est. MRR (฿)',v:(stats.revenue).toLocaleString(),c:'var(--success)'},
  ];
  return (
    <AdminShell active="/admin">
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',color:'var(--text-primary)',marginBottom:2}}>Dashboard</h1>
        <p style={{fontSize:12,color:'var(--text-tertiary)'}}>RIDEN system overview</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:24}}>
        {STATS.map(s=>(
          <div key={s.l} style={{background:'#fff',border:'0.5px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:22,fontWeight:600,letterSpacing:'-0.5px',color:s.c,lineHeight:1,marginBottom:4}}>{loading?'—':s.v}</div>
            <div style={{fontSize:10,fontWeight:500,color:'var(--text-tertiary)',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:8,marginBottom:24}}>
        {[
          {h:'/admin/pending',l:'Verify Pending',urgent:stats.pending>0},
          {h:'/admin/subscriptions',l:'Subscriptions'},
          {h:'/admin/dmcs',l:'DMC Management'},
          {h:'/admin/operators',l:'Operators'},
          {h:'/admin/drivers',l:'Drivers'},
        ].map(item=>(
          <a key={item.h} href={item.h} style={{textDecoration:'none'}}>
            <div style={{background:'#fff',border:item.urgent?'0.5px solid var(--accent)':'0.5px solid var(--border)',borderRadius:10,padding:'12px 14px',cursor:'pointer'}}>
              <div style={{fontSize:13,fontWeight:500,color:item.urgent?'var(--accent)':'var(--text-primary)',marginBottom:2}}>{item.l}</div>
              {item.urgent&&<div style={{fontSize:11,color:'var(--warning)'}}>{stats.pending} waiting</div>}
            </div>
          </a>
        ))}
      </div>
      <div style={{background:'#fff',border:'0.5px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:13,fontWeight:500}}>Recent DMCs</span>
          <a href="/admin/dmcs" style={{fontSize:12,color:'var(--text-tertiary)',textDecoration:'none'}}>View all →</a>
        </div>
        {loading?<div style={{padding:16,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>:
        dmcs.length===0?<div style={{padding:16,color:'var(--text-tertiary)',fontSize:13}}>No DMCs yet.</div>:
        <div style={{overflowX:'auto' as const}}>
          <table className="riden-table">
            <thead><tr><th>Company</th><th>Email</th><th>Country</th><th>Plan</th><th>Status</th></tr></thead>
            <tbody>{dmcs.map((d:any)=>(
              <tr key={d.id}>
                <td style={{fontWeight:500}}>{d.company_name}</td>
                <td style={{color:'var(--text-secondary)',fontSize:12}}>{d.email}</td>
                <td style={{color:'var(--text-secondary)'}}>{d.country||'—'}</td>
                <td style={{color:'var(--text-secondary)',textTransform:'capitalize' as const}}>{d.subscription_plan||'trial'}</td>
                <td><span className={'badge '+(d.subscription_status==='active'?'badge-progress':d.subscription_status==='suspended'?'badge-cancelled':'badge-warning')}>{d.subscription_status||'trial'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
      </div>
    </AdminShell>
  );
}
