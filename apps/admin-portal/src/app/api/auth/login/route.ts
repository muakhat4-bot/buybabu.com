import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { signAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const expectedEmail = (process.env.ADMIN_EMAIL || 'Almanar.edu.pk@gmail.com').toLowerCase().trim();
    const expectedPassword = process.env.ADMIN_PASSWORD || 'Pass@2025/-WebSite';

    const inputEmail = String(email).toLowerCase().trim();
    const inputPassword = String(password);

    const emailMatch = safeCompare(inputEmail, expectedEmail);
    const passwordMatch = safeCompare(inputPassword, expectedPassword);

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Generate signed HMAC token with 24-hour expiration
    const token = await signAdminToken(inputEmail, 86400);

    const response = NextResponse.json({
      success: true,
      user: {
        name: process.env.ADMIN_NAME || 'Abu Saad',
        email: expectedEmail,
        role: 'SUPER_ADMIN'
      }
    });

    // Set secure, httpOnly session cookie
    response.cookies.set({
      name: 'bb_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400
    });

    return response;
  } catch (err: any) {
    console.error('[Admin Login] Error processing authentication:', err);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
