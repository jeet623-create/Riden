import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// LINE rich menu LARGE: 2500 x 1686
const W = 2500
const H = 1686
const HEADER_H = 260

const BRAND = "#1D9E75"
const BRAND_BRIGHT = "#38D29E"
const BRAND_DEEP = "#0B3A2A"
const BG = "#0A0B0E"
const BG_2 = "#111318"
const TILE = "#162A22"
const WHITE = "#FFFFFF"
const MUTED = "#9CA3AF"

type IconKind = "target" | "clipboard" | "clock" | "pin" | "question" | "money" | "car" | "check" | "flag"

type Zone = {
  icon: IconKind
  label: string
  labelTh: string
  sub: string
  subTh: string
  num: number
  accent: string
  highlight?: boolean
}

const MENUS: Record<string, Zone[]> = {
  idle: [
    { icon: "target",    label: "CURRENT",  labelTh: "งานปัจจุบัน", sub: "Live trip now",  subTh: "งานที่กำลังทำ",  num: 1, accent: "#38D29E", highlight: true },
    { icon: "clipboard", label: "JOBS",     labelTh: "งานวันนี้",    sub: "All today",      subTh: "ดูทั้งหมด",       num: 2, accent: "#3B82F6" },
    { icon: "clock",     label: "NEXT",     labelTh: "งานถัดไป",     sub: "Upcoming",       subTh: "ที่จะมาถึง",      num: 3, accent: "#F59E0B" },
    { icon: "pin",       label: "STATUS",   labelTh: "สถานะ",         sub: "On / off",       subTh: "พร้อม/ไม่ว่าง",   num: 4, accent: "#A855F7" },
    { icon: "question",  label: "HELP",     labelTh: "ช่วยเหลือ",     sub: "Contact team",   subTh: "ติดต่อทีม",       num: 5, accent: "#EF4444" },
  ],
  operator: [
    { icon: "clipboard", label: "TODAY",    labelTh: "งานวันนี้",    sub: "Active jobs",    subTh: "งานที่กำลังดำเนินการ", num: 1, accent: "#38D29E", highlight: true },
    { icon: "clock",     label: "UPCOMING", labelTh: "งานล่วงหน้า",  sub: "Scheduled",      subTh: "ที่จะมาถึง",           num: 2, accent: "#F59E0B" },
    { icon: "money",     label: "PAY",      labelTh: "ค้างรับเงิน",  sub: "Pending",        subTh: "รอรับชำระ",            num: 3, accent: "#3B82F6" },
    { icon: "question",  label: "HELP",     labelTh: "ช่วยเหลือ",    sub: "Support",        subTh: "ติดต่อทีม",            num: 4, accent: "#EF4444" },
  ],
  active: [
    { icon: "car",   label: "PICKED UP", labelTh: "รับแล้ว",  sub: "Passenger in",   subTh: "ผู้โดยสารอยู่ในรถ", num: 1, accent: "#38D29E", highlight: true },
    { icon: "check", label: "ARRIVED",   labelTh: "ถึงแล้ว",  sub: "At drop point",  subTh: "ถึงจุดส่งแล้ว",       num: 2, accent: "#3B82F6" },
    { icon: "flag",  label: "DONE",      labelTh: "ปิดงาน",   sub: "End trip",       subTh: "จบการเดินทาง",        num: 3, accent: "#F59E0B" },
  ],
}

