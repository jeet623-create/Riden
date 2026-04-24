# Riden — marketing website

> Where Gears Meet Green.

The public face of [Riden](https://riden.me) — a B2B SaaS coordinating Thailand's
inbound tourism transport. Built as a cinematic, investor-grade site separate
from the DMC/admin product apps.

## Stack

- Next.js 15 · App Router · TypeScript
- Tailwind CSS + shadcn patterns
- Framer Motion, GSAP + ScrollTrigger, Lenis
- React Three Fiber + drei
- next-intl (English + Thai)
- Supabase (shares the existing `zfnwxetjxfvsijpaefqb` project — **new tables only, never alter existing schema**)
- Resend (transactional email)

## Scripts

```bash
npm install
npm run dev       # http://localhost:3000
npm run typecheck
npm run build
```

## Brand

Tokens live in `tailwind.config.ts` and `app/globals.css`. The palette is
locked — see 43.md §🎨 and the `brand.md` reference in the sibling `Riden`
repo. Teal `#1D9E75` is the only accent; do not recolor.

## Status

Step 1 scaffold. The home page currently renders an integration diagnostic
so every dep (framer-motion, R3F, gsap, lenis, next-intl, Supabase) is
proven to compile and run. Replace with the real hero in Step 2.
