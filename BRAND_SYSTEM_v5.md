# RIDEN Brand System v5 — LOCKED

**Reference:** Direction 09 "The Studio"
**Energy:** Awwwards / Pentagram / Collins — a design studio made this.
**Supersedes:** All prior brand notes. Monoton is OUT. Syne is the wordmark forever.

---

## 1. Wordmark

The primary brand expression. Always paired with the teal ↗ arrow.

- **Font:** `Syne` (Google Fonts)
- **Weight:** `700` (Bold)
- **Casing:** `Riden` — title case, not uppercase, not lowercase. The title-case form is deliberately asymmetric and quirky; it's core to the brand personality.
- **Letter-spacing:** `-0.02em` (tight, confident)
- **Color:** `currentColor` — adapts to light or dark background
- **Arrow:** 45° up-right ↗, color `#1D9E75` teal, stroke-width proportional to Syne's thinnest stroke (~7% of cap height), cap-height aligned to the top of "R", positioned ~8px right of the "n"

**Rules:**
- Wordmark and arrow are **one inseparable unit**. Never show wordmark without arrow.
- Never replace the arrow with a different color.
- Never scale the wordmark below 48px height — use monogram instead.
- Never apply effects (gradients, shadows, outlines) to the wordmark.

## 2. Monogram

For favicons, collapsed sidebars, mobile app icons, and any space < 60px width.

- **Standard monogram** (`riden-monogram.svg`): `R` in Syne 700 + teal ↗ arrow
- **Solid monogram** (`riden-monogram-solid.svg`): `R` in Syne 800 + thicker teal arrow — use when the standard version's strokes become too thin (< 24px)

Both variants use `currentColor` for the R and teal for the arrow.

## 3. Color System

### Studio palette — the hero colors

| Token | Hex | Usage |
|---|---|---|
| `--studio-ink` | `#0A0A0B` | Primary dark surface — deeper than pure black, carbon feel |
| `--studio-sand` | `#EDE6D7` | Matte warm neutral — editorial, calm, not cold |
| `--studio-teal` | `#1D9E75` | The accent. Used on the arrow, CTAs, active states, brand moments |
| `--studio-text-dark` | `#F5F4F0` | Text on ink — slightly warm white, not pure |
| `--studio-text-sand` | `#1A1A1C` | Text on sand — slightly warm black |
| `--studio-muted-dark` | `#6B6B70` | Muted UI text on ink (labels, metadata) |
| `--studio-muted-sand` | `#8E887A` | Muted UI text on sand |

### Functional colors (UI states)

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#22C55E` | Toast success, completed states, confirmed |
| `--warning` | `#F59E0B` | Trial banner, pending, open tickets |
| `--danger` | `#EF4444` | Error toasts, cancelled, suspended |
| `--panic` | `#DC2626` | Panic mode only (more saturated than danger) |
| `--info` | `#3B82F6` | In-progress, assigned |
| `--pool` | `#A78BFA` | Pool-sent status |

### Protected brand color (use narrowly)

| Token | Hex | Usage |
|---|---|---|
| `--line-green` | `#06C755` | **ONLY** for LINE-connect UI. Never for generic success. |

### Transparent variants (for backgrounds)

```css
--studio-teal-dim: rgba(29, 158, 117, 0.10);
--studio-teal-border: rgba(29, 158, 117, 0.20);
--success-dim: rgba(34, 197, 94, 0.10);
--warning-dim: rgba(245, 158, 11, 0.08);
--danger-dim: rgba(239, 68, 68, 0.08);
--panic-dim: rgba(220, 38, 38, 0.15);
--info-dim: rgba(59, 130, 246, 0.10);
--pool-dim: rgba(167, 139, 250, 0.10);
--line-green-dim: rgba(6, 199, 85, 0.06);
--line-green-border: rgba(6, 199, 85, 0.15);
```

---

## 4. Typography

**Five fonts. Each has exactly one job.**

| Font | Role | Weights loaded | Example usage |
|---|---|---|---|
| `Syne` | Wordmark + display | 600, 700 | The logo; large editorial headings ("The Studio", "Bookings overview") |
| `Inter Tight` | Body + UI | 400, 500, 600 | All body copy, buttons, form labels, navigation |
| `JetBrains Mono` | Data + labels | 400, 500 | Booking IDs, timestamps, uppercase metadata labels |
| `IBM Plex Sans Thai` | Thai fallback | 400, 500 | Thai UI text |
| `Noto Sans SC` | Chinese fallback | 400, 500 | Simplified Chinese UI text |

