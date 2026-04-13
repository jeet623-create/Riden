'use client';
import { useEffect, useState, useCallback } from 'react';

const API = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-pending`;

type Op = { id:string; company_name:string; phone:string; base_location:string; line_user_id:string; created_at:string };
type Dr = { id:string; full_name:string; vehicle_type:string; vehicle_plate:string; base_location:string; line_user_id:string; created_at:string };

export default function PendingPage() {
    const [ops, setOps] = useState<Op[]>([]);
    const [drs, setDrs] = useState<Dr[]>([]);
    const [tab, setTab] = useState<'op'|'dr'>('op');
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
        setLoading(true);
        try {
                const res = await fetch(`${API}?action=list`);
                const data = await res.json();
                setOps(data.operators || []);
                setDrs(data.drivers || []);
        } catch(e) { console.error(e); }
        setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(type: string, id: string, action: string, line_user_id: string, name: string) {
        const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, action, line_user_id, name })
        });
        const data = await res.json();
        setMsg(data.msg || data.error || 'Done');
        load();
  }

  const s = {
        page: {minHeight:'100vh',background:'#07100D',color:'#e8f5f0',fontFamily:'Inter,sans-serif',padding:'24px 20px'} as React.CSSProperties,
        card: {background:'#0d1e19',border:'1px solid #1a3028',borderRadius:12,padding:16,marginBottom:12} as React.CSSProperties,
        badge: {background:'#1a3028',color:'#f5a623',fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:20,display:'inline-block',marginBottom:6} as React.CSSProperties,
        detail: {fontSize:13,color:'#7aab94',lineHeight:1.7} as React.CSSProperties,
        btnV: {background:'#19C977',color:'#07100D',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,fontSize:13,cursor:'pointer'} as React.CSSProperties,
        btnR: {background:'transparent',color:'#ff6b6b',border:'1px solid #ff6b6b',borderRadius:8,padding:'8px 16px',fontWeight:600,fontSize:13,cursor:'pointer'} as React.CSSProperties,
  };

  const tabBtn = (a:boolean):React.CSSProperties => ({padding:'8px 20px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:600,fontSize:14,background:a?'#19C977':'#0f1f1a',color:a?'#07100D':'#7aab94'});

  return (
        <div style={s.page}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
                          <a href="/admin/dashboard" style={{color:'#19C977',textDecoration:'none',fontSize:14}}>Admin</a>a>
                          <h1 style={{fontSize:22,fontWeight:800,margin:0}}>Pending Verification</h1>h1>
                </div>div>
          {msg && <div style={{background:'#0f2a1f',border:'1px solid #19C977',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#19C977'}}>{msg}</div>div>}
                <div style={{display:'flex',gap:8,marginBottom:20}}>
                          <button style={tabBtn(tab==='op')} onClick={()=>setTab('op')}>Operators ({ops.length})</button>button>
                          <button style={tabBtn(tab==='dr')} onClick={()=>setTab('dr')}>Drivers ({drs.length})</button>button>
                </div>div>
          {loading && <div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>Loading...</div>div>}
          {!loading && tab==='op' && (ops.length===0
                                              ? <div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>No pending operators</div>div>
                                              : ops.map(op=>(
                                                          <div key={op.id} style={s.card}>
                                                                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                                                                                        <div style={{flex:1}}>
                                                                                                          <div style={s.badge}>OPERATOR</div>div>
                                                                                                          <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{op.company_name}</div>div>
                                                                                                          <div style={s.detail}>
                                                                                                            {op.phone&&<div>{op.phone}</div>div>}
                                                                                                            {op.base_location&&<div>{op.base_location}</div>div>}
                                                                                                                            <div>{new Date(op.created_at).toLocaleDateString('en-GB')}</div>div>
                                                                                                            </div>div>
                                                                                          </div>div>
                                                                                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                                                                                      <button style={s.btnV} onClick={()=>act('operator',op.id,'verify',op.line_user_id,op.company_name)}>Verify</button>button>
                                                                                                      <button style={s.btnR} onClick={()=>act('operator',op.id,'reject',op.line_user_id,op.company_name)}>Reject</button>button>
                                                                                        </div>div>
                                                                        </div>div>
                                                          </div>div>
                                                        ))
                                            )}
          {!loading && tab==='dr' && (drs.length===0
                                              ? <div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>No pending drivers</div>div>
                                              : drs.map(dr=>(
                                                          <div key={dr.id} style={s.card}>
                                                                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                                                                                    <div style={{flex:1}}>
                                                                                                    <div style={s.badge}>DRIVER</div>div>
                                                                                                    <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{dr.full_name}</div>div>
                                                                                                    <div style={s.detail}>
                                                                                                      {dr.vehicle_type&&<div>{dr.vehicle_type.replace(/_/g,' ').toUpperCase()}</div>div>}
                                                                                                      {dr.vehicle_plate&&<div>{dr.vehicle_plate}</div>div>}
                                                                                                      {dr.base_location&&<div>{dr.base_location}</div>div>}
                                                                                                                      <div>{new Date(dr.created_at).toLocaleDateString('en-GB')}</div>div>
                                                                                                      </div>div>
                                                                                    </div>div>
                                                                                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                                                                                    <button style={s.btnV} onClick={()=>act('driver',dr.id,'verify',dr.line_user_id,dr.full_name)}>Verify</button>button>
                                                                                                    <button style={s.btnR} onClick={()=>act('driver',dr.id,'reject',dr.line_user_id,dr.full_name)}>Reject</button>button>
                                                                                    </div>div>
                                                                      </div>div>
                                                          </div>div>
                                                        ))
                                            )}
        </div>div>
      );
}</div>
