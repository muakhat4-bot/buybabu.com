import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
import { isAuthorizedAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const { data: items, error } = await supabaseAdmin
      .from('trending_items')
      .select(`
        *,
        products (
          id,
          name,
          images,
          brand,
          status,
          approval_status,
          vendors (
            id,
            store_name
          ),
          categories (
            id,
            name
          ),
          product_variants (
            id,
            price,
            sku
          )
        )
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Admin Trending Items GET notice:', error.message);
      return NextResponse.json({ success: true, items: [] });
    }

    return NextResponse.json({ success: true, items: items || [] });
  } catch (err: any) {
    console.error('Admin Trending Items GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { product_id, display_order, priority, starts_at, ends_at } = body;

    if (!product_id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    // 1. Verify product exists and is approved
    const { data: product, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, name, status, approval_status')
      .eq('id', product_id)
      .maybeSingle();

    if (prodErr || !product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    if (product.approval_status !== 'APPROVED' || product.status !== 'PUBLISHED') {
      return NextResponse.json({ success: false, error: 'Only published and approved products can be added to Trending Items' }, { status: 400 });
    }

    // 2. Strict Exclusivity Check: Product must NOT have an active approved Flash Deal
    const nowIso = new Date().toISOString();
    try {
      const { data: activeDeal } = await supabaseAdmin
        .from('flash_deals')
        .select('id')
        .eq('product_id', product_id)
        .eq('status', 'APPROVED')
        .eq('is_active', true)
        .lte('starts_at', nowIso)
        .gte('ends_at', nowIso)
        .maybeSingle();

      if (activeDeal) {
        return NextResponse.json(
          { success: false, error: 'Product has an active Flash Deal. Flash Deal products cannot be added to Trending Items.' },
          { status: 400 }
        );
      }
    } catch {
      // Table may not exist yet
    }

    // 3. Insert into trending_items
    const orderNum = parseInt(display_order || '0', 10);
    const { data: newItem, error: insertErr } = await supabaseAdmin
      .from('trending_items')
      .insert({
        product_id,
        display_order: isNaN(orderNum) ? 0 : orderNum,
        priority: priority || 'NORMAL',
        starts_at: starts_at ? new Date(starts_at).toISOString() : null,
        ends_at: ends_at ? new Date(ends_at).toISOString() : null,
        is_active: true
      })
      .select(`
        *,
        products (
          id,
          name,
          images,
          brand,
          status,
          approval_status,
          vendors (
            id,
            store_name
          )
        )
      `)
      .single();

    if (insertErr) {
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (err: any) {
    console.error('Admin Trending Items POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id, display_order, priority, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Trending item ID required' }, { status: 400 });
    }

    const updateFields: Record<string, any> = {};
    if (display_order !== undefined) updateFields.display_order = parseInt(display_order, 10);
    if (priority !== undefined) updateFields.priority = priority;
    if (is_active !== undefined) updateFields.is_active = Boolean(is_active);

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('trending_items')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID parameter is required' }, { status: 400 });
    }

    const { error: delErr } = await supabaseAdmin
      .from('trending_items')
      .delete()
      .eq('id', id);

    if (delErr) {
      return NextResponse.json({ success: false, error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Trending item removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
