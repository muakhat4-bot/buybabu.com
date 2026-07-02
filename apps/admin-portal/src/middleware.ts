import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export async function middleware(request: NextRequest) {
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
    
    // Role-based Access Control (Admin Portal demands SUPER_ADMIN)
    const role = user?.user_metadata?.role;
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }
  } catch (e) {
    console.error('Admin middleware verification failed:', e);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/vendors/:path*', '/api/products/:path*', '/api/orders/:path*'],
};
