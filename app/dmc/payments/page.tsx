"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"

interface Subscription {
  id: string
  plan: string
  amount: number
  startDate: string
  endDate: string
  isActive: boolean
}

const mockSubscriptions: Subscription[] = [
  { id: "1", plan: "Trial", amount: 0, startDate: "2024-01-01", endDate: "2024-03-01", isActive: true },
]

const currentPlan = { name: "Trial", status: "trial" as const, trialEndsAt: "2024-03-01" }

export default function PaymentsPage() {
  const { t } = useLanguage()
  const isExpiredOrTrial = currentPlan.status === "trial"

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">{t({ en: "Payments & Plan", th: "การชำระเงินและแพลน", zh: "支付与计划" })}</h1>
      </div>
      <div className={`bg-surface border rounded-xl p-5 flex items-center justify-between mb-6 border-amber/30`}>
        <div>
          <div className="font-mono text-[10px] uppercase text-muted mb-1">Current Plan</div>
          <div className="text-[22px] font-semibold text-foreground capitalize">{currentPlan.name}</div>
          <div className="text-[13px] text-muted mt-1">
            Status: <span className="text-amber">{currentPlan.status}</span>
            {currentPlan.status === "trial" && <span> · Trial ends {currentPlan.trialEndsAt}</span>}
          </div>
        </div>
        {isExpiredOrTrial && <Button asChild><Link href="/dmc/support">Upgrade Plan</Link></Button>}
      </div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-foreground">Payment History</h2>
        </div>
        {mockSubscriptions.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="w-10 h-10 text-muted/30 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-foreground">No payment history yet</p>
          </div>
        ) : (
          <>
            <div className="bg-background grid grid-cols-[1fr_100px_100px_100px_100px] gap-4 px-4 py-3 border-b border-border">
              {["Plan","Amount","Start","End","Status"].map(h => (
                <div key={h} className="font-mono text-[10px] uppercase text-muted tracking-wider">{h}</div>
              ))}
            </div>
            {mockSubscriptions.map((sub) => (
              <div key={sub.id} className="grid grid-cols-[1fr_100px_100px_100px_100px] gap-4 px-4 py-3 border-b border-border last:border-b-0">
                <div className="text-[13px] font-medium text-foreground capitalize">{sub.plan}</div>
                <div className="font-mono text-[12px] text-green">{sub.amount === 0 ? "Free" : `฿${sub.amount.toLocaleString()}`}</div>
                <div className="font-mono text-[11px] text-muted">{sub.startDate}</div>
                <div className="font-mono text-[11px] text-muted">{sub.endDate}</div>
                <div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[11px] ${sub.isActive ? "bg-primary-dim text-primary" : "bg-red-dim text-red"}`}>
                    {sub.isActive ? "Active" : "Expired"}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  )
}