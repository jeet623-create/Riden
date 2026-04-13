'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Op = { id:string; company_name:string; contact_name:string; phone:string; base_location:string; line_user_id:string; created_at:string };
type Dr = { id:string; full_name:string; license_number:string; vehicle_type:string; vehicle_plate:string; base_location:string; line_user_id:string; created_at:string };

async function notifyLine(lineUserId: string, text: string) {
  const { data: cfg } = await sb.from('app_config').select('value').eq('key','LINE_CHANNEL_ACCESS_TOKEN').single();
  if (!cfg?.value) return;
  await fetch('https://api.line.me/v2/bot/message/push', {
    method:'POST', headers:{'Content-Type':'application/json','Authorization':"Bearer "+cfg.value},
    body: JSON.stringify({ to: lineUserId, messages:[{type:'text',text}] })
  });
}

export default function PendingPage() {
  const [ops, setOps] = useState<Op[]>([]);
  const [drs, setDrs] = useState<Dr[]>([]);
  const [tab, setTab] = useState<'op'|'dr'>('op');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: a }, { data: b }] = await Promise.all([
      sb.from('operators').select('*').eq('is_verified', false).order('created_at',{ascending:false}),
      sb.from('drivers').select('*').eq('is_verified', false).order('created_at',{ascending:false})
    ]);
    setOps(a||[]); setDrs(b||[]); setLoading(false);
  }

  async function verifyOp(op: Op) {
    await sb.from('operators').update({ is_verified:true, status:'active' }).eq('id', op.id);
    if (op.line_user_id) await notifyLine(op.line_user_id, '✅ บัญชีผู้ประกอบการของคุณได้รับการยืนยันแล้ว! เริ่มรับงานผ่าน RIDEN ได้ทันที 🚗');
    setMsg('✅ Verified: ' + op.company_name); load();
  }
  async function rejectOp(op: Op) {
    await sb.from('operators').update({ status:'suspended' }).eq('id', op.id);
    if (op.line_user_id) await notifyLine(op.line_user_id, '❌ บัญชีของคุณได้รับการปฏิเสธ ติดต่อ RIDEN');
    setMsg('❌ Rejected'); load();
  }
  async function verifyDr(dr: Dr) {
    await sb.from('drivers').update({ is_verified:true, is_active:true }).eq('id', dr.id);
    if (dr.line_user_id) await notifyLine(dr.line_user_id, '✅ บัญชีคนขับของคุณได้รับการยืนยันแล้ว! เริ่มรับงานได้ทันที 🚗');
    setMsg('✅ Verified: ' + dr.full_name); load();
  }
  async function rejectDr(dr: Dr) {
    await sb.from('drivers').update({ is_active:false }).eq('id', dr.id);
    if (dr.line_user_id) await notifyLine(dr.line_user_id, '❌ ใบสมัครของคุณได้รับการปฏิเสธ ติดต่อ RIDEN');
    setMsg('❌ Rejected'); load();
  }

  const pg: React.CSSProperties = { minHeight:'100vh', background:'#07100D', color:'#e8f5f0', fontFamily:'Inter,sans-serif', padding:'24px 20px' };
  const card: React.CSSProperties = { background:'#0d1e19', border:'1px solid #1a3028', borderRadius:12, padding:16, marginBottom:12 };
  const row: React.CSSProperties = { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 };
  const badge: React.CSSProperties = { background:'#1a3028', color:'#f5a623', fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, display:'inline-block', marginBottom:6 };
  const detail: React.CSSProperties = { fontSize:13, color:'#7aab94', lineHeight:1.7 };
  const lineId: React.CSSProperties = { fontSize:11, color:'#4a7a62', fontFamily:'monospace', marginTop:4 };
  const actions: React.CSSProperties = { display:'flex', flexDirection:'column', gap:6 };
  const btnV: React.CSSProperties = { background:'#19C977', color:'#07100D', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:13, cursor:'pointer' };
  const btnR: React.CSSProperties = { background:'transparent', color:'#ff6b6b', border:'1px solid #ff6b6b', borderRadius:8, padding:'8px 16px', fontWeight:600, fontSize:13, cursor:'pointer' };
  const tabBtn = (a:boolean): React.CSSProperties => ({ padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, background:a?'#19C977':'#0f1f1a', color:a?'#07100D':'#7aab94' });

  return (
    <div style={pg}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <a href="/admin" style={{color:'#19C977',textDecoration:'none',fontSize:14}}>← Admin</a>
        <h1 style={{fontSize:22,fontWeight:800,margin:0}}>🔍 Pending Verification</h1>
      </div>
      {msg && <div style={{background:'#0f2a1f',border:'1px solid #19C977',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#19C977'}}>{msg}</div>}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <button style={tabBtn(tab==='op')} onClick={()=>setTab('op')}>🏢 Operators ({ops.length})</button>
        <button style={tabBtn(tab==='dr')} onClick={()=>setTab('dr')}>🧑‍✈️ Drivers ({drs.length})</button>
      </div>
      {loading && <div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>Loading...</div>}
      {!loading && tab==='op' && (ops.length===0
        ? <div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>No pending operators ✅</div>
        : ops.map(op=>(
          <div key={op.id} style={card}>
            <div style={row}>
              <div style={{flex:1}}>
                <div style={badge}>OPERATOR</div>
                <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{op.company_name}</div>
                <div style={detail}>
                  {op.contact_name&&<div>👤 {op.contact_name}</div>}
                  {op.phone&&<div>📞 {op.phone}</div>}
                  {op.base_location&&<div>📍 {op.base_location}</div>}
                  <div>🗓 {new Date(op.created_at).toLocaleDateString('th-TH')}</div>
                </div>
                {op.line_user_id&&<div style={lineId}>LINE: {op.line_user_id.slice(0,16)}...</div>}
              </div>
              <div style={actions}>
                <button style={btnV} onClick={()=>verifyOp(op)}>✅ Verify</button>
                <button style={btnR} onClick={()=>rejectOp(op)}>❌ Reject</button>
              </div>
            </div>
          </div>
        ))
      )}
      {!loading && tab==='dr' && (drs.length===0
        ? <div style={{textAlign:'center',color:'#7aab94',padding:'40px 0'}}>No pending drivers ✅</div>
        : drs.map(dr=>(
          <div key={dr.id} style={card}>
            <div style={row}>
              <div style={{flex:1}}>
                <div style={badge}>DRIVER</div>
                <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{dr.full_name}</div>
                <div style={detail}>
                  {dr.license_number&&<div>📝 License: {dr.license_number}</div>}
                  {dr.vehicle_type&&<div>🚗 {dr.vehicle_type.replace('_',' ').toUpperCase()}</div>}
                  {dr.vehicle_plate&&<div>🔵 {dr.vehicle_plate}</div>}
                  {dr.base_location&&<div>📍 {dr.base_location}</div>}
                  <div>🗓 {new Date(dr.created_at).toLocaleDateString('th-TH')}</div>
                </div>
                {dr.line_user_id&&<div style={lineId}>LINE: {dr.line_user_id.slice(0,16)}...</div>}
              </div>
              <div style={actions}>
                <button style={btnV} onClick={()=>verifyDr(dr)}>✅ Verify</button>
                <button style={btnR} onClick={()=>rejectDr(dr)}>❌ Reject</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
