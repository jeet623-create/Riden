"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Copy, 
  Trash2,
  Plane,
  Radio,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Types
type BookingType = "airport_transfer" | "hotel_transfer" | "sightseeing" | "day_tour" | "custom"
type SpecialRequirement = "wheelchair" | "baby_seat" | "vip" | "halal" | "english_guide" | "thai_guide" | "child_seat" | "extra_luggage"
type DayTemplate = "airport_pickup" | "airport_drop" | "city_tour" | "hotel_transfer" | "sightseeing" | "custom"
type DispatchMode = "single" | "multiple" | "broadcast"

interface DayItinerary {
  id: string
  dayNumber: number
  date: string
  pickupTime: string
  pickupLocation: string
  dropoffLocation: string
  paxCount: number
  vehicleType: string
  durationHours: number
  flightNumber: string
  terminal: string
  notes: string
  template: DayTemplate
}

interface Operator {
  id: string
  companyName: string
  baseLocation: string
  isPreferred: boolean
}

const mockOperators: Operator[] = [
  { id: "1", companyName: "Bangkok Van Service", baseLocation: "Bangkok", isPreferred: true },
  { id: "2", companyName: "Phuket Tours Co.", baseLocation: "Phuket", isPreferred: true },
  { id: "3", companyName: "Chiang Mai Express", baseLocation: "Chiang Mai", isPreferred: false },
  { id: "4", companyName: "Krabi Shuttle", baseLocation: "Krabi", isPreferred: false },
  { id: "5", companyName: "Pattaya VIP Transport", baseLocation: "Pattaya", isPreferred: false },
]

const bookingTypes: { value: BookingType; label: string }[] = [
  { value: "airport_transfer", label: "Airport Transfer" },
  { value: "hotel_transfer", label: "Hotel Transfer" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "day_tour", label: "Day Tour" },
  { value: "custom", label: "Custom" },
]

const specialRequirements: { value: SpecialRequirement; label: string }[] = [
  { value: "wheelchair", label: "Wheelchair" },
  { value: "baby_seat", label: "Baby Seat" },
  { value: "vip", label: "VIP" },
  { value: "halal", label: "Halal" },
  { value: "english_guide", label: "English Guide" },
  { value: "thai_guide", label: "ThaiGuide" },
  { value: "child_seat", label: "Child Seat" },
  { value: "extra_luggage", label: "Extra Luggage" },
]

const dayTemplates: { value: DayTemplate; label: string }[] = [
  { value: "airport_pickup", label: "Airport Pickup" },
  { value: "airport_drop", label: "Airport Drop" },
  { value: "city_tour", label: "City Tour" },
  { value: "hotel_transfer", label: "Hotel Transfer" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "custom", label: "Custom" },
]

const vehicleOptions = [
  { value: "sedan", label: "Sedan (1-3 pax)", maxPax: 3 },
  { value: "suv", label: "SUV (1-5 pax)", maxPax: 5 },
  { value: "van", label: "Van (6-10 pax)", maxPax: 10 },
  { value: "minibms", label: "Minibus (11-20 pax)", maxPax: 20 },
  { value: "bus", label: "Bus (21-45 pax)", maxPax: 45 },
]

function getVehicleFromPax(pax: number): string {
  for (const v of vehicleOptions) {
    if (pax <= v.maxPax) return v.value
  }
  return "bus"
}

export default function NewBookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [dispatchSuccess, setDispatchSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [clientName, setClientName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [numberOfDays, setNumberOfDays] = useState(1)
  const [groupSize, setGroupSize] = useState(2)
  const [bookingType, setBookingType] = useState<BookingType>("airport_transfer")
  const [selectedRequirements, setSelectedRequirements] = useState<SpecialRequirement[]>([])
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [days, setDays] = useState<DayItinerary[]>([])
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>("single")
  const [selectedOperators, setSelectedOperators] = useState<string[]>([])
  const [operatorFilter, setOperatorFilter] = useState<"preferred" | "all">("preferred")
  const preferredOperators = mockOperators.filter(o => o.isPreferred)
  const filteredOperators = operatorFilter === "preferred" ? preferredOperators : mockOperators
  const step1Valid = clientName.trim() && mobileNumber.trim() && numberOfDays >= 1 && groupSize >= 1
  const handleNextStep = () => {
    if (!step1Valid) { toast.error("Please fill all required fields"); return }
    const newDays: DayItinerary[] = Array.from({ length: numberOfDays }, (_, i) => ({ id: `day-${i + 1}`, dayNumber: i + 1, date: "", pickupTime: "09:00", pickupLocation: "", dropoffLocation: "", paxCount: groupSize, vehicleType: getVehicleFromPax(groupSize), durationHours: 8, flightNumber: "", terminal: "", notes: "", template: "custom" as DayTemplate }))
    setDays(newDays); setStep(2)
  }
  const updateDay = (dayId: string, updates: Partial<DayItinerary>) => { setDays(prev => prev.map(d => d.id === dayId ? { ...d, ...updates } : d)) }
  const copyDay = (dayId: string) => {
    const dayToCopy = days.find(d => d.id === dayId)
    if (!dayToCopy) return
    setDays([...days, { ...dayToCopy, id: `day-${days.length + 1}`, dayNumber: days.length + 1 }])
    setNumberOfDays(prev => prev + 1); toast.success("Day copied")
  }
  const removeDay = (dayId: string) => {
    if (days.length <= 1) { toast.error("Must have at least 1 day"); return }
    setDays(prev => prev.filter(d => d.id !== dayId).map((d, i) => ({ ...d, dayNumber: i + 1 })))
    setNumberOfDays(prev => prev - 1)
  }
  const addDay = () => {
    setDays([...days, { id: `day-${days.length + 1}`, dayNumber: days.length + 1, date: "", pickupTime: "09:00", pickupLocation: "", dropoffLocation: "", paxCount: groupSize, vehicleType: getVehicleFromPax(groupSize), durationHours: 8, flightNumber: "", terminal: "", notes: "", template: "custom" }])
    setNumberOfDays(prev => prev + 1)
  }
  const applyTemplate = (dayId: string, template: DayTemplate) => {
    const updates: Partial<DayItinerary> = { template }
    if (template === "airport_pickup") { updates.pickupLocation = "Suvarnabhumi Airport (BKK)"; updates.durationHours = 2 }
    else if (template === "airport_drop") { updates.dropoffLocation = "Suvarnabhumi Airport (BKK)"; updates.durationHours = 2 }
    else if (template === "city_tour") { updates.durationHours = 8 }
    updateDay(dayId, updates)
  }
  const handleSaveBooking = async () => { setIsSubmitting(true); await new Promise(r => setTimeout(r, 1000)); setIsSubmitting(false); setShowDispatchModal(true) }
  const toggleOperator = (id: string) => { if (dispatchMode === "single") { setSelectedOperators([id]) } else { setSelectedOperators(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) } }
  const handleDispatch = async () => {
    if (dispatchMode !== "broadcast" && selectedOperators.length === 0) { toast.error("Please select at least one operator"); return }
    setIsSending(true); await new Promise(r => setTimeout(r, 1500)); setIsSending(false); setDispatchSuccess(true)
    setTimeout(() => router.push("/dmc/bookings"), 2000)
  }
  const handleSkipDispatch = () => { toast.success("Booking saved. You can dispatch later."); router.push("/dmc/bookings") }
  const isAirportTemplate = (t: DayTemplate) => t === "airport_pickup" || t === "airport_drop"

  return <div className="min-h-screen bg-background"><p>New Booking Page Loaded</p></div>
}
