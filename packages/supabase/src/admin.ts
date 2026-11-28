import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedAdminClient: SupabaseClient | null = null;
let cachedAdminUrl = '';
let cachedAdminKey = '';

export function getSupabaseAdmin(): SupabaseClient {
  let currentUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  ).trim();
  if ((currentUrl.startsWith('"') && currentUrl.endsWith('"')) || (currentUrl.startsWith("'") && currentUrl.endsWith("'"))) {
    currentUrl = currentUrl.slice(1, -1).trim();
  }

  let currentKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  ).trim();
  if ((currentKey.startsWith('"') && currentKey.endsWith('"')) || (currentKey.startsWith("'") && currentKey.endsWith("'"))) {
    currentKey = currentKey.slice(1, -1).trim();
  }

  if (!currentUrl || currentUrl.includes('placeholder-project-id')) {
    throw new Error('Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your environment.');
  }

  if (!currentKey || currentKey.includes('placeholder') || currentKey === 'placeholder-key') {
    throw new Error('Supabase Service Role Key is not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment.');
  }

  if (!cachedAdminClient || cachedAdminUrl !== currentUrl || cachedAdminKey !== currentKey) {
    cachedAdminClient = createClient(currentUrl, currentKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    cachedAdminUrl = currentUrl;
    cachedAdminKey = currentKey;
  }

  return cachedAdminClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
