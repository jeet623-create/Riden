// HARDENED — pending deploy. See supabase/functions/README-hardened.md.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPA_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const sb = createClient(SUPA_URL, SERVICE_KEY)

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,apikey,x-client-info',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
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

async function sendLine(to: string, messages: unknown[]) {
  const { data } = await sb.from('app_config').select('value').eq('key', 'LINE_CHANNEL_ACCESS_TOKEN').single()
  const token = data?.value
  if (!token || !to) return
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ to, messages }),
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const who = await requireAdmin(req)
  if (who instanceof Response) return who

  try {
    if (req.method === 'GET') {
      const { data, error } = await sb.from('drivers')
        .select('id, full_name, phone, vehicle_type, vehicle_plate, vehicle_brand_model, vehicle_seats, vehicle_photo_url, profile_photo_url, license_number, license_expiry, is_verified, is_active, is_available, base_location, created_at, operator_id, rating, total_trips')
        .order('created_at', { ascending: false })
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS })
      return new Response(JSON.stringify({ drivers: data ?? [] }), { headers: CORS })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { driver_id, action: act, rejection_reason } = body
      if (!driver_id) return new Response(JSON.stringify({ error: 'Missing driver_id' }), { status: 400, headers: CORS })

      if (act === 'approve') {
        const { error } = await sb.from('drivers').update({ is_verified: true, is_active: true, is_available: false }).eq('id', driver_id)
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS })
        const { data: dr } = await sb.from('drivers').select('line_user_id, full_name').eq('id', driver_id).single()
        if (dr?.line_user_id) {
          await sendLine(dr.line_user_id, [{ type: 'text', text: `✅ สวัสดี ${dr.full_name}! คุณได้รับการอนุมัติเข้า RIDEN Driver Pool แล้ว 🎉\n\nพิมพ์ "พร้อม" เมื่อต้องการรับงาน` }])
        }
        return new Response(JSON.stringify({ ok: true, action: 'approved' }), { headers: CORS })
      }

      if (act === 'reject') {
        const { error } = await sb.from('drivers').update({ is_verified: false, is_active: false }).eq('id', driver_id)
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS })
        const { data: dr } = await sb.from('drivers').select('line_user_id, full_name').eq('id', driver_id).single()
        if (dr?.line_user_id) {
          await sendLine(dr.line_user_id, [{ type: 'text', text: `❌ ขออภัย ${dr.full_name}\n\nคำขอสมัครของคุณยังไม่ผ่านการอนุมัติ${rejection_reason ? `\n\nเหตุผล: ${rejection_reason}` : ''}\n\nกรุณาลองสมัครใหม่พร้อมรูปภาพที่ชัดเจน` }])
        }
        return new Response(JSON.stringify({ ok: true, action: 'rejected' }), { headers: CORS })
      }

      if (act === 'suspend') {
        await sb.from('drivers').update({ is_active: false, is_available: false }).eq('id', driver_id)
        return new Response(JSON.stringify({ ok: true, action: 'suspended' }), { headers: CORS })
      }

      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: CORS })
    }

    return new Response('Method not allowed', { status: 405, headers: CORS })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), { status: 500, headers: CORS })
  }
})
