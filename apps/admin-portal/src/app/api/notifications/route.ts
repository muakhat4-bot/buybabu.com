import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: admin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'almanar.edu.pk@gmail.com')
      .maybeSingle();

    if (!admin) {
      return NextResponse.json([]);
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', admin.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(notifications || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, all } = await request.json();

    const { data: admin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'almanar.edu.pk@gmail.com')
      .maybeSingle();

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    if (all) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', admin.id);
      if (error) throw error;
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
