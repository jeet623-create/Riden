"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useLanguage, Language } from "@/hooks/use-language"
import { createClient } from "@/lib/supabase/client"

type NotificationKind = "booking" | "trip" | "payment" | "subscription" | "system"

type StoredNotification = {
  id: string
  dmc_id: string
  kind: NotificationKind
  title: string
  body: string | null
  href: string | null
  is_read: boolean
  created_at: string
}

type DisplayNotification = {
  id: string
  kind: NotificationKind
  title: string
  body: string | null
  href: string | null
  is_read: boolean
  created_at: string
  synthetic?: boolean
}

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "th", label: "ไทย" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국" },
  { code: "tr", label: "TR" },
]

export function DmcTopbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [stored, setStored] = useState<StoredNotification[]>([])
  const [dmcId, setDmcId] = useState<string | null>(null)
  const [initials, setInitials] = useState<string>("—")
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [trialNotifDismissed, setTrialNotifDismissed] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Load current user's DMC profile + notifications
  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      setDmcId(user.id)

      const [{ data: profile }, { data: notifs }] = await Promise.all([
        supabase
          .from("dmc_users")
          .select("company_name, contact_person, trial_ends_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("dmc_notifications")
          .select("id, dmc_id, kind, title, body, href, is_read, created_at")
          .eq("dmc_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ])

      if (cancelled) return
      if (profile) {
        setInitials(buildInitials(profile.contact_person ?? profile.company_name ?? user.email))
        setTrialEndsAt(profile.trial_ends_at ?? null)
      }
      if (notifs) setStored(notifs as StoredNotification[])
    })()

    return () => { cancelled = true }
  }, [])

  // Subscribe to new inserts so the bell reacts in real time
  useEffect(() => {
    if (!dmcId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`dmc-notifications:${dmcId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dmc_notifications", filter: `dmc_id=eq.${dmcId}` },
        (payload) => setStored((prev) => [payload.new as StoredNotification, ...prev].slice(0, 20)),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [dmcId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Synthesize a "trial ending soon" notification when trial_ends_at is ≤ 14 days
  // out. Not stored in the DB — recomputed every render. Dismissing only lasts
  // until page reload; acceptable for a soft nudge.
  const trialNotif: DisplayNotification | null = useMemo(() => {
    if (!trialEndsAt || trialNotifDismissed) return null
    const msLeft = new Date(trialEndsAt).getTime() - Date.now()
    if (!Number.isFinite(msLeft) || msLeft <= 0) return null
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
    if (daysLeft > 14) return null
    return {
      id: "trial-ending",
      kind: "system",
      title: `Your trial ends in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`,
      body: "Activate a plan to keep everything running.",
      href: "/dmc/payments",
      is_read: false,
      created_at: new Date().toISOString(),
      synthetic: true,
    }
  }, [trialEndsAt, trialNotifDismissed])

  const notifications = useMemo<DisplayNotification[]>(
    () => (trialNotif ? [trialNotif, ...stored] : stored),
    [trialNotif, stored],
  )

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAllRead = useCallback(async () => {
    if (!dmcId) return
    const storedUnread = stored.filter((n) => !n.is_read).map((n) => n.id)
    setStored((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setTrialNotifDismissed(true)
    if (storedUnread.length > 0) {
      const supabase = createClient()
      await supabase
        .from("dmc_notifications")
        .update({ is_read: true })
        .in("id", storedUnread)
    }
  }, [dmcId, stored])

  const markOneRead = useCallback(async (n: DisplayNotification) => {
    if (n.synthetic) {
      setTrialNotifDismissed(true)
      return
    }
    if (n.is_read) return
    setStored((prev) => prev.map((row) => (row.id === n.id ? { ...row, is_read: true } : row)))
    const supabase = createClient()
    await supabase.from("dmc_notifications").update({ is_read: true }).eq("id", n.id)
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
          <button onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors relative">
            <Bell className="w-4 h-4 text-muted" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary rounded-full flex items-center justify-center">
                <span className="font-mono text-[9px] text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
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
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <div className="font-display italic text-foreground text-[14px]">You're all caught up.</div>
                      <div className="text-[11px] text-muted mt-1">New bookings and trip updates show up here.</div>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const content = (
                        <div className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors cursor-pointer ${!notif.is_read ? "bg-primary-dim/30" : ""}`}>
                          <div className="flex items-start gap-3">
                            {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                            <div className={notif.is_read ? "pl-5 flex-1 min-w-0" : "flex-1 min-w-0"}>
                              <p className="text-sm text-foreground truncate">{notif.title}</p>
                              {notif.body && <p className="text-[12px] text-muted truncate">{notif.body}</p>}
                              <span className="text-xs text-muted font-mono">{timeAgo(notif.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      )
                      return notif.href ? (
                        <Link key={notif.id} href={notif.href} onClick={() => { markOneRead(notif); setShowNotifications(false) }}>
                          {content}
                        </Link>
                      ) : (
                        <div key={notif.id} onClick={() => markOneRead(notif)}>{content}</div>
                      )
                    })
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-border bg-background">
                    <span className="block w-full text-center text-xs text-muted">Showing last {notifications.length}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors">
          {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-muted" /> : <Moon className="w-4 h-4 text-muted" />}
        </button>

        <div className="w-7 h-7 rounded-full bg-primary-dim flex items-center justify-center">
          <span className="font-mono text-[11px] text-primary font-medium">{initials}</span>
        </div>
      </div>
    </header>
  )
}

function buildInitials(source: string | null | undefined): string {
  if (!source) return "—"
  const cleaned = source.trim()
  if (!cleaned) return "—"
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff) || diff < 0) return "just now"
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`
  return new Date(iso).toLocaleDateString()
}