### Type scale

| Role | Font | Size / line-height | Tracking |
|---|---|---|---|
| Display XL (hero) | Syne 600 italic | 48 / 52 | -0.02em |
| Display L (page headers) | Syne 600 | 32 / 38 | -0.015em |
| Display M (section headers) | Syne 600 | 22 / 28 | -0.01em |
| Display S (card titles) | Inter Tight 600 | 16 / 22 | -0.005em |
| Body L | Inter Tight 400 | 15 / 24 | 0 |
| Body M (default UI) | Inter Tight 400 | 14 / 21 | 0 |
| Body S | Inter Tight 400 | 13 / 19 | 0 |
| Mono L (stat values) | JetBrains Mono 500 | 28 / 32 | -0.01em |
| Mono M (IDs, timestamps) | JetBrains Mono 400 | 13 / 18 | 0 |
| Mono S (labels uppercase) | JetBrains Mono 500 | 11 / 14 | +0.15em UPPERCASE |
| Mono XS (tiny chips) | JetBrains Mono 500 | 9 / 12 | +0.15em UPPERCASE |

### Typographic rules

- **Section labels:** mono, UPPERCASE, letter-spacing +0.15em, muted color, preceded by teal `‹` or `·` chevron when grouped
- **Divider between labels:** teal middle-dot `·` (U+00B7), NOT bullet (•)
- **Eyebrow pattern:** mono "DIRECTION 09" style + Syne italic heading below — use this for all major page headers
- **Editorial descriptions:** Syne italic, right-aligned, muted color (for brand-voice annotations)
- **Chevron prefix:** teal `‹` before metadata labels like "BANGKOK"
- **Never use uppercase on body copy** — only on mono labels

---

## 5. Spacing

Base grid: 4px.

`0.5→2px · 1→4px · 2→8px · 3→12px · 4→16px · 5→20px · 6→24px · 8→32px · 10→40px · 12→48px · 16→64px · 20→80px · 24→96px`

Common applications:
- Card padding: `p-5` (20px) or `p-6` (24px)
- Page gutter: `p-7` (28px) desktop, `p-4` (16px) mobile
- Table cells: `px-4 py-3` (16px / 12px)
- Stat card gaps: `gap-4` (16px)

---

## 6. Radius

| Token | Value | Usage |
|---|---|---|
| `--r-xs` | `4px` | Inline pills, tiny chips |
| `--r-sm` | `6px` | Inputs, small buttons |
| `--r-md` | `8px` | Standard buttons, small cards |
| `--r-lg` | `12px` | Cards, panels, banners |
| `--r-xl` | `16px` | Modals, hero cards |
| `--r-full` | `9999px` | Status pills, avatars |

**Panel grids** (the Direction 09 reference layout): no radius between panels. Hard edges create the editorial rhythm.

---

## 7. Motion

Motion is a feature, not decoration. Five tokens, each with a purpose.

| Purpose | Duration | Easing |
|---|---|---|
| Page fade-up on mount | 200ms | `ease-out` |
| Staggered children | 60ms per item | `ease-out` |
| Hover states (bg, border, color) | 120ms | `ease-out` |
| Focus ring | 80ms | `ease-out` |
| Sidebar collapse/expand | 280ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Modal enter/exit | 200ms fade + 180ms scale | `ease-out` |
| StatCard count-up | 900ms | `easeOutQuart` |
| Skeleton shimmer | 1.5s infinite | `ease-in-out` |
| Pulse (live dot, active) | 2s infinite | `ease-in-out` |
| Panic pulse (red) | 1s infinite | `ease-in-out` |

**Rules:**
- No spring physics on business data (only on the custom cursor)
- No animation longer than 300ms except: skeletons, pulses, sidebar, count-up
- Respect `prefers-reduced-motion: reduce` — fallback to instant transitions
- Custom cursor: stiffness 500 / damping 28 (inner), 300/25 (ring). Only on `(hover: hover) and (pointer: fine)` devices.

---

## 8. Layout philosophy

The Direction 09 reference shows the foundation: **modular grid panels with alternating ink / sand surfaces.** Adapt for product UI:

- **Dashboards** = ink primary with sand-tinted accent panels for emphasis
- **Empty states** = sand background with editorial Syne italic copy + teal CTA
- **Login / auth pages** = split panel: ink left (brand moment with wordmark), sand right (form)
- **Marketing/about pages** = full alternating grid like the reference image

