'use client'
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const VEHICLE_TYPES = ['sedan','van_9','van_12','minibus_15','minibus_20','coach_30','coach_40plus','suv','pickup']
const emptyForm = { full_name:'', line_user_id:'', phone:'', operator_id:'', vehicle_type:'van_9', vehicle_plate:'', vehicle_brand_model:'', vehicle_seats:9, vehicle_color:'', base_location:'', is_verified:false, is_active:true, is_available:true }

export default function AdminDrivers() {
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [items, setItems] = useState<any[]>([])
  const [operators, setOperators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [opFilter, setOpFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({...emptyForm})
  const t = lang==='en' ? { title:'Drivers', addBtn:'+ Add Driver', search:'Search drivers...', noData:'No drivers found', cancel:'Cancel', save:'Save', addTitle:'Add Driver', editTitle:'Edit Driver', activate:'Activate', suspend:'Suspend' } : { title:'คนขับ', addBtn:'+ เพิ่มคนขับ', search:'ค้นหาคนขับ...', noData:'ไม่พบคนขับ', cancel:'ยกเลิก', save:'บันทึก', addTitle:'เพิ่มคนขับ', editTitle:'แก้ไขคนขับ', activate:'เปิดใช้งาน', suspend:'ระงับ' }

  useEffect(() => {
    const s = localStorage.getItem('riden_admin'); if(s) setLang(JSON.parse(s).lang||'en')
    loadData()
  }, [])

  async function loadData() {
    const sb = createClient()
    const [dRes, opRes] = await Promise.all([
      sb.from('drivers').select('*, operators(company_name)').order('created_at',{ascending:false}),
      sb.from('operators').select('id,company_name').eq('status','active')
    ])
    setItems(dRes.data??[]); setOperators(opRes.data??[]); setLoading(false)
  }

  async function handleSave() {
    const sb = createClient()
    const payload = { full_name:form.full_name, line_user_id:form.line_user_id||null, phone:form.phone||null, operator_id:form.operator_id||null, vehicle_type:form.vehicle_type, vehicle_plate:form.vehicle_plate||null, vehicle_brand_model:form.vehicle_brand_model||null, vehicle_seats:Number(form.vehicle_seats)||9, vehicle_color:form.vehicle_color||null, base_location:form.base_location||null, is_verified:form.is_verified, is_active:form.is_active, is_available:form.is_available }
    const { error } = editItem ? await sb.from('drivers').update(payload).eq('id',editItem.id) : await sb.from('drivers').insert(payload)
    if (error) { toast.error(error.message); return }
    toast.success(editItem?'Updated!':'Driver added!'); setShowForm(false); setEditItem(null); loadData()
  }

  async function toggleActive(id:string, current:boolean) {
    await createClient().from('drivers').update({is_active:!current}).eq('id',id)
    toast.success('Updated!'); loadData()
  }

  const filtered = items.filter(d => {
    const ms = !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.vehicle_plate?.toLowerCase().includes(search.toLowerCase())
    const mop = opFilter==='all' || d.operator_id===opFilter
    return ms && mop
  })

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-700 text-riden-white">{t.title}</h1><p className="text-riden-text text-sm">{filtered.length} drivers</p></div>
        <button onClick={()=>{setEditItem(null);setForm({...emptyForm});setShowForm(true)}} className="btn-primary px-4 py-2 text-sm">{t.addBtn}</button>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-riden-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="riden-input pl-9 text-sm" placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="riden-input text-sm w-auto" value={opFilter} onChange={e=>setOpFilter(e.target.value)} style={{colorScheme:'dark'}}>
          <option value="all">All Operators</option>
          {operators.map(o=><option key={o.id} value={o.id}>{o.company_name}</option>)}
        </select>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-riden-text text-sm">Loading...</div> :
         filtered.length===0 ? <div className="p-8 text-center text-riden-text text-sm">{t.noData}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-riden-border">
                <tr className="text-riden-muted text-xs font-mono uppercase">
                  {['Name','Operator','LINE ID','Phone','Vehicle','Plate','Trips','Verified','Available','Status','Actions'].map(h=><th key={h} className="text-left px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-riden-border">
                {filtered.map((d:any)=>(
                  <tr key={d.id} className="hover:bg-riden-card/30">
                    <td className="px-4 py-3 text-riden-white font-medium">{d.full_name}</td>
                    <td className="px-4 py-3 text-riden-text text-xs">{(d.operators as any)?.company_name||'-'}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-riden-teal">{d.line_user_id?d.line_user_id.slice(0,10)+'...':'-'}</span></td>
                    <td className="px-4 py-3 text-riden-text">{d.phone||'-'}</td>
                    <td className="px-4 py-3 text-riden-text text-xs">{d.vehicle_type}</td>
                    <td className="px-4 py-3 text-riden-text font-mono text-xs">{d.vehicle_plate||'-'}</td>
                    <td className="px-4 py-3 text-riden-text">{d.total_trips||0}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-1.5 py-0.5 rounded ${d.is_verified?'badge-completed':'badge-pending'}`}>{d.is_verified?'✓':'-'}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-1.5 py-0.5 rounded ${d.is_available?'badge-completed':'badge-pending'}`}>{d.is_available?'✓':'-'}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-1.5 py-0.5 rounded ${d.is_active?'badge-completed':'badge-cancelled'}`}>{d.is_active?'Active':'Inactive'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={()=>{setEditItem(d);setForm({full_name:d.full_name,line_user_id:d.line_user_id||'',phone:d.phone||'',operator_id:d.operator_id||'',vehicle_type:d.vehicle_type||'van_9',vehicle_plate:d.vehicle_plate||'',vehicle_brand_model:d.vehicle_brand_model||'',vehicle_seats:d.vehicle_seats||9,vehicle_color:d.vehicle_color||'',base_location:d.base_location||'',is_verified:d.is_verified,is_active:d.is_active,is_available:d.is_available});setShowForm(true)}} className="text-xs text-riden-teal hover:underline">Edit</button>
                        <button onClick={()=>toggleActive(d.id,d.is_active)} className={`text-xs hover:underline ${d.is_active?'text-red-400':'text-green-400'}`}>{d.is_active?t.suspend:t.activate}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-700 text-riden-white text-lg mb-5">{editItem?t.editTitle:t.addTitle}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Full Name *</label><input className="riden-input" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} /></div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Phone</label><input className="riden-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">LINE User ID</label><input className="riden-input" value={form.line_user_id} onChange={e=>setForm({...form,line_user_id:e.target.value})} /></div>
              <div className="col-span-2"><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Operator</label>
                <select className="riden-input" value={form.operator_id} onChange={e=>setForm({...form,operator_id:e.target.value})} style={{colorScheme:'dark'}}>
                  <option value="">No operator (freelance)</option>
                  {operators.map(o=><option key={o.id} value={o.id}>{o.company_name}</option>)}
                </select>
              </div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Vehicle Type</label>
                <select className="riden-input" value={form.vehicle_type} onChange={e=>setForm({...form,vehicle_type:e.target.value})} style={{colorScheme:'dark'}}>
                  {VEHICLE_TYPES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Seats</label><input type="number" className="riden-input" value={form.vehicle_seats} onChange={e=>setForm({...form,vehicle_seats:Number(e.target.value)})} /></div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Plate Number</label><input className="riden-input" value={form.vehicle_plate} onChange={e=>setForm({...form,vehicle_plate:e.target.value})} /></div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Brand / Model</label><input className="riden-input" value={form.vehicle_brand_model} onChange={e=>setForm({...form,vehicle_brand_model:e.target.value})} /></div>
              <div className="col-span-2"><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Base Location</label><input className="riden-input" value={form.base_location} onChange={e=>setForm({...form,base_location:e.target.value})} /></div>
              <div className="flex items-center gap-3"><input type="checkbox" id="dv" checked={form.is_verified} onChange={e=>setForm({...form,is_verified:e.target.checked})} className="w-4 h-4 accent-riden-teal"/><label htmlFor="dv" className="text-riden-text text-sm">Verified</label></div>
              <div className="flex items-center gap-3"><input type="checkbox" id="da" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})} className="w-4 h-4 accent-riden-teal"/><label htmlFor="da" className="text-riden-text text-sm">Active</label></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>{setShowForm(false);setEditItem(null)}} className="btn-ghost flex-1 py-3">{t.cancel}</button>
              <button onClick={handleSave} className="btn-primary flex-1 py-3">{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
