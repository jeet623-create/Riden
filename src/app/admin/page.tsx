'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
const API = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1';
const PG: React.CSSProperties = { minHeight:'100vh', background:'#07100D', color:'#e8f5f0', fontFamily:'Inter,sans-serif', padding:'24px 20px' };
const CARD: React.CSSProperties = { background:'#0d1e19', border:'1px solid #1a3028', borderRadius:12, padding:16, marginBottom:12 };
const tabBtn = (a:boolean): React.CSSProperties => ({ padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, background:a?'#19C977':'#0f1f1a', color:a?'#07100D':'#7aab94' });
const STAT = (c:string): React.CSSProperties => ({ background:'#0d1e19', border:'1px solid '+c+'44', borderRadius:12, padding:'16px 20px', flex:'1 1 140px', minWidth:130 });
const TEAL = '#19C977';
export default function AdminDashboard() {
  const [stats,setStats]=useState({dmcs:0,pendingVerify:0,operators:0,drivers:0,revenue:0});
  const [recentDmcs,setRecentDmcs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{load();},[]);
  async function load(){
    try {
      const [s,p] = await Promise.all([
        fetch(API+'/admin-subscriptions').then(r=>r.json()),
        fetch(API+'/admin-pending?action=list').then(r=>r.json()),
      ]);
      const dmcs=s.dmcs||[];
      setStats({ dmcs:dmcs.length, pendingVerify:(p.operators?.length||0)+(p.drivers?.length||0), operators:p.operators?.length||0, drivers:p.drivers?.length||0, revenue:dmcs.filter((d:any)=>d.subscription_status==='active').length*2000 });
      setRecentDmcs(dmcs.slice(0,6));
    } catch(e){console.error(e);}
    setLoading(false);
  }
  return (
    <div style={PG}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <div style={{width:28,height:28,background:TEAL,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07100D" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <h1 style={{fontSize:22,fontWeight:800,margin:0}}>Admin Dashboard</h1>
        <span style={{fontSize:11,background:'rgba(25,201,119,0.15)',color:TEAL,padding:'2px 8px',borderRadius:20,fontWeight:600}}>RIDEN</span>
      </div>
      {/* Nav links */}
      <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap' as const}}>
        {[{h:'/admin',l:'Dashboard',a:true},{h:'/admin/dmcs',l:'DMCs'},{h:'/admin/operators',l:'Operators'},{h:'/admin/drivers',l:'Drivers'},{h:'/admin/pending',l:'Pending'},{h:'/admin/subscriptions',l:'Subscriptions'}].map(n=>(
          <Link key={n.h} href={n.h} style={{padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:600,background:n.a?TEAL:'#0f1f1a',color:n.a?'#07100D':'#7aab94',textDecoration:'none',transition:'all 0.12s'}}>{n.l}</Link>
        ))}
      </div>
      {/* Stats */}
      <div style={{display:'flex',gap:10,flexWrap:'wrap' as const,marginBottom:24}}>
        {[
          {l:'Total DMCs',v:stats.dmcs,c:TEAL},
          {l:'Pending Verify',v:stats.pendingVerify,c:'#F59E0B'},
          {l:'Operators (pending)',v:stats.operators,c:'#60A5FA'},
          {l:'Drivers (pending)',v:stats.drivers,c:'#A78BFA'},
          {l:'Est. MRR (฿)',v:loading?'—':stats.revenue.toLocaleString(),c:TEAL},
        ].map(s=>(
          <div key={s.l} style={STAT(s.c)}>
            <div style={{fontSize:32,fontWeight:800,color:s.c,lineHeight:1,letterSpacing:'-0.04em'}}>{loading?'—':s.v}</div>
            <div style={{fontSize:10,color:'rgba(168,196,175,0.5)',marginTop:6,textTransform:'uppercase' as const,letterSpacing:'0.1em',fontWeight:500}}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Quick links */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10,marginBottom:24}}>
        {[
          {h:'/admin/pending',l:'✓ Verify Pending',sub:'Operators & drivers waiting',urgent:stats.pendingVerify>0},
          {h:'/admin/subscriptions',l:'☀ Subscriptions',sub:'Activate DMC plans'},
          {h:'/admin/dmcs',l:'🏢 DMC Management',sub:'View & manage all DMCs'},
          {h:'/admin/operators',l:'🚗 Operators',sub:'View & manage operators'},
          {h:'/admin/drivers',l:'👤 Drivers',sub:'View & manage drivers'},
        ].map(item=>(
          <Link key={item.h} href={item.h} style={{textDecoration:'none'}}>
            <div style={{...CARD,cursor:'pointer',borderColor:item.urgent?TEAL+'66':'#1a3028'}}>
              <div style={{fontSize:13,fontWeight:700,color:item.urgent?TEAL:'#e8f5f0',marginBottom:4}}>{item.l}</div>
              <div style={{fontSize:11,color:'#7aab94'}}>{item.sub}</div>
              {item.urgent&&<div style={{fontSize:10,color:TEAL,marginTop:4,fontWeight:600}}>{stats.pendingVerify} pending</div>}
            </div>
          </Link>
        ))}
      </div>
      {/* Recent DMCs */}
      <div style={CARD}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <span style={{fontSize:15,fontWeight:700}}>Recent DMCs</span>
          <Link href="/admin/dmcs" style={{fontSize:12,color:TEAL,textDecoration:'none'}}>View all →</Link>
        </div>
        {loading?<div style={{color:'#7aab94',fontSize:13}}>Loading...</div>:recentDmcs.length===0?<div style={{color:'#7aab94',fontSize:13}}>No DMCs yet.</div>:
        <div style={{overflowX:'auto' as const}}>
          <table style={{width:'100%',borderCollapse:'collapse' as const}}>
            <thead><tr>{['Company','Email','Country','Status','Plan'].map(h=><th key={h} style={{textAlign:'left' as const,fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase' as const,color:'rgba(168,196,175,0.4)',padding:'0 0 10px',borderBottom:'1px solid #1a3028'}}>{h}</th>)}</tr></thead>
            <tbody>{recentDmcs.map((d:any)=>(
              <tr key={d.id}>
                <td style={{padding:'10px 0 10px 0',fontSize:13,fontWeight:600,borderBottom:'1px solid #0d1e19'}}>{d.company_name}</td>
                <td style={{padding:'10px 4px',fontSize:12,color:'#7aab94',borderBottom:'1px solid #0d1e19'}}>{d.email}</td>
                <td style={{padding:'10px 4px',fontSize:12,color:'#7aab94',borderBottom:'1px solid #0d1e19'}}>{d.country||'—'}</td>
                <td style={{padding:'10px 4px',borderBottom:'1px solid #0d1e19'}}>
                  <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:600,background:d.subscription_status==='active'?'rgba(25,201,119,0.15)':'rgba(245,158,11,0.1)',color:d.subscription_status==='active'?TEAL:'#F59E0B'}}>{d.subscription_status||'trial'}</span>
                </td>
                <td style={{padding:'10px 4px',fontSize:12,color:'#7aab94',borderBottom:'1px solid #0d1e19',textTransform:'capitalize' as const}}>{d.subscription_plan||'trial'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
      </div>
    </div>
  );
}
