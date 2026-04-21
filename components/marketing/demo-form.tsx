"use client"

import { useState } from "react"

type Status = "idle" | "sending" | "success" | "error"

export function DemoForm({ kind = "demo", title, subtitle, compact = false }: {
  kind?: "demo" | "contact" | "enterprise" | "operator" | "driver"
  title?: string
  subtitle?: string
  compact?: boolean
}) {
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("sending")
    setMessage("")
    const formData = new FormData(e.currentTarget)
    const body: Record<string, string> = { kind }
    formData.forEach((v, k) => { if (typeof v === "string") body[k] = v })

    try {
      const res = await fetch("/api/marketing-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok && json.ok) {
        setStatus("success")
        setMessage("Thanks — we'll be in touch within 24h.")
        e.currentTarget.reset()
      } else {
        setStatus("error")
        setMessage(json.error || "Something went wrong. Email hello@riden.me")
      }
    } catch {
      setStatus("error")
      setMessage("Network error. Email hello@riden.me")
    }
  }

  return (
    <div className={compact ? "" : "max-w-xl mx-auto"}>
      {title && (
        <div className="mb-8 text-center">
          <div className="font-mono text-[11px] tracking-[0.2em] text-primary mb-3">● {kind.toUpperCase()}</div>
          <h2 className="font-display text-[36px] md:text-[44px] leading-[1.05] tracking-[-0.02em] font-semibold">
            {title}
          </h2>
          {subtitle && <p className="mt-4 text-white/60 text-[16px] max-w-md mx-auto">{subtitle}</p>}
        </div>
      )}
      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name" required placeholder="Your name *" className={inputCls} />
          <input name="email" required type="email" placeholder="Email *" className={inputCls} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="company" placeholder="Company" className={inputCls} />
          <input name="country" placeholder="Country" className={inputCls} />
        </div>
        <input name="phone" placeholder="Phone (optional)" className={inputCls} />
        <textarea name="message" placeholder="What would you like to see?" rows={3} className={inputCls + " resize-y"} />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-11 bg-primary text-white font-display font-semibold tracking-tight rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-1"
        >
          {status === "sending" ? "Sending..." : <>Request demo <span>↗</span></>}
        </button>
        {message && (
          <div className={`text-center text-[12px] font-mono ${status === "success" ? "text-[#2ee5a0]" : "text-[#ff6b6b]"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

// 16px font-size on inputs prevents iOS Safari from zooming on focus; min-h 44px is touch-target minimum.
const inputCls = "bg-white/[0.04] border border-white/10 rounded-md px-3.5 py-3 text-[16px] min-h-[44px] text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors"
