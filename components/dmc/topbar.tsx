"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage, Language } from "@/hooks/use-language"

const mockNotifications = [
  { id: "1", type: "booking", message: "New booking #BK-0048 created", time: "2 min ago", read: false },
  { id: "2", type: "trip", message: "Trip #T-0123 started - Driver en route", time: "15 min ago", read: false },
  { id: "3", type: "payment", message: "Payment received for invoice #INV-007", time: "1 hr ago", read: true },
  { id: "4", type: "system", message: "Your trial ends in 3 days", time: "2 hrs ago", read: true },
]

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "th", label: "TH" },
  { code: "zh", label: "中文" },
]

export function DmcTopbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="h-14 border-b border-border sticky top-0 z-40 bg-surface/80 backdrop-blur-sm">
      <div className="h-full px-4 flex items-center justify-end gap-3">
        <span className="font-mono text-[11px] text-muted hidden sm:block">dmc.riden.me</span>

        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${language === lang.code ? "bg-foreground text-background" : "bg-transparent text-muted hover:text-foreground border-r border-border last:border-r-0"}`}>
              {lang.label}
            </button>
          ))}
        </div>

        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors relative">
            <Bell className="w-4 h-4 text-muted" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <span className="font-mono text-[9px] text-white">{unreadCount}</span>
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-primary hover:underline">Mark all read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors cursor-pointer ${!notif.read ? "bg-primary-dim/30" : ""}`}>
                      <div className="flex items-start gap-3">
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                        <div className={!notif.read ? "" : "pl-5"}>
                          <p className="text-sm text-foreground">{notif.message}</p>
                          <span className="text-xs text-muted font-mono">{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-border bg-background">
                  <button className="w-full text-center text-xs text-primary hover:underline">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors">
          {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-muted" /> : <Moon className="w-4 h-4 text-muted" />}
        </button>

        <div className="w-7 h-7 rounded-full bg-primary-dim flex items-center justify-center">
          <span className="font-mono text-[11px] text-primary font-medium">ST</span>
        </div>
      </div>
    </header>
  )
}