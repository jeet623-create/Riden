"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Calendar, Car, Check, Copy, ExternalLink, Hash, Link2, Loader2, MapPin,
  MessageCircle, Phone, Share2, User,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

type Lang = "en" | "th" | "zh" | "ko"

const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  th: "ไทย",
  zh: "中文",
  ko: "한국",
}

type CardResponse = {
  ok?: boolean
  ready?: boolean
  error?: string
  tripId?: string
  photoUrl?: string | null
  text?: string
  texts?: Partial<Record<Lang, string>>
  driver?: { name?: string | null; phone?: string | null; profilePhoto?: string | null } | null
  vehicle?: { plate?: string | null; model?: string | null; color?: string | null; type?: string | null; photoUrl?: string | null } | null
  trip?: { date?: string | null; pickup_time?: string | null; pickup_location?: string | null; dropoff_location?: string | null; status?: string | null } | null
  booking?: { client_name?: string | null; mobile?: string | null } | null
  whatsappShareUrl?: string | null
}

function buildCardUrl(tripId: string, lang: Lang): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  return `${base}/functions/v1/forward-customer-card?trip=${encodeURIComponent(tripId)}&lang=${lang}`
}

export function ShareDriverCard({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<Lang>("en")
  const [data, setData] = useState<CardResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const url = useMemo(() => buildCardUrl(tripId, lang), [tripId, lang])

  const load = useCallback(
    async (chosenLang: Lang) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(buildCardUrl(tripId, chosenLang), { cache: "no-store" })
        const json: CardResponse = await res.json()
        if (!res.ok || json.error) {
          throw new Error(json.error ?? `HTTP ${res.status}`)
        }
        if (json.ready === false) {
          setData(null)
          setError("Driver isn't assigned yet. Come back after dispatch.")
          return
        }
        setData(json)
      } catch (e: any) {
        setError(e?.message ?? "Failed to load card")
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [tripId]
  )

  // Fetch whenever modal opens or lang changes
  useEffect(() => {
    if (open) load(lang)
  }, [open, lang, load])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied")
    } catch {
      toast.error("Clipboard not available")
    }
  }

  async function copyText() {
    if (!data?.text) return
    try {
      await navigator.clipboard.writeText(data.text)
      toast.success("Text copied — paste into WhatsApp / Viber / LINE")
    } catch {
      toast.error("Clipboard not available")
    }
  }

  async function nativeShare() {
    const payload: ShareData = {
      title: "Driver details",
      text: data?.text ?? "",
    }
    if (data?.photoUrl) payload.url = data.photoUrl
    if (navigator.share) {
      try { await navigator.share(payload) } catch { /* user cancelled */ }
    } else {
      copyText()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Share2 className="w-3.5 h-3.5" /> Share with customer
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Share driver card</DialogTitle>
        </DialogHeader>

        {/* Language tabs */}
        <div className="flex items-center gap-1.5">
          {(Object.keys(LANG_LABELS) as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors border ${
                lang === l
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-background text-muted border-border hover:text-foreground hover:border-primary/30"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
          <button
            onClick={() => load(lang)}
            disabled={loading}
            className="ml-auto h-8 px-3 rounded-md text-xs text-muted hover:text-foreground inline-flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          {loading && !data && (
            <div className="p-10 flex items-center justify-center text-muted text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading card…
            </div>
          )}
          {error && !loading && (
            <div className="p-6 text-sm text-amber-300">{error}</div>
          )}
          {data?.ready && (
            <PreviewCard data={data} lang={lang} />
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            variant="secondary"
            onClick={copyText}
            disabled={!data?.text}
            className="gap-1.5"
          >
            <Copy className="w-4 h-4" /> Copy text
          </Button>
          <Button
            variant="secondary"
            onClick={copyLink}
            className="gap-1.5"
          >
            <Link2 className="w-4 h-4" /> Copy link
          </Button>
          <Button
            variant="secondary"
            asChild
            className="gap-1.5"
          >
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4" /> Open
            </a>
          </Button>
          {data?.whatsappShareUrl ? (
            <Button asChild className="gap-1.5 bg-[#25D366] hover:bg-[#22c55e] text-black">
              <a href={data.whatsappShareUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </Button>
          ) : (
            <Button
              onClick={nativeShare}
              disabled={!data?.text}
              className="gap-1.5"
            >
              <Share2 className="w-4 h-4" /> Share
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PreviewCard({ data, lang }: { data: CardResponse; lang: Lang }) {
  const text = data.texts?.[lang] ?? data.text ?? ""
  return (
    <div className="divide-y divide-border">
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt="Vehicle"
          className="w-full max-h-56 object-cover"
        />
      )}

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Row icon={<User className="w-3.5 h-3.5" />} label="Driver">
          {data.driver?.name ?? "—"}
        </Row>
        <Row icon={<Phone className="w-3.5 h-3.5" />} label="Phone">
          {data.driver?.phone ? (
            <a href={`tel:${data.driver.phone}`} className="text-primary hover:underline">{data.driver.phone}</a>
          ) : "—"}
        </Row>
        <Row icon={<Car className="w-3.5 h-3.5" />} label="Vehicle">
          {[data.vehicle?.model, data.vehicle?.color].filter(Boolean).join(" · ") || "—"}
        </Row>
        <Row icon={<Hash className="w-3.5 h-3.5" />} label="Plate">
          <span className="font-mono">{data.vehicle?.plate ?? "—"}</span>
        </Row>
        <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Pickup">
          {formatDate(data.trip?.date, lang)}{data.trip?.pickup_time ? ` · ${data.trip.pickup_time.slice(0,5)}` : ""}
        </Row>
        <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Location">
          {data.trip?.pickup_location ?? "—"}
        </Row>
      </div>

      <pre className="p-4 text-[13px] leading-relaxed whitespace-pre-wrap font-sans text-foreground bg-background">
        {text}
      </pre>
    </div>
  )
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted mt-0.5">{icon}</span>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted">{label}</div>
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  )
}

function formatDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return "—"
  try {
    const locale = lang === "th" ? "th-TH" : lang === "zh" ? "zh-CN" : lang === "ko" ? "ko-KR" : "en-GB"
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return iso
  }
}
