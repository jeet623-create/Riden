# Hardened admin edge functions — deploy pending

The three folders `admin-subscriptions/`, `admin-pending/`, and `admin-drivers/`
in this directory contain **hardened** versions of the corresponding deployed
edge functions. They add JWT verification + admin-user check at the top of
every request handler, so the functions are no longer callable by anyone who
knows the anon key.

## Why they're not deployed yet

Deploy is blocked by the Supabase edge-function slot cap on the current plan
(~120 active functions, mostly one-off dev throwaways like `fix-*`, `push-*`,
`stitch-*`, `check-*`, `inspect-*`). Every `deploy_edge_function` call — even
an update to an existing slug — fails with:

    PaymentRequiredException: Max number of functions reached for project,
    please upgrade Plan or disable spend cap

## What to do before deploying

1. **Audit the function list** in the Supabase dashboard → Edge Functions.
   Anything matching the patterns above and older than ~2 weeks is almost
   certainly a one-off debug script from an earlier development session.
2. **Delete the obvious throwaways** one-by-one. The delete modal requires
   typing the exact function name to confirm.
3. Once ~10 slots are free, redeploy these three functions with
   `verify_jwt: true` (see deploy command below).

## Deploy command

For each function (after freeing slots), from this repo root:

```bash
supabase functions deploy admin-subscriptions --project-ref zfnwxetjxfvsijpaefqb --no-verify-jwt=false
supabase functions deploy admin-pending       --project-ref zfnwxetjxfvsijpaefqb --no-verify-jwt=false
supabase functions deploy admin-drivers       --project-ref zfnwxetjxfvsijpaefqb --no-verify-jwt=false
```

(The `--no-verify-jwt=false` flag sets `verify_jwt: true` which rejects
requests without a Supabase-signed JWT at the platform layer — belt-and-
suspenders on top of our in-function admin check.)

## Client-side change (already shipped)

`app/admin/subscriptions/page.tsx` was updated to call the function via
`supabase.functions.invoke()` instead of a raw `fetch` with the anon key.
The invoke call sends the signed-in admin's access token automatically —
exactly what the hardened function expects. **This change is live in `main`.**

Once the hardened functions deploy, the flow works end-to-end:

  admin browser session → access_token → functions.invoke → edge function
  → verify JWT → look up admin_users row → proceed

Anonymous callers get 401. Non-admin users get 403.
