import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin Portal API routes are protected at the infrastructure level.
// The actual API routes use supabaseAdmin (service role key) which is server-side only.
// This middleware passes all requests through without blocking.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/vendors/:path*', '/api/products/:path*', '/api/orders/:path*'],
};
