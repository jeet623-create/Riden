'use client'
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const VEHICLE_TYPES = ['sedan','van_9','van_12','minibus_15','minibus_20','coach_30','coach_40plus','suv','pickup']
const emptyForm = { operator_id:'', type:'van_9', brand_model:'', plate:'', seats:9, color:'', status:'active' }

export default function AdminVehicles() {
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [items, setItems] = useState<any[]>([])
  const [operators, setOperators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({...emptyForm})
  const t = lang==='en' ? { title:'Vehicles', addBtn:'+ Add Vehicle', noData:'No vehicles found' } : { title:'ยานพาหนะ', addBtn:'+ เพิ่มยานพาหนะ', noData:'ไม่พบยานพาหนะ' }

  useEffect(() => {
    const s = localStorage.getItem('riden_admin'); if(s) setLang(JSON.parse(s).lang||'en')
    loadData()
  }, [])

  async function loadData() {
    const sb = createClient()
    const [vRes, opRes] = await Promise.all([
      sb.from('vehicles').select('*, operators(company_name)').order('created_at',{ascending:false}),
      sb.from('operators').select('id,company_name').eq('status','active')
    ])
    setItems(vRes.data??[]); setOperators(opRes.data??[]); setLoading(false)
  }

  async function handleSave() {
    const payload = { operator_id:form.operator_id||null, type:form.type, brand_model:form.brand_model||null, plate:form.plate, seats:Number(form.seats), color:form.color||null, status:form.status }
    const { error } = editItem ? await createClient().from('vehicles').update(payload).eq('id',editItem.id) : await createClient().from('vehicles').insert(payload)
    if (error) { toast.error(error.message); return }
    toast.success('Saved!'); setShowForm(false); setEditItem(null); loadData()
  }

  const filtered = items.filter(d => !search || d.plate?.toLowerCase().includes(search.toLowerCase()) || d.brand_model?.toLowerCase().includes(search.toLowerCase()))
  const SC: Record<string,string> = { active:'badge-completed', inactive:'badge-pending', maintenance:'badge-progress' }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-700 text-riden-white">{t.title}</h1><p className="text-riden-text text-sm">{filtered.length} vehicles</p></div>
        <button onClick={()=>{setEditItem(null);setForm({...emptyForm});setShowForm(true)}} className="btn-primary px-4 py-2 text-sm">{t.addBtn}</button>
      </div>
      <div className="relative mb-6 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-riden-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input className="riden-input pl-9 text-sm" placeholder="Search by plate or model..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-riden-text text-sm">Loading...</div> :
         filtered.length===0 ? <div className="p-8 text-center text-riden-text text-sm">{t.noData}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-riden-border">
                <tr className="text-riden-muted text-xs font-mono uppercase">
                  {['Operator','Type','Brand/Model','Plate','Seats','Color','Status','Actions'].map(h=><th key={h} className="text-left px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-riden-border">
                {filtered.map((d:any)=>(
                  <tr key={d.id} className="hover:bg-riden-card/30">
                    <td className="px-4 py-3 text-riden-text text-xs">{(d.operators as any)?.company_name||'-'}</td>
                    <td className="px-4 py-3 text-riden-text">{d.type}</td>
                    <td className="px-4 py-3 text-riden-white">{d.brand_model||'-'}</td>
                    <td className="px-4 py-3 font-mono text-riden-teal text-xs">{d.plate}</td>
                    <td className="px-4 py-3 text-riden-text">{d.seats}</td>
                    <td className="px-4 py-3 text-riden-text">{d.color||'-'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${SC[d.status]||'badge-pending'}`}>{d.status}</span></td>
                    <td className="px-4 py-3"><button onClick={()=>{setEditItem(d);setForm({operator_id:d.operator_id||'',type:d.type,brand_model:d.brand_model||'',plate:d.plate,seats:d.seats||9,color:d.color||'',status:d.status});setShowForm(true)}} className="text-xs text-riden-teal hover:underline">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-display font-700 text-riden-white text-lg mb-5">{editItem?'Edit Vehicle':'Add Vehicle'}</h2>
            <div className="space-y-4">
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Operator</label>
                <select className="riden-input" value={form.operator_id} onChange={e=>setForm({...form,operator_id:e.target.value})} style={{colorScheme:'dark'}}>
                  <option value="">None</option>{operators.map(o=><option key={o.id} value={o.id}>{o.company_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Type *</label>
                  <select className="riden-input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{colorScheme:'dark'}}>
                    {VEHICLE_TYPES.map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Seats</label><input type="number" className="riden-input" value={form.seats} onChange={e=>setForm({...form,seats:Number(e.target.value)})} /></div>
              </div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Brand / Model</label><input className="riden-input" value={form.brand_model} onChange={e=>setForm({...form,brand_model:e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Plate *</label><input className="riden-input" value={form.plate} onChange={e=>setForm({...form,plate:e.target.value})} /></div>
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Color</label><input className="riden-input" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} /></div>
              </div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Status</label>
                <select className="riden-input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{colorScheme:'dark'}}>
                  <option value="active">active</option><option value="inactive">inactive</option><option value="maintenance">maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>{setShowForm(false);setEditItem(null)}} className="btn-ghost flex-1 py-3">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 py-3">Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
