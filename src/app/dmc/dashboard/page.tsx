"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { ClipboardList, Clock, Map, CreditCard, Plus, ArrowRight, Timer } from "lucide-react"
import { StatCard } from "@/components/dmc/stat-card"
import { StatusBadge } from "@/components/dmc/status-badge"
import { LineConnectBanner } from "@/components/dmc/line-connect-banner"
import { useLanguage } from "@/hooks/use-language"

const mockDmc = {
  companyName: "Siam Tours",
  subscriptionPlan: "trial" as const,
  subscriptionStatus: "trial" as const,
  lineUserId: null as string | null,
}

const mockBookings = [
  { id: "BK-2026-001", client: "Wang Family", days: 3, status: "confirmed" as const, date: "2026-04-15" },
  { id: "BK-2026-002", client: "Euro Travel Group", days: 7, status: "pending" as const, date: "2026-04-14" },
  { id: "BK-2026-003", client: "Asia Pacific Tours", days: 2, status: "in_progress" as const, date: "2026-04-13" },
  { id: "BK-2026-004", client: "Korea DMC Group", days: 5, status: "confirmed" as const, date: "2026-04-12" },
  { id: "BK-2026-005", client: "Luxury Escapes Co", days: 4, status: "completed" as const, date: "2026-04-10" },
]

const stagger = (i: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.2 } })

export default function DmcDashboardPage() {
  const { t } = useLanguage()
  const [lineUserId, setLineUserId] = useState<string | null>(mockDmc.lineUserId)

  async function handleLineConnect(id: string) {
    await new Promise(r => setTimeout(r, 800))
    setLineUserId(id)
    toast.success(t({ en: "LINE connected successfully!", th: "เชื่อมต่อ LINE สำเร็จ!", zh: "LINE 连接成功！" }))
  }

  const date = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div>
      {/* Trial Banner */}
      <AnimatePresence>
        {mockDmc.subscriptionStatus === "trial" && (
          <motion.div {...stagger(0)}
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Timer size={16} color="#f59e0b" />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#f59e0b" }}>
                {t({ en: "Trial account — upgrade to unlock all features", th: "บัญชีทดลอง — อัพเกรดเพื่อปลดล็อคฟีเจอร์ทั้งหมด", zh: "试用账户 — 升级以解锁所有功能" })}
              </span>
            </div>
            <Link href="/dmc/support"
              style={{ padding: "5px 14px", borderRadius: 8, fontSize: 12, background: "var(--bg-elevated,#1a1a1a)", border: "1px solid var(--border,#242)", color: "var(--text-2,#999)", textDecoration: "none" }}>
              {t({ en: "Contact us", th: "ติดต่อเรา", zh: "联系我们" })}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LINE Connect Banner */}
      <LineConnectBanner lineUserId={lineUserId} onConnect={handleLineConnect} />

      {/* Page Header */}
      <motion.div {...stagger(1)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1,#f0f0f0)", marginBottom: 4 }}>
            {t({ en: `Welcome back, ${mockDmc.companyName}!`, th: `ยินดีต้อนรับ, ${mockDmc.companyName}!`, zh: `欢迎回来, ${mockDmc.companyName}!` })}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-2,#999)" }}>{date} · Bangkok</p>
        </div>
        <Link href="/dmc/bookings/new"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: "#1D9E75", color: "white", textDecoration: "none", transition: "opacity 150ms" }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = "1"}>
          <Plus size={15} />
          {t({ en: "+ New Booking", th: "+ จองใหม่", zh: "+ 新预订" })}
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <motion.div {...stagger(2)} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label={t({ en: "Total Bookings", th: "การจองทั้งหมด", zh: "总预订" })} value={mockBookings.length} subLabel={t({ en: "all time", th: "ทั้งหมด", zh: "全部" })} icon={ClipboardList} accentColor="primary" />
        <StatCard label={t({ en: "Pending", th: "รอดำเนินการ", zh: "待处理" })} value={mockBookings.filter(b => b.status === "pending").length} subLabel={t({ en: "awaiting dispatch", th: "รอการส่ง", zh: "等待派遣" })} icon={Clock} accentColor="amber" />
        <StatCard label={t({ en: "Active Trips", th: "ทริปที่ใช้งาน", zh: "活跃行程" })} value={mockBookings.filter(b => b.status === "in_progress").length} subLabel={t({ en: "running now", th: "กำลังดำเนินการ", zh: "正在运行" })} icon={Map} accentColor="green" />
        <StatCard label={t({ en: "Plan", th: "แผน", zh: "计划" })} value={0} subLabel={mockDmc.subscriptionPlan} icon={CreditCard} accentColor="blue" />
      </motion.div>

      {/* Recent Bookings */}
      <motion.div {...stagger(3)} style={{ background: "var(--bg-surface,#111)", border: "1px solid var(--border,#242)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border,#242)" }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1,#f0f0f0)" }}>
              {t({ en: "Recent Bookings", th: "การจองล่าสุด", zh: "最近预订" })}
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-2,#999)", marginTop: 2 }}>
              {t({ en: "Your latest activity", th: "กิจกรรมล่าสุดของคุณ", zh: "您的最新活动" })}
            </p>
          </div>
          <Link href="/dmc/bookings" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#1D9E75", textDecoration: "none" }}>
            {t({ en: "View all", th: "ดูทั้งหมด", zh: "查看全部" })} <ArrowRight size={12} />
          </Link>
        </div>
        {mockBookings.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <ClipboardList size={40} style={{ margin: "0 auto 8px", opacity: 0.2, color: "var(--text-2,#999)" }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-2,#999)", marginBottom: 4 }}>
              {t({ en: "No bookings yet", th: "ยังไม่มีการจอง", zh: "暂无预订" })}
            </p>
            <Link href="/dmc/bookings/new" style={{ fontSize: 13, color: "#1D9E75", textDecoration: "none" }}>
              {t({ en: "Create your first one →", th: "สร้างการจองแรก →", zh: "创建第一个 →" })}
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border,#242)", background: "var(--bg-base,#080808)" }}>
                  {["REF","CLIENT","DAYS","STATUS","DATE"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "monospace", fontSize: 10, color: "var(--text-2,#999)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockBookings.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 120ms", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated,#1a1a1a)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: "#1D9E75" }}>{b.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "var(--text-1,#f0f0f0)" }}>{b.client}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text-2,#999)" }}>{b.days}d</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={b.status} showPulse /></td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text-2,#999)" }}>{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
