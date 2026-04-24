"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, ClipboardList, Calendar, Truck, UserCheck, FileBarChart, CreditCard, MessageSquare, Map, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage, Language } from "@/hooks/use-language"
import { createClient } from "@/lib/supabase/client"
import { Wordmark } from "@/components/brand/Wordmark"
import { Monogram } from "@/components/brand/Monogram"

interface NavItem {
  href: string
  icon: React.ElementType
  label: Record<Language, string>
  badge?: number
}

const navItems: NavItem[] = [
  { href: "/dmc/dashboard", icon: LayoutDashboard, label: { en: "Dashboard", th: "แดชบอร์ด", zh: "仪表板", ko: "대시보드", tr: "Panel" } },
  { href: "/dmc/bookings", icon: ClipboardList, label: { en: "Bookings", th: "การจอง", zh: "预订", ko: "예약", tr: "Rezervasyonlar" } },
  { href: "/dmc/live-map", icon: Map, label: { en: "Live Map", th: "แผนที่สด", zh: "实时地图", ko: "실시간 지도", tr: "Canlı Harita" } },
  { href: "/dmc/calendar", icon: Calendar, label: { en: "Calendar", th: "ปฏิทิน", zh: "日历", ko: "캘린더", tr: "Takvim" } },
  { href: "/dmc/operators", icon: Truck, label: { en: "Operators", th: "ผู้ให้บริการ", zh: "运营商", ko: "운영사", tr: "Operatörler" } },
  { href: "/dmc/drivers", icon: UserCheck, label: { en: "Drivers", th: "คนขับ", zh: "司机", ko: "운전사", tr: "Sürücüler" } },
  { href: "/dmc/reports", icon: FileBarChart, label: { en: "Reports", th: "รายงาน", zh: "报告", ko: "보고서", tr: "Raporlar" } },
  { href: "/dmc/payments", icon: CreditCard, label: { en: "Payments", th: "การชำระเงิน", zh: "支付", ko: "결제", tr: "Ödemeler" } },
  { href: "/dmc/support", icon: MessageSquare, label: { en: "Support", th: "ช่วยเหลือ", zh: "支持", ko: "지원", tr: "Destek" } },
]

interface DmcSidebarProps {
  companyName?: string
  subscriptionPlan?: string
}

const planColors: Record<string, string> = {
  trial: "bg-warning-dim text-warning",
  starter: "bg-primary-dim text-primary",
  growth: "bg-primary-dim text-primary",
  pro: "bg-info-dim text-info",
  enterprise: "bg-pool-dim text-pool",
}

export function DmcSidebar({ companyName = "DMC", subscriptionPlan = "trial" }: DmcSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { language, t } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const [bangkokTime, setBangkokTime] = useState("")
  const [signingOut, setSigningOut] = useState(false)

  const planKey = subscriptionPlan?.toLowerCase() || "trial"
  const planStyle = planColors[planKey] || planColors.trial

  useEffect(() => {
    const updateTime = () => {
      setBangkokTime(new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/dmc/login")
    router.refresh()
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 232 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      <div className="h-16 border-b border-sidebar-border flex items-center px-3 relative">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center text-primary">
              <Monogram size="md" variant="solid" />
            </motion.div>
          ) : (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col text-foreground">
              <Wordmark size="sm" />
              <span className="font-mono text-[9px] text-primary uppercase tracking-[0.15em] mt-1">DMC Portal</span>
              <div className="mt-2 pt-2 border-t border-sidebar-border">
                <div className="text-xs font-medium text-foreground truncate">{companyName}</div>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${planStyle}`}>{planKey}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center hover:bg-surface-elevated transition-colors">
          {collapsed ? <ChevronRight className="w-3 h-3 text-muted" /> : <ChevronLeft className="w-3 h-3 text-muted" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-lg relative ${isActive ? "bg-primary-dim border-l-2 border-l-primary text-primary" : "text-muted hover:bg-surface-elevated hover:text-foreground"}`}>
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label[language]}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && item.badge > 0 && (
                <span className="absolute right-2 w-4 h-4 rounded-full bg-warning text-[10px] font-mono flex items-center justify-center text-white">{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-3">
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="font-mono text-[9px] text-muted uppercase tracking-[0.15em]">‹ Bangkok</div>
              <div className="font-mono text-[11px] text-primary">{bangkokTime}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={handleSignOut} disabled={signingOut}
          className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-muted hover:text-danger hover:bg-danger-dim disabled:opacity-50">
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.75} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap">
                {signingOut ? "..." : t({ en: "Sign Out", th: "ออกจากระบบ", zh: "退出" })}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