function Icon({ kind, size = 360, color = WHITE }: { kind: IconKind; size?: number; color?: string }) {
  const stroke = Math.round(size / 18)
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    fill: "none",
    stroke: color,
    strokeWidth: (stroke / size) * 50,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  switch (kind) {
    case "target":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="38" />
          <circle cx="50" cy="50" r="24" />
          <circle cx="50" cy="50" r="9" fill={color} />
        </svg>
      )
    case "clipboard":
      return (
        <svg {...common}>
          <rect x="22" y="20" width="56" height="66" rx="6" />
          <rect x="38" y="14" width="24" height="12" rx="3" fill={color} />
          <line x1="34" y1="42" x2="66" y2="42" />
          <line x1="34" y1="55" x2="66" y2="55" />
          <line x1="34" y1="68" x2="58" y2="68" />
        </svg>
      )
    case "clock":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="36" />
          <polyline points="50,26 50,50 68,50" />
        </svg>
      )
    case "pin":
      return (
        <svg {...common}>
          <path d="M50 14 C33 14 22 27 22 42 C22 64 50 92 50 92 C50 92 78 64 78 42 C78 27 67 14 50 14 Z" />
          <circle cx="50" cy="42" r="9" fill={color} />
        </svg>
      )
    case "question":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="36" />
          <path d="M40 42 C40 33 47 28 52 28 C58 28 64 34 64 41 C64 49 54 51 51 56 C49 58 49 62 49 64" />
          <circle cx="50" cy="76" r="3.5" fill={color} />
        </svg>
      )
    case "money":
      return (
        <svg {...common}>
          <rect x="14" y="28" width="72" height="44" rx="5" />
          <circle cx="50" cy="50" r="13" />
          <line x1="50" y1="38" x2="50" y2="62" />
          <line x1="40" y1="50" x2="60" y2="50" />
          <circle cx="24" cy="50" r="2" fill={color} />
          <circle cx="76" cy="50" r="2" fill={color} />
        </svg>
      )
    case "car":
      return (
        <svg {...common}>
          <path d="M14 60 L18 42 C20 36 27 30 34 30 L66 30 C73 30 80 36 82 42 L86 60 Z" />
          <rect x="10" y="60" width="80" height="14" rx="3" />
          <circle cx="26" cy="80" r="7" fill={color} />
          <circle cx="74" cy="80" r="7" fill={color} />
        </svg>
      )
    case "check":
      return (
        <svg {...common}>
          <circle cx="50" cy="50" r="38" />
          <polyline points="34,52 46,64 68,40" />
        </svg>
      )
    case "flag":
      return (
        <svg {...common}>
          <line x1="26" y1="12" x2="26" y2="88" />
          <path d="M26 18 L74 18 L68 34 L74 50 L26 50 Z" fill={color} stroke="none" />
        </svg>
      )
  }
}

async function loadGoogleFont(cssUrl: string): Promise<ArrayBuffer> {
  const cssRes = await fetch(cssUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store",
  })
  if (!cssRes.ok) throw new Error(`Failed CSS ${cssUrl}: ${cssRes.status}`)
  const css = await cssRes.text()
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/)
  if (!match) throw new Error("No TTF url in CSS: " + css.slice(0, 200))
  const ttfRes = await fetch(match[1], { cache: "no-store" })
  if (!ttfRes.ok) throw new Error(`Failed TTF: ${ttfRes.status}`)
  return ttfRes.arrayBuffer()
}

const loadThai = () =>
  loadGoogleFont("https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@800&display=swap")
const loadEn = () =>
  loadGoogleFont("https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap")

