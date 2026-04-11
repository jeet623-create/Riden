'use client'
import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const PLANS = ['trial','starter','growth','pro']
const PRICES: Record<string,number> = { trial:0, starter:2000, growth:4000, pro:6000 }

export default function AdminSubscriptions() {
  const [lang, setLang] = useState<'en'|'th'>('en')
  const [items, setItems] = useState<any[]>([])
  const [dmcs, setDmcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ dmc_id:'', plan:'starter', price_thb:2000, start_date:'', end_date:'', notes:'' })
  const t = lang==='en' ? { title:'Subscriptions & Billing', addBtn:'+ New Subscription', mrr:'MRR', activeCount:'Active Paid', trialCount:'On Trial', noData:'No subscriptions yet' } : { title:'การสมัครสมาชิก', addBtn:'+ เพิ่มการสมัคร', mrr:'รายได้ต่อเดือน', activeCount:'จ่ายเงินแล้ว', trialCount:'ทดลองใช้', noData:'ยังไม่มีการสมัคร' }

  useEffect(() => {
    const s = localStorage.getItem('riden_admin'); if(s) setLang(JSON.parse(s).lang||'en')
    loadData()
  }, [])

  async function loadData() {
    const sb = createClient()
    const [sRes, dRes] = await Promise.all([
      sb.from('subscriptions').select('*, dmc_users(company_name,email)').order('created_at',{ascending:false}),
      sb.from('dmc_users').select('id,company_name,subscription_plan,subscription_status')
    ])
    setItems(sRes.data??[]); setDmcs(dRes.data??[]); setLoading(false)
  }

  async function handleSave() {
    const sb = createClient()
    const { error } = await sb.from('subscriptions').insert({ dmc_id:form.dmc_id, plan:form.plan, price_thb:form.price_thb, start_date:form.start_date, end_date:form.end_date||null, notes:form.notes||null })
    if (error) { toast.error(error.message); return }
    await sb.from('dmc_users').update({ subscription_plan:form.plan, subscription_status:'active' }).eq('id',form.dmc_id)
    toast.success('Subscription activated!'); setShowForm(false); loadData()
  }

  const mrr = dmcs.filter(d=>d.subscription_status==='active'&&d.subscription_plan!=='trial').reduce((sum,d)=>sum+(PRICES[d.subscription_plan]||0),0)
  const activeCount = dmcs.filter(d=>d.subscription_plan!=='trial'&&d.subscription_status==='active').length
  const trialCount = dmcs.filter(d=>d.subscription_plan==='trial').length

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-700 text-riden-white">{t.title}</h1></div>
        <button onClick={()=>setShowForm(true)} className="btn-primary px-4 py-2 text-sm">{t.addBtn}</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-5"><div className="font-display text-3xl font-700 text-riden-teal">฿{mrr.toLocaleString()}</div><div className="text-riden-text text-xs font-mono uppercase tracking-wider mt-1">{t.mrr}</div></div>
        <div className="glass rounded-xl p-5"><div className="font-display text-3xl font-700 text-blue-400">{activeCount}</div><div className="text-riden-text text-xs font-mono uppercase tracking-wider mt-1">{t.activeCount}</div></div>
        <div className="glass rounded-xl p-5"><div className="font-display text-3xl font-700 text-yellow-400">{trialCount}</div><div className="text-riden-text text-xs font-mono uppercase tracking-wider mt-1">{t.trialCount}</div></div>
      </div>
      <div className="glass rounded-xl p-5 mb-6">
        <div className="flex gap-8">
          {PLANS.map(p => (
            <div key={p} className="text-center">
              <div className="font-display text-xl font-700 text-riden-white">{dmcs.filter(d=>d.subscription_plan===p).length}</div>
              <div className="text-riden-muted text-xs font-mono">{p}</div>
              <div className="text-riden-teal text-xs">฿{PRICES[p].toLocaleString()}/mo</div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-riden-text text-sm">Loading...</div> :
         items.length===0 ? <div className="p-8 text-center text-riden-text text-sm">{t.noData}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-riden-border">
                <tr className="text-riden-muted text-xs font-mono uppercase">
                  {['DMC','Plan','Price (฿)','Start','End','Notes'].map(h=><th key={h} className="text-left px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-riden-border">
                {items.map((d:any)=>(
                  <tr key={d.id} className="hover:bg-riden-card/30">
                    <td className="px-4 py-3 text-riden-white">{(d.dmc_users as any)?.company_name}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-riden-teal/10 text-riden-teal">{d.plan}</span></td>
                    <td className="px-4 py-3 text-riden-text">฿{d.price_thb?.toLocaleString()||0}</td>
                    <td className="px-4 py-3 text-riden-text text-xs">{d.start_date}</td>
                    <td className="px-4 py-3 text-riden-text text-xs">{d.end_date||'—'}</td>
                    <td className="px-4 py-3 text-riden-muted text-xs">{d.notes||'—'}</td>
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
            <h2 className="font-display font-700 text-riden-white text-lg mb-5">Activate Subscription</h2>
            <div className="space-y-4">
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">DMC *</label>
                <select className="riden-input" value={form.dmc_id} onChange={e=>setForm({...form,dmc_id:e.target.value})} style={{colorScheme:'dark'}}>
                  <option value="">Select DMC</option>
                  {dmcs.map(d=><option key={d.id} value={d.id}>{d.company_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Plan</label>
                  <select className="riden-input" value={form.plan} onChange={e=>setForm({...form,plan:e.target.value,price_thb:PRICES[e.target.value]||0})} style={{colorScheme:'dark'}}>
                    {PLANS.filter(p=>p!=='trial').map(p=><option key={p} value={p}>{p} — ฿{PRICES[p].toLocaleString()}</option>)}
                  </select>
                </div>
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Price (฿)</label><input type="number" className="riden-input" value={form.price_thb} onChange={e=>setForm({...form,price_thb:Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Start Date *</label><input type="date" className="riden-input" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={{colorScheme:'dark'}} /></div>
                <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">End Date</label><input type="date" className="riden-input" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={{colorScheme:'dark'}} /></div>
              </div>
              <div><label className="block text-riden-text text-xs font-mono uppercase tracking-widest mb-1.5">Notes</label><textarea className="riden-input resize-none" rows={2} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="btn-ghost flex-1 py-3">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 py-3">Activate</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
