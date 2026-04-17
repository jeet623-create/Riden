"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, ClipboardList, Calendar, Truck, UserCheck, FileBarChart, CreditCard, MessageSquare, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage, Language } from "@/hooks/use-language"

interface NavItem {
  href: string
  icon: React.ElementType
  label: Record<Language, string>
  badge?: number
}

const navItems: NavItem[] = [
  { href: "/dmc/dashboard", icon: LayoutDashboard, label: { en: "Dashboard", th: "แดชบอร์ด", zh: "仪表板" } },
  { href: "/dmc/bookings", icon: ClipboardList, label: { en: "Bookings", th: "การจอง", zh: "预订" }, badge: 3 },
  { href: "/dmc/calendar", icon: Calendar, label: { en: "Calendar", th: "ปฏิทิน", zh: "日历" } },
  { href: "/dmc/operators", icon: Truck, label: { en: "Operators", th: "ผู้ให้บริการ", zh: "运营商" } },
  { href: "/dmc/drivers", icon: UserCheck, label: { en: "Drivers", th: "คนขับ", zh: "司机" } },
  { href: "/dmc/reports", icon: FileBarChart, label: { en: "Reports", th: "รายงาน", zh: "报告" } },
  { href: "/dmc/payments", icon: CreditCard, label: { en: "Payments", th: "การชำระเงิน", zh: "支付" } },
  { href: "/dmc/support", icon: MessageSquare, label: { en: "Support", th: "ช่วยเหลือ", zh: "支持" } },
]

interface DmcSidebarProps {
  companyName?: string
  subscriptionPlan?: "trial" | "starter" | "pro" | "enterprise"
}

export function DmcSidebar({ companyName = "DMC Company", subscriptionPlan = "trial" }: DmcSidebarProps) {
  const pathname = usePathname()
  const { language, t } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const [bangkokTime, setBangkokTime] = useState("")

  const planColors = {
    trial: "bg-amber-dim text-amber",
    starter: "bg-primary-dim text-primary",
    pro: "bg-blue-dim text-blue",
    enterprise: "bg-[rgba(139,92,246,0.1)] text-[#8b5cf6]"
  }

  useEffect(() => {
    const updateTime = () => {
      setBangkokTime(new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 232 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col z-50"
    >
      <div className="h-16 border-b border-border flex items-center px-3 relative">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-logo text-white text-sm">R</span>
            </motion.div>
          ) : (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
              <span className="font-logo text-primary text-base leading-none">RIDEN</span>
              <span className="font-mono text-[9px] text-primary uppercase tracking-widest mt-1">DMC Portal</span>
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-xs font-medium text-foreground truncate">{companyName}</div>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${planColors[subscriptionPlan]}`}>{subscriptionPlan}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-surface-elevated transition-colors">
          {collapsed ? <ChevronRight className="w-3 h-3 text-muted" /> : <ChevronLeft className="w-3 h-3 text-muted" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors relative ${isActive ? "bg-primary-dim border-l-2 border-l-primary text-primary" : "text-muted hover:bg-surface-elevated hover:text-foreground"}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label[language]}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && item.badge > 0 && (
                <span className="absolute right-2 w-4 h-4 rounded-full bg-amber text-[10px] font-mono flex items-center justify-center text-white">{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-3">
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="text-[9px] text-muted uppercase tracking-wider">Bangkok</div>
              <div className="font-mono text-[11px] text-primary">{bangkokTime}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-muted hover:text-red hover:bg-red-dim transition-colors">
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap">
                {t({ en: "Sign Out", th: "ออกจากระบบ", zh: "退出" })}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}