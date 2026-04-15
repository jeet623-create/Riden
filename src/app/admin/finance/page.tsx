'use client';
import { useEffect, useState } from 'react';
const ADMIN_LINKS = [{h:'/admin',l:'Dashboard'},{h:'/admin/dmcs',l:'DMCs'},{h:'/admin/operators',l:'Operators'},{h:'/admin/drivers',l:'Drivers'},{h:'/admin/pending',l:'Pending'},{h:'/admin/subscriptions',l:'Subscriptions'},{h:'/admin/finance',l:'Finance'}];
function AdminShell({active,children}:{active:string;children:React.ReactNode}) {
  return (<div style={{display:'flex',minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>
    <div style={{width:220,background:'#fff',borderRight:'0.5px solid var(--border)',flexShrink:0,display:'flex',flexDirection:'column' as const,position:'sticky' as const,top:0,height:'100vh'}}>
      <div style={{padding:'20px 16px 14px',borderBottom:'0.5px solid var(--border)'}}><div style={{display:'flex',alignItems:'baseline',gap:5}}><span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span><span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span></div><div style={{fontSize:10,color:'var(--text-tertiary)',marginTop:1}}>Admin Panel</div></div>
      <nav style={{padding:8,flex:1}}>{ADMIN_LINKS.map(l=>(<a key={l.h} href={l.h} style={{display:'block',padding:'8px 10px',borderRadius:7,fontSize:13,fontWeight:l.h===active?500:400,color:l.h===active?'var(--text-primary)':'var(--text-secondary)',background:l.h===active?'var(--bg-page)':'transparent',textDecoration:'none',marginBottom:1}}>{l.l}</a>))}</nav>
    </div>
    <div style={{flex:1,minWidth:0,padding:'28px 24px'}}>{children}</div>
  </div>);
}

const PLAN_PRICES: Record<string,number> = { trial:0, starter:2000, growth:4000, pro:6000 };

export default function AdminFinancePage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [dmcs, setDmcs] = useState<Record<string,any>>({});
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const [sRes, dRes] = await Promise.all([
      fetch(SUPA+'/rest/v1/subscriptions?select=*&order=activated_at.desc', { headers:{'apikey':KEY,'Authorization':'Bearer '+KEY} }),
      fetch(SUPA+'/rest/v1/dmc_users?select=id,company_name,email,subscription_plan,subscription_status', { headers:{'apikey':KEY,'Authorization':'Bearer '+KEY} })
    ]);
    const subsData = await sRes.json();
    const dmcsData = await dRes.json();
    setSubs(Array.isArray(subsData)?subsData:[]);
    const dm: Record<string,any> = {};
    for (const d of (Array.isArray(dmcsData)?dmcsData:[])) dm[d.id]=d;
    setDmcs(dm);
    setLoading(false);
  }

  // Filter by month if selected
  const filtered = filterMonth
    ? subs.filter(s => s.activated_at && s.activated_at.startsWith(filterMonth))
    : subs;

  // MRR = sum of all active subscriptions per plan price
  const activeSubs = subs.filter(s => s.status==='active');
  const mrr = activeSubs.reduce((sum,s) => sum+(PLAN_PRICES[s.plan]||s.price_thb||0), 0);

  // Total collected = sum of all time
  const totalCollected = subs.reduce((sum,s) => sum+(PLAN_PRICES[s.plan]||s.price_thb||0), 0);

  // Outstanding = active DMCs with no current active subscription
  const activeDmcCount = Object.values(dmcs).filter((d:any) => d.subscription_status==='active').length;
  const trialDmcCount = Object.values(dmcs).filter((d:any) => d.subscription_status==='trial').length;

  function exportExcel() {
    // CSV-based Excel export
    const rows = [
      ['Date','DMC','Email','Plan','Price (THB)','Status','Start','End'],
      ...subs.map(s => [
        s.activated_at ? new Date(s.activated_at).toLocaleDateString('en-GB') : '',
        dmcs[s.dmc_id]?.company_name || s.dmc_id,
        dmcs[s.dmc_id]?.email || '',
        s.plan,
        PLAN_PRICES[s.plan] || s.price_thb || 0,
        s.status,
        s.start_date || '',
        s.end_date || '',
      ])
    ];
    const csv = rows.map(r => r.map(v => '"'+(v||'')+'"').join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'riden-finance-'+new Date().toISOString().slice(0,7)+'.csv';
    a.click();
  }

  return (
    <AdminShell active="/admin/finance">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap' as const,gap:10}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',marginBottom:1}}>Finance Overview</h1>
          <p style={{fontSize:12,color:'var(--text-tertiary)'}}>Subscription revenue and payment history</p>
        </div>
        <button onClick={exportExcel} className="btn-ghost" style={{padding:'7px 14px',fontSize:12}}>Export Excel</button>
      </div>

      {/* KPI Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[
          {l:'Monthly Recurring Revenue',v:'฿'+mrr.toLocaleString(),c:'var(--accent)',sub:'from '+activeSubs.length+' active plans'},
          {l:'Total Collected',v:'฿'+totalCollected.toLocaleString(),c:'var(--success)',sub:'all time'},
          {l:'Active Subscribers',v:activeDmcCount,c:'var(--text-primary)',sub:'paid plans'},
          {l:'On Trial',v:trialDmcCount,c:'var(--warning)',sub:'free 60-day trial'},
        ].map(s=>(
          <div key={s.l} className="riden-card" style={{padding:'14px 16px'}}>
            <div style={{fontSize:22,fontWeight:600,letterSpacing:'-0.5px',color:s.c,lineHeight:1,marginBottom:4}}>{loading?'—':s.v}</div>
            <div style={{fontSize:10,fontWeight:500,color:'var(--text-tertiary)',textTransform:'uppercase' as const,letterSpacing:'0.06em',marginBottom:2}}>{s.l}</div>
            <div style={{fontSize:11,color:'var(--text-tertiary)'}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        {['starter','growth','pro'].map(plan=>{
          const count = activeSubs.filter(s=>s.plan===plan).length;
          const rev = count * PLAN_PRICES[plan];
          return (
            <div key={plan} className="riden-card" style={{padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:500,textTransform:'capitalize' as const}}>{plan}</span>
                <span style={{fontSize:11,color:'var(--text-tertiary)'}}>฿{PLAN_PRICES[plan].toLocaleString()}/mo</span>
              </div>
              <div style={{fontSize:20,fontWeight:600,color:'var(--text-primary)',marginBottom:2}}>{count} DMC{count!==1?'s':''}</div>
              <div style={{fontSize:11,color:'var(--text-tertiary)'}}>฿{rev.toLocaleString()} monthly</div>
            </div>
          );
        })}
      </div>

      {/* Payments table */}
      <div className="riden-card" style={{overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap' as const,gap:8}}>
          <span style={{fontSize:13,fontWeight:500}}>All Payments ({filtered.length})</span>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} className="riden-input" style={{width:'auto',padding:'4px 8px',fontSize:11}}>
              <option value="">All time</option>
              {[...Array(12)].map((_,i)=>{
                const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
                const val = d.toISOString().slice(0,7);
                return <option key={val} value={val}>{MONTHS[d.getMonth()]} {d.getFullYear()}</option>;
              })}
            </select>
          </div>
        </div>
        {loading?(
          <div style={{padding:24,color:'var(--text-tertiary)',fontSize:13}}>Loading...</div>
        ):filtered.length===0?(
          <div style={{padding:'32px 24px',textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>No payments found.</div>
        ):(
          <div style={{overflowX:'auto' as const}}>
            <table className="riden-table">
              <thead><tr><th>Date</th><th>DMC</th><th>Email</th><th>Plan</th><th>Amount</th><th>Status</th><th>Valid Until</th></tr></thead>
              <tbody>
                {filtered.map((s:any,i:number)=>(
                  <tr key={s.id||i}>
                    <td style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-secondary)'}}>{s.activated_at?new Date(s.activated_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'-'}</td>
                    <td style={{fontWeight:500}}>{dmcs[s.dmc_id]?.company_name||'-'}</td>
                    <td style={{color:'var(--text-secondary)',fontSize:12}}>{dmcs[s.dmc_id]?.email||'-'}</td>
                    <td><span style={{textTransform:'capitalize' as const,fontWeight:500}}>{s.plan}</span></td>
                    <td style={{fontFamily:'var(--font-mono)',fontWeight:500,color:'var(--success)'}}>฿{(PLAN_PRICES[s.plan]||s.price_thb||0).toLocaleString()}</td>
                    <td><span className={'badge '+(s.status==='active'?'badge-progress':s.status==='expired'?'badge-cancelled':'badge-warning')}>{s.status}</span></td>
                    <td style={{color:'var(--text-secondary)',fontFamily:'var(--font-mono)',fontSize:11}}>{s.end_date||'-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
