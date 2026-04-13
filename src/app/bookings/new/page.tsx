'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const VEHICLE_TYPES = ['sedan','van_9','van_12','minibus_15','minibus_20','coach_30','coach_40plus','suv','pickup']
const BOOKING_TYPES = ['airport_transfer','hotel_transfer','sightseeing','day_tour','custom']
const TEAL = '#19C977'

type Operator = { id: string; company_name: string; status: string; is_verified: boolean; base_location: string; line_user_id: string | null }

export default function NewBookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [operators, setOperators] = useState<Operator[]>([])
  const [showDispatch, setShowDispatch] = useState(false)
  const [dispatchMode, setDispatchMode] = useState<'single'|'multiple'|'pool'>('single')
  const [selectedOps, setSelectedOps] = useState<string[]>([])
  const [createdBookingId, setCreatedBookingId] = useState<string|null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const [form, setForm] = useState({
    client_name: '', booking_type: 'airport_transfer', flight_number: '',
    adults_count: 1, children_count: 0, special_requirements: '', notes: '',
    days: [{ trip_date: '', pickup_time: '09:00', pickup_location: '', dropoff_location: '', vehicle_type: 'van_9', pax_count: 1 }]
  })

  const F = "'Inter',-apple-system,sans-serif"
  const FM = "'JetBrains Mono',monospace"
  const BG = '#07100D', S2 = '#111F15', S3 = '#16271A'
  const BORDER = 'rgba(255,255,255,0.08)', BORDER_HI = 'rgba(255,255,255,0.14)'
  const TEXT = '#EDF5F0', TEXT2 = '#7A9A87', TEXT3 = '#3D5C47'

  useEffect(() => {
    createClient().from('operators').select('id,company_name,status,is_verified,base_location,line_user_id').eq('status','active').order('company_name').then(({data}) => setOperators(data ?? []))
  }, [])

  function setF(k: string, v: any) { setForm(f => ({...f, [k]: v})) }
  function setDay(i: number, k: string, v: any) {
    setForm(f => { const days = [...f.days]; days[i] = {...days[i], [k]: v}; return {...f, days} })
  }
  function addDay() {
    setForm(f => ({ ...f, days: [...f.days, { trip_date: '', pickup_time: '09:00', pickup_location: '', dropoff_location: '', vehicle_type: 'van_9', pax_count: 1 }] }))
  }
  function removeDay(i: number) {
    setForm(f => ({ ...f, days: f.days.filter((_, idx) => idx !== i) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { router.push('/login'); return }

    const ref = 'BK' + Date.now().toString().slice(-6)
    const { data: booking, error: bErr } = await sb.from('bookings').insert({
      dmc_id: user.id, booking_ref: ref, booking_type: form.booking_type,
      client_name: form.client_name, flight_number: form.flight_number || null,
      adults_count: form.adults_count, children_count: form.children_count,
      total_days: form.days.length, status: 'pending',
      special_requirements: form.special_requirements || null, notes: form.notes || null
    }).select().single()

    if (bErr || !booking) { setLoading(false); alert('Error: ' + bErr?.message); return }

    for (let i = 0; i < form.days.length; i++) {
      const d = form.days[i]
      await sb.from('trips').insert({
        booking_id: booking.id, dmc_id: user.id, day_number: i + 1,
        trip_date: d.trip_date, pickup_time: d.pickup_time,
        pickup_location: d.pickup_location, dropoff_location: d.dropoff_location,
        vehicle_type: d.vehicle_type, pax_count: d.pax_count, status: 'pending'
      })
    }

    setCreatedBookingId(booking.id)
    setLoading(false)
    setShowDispatch(true)
  }

  async function handleDispatch() {
    if (!createdBookingId) return
    setSending(true)
    const sb = createClient()

    if (dispatchMode === 'pool') {
      await sb.functions.invoke('booking-created', { body: { bookingId: createdBookingId } })
    } else {
      for (const opId of selectedOps) {
        await sb.functions.invoke('booking-created', { body: { bookingId: createdBookingId, operatorId: opId } })
      }
    }
    setSending(false)
    setSent(true)
    setTimeout(() => router.push('/bookings'), 1500)
  }

  function toggleOp(id: string) {
    if (dispatchMode === 'single') {
      setSelectedOps([id])
    } else {
      setSelectedOps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  const inputStyle = { width:'100%', background:S3, border:`1px solid ${BORDER}`, borderRadius:10, color:TEXT, fontFamily:F, fontSize:14, padding:'10px 13px', outline:'none', boxSizing:'border-box' as const, transition:'border-color 0.15s' }
  const labelStyle = { display:'block' as const, fontSize:10, fontFamily:FM, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:TEXT3, marginBottom:7 }
  const cardStyle = { background:S2, border:`1px solid ${BORDER}`, borderRadius:16, padding:'24px 20px', marginBottom:16 }

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:F, WebkitFontSmoothing:'antialiased' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        input:focus,select:focus,textarea:focus { border-color: ${TEAL} !important; box-shadow: 0 0 0 3px rgba(25,201,119,0.12) !important; }
        input::placeholder,textarea::placeholder { color: ${TEXT3}; }
        select option { background: ${S3}; }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom:`1px solid ${BORDER}`, background:'rgba(7,16,13,0.9)', backdropFilter:'blur(20px)', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Link href="/bookings" style={{ color:TEXT2, textDecoration:'none', fontSize:13 }}>← Back</Link>
          <span style={{ color:BORDER_HI }}>|</span>
          <span style={{ fontWeight:700, fontSize:15, color:TEXT }}>New Booking</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {[1,2].map(s => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background: step >= s ? TEAL : S3, border:`2px solid ${step >= s ? TEAL : BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: step >= s ? '#fff' : TEXT3 }}>{s}</div>
              <span style={{ fontSize:12, color: step >= s ? TEXT : TEXT3, fontWeight: step === s ? 600 : 400 }}>{s === 1 ? 'Booking Details' : 'Trip Days'}</span>
              {s < 2 && <div style={{ width:24, height:1, background:BORDER_HI, margin:'0 4px' }} />}
            </div>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth:760, margin:'0 auto', padding:'32px 24px' }}>
        <form onSubmit={handleSubmit}>

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color:TEXT, marginBottom:24 }}>Booking Details</h1>
              <div style={cardStyle}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={labelStyle}>Client Name *</label>
                    <input style={inputStyle} value={form.client_name} onChange={e=>setF('client_name',e.target.value)} required placeholder="e.g. Wang Family" />
                  </div>
                  <div>
                    <label style={labelStyle}>Booking Type</label>
                    <select style={inputStyle} value={form.booking_type} onChange={e=>setF('booking_type',e.target.value)}>
                      {BOOKING_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Flight Number</label>
                    <input style={inputStyle} value={form.flight_number} onChange={e=>setF('flight_number',e.target.value)} placeholder="TG305 (optional)" />
                  </div>
                  <div>
                    <label style={labelStyle}>Adults</label>
                    <input style={inputStyle} type="number" min="1" value={form.adults_count} onChange={e=>setF('adults_count',Number(e.target.value))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Children</label>
                    <input style={inputStyle} type="number" min="0" value={form.children_count} onChange={e=>setF('children_count',Number(e.target.value))} />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={labelStyle}>Special Requirements</label>
                    <textarea style={{...inputStyle, resize:'none'}} rows={2} value={form.special_requirements} onChange={e=>setF('special_requirements',e.target.value)} placeholder="e.g. Wheelchair accessible vehicle, baby seat..." />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={labelStyle}>Internal Notes</label>
                    <textarea style={{...inputStyle, resize:'none'}} rows={2} value={form.notes} onChange={e=>setF('notes',e.target.value)} placeholder="Notes visible only to your team..." />
                  </div>
                </div>
              </div>
              <button type="button" onClick={()=>setStep(2)} disabled={!form.client_name} style={{ width:'100%', padding:'13px', background: form.client_name ? TEAL : S3, color: form.client_name ? '#fff' : TEXT3, border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor: form.client_name ? 'pointer' : 'not-allowed', fontFamily:F }}>
                Next: Add Trip Days →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color:TEXT }}>Trip Days</h1>
                <button type="button" onClick={addDay} style={{ padding:'7px 16px', background:'transparent', border:`1px solid ${TEAL}`, color:TEAL, borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:F }}>+ Add Day</button>
              </div>

              {form.days.map((day, i) => (
                <div key={i} style={{ ...cardStyle, position:'relative' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:28, height:28, background:TEAL, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>{i+1}</div>
                      <span style={{ fontWeight:700, color:TEXT }}>Day {i+1}</span>
                    </div>
                    {form.days.length > 1 && (
                      <button type="button" onClick={()=>removeDay(i)} style={{ padding:'4px 10px', background:'transparent', border:'1px solid rgba(248,113,113,0.3)', color:'#F87171', borderRadius:7, fontSize:12, cursor:'pointer', fontFamily:F }}>Remove</button>
                    )}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label style={labelStyle}>Date *</label>
                      <input style={inputStyle} type="date" value={day.trip_date} onChange={e=>setDay(i,'trip_date',e.target.value)} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Pickup Time</label>
                      <input style={inputStyle} type="time" value={day.pickup_time} onChange={e=>setDay(i,'pickup_time',e.target.value)} />
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <label style={labelStyle}>Pickup Location *</label>
                      <input style={inputStyle} value={day.pickup_location} onChange={e=>setDay(i,'pickup_location',e.target.value)} required placeholder="e.g. Suvarnabhumi Airport Terminal 1" />
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <label style={labelStyle}>Drop-off Location *</label>
                      <input style={inputStyle} value={day.dropoff_location} onChange={e=>setDay(i,'dropoff_location',e.target.value)} required placeholder="e.g. Centara Grand Hotel Bangkok" />
                    </div>
                    <div>
                      <label style={labelStyle}>Vehicle Type</label>
                      <select style={inputStyle} value={day.vehicle_type} onChange={e=>setDay(i,'vehicle_type',e.target.value)}>
                        {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Passengers</label>
                      <input style={inputStyle} type="number" min="1" value={day.pax_count} onChange={e=>setDay(i,'pax_count',Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button type="button" onClick={()=>setStep(1)} style={{ flex:'0 0 auto', padding:'13px 24px', background:'transparent', border:`1px solid ${BORDER_HI}`, color:TEXT2, borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:F }}>← Back</button>
                <button type="submit" disabled={loading} style={{ flex:1, padding:'13px', background:loading ? '#148f55' : TEAL, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:F, boxShadow:'0 4px 16px rgba(25,201,119,0.3)' }}>
                  {loading ? 'Saving...' : 'Save & Choose Operator →'}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* ── Operator Dispatch Modal ── */}
      {showDispatch && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={e => { if(e.target===e.currentTarget && !sent) setShowDispatch(false) }}>
          <div style={{ background:S2, border:`1px solid ${BORDER_HI}`, borderRadius:20, width:'100%', maxWidth:540, maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>

            {sent ? (
              <div style={{ padding:48, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                <h3 style={{ fontWeight:800, fontSize:20, color:TEXT, marginBottom:8 }}>Sent via LINE!</h3>
                <p style={{ color:TEXT2, fontSize:14 }}>Operator will receive a notification now.</p>
              </div>
            ) : (
              <>
                {/* Modal header */}
                <div style={{ padding:'20px 24px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <h3 style={{ fontWeight:800, fontSize:17, color:TEXT, marginBottom:2 }}>Send to Operator</h3>
                    <p style={{ fontSize:12, color:TEXT2 }}>Booking created ✔ Now choose who gets notified via LINE</p>
                  </div>
                  <button onClick={()=>setShowDispatch(false)} style={{ width:30, height:30, borderRadius:'50%', background:S3, border:`1px solid ${BORDER}`, color:TEXT2, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                </div>

                {/* Mode selector */}
                <div style={{ padding:'16px 24px 0' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                    {([['single','Single','One operator'],['multiple','Multiple','Select several'],['pool','All Pool','Broadcast all']] as const).map(([mode, label, sub]) => (
                      <button key={mode} onClick={()=>{ setDispatchMode(mode); setSelectedOps([]) }} type="button" style={{ padding:'10px 12px', background: dispatchMode===mode ? 'rgba(25,201,119,0.12)' : S3, border:`2px solid ${dispatchMode===mode ? TEAL : BORDER}`, borderRadius:12, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                        <div style={{ fontSize:12, fontWeight:700, color: dispatchMode===mode ? TEAL : TEXT }}>{label}</div>
                        <div style={{ fontSize:10, color:TEXT3, marginTop:2 }}>{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operator list */}
                {dispatchMode !== 'pool' && (
                  <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
                    <p style={{ fontSize:10, fontFamily:FM, letterSpacing:'0.1em', textTransform:'uppercase', color:TEXT3, marginBottom:12 }}>{operators.length} Active Operators</p>
                    {operators.length === 0 ? (
                      <div style={{ padding:'24px', textAlign:'center', color:TEXT2, fontSize:13 }}>No active operators yet. Add operators in Admin panel.</div>
                    ) : (
                      operators.map(op => {
                        const selected = selectedOps.includes(op.id)
                        return (
                          <div key={op.id} onClick={()=>toggleOp(op.id)} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', background: selected ? 'rgba(25,201,119,0.08)' : 'transparent', border:`1px solid ${selected ? TEAL : BORDER}`, borderRadius:12, marginBottom:8, cursor:'pointer', transition:'all 0.15s' }}>
                            <div style={{ width:36, height:36, borderRadius:10, background: selected ? TEAL : S3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color: selected ? '#fff' : TEXT2, flexShrink:0 }}>
                              {op.company_name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:600, fontSize:14, color:TEXT }}>{op.company_name}</div>
                              <div style={{ fontSize:12, color:TEXT2 }}>{op.base_location || 'No location'} {op.line_user_id ? '· 📱 LINE ready' : '· No LINE ID'}</div>
                            </div>
                            <div style={{ width:20, height:20, borderRadius:'50%', background: selected ? TEAL : 'transparent', border:`2px solid ${selected ? TEAL : BORDER_HI}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              {selected && <span style={{ color:'#fff', fontSize:11 }}>✓</span>}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {dispatchMode === 'pool' && (
                  <div style={{ padding:'24px', textAlign:'center' }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>📡</div>
                    <p style={{ color:TEXT, fontWeight:600, marginBottom:4 }}>Broadcast to All Operators</p>
                    <p style={{ color:TEXT2, fontSize:13 }}>All {operators.length} active operators will receive this job via LINE simultaneously. First to accept gets it.</p>
                  </div>
                )}

                {/* Send button */}
                <div style={{ padding:'16px 24px', borderTop:`1px solid ${BORDER}` }}>
                  <button onClick={handleDispatch} disabled={sending || (dispatchMode !== 'pool' && selectedOps.length === 0)} type="button" style={{ width:'100%', padding:'13px', background: (sending || (dispatchMode !== 'pool' && selectedOps.length === 0)) ? S3 : TEAL, color: (dispatchMode !== 'pool' && selectedOps.length === 0) ? TEXT3 : '#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor: (sending || (dispatchMode !== 'pool' && selectedOps.length === 0)) ? 'not-allowed' : 'pointer', fontFamily:F, transition:'all 0.15s' }}>
                    {sending ? 'Sending via LINE...' : dispatchMode === 'pool' ? 'Broadcast to All Operators' : `Send to ${selectedOps.length || 0} Operator${selectedOps.length !== 1 ? 's' : ''} via LINE`}
                  </button>
                  {dispatchMode !== 'pool' && selectedOps.length === 0 && <p style={{ textAlign:'center', fontSize:12, color:TEXT3, marginTop:8 }}>Select at least one operator above</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}