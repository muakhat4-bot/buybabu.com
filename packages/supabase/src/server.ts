import { createClient } from '@supabase/supabase-js';

export const getSupabaseServer = () => {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  if (!supabaseUrl || supabaseUrl.includes('placeholder-project-id')) {
    throw new Error('Supabase URL is not configured. Please set the NEXT_PUBLIC_SUPABASE_URL environment variable on Vercel/Locally.');
  }
  if (!supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
    throw new Error('Supabase Anon Key is not configured. Please set the NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable on Vercel/Locally.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });
};
