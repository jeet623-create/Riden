// HARDENED — pending deploy. See supabase/functions/README-hardened.md.
// requireAdmin() is inlined so this file is deployable standalone via MCP.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPA_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const sb = createClient(SUPA_URL, SERVICE_KEY)

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,apikey,x-client-info',
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
  const { data: admin, error: adminErr } = await sb
    .from('admin_users')
    .select('id, is_active')
    .eq('id', userData.user.id)
    .eq('is_active', true)
    .maybeSingle()
  if (adminErr) return new Response(JSON.stringify({ error: 'Admin lookup failed' }), { status: 500, headers: CORS })
  if (!admin) return new Response(JSON.stringify({ error: 'Not an admin' }), { status: 403, headers: CORS })
  return { id: userData.user.id, email: userData.user.email ?? '' }
}

async function getLineToken(): Promise<string> {
  const { data } = await sb.from('app_config').select('value').eq('key', 'LINE_CHANNEL_ACCESS_TOKEN').single()
  return data?.value ?? ''
}
async function sendLine(to: string, messages: unknown[]) {
  const token = await getLineToken()
  if (!token) return
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ to, messages }),
  })
}
async function sendText(to: string, text: string) {
  await sendLine(to, [{ type: 'text', text }])
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const who = await requireAdmin(req)
  if (who instanceof Response) return who

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (req.method === 'GET' && (!action || action === 'list')) {
      const [{ data: ops }, { data: drs }] = await Promise.all([
        sb.from('operators').select('id,company_name,phone,base_location,line_user_id,created_at')
          .eq('is_verified', false).neq('status', 'suspended').order('created_at', { ascending: false }),
        sb.from('drivers').select('id,full_name,vehicle_type,vehicle_plate,base_location,line_user_id,created_at,phone')
          .eq('is_verified', false).eq('is_active', false).order('created_at', { ascending: false }),
      ])
      return new Response(JSON.stringify({ operators: ops ?? [], drivers: drs ?? [] }), { headers: CORS })
    }

    if (req.method === 'GET' && action === 'list_operators') {
      const { data: ops } = await sb.from('operators')
        .select('id,company_name,phone,base_location,line_user_id,status,is_verified,created_at,is_also_driver')
        .order('created_at', { ascending: false })
      return new Response(JSON.stringify({ all_operators: ops ?? [] }), { headers: CORS })
    }

    if (req.method === 'GET' && action === 'list_drivers') {
      const { data: drs } = await sb.from('drivers')
        .select('id,full_name,phone,vehicle_type,vehicle_plate,base_location,line_user_id,is_verified,is_available,is_active,created_at,operator_id')
        .order('created_at', { ascending: false })
      return new Response(JSON.stringify({ all_drivers: drs ?? [] }), { headers: CORS })
    }

    const body = await req.json()
    const { type, id, action: act, line_user_id, name } = body

    if (type === 'operator') {
      if (act === 'verify') {
        await sb.from('operators').update({ is_verified: true, status: 'active' }).eq('id', id)
        if (line_user_id) await sendText(line_user_id, 'RIDEN: ✅ บัญชีผู้ประกอบการของคุณได้รับการยืนยันแล้ว! เริ่มรับงานได้ทันที 🚗')
        return new Response(JSON.stringify({ ok: true, msg: 'Verified: ' + name }), { headers: CORS })
      }
      if (act === 'reject' || act === 'suspend') {
        await sb.from('operators').update({ status: 'suspended' }).eq('id', id)
        if (line_user_id) await sendText(line_user_id, 'RIDEN: ❌ บัญชีของคุณถูกระงับ กรุณาติดต่อ RIDEN support')
        return new Response(JSON.stringify({ ok: true, msg: 'Suspended: ' + name }), { headers: CORS })
      }
    }

    if (type === 'driver') {
      if (act === 'verify') {
        await sb.from('drivers').update({ is_verified: true, is_active: true }).eq('id', id)
        return new Response(JSON.stringify({ ok: true, msg: 'Verified: ' + name }), { headers: CORS })
      }
      if (act === 'reject' || act === 'suspend') {
        await sb.from('drivers').update({ is_active: false }).eq('id', id)
        if (line_user_id) await sendText(line_user_id, 'RIDEN: ❌ ใบสมัครของคุณถูกระงับ กรุณาติดต่อ RIDEN support')
        return new Response(JSON.stringify({ ok: true, msg: 'Suspended: ' + name }), { headers: CORS })
      }
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: CORS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS })
  }
})
