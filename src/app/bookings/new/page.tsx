'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const VEHICLE_TYPES = [
  {v:'sedan',l:'Sedan'},{v:'suv',l:'SUV'},{v:'van_9',l:'Van 9 Seats'},{v:'van_12',l:'Van 12 Seats'},
  {v:'minibus_15',l:'Minibus 15'},{v:'minibus_20',l:'Minibus 20'},{v:'coach_30',l:'Coach 30'},{v:'coach_40plus',l:'Coach 40+'},
]
const BOOKING_TYPES = [
  {v:'airport_transfer',l:'Airport Transfer'},{v:'hotel_transfer',l:'Hotel Transfer'},
  {v:'sightseeing',l:'Sightseeing'},{v:'day_tour',l:'Day Tour'},{v:'custom',l:'Custom'},
]
const TRIP_TYPES = [
  {v:'airport_pickup',l:'Airport Pickup'},{v:'airport_drop',l:'Airport Drop'},
  {v:'city_tour',l:'City Tour'},{v:'hotel_transfer',l:'Hotel Transfer'},
  {v:'sightseeing',l:'Sightseeing'},{v:'custom',l:'Custom'},
]
const QUICK_REQS = ['Wheelchair','Baby Seat','VIP','Halal Food','English Guide','Thai Guide','Child Seat','Extra Luggage']
const SAVED_LOCATIONS = [
  'Suvarnabhumi Airport (BKK)','Don Mueang Airport (DMK)','Phuket Airport (HKT)','Chiang Mai Airport (CNX)',
  'Centara Grand Bangkok','Mandarin Oriental Bangkok','Anantara Riverside Bangkok','W Hotel Bangkok',
  'Pattaya City Center','Chiang Mai Old City',
]

function suggestVehicle(pax:number):string {
  if (pax<=3) return 'sedan'; if (pax<=4) return 'suv'; if (pax<=9) return 'van_9';
  if (pax<=12) return 'van_12'; if (pax<=15) return 'minibus_15'; if (pax<=20) return 'minibus_20';
  if (pax<=30) return 'coach_30'; return 'coach_40plus';
}

type Day = { trip_date:string; pickup_time:string; trip_type:string; pickup_location:string; dropoff_location:string; vehicle_type:string; pax_count:number; flight_number:string; terminal:string; notes:string; duration_hours:number }
type Operator = { id:string; company_name:string; status:string; is_verified:boolean; base_location:string|null; line_user_id:string|null }

