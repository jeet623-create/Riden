'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const TEAL='#19C977',BG='#07100D',S2='#111F15',S3='#16271A'
const BORDER='rgba(255,255,255,0.08)',BORDER_HI='rgba(255,255,255,0.14)'
const TEXT='#EDF5F0',TEXT2='#7A9A87',TEXT3='#3D5C47'
const F="'Inter',-apple-system,sans-serif"
const FM="'JetBrains Mono',monospace"

const VEHICLE_INFO: Record<string,{icon:string;label:string;cap:string}> = {
  sedan:       {icon:'🚗',label:'Sedan',           cap:'1-3 pax'},
  suv:         {icon:'🚙',label:'SUV',             cap:'1-4 pax'},
  van_9:       {icon:'🚐',label:'Van',             cap:'up to 9 pax'},
  van_12:      {icon:'🚐',label:'Van 12',          cap:'up to 12 pax'},
  minibus_15:  {icon:'🚌',label:'Minibus 15',      cap:'up to 15 pax'},
  minibus_20:  {icon:'🚌',label:'Minibus 20',      cap:'up to 20 pax'},
  coach_30:    {icon:'🚍',label:'Coach 30',        cap:'up to 30 pax'},
  coach_40plus:{icon:'🚍',label:'Coach 40+',       cap:'up to 40+ pax'},
  pickup:      {icon:'🚚',label:'Pickup',          cap:'1-3 pax'},
}

const STATUS_COLORS: Record<string,{color:string;bg:string;border:string}> = {
  pending:          {color:'#F59E0B',bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.2)'},
  operator_notified:{color:'#60A5FA',bg:'rgba(96,165,250,0.1)', border:'rgba(96,165,250,0.2)'},
  operator_accepted:{color:'#A78BFA',bg:'rgba(167,139,250,0.1)',border:'rgba(167,139,250,0.2)'},
  driver_assigned:  {color:'#34D399',bg:'rgba(52,211,153,0.1)', border:'rgba(52,211,153,0.2)'},
  in_progress:      {color:'#10B981',bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.2)'},
  completed:        {color:'#19C977',bg:'rgba(25,201,119,0.1)', border:'rgba(25,201,119,0.2)'},
  cancelled:        {color:'#F87171',bg:'rgba(248,113,113,0.1)',border:'rgba(248,113,113,0.2)'},
  confirmed:        {color:'#60A5FA',bg:'rgba(96,165,250,0.1)', border:'rgba(96,165,250,0.2)'},
}

