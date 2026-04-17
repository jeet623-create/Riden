"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/use-language"

interface LineConnectBannerProps {
  lineUserId: string | null
  onConnect: (lineUserId: string) => Promise<void>
  onDismiss?: () => void
}

export function LineConnectBanner({ lineUserId, onConnect, onDismiss }: LineConnectBannerProps) {
  const [showModal, setShowModal] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { t } = useLanguage()

  const handleConnect = async () => {
    if (!inputValue.trim()) return
    setIsConnecting(true)
    try { await onConnect(inputValue.trim()); setShowModal(false); setInputValue("") }
    finally { setIsConnecting(false) }
  }

  if (lineUserId) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[rgba(6,199,85,0.06)] border border-[rgba(6,199,85,0.12)] rounded-xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-[18px] h-[18px] text-[#06C755]" />
          <div>
            <span className="text-[13px] font-medium text-foreground">{t({ en: "LINE Connected", th: "เชื่อมต่อ LINE แล้ว", zh: "LINE 已连接" })}</span>
            <p className="text-[12px] text-muted">{t({ en: "You will receive booking and emergency notifications via LINE", th: "คุณจะได้รับการแจ้งเตือนผ่าน LINE", zh: "您将通过 LINE 接收预订和紧急通知" })}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted hover:text-foreground">{t({ en: "Manage", th: "จัดการ", zh: "管理" })}</Button>
      </motion.div>
    )
  }

  if (dismissed) return null

  return (
    <>
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="w-full bg-[rgba(0,185,74,0.06)] border border-[rgba(0,185,74,0.15)] rounded-xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#06C755] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[8px] font-bold">LINE</span>
            </div>
            <div>
              <span className="text-[13px] font-medium text-foreground">{t({ en: "Connect your LINE account", th: "เชื่อมต่อบัญชี LINE ของคุณ", zh: "连接您的 LINE 帐户" })}</span>
              <p className="text-[12px] text-muted">{t({ en: "Receive booking notifications, driver alerts and emergency updates on LINE", th: "รับการแจ้งเตือนการจอง การแจ้งเตือนคนขับ และอัพเดทฉุกเฉินบน LINE", zh: "在 LINE 上接收预订通知、司机提醒和紧急更新" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowModal(true)} className="bg-[#06C755] hover:bg-[#06C755]/90 text-white text-[13px] font-medium px-4 py-2">
              {t({ en: "Connect LINE →", th: "เชื่อมต่อ LINE →", zh: "连接 LINE →" })}
            </Button>
            <button onClick={() => { setDismissed(true); onDismiss?.() }} className="w-5 h-5 flex items-center justify-center text-muted hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[400px] bg-surface border border-border rounded-2xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-10 h-10 bg-[#06C755] rounded-xl flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-[16px] font-semibold text-foreground">{t({ en: "Connect LINE", th: "เชื่อมต่อ LINE", zh: "连接 LINE" })}</h3>
                <p className="text-[13px] text-muted mt-1">{t({ en: "Enter your LINE User ID to receive notifications", th: "ป้อน LINE User ID เพื่อรับการแจ้งเตือน", zh: "输入您的 LINE 用户 ID 以接收通知" })}</p>
              </div>
              <div className="mb-4">
                <label className="block font-mono text-[10px] uppercase text-muted tracking-wider mb-1.5">LINE USER ID</label>
                <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Uxxxxxxxxxxx" className="w-full bg-surface-elevated border-border h-10 rounded-lg" />
                <p className="text-[11px] text-muted mt-1.5">{t({ en: "Find your User ID in LINE app → Profile → ···", th: "ค้นหา User ID ใน LINE → โปรไฟล์ → ···", zh: "在 LINE 应用中找到您的用户 ID → 个人资料 → ···" })}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">{t({ en: "Cancel", th: "ยกเลิก", zh: "取消" })}</Button>
                <Button onClick={handleConnect} disabled={!inputValue.trim() || isConnecting} className="flex-1 bg-[#06C755] hover:bg-[#06C755]/90 text-white">
                  {isConnecting ? t({ en: "Connecting...", th: "กำลังเชื่อมต่อ...", zh: "连接中..." }) : t({ en: "Connect", th: "เชื่อมต่อ", zh: "连接" })}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}