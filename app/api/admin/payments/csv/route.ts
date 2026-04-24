import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const filters = await req.json().catch(() => ({}))

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return new Response("Unauthorized", { status: 401 })

  // Verify the caller is an admin
  const { data: admin, error: adminErr } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", user.email)
    .maybeSingle()
  if (adminErr || !admin) return new Response("Forbidden", { status: 403 })

  // Delegate to edge function with service role
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !serviceKey) {
    return new Response("Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY", { status: 500 })
  }

  const edgeRes = await fetch(`${supaUrl}/functions/v1/admin-payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ action: "csv_export", ...filters }),
  })

  if (!edgeRes.ok) {
    const text = await edgeRes.text()
    return new Response(text || "CSV export failed", { status: edgeRes.status })
  }

  const csv = await edgeRes.text()
  const date = new Date().toISOString().split("T")[0]
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="riden-payments-${date}.csv"`,
    },
  })
}
