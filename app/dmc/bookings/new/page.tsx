"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ChevronDown, Copy, Plus, Plane, Building2, MapPin, Compass, Car, Clock,
  Users, CheckCircle2, Star, Search, MessageCircle, Mail, ArrowLeft, ArrowRight,
  Calendar as CalendarIcon, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

// ---------- Types ----------
type DayBookingType = "airport_transfer" | "hotel_transfer" | "sightseeing" | "day_tour" | "custom"
type DispatchChoice = "operators" | "pool" | "later"

type Operator = {
  id: string
  company_name: string
  base_location: string | null
  is_verified: boolean
}

type MasterForm = {
  client_name: string
  mobile_number: string
  source_agent: string
  total_adults: number
  total_children: number
  children_ages: string
  total_days: number
  requirement_chips: string[]
  requirement_other: string
  first_day_date: string
}

type DayRow = {
  day_number: number
  trip_date: string
  booking_type: DayBookingType
  pax_count: number
  pickup_location: string
  pickup_time: string
  dropoff_location: string
  flight_number: string
  sightseeing_hours: number
  vehicle_type: string
  special_requirements: string
}

// ---------- Constants ----------
const DAY_TYPES: { value: DayBookingType; label: string; icon: any }[] = [
  { value: "airport_transfer", label: "Airport Transfer", icon: Plane },
  { value: "hotel_transfer", label: "Hotel Transfer", icon: Building2 },
  { value: "sightseeing", label: "Sightseeing", icon: Compass },
  { value: "day_tour", label: "Day Tour", icon: MapPin },
  { value: "custom", label: "Custom", icon: Car },
]

const VEHICLE_TYPES: { value: string; label: string }[] = [
  { value: "sedan", label: "Sedan" },
  { value: "van_9", label: "Van 9" },
  { value: "van_12", label: "Van 12" },
  { value: "minibus_15", label: "Minibus 15" },
  { value: "minibus_20", label: "Minibus 20" },
  { value: "coach_30", label: "Coach 30" },
  { value: "coach_40plus", label: "Coach 40+" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup" },
]

const REQUIREMENT_CHIPS = [
  "Child seat", "Wheelchair", "English-speaking driver", "Thai-speaking driver",
  "Chinese-speaking driver", "Extra luggage", "Cooler/water", "Baby stroller",
]

const TIME_OPTIONS: string[] = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) {
    out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }
  return out
})()

