import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

async function authenticateVendor(request: Request) {
  const authHeader =
    request.headers.get('authorization') ||
    request.headers.get('x-forwarded-authorization') ||
    request.headers.get('x-vendor-token') ||
    request.headers.get('x-supabase-auth');

  if (!authHeader || !authHeader.trim()) {
    return { errorResponse: NextResponse.json({ success: false, error: 'Unauthorized: Missing Authorization header' }, { status: 401 }) };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { errorResponse: NextResponse.json({ success: false, error: 'Unauthorized: Empty token' }, { status: 401 }) };
  }

  try {
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) {
      return { errorResponse: NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 }) };
    }

    const user = userData.user;
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (vendorError || !vendor) {
      return { errorResponse: NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 403 }) };
    }

    return { vendor, user };
  } catch (err: any) {
    return { errorResponse: NextResponse.json({ success: false, error: 'Internal auth error' }, { status: 500 }) };
  }
}

export async function GET(request: Request) {
  const auth = await authenticateVendor(request);
  if ('errorResponse' in auth) return auth.errorResponse;
  const { vendor } = auth;

  try {
    const { data: deals, error } = await supabaseAdmin
      .from('flash_deals')
      .select(`
        *,
        products (
          id,
          name,
          images,
          approval_status,
          status
        ),
        product_variants (
          id,
          sku,
          price,
          attributes
        )
      `)
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Vendor Flash Deals GET notice:', error.message);
      return NextResponse.json({ success: true, deals: [] });
    }

    return NextResponse.json({ success: true, deals: deals || [] });
  } catch (err: any) {
    console.error('Vendor Flash Deals GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authenticateVendor(request);
  if ('errorResponse' in auth) return auth.errorResponse;
  const { vendor } = auth;

  try {
    const body = await request.json();
    const { product_id, variant_id, deal_price, promotional_stock, starts_at, ends_at } = body;

    if (!product_id || !variant_id || !deal_price || !promotional_stock || !starts_at || !ends_at) {
      return NextResponse.json(
        { success: false, error: 'All fields are required: product_id, variant_id, deal_price, promotional_stock, starts_at, ends_at' },
        { status: 400 }
      );
    }

    // 1. Verify product ownership and approval
    const { data: product, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, vendor_id, approval_status, status')
      .eq('id', product_id)
      .maybeSingle();

    if (prodErr || !product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    if (product.vendor_id !== vendor.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized: You do not own this product' }, { status: 403 });
    }

    if (product.approval_status !== 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Only admin-approved products can be submitted for Flash Deals' }, { status: 400 });
    }

    // 2. Verify variant and price
    const { data: variant, error: varErr } = await supabaseAdmin
      .from('product_variants')
      .select('id, product_id, price')
      .eq('id', variant_id)
      .maybeSingle();

    if (varErr || !variant || variant.product_id !== product_id) {
      return NextResponse.json({ success: false, error: 'Invalid product variant' }, { status: 400 });
    }

    const numDealPrice = Number(deal_price);
    const numOriginalPrice = Number(variant.price);
    const numStock = parseInt(promotional_stock, 10);

    if (isNaN(numDealPrice) || numDealPrice <= 0) {
      return NextResponse.json({ success: false, error: 'Deal price must be a positive number' }, { status: 400 });
    }

    if (numDealPrice >= numOriginalPrice) {
      return NextResponse.json(
        { success: false, error: `Deal price (PKR ${numDealPrice}) must be strictly lower than regular price (PKR ${numOriginalPrice})` },
        { status: 400 }
      );
    }

    if (isNaN(numStock) || numStock <= 0) {
      return NextResponse.json({ success: false, error: 'Promotional stock must be at least 1 unit' }, { status: 400 });
    }

    const startDate = new Date(starts_at);
    const endDate = new Date(ends_at);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid start or end date format' }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({ success: false, error: 'End date must be after start date' }, { status: 400 });
    }

    // 3. Insert deal with status PENDING_APPROVAL (Vendor self-approval strictly prevented)
    const { data: newDeal, error: insertErr } = await supabaseAdmin
      .from('flash_deals')
      .insert({
        vendor_id: vendor.id,
        product_id,
        variant_id,
        deal_price: numDealPrice,
        promotional_stock: numStock,
        reserved_stock: 0,
        sold_count: 0,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        status: 'PENDING_APPROVAL',
        is_active: true
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Insert flash deal error:', insertErr);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deal: newDeal });
  } catch (err: any) {
    console.error('Vendor Flash Deals POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await authenticateVendor(request);
  if ('errorResponse' in auth) return auth.errorResponse;
  const { vendor } = auth;

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Deal ID and action required' }, { status: 400 });
    }

    const { data: deal, error: dealErr } = await supabaseAdmin
      .from('flash_deals')
      .select('*')
      .eq('id', id)
      .eq('vendor_id', vendor.id)
      .maybeSingle();

    if (dealErr || !deal) {
      return NextResponse.json({ success: false, error: 'Deal not found or unauthorized' }, { status: 404 });
    }

    let updateFields: Record<string, any> = {};

    if (action === 'PAUSE') {
      updateFields = { is_active: false, status: 'PAUSED' };
    } else if (action === 'ACTIVATE') {
      // Only allow reactivating if already approved by admin
      if (deal.status !== 'APPROVED' && deal.status !== 'PAUSED') {
        return NextResponse.json({ success: false, error: 'Cannot activate an unapproved deal' }, { status: 400 });
      }
      updateFields = { is_active: true, status: 'APPROVED' };
    } else if (action === 'CANCEL') {
      updateFields = { is_active: false, status: 'ENDED' };
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('flash_deals')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deal: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
