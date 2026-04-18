
"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

type Operator = { id: string; company_name: string; base_location: string }

const BOOKING_TYPES = ["airport_transfer", "sightseeing", "hotel_transfer", "day_tour", "custom"]
const VEHICLE_TYPES = ["Sedan", "Van 9", "Van 12", "Minibus 15", "Minibus 20", "Coach 30", "Coach 40+", "SUV", "Pickup"]

function generateRef() {
  const y = new Date().getFullYear()
  const n = Math.floor(100 + Math.random() * 900)
  return `BK-${y}-${n}`
}

export default function NewBookingPage() {
  const router = useRouter()
  const [dmcId, setDmcId] = useState<string | null>(null)
  const [operators, setOperators] = useState<Operator[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client_name: "",
    source_agent: "",
    booking_type: "sightseeing",
    vehicle_type: "Van 9",
    total_days: 1,
    adults_count: 2,
    children_count: 0,
    flight_number: "",
    special_requirements: "",
    notes: "",
    preferred_operator_id: "",
    pickup_date: new Date().toISOString().slice(0, 10),
    pickup_time: "09:00",
    pickup_location: "",
    dropoff_location: "",
  })

  useEffect(() => {
    const stored = localStorage.getItem("dmc_user")
    if (stored) {
      try { setDmcId(JSON.parse(stored).id) } catch {}
    }
    loadOperators()
  }, [])

  async function loadOperators() {
    const { data } = await supabase.from("operators").select("id, company_name, base_location").eq("status", "active").order("company_name")
    setOperators(data || [])
  }

  function update(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.client_name) { toast.error("Client name is required"); return }
    if (!form.pickup_location) { toast.error("Pickup location is required"); return }
    if (!form.dropoff_location) { toast.error("Drop-off location is required"); return }
    if (!dmcId) { toast.error("Not logged in"); return }

    setSaving(true)
    const booking_ref = generateRef()

    // Create booking
    const { data: booking, error: bErr } = await supabase.from("bookings").insert({
      booking_ref,
      dmc_id: dmcId,
      client_name: form.client_name,
      source_agent: form.source_agent || null,
      booking_type: form.booking_type,
      total_days: form.total_days,
      adults_count: form.adults_count,
      children_count: form.children_count,
      flight_number: form.flight_number || null,
      special_requirements: form.special_requirements || null,
      notes: form.notes || null,
      preferred_operator_id: form.preferred_operator_id || null,
      status: "pending",
    }).select().single()

    if (bErr || !booking) {
      toast.error("Failed to create booking: " + bErr?.message)
      setSaving(false)
      return
    }

    // Create trip records for each day
    const tripInserts = Array.from({ length: form.total_days }, (_, i) => {
      const d = new Date(form.pickup_date)
      d.setDate(d.getDate() + i)
      return {
        id: `T${booking_ref.replace("BK-", "").replace("-", "")}-${i + 1}`,
        booking_id: booking.id,
        dmc_id: dmcId,
        day_number: i + 1,
        trip_date: d.toISOString().slice(0, 10),
        pickup_time: form.pickup_time,
        pickup_location: form.pickup_location,
        dropoff_location: form.dropoff_location,
        vehicle_type: form.vehicle_type,
        pax_count: form.adults_count + form.children_count,
        status: "pending",
        pool_sent_once: false,
        share_message_sent: false,
      }
    })

    await supabase.from("trips").insert(tripInserts)

    toast.success(`Booking ${booking_ref} created!`)
    router.push("/dmc/bookings")
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-foreground transition-colors">← Back</button>
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">New Booking</h1>
          <p className="text-sm text-muted">Fill in the booking details below</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Client Info */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Client Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Client Name *</label>
              <Input className="mt-1" value={form.client_name} onChange={e => update("client_name", e.target.value)} placeholder="Tourist / Group name" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Source Agent</label>
              <Input className="mt-1" value={form.source_agent} onChange={e => update("source_agent", e.target.value)} placeholder="Travel agency name" />
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Trip Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Booking Type</label>
              <select value={form.booking_type} onChange={e => update("booking_type", e.target.value)}
                className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {BOOKING_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Vehicle Type</label>
              <select value={form.vehicle_type} onChange={e => update("vehicle_type", e.target.value)}
                className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Number of Days</label>
              <Input className="mt-1" type="number" min={1} max={30} value={form.total_days} onChange={e => update("total_days", Number(e.target.value))} />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Flight Number</label>
              <Input className="mt-1" value={form.flight_number} onChange={e => update("flight_number", e.target.value)} placeholder="e.g. TG204 (optional)" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Adults</label>
              <Input className="mt-1" type="number" min={1} value={form.adults_count} onChange={e => update("adults_count", Number(e.target.value))} />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Children</label>
              <Input className="mt-1" type="number" min={0} value={form.children_count} onChange={e => update("children_count", Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* First Day Route */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">First Day Route</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Date *</label>
              <Input className="mt-1" type="date" value={form.pickup_date} onChange={e => update("pickup_date", e.target.value)} />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Pickup Time *</label>
              <Input className="mt-1" type="time" value={form.pickup_time} onChange={e => update("pickup_time", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Pickup Location *</label>
              <Input className="mt-1" value={form.pickup_location} onChange={e => update("pickup_location", e.target.value)} placeholder="Hotel name or address" />
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] uppercase text-muted tracking-wider">Drop-off Location *</label>
              <Input className="mt-1" value={form.dropoff_location} onChange={e => update("dropoff_location", e.target.value)} placeholder="Destination or return" />
            </div>
          </div>
        </div>

        {/* Operator */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Preferred Operator</h3>
          <select value={form.preferred_operator_id} onChange={e => update("preferred_operator_id", e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            <option value="">— Any available operator —</option>
            {operators.map(o => <option key={o.id} value={o.id}>{o.company_name} · {o.base_location}</option>)}
          </select>
        </div>

        {/* Notes */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Special Requirements</h3>
          <textarea value={form.special_requirements} onChange={e => update("special_requirements", e.target.value)}
            placeholder="Child seat, wheelchair access, English-speaking driver..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-20" />
          <textarea value={form.notes} onChange={e => update("notes", e.target.value)}
            placeholder="Notes for operator..."
            className="mt-3 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-20" />
        </div>

        <div className="flex gap-3 pb-8">
          <Button variant="secondary" className="flex-1" onClick={() => router.back()}>Cancel</Button>
          <Button className="flex-1 bg-primary text-white" onClick={handleSubmit} disabled={saving}>
            {saving ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
