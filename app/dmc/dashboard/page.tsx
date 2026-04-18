"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { ClipboardList, Clock, Map, CreditCard, Plus, ArrowRight, Timer } from "lucide-react"
import { StatCard } from "@/components/dmc/stat-card"
import { StatusBadge } from "@/components/dmc/status-badge"
import { LineConnectBanner } from "@/components/dmc/line-connect-banner"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"

const mockDmcData = {
  companyName: "Siam Tours",
  subscriptionPlan: "trial" as const,
  subscriptionStatus: "trial" as const,
  lineUserId: null as string | null,
  stats: { totalBookings: 47, pending: 5, activeTrips: 3 }
}

const mockBookings = [
  { id: "BK-2024-001", client: "Adventure Tours", days: 3, status: "confirmed" as const, date: "2024-01-15" },
  { id: "BK-2024-002", client: "Luxury Travels", days: 7, status: "pending" as const, date: "2024-01-14" },
  { id: "BK-2024-003", client: "Budget Backpackers", days: 2, status: "in_progress" as const, date: "2024-01-13" },
  { id: "BK-2024-004", client: "Family Vacations", days: 5, status: "completed" as const, date: "2024-01-12" },
  { id: "BK-2024-005", client: "Corporate Events", days: 1, status: "confirmed" as const, date: "2024-01-11" },
]

const sparklineData = {
  bookings: [12, 19, 23, 31, 38, 42, 47],
  pending: [2, 3, 5, 4, 6, 3, 5],
  active: [1, 2, 2, 3, 4, 3, 3],
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getCurrentDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

export default function DMCDashboardPage() {
  const { companyName, subscriptionPlan, subscriptionStatus, lineUserId: initialLineUserId, stats } = mockDmcData
  const { t } = useLanguage()
  const [lineUserId, setLineUserId] = useState<string | null>(initialLineUserId)

  const handleLineConnect = async (newLineUserId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLineUserId(newLineUserId)
    toast.success(t({ en: "LINE connected! You'll now receive notifications.", th: "เชื่อมต่อ LINE แล้ว!", zh: "LINE 已连接！" }))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <AnimatePresence>
        {subscriptionStatus === "trial" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-[13px] font-medium text-[#f59e0b]">{t({ en: "Trial account — upgrade to unlock all features", th: "บัญชีทดลอง — อัพเกรดเพื่อปลดล็อคฟีเจอร์ทั้งหมด", zh: "试用账户 — 升级以解锁所有功能" })}</span>
            </div>
            <Button variant="secondary" size="sm" className="bg-[rgba(245,158,11,0.1)] hover:bg-[rgba(245,158,11,0.2)] text-[#f59e0b] border-0" asChild>
              <Link href="/dmc/support">{t({ en: "Contact us", th: "ติดต่อเรา", zh: "联系我们" })}</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <LineConnectBanner lineUserId={lineUserId} onConnect={handleLineConnect} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">{t({ en: `Welcome back, ${companyName}!`, th: `ยินดีต้อนรับกลับ, ${companyName}!`, zh: `欢迎回来, ${companyName}!` })}</h1>
          <p className="text-sm text-muted mt-0.5">{getCurrentDate()}</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" asChild>
          <Link href="/dmc/bookings/new"><Plus className="w-4 h-4 mr-2" />{t({ en: "New Booking", th: "จองใหม่", zh: "新预订" })}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t({ en: "Total Bookings", th: "การจองทั้งหมด", zh: "总预订数" })} value={stats.totalBookings} subLabel={t({ en: "all time", th: "ตลอดกาล", zh: "全部时间" })} icon={ClipboardList} accentColor="primary" sparklineData={sparklineData.bookings} />
        <StatCard label={t({ en: "Pending", th: "รอดำเนินการ", zh: "待处理" })} value={stats.pending} subLabel={t({ en: "awaiting dispatch", th: "รอการส่ง", zh: "等待派遣" })} icon={Clock} accentColor="amber" sparklineData={sparklineData.pending} />
        <StatCard label={t({ en: "Active Trips", th: "ทริปที่กำลังดำเนินการ", zh: "进行中的行程" })} value={stats.activeTrips} subLabel={t({ en: "running now", th: "กำลังดำเนินการ", zh: "正在进行" })} icon={Map} accentColor="green" sparklineData={sparklineData.active} />
        <StatCard label={t({ en: "Plan", th: "แพ็คเกจ", zh: "套餐" })} value={1} subLabel={subscriptionPlan.toUpperCase()} icon={CreditCard} accentColor="blue" />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <h2 className="text-sm font-semibold text-foreground">{t({ en: "Recent Bookings", th: "การจองล่าสุด", zh: "最近预订" })}</h2>
          <Link href="/dmc/bookings" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
            {t({ en: "View all", th: "ดูทั้งหมด", zh: "查看全部" })}<ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background">
                {["Ref","Client","Days","Status","Date"].map(h => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase text-muted tracking-wider py-3 px-4">{t({ en: h, th: h, zh: h })}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking, index) => (
                <motion.tr key={booking.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}
                  className="border-b border-border table-row-hover cursor-pointer hover:bg-surface-elevated">
                  <td className="py-3 px-4 font-mono text-xs text-foreground">{booking.id}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{booking.client}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted">{booking.days}</td>
                  <td className="py-3 px-4"><StatusBadge status={booking.status} showPulse={booking.status === "in_progress"} /></td>
                  <td className="py-3 px-4 font-mono text-xs text-muted">{formatDate(booking.date)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
