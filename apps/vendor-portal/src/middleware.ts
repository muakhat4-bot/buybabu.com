import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// In-memory rate limiting store
const ipCache = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!ipCache.has(ip)) {
    ipCache.set(ip, [now]);
    return false;
  }

  const timestamps = ipCache.get(ip) || [];
  const activeTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  activeTimestamps.push(now);
  ipCache.set(ip, activeTimestamps);

  return activeTimestamps.length > MAX_REQUESTS_PER_WINDOW;
}

export async function middleware(request: NextRequest) {
  // 1. IP-Based Rate Limiting
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too Many Requests: Rate limit exceeded (Max 100 requests/min).' },
      { status: 429 }
    );
  }

  // 2. Token & Authorization Checks
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1] || request.cookies.get('villex_vendor_token')?.value;

  const isUnconfigured = supabaseUrl.includes('placeholder-project-id');
  if (isUnconfigured) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    
    const role = user?.user_metadata?.role;
    if (role !== 'VENDOR_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }
  } catch (e) {
    console.error('Middleware verification failed:', e);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/products/:path*', '/api/orders/:path*', '/api/attachments/:path*', '/api/upload/:path*'],
};