function makeDay(pax=1, overrides:Partial<Day>={}):Day {
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
      const { data:{user} } = await sb.auth.getUser()
      if (!user) return
      const [{ data:ops }, { data:dmc }] = await Promise.all([
        sb.from('operators').select('id,company_name,status,is_verified,base_location,line_user_id').eq('status','active').order('company_name'),
        sb.from('dmc_users').select('preferred_operator_ids').eq('id', user.id).single()
      ])
      setOperators(ops??[])
      setPreferredIds(dmc?.preferred_operator_ids??[])
    }
    loadData()
  }, [])

  function goToStep2() {
    if (!clientName.trim()) { toast.error('Client name is required'); return }
    if (!mobileNumber.trim()) { toast.error('Mobile number is required'); return }
    const n = Math.max(1, numDays)
    const existing = days.slice(0, n)
    while (existing.length < n) existing.push(makeDay(totalPax))
    setDays(existing.map(d => ({...d, pax_count:d.pax_count||totalPax, vehicle_type:d.vehicle_type||suggestVehicle(totalPax)})))
    setStep(2)
  }

  function setDay(i:number, k:keyof Day, v:any) {
    setDays(prev => { const d=[...prev]; d[i]={...d[i],[k]:v}; if(k==='pax_count') d[i].vehicle_type=suggestVehicle(Number(v)); return d })
  }
  function duplicateDay(i:number) {
    setDays(prev => { const d=[...prev]; d[i+1]={...d[i],trip_date:''}; return d })
    toast.success('Day copied — update the date')
  }
  function applyTemplate(i:number, ttype:string) {
    const templates: Record<string,Partial<Day>> = {
      airport_pickup:{trip_type:'airport_pickup',pickup_location:'Suvarnabhumi Airport (BKK)',pickup_time:'09:00'},
      airport_drop:{trip_type:'airport_drop',dropoff_location:'Suvarnabhumi Airport (BKK)',pickup_time:'08:00'},
      city_tour:{trip_type:'city_tour',pickup_location:'Hotel Lobby',dropoff_location:'Hotel Lobby',pickup_time:'09:00'},
      hotel_transfer:{trip_type:'hotel_transfer',pickup_time:'12:00'},
      sightseeing:{trip_type:'sightseeing',pickup_location:'Hotel Lobby',dropoff_location:'Hotel Lobby',pickup_time:'08:00'},
    }
    setDays(prev => { const d=[...prev]; d[i]={...d[i],...(templates[ttype]||{})}; return d })
  }

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const sb = createClient()
    const {data:{user}} = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }
    const ref = 'BK'+Date.now().toString().slice(-6)
    const specialReqs = [quickReqs.join(', '), notes].filter(Boolean).join(' | ')
    const {data:booking, error:bErr} = await sb.from('bookings').insert({
      dmc_id:user.id, booking_ref:ref, booking_type:bookingType, client_name:clientName,
      mobile_number:mobileNumber, contact_person:contactPerson||null,
      adults_count:totalPax, children_count:0, total_days:days.length,
      status:'pending', special_requirements:specialReqs||null, notes:null,
    }).select().single()
    if (bErr||!booking) { toast.error(bErr?.message||'Error saving'); setSubmitting(false); return }
    for (let i=0; i<days.length; i++) {
      const d = days[i]
      await sb.from('trips').insert({
        booking_id:booking.id, dmc_id:user.id, day_number:i+1,
        trip_date:d.trip_date, pickup_time:d.pickup_time,
        pickup_location:d.pickup_location, dropoff_location:d.dropoff_location,
        vehicle_type:d.vehicle_type, pax_count:d.pax_count, status:'pending',
        estimated_duration_hours:(d.trip_type!=='airport_pickup'&&d.trip_type!=='airport_drop')?d.duration_hours:null,
        notes:[d.trip_type,d.flight_number,d.terminal,d.notes].filter(Boolean).join(' | ')||null,
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
      await sb.functions.invoke('booking-created', {body:{bookingId:createdBookingId}})
    } else {
      for (const opId of selectedOps) {
        await sb.functions.invoke('booking-created', {body:{bookingId:createdBookingId, operatorId:opId}})
      }
    }
    setSending(false); setSent(true)
    setTimeout(() => router.push('/bookings'), 1800)
  }

  function toggleReq(r:string) { setQuickReqs(prev=>prev.includes(r)?prev.filter(x=>x!==r):[...prev,r]) }
  function toggleOp(id:string) {
    if (dispatchMode==='single') setSelectedOps([id])
    else setSelectedOps(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  }

  const preferredOps = operators.filter(o=>preferredIds.includes(o.id))
  const displayedOps = showPreferredOnly && preferredOps.length>0 ? preferredOps : operators

  // ---- STYLES ----
  const PG: React.CSSProperties = {minHeight:'100vh',background:'var(--bg-page)',fontFamily:'var(--font-sans)'}
  const NAV: React.CSSProperties = {background:'var(--bg-page)',borderBottom:'0.5px solid var(--border)',height:52,display:'flex',alignItems:'center',position:'sticky' as const,top:0,zIndex:50}
  const CARD: React.CSSProperties = {background:'#fff',border:'0.5px solid var(--border)',borderRadius:10,padding:'20px',marginBottom:14}
  const LBL: React.CSSProperties = {display:'block',fontSize:11,fontWeight:500,letterSpacing:'0.06em',textTransform:'uppercase' as const,color:'var(--text-tertiary)',marginBottom:5}

  return (
    <div style={PG}>
      <nav style={NAV}>
        <div style={{maxWidth:760,margin:'0 auto',padding:'0 24px',width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <a href="/bookings" style={{color:'var(--text-tertiary)',textDecoration:'none',display:'flex'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
            <div style={{width:'0.5px',height:16,background:'var(--border)'}}/>
            <a href="/dashboard" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontWeight:700,fontSize:15,letterSpacing:'-0.4px',color:'var(--text-primary)'}}>RIDEN</span>
              <span style={{fontSize:9,letterSpacing:'1px',color:'var(--text-primary)',opacity:0.35}}>ไรเด็น</span>
            </a>
            <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>New Booking</span>
          </div>
          {/* Step indicator */}
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            {[{n:1,l:'Details'},{n:2,l:'Itinerary'}].map(({n,l},i)=>(
              <div key={n} style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{display:'flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,background:step===n?'rgba(25,201,119,0.08)':'transparent',border:'0.5px solid '+(step===n?'var(--accent)':'var(--border)')}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:step>n?'var(--accent)':step===n?'var(--accent)':'var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:'#fff',flexShrink:0}}>{step>n?'✓':n}</div>
                  <span style={{fontSize:11,fontWeight:500,color:step===n?'var(--accent)':'var(--text-tertiary)'}}>{l}</span>
                </div>
                {i===0&&<div style={{width:12,height:'0.5px',background:'var(--border)'}}/>}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main style={{maxWidth:680,margin:'0 auto',padding:'24px 24px 80px'}}>

        {/* STEP 1 */}
        {step===1&&(
          <div>
            <h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',marginBottom:2}}>Customer Details</h1>
            <p style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:20}}>Basic information and trip overview</p>

            <div style={CARD}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={LBL}>Client / Group Name *</label>
                  <input value={clientName} onChange={e=>setClientName(e.target.value)} className="riden-input" placeholder="e.g. Wang Family, ABC Corp Tour" />
                </div>
                <div>
                  <label style={LBL}>Mobile Number *</label>
                  <input value={mobileNumber} onChange={e=>setMobileNumber(e.target.value)} className="riden-input" placeholder="+66 81 234 5678" type="tel" />
                </div>
                <div>
                  <label style={LBL}>Contact Person</label>
                  <input value={contactPerson} onChange={e=>setContactPerson(e.target.value)} className="riden-input" placeholder="Guide / Agent name" />
                </div>
                <div>
                  <label style={LBL}>Number of Days *</label>
                  <input type="number" min="1" max="30" value={numDays} onChange={e=>setNumDays(Number(e.target.value))} className="riden-input" />
                </div>
                <div>
                  <label style={LBL}>Total Group Size *</label>
                  <input type="number" min="1" value={totalPax} onChange={e=>setTotalPax(Number(e.target.value))} className="riden-input" placeholder="Total pax" />
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={LBL}>Booking Type</label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap' as const,marginTop:2}}>
                    {BOOKING_TYPES.map(bt=>(
                      <button key={bt.v} type="button" onClick={()=>setBookingType(bt.v)}
                        style={{padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:500,border:'0.5px solid '+(bookingType===bt.v?'var(--accent)':'var(--border)'),background:bookingType===bt.v?'var(--accent-bg)':'#fff',color:bookingType===bt.v?'var(--accent)':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)',transition:'all 0.1s'}}>
                        {bt.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={LBL}>Special Requirements</label>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap' as const,marginBottom:8,marginTop:2}}>
                    {QUICK_REQS.map(r=>(
                      <button key={r} type="button" onClick={()=>toggleReq(r)}
                        style={{padding:'4px 10px',borderRadius:6,fontSize:11,fontWeight:500,border:'0.5px solid '+(quickReqs.includes(r)?'var(--accent)':'var(--border)'),background:quickReqs.includes(r)?'var(--accent-bg)':'#fff',color:quickReqs.includes(r)?'var(--accent)':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)',transition:'all 0.1s'}}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="riden-input" rows={2} style={{resize:'vertical' as const}} placeholder="Any other requirements..." />
                </div>
              </div>
            </div>

            <button type="button" onClick={goToStep2} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:14}}>
              Next: Add {numDays} Day{numDays>1?'s':''} Itinerary →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step===2&&(
          <form onSubmit={handleSubmit}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:600,letterSpacing:'-0.3px',marginBottom:2}}>Trip Itinerary</h1>
                <p style={{fontSize:12,color:'var(--text-tertiary)'}}><span style={{color:'var(--text-primary)',fontWeight:500}}>{clientName}</span> · {totalPax} pax · {days.length} day{days.length>1?'s':''}</p>
              </div>
              <button type="button" onClick={()=>setDays(prev=>[...prev,makeDay(totalPax)])} className="btn-ghost" style={{padding:'6px 12px',fontSize:12,flexShrink:0}}>+ Add Day</button>
            </div>

            {days.map((day,i)=>(
              <div key={i} style={{...CARD,position:'relative'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:24,height:24,borderRadius:6,background:'var(--text-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#fff',flexShrink:0}}>D{i+1}</div>
                    <span style={{fontWeight:500,fontSize:14}}>Day {i+1}</span>
                    <span style={{fontSize:12,color:'var(--text-tertiary)'}}>{day.pax_count} pax</span>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {i>0&&<button type="button" onClick={()=>duplicateDay(i-1)} className="btn-ghost" style={{padding:'3px 8px',fontSize:11}}>Copy Day {i}</button>}
                    {days.length>1&&<button type="button" onClick={()=>setDays(prev=>prev.filter((_,idx)=>idx!==i))} style={{padding:'3px 8px',borderRadius:5,fontSize:11,border:'0.5px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.05)',color:'var(--danger)',cursor:'pointer',fontFamily:'var(--font-sans)'}}>Remove</button>}
                  </div>
                </div>

                {/* Quick templates */}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:500,letterSpacing:'0.06em',textTransform:'uppercase' as const,color:'var(--text-tertiary)',marginBottom:6}}>Quick Template</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap' as const}}>
                    {TRIP_TYPES.map(tt=>(
                      <button key={tt.v} type="button" onClick={()=>applyTemplate(i,tt.v)}
                        style={{padding:'4px 10px',borderRadius:6,fontSize:11,fontWeight:500,border:'0.5px solid '+(day.trip_type===tt.v?'var(--accent)':'var(--border)'),background:day.trip_type===tt.v?'var(--accent-bg)':'#fff',color:day.trip_type===tt.v?'var(--accent)':'var(--text-secondary)',cursor:'pointer',fontFamily:'var(--font-sans)',transition:'all 0.1s'}}>
                        {tt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{height:'0.5px',background:'var(--border)',marginBottom:12}}/>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div>
                    <label style={LBL}>Date *</label>
                    <input type="date" value={day.trip_date} onChange={e=>setDay(i,'trip_date',e.target.value)} required className="riden-input" />
                  </div>
                  <div>
                    <label style={LBL}>Pickup Time</label>
                    <input type="time" value={day.pickup_time} onChange={e=>setDay(i,'pickup_time',e.target.value)} className="riden-input" />
                  </div>

                  <div style={{gridColumn:'1/-1',position:'relative'}}>
                    <label style={LBL}>Pickup Location *</label>
                    <input value={day.pickup_location} onChange={e=>setDay(i,'pickup_location',e.target.value)}
                      onFocus={()=>setLocationSuggest({dayIdx:i,field:'pickup'})}
                      onBlur={()=>setTimeout(()=>setLocationSuggest(null),150)}
                      required className="riden-input" placeholder="e.g. Suvarnabhumi Airport" />
                    {locationSuggest?.dayIdx===i&&locationSuggest.field==='pickup'&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'0.5px solid var(--border)',borderRadius:8,zIndex:50,overflow:'hidden',boxShadow:'0 4px 16px rgba(0,0,0,0.12)',marginTop:2}}>
                        {SAVED_LOCATIONS.filter(l=>l.toLowerCase().includes(day.pickup_location.toLowerCase())||day.pickup_location==='').slice(0,5).map(loc=>(
                          <div key={loc} onMouseDown={()=>setDay(i,'pickup_location',loc)}
                            style={{padding:'9px 12px',cursor:'pointer',fontSize:12,color:'var(--text-secondary)',borderBottom:'0.5px solid var(--bg-page)',transition:'background 0.1s'}}
                            onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-page)')}
                            onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                            {loc}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{gridColumn:'1/-1',position:'relative'}}>
                    <label style={LBL}>Drop-off Location *</label>
                    <input value={day.dropoff_location} onChange={e=>setDay(i,'dropoff_location',e.target.value)}
                      onFocus={()=>setLocationSuggest({dayIdx:i,field:'drop'})}
                      onBlur={()=>setTimeout(()=>setLocationSuggest(null),150)}
                      required className="riden-input" placeholder="e.g. Centara Grand Hotel" />
                    {locationSuggest?.dayIdx===i&&locationSuggest.field==='drop'&&(
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'0.5px solid var(--border)',borderRadius:8,zIndex:50,overflow:'hidden',boxShadow:'0 4px 16px rgba(0,0,0,0.12)',marginTop:2}}>
                        {SAVED_LOCATIONS.filter(l=>l.toLowerCase().includes(day.dropoff_location.toLowerCase())||day.dropoff_location==='').slice(0,5).map(loc=>(
                          <div key={loc} onMouseDown={()=>setDay(i,'dropoff_location',loc)}
                            style={{padding:'9px 12px',cursor:'pointer',fontSize:12,color:'var(--text-secondary)',borderBottom:'0.5px solid var(--bg-page)',transition:'background 0.1s'}}
                            onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-page)')}
                            onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                            {loc}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={LBL}>Pax This Day</label>
                    <input type="number" min="1" value={day.pax_count} onChange={e=>setDay(i,'pax_count',Number(e.target.value))} className="riden-input" />
                    <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:3}}>Group total: {totalPax}</div>
                  </div>
                  <div>
                    <label style={LBL}>Vehicle <span style={{color:'var(--accent)',fontWeight:400,textTransform:'none' as const}}>(auto-suggested)</span></label>
                    <select value={day.vehicle_type} onChange={e=>setDay(i,'vehicle_type',e.target.value)} className="riden-input">
                      {VEHICLE_TYPES.map(vt=><option key={vt.v} value={vt.v}>{vt.l}</option>)}
                    </select>
                  </div>

                  {day.trip_type!=='airport_pickup'&&day.trip_type!=='airport_drop'&&(
                    <div style={{gridColumn:'1/-1'}}>
                      <label style={LBL}>Duration (hours)</label>
                      <input type="number" min="1" max="24" step="0.5" value={day.duration_hours} onChange={e=>setDay(i,'duration_hours',parseFloat(e.target.value)||1)} className="riden-input" placeholder="e.g. 8" />
                    </div>
                  )}

                  {(day.trip_type==='airport_pickup'||day.trip_type==='airport_drop')&&<>
                    <div>
                      <label style={LBL}>Flight Number</label>
                      <input value={day.flight_number} onChange={e=>setDay(i,'flight_number',e.target.value)} className="riden-input" placeholder="TG305" />
                    </div>
                    <div>
                      <label style={LBL}>Terminal</label>
                      <input value={day.terminal} onChange={e=>setDay(i,'terminal',e.target.value)} className="riden-input" placeholder="T1, T2..." />
                    </div>
                  </>}

                  <div style={{gridColumn:'1/-1'}}>
                    <label style={LBL}>Day Notes (optional)</label>
                    <input value={day.notes} onChange={e=>setDay(i,'notes',e.target.value)} className="riden-input" placeholder="Special instructions for this day" />
                  </div>
                </div>
              </div>
            ))}

            <div style={{display:'flex',gap:8,marginTop:8}}>
              <button type="button" onClick={()=>setStep(1)} className="btn-ghost" style={{padding:'11px 18px',flexShrink:0}}>← Back</button>
              <button type="submit" disabled={submitting} className="btn-primary" style={{flex:1,justifyContent:'center',padding:'11px',fontSize:14,opacity:submitting?0.6:1}}>
                {submitting?'Saving...':'Save Booking →'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* OPERATOR DISPATCH MODAL */}
      {showDispatch&&(
        <div style={{position:'fixed' as const,inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',border:'0.5px solid var(--border)',borderRadius:14,width:'100%',maxWidth:480,maxHeight:'88vh',display:'flex',flexDirection:'column' as const,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}}>
            {sent?(
              <div style={{padding:56,textAlign:'center' as const}}>
                <div style={{fontSize:40,marginBottom:12}}>✅</div>
                <h3 style={{fontWeight:600,fontSize:18,color:'var(--text-primary)',marginBottom:6}}>Sent via LINE!</h3>
                <p style={{color:'var(--text-secondary)',fontSize:13}}>Operator will receive the booking now.</p>
              </div>
            ):(
              <>
                <div style={{padding:'16px 20px',borderBottom:'0.5px solid var(--border)',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
                  <div>
                    <h3 style={{fontWeight:600,fontSize:15,color:'var(--text-primary)',marginBottom:2}}>Send to Operator via LINE</h3>
                    <p style={{fontSize:12,color:'var(--text-tertiary)'}}>Booking saved ✓ {days.length} day{days.length>1?'s':''} · {clientName}</p>
                  </div>
                  <button onClick={()=>{setShowDispatch(false);router.push('/bookings')}} style={{width:24,height:24,borderRadius:'50%',background:'var(--bg-page)',border:'0.5px solid var(--border)',color:'var(--text-secondary)',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginLeft:10}}>×</button>
                </div>

                {/* Dispatch mode */}
                <div style={{padding:'12px 20px 0'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                    {([['single','Single','One operator'],['multiple','Multiple','Select several'],['pool','Broadcast','First accepts']] as const).map(([mode,label,sub])=>(
                      <button key={mode} onClick={()=>{setDispatchMode(mode);setSelectedOps([])}} type="button"
                        style={{padding:'9px 8px',background:dispatchMode===mode?'var(--accent-bg)':'var(--bg-page)',border:'0.5px solid '+(dispatchMode===mode?'var(--accent)':'var(--border)'),borderRadius:8,cursor:'pointer',textAlign:'left' as const,fontFamily:'var(--font-sans)'}}>
                        <div style={{fontSize:12,fontWeight:500,color:dispatchMode===mode?'var(--accent)':'var(--text-primary)',marginBottom:1}}>{label}</div>
                        <div style={{fontSize:10,color:'var(--text-tertiary)'}}>{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operator list */}
                {dispatchMode!=='pool'?(
                  <div style={{flex:1,overflowY:'auto' as const,padding:'10px 20px'}}>
                    <div style={{display:'flex',gap:5,marginBottom:8}}>
                      {preferredOps.length>0&&(
                        <button onClick={()=>setShowPreferredOnly(true)}
                          style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:500,cursor:'pointer',border:'0.5px solid '+(showPreferredOnly?'var(--warning)':'var(--border)'),background:showPreferredOnly?'rgba(245,158,11,0.08)':'transparent',color:showPreferredOnly?'var(--warning)':'var(--text-tertiary)',fontFamily:'var(--font-sans)'}}>
                          Preferred ({preferredOps.length})
                        </button>
                      )}
                      <button onClick={()=>setShowPreferredOnly(false)}
                        style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:500,cursor:'pointer',border:'0.5px solid '+(!showPreferredOnly?'var(--accent)':'var(--border)'),background:!showPreferredOnly?'var(--accent-bg)':'transparent',color:!showPreferredOnly?'var(--accent)':'var(--text-tertiary)',fontFamily:'var(--font-sans)'}}>
                        All ({operators.length})
                      </button>
                    </div>
                    {displayedOps.length===0?(
                      <div style={{padding:'20px 0',textAlign:'center' as const,color:'var(--text-tertiary)',fontSize:12}}>
                        {showPreferredOnly?'No preferred operators. Star some on Operators page.':'No active operators yet.'}
                      </div>
                    ):displayedOps.map(op=>{
                      const sel=selectedOps.includes(op.id)
                      const isPref=preferredIds.includes(op.id)
                      return (
                        <div key={op.id} onClick={()=>toggleOp(op.id)}
                          style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',background:sel?'var(--accent-bg)':'transparent',border:'0.5px solid '+(sel?'var(--accent)':'var(--border)'),borderRadius:8,marginBottom:5,cursor:'pointer',transition:'all 0.1s'}}>
                          <div style={{width:32,height:32,borderRadius:8,background:sel?'var(--accent)':'var(--bg-page)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:sel?'#fff':'var(--text-primary)',flexShrink:0}}>
                            {op.company_name.charAt(0)}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:500,fontSize:13,color:'var(--text-primary)',display:'flex',alignItems:'center',gap:5}}>
                              {op.company_name}
                              {isPref&&<span style={{fontSize:9,background:'rgba(245,158,11,0.1)',color:'var(--warning)',padding:'1px 5px',borderRadius:10,fontWeight:500}}>PREFERRED</span>}
                            </div>
                            <div style={{fontSize:11,color:'var(--text-tertiary)'}}>{op.base_location||'—'}{op.line_user_id?' · LINE':'· No LINE'}{op.is_verified?' · ✓':''}</div>
                          </div>
                          <div style={{width:16,height:16,borderRadius:'50%',background:sel?'var(--accent)':'transparent',border:'0.5px solid '+(sel?'var(--accent)':'var(--border)'),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {sel&&<span style={{color:'#fff',fontSize:9}}>✓</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ):(
                  <div style={{padding:'24px 20px',textAlign:'center' as const}}>
                    <div style={{fontSize:28,marginBottom:8}}>📡</div>
                    <p style={{color:'var(--text-primary)',fontWeight:500,fontSize:13,marginBottom:3}}>Broadcast to All Operators</p>
                    <p style={{color:'var(--text-tertiary)',fontSize:12}}>{operators.length} operators get this simultaneously. First to accept wins.</p>
                  </div>
                )}

                <div style={{padding:'10px 20px 16px',borderTop:'0.5px solid var(--border)',display:'flex',flexDirection:'column' as const,gap:6}}>
                  <button onClick={handleDispatch} disabled={sending||(dispatchMode!=='pool'&&selectedOps.length===0)} type="button"
                    className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'10px',fontSize:13,opacity:(sending||(dispatchMode!=='pool'&&selectedOps.length===0))?0.5:1,cursor:(sending||(dispatchMode!=='pool'&&selectedOps.length===0))?'not-allowed':'pointer'}}>
                    {sending?'Sending...':'Send to '+(dispatchMode==='pool'?'All Operators':selectedOps.length+' Operator'+(selectedOps.length!==1?'s':''))+' via LINE'}
                  </button>
                  <button onClick={()=>{setShowDispatch(false);router.push('/bookings')}} type="button"
                    style={{width:'100%',padding:'7px',background:'transparent',border:'none',color:'var(--text-tertiary)',fontSize:12,cursor:'pointer',fontFamily:'var(--font-sans)'}}>
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
