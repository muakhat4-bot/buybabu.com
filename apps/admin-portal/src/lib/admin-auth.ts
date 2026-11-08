import { NextResponse } from 'next/server';

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: 'SUPER_ADMIN';
  iat: number;
  exp: number;
}

let ephemeralSecret: string | null = null;

export function getAdminSecret(): string {
  const envSecret = process.env.ADMIN_SECRET_KEY;
  if (envSecret && envSecret.trim().length >= 16) {
    return envSecret.trim();
  }
  if (!ephemeralSecret) {
    const arr = new Uint8Array(32);
    globalThis.crypto.getRandomValues(arr);
    ephemeralSecret = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    console.warn('[SECURITY WARNING] ADMIN_SECRET_KEY environment variable is not configured. Generated ephemeral in-memory secret.');
  }
  return ephemeralSecret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeToUint8Array(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function signAdminToken(email: string, durationSeconds = 86400): Promise<string> {
  const secret = getAdminSecret();
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    sub: 'super-admin',
    email: email.toLowerCase().trim(),
    role: 'SUPER_ADMIN',
    iat: now,
    exp: now + durationSeconds
  };
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const signatureInput = `${headerB64}.${payloadB64}`;

  const sigBuf = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(signatureInput));
  const signatureB64 = base64UrlEncode(new Uint8Array(sigBuf));

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

export async function verifyAdminToken(token: string): Promise<{ valid: boolean; payload?: AdminTokenPayload; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing token' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed token structure' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const secret = getAdminSecret();
  const enc = new TextEncoder();

  try {
    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlDecodeToUint8Array(signatureB64);
    const dataToVerify = enc.encode(`${headerB64}.${payloadB64}`);

    const isValid = await globalThis.crypto.subtle.verify('HMAC', key, signatureBytes, dataToVerify);
    if (!isValid) {
      return { valid: false, error: 'Cryptographic signature mismatch' };
    }

    const payloadBytes = base64UrlDecodeToUint8Array(payloadB64);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadJson) as AdminTokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    if (payload.role !== 'SUPER_ADMIN') {
      return { valid: false, error: 'Insufficient administrative privileges' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: 'Invalid token payload or signature' };
  }
}

export function extractTokenFromRequest(request: Request): string | null {
  // 1. Check httpOnly cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)bb_admin_session=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 3. Check x-admin-token header
  const xAdminToken = request.headers.get('x-admin-token');
  if (xAdminToken && xAdminToken.trim().length > 0) {
    return xAdminToken.trim();
  }

  return null;
}

export async function isAuthorizedAdmin(request: Request): Promise<boolean> {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return false;
  }
  const result = await verifyAdminToken(token);
  return result.valid;
}

export function unauthorizedResponse(reason = 'Unauthorized: Administrative authentication required') {
  return NextResponse.json(
    { success: false, error: reason },
    { status: 401 }
  );
}
