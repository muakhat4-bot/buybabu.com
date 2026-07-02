import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const rawClient = createClient(
  supabaseUrl || 'https://placeholder-project-id.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

function validateConfig() {
  const currentUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const currentKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!currentUrl || currentUrl.includes('placeholder-project-id')) {
    throw new Error('Supabase URL is not configured. Please set the NEXT_PUBLIC_SUPABASE_URL environment variable on Vercel/Locally.');
  }
  if (!currentKey || currentKey.includes('placeholder') || currentKey === 'placeholder-key') {
    throw new Error('Supabase Service Role Key is not configured. Please set the SUPABASE_SERVICE_ROLE_KEY environment variable on Vercel/Locally.');
  }
}

export const supabaseAdmin = new Proxy(rawClient, {
  get(target, prop, receiver) {
    if (prop === 'from' || prop === 'auth' || prop === 'storage') {
      validateConfig();
    }
    return Reflect.get(target, prop, receiver);
  }
}) as SupabaseClient;