// ---------- Helpers ----------
function addDaysISO(isoDate: string, days: number) {
  if (!isoDate) return ""
  const d = new Date(isoDate + "T00:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatShortDate(iso: string) {
  if (!iso) return "—"
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" })
}

function formatFullDate(iso: string) {
  if (!iso) return "—"
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

function vehicleLabel(v: string) {
  return VEHICLE_TYPES.find(x => x.value === v)?.label ?? v
}

function dayTypeLabel(t: DayBookingType) {
  return DAY_TYPES.find(x => x.value === t)?.label ?? t
}

function dayTypeIcon(t: DayBookingType) {
  return DAY_TYPES.find(x => x.value === t)?.icon ?? Car
}

function makeEmptyDay(dayNumber: number, firstDay: string, defaults: Partial<DayRow> = {}): DayRow {
  return {
    day_number: dayNumber,
    trip_date: firstDay ? addDaysISO(firstDay, dayNumber - 1) : "",
    booking_type: "sightseeing",
    pax_count: defaults.pax_count ?? 1,
    pickup_location: "",
    pickup_time: "09:00",
    dropoff_location: "",
    flight_number: "",
    sightseeing_hours: 8,
    vehicle_type: "van_9",
    special_requirements: "",
  }
}

// ---------- Main Page ----------
export default function NewBookingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [dmcId, setDmcId] = useState<string | null>(null)
  const [preferredOperatorIds, setPreferredOperatorIds] = useState<string[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [sourceAgentSuggestions, setSourceAgentSuggestions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<null | {
    booking_ref: string
    client_name: string
    total_days: number
    date_range: string
    total_pax: number
    dispatch_state: string
    dispatch_choice: DispatchChoice
    operator_count: number
    days_preview: { day_number: number; label: string; route: string }[]
  }>(null)

  const [master, setMaster] = useState<MasterForm>({
    client_name: "",
    mobile_number: "",
    source_agent: "",
    total_adults: 2,
    total_children: 0,
    children_ages: "",
    total_days: 1,
    requirement_chips: [],
    requirement_other: "",
    first_day_date: new Date().toISOString().slice(0, 10),
  })

  const [days, setDays] = useState<DayRow[]>([])

  const [dispatchChoice, setDispatchChoice] = useState<DispatchChoice>("later")
  const [selectedOperatorIds, setSelectedOperatorIds] = useState<string[]>([])
  const [dispatchNotes, setDispatchNotes] = useState("")

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setDmcId(user.id)

      const { data: dmc } = await supabase
        .from("dmc_users")
        .select("preferred_operator_ids")
        .eq("id", user.id)
        .maybeSingle()
      if (dmc?.preferred_operator_ids) setPreferredOperatorIds(dmc.preferred_operator_ids)

      const { data: ops } = await supabase
        .from("operators")
        .select("id, company_name, base_location, is_verified")
        .eq("status", "active")
        .order("is_verified", { ascending: false })
        .order("company_name")
      setOperators(ops ?? [])

      const { data: past } = await supabase
        .from("bookings")
        .select("source_agent")
        .eq("dmc_id", user.id)
        .not("source_agent", "is", null)
        .limit(200)
      const distinct = Array.from(new Set((past ?? []).map(r => r.source_agent).filter(Boolean))) as string[]
      setSourceAgentSuggestions(distinct)
    })()
  }, [])

  // sync day rows when total_days or first_day_date changes (from step 1 transition)
  function generateDaysFromMaster(m: MasterForm): DayRow[] {
    const totalPax = m.total_adults + m.total_children
    const existing = days.length
    if (existing === 0) {
      return Array.from({ length: m.total_days }, (_, i) => makeEmptyDay(i + 1, m.first_day_date, { pax_count: totalPax }))
    }
    // preserve user edits if same length
    return Array.from({ length: m.total_days }, (_, i) => {
      const prior = days[i]
      if (prior) return { ...prior, day_number: i + 1, trip_date: addDaysISO(m.first_day_date, i) }
      return makeEmptyDay(i + 1, m.first_day_date, { pax_count: totalPax })
    })
  }

  function handleNextFromStep1() {
    if (!master.client_name.trim()) { toast.error("Client name is required"); return }
    if (master.total_days < 1 || master.total_days > 30) { toast.error("Number of days must be 1–30"); return }
    if (!master.first_day_date) { toast.error("First day date is required"); return }
    setDays(generateDaysFromMaster(master))
    setStep(2)
  }

  function handleNextFromStep2(asDraft = false) {
    for (const d of days) {
      if (!d.pickup_location.trim()) { toast.error(`Day ${d.day_number}: pickup location required`); return }
      if (!d.pickup_time) { toast.error(`Day ${d.day_number}: pickup time required`); return }
      if (!d.vehicle_type) { toast.error(`Day ${d.day_number}: vehicle type required`); return }
      if (d.booking_type === "sightseeing") {
        if (!(d.sightseeing_hours >= 1 && d.sightseeing_hours <= 12)) {
          toast.error(`Day ${d.day_number}: sightseeing hours must be 1–12`); return
        }
      } else {
        if (!d.dropoff_location.trim()) { toast.error(`Day ${d.day_number}: dropoff location required`); return }
      }
    }
    if (asDraft) setDispatchChoice("later")
    setStep(3)
  }

  async function submitBooking() {
    if (!dmcId) { toast.error("Not logged in"); return }
    setSaving(true)
    const supabase = createClient()

    const requirementsString = [
      ...master.requirement_chips,
      master.requirement_other.trim() ? `Other: ${master.requirement_other.trim()}` : "",
    ].filter(Boolean).join(", ")

    const dispatchState: string =
      dispatchChoice === "operators" && selectedOperatorIds.length > 0 ? "sent"
      : dispatchChoice === "pool" ? "sent"
      : "draft"

    const bookingInsert: Record<string, any> = {
      dmc_id: dmcId,
      client_name: master.client_name.trim(),
      mobile_number: master.mobile_number.trim() || null,
      source_agent: master.source_agent.trim() || null,
      adults_count: master.total_adults,
      children_count: master.total_children,
      children_ages: master.children_ages.trim() || null,
      total_days: master.total_days,
      special_requirements: requirementsString || null,
      notes: dispatchNotes.trim() || null,
      booking_type: days[0]?.booking_type ?? null,
      dispatch_state: dispatchState,
      preferred_operator_ids:
        dispatchChoice === "operators" && selectedOperatorIds.length > 0
          ? selectedOperatorIds
          : [],
      status: dispatchState === "draft" ? "pending" : "pending",
    }

    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .insert(bookingInsert)
      .select("id, booking_ref, total_days, client_name")
      .single()

    if (bErr || !booking) {
      toast.error("Failed to create booking: " + (bErr?.message ?? "unknown"))
      setSaving(false)
      return
    }

    // derive "last 5 digits" from booking_ref — take trailing digits
    const digitsMatch = booking.booking_ref.match(/(\d+)\s*$/)
    const last5 = digitsMatch ? digitsMatch[1].slice(-5) : booking.id.replace(/\D/g, "").slice(0, 5)

    const tripInserts = days.map(d => ({
      id: `T${last5}-${d.day_number}`,
      booking_id: booking.id,
      dmc_id: dmcId,
      day_number: d.day_number,
      trip_date: d.trip_date,
      pickup_time: d.pickup_time,
      pickup_location: d.pickup_location.trim(),
      dropoff_location:
        d.booking_type === "sightseeing"
          ? (d.dropoff_location.trim() || d.pickup_location.trim())
          : d.dropoff_location.trim(),
      vehicle_type: d.vehicle_type,
      pax_count: d.pax_count,
      booking_type: d.booking_type,
      special_requirements: d.special_requirements.trim() || null,
      sightseeing_hours: d.booking_type === "sightseeing" ? d.sightseeing_hours : null,
      notes: d.flight_number.trim() ? `Flight: ${d.flight_number.trim()}` : null,
      status: "pending",
      pool_sent_once: false,
      share_message_sent: false,
    }))

    const { error: tErr } = await supabase.from("trips").insert(tripInserts)
    if (tErr) {
      toast.error("Booking saved but day rows failed: " + tErr.message)
      setSaving(false)
      return
    }

    // side-effect edge fn calls
    try {
      if (dispatchState === "sent" && dispatchChoice === "operators" && selectedOperatorIds.length > 0) {
        for (const opId of selectedOperatorIds) {
          await supabase.functions.invoke("booking-created", {
            body: { bookingId: booking.id, operatorId: opId },
          })
        }
      } else if (dispatchState === "sent" && dispatchChoice === "pool") {
        await supabase.functions.invoke("booking-created", {
          body: { bookingId: booking.id },
        })
      }
    } catch (e) {
      // don't block the confirmation — just warn
      console.warn("dispatch edge fn error", e)
    }

    const firstDay = days[0]?.trip_date ?? ""
    const lastDay = days[days.length - 1]?.trip_date ?? ""
    const dateRange = firstDay && lastDay ? `${formatFullDate(firstDay)} – ${formatFullDate(lastDay)}` : ""
    const daysPreview = days.slice(0, 5).map(d => ({
      day_number: d.day_number,
      label: dayTypeLabel(d.booking_type),
      route: d.booking_type === "sightseeing"
        ? `${d.pickup_location} · ${d.sightseeing_hours}h`
        : `${d.pickup_location} → ${d.dropoff_location}`,
    }))

    setCreated({
      booking_ref: booking.booking_ref,
      client_name: booking.client_name,
      total_days: booking.total_days,
      date_range: dateRange,
      total_pax: master.total_adults + master.total_children,
      dispatch_state: dispatchState,
      dispatch_choice: dispatchChoice,
      operator_count: selectedOperatorIds.length,
      days_preview: daysPreview,
    })
    setSaving(false)
  }

  if (created) {
    return <ConfirmationCard data={created} onViewBooking={() => router.push("/dmc/bookings")} onCreateAnother={() => {
      setCreated(null); setStep(1)
      setMaster(m => ({ ...m, client_name: "", mobile_number: "", children_ages: "", requirement_chips: [], requirement_other: "" }))
      setDays([]); setDispatchChoice("later"); setSelectedOperatorIds([]); setDispatchNotes("")
    }} onDispatch={() => router.push("/dmc/bookings?tab=draft")} />
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="text-muted hover:text-foreground transition-colors">← Back</button>
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">DIRECTION 09 · NEW BOOKING</div>
          <h1 className="font-display italic text-[26px] font-semibold text-foreground leading-tight">Build the trip</h1>
        </div>
      </div>

      <WizardProgress step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}>
            <Step1Master
              form={master}
              onChange={setMaster}
              agentSuggestions={sourceAgentSuggestions}
              onCancel={() => router.back()}
              onNext={handleNextFromStep1}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="s2"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}>
            <Step2Days
              master={master}
              days={days}
              setDays={setDays}
              onBack={() => setStep(1)}
              onSaveDraft={() => handleNextFromStep2(true)}
              onNext={() => handleNextFromStep2(false)}
            />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="s3"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}>
            <Step3Dispatch
              choice={dispatchChoice}
              setChoice={setDispatchChoice}
              operators={operators}
              preferredOperatorIds={preferredOperatorIds}
              selectedOperatorIds={selectedOperatorIds}
              setSelectedOperatorIds={setSelectedOperatorIds}
              notes={dispatchNotes}
              setNotes={setDispatchNotes}
              saving={saving}
              onBack={() => setStep(2)}
              onSubmit={submitBooking}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------- Wizard Progress ----------
