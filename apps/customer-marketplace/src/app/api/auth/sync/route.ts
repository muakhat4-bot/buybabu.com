import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    // 1. Verify access token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { id, email, firstName, lastName, phone } = body;

    // Security guard: Ensure user is only updating their own data
    if (user.id !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden: User identity mismatch' }, { status: 403 });
    }

    const emailLower = email.toLowerCase();

    // 2. Query public.users table
    const { data: existingUser, error: findUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findUserError) {
      throw findUserError;
    }

    let profile;
    if (existingUser) {
      // Update existing profile details if needed
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || existingUser.phone || ''
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      profile = updatedUser;
    } else {
      // Insert new profile record
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id,
          email: emailLower,
          password_hash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890',
          first_name: firstName,
          last_name: lastName,
          phone: phone || '',
          is_active: true
        })
        .select()
        .single();

      if (insertError) throw insertError;
      profile = newUser;
    }

    // 3. Bind the CUSTOMER role (role_id 3)
    const { data: roleLink, error: findRoleLinkError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', id)
      .eq('role_id', 3)
      .maybeSingle();

    if (findRoleLinkError) {
      console.error('Error finding role link:', findRoleLinkError);
    }

    if (!roleLink) {
      const { error: insertRoleLinkError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: id,
          role_id: 3
        });

      if (insertRoleLinkError) {
        console.error('Error inserting role link for CUSTOMER:', insertRoleLinkError);
      }
    }

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error('[Auth Sync API Error]:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
