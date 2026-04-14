'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/functions/v1';

const vTypes = [
  { value:'sedan', label:'Sedan' },{ value:'suv', label:'SUV' },
  { value:'van_9', label:'Van 9 seats' },{ value:'van_12', label:'Van 12 seats' },
  { value:'minibus_15', label:'Minibus 15' },{ value:'minibus_20', label:'Minibus 20' },
  { value:'coach_30', label:'Coach 30+' },{ value:'pickup', label:'Pickup' },
];
const bTypes = [
  { value:'airport_transfer', label:'Airport Transfer' },{ value:'sightseeing', label:'Sightseeing' },
  { value:'hotel_transfer', label:'Hotel Transfer' },{ value:'day_tour', label:'Day Tour' },
  { value:'custom', label:'Custom' },
];

export default function CreateBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [operators, setOperators] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [form, setForm] = useState({
    client_name:'', source_agent:'', booking_type:'day_tour',
    adults_count:2, children_count:0, special_requirements:'', notes:'',
    flight_number:'', preferred_operator_id:'', send_directly_to_pool:false,
  });
  const [days, setDays] = useState([{ trip_date:'', pickup_time:'09:00', pickup_location:'', dropoff_location:'', vehicle_type:'van_9' }]);
  const dmcId = typeof window !== 'undefined' ? localStorage.getItem('dmc_id') || '' : '';

  useEffect(() => {
    if (searchQ.length >= 2) {
      fetch(SUPA+'/operator-search?action=search&q='+encodeURIComponent(searchQ)+'&dmc_id='+dmcId)
        .then(r=>r.json()).then(d=>setOperators(d.operators||[]));
    } else setOperators([]);
  }, [searchQ]);

  function addDay() { setDays([...days, { ...days[days.length-1], trip_date:'' }]); }
  function removeDay(i: number) { setDays(days.filter((_,idx)=>idx!==i)); }
  function updateDay(i: number, f: string, v: string) { setDays(days.map((d,idx)=>idx===i?{...d,[f]:v}:d)); }

  async function handleSubmit() {
    if (!form.client_name || !dmcId) { setMsg('Missing client name or DMC ID'); return; }
    if (days.some(d=>!d.trip_date||!d.pickup_location||!d.dropoff_location)) { setMsg('Please fill all day details'); return; }
    setLoading(true);
    try {
      const res = await fetch(SUPA+'/create-booking', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({...form, dmc_id:dmcId, days})
      });
      const data = await res.json();
      if (data.ok) { setMsg('Booking '+data.booking_ref+' created! Sending to operator...'); setTimeout(()=>router.push('/dmc/bookings'),2000); }
      else setMsg('Error: '+(data.error||'Failed'));
    } catch(e:any) { setMsg('Error: '+e.message); }
    setLoading(false);
  }

  const pg:React.CSSProperties={minHeight:'100vh',background:'#07100D',color:'#e8f5f0',fontFamily:'Inter,sans-serif',padding:'20px'};
  const card:React.CSSProperties={background:'#0d1e19',border:'1px solid #1a3028',borderRadius:12,padding:16,marginBottom:16};
  const lbl:React.CSSProperties={fontSize:12,color:'#7aab94',marginBottom:4,display:'block'};
  const inp:React.CSSProperties={width:'100%',background:'#0a1a15',border:'1px solid #1a3028',borderRadius:8,padding:'10px 12px',color:'#e8f5f0',fontSize:14,boxSizing:'border-box'};
  const sel:React.CSSProperties={width:'100%',background:'#0a1a15',border:'1px solid #1a3028',borderRadius:8,padding:'10px 12px',color:'#e8f5f0',fontSize:14};
  const row:React.CSSProperties={display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12};
  const sec:React.CSSProperties={fontSize:16,fontWeight:700,marginBottom:12,color:'#19C977'};

  return (
    <div style={pg}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <a href="/dmc/bookings" style={{color:'#19C977',textDecoration:'none'}}>Back</a>
        <h1 style={{fontSize:22,fontWeight:800,margin:0}}>Create Booking</h1>
      </div>
      {msg && <div style={{background:'#0f2a1f',border:'1px solid #19C977',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#19C977'}}>{msg}</div>}
      <div style={card}>
        <div style={sec}>Client Information</div>
        <div style={row}>
          <div><label style={lbl}>Client Name *</label><input style={inp} value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})} placeholder="Tourist or agent name" /></div>
          <div><label style={lbl}>Source Agent</label><input style={inp} value={form.source_agent} onChange={e=>setForm({...form,source_agent:e.target.value})} placeholder="Agency name" /></div>
        </div>
        <div style={row}>
          <div><label style={lbl}>Booking Type</label><select style={sel} value={form.booking_type} onChange={e=>setForm({...form,booking_type:e.target.value})}>{bTypes.map(b=><option key={b.value} value={b.value}>{b.label}</option>)}</select></div>
          <div><label style={lbl}>Flight Number</label><input style={inp} value={form.flight_number} onChange={e=>setForm({...form,flight_number:e.target.value})} placeholder="Optional" /></div>
        </div>
        <div style={row}>
          <div><label style={lbl}>Adults</label><input style={inp} type="number" value={form.adults_count} onChange={e=>setForm({...form,adults_count:parseInt(e.target.value)||1})} min={1} /></div>
          <div><label style={lbl}>Children</label><input style={inp} type="number" value={form.children_count} onChange={e=>setForm({...form,children_count:parseInt(e.target.value)||0})} min={0} /></div>
        </div>
        <div style={{marginBottom:12}}><label style={lbl}>Special Requirements</label><input style={inp} value={form.special_requirements} onChange={e=>setForm({...form,special_requirements:e.target.value})} placeholder="Child seat, wheelchair, English driver..." /></div>
        <div><label style={lbl}>Notes for Operator</label><input style={inp} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Any special instructions" /></div>
      </div>
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={sec}>Trip Days ({days.length})</div>
          <button style={{background:'transparent',color:'#19C977',border:'1px solid #19C977',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer'}} onClick={addDay}>+ Add Day</button>
        </div>
        {days.map((day,i)=>(
          <div key={i} style={{background:'#0a1a15',border:'1px solid #1a3028',borderRadius:8,padding:12,marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:700,color:'#19C977'}}>Day {i+1}</span>
              {days.length>1&&<button style={{background:'transparent',border:'none',color:'#ff6b6b',cursor:'pointer',fontSize:12}} onClick={()=>removeDay(i)}>Remove</button>}
            </div>
            <div style={row}>
              <div><label style={lbl}>Date *</label><input style={inp} type="date" value={day.trip_date} onChange={e=>updateDay(i,'trip_date',e.target.value)} /></div>
              <div><label style={lbl}>Pickup Time</label><input style={inp} type="time" value={day.pickup_time} onChange={e=>updateDay(i,'pickup_time',e.target.value)} /></div>
            </div>
            <div style={{marginBottom:8}}><label style={lbl}>Pickup Location *</label><input style={inp} value={day.pickup_location} onChange={e=>updateDay(i,'pickup_location',e.target.value)} placeholder="Hotel name or address" /></div>
            <div style={{marginBottom:8}}><label style={lbl}>Dropoff Location *</label><input style={inp} value={day.dropoff_location} onChange={e=>updateDay(i,'dropoff_location',e.target.value)} placeholder="Destination" /></div>
            <div><label style={lbl}>Vehicle Type</label><select style={sel} value={day.vehicle_type} onChange={e=>updateDay(i,'vehicle_type',e.target.value)}>{vTypes.map(v=><option key={v.value} value={v.value}>{v.label}</option>)}</select></div>
          </div>
        ))}
      </div>
      <div style={card}>
        <div style={sec}>Send To</div>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Search Preferred Operator</label>
          <input style={inp} value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Type operator name, city or RIDEN ID..." />
          {operators.length>0&&<div style={{background:'#0a1a15',border:'1px solid #1a3028',borderRadius:8,marginTop:4,maxHeight:200,overflowY:'auto'}}>
            {operators.map((op:any)=>(
              <div key={op.id} onClick={()=>{setForm({...form,preferred_operator_id:op.id,send_directly_to_pool:false});setSearchQ(op.company_name);setOperators([]);}}
                style={{padding:'10px 12px',borderBottom:'1px solid #1a3028',cursor:'pointer',fontSize:13}}>
                <div style={{fontWeight:600}}>{op.company_name} {op.is_preferred?'★':''}</div>
                <div style={{color:'#7aab94',fontSize:11}}>{op.phone} | {op.base_location} | {op.riden_id}</div>
              </div>
            ))}
          </div>}
          {form.preferred_operator_id&&<div style={{marginTop:6,fontSize:12,color:'#19C977'}}>✅ Operator selected</div>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <input type="checkbox" id="pool" checked={form.send_directly_to_pool} onChange={e=>setForm({...form,send_directly_to_pool:e.target.checked,preferred_operator_id:''})} />
          <label htmlFor="pool" style={{fontSize:13,color:'#7aab94',cursor:'pointer'}}>Send directly to Pool</label>
        </div>
      </div>
      <button style={{background:'#19C977',color:'#07100D',border:'none',borderRadius:8,padding:'14px 24px',fontWeight:700,fontSize:15,cursor:'pointer',width:'100%',opacity:loading?0.6:1}} onClick={handleSubmit} disabled={loading}>
        {loading?'Creating...':'Create Booking & Send to Operator'}
      </button>
    </div>
  );
}