"use client"

import { useState } from "react"
import { Copy, Share2, MessageCircle, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type Lang = "en" | "th" | "zh" | "ko"
const LANGS: Lang[] = ["en", "th", "zh", "ko"]

type CardResponse = {
  photoUrl?: string
  texts?: Partial<Record<Lang, string>>
  whatsappShareUrl?: string
  error?: string
}

export function ForwardCardButton({ tripId }: { tripId: string }) {
  const [card, setCard] = useState<CardResponse | null>(null)
  const [lang, setLang] = useState<Lang>("en")
  const [loading, setLoading] = useState(false)

  async function loadCard() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke<CardResponse>(
        "forward-customer-card",
        { body: { trip: tripId, lang } }
      )
      if (error) throw new Error(error.message)
      if (!data || data.error) throw new Error(data?.error ?? "No response")
      setCard(data)
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load card")
    } finally {
      setLoading(false)
    }
  }

  async function shareNatively() {
    if (!card?.texts?.[lang]) return
    const payload: ShareData = {
      title: "Driver details",
      text: card.texts[lang]!,
    }
    if (card.photoUrl) payload.url = card.photoUrl
    if (navigator.share) {
      try {
        await navigator.share(payload)
      } catch {}
    } else {
      navigator.clipboard.writeText(card.texts[lang]!)
      toast.success("Copied — paste anywhere")
    }
  }

  function copyText() {
    if (!card?.texts?.[lang]) return
    navigator.clipboard.writeText(card.texts[lang]!)
    toast.success("Text copied")
  }

  const text = card?.texts?.[lang] ?? ""

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">CUSTOMER CARD</div>
          <div className="text-sm text-foreground font-medium">Forward driver details to tourist</div>
        </div>
        {!card && (
          <button
            onClick={loadCard}
            disabled={loading}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {loading ? "Loading…" : "Prepare card"}
          </button>
        )}
      </div>

      {card && (
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {LANGS.map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider transition-colors ${
                  lang === l
                    ? "bg-primary text-white"
                    : "bg-background border border-border text-muted hover:text-foreground"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
            <button
              onClick={loadCard}
              disabled={loading}
              className="ml-auto px-2.5 py-1 rounded-md text-[11px] text-muted hover:text-foreground"
            >
              {loading ? "…" : "Refresh"}
            </button>
          </div>

          {card.photoUrl && (
            <img
              src={card.photoUrl}
              alt="Vehicle"
              className="w-full rounded-lg border border-border object-cover max-h-56"
            />
          )}

          {text ? (
            <pre className="text-[13px] leading-relaxed whitespace-pre-wrap bg-background border border-border p-3 rounded-lg text-foreground font-sans">
              {text}
            </pre>
          ) : (
            <div className="text-xs text-muted italic">No text for {lang.toUpperCase()} yet.</div>
          )}

          <div className="flex gap-2">
            <button
              onClick={copyText}
              disabled={!text}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground hover:border-primary/40 disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            {card.whatsappShareUrl && (
              <a
                href={card.whatsappShareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-[#25D366] text-black text-sm font-medium hover:bg-[#22c55e]"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
            <button
              onClick={shareNatively}
              disabled={!text}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