function WizardProgress({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Master Details", "Day-by-day", "Dispatch"]
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {[1, 2, 3].map((n, i) => {
        const done = step > n
        const current = step === n
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-lg font-semibold transition-all
                ${done ? "bg-primary text-white" : current ? "bg-primary text-white ring-4 ring-primary/15" : "bg-surface border border-border text-muted"}`}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : n}
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-wider ${current ? "text-foreground" : "text-muted"}`}>
                {labels[i]}
              </span>
            </div>
            {i < 2 && (
              <div className={`w-16 sm:w-24 h-[2px] mx-2 mt-[-18px] transition-colors ${step > n ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------- Step 1 ----------
function Step1Master({
  form, onChange, agentSuggestions, onCancel, onNext,
}: {
  form: MasterForm
  onChange: (f: MasterForm) => void
  agentSuggestions: string[]
  onCancel: () => void
  onNext: () => void
}) {
  const [agentOpen, setAgentOpen] = useState(false)
  const filteredAgents = useMemo(() => {
    const q = form.source_agent.toLowerCase()
    if (!q) return agentSuggestions.slice(0, 6)
    return agentSuggestions.filter(a => a.toLowerCase().includes(q)).slice(0, 6)
  }, [form.source_agent, agentSuggestions])

  function update<K extends keyof MasterForm>(k: K, v: MasterForm[K]) {
    onChange({ ...form, [k]: v })
  }

  function toggleChip(chip: string) {
    const has = form.requirement_chips.includes(chip)
    update("requirement_chips", has
      ? form.requirement_chips.filter(c => c !== chip)
      : [...form.requirement_chips, chip]
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em] mb-1">STEP 01</div>
      <h2 className="font-display italic text-[22px] font-semibold text-foreground mb-6">Who's coming</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldLabel label="Client Name *">
          <Input value={form.client_name} onChange={e => update("client_name", e.target.value)} placeholder="Tourist / group name" />
        </FieldLabel>
        <FieldLabel label="Contact Number">
          <Input value={form.mobile_number} onChange={e => update("mobile_number", e.target.value)} placeholder="+66 ..." />
        </FieldLabel>

        <FieldLabel label="Agent Name">
          <div className="relative">
            <Input
              value={form.source_agent}
              onChange={e => { update("source_agent", e.target.value); setAgentOpen(true) }}
              onFocus={() => setAgentOpen(true)}
              onBlur={() => setTimeout(() => setAgentOpen(false), 120)}
              placeholder="Travel agency or partner"
            />
            {agentOpen && filteredAgents.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                {filteredAgents.map(a => (
                  <button
                    type="button"
                    key={a}
                    onMouseDown={e => { e.preventDefault(); update("source_agent", a); setAgentOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-surface-elevated"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        </FieldLabel>
        <FieldLabel label="First Day Date *">
          <Input type="date" value={form.first_day_date} onChange={e => update("first_day_date", e.target.value)} />
        </FieldLabel>

        <FieldLabel label="Total Adults">
          <Input type="number" min={1} value={form.total_adults} onChange={e => update("total_adults", Math.max(1, Number(e.target.value) || 1))} />
        </FieldLabel>
        <FieldLabel label="Total Children">
          <Input type="number" min={0} value={form.total_children} onChange={e => update("total_children", Math.max(0, Number(e.target.value) || 0))} />
        </FieldLabel>

        {form.total_children > 0 && (
          <FieldLabel label="Children Ages" className="sm:col-span-2">
            <Input value={form.children_ages} onChange={e => update("children_ages", e.target.value)} placeholder="e.g. 6, 8" />
          </FieldLabel>
        )}

        <FieldLabel label="Number of Days *" className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <button type="button" className="h-9 w-9 rounded-md border border-border text-foreground hover:bg-surface-elevated"
              onClick={() => update("total_days", Math.max(1, form.total_days - 1))}>−</button>
            <Input type="number" min={1} max={30} className="max-w-[100px] text-center"
              value={form.total_days} onChange={e => update("total_days", Math.max(1, Math.min(30, Number(e.target.value) || 1)))} />
            <button type="button" className="h-9 w-9 rounded-md border border-border text-foreground hover:bg-surface-elevated"
              onClick={() => update("total_days", Math.min(30, form.total_days + 1))}>+</button>
            <span className="text-sm text-muted">days</span>
          </div>
        </FieldLabel>
      </div>

      <div className="mt-8">
        <label className="font-mono text-[10px] uppercase text-muted tracking-wider mb-3 block">Special Requirements (whole trip)</label>
        <div className="flex flex-wrap gap-2">
          {REQUIREMENT_CHIPS.map(chip => {
            const on = form.requirement_chips.includes(chip)
            return (
              <button
                key={chip} type="button"
                onClick={() => toggleChip(chip)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${on
                  ? "bg-primary text-white border border-primary"
                  : "bg-surface-elevated border border-border text-foreground hover:border-primary/40"}`}
              >
                {chip}
              </button>
            )
          })}
        </div>
        <Input className="mt-3" placeholder="Other (free text)" value={form.requirement_other}
          onChange={e => update("requirement_other", e.target.value)} />
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onNext} className="bg-primary text-white hover:bg-primary/90">
          Next: Day Details <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// ---------- Step 2 ----------
function Step2Days({
  master, days, setDays, onBack, onSaveDraft, onNext,
}: {
  master: MasterForm
  days: DayRow[]
  setDays: (d: DayRow[]) => void
  onBack: () => void
  onSaveDraft: () => void
  onNext: () => void
}) {
  const [expandedDay, setExpandedDay] = useState<number>(1)
  const totalPax = master.total_adults + master.total_children

  function updateDay(index: number, patch: Partial<DayRow>) {
    setDays(days.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function copyFromPrevious(index: number) {
    if (index === 0) return
    const prev = days[index - 1]
    updateDay(index, {
      booking_type: prev.booking_type,
      pax_count: prev.pax_count,
      pickup_location: prev.pickup_location,
      pickup_time: prev.pickup_time,
      dropoff_location: prev.dropoff_location,
      flight_number: prev.flight_number,
      sightseeing_hours: prev.sightseeing_hours,
      vehicle_type: prev.vehicle_type,
      special_requirements: prev.special_requirements,
    })
    toast.success(`Day ${index + 1}: copied from day ${index}`)
  }

  function addDay() {
    const n = days.length + 1
    setDays([...days, makeEmptyDay(n, master.first_day_date, { pax_count: totalPax })])
    setExpandedDay(n)
  }

  function removeDay(index: number) {
    if (days.length <= 1) { toast.error("At least one day required"); return }
    const next = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day_number: i + 1, trip_date: addDaysISO(master.first_day_date, i) }))
    setDays(next)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* Sticky sidebar */}
      <aside className="lg:sticky lg:top-6 lg:self-start bg-surface border border-border rounded-2xl p-4 h-fit">
        <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em] mb-3">ITINERARY</div>
        <ol className="space-y-3">
          {days.map((d, i) => {
            const Icon = dayTypeIcon(d.booking_type)
            const active = expandedDay === d.day_number
            const complete = Boolean(d.pickup_location && d.pickup_time && d.vehicle_type &&
              (d.booking_type === "sightseeing" ? d.sightseeing_hours > 0 : d.dropoff_location))
            return (
              <li key={i}>
                <button
                  onClick={() => setExpandedDay(d.day_number)}
                  className={`w-full text-left flex items-start gap-3 rounded-lg px-2 py-2 transition-colors ${active ? "bg-primary/10" : "hover:bg-surface-elevated"}`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-display font-semibold
                      ${complete ? "bg-primary text-white" : active ? "bg-primary/20 text-primary" : "bg-surface-elevated text-muted"}`}>
                      {d.day_number}
                    </div>
                    {i < days.length - 1 && <div className={`w-[2px] h-6 mt-1 ${complete ? "bg-primary" : "bg-border"}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      {dayTypeLabel(d.booking_type)}
                    </div>
                    <div className="text-[11px] text-muted truncate">
                      {formatShortDate(d.trip_date)} · {d.pickup_time || "—"} · {d.pax_count} pax
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ol>
        <button
          onClick={addDay}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-primary hover:bg-primary/10 rounded-lg py-2"
        >
          <Plus className="w-4 h-4" /> Add Day
        </button>
      </aside>

      <div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em] mb-1">STEP 02</div>
          <h2 className="font-display italic text-[22px] font-semibold text-foreground mb-1">What happens each day</h2>
          <p className="text-sm text-muted mb-5">{totalPax} pax total · tap a day to expand</p>

          <div className="space-y-3">
            {days.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: i * 0.06, ease: "easeOut" }}
                className="border border-border rounded-xl overflow-hidden bg-background"
              >
                <DayAccordion
                  day={d}
                  index={i}
                  totalPax={totalPax}
                  expanded={expandedDay === d.day_number}
                  onToggle={() => setExpandedDay(expandedDay === d.day_number ? -1 : d.day_number)}
                  onChange={patch => updateDay(i, patch)}
                  onCopyPrevious={i > 0 ? () => copyFromPrevious(i) : undefined}
                  onRemove={days.length > 1 ? () => removeDay(i) : undefined}
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={addDay}
            className="mt-4 w-full flex items-center justify-center gap-2 text-sm border border-dashed border-border rounded-lg py-3 text-muted hover:text-primary hover:border-primary/40 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Day
          </button>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSaveDraft}>Save as Draft</Button>
            <Button onClick={onNext} className="bg-primary text-white hover:bg-primary/90">
              Next: Dispatch <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DayAccordion({
  day, index, totalPax, expanded, onToggle, onChange, onCopyPrevious, onRemove,
}: {
  day: DayRow
  index: number
  totalPax: number
  expanded: boolean
  onToggle: () => void
  onChange: (patch: Partial<DayRow>) => void
  onCopyPrevious?: () => void
  onRemove?: () => void
}) {
  const Icon = dayTypeIcon(day.booking_type)
  const routeSummary = day.booking_type === "sightseeing"
    ? `${day.pickup_location || "—"} · ${day.sightseeing_hours}h`
    : `${day.pickup_location || "—"} → ${day.dropoff_location || "—"}`
  const showDropoff = day.booking_type !== "sightseeing"
  const showFlight = day.booking_type === "airport_transfer"
  const showSightHours = day.booking_type === "sightseeing"

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-elevated transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-display font-semibold text-sm flex items-center justify-center">
          {day.day_number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon className="w-3.5 h-3.5 text-primary" />
            <span>{dayTypeLabel(day.booking_type)}</span>
            <span className="text-muted font-normal">·</span>
            <span className="text-muted font-normal">{formatShortDate(day.trip_date)}</span>
            <span className="text-muted font-normal">·</span>
            <span className="text-muted font-normal">{day.pax_count} pax</span>
            <span className="text-muted font-normal">·</span>
            <span className="text-muted font-normal truncate">{vehicleLabel(day.vehicle_type)}</span>
          </div>
          <div className="text-[11px] text-muted truncate mt-0.5">{routeSummary}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {DAY_TYPES.map(t => {
                    const TIcon = t.icon
                    const active = day.booking_type === t.value
                    return (
                      <button
                        key={t.value}
                        onClick={() => onChange({ booking_type: t.value })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${active
                          ? "bg-primary text-white"
                          : "bg-surface-elevated border border-border text-foreground hover:border-primary/40"}`}
                      >
                        <TIcon className="w-3.5 h-3.5" />
                        {t.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-1">
                  {onCopyPrevious && (
                    <button
                      onClick={onCopyPrevious}
                      className="text-[11px] text-muted hover:text-primary flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10"
                    >
                      <Copy className="w-3 h-3" /> Copy from day {index}
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={onRemove}
                      className="text-[11px] text-muted hover:text-destructive flex items-center gap-1 px-2 py-1 rounded hover:bg-destructive/10"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldLabel label="Pax">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number" min={1} value={day.pax_count}
                      onChange={e => onChange({ pax_count: Math.max(1, Number(e.target.value) || 1) })}
                    />
                    {day.pax_count < totalPax && (
                      <span className="text-[11px] text-muted whitespace-nowrap">{totalPax} booked total</span>
                    )}
                  </div>
                </FieldLabel>
                <FieldLabel label="Pickup Time *">
                  <TimeSelect value={day.pickup_time} onChange={v => onChange({ pickup_time: v })} />
                </FieldLabel>

                <FieldLabel label="Pickup Location *" className="sm:col-span-2">
                  <Input value={day.pickup_location} onChange={e => onChange({ pickup_location: e.target.value })} placeholder="Hotel, address, landmark" />
                </FieldLabel>

                {showFlight && (
                  <FieldLabel label="Flight Number">
                    <Input value={day.flight_number} onChange={e => onChange({ flight_number: e.target.value })} placeholder="e.g. TG204" />
                  </FieldLabel>
                )}

                {showDropoff && (
                  <FieldLabel label="Dropoff Location *" className={showFlight ? "" : "sm:col-span-2"}>
                    <Input value={day.dropoff_location} onChange={e => onChange({ dropoff_location: e.target.value })} placeholder="Destination" />
                  </FieldLabel>
                )}

                {showSightHours && (
                  <FieldLabel label="Total Hours *">
                    <Input
                      type="number" min={1} max={12}
                      value={day.sightseeing_hours}
                      onChange={e => onChange({ sightseeing_hours: Math.max(1, Math.min(12, Number(e.target.value) || 8)) })}
                    />
                  </FieldLabel>
                )}

                <FieldLabel label="Vehicle Type *" className={showSightHours ? "" : "sm:col-span-2"}>
                  <select
                    value={day.vehicle_type}
                    onChange={e => onChange({ vehicle_type: e.target.value })}
                    className="w-full h-9 bg-background border border-input rounded-md px-3 text-sm text-foreground"
                  >
                    {VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </FieldLabel>

                <FieldLabel label="Special Request (this day)" className="sm:col-span-2">
                  <Input value={day.special_requirements} onChange={e => onChange({ special_requirements: e.target.value })} placeholder="Optional notes for this day" />
                </FieldLabel>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-9 bg-background border border-input rounded-md px-3 text-sm text-foreground"
    >
      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  )
}

// ---------- Step 3 ----------
function Step3Dispatch({
  choice, setChoice, operators, preferredOperatorIds, selectedOperatorIds, setSelectedOperatorIds,
  notes, setNotes, saving, onBack, onSubmit,
}: {
  choice: DispatchChoice
  setChoice: (c: DispatchChoice) => void
  operators: Operator[]
  preferredOperatorIds: string[]
  selectedOperatorIds: string[]
  setSelectedOperatorIds: (ids: string[]) => void
  notes: string
  setNotes: (v: string) => void
  saving: boolean
  onBack: () => void
  onSubmit: () => void
}) {
  const [search, setSearch] = useState("")
  const visible = useMemo(() => {
    const q = search.toLowerCase()
    const sorted = [...operators].sort((a, b) => {
      const ap = preferredOperatorIds.includes(a.id) ? 0 : 1
      const bp = preferredOperatorIds.includes(b.id) ? 0 : 1
      if (ap !== bp) return ap - bp
      if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1
      return a.company_name.localeCompare(b.company_name)
    })
    if (!q) return sorted
    return sorted.filter(o =>
      o.company_name.toLowerCase().includes(q) || (o.base_location ?? "").toLowerCase().includes(q)
    )
  }, [operators, preferredOperatorIds, search])

  function toggleOp(id: string) {
    const has = selectedOperatorIds.includes(id)
    if (has) setSelectedOperatorIds(selectedOperatorIds.filter(x => x !== id))
    else if (selectedOperatorIds.length >= 10) { toast.error("Max 10 operators"); return }
    else setSelectedOperatorIds([...selectedOperatorIds, id])
  }

  const selectedMap = useMemo(() => new Set(selectedOperatorIds), [selectedOperatorIds])
  const canSubmit = !saving && (choice !== "operators" || selectedOperatorIds.length > 0)

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em] mb-1">STEP 03</div>
      <h2 className="font-display italic text-[22px] font-semibold text-foreground mb-6">Send to operators</h2>

      <div className="space-y-3">
        <DispatchOption
          active={choice === "operators"}
          onClick={() => setChoice("operators")}
          title="Send to preferred operators now"
          description="Select who should get this booking. First to accept wins."
        />
        <DispatchOption
          active={choice === "pool"}
          onClick={() => setChoice("pool")}
          title="Send directly to pool (skip operators)"
          description="All updates come directly to you. Drivers will bid on each day."
          warning
        />
        <DispatchOption
          active={choice === "later"}
          onClick={() => setChoice("later")}
          title="Save for later"
          description="Booking will be saved. You can dispatch anytime from Bookings page."
        />
      </div>

      {choice === "operators" && (
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input className="pl-9" placeholder="Search operators..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {selectedOperatorIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedOperatorIds.map(id => {
                const op = operators.find(o => o.id === id)
                if (!op) return null
                return (
                  <span key={id} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                    {op.company_name}
                    <button onClick={() => toggleOp(id)}><X className="w-3 h-3" /></button>
                  </span>
                )
              })}
            </div>
          )}

          <div className="border border-border rounded-lg max-h-72 overflow-y-auto divide-y divide-border">
            {visible.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted italic font-display">No operators match.</div>
            ) : visible.map(op => {
              const selected = selectedMap.has(op.id)
              const preferred = preferredOperatorIds.includes(op.id)
              return (
                <button
                  key={op.id} type="button"
                  onClick={() => toggleOp(op.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-elevated transition-colors ${selected ? "bg-primary/5" : ""}`}
                >
                  <div className={`w-4 h-4 rounded border ${selected ? "bg-primary border-primary" : "border-border"} flex items-center justify-center`}>
                    {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      {preferred && <Star className="w-3 h-3 text-primary fill-primary" />}
                      <span className="font-medium">{op.company_name}</span>
                      {op.is_verified && <span className="text-[10px] uppercase font-mono text-primary tracking-wider">verified</span>}
                    </div>
                    <div className="text-[11px] text-muted">{op.base_location ?? "—"}</div>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="text-[11px] text-muted">Select up to 10 operators. First to accept wins; others auto-dismissed.</div>
        </div>
      )}

      <div className="mt-6">
        <label className="font-mono text-[10px] uppercase text-muted tracking-wider mb-2 block">Notes for operator / drivers</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Optional"
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground resize-none h-20"
        />
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 w-4 h-4" /> Back</Button>
        <Button onClick={onSubmit} disabled={!canSubmit} className="bg-primary text-white hover:bg-primary/90">
          {saving ? "Saving..." : "Save Booking"}
        </Button>
      </div>
    </div>
  )
}

function DispatchOption({
  active, onClick, title, description, warning,
}: { active: boolean; onClick: () => void; title: string; description: string; warning?: boolean }) {
  return (
    <button
      type="button" onClick={onClick}
      className={`w-full text-left rounded-xl border transition-colors px-4 py-3 flex items-start gap-3
        ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}
    >
      <div className={`w-4 h-4 rounded-full border mt-1 ${active ? "border-primary" : "border-border"} flex items-center justify-center`}>
        {active && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className={`text-[12px] ${warning ? "text-[color:var(--warning)]" : "text-muted"} mt-0.5`}>{description}</div>
      </div>
    </button>
  )
}

// ---------- Confirmation ----------
function ConfirmationCard({
  data, onViewBooking, onCreateAnother, onDispatch,
}: {
  data: {
    booking_ref: string
    client_name: string
    total_days: number
    date_range: string
    total_pax: number
    dispatch_state: string
    dispatch_choice: DispatchChoice
    operator_count: number
    days_preview: { day_number: number; label: string; route: string }[]
  }
  onViewBooking: () => void
  onCreateAnother: () => void
  onDispatch: () => void
}) {
  const summaryLine =
    data.dispatch_state === "draft" ? "Saved as draft. Send anytime."
    : data.dispatch_choice === "operators" ? `Sent to ${data.operator_count} operator${data.operator_count === 1 ? "" : "s"}. Waiting for accept.`
    : "Sent to driver pool. Bids incoming."

  const shareLines = [
    "Amazing Thailand Tours",
    `${data.booking_ref} · ${data.total_days} ${data.total_days === 1 ? "day" : "days"}`,
    `${data.client_name} · ${data.total_pax} pax${data.date_range ? ` · ${data.date_range}` : ""}`,
    ...data.days_preview.map(d => `Day ${d.day_number} · ${d.label} · ${d.route}`),
    ...(data.total_days > data.days_preview.length ? [`... +${data.total_days - data.days_preview.length} more days`] : []),
    "Driver details coming soon.",
  ]
  const shareText = shareLines.join("\n")

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareText)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Couldn't copy")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}
      className="max-w-xl mx-auto">
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-primary">{data.booking_ref} saved</span>
          </div>
          <div className="text-foreground text-lg font-medium">
            {data.client_name} · {data.total_days} {data.total_days === 1 ? "day" : "days"}
          </div>
          <div className="mt-3 text-sm text-muted">
            <span className="font-mono text-[10px] uppercase tracking-wider mr-2">DISPATCH</span>
            {summaryLine}
          </div>
          {data.dispatch_state === "draft" && (
            <Button onClick={onDispatch} className="mt-3 bg-primary text-white hover:bg-primary/90">
              Dispatch Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="p-6 border-b border-border">
          <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-3">— Share with customer —</div>
          <div className="bg-background border border-border rounded-xl p-4 text-sm space-y-1 font-mono">
            {shareLines.map((line, i) => (
              <div key={i} className={i === 0 ? "font-display italic font-semibold text-foreground text-base" : "text-foreground"}>{line}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" onClick={copyShare}>
              <Copy className="mr-2 w-4 h-4" /> Copy Text
            </Button>
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
              <Button variant="outline">
                <MessageCircle className="mr-2 w-4 h-4" /> WhatsApp
              </Button>
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(`Booking ${data.booking_ref}`)}&body=${encodeURIComponent(shareText)}`}>
              <Button variant="outline">
                <Mail className="mr-2 w-4 h-4" /> Email
              </Button>
            </a>
          </div>
        </div>

        <div className="p-6 flex flex-wrap gap-2 justify-end">
          <Button variant="ghost" onClick={onViewBooking}>View Booking</Button>
          <Button onClick={onCreateAnother} className="bg-primary text-white hover:bg-primary/90">
            <Plus className="mr-2 w-4 h-4" /> Create Another
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ---------- Shared ----------
function FieldLabel({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}
