# LINE Bot Deploy Playbook (for Claude Code)

Deploy this `line-bot/` app to Vercel in ~10 minutes. Replace the tangled Supabase edge function mess for LINE.

## Step 1: Add to monorepo

Copy this entire directory into your repo as `apps/line-bot/`:

```
Riden/
├── apps/
│   ├── admin/
│   ├── dmc/
│   ├── website/
│   └── line-bot/      ← new
```

## Step 2: Install dependencies

```bash
cd apps/line-bot
npm install
```

This installs `@line/bot-sdk`, `sharp`, `zod`, Next.js 15, etc.

## Step 3: Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in the actual values. Get them from Supabase:

```sql
-- Run in Supabase SQL Editor
SELECT key, value FROM app_config WHERE key IN (
  'LINE_CHANNEL_ACCESS_TOKEN',
  'LINE_CHANNEL_SECRET'
);
```

For `SUPABASE_SERVICE_ROLE_KEY`: Supabase dashboard → Settings → API → service_role (secret).

Generate `ADMIN_API_KEY`:
```bash
openssl rand -hex 32
```

## Step 4: Local test (optional but recommended)

```bash
# Start dev server on localhost:3000
npm run dev
```

In another terminal:

```bash
# Create all 3 rich menus at 2500×843
npm run setup-menus
```

Expected output:
```
✅ operator_main: richmenu-abc...
✅ driver_idle: richmenu-def...
✅ driver_active: richmenu-ghi...
🎉 All menus created!
```

Test push:
```bash
npm run test-push U4f4ae105d5af4afc4007cbcd4f3d22eb
```

If Jeet gets the message → LINE works. If not → check token.

## Step 5: Deploy to Vercel

```bash
cd apps/line-bot
vercel

# Follow prompts. Link to existing project OR create new.
# After first deploy, add env vars:
vercel env add LINE_CHANNEL_ACCESS_TOKEN production
vercel env add LINE_CHANNEL_SECRET production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_API_KEY production

# Deploy to production
vercel --prod
```

Note the production URL — something like `https://riden-line-bot.vercel.app`.

## Step 6: Point LINE webhook to the new deployment

1. Go to https://developers.line.biz/console/
2. Select the RIDEN channel
3. Messaging API tab → Webhook URL
4. Update to: `https://riden-line-bot.vercel.app/api/webhook`
5. Click Verify → should return 200
6. Enable "Use webhook" toggle

**Keep the old Supabase edge function webhook alive for 24 hours in case you need to roll back.** Update LINE back to old URL if anything breaks.

## Step 7: Rebuild rich menus (if not done in step 4)

```bash
curl -X POST https://riden-line-bot.vercel.app/api/menus/setup \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

Or call from a client tool. Response looks like:
```json
{
  "ok": true,
  "traceId": "r_...",
  "results": {
    "operator_main": { "id": "richmenu-..." },
    "driver_idle": { "id": "richmenu-..." },
    "driver_active": { "id": "richmenu-..." }
  }
}
```

## Step 8: Link Jeet's account to operator menu

```bash
curl -X POST https://riden-line-bot.vercel.app/api/menus/link \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"lineUserId": "U4f4ae105d5af4afc4007cbcd4f3d22eb", "role": "operator"}'
```

## Step 9: Test on Jeet's phone

1. Kill LINE app (swipe away from recents)
2. Reopen LINE
3. Open RIDEN chat
4. Should see the new menu at the bottom
5. Tap any zone → bot should reply

## Step 10: Upload real menu images (when Jeet has Canva designs)

```bash
curl -X POST https://riden-line-bot.vercel.app/api/menus/image \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -F "menu=operator_main" \
  -F "image=@/path/to/operator-menu.png"
```

Accepts any size — auto-resizes to 2500×843 using cover fit.

## Rollback plan

If something breaks after deploy:

1. Go to LINE Developer Console
2. Change webhook URL back to old Supabase URL: `https://zfnwxetjxfvsijpaefqb.supabase.co/functions/v1/line-webhook-handler`
3. Old system resumes immediately

## Architecture notes

- **Single webhook endpoint** at `/api/webhook` — no more hunting across 15 edge functions
- **Native LINE SDK** — no hand-rolled fetch calls
- **Real PNG generation with `sharp`** — produces proper 2500×843 images under 50KB
- **Structured logging with trace IDs** — every webhook event traceable end-to-end
- **Backwards-compat proxy** — unhandled postbacks forward to existing Supabase edge functions during migration
- **Idempotent event handling** — LINE retries on timeout, we dedupe by webhookEventId
- **Returns 200 immediately** — processes events in background, within LINE's 1-second reply budget

## Migration strategy

The `postback.ts` handler currently **proxies** most actions back to the old Supabase edge functions (like `operator-response-handler`, `trip-status-updater`, `driver-bid-handler`). This means you can deploy this new bot without rewriting all the flows at once.

Gradually migrate flows into `flows/` directory here, and remove the proxy fallback for each one as it moves over.

Flows to migrate (in priority order):
1. Rich menu actions — already native in postback.ts
2. Operator booking response (accept/partial/pool)
3. Driver trip status (pickup / arrived / close)
4. Driver pool bidding
5. Registration chatbot
6. Payment reminders

## Why this fixes the LINE bug

The old implementation had 3 fatal issues:

1. **800×270 menu dimensions** — LINE silently rejects anything other than 2500×843 or 2500×1686. The menu would exist on LINE's server but the client refused to dispatch taps.
2. **Hand-rolled PNG encoding with stored deflate blocks** — produced 6MB uncompressed PNGs that exceed LINE's 1MB limit. Uploads failed silently.
3. **Spread across 15+ edge functions** — nobody could read all the code at once to spot these problems.

This rewrite:
- Enforces 2500×843 in code (throws if anyone tries other dimensions)
- Uses `sharp` for real PNG compression (~40KB output)
- Is one app, one codebase, one deploy
