import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedAnonClient: SupabaseClient | null = null;
let cachedAnonUrl = '';
let cachedAnonKey = '';

export function getSupabaseClient(): SupabaseClient {
  let currentUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  ).trim();
  if ((currentUrl.startsWith('"') && currentUrl.endsWith('"')) || (currentUrl.startsWith("'") && currentUrl.endsWith("'"))) {
    currentUrl = currentUrl.slice(1, -1).trim();
  }

  let currentKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  if ((currentKey.startsWith('"') && currentKey.endsWith('"')) || (currentKey.startsWith("'") && currentKey.endsWith("'"))) {
    currentKey = currentKey.slice(1, -1).trim();
  }

  if (!currentUrl || currentUrl.includes('placeholder-project-id')) {
    throw new Error('Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your environment.');
  }

  if (!currentKey || currentKey.includes('placeholder') || currentKey === 'placeholder-key') {
    throw new Error('Supabase Anon Key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.');
  }

  if (!cachedAnonClient || cachedAnonUrl !== currentUrl || cachedAnonKey !== currentKey) {
    cachedAnonClient = createClient(currentUrl, currentKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    cachedAnonUrl = currentUrl;
    cachedAnonKey = currentKey;
  }

  return cachedAnonClient;
}

export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
