'use client'
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const T = {
  en:{ title:'Operators', addBtn:'+ Add Operator', search:'Search operators...', name:'Name', contact:'Contact', line:'LINE User ID', phone:'Phone', location:'Base Location', status:'Status', trips:'Trips', verified:'Verified', actions:'Actions', noData:'No operators found', cancel:'Cancel', save:'Save', addTitle:'Add Operator', editTitle:'Edit Operator', active:'Active', inactive:'Inactive', suspended:'Suspended', verify:'Verify', unverify:'Unverify' },
  th:{ title:'ผู้ประกอบการ', addBtn:'+ เพิ่มผู้ประกอบการ', search:'ค้นหา...', name:'ชื่อ', contact:'ผู้ติดต่อ', line:'LINE User ID', phone:'โทรศัพท์', location:'ที่ตั้งหลัก', status:'สถานะ', trips:'ทริป', verified:'ยืนยัน', actions:'จัดการ', noData:'ไม่พบผู้ประกอบการ', cancel:'ยกเลิก', save:'บันทึก', addTitle:'เพิ่มผู้ประกอบการ', editTitle:'แก้ไข', active:'ใช้งาน', inactive:'ไม่ใช้งาน', suspended:'ระงับ', verify:'ยืนยัน', unverify:'ยกเลิกการยืนยัน' },
}
const emptyForm = { company_name:'', contact_name:'', line_user_id:'', phone:'', email:'', base_location:'', status:'active', is_verified:false }

export default function AdminOperators() {
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({...emptyForm})

  useEffect(() => {
    const s = localStorage.getItem('riden_admin'); if(s) setLang(JSON.parse(s).lang||'en')
    loadData()
  }, [])

  async function loadData() {
    const { data } = await createClient().from('operators').select('*').order('created_at',{ascending:false})
    setItems(data??[]); setLoading(false)
  }

  async function handleSave() {
    const sb = createClient()
    const payload = { company_name:form.company_name, contact_name:form.contact_name, line_user_id:form.line_user_id||null, phone:form.phone||null, email:form.email||null, base_location:form.base_location||null, status:form.status, is_verified:form.is_verified }
    const { error } = editItem ? await sb.from('operators').update(payload).eq('id',editItem.id) : await sb.from('operators').insert(payload)
    if (error) { toast.error(error.message); return }
    toast.success(editItem?'Updated!':'Operator added!'); setShowForm(false); setEditItem(null); loadData()
  }

  async function toggleVerify(id:string, current:boolean) {
    await createClient().from('operators').update({is_verified:!current}).eq('id',id)
    toast.success('Updated!'); loadData()
  }
  async function updateStatus(id:string, status:string) {
    await createClient().from('operators').update({status}).eq('id',id)
    toast.success('Updated!'); loadData()
  }

  const t = T[lang]
  const filtered = items.filter(d => {
    const ms = !search || d.company_name?.toLowerCase().includes(search.toLowerCase()) || d.contact_name?.toLowerCase().includes(search.toLowerCase())
    const mst = statusFilter==='all' || d.status===statusFilter
    return ms && mst
  })
  const SC: Record<string,string> = { active:'badge-completed', inactive:'badge-pending', suspended:'badge-cancelled' }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-700 text-riden-white">{t.title}</h1><p className="text-riden-text text-sm">{filtered.length} operators</p></div>
        <button onClick={()=>{setEditItem(null);setForm({...emptyForm});setShowForm(true)}} className="btn-primary px-4 py-2 text-sm">{t.addBtn}</button>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-riden-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="riden-input pl-9 text-sm" placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="riden-input text-sm w-auto" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{colorScheme:'dark'}}>
          <option value="all">All</option><option value="active">{t.active}</option><option value="inactive">{t.inactive}</option><option value="suspended">{t.suspended}</option>
        </select>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-riden-text text-sm">Loading...</div> :
         filtered.length===0 ? <div className="p-8 text-center text-riden-text text-sm">{t.noData}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-riden-border">
                <tr className="text-riden-muted text-xs font-mono uppercase">
                  {[t.name,t.contact,t.line,t.phone,t.location,t.status,t.trips,'Rating',t.verified,t.actions].map(h=>(
                    <th key={h} className="text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-riden-border">
                {filtered.map((d:any)=>(
                  <tr key={d.id} className="hover:bg-riden-card/30">
                    <td className="px-4 py-3 text-riden-white font-medium">{d.company_name}</td>
                    <td className="px-4 py-3 text-riden-text">{d.contact_name||'-'}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs text-riden-teal">{d.line_user_id ? d.line_user_id.slice(0,12)+'...' : '-'}</span></td>
                    <td className="px-4 py-3 text-riden-text">{d.phone||'-'}</td>
                    <td className="px-4 py-3 text-riden-text">{d.base_location||'-'}</td>
                    <td className="px-4 py-3">
                      <select className={`text-xs px-2 py-1 rounded cursor-pointer border-0 ${SC[d.status]||''}`} value={d.status} onChange={e=>updateStatus(d.id,e.target.value)} style={{colorScheme:'dark',background:'transparent'}}>
                        <option value="active" style={{background:'#0D1F14'}}>active</option>
                        <option value="inactive" style={{background:'#0D1F14'}}>inactive</option>
                        <option value="suspended" style={{background:'#0D1F14'}}>suspended</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-riden-text">{d.total_trips||0}</td>
                    <td className="px-4 py-3 text-riden-text">{d.rating||'0.0'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${d.is_verified?'badge-completed':'badge-pending'}`}>{d.is_verified?'✓':'-'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={()=>{setEditItem(d);setForm({company_name:d.company_name,contact_name:d.contact_name||'',line_user_id:d.line_user_id||'',phone:d.phone||'',email:d.email||'',base_location:d.base_location||'',status:d.status,is_verified:d.is_verified});setShowForm(true)}} className="text-xs text-riden-teal hover:underline">Edit</button>
                        <button onClick={()=>toggleVerify(d.id,d.is_verified)} className="text-xs text-yellow-400 hover:underline">{d.is_verified?t.unverify:t.verify}</button>
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
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-700 text-riden-white text-lg mb-5">{editItem?t.editTitle:t.addTitle}</h2>
            <div className="grid grid-cols-2 gap-4">
              {[{k:'company_name',l:'Company Name *'},{k:'contact_name',l:'Contact Name'},{k:'line_user_id',l:'LINE User ID'},{k:'phone',l:'Phone'},{k:'email',l:'Email'},{k:'base_location',l:'Base Location'}].map(({k,l})=>(
                <div key={k} className={k==='company_name'||k==='base_location'?'col-span-2':''}>
                  <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">{l}</label>
                  <input className="riden-input" value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
                </div>
              ))}
              <div>
                <label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Status</label>
                <select className="riden-input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{colorScheme:'dark'}}>
                  <option value="active">active</option><option value="inactive">inactive</option><option value="suspended">suspended</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="verified" checked={form.is_verified} onChange={e=>setForm({...form,is_verified:e.target.checked})} className="w-4 h-4 accent-riden-teal" />
                <label htmlFor="verified" className="text-riden-text text-sm">{t.verified}</label>
              </div>
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
