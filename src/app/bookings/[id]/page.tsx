'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const VEHICLE_INFO: Record<string,{label:string;cap:string}> = {
  sedan:{label:'Sedan',cap:'1-3 pax'}, suv:{label:'SUV',cap:'1-4 pax'},
  van_9:{label:'Van 9',cap:'up to 9 pax'}, van_12:{label:'Van 12',cap:'up to 12 pax'},
  minibus_15:{label:'Minibus 15',cap:'up to 15 pax'}, minibus_20:{label:'Minibus 20',cap:'up to 20 pax'},
  coach_30:{label:'Coach 30',cap:'up to 30 pax'}, coach_40plus:{label:'Coach 40+',cap:'up to 40+ pax'},
}

const STATUS_BADGE: Record<string,string> = {
  pending:'badge-warning', operator_notified:'badge-warning', operator_accepted:'badge-progress',
  driver_assigned:'badge-progress', in_progress:'badge-progress',
  completed:'badge-completed', cancelled:'badge-cancelled', confirmed:'badge-progress',
  in_pool:'badge-warning', assigned:'badge-progress',
}

const EVENT_LABELS: Record<string,string> = {
  pickup:'Passenger picked up', drop:'Drop off completed', arrival:'Arrived at destination',
  status:'Status updated', photo:'Photo uploaded', payment:'Payment update',
  closed:'Trip closed', emergency:'Emergency alert',
}

