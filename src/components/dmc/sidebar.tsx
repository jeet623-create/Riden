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

const planColors: Record<string, string> = {
  trial: "rgba(245,158,11,0.08)",
  starter: "rgba(29,158,117,0.10)",
  pro: "rgba(59,130,246,0.1)",
  enterprise: "rgba(139,92,246,0.1)",
}

export function DmcSidebar({ companyName = "DMC Company", subscriptionPlan = "trial" }: DmcSidebarProps) {
  const pathname = usePathname()
  const { language, t } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const [bangkokTime, setBangkokTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      setBangkokTime(new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }))
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
      style={{ position: "fixed", left: 0, top: 0, height: "100vh", background: "var(--bg-surface,#111)", borderRight: "1px solid var(--border,#242)", display: "flex", flexDirection: "column", zIndex: 50, overflow: "hidden" }}
    >
      {/* Logo */}
      <div style={{ height: 64, borderBottom: "1px solid var(--border,#242)", display: "flex", alignItems: "center", padding: "0 12px", position: "relative", minWidth: 0 }}>
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ width: 32, height: 32, borderRadius: 8, background: "var(--teal,#1D9E75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-brand,Monoton,cursive)", color: "white", fontSize: 13 }}>R</span>
            </motion.div>
          ) : (
            <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-brand,Monoton,cursive)", color: "var(--teal,#1D9E75)", fontSize: 15, letterSpacing: 3 }}>RIDEN</div>
              <div style={{ fontFamily: "var(--font-mono,monospace)", fontSize: 9, color: "var(--teal,#1D9E75)", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>DMC PORTAL</div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border,#242)" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1,#f0f0f0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{companyName}</div>
                <span style={{ display: "inline-block", marginTop: 3, padding: "1px 8px", borderRadius: 99, fontFamily: "var(--font-mono,monospace)", fontSize: 10, textTransform: "uppercase", background: planColors[subscriptionPlan] || planColors.trial, color: subscriptionPlan === "trial" ? "var(--amber,#f59e0b)" : "var(--teal,#1D9E75)" }}>
                  {subscriptionPlan}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", background: "var(--bg-surface,#111)", border: "1px solid var(--border,#242)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
          {collapsed ? <ChevronRight size={12} color="var(--text-2,#999)" /> : <ChevronLeft size={12} color="var(--text-2,#999)" />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px", overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, marginBottom: 2, textDecoration: "none", fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? "var(--teal,#1D9E75)" : "var(--text-2,#999)", background: isActive ? "var(--teal-10,rgba(29,158,117,0.1))" : "transparent", borderLeft: isActive ? "2px solid var(--teal,#1D9E75)" : "2px solid transparent", transition: "all 150ms", position: "relative" }}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}
                    style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
                    {item.label[language]}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && item.badge > 0 && (
                <span style={{ position: "absolute", right: 8, width: 16, height: 16, borderRadius: "50%", background: "var(--amber,#f59e0b)", color: "white", fontSize: 10, fontFamily: "var(--font-mono,monospace)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid var(--border,#242)", padding: 12 }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--font-mono,monospace)", fontSize: 9, color: "var(--text-3,#555)", textTransform: "uppercase", letterSpacing: 1 }}>BANGKOK</div>
              <div style={{ fontFamily: "var(--font-mono,monospace)", fontSize: 12, color: "var(--teal,#1D9E75)" }}>{bangkokTime}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, background: "none", border: "none", color: "var(--text-2,#999)", cursor: "pointer", fontSize: 13, transition: "color 150ms" }}
          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-2,#999)"}>
          <LogOut size={15} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
                {t({ en: "Sign Out", th: "ออกจากระบบ", zh: "退出" })}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
