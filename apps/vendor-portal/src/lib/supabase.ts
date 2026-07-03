import { createClient } from '@supabase/supabase-js';

// ── Client-safe Supabase instance ────────────────────────────────────────────
// This file is imported by client components. It MUST NOT import from
// '@villex/supabase' directly because that barrel export includes
// supabaseAdmin (service role key) which is server-only and crashes Turbopack.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project-id.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
