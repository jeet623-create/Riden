"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Truck,
  UserCheck,
  ClipboardList,
  CreditCard,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Wordmark } from "@/components/brand/Wordmark"
import { Monogram } from "@/components/brand/Monogram"

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/dmcs", icon: Users, label: "DMCs" },
  { href: "/admin/operators", icon: Truck, label: "Operators" },
  { href: "/admin/drivers", icon: UserCheck, label: "Drivers" },
  { href: "/admin/bookings", icon: ClipboardList, label: "Bookings" },
  { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/admin/support", icon: LifeBuoy, label: "Support" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [bangkokTime, setBangkokTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const time = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      setBangkokTime(time)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0"
    >
      <div className="h-14 px-4 flex items-center justify-between border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-baseline gap-2 text-foreground">
              <Wordmark size="sm" />
              <span className="font-mono text-[9px] text-muted uppercase tracking-[0.15em]">ADMIN</span>
            </motion.div>
          ) : (
            <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-foreground">
              <Monogram size="sm" variant="solid" />
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-elevated">
          {collapsed ? <ChevronRight className="w-4 h-4 text-muted" /> : <ChevronLeft className="w-4 h-4 text-muted" />}
        </button>
      </div>
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link href={item.href} key={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 ${isActive ? "bg-primary-dim text-primary" : "text-muted hover:bg-surface-elevated hover:text-foreground"}`}>
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-primary" : ""}`} strokeWidth={1.75} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-[13px] font-medium whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3">
              <p className="font-mono text-[10px] text-muted uppercase tracking-[0.15em] mb-0.5">‹ Bangkok</p>
              <p className="font-mono text-xs text-foreground">{bangkokTime} ICT</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Link href="/admin/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:bg-surface-elevated hover:text-foreground">
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px]">
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  )
}
