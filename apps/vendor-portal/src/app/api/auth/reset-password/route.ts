import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getDbJsonPath() {
  const possiblePaths = [
    path.resolve(process.cwd(), '../../db.json'),
    path.resolve(process.cwd(), '../db.json'),
    path.resolve(process.cwd(), 'db.json'),
    'd:\\Master Project\\Villex\\db.json'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.resolve(process.cwd(), '../../db.json');
}

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ success: false, error: 'Email and new password are required.' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // 1. Update local db.json
    try {
      const p = getDbJsonPath();
      if (fs.existsSync(p)) {
        const fileContent = fs.readFileSync(p, 'utf8');
        const data = JSON.parse(fileContent);
        if (data.vendors && Array.isArray(data.vendors)) {
          const vendorIdx = data.vendors.findIndex(
            (v: any) => v.email && v.email.toLowerCase().trim() === emailLower
          );
          if (vendorIdx >= 0) {
            data.vendors[vendorIdx].password = newPassword;
            fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
          }
        }
      }
    } catch (dbErr) {
      console.warn('db.json update error on reset-password:', dbErr);
    }

    // 2. Attempt Supabase user password update if available
    try {
      const { data: user, error: findErr } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle();

      if (!findErr && user) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: newPassword
        }).catch((sbErr) => console.warn('Supabase admin password update warning:', sbErr));
      }
    } catch (sbErr) {
      console.warn('Supabase reset password fallback warning:', sbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
    });
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to reset password' }, { status: 500 });
  }
}
