import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ success: false, error: 'Email and new password are required.' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // 1. Update Supabase user in users table & Supabase Auth
    const { data: user, error: findErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (findErr) {
      console.warn('Supabase find user warning:', findErr.message);
    }

    if (user) {
      // Update custom password_hash in database
      await supabaseAdmin
        .from('users')
        .update({ password_hash: 'plain:' + newPassword })
        .eq('id', user.id);

      // Also update Supabase Auth user password if exists in Auth
      try {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: newPassword
        });
      } catch (authErr: any) {
        console.warn('Supabase auth admin password update note:', authErr?.message || authErr);
      }
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
