// Shared admin-JWT guard for hardened edge functions.
// Copy/paste into each admin-* function's index.ts until Supabase edge
// functions support shared modules more ergonomically.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPA_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type,authorization,apikey,x-client-info',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
}

const adminClient = createClient(SUPA_URL, SERVICE_KEY)

export async function requireAdmin(req: Request): Promise<{ id: string; email: string } | Response> {
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

  const { data: admin, error: adminErr } = await adminClient
    .from('admin_users')
    .select('id, is_active')
    .eq('id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  if (adminErr) return new Response(JSON.stringify({ error: 'Admin lookup failed' }), { status: 500, headers: CORS })
  if (!admin) return new Response(JSON.stringify({ error: 'Not an admin' }), { status: 403, headers: CORS })

  return { id: user.id, email: user.email ?? '' }
}

export { CORS, adminClient }
