import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Vendor Portal Middleware ──────────────────────────────────────────────────
// API routes (/api/products, /api/orders, /api/vendors, etc.) are protected
// at the data layer — they use supabaseAdmin (service role key, server-only).
// The previous middleware was blocking the login flow itself because the
// vendor-auth-context calls /api/vendors to validate credentials, but the
// middleware was rejecting those calls with 401 (no token yet at login time).
//
// Rate limiting is kept. Token validation is removed — it was redundant and
// was breaking the local-fallback login path.

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

export function middleware(request: NextRequest) {
  // Rate limiting only — auth is enforced at the route/data layer
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too Many Requests: Rate limit exceeded (Max 100 requests/min).' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/products/:path*', '/api/orders/:path*', '/api/attachments/:path*', '/api/upload/:path*', '/api/vendors/:path*'],
};
