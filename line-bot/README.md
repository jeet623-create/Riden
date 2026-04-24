# @riden/line-bot — RIDEN LINE Bot (Clean Rewrite)

Standalone Next.js 15 service that replaces the tangled Supabase edge function mess. 
Everything LINE-related lives here. Source-controlled, deployable as a single unit, easy to read.

## Why this exists

The previous LINE implementation was spread across 15+ Supabase edge functions, each in its own tab, impossible to debug. The 800×270 rich menu bug took 3 days to find because nobody could read all the code at once.

This is **one app**, **one codebase**, **one deploy**. Vercel or Cloud Run. Done.

## Architecture

```
apps/line-bot/
├── src/app/api/
│   ├── webhook/route.ts           # Single webhook receiver
│   ├── menus/setup/route.ts       # Admin: rebuild rich menus
│   ├── menus/link/route.ts        # Admin: link menu to user
│   ├── menus/image/route.ts       # Admin: upload menu image
│   └── push/route.ts              # Admin: send push message
├── lib/
│   ├── line-client.ts             # @line/bot-sdk wrapper
│   ├── supabase-admin.ts          # Service-role Supabase client
│   ├── env.ts                     # Typed env vars
│   └── logger.ts                  # Structured logging
├── handlers/
│   ├── index.ts                   # Event router
│   ├── follow.ts                  # User adds bot
│   ├── unfollow.ts                # User blocks bot
│   ├── message.ts                 # Text messages
│   ├── postback.ts                # Button taps (rich menu + flex)
│   ├── image.ts                   # Photo uploads
│   └── location.ts                # LINE location share (fallback)
├── menus/
│   ├── definitions.ts             # All 3 rich menu structures
│   ├── image-builder.ts           # Generates 2500×843 PNG via sharp
│   └── manager.ts                 # Create/upload/link/delete menus
├── flows/
│   ├── operator-booking.ts        # New booking → operator response
│   ├── driver-pool.ts             # Pool bidding flow
│   ├── driver-trip.ts             # Trip execution (picked up / arrived / closed)
│   ├── registration.ts            # Driver/operator onboarding chatbot
│   └── payment.ts                 # Payment reminder chain
├── scripts/
│   ├── setup-menus.ts             # One-shot: create all 3 menus
│   ├── test-webhook.ts            # Local webhook signature test
│   └── test-push.ts               # Verify token + push delivery
└── package.json
```

## Key design choices

1. **`@line/bot-sdk`** — official SDK. No more hand-rolled fetch() calls.
2. **`sharp` for images** — generates real compressed PNGs at exactly 2500×843.
3. **One webhook handler** — routes to the right flow based on event type.
4. **Typed everything** — zod schemas for every database read/write.
5. **Structured logging** — every event logged with trace ID for debugging.
6. **Admin API routes** — rebuild menus, push test messages, inspect state. All authenticated.

## Deployment

### Option A: Vercel (recommended)
```bash
vercel --prod
```
Set env vars in Vercel dashboard. Update LINE webhook URL to `https://your-deployment.vercel.app/api/webhook`.

### Option B: Cloud Run / Railway / Fly.io
Standard Next.js deploy. Any Node hosting.

## Environment variables

Copy `.env.example` to `.env.local`:

```
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
SUPABASE_URL=https://zfnwxetjxfvsijpaefqb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
ADMIN_API_KEY=xxx  # for admin endpoints
LOG_LEVEL=info
```

## First-run setup

```bash
npm install
npm run setup-menus  # Creates all 3 rich menus at 2500×843
```

Then update LINE Developer Console webhook URL to point here.

## The rich menu bug that cost 3 days

Previous implementation hardcoded 800×270. LINE's client silently rejected taps without any error message. The LINE Messaging API accepted the menu creation (returned 200 with a menuId) but the phone client refused to render them properly.

**Rule:** Rich menu images MUST be exactly `2500×843` (half) or `2500×1686` (full). Any other dimensions = silent failure.

This is enforced in `menus/image-builder.ts` — it throws if anyone tries to set other dimensions.

## Debugging

Every event gets a trace ID. Search logs with:
```
LOG_LEVEL=debug npm run dev
```

All webhook events are also inserted into `webhook_events_log` table in Supabase for post-mortem analysis.
