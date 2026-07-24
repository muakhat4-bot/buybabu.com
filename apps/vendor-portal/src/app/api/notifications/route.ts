import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Resolve owner_id from users
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return NextResponse.json([]);
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(notifications || []);
  } catch (err: any) {
    console.warn('Notifications GET warning:', err?.message || err);
    return NextResponse.json([]);
  }
}

export async function PUT(request: Request) {
  try {
    const { id, all, email } = await request.json();

    if (all && email) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (user) {
        const { error } = await supabaseAdmin
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id);
        if (error) throw error;
      }
    } else if (id) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
