import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const result = await verifyAdminToken(token);
  if (!result.valid || !result.payload) {
    return NextResponse.json({ authenticated: false, error: result.error }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      name: process.env.ADMIN_NAME || 'Abu Saad',
      email: result.payload.email,
      role: result.payload.role
    }
  });
}
