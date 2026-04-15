'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
const API = (process.env.NEXT_PUBLIC_SUPABASE_URL||'')+'/functions/v1';
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
const PLANS = ['starter','growth','pro'];
export default function AdminSubscriptionsPage() {
  const [dmcs,setDmcs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [activating,setActivating]=useState<string|null>(null);
  const [form,setForm]=useState<Record<string,{plan:string;start:string;end:string;notes:string}>>({});
  useEffect(()=>{load();},[]);
  async function load(){setLoading(true);const r=await fetch(API+'/admin-subscriptions');const d=await r.json();setDmcs(d.dmcs||[]);setLoading(false);}
  function getForm(id:string) { return form[id] || {plan:'starter',start:new Date().toISOString().slice(0,10),end:new Date(Date.now()+365*24*3600000).toISOString().slice(0,10),notes:''} }
  function setF(id:string, k:string, v:string) { setForm(f=>({...f,[id]:{...getForm(id),[k]:v}})) }
  async function activate(dmc:any) {
    const f = getForm(dmc.id); setActivating(dmc.id);
    const r=await fetch(API+'/admin-subscriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'activate',dmc_id:dmc.id,...f})});
    const d=await r.json();
    if(d.ok){toast.success(dmc.company_name+' activated!');load();}else toast.error(d.error||'Error');
    setActivating(null);
  }
  return (
    <AdminShell active="/admin/subscriptions">
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',marginBottom:1}}>Subscriptions</h1>
        <p style={{fontSize:12,color:'var(--text-tertiary)'}}>Activate plans after bank transfer confirmation</p>
      </div>
      {loading?(<div style={{padding:40,textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>):
      dmcs.length===0?(<div style={{padding:40,textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>No DMCs registered.</div>):
      <div style={{display:'flex',flexDirection:'column' as const,gap:10}}>
        {dmcs.map((d:any)=>{
          const f=getForm(d.id);
          const isActive=d.subscription_status==='active';
          return (
            <div key={d.id} className="riden-card" style={{padding:'16px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,flexWrap:'wrap' as const,gap:8}}>
                <div>
                  <div style={{fontWeight:500,fontSize:14,marginBottom:2}}>{d.company_name}</div>
                  <div style={{fontSize:12,color:'var(--text-secondary)'}}>{d.email} · {d.country||'—'}</div>
                </div>
                <span className={'badge '+(isActive?'badge-progress':d.subscription_status==='suspended'?'badge-cancelled':'badge-warning')} style={{fontSize:11}}>{d.subscription_status||'trial'} · {d.subscription_plan||'none'}</span>
              </div>
              {!isActive&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:8,alignItems:'end'}}>
                  <div>
                    <label style={{display:'block',fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:4}}>Plan</label>
                    <select value={f.plan} onChange={e=>setF(d.id,'plan',e.target.value)} className="riden-input" style={{padding:'6px 8px',fontSize:12}}>
                      {PLANS.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:4}}>Start Date</label>
                    <input type="date" value={f.start} onChange={e=>setF(d.id,'start',e.target.value)} className="riden-input" style={{padding:'6px 8px',fontSize:12}}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:4}}>End Date</label>
                    <input type="date" value={f.end} onChange={e=>setF(d.id,'end',e.target.value)} className="riden-input" style={{padding:'6px 8px',fontSize:12}}/>
                  </div>
                  <button onClick={()=>activate(d)} disabled={activating===d.id} className="btn-primary" style={{padding:'7px 16px',fontSize:12,opacity:activating===d.id?0.6:1,whiteSpace:'nowrap' as const}}>
                    {activating===d.id?'...':'Activate'}
                  </button>
                </div>
              )}
              {isActive&&(
                <div style={{fontSize:12,color:'var(--success)'}}>
                  ✓ Active — {d.subscription_plan} plan · expires {d.subscription_end_date||'ongoing'}
                </div>
              )}
            </div>
          )
        })}
      </div>}
    </AdminShell>
  );
}
