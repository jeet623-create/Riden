import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

/**
 * Get a value from the app_config table.
 */
export async function getConfig(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) {
    console.error('getConfig failed:', key, error);
    return null;
  }
  return data?.value ?? null;
}

/**
 * Upsert a value in app_config.
 */
export async function setConfig(key: string, value: string, description?: string): Promise<void> {
  await supabase
    .from('app_config')
    .upsert(
      { key, value, description, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
}
