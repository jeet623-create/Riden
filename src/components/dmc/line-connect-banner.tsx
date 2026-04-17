"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, CheckCircle2, X } from "lucide-react"
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
    try {
      await onConnect(inputValue.trim())
      setShowModal(false)
      setInputValue("")
    } finally {
      setIsConnecting(false)
    }
  }

  if (lineUserId) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", background: "rgba(6,199,85,0.06)", border: "1px solid rgba(6,199,85,0.12)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CheckCircle2 size={18} color="#06C755" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1,#f0f0f0)" }}>
              {t({ en: "LINE Connected", th: "เชื่อมต่อ LINE แล้ว", zh: "LINE 已连接" })}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2,#999)", marginTop: 2 }}>
              {t({ en: "You will receive booking and emergency notifications via LINE", th: "คุณจะได้รับการแจ้งเตือนการจองและฉุกเฉินผ่าน LINE", zh: "您将通过 LINE 接收预订和紧急通知" })}
            </div>
          </div>
        </div>
        <button style={{ padding: "5px 14px", borderRadius: 8, fontSize: 12, background: "transparent", border: "1px solid var(--border,#242)", color: "var(--text-2,#999)", cursor: "pointer" }}>
          {t({ en: "Manage", th: "จัดการ", zh: "管理" })}
        </button>
      </motion.div>
    )
  }

  if (dismissed) return null

  return (
    <>
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          style={{ width: "100%", background: "rgba(0,185,74,0.06)", border: "1px solid rgba(0,185,74,0.15)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: "#06C755", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: 8, fontWeight: 700 }}>LINE</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1,#f0f0f0)" }}>
                {t({ en: "Connect your LINE account", th: "เชื่อมต่อบัญชี LINE ของคุณ", zh: "连接您的 LINE 帐户" })}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2,#999)", marginTop: 2 }}>
                {t({ en: "Receive booking notifications, driver alerts and emergency updates on LINE", th: "รับการแจ้งเตือนการจอง การแจ้งเตือนคนขับ และอัพเดทฉุกเฉินบน LINE", zh: "在 LINE 上接收预订通知、司机提醒和紧急更新" })}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setShowModal(true)}
              style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: "#06C755", color: "white", border: "none", cursor: "pointer" }}>
              {t({ en: "Connect LINE →", th: "เชื่อมต่อ LINE →", zh: "连接 LINE →" })}
            </button>
            <button onClick={() => { setDismissed(true); onDismiss?.() }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3,#555)", display: "flex", alignItems: "center" }}>
              <X size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 50 }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
              style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 51, width: "100%", maxWidth: 400, background: "var(--bg-surface,#111)", border: "1px solid var(--border,#242)", borderRadius: 20, padding: 24 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, background: "#06C755", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <MessageSquare size={20} color="white" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1,#f0f0f0)" }}>
                  {t({ en: "Connect LINE", th: "เชื่อมต่อ LINE", zh: "连接 LINE" })}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-2,#999)", marginTop: 4 }}>
                  {t({ en: "Enter your LINE User ID to receive notifications", th: "ป้อน LINE User ID เพื่อรับการแจ้งเตือน", zh: "输入您的 LINE 用户 ID 以接收通知" })}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: "var(--font-mono,monospace)", fontSize: 10, color: "var(--text-3,#555)", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 6 }}>LINE USER ID</label>
                <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Uxxxxxxxxxxx"
                  style={{ width: "100%", background: "var(--bg-elevated,#1a1a1a)", border: "1px solid var(--border,#242)", borderRadius: 8, height: 40, padding: "0 12px", fontSize: 14, color: "var(--text-1,#f0f0f0)", outline: "none", transition: "border-color 150ms" }}
                  onFocus={e => e.target.style.borderColor = "#06C755"}
                  onBlur={e => e.target.style.borderColor = "var(--border,#242)"}
                  onKeyDown={e => e.key === "Enter" && handleConnect()} />
                <div style={{ fontSize: 11, color: "var(--text-3,#555)", marginTop: 6 }}>
                  {t({ en: "Find your User ID in LINE app → Profile → ···", th: "ค้นหา User ID ใน LINE → โปรไฟล์ → ···", zh: "在 LINE 应用中找到您的用户 ID → 个人资料 → ···" })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: 9, borderRadius: 8, fontSize: 13, background: "var(--bg-elevated,#1a1a1a)", border: "1px solid var(--border,#242)", color: "var(--text-2,#999)", cursor: "pointer" }}>
                  {t({ en: "Cancel", th: "ยกเลิก", zh: "取消" })}
                </button>
                <button onClick={handleConnect} disabled={!inputValue.trim() || isConnecting}
                  style={{ flex: 1, padding: 9, borderRadius: 8, fontSize: 13, fontWeight: 500, background: "#06C755", color: "white", border: "none", cursor: !inputValue.trim() || isConnecting ? "not-allowed" : "pointer", opacity: !inputValue.trim() || isConnecting ? 0.5 : 1 }}>
                  {isConnecting ? t({ en: "Connecting...", th: "กำลังเชื่อมต่อ...", zh: "连接中..." }) : t({ en: "Connect", th: "เชื่อมต่อ", zh: "连接" })}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