type Booking = { id:string; booking_ref:string; client_name:string; mobile_number:string|null; contact_person:string|null; booking_type:string; status:string; total_days:number; adults_count:number; special_requirements:string|null; notes:string|null; created_at:string; flight_number:string|null }
type Trip = { id:string; day_number:number; trip_date:string; pickup_time:string; pickup_location:string; dropoff_location:string; vehicle_type:string; pax_count:number; status:string; notes:string|null; driver_id:string|null; operator_id:string|null }
type Driver = { id:string; full_name:string; phone:string|null; vehicle_plate:string|null; vehicle_brand_model:string|null; vehicle_type:string|null; vehicle_photo_url:string|null; base_location:string|null }
type TripEvent = { id:string; trip_id:string; event_type:string; created_at:string; photo_url:string|null; gps_lat:number|null; gps_lng:number|null }
type Payment = { id:string; trip_id:string; status:string; proof_photo_url:string|null }
type Operator = { id:string; company_name:string; status:string; is_verified:boolean; base_location:string|null; line_user_id:string|null }

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  const mapRefs = useRef<Record<string,HTMLDivElement|null>>({})

  const [booking, setBooking] = useState<Booking|null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [drivers, setDrivers] = useState<Record<string,Driver>>({})
  const [events, setEvents] = useState<Record<string,TripEvent[]>>({})
  const [payments, setPayments] = useState<Record<string,Payment>>({})
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [activeTrip, setActiveTrip] = useState<string|null>(null)
  const [showDispatch, setShowDispatch] = useState(false)
  const [dispatchMode, setDispatchMode] = useState<'single'|'multiple'|'pool'>('single')
  const [selectedOps, setSelectedOps] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [expandedTrip, setExpandedTrip] = useState<string|null>(null)

  useEffect(() => { load() }, [bookingId])

  async function load() {
    const sb = createClient()
    const [bRes, tRes, oRes] = await Promise.all([
      sb.from('bookings').select('*').eq('id', bookingId).single(),
      sb.from('trips').select('*').eq('booking_id', bookingId).order('day_number'),
      sb.from('operators').select('id,company_name,status,is_verified,base_location,line_user_id').eq('status','active').order('company_name')
    ])
    setBooking(bRes.data)
    const tripList = tRes.data ?? []
    setTrips(tripList)
    setOperators(oRes.data ?? [])

    // Find active trip
    const live = tripList.find((t:Trip) => t.status === 'in_progress')
    if (live) setActiveTrip(live.id)

    // Load driver details, events, payments for each trip
    const driverMap: Record<string,Driver> = {}
    const eventMap: Record<string,TripEvent[]> = {}
    const paymentMap: Record<string,Payment> = {}

    await Promise.all(tripList.map(async (trip:Trip) => {
      const [evRes, pyRes] = await Promise.all([
        sb.from('trip_events').select('*').eq('trip_id', trip.id).order('created_at'),
        sb.from('payments').select('*').eq('trip_id', trip.id).single()
      ])
      eventMap[trip.id] = evRes.data ?? []
      if (pyRes.data) paymentMap[trip.id] = pyRes.data

      if (trip.driver_id && !driverMap[trip.driver_id]) {
        const { data:dr } = await sb.from('drivers').select('id,full_name,phone,vehicle_plate,vehicle_brand_model,vehicle_type,vehicle_photo_url,base_location').eq('id', trip.driver_id).single()
        if (dr) driverMap[trip.driver_id] = dr
      }
    }))

    setDrivers(driverMap)
    setEvents(eventMap)
    setPayments(paymentMap)
    setLoading(false)
  }

  // Load Google Maps for active trip
  useEffect(() => {
    if (!activeTrip) return
    const tripEvents = events[activeTrip] || []
    const lastGps = [...tripEvents].reverse().find(e => e.gps_lat && e.gps_lng)
    if (!lastGps || !mapRefs.current[activeTrip]) return
    const el = mapRefs.current[activeTrip]!
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
    if (!key) { el.innerHTML = '<div style="padding:16px;font-size:12px;color:#888">Google Maps API key not configured</div>'; return }
    // Embed static map with last known location
    const lat = lastGps.gps_lat!; const lng = lastGps.gps_lng!
    el.innerHTML = `<iframe
      width="100%" height="200"
      style="border:none;border-radius:8px"
      loading="lazy"
      src="https://www.google.com/maps/embed/v1/view?key=${key}&center=${lat},${lng}&zoom=15&maptype=roadmap"
    ></iframe>`
  }, [activeTrip, events])

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

  async function confirmPayment(tripId:string) {
    const sb = createClient()
    const { data:{user} } = await sb.auth.getUser()
    const p = payments[tripId]
    if (!p) return
    await sb.from('payments').update({ status:'confirmed', confirmed_by:user?.id, confirmed_at:new Date().toISOString() }).eq('id', p.id)
    toast.success('Payment confirmed!')
    load()
  }

  if (loading) return <div style={{minHeight:'100vh',background:'var(--bg-page)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-tertiary)',fontFamily:'var(--font-sans)'}}>Loading...</div>
  if (!booking) return <div style={{minHeight:'100vh',background:'var(--bg-page)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-tertiary)',fontFamily:'var(--font-sans)'}}>Booking not found</div>

  const PMNT_COLORS: Record<string,{bg:string,color:string}> = {
    pending:        {bg:'rgba(245,158,11,0.08)', color:'var(--warning)'},
    proof_uploaded: {bg:'rgba(25,201,119,0.08)', color:'var(--accent)'},
    confirmed:      {bg:'rgba(34,197,94,0.08)',  color:'var(--success)'},
    completed:      {bg:'rgba(34,197,94,0.08)',  color:'var(--success)'},
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}}>

      {/* Nav */}
      <nav style={{background:'var(--bg-page)',borderBottom:'0.5px solid var(--border)',height:52,display:'flex',alignItems:'center',position:'sticky' as const,top:0,zIndex:50}}>
        <div style={{maxWidth:900,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <a href="/bookings" style={{color:'var(--text-tertiary)',textDecoration:'none',display:'flex'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
            <div style={{width:'0.5px',height:16,background:'var(--border)'}}/>
            <a href="/dashboard" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
              <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
            </a>
            <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--accent)',fontWeight:500}}>{booking.booking_ref}</span>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>{setSent(false);setSelectedOps([]);setDispatchMode('single');setShowDispatch(true)}} style={{padding:'6px 14px',background:'rgba(25,201,119,0.08)',border:'0.5px solid var(--accent)',color:'var(--accent)',borderRadius:7,fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'var(--font-sans)'}}>
              Notify Operator
            </button>
            <button onClick={cancelBooking} disabled={cancelling||booking.status==='cancelled'} style={{padding:'6px 12px',background:'transparent',border:'0.5px solid rgba(239,68,68,0.3)',color:'var(--danger)',borderRadius:7,fontSize:12,cursor:'pointer',fontFamily:'var(--font-sans)',opacity:booking.status==='cancelled'?0.5:1}}>
              {cancelling?'Cancelling...':'Cancel'}
            </button>
          </div>
        </div>
      </nav>

      <main style={{maxWidth:900,margin:'0 auto',padding:'24px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
              <h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',color:'var(--text-primary)',margin:0}}>{booking.client_name}</h1>
              <span className={'badge '+(STATUS_BADGE[booking.status]||'badge-pending')} style={{fontSize:11}}>{booking.status.replace(/_/g,' ')}</span>
            </div>
            {booking.mobile_number&&<div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:2}}>{booking.mobile_number}</div>}
            {booking.contact_person&&<div style={{fontSize:12,color:'var(--text-tertiary)'}}>{booking.contact_person}</div>}
          </div>
          <div style={{textAlign:'right' as const}}>
            <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:3}}>Created</div>
            <div style={{fontSize:12,color:'var(--text-secondary)',fontFamily:'var(--font-mono)'}}>{new Date(booking.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
        </div>

        {/* Info stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[
            {l:'Days', v:booking.total_days},
            {l:'Passengers', v:booking.adults_count+' pax'},
            {l:'Type', v:booking.booking_type?.replace(/_/g,' ')},
            {l:'Flight', v:booking.flight_number||'—'},
          ].map(({l,v})=>(
            <div key={l} className="riden-card" style={{padding:'12px 14px'}}>
              <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:4}}>{l}</div>
              <div style={{fontSize:14,fontWeight:500,color:'var(--text-primary)',textTransform:'capitalize' as const}}>{v}</div>
            </div>
          ))}
        </div>

        {booking.special_requirements&&(
          <div style={{padding:'10px 14px',background:'rgba(245,158,11,0.06)',border:'0.5px solid rgba(245,158,11,0.2)',borderRadius:8,marginBottom:16,fontSize:12,color:'var(--warning)'}}>
            Special: {booking.special_requirements}
          </div>
        )}

        {/* Live map — shown if active trip has GPS */}
        {activeTrip && events[activeTrip]?.some(e=>e.gps_lat) && (
          <div className="riden-card" style={{marginBottom:16,overflow:'hidden'}}>
            <div style={{padding:'10px 14px',borderBottom:'0.5px solid var(--border)',display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)'}}/>
              <span style={{fontSize:13,fontWeight:500}}>Live Location</span>
              <span style={{fontSize:11,color:'var(--text-tertiary)',marginLeft:4}}>Trip {activeTrip}</span>
            </div>
            <div ref={el=>{mapRefs.current[activeTrip]=el}} style={{padding:12}}>
              <div style={{height:200,background:'var(--bg-page)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'var(--text-tertiary)'}}>Loading map...</div>
            </div>
          </div>
        )}

        {/* Trip Days */}
        <div style={{marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:12}}>Trip Days ({trips.length})</div>
          {trips.length===0 ? (
            <div className="riden-card" style={{padding:'32px 20px',textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:13}}>No trip days recorded</div>
          ) : trips.map(trip => {
            const v = VEHICLE_INFO[trip.vehicle_type] || {label:trip.vehicle_type,cap:''}
            const driver = trip.driver_id ? drivers[trip.driver_id] : null
            const tripEvents = events[trip.id] || []
            const payment = payments[trip.id]
            const photos = tripEvents.filter(e=>e.photo_url)
            const isExpanded = expandedTrip === trip.id
            const pc = PMNT_COLORS[payment?.status||'pending']

            return (
              <div key={trip.id} className="riden-card" style={{marginBottom:10,overflow:'hidden'}}>

                {/* Trip header */}
                <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={()=>setExpandedTrip(isExpanded?null:trip.id)}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:28,height:28,borderRadius:7,background:'#111',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#fff',flexShrink:0}}>D{trip.day_number}</div>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                        <span style={{fontWeight:500,fontSize:13,color:'var(--text-primary)'}}>Day {trip.day_number}</span>
                        <span style={{fontSize:11,color:'var(--text-secondary)',fontFamily:'var(--font-mono)'}}>{trip.trip_date?new Date(trip.trip_date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}):'—'}</span>
                        {trip.pickup_time&&<span style={{fontSize:11,color:'var(--text-tertiary)'}}>{trip.pickup_time.slice(0,5)}</span>}
                      </div>
                      <div style={{fontSize:12,color:'var(--text-secondary)'}}>{trip.pickup_location} → {trip.dropoff_location}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                    {driver&&<span style={{fontSize:11,color:'var(--accent)',fontWeight:500}}>{driver.full_name}</span>}
                    <span className={'badge '+(STATUS_BADGE[trip.status]||'badge-pending')} style={{fontSize:10}}>{trip.status.replace(/_/g,' ')}</span>
                    <span style={{color:'var(--text-tertiary)',fontSize:12}}>{isExpanded?'▲':'▼'}</span>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded&&(
                  <div style={{borderTop:'0.5px solid var(--border)'}}>

                    {/* Driver card */}
                    {driver ? (
                      <div style={{padding:'14px 16px',borderBottom:'0.5px solid var(--border)',background:'rgba(25,201,119,0.02)'}}>
                        <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:10}}>Assigned Driver</div>
                        <div style={{display:'flex',alignItems:'center',gap:12}}>
                          <div style={{width:44,height:44,borderRadius:10,background:'var(--bg-page)',border:'0.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'var(--text-primary)',flexShrink:0,fontFamily:'var(--font-sans)'}}>
                            {driver.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:500,fontSize:14,color:'var(--text-primary)',marginBottom:2}}>{driver.full_name}</div>
                            <div style={{fontSize:12,color:'var(--text-secondary)'}}>
                              {driver.phone&&<span>{driver.phone}</span>}
                              {driver.vehicle_plate&&<span style={{marginLeft:8,fontFamily:'var(--font-mono)'}}>{driver.vehicle_plate}</span>}
                              {driver.vehicle_brand_model&&<span style={{marginLeft:8,color:'var(--text-tertiary)'}}>{driver.vehicle_brand_model}</span>}
                            </div>
                          </div>
                          {driver.vehicle_photo_url&&(
                            <img src={driver.vehicle_photo_url} alt="Vehicle" style={{width:80,height:56,objectFit:'cover' as const,borderRadius:8,border:'0.5px solid var(--border)',flexShrink:0}}/>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)',fontSize:12,color:'var(--text-tertiary)'}}>
                        No driver assigned yet
                      </div>
                    )}

                    {/* Payment status */}
                    {payment&&(
                      <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:11,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)'}}>Payment</span>
                          <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,fontWeight:500,background:pc.bg,color:pc.color}}>{payment.status.replace(/_/g,' ')}</span>
                        </div>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          {payment.proof_photo_url&&(
                            <a href={payment.proof_photo_url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:'var(--accent)',textDecoration:'none',padding:'3px 8px',borderRadius:5,border:'0.5px solid rgba(25,201,119,0.2)',background:'var(--accent-bg)'}}>View Proof</a>
                          )}
                          {payment.status==='proof_uploaded'&&(
                            <button onClick={()=>confirmPayment(trip.id)} style={{fontSize:11,padding:'3px 10px',borderRadius:5,background:'rgba(25,201,119,0.08)',color:'var(--accent)',border:'none',cursor:'pointer',fontWeight:500,fontFamily:'var(--font-sans)'}}>✓ Confirm</button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Photo gallery */}
                    {photos.length>0&&(
                      <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)'}}>
                        <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:8}}>Photos ({photos.length})</div>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                          {photos.map(ev=>(
                            <a key={ev.id} href={ev.photo_url!} target="_blank" rel="noopener noreferrer">
                              <div style={{position:'relative' as const}}>
                                <img src={ev.photo_url!} alt={ev.event_type} style={{width:80,height:60,objectFit:'cover' as const,borderRadius:7,border:'0.5px solid var(--border)',display:'block'}}/>
                                <div style={{position:'absolute' as const,bottom:3,left:3,fontSize:8,background:'rgba(0,0,0,0.65)',color:'#fff',padding:'1px 4px',borderRadius:3}}>{ev.event_type}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {tripEvents.length>0&&(
                      <div style={{padding:'12px 16px'}}>
                        <div style={{fontSize:10,fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'0.06em',color:'var(--text-tertiary)',marginBottom:10}}>Timeline</div>
                        <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
                          {tripEvents.map((ev,i)=>(
                            <div key={ev.id} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                              <div style={{display:'flex',flexDirection:'column' as const,alignItems:'center',flexShrink:0}}>
                                <div style={{width:8,height:8,borderRadius:'50%',background:ev.event_type==='emergency'?'var(--danger)':ev.event_type==='closed'?'var(--success)':'var(--accent)',marginTop:3}}/>
                                {i<tripEvents.length-1&&<div style={{width:1,height:20,background:'var(--border)',marginTop:2}}/>}
                              </div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:12,fontWeight:500,color:'var(--text-primary)'}}>{EVENT_LABELS[ev.event_type]||ev.event_type}</div>
                                <div style={{fontSize:10,color:'var(--text-tertiary)',fontFamily:'var(--font-mono)'}}>
                                  {new Date(ev.created_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                                  {ev.gps_lat&&<span style={{marginLeft:6}}>· GPS: {ev.gps_lat.toFixed(4)},{ev.gps_lng?.toFixed(4)}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* Operator Dispatch Modal */}
      {showDispatch&&(
        <div style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',border:'0.5px solid var(--border)',borderRadius:14,width:'100%',maxWidth:460,maxHeight:'88vh',display:'flex',flexDirection:'column' as const,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}}>
            {sent?(
              <div style={{padding:48,textAlign:'center' as const}}>
                <div style={{fontSize:36,marginBottom:12}}>✅</div>
                <h3 style={{fontWeight:600,fontSize:17,marginBottom:4}}>Sent via LINE!</h3>
                <p style={{color:'var(--text-secondary)',fontSize:13}}>Operator will receive the booking now.</p>
              </div>
            ):(
              <>
                <div style={{padding:'14px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <h3 style={{fontWeight:600,fontSize:14,marginBottom:2}}>Notify Operator via LINE</h3>
                    <p style={{fontSize:12,color:'var(--text-tertiary)'}}>{booking.client_name} · {trips.length} day{trips.length>1?'s':''}</p>
                  </div>
                  <button onClick={()=>setShowDispatch(false)} style={{width:24,height:24,borderRadius:'50%',background:'var(--bg-page)',border:'0.5px solid var(--border)',color:'var(--text-secondary)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',marginLeft:8}}>×</button>
                </div>
                <div style={{padding:'10px 18px 0'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                    {([['single','Single','One operator'],['multiple','Multiple','Several'],['pool','Broadcast','First accepts']] as const).map(([mode,label,sub])=>(
                      <button key={mode} onClick={()=>{setDispatchMode(mode);setSelectedOps([])}} type="button" style={{padding:'8px',background:dispatchMode===mode?'var(--accent-bg)':'var(--bg-page)',border:'0.5px solid '+(dispatchMode===mode?'var(--accent)':'var(--border)'),borderRadius:7,cursor:'pointer',textAlign:'left' as const,fontFamily:'var(--font-sans)'}}>
                        <div style={{fontSize:11,fontWeight:500,color:dispatchMode===mode?'var(--accent)':'var(--text-primary)',marginBottom:1}}>{label}</div>
                        <div style={{fontSize:10,color:'var(--text-tertiary)'}}>{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {dispatchMode!=='pool'?(
                  <div style={{flex:1,overflowY:'auto' as const,padding:'8px 18px'}}>
                    {operators.map(op=>{
                      const sel=selectedOps.includes(op.id)
                      return (
                        <div key={op.id} onClick={()=>toggleOp(op.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',background:sel?'var(--accent-bg)':'transparent',border:'0.5px solid '+(sel?'var(--accent)':'var(--border)'),borderRadius:7,marginBottom:5,cursor:'pointer',transition:'all 0.1s'}}>
                          <div style={{width:30,height:30,borderRadius:7,background:sel?'var(--accent)':'var(--bg-page)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:sel?'#fff':'var(--text-primary)',flexShrink:0}}>{op.company_name.charAt(0)}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:500,fontSize:12,color:'var(--text-primary)'}}>{op.company_name}</div>
                            <div style={{fontSize:10,color:'var(--text-tertiary)'}}>{op.base_location||'—'}{op.line_user_id?' · LINE':''}{op.is_verified?' · ✓':''}</div>
                          </div>
                          {sel&&<span style={{color:'var(--accent)',fontSize:12}}>✓</span>}
                        </div>
                      )
                    })}
                  </div>
                ):(
                  <div style={{padding:'20px 18px',textAlign:'center' as const}}>
                    <p style={{fontWeight:500,fontSize:13,marginBottom:3}}>Broadcast to All Operators</p>
                    <p style={{color:'var(--text-tertiary)',fontSize:12}}>{operators.length} operators get this simultaneously.</p>
                  </div>
                )}
                <div style={{padding:'10px 18px 14px',borderTop:'0.5px solid var(--border)',display:'flex',flexDirection:'column' as const,gap:6}}>
                  <button onClick={handleDispatch} disabled={sending||(dispatchMode!=='pool'&&selectedOps.length===0)} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'9px',fontSize:12,opacity:(sending||(dispatchMode!=='pool'&&selectedOps.length===0))?0.5:1,cursor:(sending||(dispatchMode!=='pool'&&selectedOps.length===0))?'not-allowed':'pointer'}}>
                    {sending?'Sending...':'Send to '+(dispatchMode==='pool'?'All':selectedOps.length+' Operator'+(selectedOps.length!==1?'s':''))+' via LINE'}
                  </button>
                  <button onClick={()=>setShowDispatch(false)} style={{width:'100%',padding:'6px',background:'transparent',border:'none',color:'var(--text-tertiary)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-sans)'}}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
