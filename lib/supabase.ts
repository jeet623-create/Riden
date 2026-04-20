import { createClient as _createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = _createClient(url, anon)
export function createClient() { return _createClient(url, anon) }