type Operator = {id:string;company_name:string;status:string;is_verified:boolean;base_location:string|null;line_user_id:string|null}
type Trip = {id:string;day_number:number;trip_date:string;pickup_time:string;pickup_location:string;dropoff_location:string;vehicle_type:string;pax_count:number;status:string;notes:string|null}
type Booking = {id:string;booking_ref:string;client_name:string;mobile_number:string|null;contact_person:string|null;booking_type:string;status:string;total_days:number;adults_count:number;special_requirements:string|null;notes:string|null;created_at:string;flight_number:string|null}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking|null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  // Dispatch modal state
  const [showDispatch, setShowDispatch] = useState(false)
  const [dispatchMode, setDispatchMode] = useState<'single'|'multiple'|'pool'>('single')
  const [selectedOps, setSelectedOps] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => { load() }, [bookingId])

  async function load() {
    const sb = createClient()
    const [bRes, tRes, oRes] = await Promise.all([
      sb.from('bookings').select('*').eq('id', bookingId).single(),
      sb.from('trips').select('*').eq('booking_id', bookingId).order('day_number'),
      sb.from('operators').select('id,company_name,status,is_verified,base_location,line_user_id').eq('status','active').order('company_name')
    ])
    setBooking(bRes.data)
    setTrips(tRes.data ?? [])
    setOperators(oRes.data ?? [])
    setLoading(false)
  }

  async function handleDispatch() {
    if (!bookingId) return
    setSending(true)
    const sb = createClient()
    if (dispatchMode === 'pool') {
      await sb.functions.invoke('booking-created', {body:{bookingId}})
    } else {
      for (const opId of selectedOps) {
        await sb.functions.invoke('booking-created', {body:{bookingId, operatorId:opId}})
      }
    }
    setSending(false); setSent(true)
    toast.success('Sent via LINE!')
    setTimeout(() => { setShowDispatch(false); setSent(false); setSelectedOps([]); load() }, 1500)
  }

  function toggleOp(id:string) {
    if (dispatchMode==='single') setSelectedOps([id])
    else setSelectedOps(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  }

  async function cancelBooking() {
    if (!confirm('Cancel this booking?')) return
    setCancelling(true)
    await createClient().from('bookings').update({status:'cancelled'}).eq('id', bookingId)
    toast.success('Booking cancelled')
    router.push('/bookings')
  }

  if (loading) return <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',color:TEXT2,fontFamily:F}}>Loading...</div>
  if (!booking) return <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',color:TEXT2,fontFamily:F}}>Booking not found</div>

  const st = STATUS_COLORS[booking.status] || STATUS_COLORS.pending

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:F,WebkitFontSmoothing:'antialiased'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid ${BORDER}`,background:'rgba(7,16,13,0.92)',backdropFilter:'blur(20px)',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/bookings" style={{color:TEXT2,textDecoration:'none',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Bookings
          </Link>
          <span style={{color:BORDER_HI}}>|</span>
          <span style={{fontFamily:FM,fontSize:13,color:TEAL}}>{booking.booking_ref}</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{setSent(false);setSelectedOps([]);setDispatchMode('single');setShowDispatch(true)}}
            style={{padding:'7px 16px',background:'rgba(25,201,119,0.1)',border:`1px solid ${TEAL}`,color:TEAL,borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>
            📱 Notify Operator
          </button>
          <button onClick={cancelBooking} disabled={cancelling||booking.status==='cancelled'}
            style={{padding:'7px 14px',background:'transparent',border:'1px solid rgba(248,113,113,0.25)',color:'#F87171',borderRadius:9,fontSize:13,cursor:'pointer',fontFamily:F,opacity:booking.status==='cancelled'?0.5:1}}>
            {cancelling?'Cancelling...':'✕ Cancel'}
          </button>
        </div>
      </nav>

      <main style={{maxWidth:760,margin:'0 auto',padding:'28px 24px'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
              <h1 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.03em',color:TEXT,margin:0}}>{booking.client_name}</h1>
              <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:100,fontSize:11,fontFamily:FM,fontWeight:500,color:st.color,background:st.bg,border:`1px solid ${st.border}`}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:'currentColor',display:'inline-block'}}/>
                {booking.status.replace(/_/g,' ')}
              </span>
            </div>
            {booking.mobile_number&&<div style={{fontSize:13,color:TEXT2,marginBottom:2}}>📞 {booking.mobile_number}</div>}
            {booking.contact_person&&<div style={{fontSize:13,color:TEXT2}}>👤 {booking.contact_person}</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11,fontFamily:FM,letterSpacing:'0.08em',textTransform:'uppercase',color:TEXT3,marginBottom:4}}>Created</div>
            <div style={{fontSize:13,color:TEXT2}}>{new Date(booking.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
        </div>

        {/* Info cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Days',value:booking.total_days},
            {label:'Passengers',value:`${booking.adults_count} pax`},
            {label:'Type',value:booking.booking_type?.replace(/_/g,' ')},
            {label:'Flight',value:booking.flight_number||'—'},
          ].map(({label,value})=>(
            <div key={label} style={{background:S2,border:`1px solid ${BORDER}`,borderRadius:12,padding:'14px 16px'}}>
              <div style={{fontSize:10,fontFamily:FM,letterSpacing:'0.1em',textTransform:'uppercase',color:TEXT3,marginBottom:6}}>{label}</div>
              <div style={{fontSize:14,fontWeight:600,color:TEXT,textTransform:'capitalize'}}>{value}</div>
            </div>
          ))}
        </div>

        {booking.special_requirements&&(
          <div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:12,padding:'12px 16px',marginBottom:20,fontSize:13,color:'#FCD34D'}}>
            ⚠️ {booking.special_requirements}
          </div>
        )}

        {/* Trip Days */}
        <div style={{marginBottom:8}}>
          <div style={{fontSize:10,fontFamily:FM,letterSpacing:'0.1em',textTransform:'uppercase',color:TEXT3,marginBottom:14}}>Trip Days ({trips.length})</div>
          {trips.length===0?(
            <div style={{background:S2,border:`1px solid ${BORDER}`,borderRadius:14,padding:'32px 20px',textAlign:'center',color:TEXT2,fontSize:13}}>No trip days recorded</div>
          ):trips.map((trip,i)=>{
            const v = VEHICLE_INFO[trip.vehicle_type] || {icon:'🚗',label:trip.vehicle_type,cap:''}
            const ts = STATUS_COLORS[trip.status] || STATUS_COLORS.pending
            return (
              <div key={trip.id} style={{background:S2,border:`1px solid ${BORDER}`,borderRadius:14,padding:'18px 20px',marginBottom:10,display:'flex',gap:16,alignItems:'flex-start'}}>
                <div style={{width:36,height:36,background:'rgba(25,201,119,0.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,border:`1px solid ${TEAL}30`}}>
                  {v.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontWeight:700,fontSize:14,color:TEXT}}>Day {trip.day_number}</span>
                      <span style={{fontSize:12,color:TEXT2}}>{trip.trip_date?new Date(trip.trip_date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}):'—'}</span>
                      {trip.pickup_time&&<span style={{fontSize:12,color:TEXT3}}>{trip.pickup_time.slice(0,5)}</span>}
                    </div>
                    <span style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 8px',borderRadius:100,fontSize:10,fontFamily:FM,color:ts.color,background:ts.bg,border:`1px solid ${ts.border}`}}>
                      <span style={{width:4,height:4,borderRadius:'50%',background:'currentColor',display:'inline-block'}}/>
                      {trip.status.replace(/_/g,' ')}
                    </span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                    <div style={{fontSize:12,color:TEXT2}}><span style={{color:TEXT3}}>From </span>{trip.pickup_location}</div>
                    <div style={{fontSize:12,color:TEXT2}}><span style={{color:TEXT3}}>To </span>{trip.dropoff_location}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:12,color:TEXT3}}>{v.icon} {v.label} <span style={{color:TEAL}}>({v.cap})</span></span>
                    <span style={{fontSize:12,color:TEXT3}}>· {trip.pax_count} pax this day</span>
                    {trip.notes&&<span style={{fontSize:11,color:TEXT3,fontStyle:'italic'}}>· {trip.notes}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* ═══ OPERATOR DISPATCH MODAL ═══ */}
      {showDispatch&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:S2,border:`1px solid ${BORDER_HI}`,borderRadius:20,width:'100%',maxWidth:500,maxHeight:'88vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.7)'}}>
            {sent?(
              <div style={{padding:56,textAlign:'center'}}>
                <div style={{fontSize:52,marginBottom:14}}>✅</div>
                <h3 style={{fontWeight:800,fontSize:20,color:TEXT,marginBottom:8}}>Sent via LINE!</h3>
                <p style={{color:TEXT2,fontSize:14}}>Operator will receive the booking now.</p>
              </div>
            ):(
              <>
                <div style={{padding:'18px 22px',borderBottom:`1px solid ${BORDER}`,display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
                  <div>
                    <h3 style={{fontWeight:800,fontSize:16,color:TEXT,marginBottom:3}}>Notify Operator via LINE</h3>
                    <p style={{fontSize:12,color:TEXT2}}>{booking.client_name} · {trips.length} day{trips.length>1?'s':''}</p>
                  </div>
                  <button onClick={()=>setShowDispatch(false)} style={{width:26,height:26,borderRadius:'50%',background:S3,border:`1px solid ${BORDER}`,color:TEXT2,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginLeft:10}}>×</button>
                </div>
                <div style={{padding:'14px 22px 0'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                    {([['single','Single','One operator'],['multiple','Multiple','Select several'],['pool','Broadcast','First accepts']] as const).map(([mode,label,sub])=>(
                      <button key={mode} onClick={()=>{setDispatchMode(mode);setSelectedOps([])}} type="button"
                        style={{padding:'10px 8px',background:dispatchMode===mode?'rgba(25,201,119,0.1)':S3,border:`2px solid ${dispatchMode===mode?TEAL:BORDER}`,borderRadius:11,cursor:'pointer',textAlign:'left',fontFamily:F}}>
                        <div style={{fontSize:12,fontWeight:700,color:dispatchMode===mode?TEAL:TEXT,marginBottom:2}}>{label}</div>
                        <div style={{fontSize:10,color:TEXT3}}>{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {dispatchMode!=='pool'?(
                  <div style={{flex:1,overflowY:'auto',padding:'12px 22px'}}>
                    <div style={{fontSize:10,fontFamily:FM,letterSpacing:'0.1em',textTransform:'uppercase',color:TEXT3,marginBottom:8}}>{operators.length} active operators</div>
                    {operators.length===0?(
                      <div style={{padding:'24px 0',textAlign:'center',color:TEXT2,fontSize:13}}>No active operators yet.</div>
                    ):operators.map(op=>{
                      const sel=selectedOps.includes(op.id)
                      return (
                        <div key={op.id} onClick={()=>toggleOp(op.id)}
                          style={{display:'flex',alignItems:'center',gap:12,padding:'11px 12px',background:sel?'rgba(25,201,119,0.08)':'transparent',border:`1px solid ${sel?TEAL:BORDER}`,borderRadius:11,marginBottom:7,cursor:'pointer',transition:'all 0.12s'}}>
                          <div style={{width:36,height:36,borderRadius:9,background:sel?TEAL:S3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:sel?'#fff':TEXT2,flexShrink:0}}>{op.company_name.charAt(0)}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:13,color:TEXT}}>{op.company_name}</div>
                            <div style={{fontSize:11,color:TEXT2}}>{op.base_location||'—'}{op.line_user_id?' · 📱 LINE':' · No LINE'}{op.is_verified?' · ✓':''}</div>
                          </div>
                          <div style={{width:18,height:18,borderRadius:'50%',background:sel?TEAL:'transparent',border:`2px solid ${sel?TEAL:BORDER_HI}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {sel&&<span style={{color:'#fff',fontSize:10}}>✓</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ):(
                  <div style={{padding:'28px 22px',textAlign:'center'}}>
                    <div style={{fontSize:36,marginBottom:10}}>📡</div>
                    <p style={{color:TEXT,fontWeight:700,fontSize:14,marginBottom:4}}>Broadcast to All Operators</p>
                    <p style={{color:TEXT2,fontSize:12}}>{operators.length} operators get this simultaneously. First to accept wins.</p>
                  </div>
                )}
                <div style={{padding:'12px 22px 18px',borderTop:`1px solid ${BORDER}`,display:'flex',flexDirection:'column',gap:7}}>
                  <button onClick={handleDispatch} disabled={sending||(dispatchMode!=='pool'&&selectedOps.length===0)} type="button"
                    style={{width:'100%',padding:'12px',background:(sending||(dispatchMode!=='pool'&&selectedOps.length===0))?S3:TEAL,color:(dispatchMode!=='pool'&&selectedOps.length===0)?TEXT3:'#fff',border:'none',borderRadius:11,fontSize:14,fontWeight:700,cursor:(sending||(dispatchMode!=='pool'&&selectedOps.length===0))?'not-allowed':'pointer',fontFamily:F}}>
                    {sending?'Sending...':
                     dispatchMode==='pool'?`📡 Broadcast to All ${operators.length} Operators`:
                     `📱 Send to ${selectedOps.length} Operator${selectedOps.length!==1?'s':''} via LINE`}
                  </button>
                  <button onClick={()=>setShowDispatch(false)} type="button"
                    style={{width:'100%',padding:'9px',background:'transparent',border:'none',color:TEXT3,fontSize:12,cursor:'pointer',fontFamily:F}}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}