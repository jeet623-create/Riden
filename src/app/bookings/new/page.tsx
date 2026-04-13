'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const VEHICLE_TYPES = ['sedan','van_9','van_12','minibus_15','minibus_20','coach_30','coach_40plus','suv','pickup']
const BOOKING_TYPES = ['airport_transfer','hotel_transfer','sightseeing','day_tour','custom']
const TEAL = '#19C977'

type Operator = { id:string; company_name:string; status:string; is_verified:boolean; base_location:string|null; line_user_id:string|null }

export default function NewBookingPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [operators, setOperators] = useState<Operator[]>([])
  const [showDispatch, setShowDispatch] = useState(false)
  const [dispatchMode, setDispatchMode] = useState<'single'|'multiple'|'pool'>('single')
  const [selectedOps, setSelectedOps] = useState<string[]>([])
  const [createdBookingId, setCreatedBookingId] = useState<string|null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const [form, setForm] = useState({
    client_name:'', booking_type:'airport_transfer', flight_number:'',
    adults_count:1, children_count:0, special_requirements:'', notes:'',
    days:[{ trip_date:'', pickup_time:'09:00', pickup_location:'', dropoff_location:'', vehicle_type:'van_9', pax_count:1 }]
  })

  useEffect(() => {
    createClient().from('operators').select('id,company_name,status,is_verified,base_location,line_user_id')
      .eq('status','active').order('company_name')
      .then(({data}) => setOperators(data ?? []))
  }, [])

  function setF(k:string, v:any) { setForm(f=>({...f,[k]:v})) }
  function setDay(i:number, k:string, v:any) {
    setForm(f=>{ const d=[...f.days]; d[i]={...d[i],[k]:v}; return {...f,days:d} })
  }
  function addDay() {
    setForm(f=>({...f,days:[...f.days,{trip_date:'',pickup_time:'09:00',pickup_location:'',dropoff_location:'',vehicle_type:'van_9',pax_count:1}]}))
  }
  function removeDay(i:number) {
    if (form.days.length===1) return
    setForm(f=>({...f,days:f.days.filter((_,idx)=>idx!==i)}))
  }

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const sb = createClient()
    const {data:{user}} = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }

    const ref = 'BK' + Date.now().toString().slice(-6)
    const {data:booking, error:bErr} = await sb.from('bookings').insert({
      dmc_id:user.id, booking_ref:ref, booking_type:form.booking_type,
      client_name:form.client_name, flight_number:form.flight_number||null,
      adults_count:form.adults_count, children_count:form.children_count,
      total_days:form.days.length, status:'pending',
      special_requirements:form.special_requirements||null, notes:form.notes||null
    }).select().single()

    if (bErr||!booking) { toast.error(bErr?.message||'Error'); setSubmitting(false); return }

    for (let i=0; i<form.days.length; i++) {
      const d = form.days[i]
      await sb.from('trips').insert({
        booking_id:booking.id, dmc_id:user.id, day_number:i+1,
        trip_date:d.trip_date, pickup_time:d.pickup_time,
        pickup_location:d.pickup_location, dropoff_location:d.dropoff_location,
        vehicle_type:d.vehicle_type, pax_count:d.pax_count, status:'pending'
      })
    }

    setCreatedBookingId(booking.id)
    setSubmitting(false)
    setShowDispatch(true)
  }

  async function handleDispatch() {
    if (!createdBookingId) return
    setSending(true)
    const sb = createClient()
    if (dispatchMode==='pool') {
      await sb.functions.invoke('booking-created',{body:{bookingId:createdBookingId}})
    } else {
      for (const opId of selectedOps) {
        await sb.functions.invoke('booking-created',{body:{bookingId:createdBookingId,operatorId:opId}})
      }
    }
    setSending(false); setSent(true)
    setTimeout(()=>router.push('/bookings'),1800)
  }

  async function skipDispatch() {
    router.push('/bookings')
  }

  function toggleOp(id:string) {
    if (dispatchMode==='single') setSelectedOps([id])
    else setSelectedOps(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  }

  const BG='#07100D', S2='#111F15', S3='#16271A'
  const BORDER='rgba(255,255,255,0.08)', BORDER_HI='rgba(255,255,255,0.14)'
  const TEXT='#EDF5F0', TEXT2='#7A9A87', TEXT3='#3D5C47'
  const F="'Inter',-apple-system,sans-serif"
  const FM="'JetBrains Mono',monospace"
  const inp = {width:'100%',background:S3,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,fontFamily:F,fontSize:14,padding:'10px 13px',outline:'none',boxSizing:'border-box' as const}
  const lbl = {display:'block' as const,fontSize:10,fontFamily:FM,letterSpacing:'0.1em',textTransform:'uppercase' as const,color:TEXT3,marginBottom:7}

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:F,WebkitFontSmoothing:'antialiased'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        input:focus,select:focus,textarea:focus{border-color:${TEAL}!important;box-shadow:0 0 0 3px rgba(25,201,119,0.12)!important;background:${S2}!important}
        input::placeholder,textarea::placeholder{color:${TEXT3}}
        select option{background:${S3}}
        ::-webkit-calendar-picker-indicator{filter:invert(1)}
      `}</style>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid ${BORDER}`,background:'rgba(7,16,13,0.9)',backdropFilter:'blur(20px)',padding:'0 24px',height:56,display:'flex',alignItems:'center',gap:16,position:'sticky',top:0,zIndex:40}}>
        <Link href="/bookings" style={{color:TEXT2,textDecoration:'none',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Bookings
        </Link>
        <span style={{color:BORDER_HI}}>|</span>
        <span style={{fontWeight:700,fontSize:15,color:TEXT}}>New Booking</span>
      </nav>

      <main style={{maxWidth:720,margin:'0 auto',padding:'32px 24px'}}>
        <h1 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.03em',color:TEXT,marginBottom:28}}>New Booking</h1>

        <form onSubmit={handleSubmit}>
          {/* Booking Details */}
          <div style={{background:S2,border:`1px solid ${BORDER}`,borderRadius:16,padding:'24px 20px',marginBottom:20}}>
            <h2 style={{fontSize:13,fontFamily:FM,letterSpacing:'0.08em',textTransform:'uppercase',color:TEAL,marginBottom:20}}>Booking Details</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div style={{gridColumn:'1/-1'}}>
                <label style={lbl}>Client Name *</label>
                <input style={inp} value={form.client_name} onChange={e=>setF('client_name',e.target.value)} required placeholder="e.g. Wang Family" />
              </div>
              <div>
                <label style={lbl}>Booking Type</label>
                <select style={inp} value={form.booking_type} onChange={e=>setF('booking_type',e.target.value)}>
                  {BOOKING_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Flight Number</label>
                <input style={inp} value={form.flight_number} onChange={e=>setF('flight_number',e.target.value)} placeholder="TG305 (optional)" />
              </div>
              <div>
                <label style={lbl}>Adults</label>
                <input style={inp} type="number" min="1" value={form.adults_count} onChange={e=>setF('adults_count',Number(e.target.value))} />
              </div>
              <div>
                <label style={lbl}>Children</label>
                <input style={inp} type="number" min="0" value={form.children_count} onChange={e=>setF('children_count',Number(e.target.value))} />
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <label style={lbl}>Special Requirements</label>
                <textarea style={{...inp,resize:'none'}} rows={2} value={form.special_requirements} onChange={e=>setF('special_requirements',e.target.value)} placeholder="Wheelchair, baby seat, etc." />
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <label style={lbl}>Internal Notes</label>
                <textarea style={{...inp,resize:'none'}} rows={2} value={form.notes} onChange={e=>setF('notes',e.target.value)} placeholder="Visible only to your team" />
              </div>
            </div>
          </div>

          {/* Trip Days */}
          <div style={{marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <h2 style={{fontSize:13,fontFamily:FM,letterSpacing:'0.08em',textTransform:'uppercase',color:TEAL}}>Trip Days ({form.days.length})</h2>
              <button type="button" onClick={addDay} style={{padding:'6px 14px',background:'transparent',border:`1px solid ${TEAL}`,color:TEAL,borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>+ Add Day</button>
            </div>

            {form.days.map((day,i)=>(
              <div key={i} style={{background:S2,border:`1px solid ${BORDER}`,borderRadius:16,padding:'20px',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:26,height:26,background:TEAL,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>{i+1}</div>
                    <span style={{fontWeight:600,color:TEXT}}>Day {i+1}</span>
                  </div>
                  {form.days.length>1&&(
                    <button type="button" onClick={()=>removeDay(i)} style={{padding:'3px 10px',background:'transparent',border:'1px solid rgba(248,113,113,0.3)',color:'#F87171',borderRadius:6,fontSize:12,cursor:'pointer',fontFamily:F}}>Remove</button>
                  )}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <div>
                    <label style={lbl}>Date *</label>
                    <input style={inp} type="date" value={day.trip_date} onChange={e=>setDay(i,'trip_date',e.target.value)} required />
                  </div>
                  <div>
                    <label style={lbl}>Pickup Time</label>
                    <input style={inp} type="time" value={day.pickup_time} onChange={e=>setDay(i,'pickup_time',e.target.value)} />
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={lbl}>Pickup Location *</label>
                    <input style={inp} value={day.pickup_location} onChange={e=>setDay(i,'pickup_location',e.target.value)} required placeholder="e.g. Suvarnabhumi Airport" />
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={lbl}>Drop-off Location *</label>
                    <input style={inp} value={day.dropoff_location} onChange={e=>setDay(i,'dropoff_location',e.target.value)} required placeholder="e.g. Centara Grand Hotel" />
                  </div>
                  <div>
                    <label style={lbl}>Vehicle Type</label>
                    <select style={inp} value={day.vehicle_type} onChange={e=>setDay(i,'vehicle_type',e.target.value)}>
                      {VEHICLE_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Passengers</label>
                    <input style={inp} type="number" min="1" value={day.pax_count} onChange={e=>setDay(i,'pax_count',Number(e.target.value))} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting} style={{width:'100%',padding:'14px',background:submitting?'#148f55':TEAL,color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:submitting?'not-allowed':'pointer',fontFamily:F,boxShadow:'0 4px 16px rgba(25,201,119,0.3)',letterSpacing:'-0.01em'}}>
            {submitting?'Saving booking...':'Save & Send to Operator →'}
          </button>
        </form>
      </main>

      {/* ── Operator Dispatch Modal ── */}
      {showDispatch&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:S2,border:`1px solid ${BORDER_HI}`,borderRadius:20,width:'100%',maxWidth:520,maxHeight:'88vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.7)'}}>

            {sent?(
              <div style={{padding:56,textAlign:'center'}}>
                <div style={{fontSize:52,marginBottom:16}}>✅</div>
                <h3 style={{fontWeight:800,fontSize:20,color:TEXT,marginBottom:8}}>Sent via LINE!</h3>
                <p style={{color:TEXT2,fontSize:14}}>Operator will receive the job notification now.</p>
                <p style={{color:TEXT3,fontSize:12,marginTop:8}}>Redirecting to bookings...</p>
              </div>
            ):(
              <>
                {/* Header */}
                <div style={{padding:'20px 24px',borderBottom:`1px solid ${BORDER}`,display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
                  <div>
                    <h3 style={{fontWeight:800,fontSize:17,color:TEXT,marginBottom:3}}>Send Booking to Operator</h3>
                    <p style={{fontSize:12,color:TEXT2}}>Booking saved ✔ Choose who receives this job via LINE</p>
                  </div>
                  <button onClick={()=>setShowDispatch(false)} style={{width:28,height:28,borderRadius:'50%',background:S3,border:`1px solid ${BORDER}`,color:TEXT2,cursor:'pointer',fontSize:18,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginLeft:12}}>×</button>
                </div>

                {/* Mode picker */}
                <div style={{padding:'16px 24px 0'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                    {([['single','Single Operator','Best for one'],['multiple','Multiple','Pick several'],['pool','Broadcast All','First to accept']] as const).map(([mode,label,sub])=>(
                      <button key={mode} onClick={()=>{setDispatchMode(mode);setSelectedOps([])}} type="button" style={{padding:'11px 10px',background:dispatchMode===mode?'rgba(25,201,119,0.1)':S3,border:`2px solid ${dispatchMode===mode?TEAL:BORDER}`,borderRadius:12,cursor:'pointer',textAlign:'left',transition:'all 0.15s',fontFamily:F}}>
                        <div style={{fontSize:12,fontWeight:700,color:dispatchMode===mode?TEAL:TEXT,marginBottom:2}}>{label}</div>
                        <div style={{fontSize:10,color:TEXT3}}>{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operator list OR Pool message */}
                {dispatchMode!=='pool'?(
                  <div style={{flex:1,overflowY:'auto',padding:'14px 24px'}}>
                    <div style={{fontSize:10,fontFamily:FM,letterSpacing:'0.1em',textTransform:'uppercase',color:TEXT3,marginBottom:10}}>
                      {operators.length} active operators
                    </div>
                    {operators.length===0?(
                      <div style={{padding:'28px 0',textAlign:'center',color:TEXT2,fontSize:13}}>No active operators. Add operators via Admin panel.</div>
                    ):operators.map(op=>{
                      const sel = selectedOps.includes(op.id)
                      return (
                        <div key={op.id} onClick={()=>toggleOp(op.id)} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',background:sel?'rgba(25,201,119,0.08)':'transparent',border:`1px solid ${sel?TEAL:BORDER}`,borderRadius:12,marginBottom:8,cursor:'pointer',transition:'all 0.12s'}}>
                          <div style={{width:38,height:38,borderRadius:10,background:sel?TEAL:S3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:sel?'#fff':TEXT2,flexShrink:0}}>
                            {op.company_name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:14,color:TEXT,marginBottom:2}}>{op.company_name}</div>
                            <div style={{fontSize:12,color:TEXT2}}>
                              {op.base_location||'No location'}
                              {op.line_user_id?' · 📱 LINE connected':' · No LINE ID'}
                              {op.is_verified?' · ✓ Verified':''}
                            </div>
                          </div>
                          <div style={{width:20,height:20,borderRadius:'50%',background:sel?TEAL:'transparent',border:`2px solid ${sel?TEAL:BORDER_HI}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {sel&&<span style={{color:'#fff',fontSize:11,lineHeight:1}}>✓</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ):(
                  <div style={{padding:'32px 24px',textAlign:'center'}}>
                    <div style={{fontSize:40,marginBottom:12}}>📡</div>
                    <p style={{color:TEXT,fontWeight:700,fontSize:15,marginBottom:6}}>Broadcast to All Operators</p>
                    <p style={{color:TEXT2,fontSize:13,lineHeight:1.6}}>{operators.length} active operators will receive this job simultaneously via LINE.
The first operator to accept gets the booking.</p>
                  </div>
                )}

                {/* Footer buttons */}
                <div style={{padding:'14px 24px 20px',borderTop:`1px solid ${BORDER}`,display:'flex',flexDirection:'column',gap:8}}>
                  <button onClick={handleDispatch} disabled={sending||(dispatchMode!=='pool'&&selectedOps.length===0)} type="button"
                    style={{width:'100%',padding:'13px',background:(sending||(dispatchMode!=='pool'&&selectedOps.length===0))?S3:TEAL,color:(dispatchMode!=='pool'&&selectedOps.length===0)?TEXT3:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:(sending||(dispatchMode!=='pool'&&selectedOps.length===0))?'not-allowed':'pointer',fontFamily:F,transition:'all 0.15s'}}>
                    {sending?'Sending via LINE...':
                     dispatchMode==='pool'?`📡 Broadcast to All ${operators.length} Operators`:
                     `📱 Send to ${selectedOps.length||0} Operator${selectedOps.length!==1?'s':''} via LINE`}
                  </button>
                  <button onClick={skipDispatch} type="button" style={{width:'100%',padding:'10px',background:'transparent',border:'none',color:TEXT3,fontSize:13,cursor:'pointer',fontFamily:F}}>
                    Skip — notify later
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}