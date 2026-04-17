"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Search, Truck, Star, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/use-language"

interface Operator {
  id: string
  companyName: string
  phone: string
  baseLocation: string
  isVerified: boolean
  status: "active" | "inactive"
}

const mockOperators: Operator[] = [
  { id: "1", companyName: "Bangkok Van Service", phone: "+66 81 234 5678", baseLocation: "Bangkok", isVerified: true, status: "active" },
  { id: "2", companyName: "Phuket Tours Co.", phone: "+66 82 345 6789", baseLocation: "Phuket", isVerified: true, status: "active" },
  { id: "3", companyName: "Chiang Mai Express", phone: "+66 83 456 7890", baseLocation: "Chiang Mai", isVerified: true, status: "active" },
  { id: "4", companyName: "Krabi Shuttle", phone: "+66 84 567 8901", baseLocation: "Krabi", isVerified: false, status: "active" },
  { id: "5", companyName: "Pattaya VIP Transport", phone: "+66 85 678 9012", baseLocation: "Pattaya", isVerified: true, status: "active" },
]

const initialPreferredIds = ["1", "2"]

export default function OperatorsPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [preferredIds, setPreferredIds] = useState<string[]>(initialPreferredIds)

  const filteredOperators = mockOperators.filter(op =>
    op.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.baseLocation.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const togglePreferred = (operatorId: string) => {
    setPreferredIds(prev => {
      const isPreferred = prev.includes(operatorId)
      toast.success(isPreferred ? "Removed from preferred operators" : "Added to preferred operators")
      return isPreferred ? prev.filter(id => id !== operatorId) : [...prev, operatorId]
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-semibold text-foreground">{t({ en: "Operators", th: "ผู้ให้บริการ", zh: "运营商" })}</h1>
          <span className="text-[13px] text-muted">Your preferred operators</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search operators..." className="pl-9 w-[200px] h-9 bg-surface" />
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="bg-background grid grid-cols-[1fr_120px_120px_80px_80px_60px] gap-4 px-4 py-3 border-b border-border">
          {["Company","Phone","Base","Verified","Status","Fav"].map(h => (
            <div key={h} className="font-mono text-[10px] uppercase text-muted tracking-wider">{h}</div>
          ))}
        </div>
        {filteredOperators.length === 0 ? (
          <div className="py-12 text-center"><Truck className="w-10 h-10 text-muted/30 mx-auto mb-3" /><p className="text-[14px] font-medium text-foreground">No operators available</p></div>
        ) : (
          filteredOperators.map((operator, index) => {
            const isPreferred = preferredIds.includes(operator.id)
            return (
              <motion.div key={operator.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                className="grid grid-cols-[1fr_120px_120px_80px_80px_60px] gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors">
                <div className="text-[13px] font-medium text-foreground">{operator.companyName}</div>
                <div className="font-mono text-[12px] text-muted">{operator.phone}</div>
                <div className="text-[12px] text-muted">{operator.baseLocation}</div>
                <div>{operator.isVerified ? <CheckCircle className="w-4 h-4 text-primary" /> : <span className="text-[11px] text-muted">-</span>}</div>
                <div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[11px] ${operator.status === "active" ? "bg-primary-dim text-primary" : "bg-muted/10 text-muted"}`}>
                    {operator.status}
                  </span>
                </div>
                <div className="text-center">
                  <button onClick={() => togglePreferred(operator.id)} className="p-1 rounded hover:bg-surface-elevated transition-colors">
                    <Star className={`w-5 h-5 transition-colors ${isPreferred ? "fill-amber text-amber" : "text-muted hover:text-foreground"}`} />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}