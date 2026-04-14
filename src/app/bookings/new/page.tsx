'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const TEAL = '#19C977'
const BG = '#07100D', S2 = '#111F15', S3 = '#16271A'
const BORDER = 'rgba(255,255,255,0.08)', BORDER_HI = 'rgba(255,255,255,0.14)'
const TEXT = '#EDF5F0', TEXT2 = '#7A9A87', TEXT3 = '#3D5C47'
const F = "'Inter',-apple-system,sans-serif"
const FM = "'JetBrains Mono',monospace"

const VEHICLE_TYPES = [
  {v:'sedan',l:'Sedan'},{v:'suv',l:'SUV'},{v:'van_9',l:'Van 9 Seats'},{v:'van_12',l:'Van 12 Seats'},
  {v:'minibus_15',l:'Minibus 15'},{v:'minibus_20',l:'Minibus 20'},{v:'coach_30',l:'Coach 30'},{v:'coach_40plus',l:'Coach 40+'},
]
const BOOKING_TYPES = [
  {v:'airport_transfer',l:'✈️ Airport Transfer'},{v:'hotel_transfer',l:'🏨 Hotel Transfer'},
  {v:'sightseeing',l:'🗺 Sightseeing'},{v:'day_tour',l:'🌅 Day Tour'},{v:'custom',l:'⚙️ Custom'},
]
const TRIP_TYPES = [
  {v:'airport_pickup',l:'✈️ Airport Pickup',icon:'✈️'},{v:'airport_drop',l:'🛬 Airport Drop',icon:'🛬'},
  {v:'city_tour',l:'🏙 City Tour',icon:'🏙'},{v:'hotel_transfer',l:'🏨 Hotel Transfer',icon:'🏨'},
  {v:'sightseeing',l:'🗺 Sightseeing',icon:'🗺'},{v:'custom',l:'⚙️ Custom',icon:'⚙️'},
]
const QUICK_REQS = ['Wheelchair','Baby Seat','VIP','Halal Food','English Guide','Thai Guide','Child Seat','Extra Luggage']
const SAVED_LOCATIONS = [
  'Suvarnabhumi Airport (BKK)','Don Mueang Airport (DMK)','Phuket Airport (HKT)','Chiang Mai Airport (CNX)',
  'Centrara Grand Bangkok','Mandarin Oriental Bangkok','Anantara Riverside Bangkok','W Hotel Bangkok',
  'Pattaya City Center','Chiang Mai Old City',
]

function suggestVehicle(pax: number): string {
  if (pax <= 3) return 'sedan'
  if (pax <= 4) return 'suv'
  if (pax <= 9) return 'van_9'
  if (pax <= 12) return 'van_12'
  if (pax <= 15) return 'minibus_15'
  if (pax <= 20) return 'minibus_20'
  if (pax <= 30) return 'coach_30'
  return 'coach_40plus'
}

type Day = { trip_date:string; pickup_time:string; trip_type:string; pickup_location:string; dropoff_location:string; vehicle_type:string; pax_count:number; flight_number:string; terminal:string; notes:string; duration_hours:number }
type Operator = { id:string; company_name:string; status:string; is_verified:boolean; base_location:string|null; line_user_id:string|null }

function makeDay(pax=1, overrides: Partial<Day> = {}): Day {
  return { trip_date:'', pickup_time:'09:00', trip_type:'airport_pickup', pickup_location:'', dropoff_location:'', vehicle_type:suggestVehicle(pax), pax_count:pax, flight_number:'', terminal:'', notes:'', duration_hours:8, ...overrides }
}

