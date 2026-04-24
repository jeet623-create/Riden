"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { createClient } from "@/lib/supabase/client"
import { PendingPaymentsPanel } from "@/components/dmc/pending-payments-panel"

type DmcProfile = {
  id: string
  subscription_plan: string | null
  subscription_status: string | null
  trial_ends_at: string | null
}

export default function PaymentsPage() {
  const { t } = useLanguage()
  const [dmc, setDmc] = useState<DmcProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from("dmc_users")
        .select("id, subscription_plan, subscription_status, trial_ends_at")
        .eq("id", user.id)
        .maybeSingle()
      setDmc((data as DmcProfile) ?? null)
      setLoading(false)
    })()
  }, [])

  const planName = dmc?.subscription_plan ?? "trial"
  const planStatus = dmc?.subscription_status ?? "trial"
  const trialEnd = dmc?.trial_ends_at ?? null
  const isTrial = planStatus === "trial"

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-8">
      <div>
        <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">PAYMENTS</div>
        <h1 className="font-display italic text-[26px] font-semibold text-foreground leading-tight">
          {t({ en: "Payments", th: "การชำระเงิน", zh: "支付", ko: "결제", tr: "Ödemeler" })}
        </h1>
        <p className="text-[13px] text-muted mt-1">
          {t({
            en: "Operator payments and your RIDEN subscription",
            th: "การชำระเงินให้ผู้ประกอบการและแผน RIDEN ของคุณ",
            zh: "运营商付款和您的 RIDEN 订阅",
            ko: "운영사 결제 및 RIDEN 구독",
            tr: "Operatör ödemeleri ve RIDEN aboneliğiniz",
          })}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : dmc ? (
        <PendingPaymentsPanel dmcId={dmc.id} />
      ) : null}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.15em]">YOUR PLAN</div>
          <h2 className="text-[15px] font-semibold text-foreground mt-0.5">RIDEN Subscription</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[22px] font-semibold text-foreground capitalize">{planName}</div>
            <div className="text-[13px] text-muted mt-1">
              Status: <span className="text-amber capitalize">{planStatus}</span>
              {isTrial && trialEnd && (
                <> · Trial ends {new Date(trialEnd).toLocaleDateString()}</>
              )}
            </div>
          </div>
          {isTrial && (
            <Button asChild>
              <Link href="/dmc/support">Upgrade plan</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
