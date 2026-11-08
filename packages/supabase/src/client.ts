import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

const rawClient = createClient(
  supabaseUrl || 'https://placeholder-project-id.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

function validateConfig() {
  const currentUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const currentKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  
  if (!currentUrl || currentUrl.includes('placeholder-project-id')) {
    throw new Error('Supabase URL is not configured. Please set the NEXT_PUBLIC_SUPABASE_URL environment variable on Vercel/Locally.');
  }
  if (!currentKey || currentKey.includes('placeholder')) {
    throw new Error('Supabase Anon Key is not configured. Please set the NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable on Vercel/Locally.');
  }
}

export const supabaseClient = new Proxy(rawClient, {
  get(target, prop, receiver) {
    if (prop === 'from' || prop === 'auth' || prop === 'storage') {
      validateConfig();
    }
    return Reflect.get(target, prop, receiver);
  }
}) as SupabaseClient;
