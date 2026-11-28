import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
import { isAuthorizedAdmin, unauthorizedResponse, verifyAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let query = supabaseAdmin
      .from('flash_deals')
      .select(`
        *,
        products (
          id,
          name,
          images,
          approval_status,
          status,
          categories (
            id,
            name
          )
        ),
        product_variants (
          id,
          sku,
          price,
          compare_at_price,
          attributes
        ),
        vendors (
          id,
          store_name,
          store_slug,
          owner_id
        )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data: deals, error } = await query;

    if (error) {
      console.warn('Admin Flash Deals GET notice:', error.message);
      return NextResponse.json({ success: true, deals: [] });
    }

    return NextResponse.json({ success: true, deals: deals || [] });
  } catch (err: any) {
    console.error('Admin Flash Deals GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const tokenData = await verifyAdminToken(token);
    const adminEmail = tokenData.payload?.email || 'admin@buybabu.com';

    const body = await request.json();
    const { id, action, rejectionReason } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Deal ID and action are required' }, { status: 400 });
    }

    const { data: deal, error: dealErr } = await supabaseAdmin
      .from('flash_deals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (dealErr || !deal) {
      return NextResponse.json({ success: false, error: 'Flash deal not found' }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    let updateFields: Record<string, any> = {};
    let auditAction = '';

    if (action === 'APPROVE') {
      updateFields = {
        status: 'APPROVED',
        is_active: true,
        approved_by_email: adminEmail,
        approved_at: nowIso,
        rejection_reason: null
      };
      auditAction = 'APPROVED';
    } else if (action === 'REJECT') {
      updateFields = {
        status: 'REJECTED',
        is_active: false,
        rejection_reason: rejectionReason || 'Does not meet merchandising standards'
      };
      auditAction = 'REJECTED';
    } else if (action === 'PAUSE') {
      updateFields = {
        status: 'PAUSED',
        is_active: false
      };
      auditAction = 'PAUSED';
    } else if (action === 'ACTIVATE') {
      updateFields = {
        status: 'APPROVED',
        is_active: true
      };
      auditAction = 'ACTIVATED';
    } else if (action === 'END') {
      updateFields = {
        status: 'ENDED',
        is_active: false
      };
      auditAction = 'ENDED';
    } else {
      return NextResponse.json({ success: false, error: 'Invalid admin action' }, { status: 400 });
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

    // Attempt to log audit trail to flash_deal_approvals
    try {
      await supabaseAdmin.from('flash_deal_approvals').insert({
        deal_id: id,
        admin_email: adminEmail,
        action: auditAction,
        reason: rejectionReason || null,
        deal_snapshot: {
          product_id: deal.product_id,
          variant_id: deal.variant_id,
          deal_price: deal.deal_price,
          promotional_stock: deal.promotional_stock,
          starts_at: deal.starts_at,
          ends_at: deal.ends_at
        }
      });
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({ success: true, deal: updated });
  } catch (err: any) {
    console.error('Admin Flash Deals PUT error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
