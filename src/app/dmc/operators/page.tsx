'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/functions/v1';
export default function OperatorsPage() {
  const router = useRouter();
  const [preferred, setPreferred] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [dmcId, setDmcId] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const id = localStorage.getItem('dmc_id');
    if (!id) { router.push('/dmc/login'); return; }
    setDmcId(id);
    fetch(SUPA+'/operator-search?action=search&q=all&dmc_id='+id).then(r=>r.json()).then(d=>setPreferred((d.operators||[]).filter((o:any)=>o.is_preferred)));
  }, []);
  useEffect(() => {
    if (q.length>=2) fetch(SUPA+'/operator-search?action=search&q='+encodeURIComponent(q)+'&dmc_id='+dmcId).then(r=>r.json()).then(d=>setResults(d.operators||[]));
    else setResults([]);
  }, [q]);
  async function add(opId: string) { setLoading(true); await fetch(SUPA+'/operator-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dmc_id:dmcId,operator_id:opId})}); const res=await fetch(SUPA+'/operator-search?action=search&q=all&dmc_id='+dmcId); const d=await res.json(); setPreferred((d.operators||[]).filter((o:any)=>o.is_preferred)); setLoading(false); }
  async function remove(opId: string) { await fetch(SUPA+'/operator-search',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({dmc_id:dmcId,operator_id:opId})}); setPreferred(p=>p.filter(o=>o.id!==opId)); }
  const inp: React.CSSProperties = {width:'100%',background:'#0a1a15',border:'1px solid #1a3028',borderRadius:8,padding:'10px 12px',color:'#e8f5f0',fontSize:14,boxSizing:'border-box'};
  return (
    <div style={{minHeight:'100vh',background:'#07100D',color:'#e8f5f0',fontFamily:'Inter,sans-serif',padding:20}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <a href="/dmc/dashboard" style={{color:'#19C977',textDecoration:'none'}}>Back</a>
        <h1 style={{fontSize:22,fontWeight:800,margin:0}}>Preferred Operators</h1>
      </div>
      <div style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:700,color:'#19C977',marginBottom:12}}>Your List ({preferred.length})</div>
        {preferred.length===0 ? <div style={{color:'#7aab94',fontSize:13}}>None yet. Search below to add.</div>
        : preferred.map((op:any)=>(
          <div key={op.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #1a3028'}}>
            <div><div style={{fontWeight:600}}>{op.company_name}</div><div style={{fontSize:12,color:'#7aab94'}}>{op.phone} - {op.base_location} - {op.riden_id}</div></div>
            <button onClick={()=>remove(op.id)} style={{background:'transparent',border:'1px solid #ff6b6b',color:'#ff6b6b',borderRadius:6,padding:'4px 10px',fontSize:12,cursor:'pointer'}}>Remove</button>
          </div>
        ))}
      </div>
      <div style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:12,padding:16}}>
        <div style={{fontSize:16,fontWeight:700,color:'#19C977',marginBottom:12}}>Search Operators</div>
        <input style={inp} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, city, or RIDEN ID (e.g. OP-1042)" />
        {results.length>0 && <div style={{marginTop:8}}>{results.map((op:any)=>(
          <div key={op.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #1a3028'}}>
            <div><div style={{fontWeight:600}}>{op.company_name} {op.is_preferred?'*':''}</div><div style={{fontSize:12,color:'#7aab94'}}>{op.phone} - {op.base_location} - {op.riden_id}</div></div>
            {!op.is_preferred ? <button onClick={()=>add(op.id)} disabled={loading} style={{background:'#19C977',border:'none',color:'#07100D',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer',fontWeight:700}}>+ Add</button> : <span style={{fontSize:12,color:'#19C977'}}>Added</span>}
          </div>
        ))}</div>}
      </div>
    </div>
  );
}