export default function NewBookingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1|2>(1)
  const [submitting, setSubmitting] = useState(false)
  const [operators, setOperators] = useState<Operator[]>([])
  const [preferredIds, setPreferredIds] = useState<string[]>([])
  const [showPreferredOnly, setShowPreferredOnly] = useState(true)
  const [showDispatch, setShowDispatch] = useState(false)
  const [dispatchMode, setDispatchMode] = useState<'single'|'multiple'|'pool'>('single')
  const [selectedOps, setSelectedOps] = useState<string[]>([])
  const [createdBookingId, setCreatedBookingId] = useState<string|null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [locationSuggest, setLocationSuggest] = useState<{dayIdx:number;field:'pickup'|'drop'}|null>(null)

  const [clientName, setClientName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [numDays, setNumDays] = useState(1)
  const [bookingType, setBookingType] = useState('airport_transfer')
  const [totalPax, setTotalPax] = useState(1)
  const [quickReqs, setQuickReqs] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [days, setDays] = useState<Day[]>([makeDay(1)])

  useEffect(() => {
    async function loadData() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      const [{ data: ops }, { data: dmc }] = await Promise.all([
        sb.from('operators').select('id,company_name,status,is_verified,base_location,line_user_id').eq('status','active').order('company_name'),
        sb.from('dmc_users').select('preferred_operator_ids').eq('id', user.id).single()
      ])
      setOperators(ops ?? [])
      const pref = dmc?.preferred_operator_ids ?? []
      setPreferredIds(pref)
    }
    loadData()
  }, [])

  function goToStep2() {
    if (!clientName.trim()) { toast.error('Client name is required'); return }
    if (!mobileNumber.trim()) { toast.error('Mobile number is required'); return }
    const n = Math.max(1, numDays)
    const existing = days.slice(0, n)
    while (existing.length < n) existing.push(makeDay(totalPax))
    setDays(existing.map(d => ({...d, pax_count: d.pax_count || totalPax, vehicle_type: d.vehicle_type || suggestVehicle(totalPax)})))
    setStep(2)
  }

  function setDay(i: number, k: keyof Day, v: any) {
    setDays(prev => { const d=[...prev]; d[i]={...d[i],[k]:v}; if (k==='pax_count') d[i].vehicle_type = suggestVehicle(Number(v)); return d })
  }

  function duplicateDay(i: number) {
    setDays(prev => { const d=[...prev]; d[i+1]={...d[i], trip_date:''}; return d })
    toast.success('Day copied — update the date')
  }

  function applyTemplate(i: number, ttype: string) {
    const templates: Record<string,Partial<Day>> = {
      airport_pickup:{trip_type:'airport_pickup',pickup_location:'Suvarnabhumi Airport (BKK)',pickup_time:'09:00'},
      airport_drop:{trip_type:'airport_drop',dropoff_location:'Suvarnabhumi Airport (BKK)',pickup_time:'08:00'},
      city_tour:{trip_type:'city_tour',pickup_location:'Hotel Lobby',dropoff_location:'Hotel Lobby',pickup_time:'09:00'},
      hotel_transfer:{trip_type:'hotel_transfer',pickup_time:'12:00'},
      sightseeing:{trip_type:'sightseeing',pickup_location:'Hotel Lobby',dropoff_location:'Hotel Lobby',pickup_time:'08:00'},
    }
    setDays(prev => { const d=[...prev]; d[i]={...d[i],...(templates[ttype]||{})}; return d })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const sb = createClient()
    const {data:{user}} = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }

    const ref = 'BK' + Date.now().toString().slice(-6)
    const specialReqs = [quickReqs.join(', '), notes].filter(Boolean).join(' | ')

    const {data:booking, error:bErr} = await sb.from('bookings').insert({
      dmc_id: user.id, booking_ref: ref, booking_type: bookingType, client_name: clientName,
      mobile_number: mobileNumber, contact_person: contactPerson || null,
      adults_count: totalPax, children_count: 0, total_days: days.length,
      status: 'pending', special_requirements: specialReqs || null, notes: null,
    }).select().single()

    if (bErr || !booking) { toast.error(bErr?.message || 'Error saving'); setSubmitting(false); return }

    for (let i = 0; i < days.length; i++) {
      const d = days[i]
      await sb.from('trips').insert({
        booking_id: booking.id, dmc_id: user.id, day_number: i+1,
        trip_date: d.trip_date, pickup_time: d.pickup_time,
        pickup_location: d.pickup_location, dropoff_location: d.dropoff_location,
        vehicle_type: d.vehicle_type, pax_count: d.pax_count, status: 'pending',
        estimated_duration_hours: (d.trip_type!=='airport_pickup'&&d.trip_type!=='airport_drop') ? d.duration_hours : null,
        notes: [d.trip_type, d.flight_number, d.terminal, d.notes].filter(Boolean).join(' | ') || null,
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
    if (dispatchMode === 'pool') {
      await sb.functions.invoke('booking-created', {body:{bookingId:createdBookingId}})
    } else {
      for (const opId of selectedOps) {
        await sb.functions.invoke('booking-created', {body:{bookingId:createdBookingId, operatorId:opId}})
      }
    }
    setSending(false); setSent(true)
    setTimeout(() => router.push('/bookings'), 1800)
  }

  function toggleReq(r: string) { setQuickReqs(prev => prev.includes(r) ? prev.filter(x=>x!==r) : [...prev,r]) }
  function toggleOp(id: string) {
    if (dispatchMode==='single') setSelectedOps([id])
    else setSelectedOps(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id])
  }

  // Operators shown in dispatch modal — preferred first, then rest
  const preferredOps = operators.filter(o => preferredIds.includes(o.id))
  const otherOps = operators.filter(o => !preferredIds.includes(o.id))
  const displayedOps = showPreferredOnly && preferredOps.length > 0 ? preferredOps : operators

  const inp = {width:'100%',background:S3,border:`1px solid ${BORDER}`,borderRadius:10,color:TEXT,fontFamily:F,fontSize:14,padding:'10px 13px',outline:'none',boxSizing:'border-box' as const}
  const lbl = {display:'block' as const,fontSize:10,fontFamily:FM,letterSpacing:'0.1em',textTransform:'uppercase' as const,color:TEXT3,marginBottom:7}
  const card = {background:S2,border:`1px solid ${BORDER}`,borderRadius:16,padding:'20px',marginBottom:14}

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:F,WebkitFontSmoothing:'antialiased'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        input:focus,select:focus,textarea:focus{border-color:${TEAL}!important;box-shadow:0 0 0 3px rgba(25,201,119,0.12)!important;background:${S2}!important}
        input::placeholder,textarea::placeholder{color:${TEXT3}}
        select option{background:${S3}}
        ::-webkit-calendar-picker-indicator{filter:invert(1)}
        .quick-btn{padding:6px 12px;border-radius:8px;border:1px solid ${BORDER};background:transparent;color:${TEXT2};font-size:12px;font-weight:500;cursor:pointer;transition:all 0.12s;font-family:${F}}
        .quick-btn.on{background:rgba(25,201,119,0.12);border-color:${TEAL};color:${TEAL}}
        .tmpl-btn{padding:7px 11px;border-radius:9px;border:1px solid ${BORDER};background:transparent;color:${TEXT2};font-size:11px;font-weight:600;cursor:pointer;transition:all 0.12s;font-family:${F};white-space:nowrap}
        .tmpl-btn:hover{background:${S3};color:${TEXT};border-color:${BORDER_HI}}
      `}</style>

      <nav style={{borderBottom:`1px solid ${BORDER}`,background:'rgba(7,16,13,0.92)',backdropFilter:'blur(20px)',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/bookings" style={{color:TEXT2,textDecoration:'none',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Bookings
          </Link>
          <span style={{color:BORDER_HI}}>|</span>
          <span style={{fontWeight:700,fontSize:15,color:TEXT}}>New Booking</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {[{n:1,l:'Customer'},{n:2,l:'Itinerary'}].map(({n,l},i)=>(
            <div key={n} style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:100,background:step===n?'rgba(25,201,119,0.12)':'transparent',border:`1px solid ${step===n?TEAL:BORDER}`}}>
                <div style={{width:18,height:18,borderRadius:'50%',background:step>n?TEAL:step===n?TEAL:S3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{step>n?'✓':n}</div>
                <span style={{fontSize:12,fontWeight:600,color:step===n?TEAL:TEXT3}}>{l}</span>
              </div>
              {i===0&&<div style={{width:16,height:1,background:BORDER_HI}}/>}
            </div>
          ))}
        </div>
      </nav>

      <main style={{maxWidth:680,margin:'0 auto',padding:'28px 24px 80px'}}>
        {step===1&&(
          <div>
            <h1 style={{fontSize:21,fontWeight:800,letterSpacing:'-0.03em',color:TEXT,marginBottom:4}}>Customer Details</h1>
            <p style={{fontSize:13,color:TEXT2,marginBottom:24}}>Basic info and number of days</p>
            <div style={card}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{gridColumn:'1/-1'}}><label style={lbl}>Client / Group Name *</label><input style={inp} value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="e.g. Wang Family, ABC Corp Tour" /></div>
                <div><label style={lbl}>Mobile Number *</label><input style={inp} value={mobileNumber} onChange={e=>setMobileNumber(e.target.value)} placeholder="+66 81 234 5678" type="tel" /></div>
                <div><label style={lbl}>Contact Person</label><input style={inp} value={contactPerson} onChange={e=>setContactPerson(e.target.value)} placeholder="Guide / Agent name" /></div>
                <div><label style={lbl}>Number of Days *</label><input style={inp} type="number" min="1" max="30" value={numDays} onChange={e=>setNumDays(Number(e.target.value))} /></div>
                <div><label style={lbl}>Total Group Size *</label><input style={inp} type="number" min="1" value={totalPax} onChange={e=>setTotalPax(Number(e.target.value))} placeholder="Total pax" /></div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={lbl}>Booking Type</label>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                    {BOOKING_TYPES.map(bt=>(<button key={bt.v} type="button" className={`quick-btn ${bookingType===bt.v?'on':''}`} onClick={()=>setBookingType(bt.v)}>{bt.l}</button>))}
                  </div>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={lbl}>Special Requirements</label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap' as const,marginBottom:10}}>
                    {QUICK_REQS.map(r=>(<button key={r} type="button" className={`quick-btn ${quickReqs.includes(r)?'on':''}`} onClick={()=>toggleReq(r)}>{r}</button>))}
                  </div>
                  <textarea style={{...inp,resize:'none'}} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any other requirements..." />
                </div>
              </div>
            </div>
            <button type="button" onClick={goToStep2} style={{width:'100%',padding:'14px',background:TEAL,color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,boxShadow:'0 4px 16px rgba(25,201,119,0.3)'}}>
              Next: Add {numDays} Day{numDays>1?'s':''} Itinerary →
            </button>
          </div>
        )}

        {step===2&&(
          <form onSubmit={handleSubmit}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <h1 style={{fontSize:21,fontWeight:800,letterSpacing:'-0.03em',color:TEXT,marginBottom:4}}>Trip Itinerary</h1>
                <p style={{fontSize:13,color:TEXT2}}><span style={{color:TEAL,fontWeight:600}}>{clientName}</span>{' · '}{totalPax} pax{' · '}{days.length} day{days.length>1?'s':''}</p>
              </div>
              <button type="button" onClick={()=>setDays(prev=>[...prev,makeDay(totalPax)])} style={{padding:'7px 14px',background:'transparent',border:`1px solid ${TEAL}`,color:TEAL,borderRadius:9,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,flexShrink:0}}>+ Add Day</button>
            </div>

            {days.map((day,i)=>(
              <div key={i} style={{...card,position:'relative'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:28,height:28,background:TEAL,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',flexShrink:0}}>D{i+1}</div>
                    <span style={{fontWeight:700,fontSize:14,color:TEXT}}>Day {i+1}</span>
                    <span style={{fontSize:12,color:TEXT2}}>{day.pax_count} pax</span>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {i>0&&<button type="button" onClick={()=>duplicateDay(i-1)} style={{padding:'3px 9px',background:'transparent',border:`1px solid ${BORDER_HI}`,color:TEXT2,borderRadius:6,fontSize:11,cursor:'pointer',fontFamily:F}}>Copy Day {i}</button>}
                    {days.length>1&&<button type="button" onClick={()=>setDays(prev=>prev.filter((_,idx)=>idx!==i))} style={{padding:'3px 9px',background:'transparent',border:'1px solid rgba(248,113,113,0.25)',color:'#F87171',borderRadius:6,fontSize:11,cursor:'pointer',fontFamily:F}}>Remove</button>}
                  </div>
                </div>

                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,fontFamily:FM,letterSpacing:'0.08em',textTransform:'uppercase',color:TEXT3,marginBottom:8}}>Quick Template</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
                    {TRIP_TYPES.map(tt=>(<button key={tt.v} type="button" className="tmpl-btn" style={{background:day.trip_type===tt.v?'rgba(25,201,119,0.1)':'transparent',borderColor:day.trip_type===tt.v?TEAL:BORDER,color:day.trip_type===tt.v?TEAL:TEXT2}} onClick={()=>applyTemplate(i,tt.v)}>{tt.l}</button>))}
                  </div>
                </div>

                <div style={{height:1,background:BORDER,marginBottom:14}}/>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><label style={lbl}>Date *</label><input style={inp} type="date" value={day.trip_date} onChange={e=>setDay(i,'trip_date',e.target.value)} required /></div>
                  <div><label style={lbl}>Pickup Time</label><input style={inp} type="time" value={day.pickup_time} onChange={e=>setDay(i,'pickup_time',e.target.value)} /></div>
                  <div style={{gridColumn:'1/-1',position:'relative'}}>
                    <label style={lbl}>Pickup Location *</label>
                    <input style={inp} value={day.pickup_location} onChange={e=>setDay(i,'pickup_location',e.target.value)} onFocus={()=>setLocationSuggest({dayIdx:i,field:'pickup'})} onBlur={()=>setTimeout(()=>setLocationSuggest(null),150)} required placeholder="e.g. Suvarnabhumi Airport" />
                    {locationSuggest?.dayIdx===i&&locationSuggest.field==='pickup'&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:S2,border:`1px solid ${BORDER_HI}`,borderRadius:10,zIndex:50,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
                        {SAVED_LOCATIONS.filter(l=>l.toLowerCase().includes(day.pickup_location.toLowerCase())||day.pickup_location==='').slice(0,5).map(loc=>(<div key={loc} onMouseDown={()=>setDay(i,'pickup_location',loc)} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,color:TEXT2,borderBottom:`1px solid ${BORDER}`}} onMouseEnter={e=>(e.currentTarget.style.background=S3)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>{loc}</div>))}
                      </div>
                    )}
                  </div>
                  <div style={{gridColumn:'1/-1',position:'relative'}}>
                    <label style={lbl}>Drop-off Location *</label>
                    <input style={inp} value={day.dropoff_location} onChange={e=>setDay(i,'dropoff_location',e.target.value)} onFocus={()=>setLocationSuggest({dayIdx:i,field:'drop'})} onBlur={()=>setTimeout(()=>setLocationSuggest(null),150)} required placeholder="e.g. Centara Grand Hotel" />
                    {locationSuggest?.dayIdx===i&&locationSuggest.field==='drop'&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:S2,border:`1px solid ${BORDER_HI}`,borderRadius:10,zIndex:50,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
                        {SAVED_LOCATIONS.filter(l=>l.toLowerCase().includes(day.dropoff_location.toLowerCase())||day.dropoff_location==='').slice(0,5).map(loc=>(<div key={loc} onMouseDown={()=>setDay(i,'dropoff_location',loc)} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,color:TEXT2,borderBottom:`1px solid ${BORDER}`}} onMouseEnter={e=>(e.currentTarget.style.background=S3)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>{loc}</div>))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>Pax This Day</label>
                    <input style={inp} type="number" min="1" value={day.pax_count} onChange={e=>setDay(i,'pax_count',Number(e.target.value))} />
                    <div style={{fontSize:11,color:TEXT3,marginTop:4}}>Total group: {totalPax}</div>
                  </div>
                  <div>
                    <label style={lbl}>Vehicle <span style={{color:TEAL,fontWeight:400}}>(auto-suggested)</span></label>
                    <select style={inp} value={day.vehicle_type} onChange={e=>setDay(i,'vehicle_type',e.target.value)}>
                      {VEHICLE_TYPES.map(vt=>(<option key={vt.v} value={vt.v}>{vt.l}</option>))}
                    </select>
                  </div>
                  {/* Duration hours — only for non-airport trips */}
                  {day.trip_type!=='airport_pickup'&&day.trip_type!=='airport_drop'&&(
                    <div style={{gridColumn:'1/-1'}}>
                      <label style={lbl}>Duration (hours) <span style={{color:TEXT3}}>— how many hours is this trip?</span></label>
                      <input style={inp} type="number" min="1" max="24" step="0.5" value={day.duration_hours} onChange={e=>setDay(i,'duration_hours',parseFloat(e.target.value)||1)} placeholder="e.g. 8" />
                    </div>
                  )}
                  {(day.trip_type==='airport_pickup'||day.trip_type==='airport_drop')&&<>
                    <div><label style={lbl}>Flight Number</label><input style={inp} value={day.flight_number} onChange={e=>setDay(i,'flight_number',e.target.value)} placeholder="TG305" /></div>
                    <div><label style={lbl}>Terminal</label><input style={inp} value={day.terminal} onChange={e=>setDay(i,'terminal',e.target.value)} placeholder="T1, T2..." /></div>
                  </>}
                  <div style={{gridColumn:'1/-1'}}><label style={lbl}>Day Notes (optional)</label><input style={inp} value={day.notes} onChange={e=>setDay(i,'notes',e.target.value)} placeholder="Special instructions for this day" /></div>
                </div>
              </div>
            ))}

            <div style={{display:'flex',gap:10,marginTop:8}}>
              <button type="button" onClick={()=>setStep(1)} style={{padding:'13px 20px',background:'transparent',border:`1px solid ${BORDER_HI}`,color:TEXT2,borderRadius:12,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F,flexShrink:0}}>← Back</button>
              <button type="submit" disabled={submitting} style={{flex:1,padding:'13px',background:submitting?'#148f55':TEAL,color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:submitting?'not-allowed':'pointer',fontFamily:F,boxShadow:'0 4px 16px rgba(25,201,119,0.3)'}}>
                {submitting?'Saving...':'Save Booking →'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* OPERATOR DISPATCH MODAL */}
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
                    <h3 style={{fontWeight:800,fontSize:16,color:TEXT,marginBottom:3}}>Send to Operator via LINE</h3>
                    <p style={{fontSize:12,color:TEXT2}}>Booking saved ✔ {days.length} day{days.length>1?'s':''} · {clientName}</p>
                  </div>
                  <button onClick={()=>{setShowDispatch(false);router.push('/bookings')}} style={{width:26,height:26,borderRadius:'50%',background:S3,border:`1px solid ${BORDER}`,color:TEXT2,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginLeft:10}}>×</button>
                </div>

                {/* Dispatch mode tabs */}
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

                {/* Operator list */}
                {dispatchMode!=='pool'?(
                  <div style={{flex:1,overflowY:'auto',padding:'12px 22px'}}>
                    {/* Preferred / All filter */}
                    <div style={{display:'flex',gap:6,marginBottom:10}}>
                      {preferredOps.length > 0 && (
                        <button onClick={()=>setShowPreferredOnly(true)} style={{padding:'5px 12px',borderRadius:100,fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${showPreferredOnly?'rgba(245,158,11,0.5)':BORDER}`,background:showPreferredOnly?'rgba(245,158,11,0.12)':'transparent',color:showPreferredOnly?'#F59E0B':TEXT3,fontFamily:F}}>
                          ⭐ Preferred ({preferredOps.length})
                        </button>
                      )}
                      <button onClick={()=>setShowPreferredOnly(false)} style={{padding:'5px 12px',borderRadius:100,fontSize:11,fontWeight:600,cursor:'pointer',border:`1px solid ${!showPreferredOnly?TEAL:BORDER}`,background:!showPreferredOnly?'rgba(25,201,119,0.1)':'transparent',color:!showPreferredOnly?TEAL:TEXT3,fontFamily:F}}>
                        All ({operators.length})
                      </button>
                    </div>

                    {displayedOps.length===0?(
                      <div style={{padding:'24px 0',textAlign:'center',color:TEXT2,fontSize:13}}>
                        {showPreferredOnly ? 'No preferred operators. Go to Operators page to star some.' : 'No active operators yet.'}
                      </div>
                    ):displayedOps.map(op=>{
                      const sel=selectedOps.includes(op.id)
                      const isPref=preferredIds.includes(op.id)
                      return (
                        <div key={op.id} onClick={()=>toggleOp(op.id)}
                          style={{display:'flex',alignItems:'center',gap:12,padding:'11px 12px',background:sel?'rgba(25,201,119,0.08)':'transparent',border:`1px solid ${sel?TEAL:BORDER}`,borderRadius:11,marginBottom:7,cursor:'pointer',transition:'all 0.12s'}}>
                          <div style={{width:36,height:36,borderRadius:9,background:sel?TEAL:S3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:sel?'#fff':TEXT2,flexShrink:0}}>
                            {isPref ? '⭐' : op.company_name.charAt(0)}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:13,color:TEXT,display:'flex',alignItems:'center',gap:6}}>
                              {op.company_name}
                              {isPref&&<span style={{fontSize:9,background:'rgba(245,158,11,0.15)',color:'#F59E0B',padding:'1px 5px',borderRadius:100,fontFamily:FM}}>PREFERRED</span>}
                            </div>
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
                    {sending?'Sending...':`📱 Send to ${selectedOps.length} Operator${selectedOps.length!==1?'s':''} via LINE`}
                  </button>
                  <button onClick={()=>{setShowDispatch(false);router.push('/bookings')}} type="button"
                    style={{width:'100%',padding:'9px',background:'transparent',border:'none',color:TEXT3,fontSize:12,cursor:'pointer',fontFamily:F}}>Skip — notify later</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}