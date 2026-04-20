"use client"

import * as React from "react"

export function Panel({
  title, eyebrow, icon, accent, danger, actions, className = "", children,
}: {
  title?: string
  eyebrow?: string
  icon?: React.ReactNode
  accent?: boolean
  danger?: boolean
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={`bg-surface rounded-lg border ${danger ? "border-[color:var(--danger)]/30" : "border-border"} ${className}`}>
      {(title || eyebrow || actions) && (
        <header className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex items-center gap-1.5">
            {(title || eyebrow) && (
              <span className={`font-mono text-[10px] uppercase tracking-wider ${accent ? "text-primary" : "text-muted"}`}>
                {title ?? eyebrow}
              </span>
            )}
            {icon && <span className={accent ? "text-primary" : "text-muted"}>{icon}</span>}
          </div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className="px-4 py-3 text-[13px]">{children}</div>
    </section>
  )
}

export function KeyHint({ k, label }: { k: string; label: string }) {
  return (
    <div className="hidden md:flex items-center gap-1 text-[11px] text-muted">
      <kbd className="px-1.5 h-5 rounded bg-surface border border-border font-mono text-[10px] text-foreground inline-flex items-center">{k}</kbd>
      <span>{label}</span>
    </div>
  )
}

export function Skel({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-5 bg-surface-elevated rounded animate-pulse" />
      ))}
    </div>
  )
}

export function EmptyRow({ text }: { text: string }) {
  return <div className="text-[12px] text-muted italic py-3 font-display">{text}</div>
}

export function FilterTabs<T extends string>({
  tabs, active, onChange,
}: {
  tabs: { value: T; label: string; count?: number }[]
  active: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {tabs.map(t => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-2.5 h-7 rounded-md text-[12px] whitespace-nowrap transition-colors inline-flex items-center gap-1.5
            ${active === t.value
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-primary/30"}`}
        >
          {t.label}
          {t.count != null && <span className={`font-mono text-[10px] ${active === t.value ? "text-primary" : "text-muted"}`}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Toggle({
  on, onClick, disabled, labelOn = "on", labelOff = "off",
}: {
  on: boolean
  onClick: () => void
  disabled?: boolean
  labelOn?: string
  labelOff?: string
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 h-6 px-2 rounded text-[11px] font-mono transition-colors disabled:opacity-50
        ${on
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-surface-elevated text-muted hover:text-foreground"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-primary" : "bg-muted"}`} />
      {on ? labelOn : labelOff}
    </button>
  )
}

export function PillBadge({
  children, tone = "muted",
}: {
  children: React.ReactNode
  tone?: "muted" | "primary" | "warning" | "danger" | "info"
}) {
  const styles =
    tone === "primary" ? "bg-primary/10 text-primary" :
    tone === "warning" ? "bg-[color:var(--warning-dim)] text-[color:var(--warning)]" :
    tone === "danger" ? "bg-[color:var(--danger-dim)] text-[color:var(--danger)]" :
    tone === "info" ? "bg-[color:var(--info-dim)] text-[color:var(--info)]" :
    "bg-surface-elevated text-muted"
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 h-5 rounded font-mono text-[10px] uppercase tracking-wider ${styles}`}>
      {children}
    </span>
  )
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  const now = Date.now()
  const diffS = Math.floor((now - d.getTime()) / 1000)
  if (diffS < 0) {
    const futS = -diffS
    if (futS < 3600) return `in ${Math.floor(futS / 60)}m`
    if (futS < 86400) return `in ${Math.floor(futS / 3600)}h`
    return `in ${Math.floor(futS / 86400)}d`
  }
  if (diffS < 60) return `${diffS}s`
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m`
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h`
  return `${Math.floor(diffS / 86400)}d`
}

export function fmtDateStamp(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null
  const d = new Date(iso).getTime()
  const now = Date.now()
  return Math.floor((d - now) / 86400000)
}
