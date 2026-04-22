// HARDENED — pending deploy. See supabase/functions/README-hardened.md for context.
// This is the JWT-verified version of admin-subscriptions that still needs to
// be deployed (blocked by edge-function slot cap — free slots and redeploy
// with `verify_jwt: true`).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPA_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const sb = createClient(SUPA_URL, SERVICE_KEY)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type,authorization,apikey,x-client-info',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
}

async function requireAdmin(req: Request): Promise<{ id: string; email: string } | Response> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: CORS })
  }
  const jwt = authHeader.slice(7).trim()
  if (!jwt) return new Response(JSON.stringify({ error: 'Invalid Authorization header' }), { status: 401, headers: CORS })

  const userClient = createClient(SUPA_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: userErr } = await userClient.auth.getUser(jwt)
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: CORS })
  }
  const user = userData.user

  const { data: admin, error: adminErr } = await sb
    .from('admin_users')
    .select('id, is_active')
    .eq('id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  if (adminErr) return new Response(JSON.stringify({ error: 'Admin lookup failed' }), { status: 500, headers: CORS })
  if (!admin) return new Response(JSON.stringify({ error: 'Not an admin' }), { status: 403, headers: CORS })

  return { id: user.id, email: user.email ?? '' }
}

const PLANS: Record<string, { price: number; label: string }> = {
  trial:   { price: 0,    label: 'Free Trial' },
  starter: { price: 2000, label: 'Starter' },
  growth:  { price: 4000, label: 'Growth' },
  pro:     { price: 6000, label: 'Pro' },
}

async function sendEmailAlert(type: string, payload: Record<string, string>) {
  await fetch(`${SUPA_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ type, ...payload }),
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const who = await requireAdmin(req)
  if (who instanceof Response) return who

  try {
    if (req.method === 'GET') {
      const { data: dmcs } = await sb.from('dmc_users')
        .select('id, company_name, email, country, subscription_plan, subscription_status, trial_ends_at, is_active, created_at, line_user_id')
        .order('created_at', { ascending: false })

      const dmcIds = (dmcs ?? []).map((d: any) => d.id)
      const { data: subs } = await sb.from('subscriptions')
        .select('dmc_id, plan, start_date, end_date, status, activated_at')
        .in('dmc_id', dmcIds)
        .order('activated_at', { ascending: false })

      const latestSub: Record<string, any> = {}
      for (const sub of subs ?? []) {
        if (!latestSub[sub.dmc_id]) latestSub[sub.dmc_id] = sub
      }

      const result = (dmcs ?? []).map((d: any) => ({ ...d, latest_sub: latestSub[d.id] || null }))
      return new Response(JSON.stringify({ dmcs: result }), { headers: CORS })
    }

    if (req.method === 'POST') {
      const { dmc_id, plan, start_date, end_date, admin_id, notes } = await req.json()
      if (!dmc_id || !plan || !start_date || !end_date) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: CORS })
      }

      const planInfo = PLANS[plan]
      if (!planInfo) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers: CORS })

      const { error: subErr } = await sb.from('subscriptions').insert({
        dmc_id, plan, price_thb: planInfo.price,
        start_date, end_date,
        activated_by: admin_id || who.id,
        activated_at: new Date().toISOString(),
        status: 'active', notes: notes || null,
      })
      if (subErr) return new Response(JSON.stringify({ error: subErr.message }), { status: 500, headers: CORS })

      await sb.from('dmc_users').update({
        subscription_plan: plan,
        subscription_status: 'active',
        is_active: true,
      }).eq('id', dmc_id)

      const { data: dmc } = await sb.from('dmc_users').select('company_name, line_user_id, email').eq('id', dmc_id).single()

      if (dmc?.line_user_id) {
        const { data: cfg } = await sb.from('app_config').select('value').eq('key', 'LINE_CHANNEL_ACCESS_TOKEN').single()
        if (cfg?.value) {
          await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.value}` },
            body: JSON.stringify({ to: dmc.line_user_id, messages: [{ type: 'text',
              text: `✅ RIDEN Subscription Activated!\n🏢 ${dmc.company_name}\n\n💳 Plan: ${planInfo.label}\n📅 Valid: ${start_date} to ${end_date}\n\nยินดีต้อนรับสู่ RIDEN! 🚗` }] }),
          })
        }
      }

      if (dmc?.email) {
        await sendEmailAlert('subscription_activated', { dmc_id, plan, end_date })
      }

      return new Response(JSON.stringify({ ok: true, plan: planInfo.label, dmc_name: dmc?.company_name, email_sent: !!dmc?.email }), { headers: CORS })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS })
  }
})
