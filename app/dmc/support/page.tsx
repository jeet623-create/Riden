"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/dmc/status-badge"
import { useLanguage } from "@/hooks/use-language"

interface Ticket {
  id: string
  subject: string
  message: string
  status: "open" | "replied" | "closed"
  createdAt: string
}

const mockTickets: Ticket[] = [
  { id: "1", subject: "Need help upgrading plan", message: "I would like to upgrade from trial to pro plan. Can you assist?", status: "replied", createdAt: "2024-01-15" },
  { id: "2", subject: "Driver not showing on map", message: "The driver location is not updating in real-time for booking BK-2024-0045.", status: "open", createdAt: "2024-01-14" },
]

export default function SupportPage() {
  const { t } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tickets, setTickets] = useState(mockTickets)

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setTickets([{ id: `${tickets.length + 1}`, subject, message, status: "open", createdAt: new Date().toISOString().split("T")[0] }, ...tickets])
    setSubject("")
    setMessage("")
    setShowForm(false)
    setIsSubmitting(false)
    toast.success("Ticket submitted successfully")
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-semibold text-foreground">{t({ en: "Support", th: "ช่วยเหลือ", zh: "支持" })}</h1>
          <span className="text-[13px] text-muted">{tickets.length} tickets</span>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {t({ en: "New Ticket", th: "สร้างตั๋ว", zh: "新工单" })}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-surface border border-border rounded-xl p-6 mb-5">
              <h2 className="text-[15px] font-semibold text-foreground mb-4">New Support Ticket</h2>
              <div className="space-y-4">
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject..." className="bg-white dark:bg-surface-elevated" />
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..." rows={5} className="bg-white dark:bg-surface-elevated" />
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!subject.trim() || !message.trim() || isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-10 h-10 text-muted/30 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-foreground">No tickets yet</p>
            <p className="text-[13px] text-muted mt-1">Need help? Create a ticket above.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="px-6 py-4 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors">
              <div className="flex items-start justify-between">
                <div className="text-[14px] font-medium text-foreground">{ticket.subject}</div>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="text-[13px] text-muted line-clamp-2 mt-1">{ticket.message}</p>
              <div className="font-mono text-[11px] text-muted mt-1.5">{ticket.createdAt}</div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}