export async function GET(_req: NextRequest, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params
  const zones = MENUS[variant] ?? MENUS.idle
  const columns = zones.length

  const [thaiFont, enFont] = await Promise.all([loadThai(), loadEn()])

  const tagline =
    variant === "operator" ? "ศูนย์ควบคุมผู้ประกอบการ · OPERATOR HUB"
    : variant === "active" ? "กำลังดำเนินการ · LIVE TRIP CONTROL"
    : "ไรเดน คนขับ · DRIVER DASHBOARD"

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: BG,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, NotoSansThai",
        }}
      >
        {/* HERO HEADER */}
        <div
          style={{
            width: "100%",
            height: HEADER_H,
            display: "flex",
            alignItems: "center",
            padding: "0 72px",
            background: `linear-gradient(90deg, #0E3D2B 0%, #0A1D15 70%, ${BG} 100%)`,
            borderBottom: `4px solid ${BRAND_DEEP}`,
            position: "relative",
          }}
        >
          {/* Brand block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontFamily: "Inter",
                fontSize: 130,
                fontWeight: 900,
                color: BRAND_BRIGHT,
                letterSpacing: 12,
                lineHeight: 1,
              }}
            >
              RIDEN
            </div>
            <div
              style={{
                fontFamily: "NotoSansThai",
                fontSize: 36,
                color: MUTED,
                letterSpacing: 4,
                lineHeight: 1,
              }}
            >
              {tagline}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Status pills on right */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: BRAND_DEEP,
                padding: "14px 30px",
                borderRadius: 100,
                border: `2px solid ${BRAND_BRIGHT}`,
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 18, background: BRAND_BRIGHT, display: "flex" }} />
              <div
                style={{
                  fontFamily: "Inter",
                  fontSize: 32,
                  fontWeight: 900,
                  color: BRAND_BRIGHT,
                  letterSpacing: 3,
                  lineHeight: 1,
                }}
              >
                LIVE
              </div>
            </div>
            <div
              style={{
                fontFamily: "NotoSansThai",
                fontSize: 28,
                color: MUTED,
                letterSpacing: 2,
                lineHeight: 1,
              }}
            >
              ตลอด 24 ชั่วโมง · 24/7
            </div>
          </div>
        </div>

        {/* ZONES */}
        <div style={{ flex: 1, display: "flex", background: BG }}>
          {zones.map((z, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "70px 30px 70px 30px",
                background: z.highlight
                  ? `linear-gradient(180deg, #0F3D2B 0%, #08201A 100%)`
                  : `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
                borderRight: i < columns - 1 ? `2px solid #1C2028` : "none",
                position: "relative",
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  width: "80%",
                  height: 8,
                  background: z.accent,
                  display: "flex",
                }}
              />

              {/* Number badge */}
              <div style={{ position: "absolute", top: 40, right: 40, display: "flex" }}>
                <div
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: 78,
                    background: z.highlight ? z.accent : BRAND_DEEP,
                    color: z.highlight ? BG : z.accent,
                    fontFamily: "Inter",
                    fontSize: 44,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `3px solid ${z.accent}`,
                  }}
                >
                  {z.num}
                </div>
              </div>

              {/* Icon tile */}
              <div
                style={{
                  width: 500,
                  height: 500,
                  borderRadius: 48,
                  background: z.highlight ? `#0E3D2B` : TILE,
                  border: `4px solid ${z.highlight ? z.accent : BRAND_DEEP}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 80,
                  boxShadow: z.highlight
                    ? `0 0 140px rgba(56, 210, 158, 0.5)`
                    : `0 0 40px rgba(29, 158, 117, 0.15)`,
                }}
              >
                <Icon kind={z.icon} size={340} color={z.highlight ? WHITE : "#DDEEE7"} />
              </div>

              {/* Labels block */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: "NotoSansThai",
                    fontSize: 92,
                    fontWeight: 800,
                    color: z.highlight ? WHITE : z.accent,
                    letterSpacing: 0,
                    lineHeight: 1,
                  }}
                >
                  {z.labelTh}
                </div>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontSize: 42,
                    fontWeight: 900,
                    color: z.highlight ? z.accent : MUTED,
                    letterSpacing: 7,
                    lineHeight: 1,
                  }}
                >
                  {z.label}
                </div>
                <div
                  style={{
                    width: 140,
                    height: 5,
                    background: z.accent,
                    borderRadius: 5,
                    marginTop: 8,
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    fontFamily: "NotoSansThai",
                    fontSize: 34,
                    color: z.highlight ? "#A7F3D0" : MUTED,
                    letterSpacing: 1,
                    lineHeight: 1,
                    marginTop: 10,
                  }}
                >
                  {z.subTh}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "NotoSansThai", data: thaiFont, weight: 800, style: "normal" },
        { name: "Inter", data: enFont, weight: 900, style: "normal" },
      ],
    }
  )
}
