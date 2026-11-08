import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // CSRF Defense: For state-changing mutation methods, verify request Origin
  const method = request.method.toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = request.headers.get('origin');
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const hostHeader = request.headers.get('host') || request.nextUrl.host;
        // Verify origin hostname matches request host (or permitted admin domains)
        if (originUrl.host !== hostHeader && !originUrl.host.includes('localhost') && !originUrl.host.includes('127.0.0.1')) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: Cross-Origin Request Blocked (CSRF)' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Invalid Request Origin' },
          { status: 403 }
        );
      }
    }
  }

  // Always allow auth routes through
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Extract session token from cookie, Authorization header, or x-admin-token
  const cookieToken = request.cookies.get('bb_admin_session')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const headerToken = request.headers.get('x-admin-token');

  const token = cookieToken || bearerToken || headerToken;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin session required' },
      { status: 401 }
    );
  }

  const result = await verifyAdminToken(token);
  if (!result.valid) {
    return NextResponse.json(
      { success: false, error: result.error || 'Unauthorized: Invalid or expired admin session' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/vendors/:path*',
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/notifications/:path*'
  ],
};
