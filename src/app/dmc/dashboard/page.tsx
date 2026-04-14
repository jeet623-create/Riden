'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/functions/v1';
export default function DMCDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total:0, pending:0, confirmed:0, in_progress:0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = localStorage.getItem('dmc_id');
    if (!id) { router.push('/dmc/login'); return; }
    setCompany(localStorage.getItem('dmc_company') || 'DMC');
    fetch(SUPA + '/dmc-bookings?dmc_id=' + id + '&limit=5').then(r=>r.json()).then(d=>{ setStats(d.stats||{}); setRecent(d.bookings||[]); setLoading(false); }).catch(()=>setLoading(false));
  }, []);
  function logout() { ['dmc_id','dmc_company'].forEach(k=>localStorage.removeItem(k)); router.push('/dmc/login'); }
  const sc: Record<string,string> = { pending:'#f5a623', confirmed:'#19C977', in_progress:'#1D9E75', completed:'#7aab94', cancelled:'#ff6b6b' };
  return (
    <div style={{minHeight:'100vh',background:'#07100D',color:'#e8f5f0',fontFamily:'Inter,sans-serif',padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div><div style={{fontSize:22,fontWeight:800}}>{company}</div><div style={{fontSize:13,color:'#7aab94'}}>DMC Dashboard</div></div>
        <div style={{display:'flex',gap:10}}>
          <a href="/dmc/bookings/create" style={{background:'#19C977',color:'#07100D',textDecoration:'none',borderRadius:8,padding:'10px 16px',fontWeight:700,fontSize:13}}>+ New Booking</a>
          <button onClick={logout} style={{background:'transparent',color:'#7aab94',border:'1px solid #1a3028',borderRadius:8,padding:'10px 16px',fontSize:13,cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,marginBottom:20}}>
        {([{l:'Total',v:stats.total,c:'#19C977'},{l:'Pending',v:stats.pending,c:'#f5a623'},{l:'Confirmed',v:stats.confirmed,c:'#1D9E75'},{l:'Active',v:stats.in_progress,c:'#60a5fa'}] as const).map((s:any)=>(
          <div key={s.l} style={{background:'#0a1a15',border:'1px solid #1a3028',borderRadius:10,padding:16,textAlign:'center'}}>
            <div style={{fontSize:32,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:12,color:'#7aab94',marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontSize:16,fontWeight:700,color:'#19C977'}}>Recent Bookings</div>
          <a href="/dmc/bookings" style={{fontSize:13,color:'#19C977',textDecoration:'none'}}>View all</a>
        </div>
        {loading ? <div style={{textAlign:'center',color:'#7aab94',padding:'20px 0'}}>Loading...</div>
        : recent.length===0 ? <div style={{textAlign:'center',color:'#7aab94',padding:'30px 0'}}><div style={{fontSize:32,marginBottom:8}}>&#x1F4CB;</div><div>No bookings yet</div><a href="/dmc/bookings/create" style={{color:'#19C977',textDecoration:'none',fontSize:13}}>Create first booking</a></div>
        : recent.map((b:any)=>(
          <div key={b.id} style={{padding:'12px 0',borderBottom:'1px solid #1a3028',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontWeight:600,fontSize:14}}>{b.client_name}</div><div style={{fontSize:12,color:'#7aab94'}}>{b.booking_ref} - {b.total_days} day{b.total_days>1?'s':''}</div></div>
            <div style={{fontSize:12,fontWeight:600,color:sc[b.status]||'#7aab94',textTransform:'capitalize'}}>{b.status?.replace('_',' ')}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <a href="/dmc/bookings" style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:12,padding:16,textDecoration:'none',color:'#e8f5f0',display:'block'}}><div style={{fontSize:24,marginBottom:8}}>&#x1F4CB;</div><div style={{fontWeight:700}}>All Bookings</div><div style={{fontSize:13,color:'#7aab94'}}>View and manage</div></a>
        <a href="/dmc/operators" style={{background:'#0d1e19',border:'1px solid #1a3028',borderRadius:12,padding:16,textDecoration:'none',color:'#e8f5f0',display:'block'}}><div style={{fontSize:24,marginBottom:8}}>&#x1F3E2;</div><div style={{fontWeight:700}}>Operators</div><div style={{fontSize:13,color:'#7aab94'}}>Manage preferred operators</div></a>
      </div>
    </div>
  );
}