**Panel rhythm:** when stacking multiple cards, alternate backgrounds every 2-3 cards to create the editorial cadence. Not every section — too much. Just enough to feel designed, not templated.

---

## 9. Iconography

- **Library:** `lucide-react` exclusively (already in deps)
- **Stroke width:** `1.75` default, `1.5` on hover
- **Size scale:** 12 (inline), 14 (mono label adjacent), 16 (button default), 18 (menu item), 20 (stat card), 24 (section header), 28 (hero/empty state)
- **Color:** `currentColor` always — let parent text color drive
- **No filled icons** — outline style only (matches Syne's linework aesthetic)

---

## 10. Status badges (complete map)

| Status | Token | Color | Pulse? |
|---|---|---|---|
| `pending` | warning | amber | no |
| `operator_notified` | info | blue | no |
| `operator_accepted` | teal | teal | no |
| `confirmed` | teal | teal | no |
| `pool_sent` | pool | purple | no |
| `driver_assigned` | info | blue | no |
| `assigned` | info | blue | no |
| `in_progress` | info | blue | **yes (green dot)** |
| `completed` | neutral | muted | no |
| `cancelled` | danger | red | no |
| `panic` | panic | panic-red | **yes (banner pulse)** |
| `expired` | danger | red | no |
| `suspended` | neutral | muted | no |
| `trial` | warning | amber | no |
| `active` | success | green | no |
| `open` | warning | amber | no |
| `replied` | info | blue | no |
| `closed` | neutral | muted | no |

---

## 11. Voice

- **DMC-facing:** warm, editorial, professional. Like a concierge service. "Welcome back, Amazing Thailand Tours." "Your booking has been sent to Somchai Transport for confirmation."
- **Admin-facing:** terse, operator-console. Like Linear or Stripe dashboard. "3 DMCs awaiting activation."
- **Thai-language:** formal but conversational. ครับ/ค่ะ only in notifications, not UI labels.
- **Empty states:** editorial + action-oriented. Syne italic headline, Inter Tight supporting line, teal CTA. Example: "No bookings yet." / "Create your first one →"
- **Error states:** blame the system, not the user. "We couldn't create this booking. Please check the highlighted fields."

---

## 12. File structure in repo

```
/public
  /brand
    riden-wordmark.svg
    riden-monogram.svg
    riden-monogram-solid.svg
  favicon.ico (monogram, generated from SVG)
  apple-touch-icon.png (monogram-solid, 180x180)

/app
  globals.css  ← all tokens from Section 3 + font-face loading

/components/brand
  Wordmark.tsx   ← <Wordmark size="sm|md|lg" />
  Monogram.tsx   ← <Monogram variant="standard|solid" size="..." />
  BrandMark.tsx  ← combines wordmark + tagline + metadata (for auth pages)
```

---

## 13. Fonts loading

In `app/layout.tsx`, via `next/font/google`:

```ts
import { Syne, Inter_Tight, JetBrains_Mono, IBM_Plex_Sans_Thai, Noto_Sans_SC } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-syne',
  display: 'swap',
})

const inter = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const thai = IBM_Plex_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500'],
  variable: '--font-thai',
  display: 'swap',
})

const sc = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sc',
  display: 'swap',
})

// Attach all variables to <html>:
// className={`${syne.variable} ${inter.variable} ${mono.variable} ${thai.variable} ${sc.variable}`}
```

---

## Definition of done for Phase 2b (design system implementation)

- [ ] `/public/brand/riden-wordmark.svg` + `monogram.svg` + `monogram-solid.svg` committed
- [ ] Fonts loaded via `next/font/google` in `app/layout.tsx`
- [ ] `app/globals.css` has every token from Section 3 (colors) and Section 4 (type)
- [ ] `<Wordmark>`, `<Monogram>`, `<BrandMark>` components in `components/brand/`
- [ ] Shell (sidebar + topbar) uses the new wordmark/monogram (collapsed sidebar shows monogram, expanded shows wordmark)
- [ ] Login page uses the split-panel ink/sand layout with wordmark
- [ ] All instances of "RIDEN" uppercase are replaced with `<Wordmark>` component
- [ ] favicon.ico regenerated from monogram
- [ ] Every page uses Inter Tight for body, Syne for headings, JetBrains Mono for data/labels
