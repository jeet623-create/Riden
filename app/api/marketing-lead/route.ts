import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type LeadKind = "demo" | "contact" | "enterprise" | "operator" | "driver"

const ALLOWED_KINDS: LeadKind[] = ["demo", "contact", "enterprise", "operator", "driver"]

function sanitizeStr(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null
  const trimmed = v.trim().slice(0, max)
  return trimmed || null
}

function isValidEmail(e: string | null): boolean {
  if (!e) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name = sanitizeStr(body.name, 120)
    const email = sanitizeStr(body.email, 200)
    const phone = sanitizeStr(body.phone, 60)
    const company = sanitizeStr(body.company, 160)
    const country = sanitizeStr(body.country, 80)
    const message = sanitizeStr(body.message, 2000)
    const rawKind = sanitizeStr(body.kind, 40) as LeadKind | null
    const kind: LeadKind = rawKind && ALLOWED_KINDS.includes(rawKind) ? rawKind : "demo"

    const utm_source = sanitizeStr(body.utm_source, 80)
    const utm_medium = sanitizeStr(body.utm_medium, 80)
    const utm_campaign = sanitizeStr(body.utm_campaign, 80)

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    if (!isValidEmail(email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 })

    const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error } = await supabase.from("marketing_leads").insert({
      kind,
      name,
      email,
      phone,
      company,
      country,
      message,
      utm_source,
      utm_medium,
      utm_campaign,
      user_agent: userAgent,
      status: "new",
    })

    if (error) {
      return NextResponse.json({ error: "Could not save. Please email hello@riden.me instead." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
