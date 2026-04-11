'use client'
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const PLANS = ['trial','starter','growth','pro']
const STATUSES = ['active','expired','suspended']
const T = {
  en: { title:'DMC Companies', search:'Search by company or email...', addBtn:'+ Add DMC', plan:'Plan', status:'Status', all:'All', bookings:'Bookings', joined:'Joined', actions:'Actions', activate:'Activate', suspend:'Suspend', noData:'No DMC companies found', company:'Company Name', email:'Email', country:'Country', cancel:'Cancel', save:'Save', addTitle:'Add New DMC', editTitle:'Edit DMC' },
  th: { title:'บริษัท DMC', search:'ค้นหาบริษัทหรืออีเมล...', addBtn:'+ เพิ่ม DMC', plan:'แผน', status:'สถานะ', all:'ทั้งหมด', bookings:'การจอง', joined:'เข้าร่วม', actions:'จัดการ', activate:'เปิดใช้งาน', suspend:'ระงับ', noData:'ไม่พบบริษัท DMC', company:'ชื่อบริษัท', email:'อีเมล', country:'ประเทศ', cancel:'ยกเลิก', save:'บันทึก', addTitle:'เพิ่ม DMC ใหม่', editTitle:'แก้ไข DMC' },
}

export default function AdminDMC() {
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [dmcs, setDmcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ company_name:'', email:'', country:'Thailand', language_preference:'en', subscription_plan:'trial', subscription_status:'active' })

  useEffect(() => {
    const s = localStorage.getItem('riden_admin'); if(s) setLang(JSON.parse(s).lang||'en')
    loadData()
  }, [])

  async function loadData() {
    const { data } = await createClient().from('dmc_users').select('*').order('created_at',{ascending:false})
    setDmcs(data??[]); setLoading(false)
  }

  async function handleSave() {
    const sb = createClient()
    if (editItem) {
      const { error } = await sb.from('dmc_users').update({ company_name:form.company_name, country:form.country, language_preference:form.language_preference, subscription_plan:form.subscription_plan, subscription_status:form.subscription_status }).eq('id', editItem.id)
      if (error) { toast.error(error.message); return }
      toast.success('Updated!')
    } else {
      const { error } = await sb.from('dmc_users').insert({ company_name:form.company_name, email:form.email, country:form.country, language_preference:form.language_preference, subscription_plan:form.subscription_plan, subscription_status:form.subscription_status })
      if (error) { toast.error(error.message); return }
      toast.success('DMC added! They need to register with this email.')
    }
    setShowForm(false); setEditItem(null); loadData()
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await createClient().from('dmc_users').update({ subscription_status: status }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Updated!'); loadData()
  }

  async function updatePlan(id: string, plan: string) {
    const { error } = await createClient().from('dmc_users').update({ subscription_plan: plan }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Plan updated!'); loadData()
  }

  const t = T[lang]
  const filtered = dmcs.filter(d => {
    const matchSearch = !search || d.company_name?.toLowerCase().includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter==='all' || d.subscription_plan===planFilter
    const matchStatus = statusFilter==='all' || d.subscription_status===statusFilter
    return matchSearch && matchPlan && matchStatus
  })
  const PLAN_COLORS: Record<string,string> = { trial:'text-yellow-400 bg-yellow-400/10', starter:'text-blue-400 bg-blue-400/10', growth:'text-purple-400 bg-purple-400/10', pro:'text-riden-teal bg-riden-teal/10' }
  const STATUS_COLORS: Record<string,string> = { active:'badge-completed', expired:'badge-pending', suspended:'badge-cancelled' }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-700 text-riden-white">{t.title}</h1><p className="text-riden-text text-sm">{filtered.length} companies</p></div>
        <button onClick={() => { setEditItem(null); setForm({ company_name:'', email:'', country:'Thailand', language_preference:'en', subscription_plan:'trial', subscription_status:'active' }); setShowForm(true) }} className="btn-primary px-4 py-2 text-sm">{t.addBtn}</button>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-riden-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="riden-input pl-9 text-sm" placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="riden-input text-sm w-auto" value={planFilter} onChange={e=>setPlanFilter(e.target.value)} style={{colorScheme:'dark'}}>
          <option value="all">{t.all} Plans</option>
          {PLANS.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <select className="riden-input text-sm w-auto" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{colorScheme:'dark'}}>
          <option value="all">{t.all} Status</option>
          {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-riden-text text-sm">Loading...</div> :
         filtered.length===0 ? <div className="p-8 text-center text-riden-text text-sm">{t.noData}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-riden-border">
                <tr className="text-riden-muted text-xs font-mono uppercase">
                  <th className="text-left px-4 py-3">{t.company}</th>
                  <th className="text-left px-4 py-3">{t.email}</th>
                  <th className="text-left px-4 py-3">{t.country}</th>
                  <th className="text-left px-4 py-3">{t.plan}</th>
                  <th className="text-left px-4 py-3">{t.status}</th>
                  <th className="text-left px-4 py-3">{t.bookings}</th>
                  <th className="text-left px-4 py-3">{t.joined}</th>
                  <th className="text-left px-4 py-3">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-riden-border">
                {filtered.map((d:any) => (
                  <tr key={d.id} className="hover:bg-riden-card/30">
                    <td className="px-4 py-3 text-riden-white font-medium">{d.company_name}</td>
                    <td className="px-4 py-3 text-riden-text">{d.email}</td>
                    <td className="px-4 py-3 text-riden-text">{d.country||'-'}</td>
                    <td className="px-4 py-3">
                      <select className={`text-xs px-2 py-1 rounded font-medium border-0 cursor-pointer ${PLAN_COLORS[d.subscription_plan]||''}`} value={d.subscription_plan} onChange={e=>updatePlan(d.id,e.target.value)} style={{colorScheme:'dark',background:'transparent'}}>
                        {PLANS.map(p=><option key={p} value={p} style={{background:'#0D1F14'}}>{p}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[d.subscription_status]||'badge-pending'}`}>{d.subscription_status}</span></td>
                    <td className="px-4 py-3 text-riden-text">{d.total_bookings||0}</td>
                    <td className="px-4 py-3 text-riden-muted text-xs">{new Date(d.created_at).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditItem(d); setForm({ company_name:d.company_name, email:d.email, country:d.country||'', language_preference:d.language_preference||'en', subscription_plan:d.subscription_plan, subscription_status:d.subscription_status }); setShowForm(true) }} className="text-xs text-riden-teal hover:underline">Edit</button>
                        {d.subscription_status==='active' ? <button onClick={()=>updateStatus(d.id,'suspended')} className="text-xs text-red-400 hover:underline">{t.suspend}</button> : <button onClick={()=>updateStatus(d.id,'active')} className="text-xs text-green-400 hover:underline">{t.activate}</button>}
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
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-display font-700 text-riden-white text-lg mb-5">{editItem ? t.editTitle : t.addTitle}</h2>
            <div className="space-y-4">
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">{t.company} *</label><input className="riden-input" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} /></div>
              {!editItem && <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">{t.email} *</label><input type="email" className="riden-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>}
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">{t.country}</label><input className="riden-input" value={form.country} onChange={e=>setForm({...form,country:e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">{t.plan}</label>
                  <select className="riden-input" value={form.subscription_plan} onChange={e=>setForm({...form,subscription_plan:e.target.value})} style={{colorScheme:'dark'}}>
                    {PLANS.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">{t.status}</label>
                  <select className="riden-input" value={form.subscription_status} onChange={e=>setForm({...form,subscription_status:e.target.value})} style={{colorScheme:'dark'}}>
                    {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
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
