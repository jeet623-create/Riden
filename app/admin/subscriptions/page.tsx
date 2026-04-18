
"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dmc/status-badge"
import { supabase } from "@/lib/supabase"

type Sub = {
  id: string
  dmc_id: string
  plan: string
  price_thb: number
  start_date: string
  end_date: string
  status: string
  created_at: string
  dmc_users: { company_name: string; email: string } | null
}

type DmcUser = { id: string; company_name: string; email: string }

const PLANS = [
  { key: "starter", label: "Starter", price: 2000 },
  { key: "growth", label: "Growth", price: 4000 },
  { key: "pro", label: "Pro", price: 6000 },
]

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)
  const [showActivate, setShowActivate] = useState(false)
  const [dmcs, setDmcs] = useState<DmcUser[]>([])
  const [form, setForm] = useState({
    dmc_id: "", plan: "starter", months: 1,
    start_date: new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSubs()
    fetchDmcs()
  }, [])

  async function fetchSubs() {
    const { data } = await supabase
      .from("subscriptions")
      .select("*, dmc_users(company_name, email)")
      .order("created_at", { ascending: false })
    setSubs(data || [])
    setLoading(false)
  }

  async function fetchDmcs() {
    const { data } = await supabase.from("dmc_users").select("id, company_name, email").eq("is_active", true).order("company_name")
    setDmcs(data || [])
  }

  async function activatePlan() {
    if (!form.dmc_id) { toast.error("Select a DMC"); return }
    setSaving(true)
    const plan = PLANS.find(p => p.key === form.plan)!
    const start = new Date(form.start_date)
    const end = new Date(start)
    end.setMonth(end.getMonth() + form.months)

    const { error } = await supabase.from("subscriptions").insert({
      dmc_id: form.dmc_id,
      plan: form.plan,
      price_thb: plan.price * form.months,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      status: "active",
    })

    if (!error) {
      // Update dmc_users subscription info
      await supabase.from("dmc_users").update({
        subscription_plan: form.plan,
        subscription_status: "active",
      }).eq("id", form.dmc_id)

      toast.success("Plan activated successfully")
      setShowActivate(false)
      fetchSubs()
    } else {
      toast.error("Failed to activate: " + error.message)
    }
    setSaving(false)
  }

  const mrr = subs.filter(s => s.status === "active").reduce((sum, s) => sum + (Number(s.price_thb) || 0), 0)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted mt-0.5">Manual bank transfer activation · MRR: ฿{mrr.toLocaleString()}</p>
        </div>
        <Button onClick={() => setShowActivate(true)} className="bg-primary text-white">+ Activate Plan</Button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Company", "Email", "Plan", "Amount", "Start", "End", "Status"].map(h => (
                <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="py-3 px-4"><div className="h-4 bg-surface-elevated rounded animate-pulse" /></td>
                ))}
              </tr>
            )) : subs.map((s, i) => (
              <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                className="border-b border-border hover:bg-surface-elevated transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-foreground">{s.dmc_users?.company_name || "—"}</td>
                <td className="py-3 px-4 text-sm text-muted">{s.dmc_users?.email || "—"}</td>
                <td className="py-3 px-4 font-mono text-xs text-muted uppercase">{s.plan}</td>
                <td className="py-3 px-4 font-mono text-sm text-primary">฿{Number(s.price_thb).toLocaleString()}</td>
                <td className="py-3 px-4 font-mono text-xs text-muted">{s.start_date}</td>
                <td className="py-3 px-4 font-mono text-xs text-muted">{s.end_date}</td>
                <td className="py-3 px-4"><StatusBadge status={s.status as any} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showActivate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowActivate(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[17px] font-semibold text-foreground">Activate Subscription</h2>
                  <button onClick={() => setShowActivate(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated">
                    <X className="w-4 h-4 text-muted" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Select DMC</label>
                    <select value={form.dmc_id} onChange={e => setForm(f => ({ ...f, dmc_id: e.target.value }))}
                      className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                      <option value="">— Select DMC —</option>
                      {dmcs.map(d => <option key={d.id} value={d.id}>{d.company_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Plan</label>
                    <div className="mt-1 grid grid-cols-3 gap-2">
                      {PLANS.map(p => (
                        <button key={p.key} onClick={() => setForm(f => ({ ...f, plan: p.key }))}
                          className={`py-2 rounded-lg border text-sm font-medium transition-colors ${form.plan === p.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-foreground"}`}>
                          {p.label}<br />
                          <span className="text-[10px]">฿{p.price.toLocaleString()}/mo</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Start Date</label>
                      <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                        className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Months</label>
                      <select value={form.months} onChange={e => setForm(f => ({ ...f, months: Number(e.target.value) }))}
                        className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                        {[1, 3, 6, 12].map(m => <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm text-foreground">Total: <span className="font-bold text-primary">฿{(PLANS.find(p => p.key === form.plan)!.price * form.months).toLocaleString()}</span></p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="secondary" className="flex-1" onClick={() => setShowActivate(false)}>Cancel</Button>
                  <Button className="flex-1 bg-primary" onClick={activatePlan} disabled={saving}>
                    {saving ? "Activating..." : "Activate Plan"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
