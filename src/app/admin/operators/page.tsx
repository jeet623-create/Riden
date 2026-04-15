'use client';
import { useEffect, useState, useCallback } from 'react';
const API = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1';
const ADMIN_LINKS = [{h:'/admin',l:'Dashboard'},{h:'/admin/dmcs',l:'DMCs'},{h:'/admin/operators',l:'Operators'},{h:'/admin/drivers',l:'Drivers'},{h:'/admin/pending',l:'Pending'},{h:'/admin/subscriptions',l:'Subscriptions'}];
function AdminShell({active,children}:{active:string;children:React.ReactNode}) {
  return (<div style={{display:'flex',minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
    <div style={{width:220,background:'#fff',borderRight:'0.5px solid var(--border)',flexShrink:0,display:'flex',flexDirection:'column' as const,position:'sticky' as const,top:0,height:'100vh'}}>
      <div style={{padding:'20px 16px 14px',borderBottom:'0.5px solid var(--border)'}}><div style={{display:'flex',alignItems:'baseline',gap:5}}><span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px'}}>RIDEN</span><span style={{fontSize:9,letterSpacing:'1px',opacity:0.35}}>ไรเด็น</span></div><div style={{fontSize:10,color:'var(--text-tertiary)',marginTop:1}}>Admin Panel</div></div>
      <nav style={{padding:8,flex:1}}>{ADMIN_LINKS.map(l=>(<a key={l.h} href={l.h} style={{display:'block',padding:'8px 10px',borderRadius:7,fontSize:13,fontWeight:l.h===active?500:400,color:l.h===active?'var(--text-primary)':'var(--text-secondary)',background:l.h===active?'var(--bg-page)':'transparent',textDecoration:'none',marginBottom:1}}>{l.l}</a>))}</nav>
    </div>
    <div style={{flex:1,minWidth:0,padding:'28px 24px'}}>{children}</div>
  </div>);
}
export default function AdminOperatorsPage() {
  const [ops,setOps]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [acting,setActing]=useState<string|null>(null);
  const [msg,setMsg]=useState('');
  const load=useCallback(async()=>{setLoading(true);try{const r=await fetch(API+'/admin-pending?action=list_operators');const d=await r.json();setOps(d.all_operators||[]);}catch(e){console.error(e);}setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  async function act(id:string,action:string,liu:string,name:string){setActing(id+action);const r=await fetch(API+'/admin-pending',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'operator',id,action,line_user_id:liu,name})});const d=await r.json();setMsg(d.msg||d.error||'Done');load();setActing(null);}
  const filtered=ops.filter((o:any)=>!search||o.company_name?.toLowerCase().includes(search.toLowerCase())||o.phone?.includes(search));
  return (<AdminShell active="/admin/operators">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap' as const,gap:12}}>
      <div><h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',marginBottom:1}}>Operators</h1><p style={{fontSize:12,color:'var(--text-tertiary)'}}>{ops.length} total</p></div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="riden-input" style={{maxWidth:240,padding:'7px 12px'}}/>
    </div>
    {msg&&<div style={{padding:'8px 12px',background:'rgba(25,201,119,0.06)',border:'0.5px solid rgba(25,201,119,0.2)',borderRadius:7,fontSize:12,color:'var(--accent)',marginBottom:12}}>{msg}</div>}
    <div style={{background:'#fff',border:'0.5px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
      {loading?<div style={{padding:20,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>:
      filtered.length===0?<div style={{padding:20,color:'var(--text-tertiary)',fontSize:13}}>No operators found.</div>:
      <div style={{overflowX:'auto' as const}}><table className="riden-table">
        <thead><tr><th>Company</th><th>Phone</th><th>City</th><th>Status</th><th>Verified</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((o:any)=>(
          <tr key={o.id}>
            <td style={{fontWeight:500}}>{o.company_name}</td>
            <td style={{color:'var(--text-secondary)'}}>{o.phone||'—'}</td>
            <td style={{color:'var(--text-secondary)'}}>{o.base_location||'—'}</td>
            <td><span className={'badge '+(o.status==='active'?'badge-progress':'badge-warning')}>{o.status||'pending'}</span></td>
            <td style={{color:o.is_verified?'var(--success)':'var(--warning)',fontSize:12,fontWeight:500}}>{o.is_verified?'✓ Yes':'− No'}</td>
            <td><div style={{display:'flex',gap:6}}>
              {!o.is_verified&&<button onClick={()=>act(o.id,'verify',o.line_user_id,o.company_name)} disabled={acting===o.id+'verify'} style={{fontSize:11,padding:'3px 8px',borderRadius:5,background:'rgba(25,201,119,0.08)',color:'var(--accent)',border:'none',cursor:'pointer',fontWeight:500,opacity:acting===o.id+'verify'?0.5:1}}>✓ Verify</button>}
              {o.status!=='suspended'&&o.is_verified&&<button onClick={()=>act(o.id,'suspend',o.line_user_id,o.company_name)} disabled={acting===o.id+'suspend'} style={{fontSize:11,padding:'3px 8px',borderRadius:5,background:'rgba(239,68,68,0.07)',color:'var(--danger)',border:'none',cursor:'pointer',fontWeight:500}}>Suspend</button>}
            </div></td>
          </tr>
        ))}</tbody>
      </table></div>}
    </div>
  </AdminShell>);
}
