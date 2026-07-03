import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: dbProducts, error } = await supabaseAdmin
      .from('products')
      .select('*, vendors(*), categories(*), product_variants(*)');

    if (error) throw error;

    const mapped = (dbProducts || []).map(p => {
      const vendor = p.vendors;
      const category = p.categories;
      const variants = p.product_variants || [];
      const defaultVariant = variants[0];
      const imagesObj = (p.images as any) || { main: '', gallery: [] };
      const image = imagesObj.main || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';

      return {
        id: p.id,
        sku: defaultVariant?.sku || '',
        name: p.name,
        category: category ? category.name.toLowerCase() : '',
        price: Number(defaultVariant?.price || 0),
        brand: p.brand || undefined,
        description: p.description,
        image,
        storeId: vendor?.store_slug || '',
        storeName: vendor?.store_name || '',
        approvalStatus: p.approval_status || 'APPROVED',
        rejectionReason: p.rejection_reason || undefined
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { data: product, error: findError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', body.id)
      .maybeSingle();

    if (findError) throw findError;
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        approval_status: body.approvalStatus,
        rejection_reason: body.rejectionReason || null
      })
      .eq('id', body.id);

    if (updateError) throw updateError;

    // Trigger notification to the Vendor owner
    try {
      const { data: vendor } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('id', product.vendor_id)
        .maybeSingle();

      if (vendor && vendor.owner_id) {
        let notifTitle = '';
        let notifMsg = '';

        if (body.approvalStatus === 'APPROVED') {
          notifTitle = 'Product Approved';
          notifMsg = `Your product "${product.name}" has been approved and is now live on the marketplace.`;
        } else if (body.approvalStatus === 'REJECTED') {
          notifTitle = 'Product Declined';
          notifMsg = `Your product "${product.name}" was declined. Reason: "${body.rejectionReason || 'Compliance review failed.'}"`;
        }

        if (notifTitle) {
          const { randomUUID } = require('crypto');
          await supabaseAdmin.from('notifications').insert({
            id: randomUUID(),
            user_id: vendor.owner_id,
            title: notifTitle,
            message: notifMsg,
            type: 'SECURITY',
            is_read: false
          });
        }
      }
    } catch (notificationError) {
      console.error('Failed to create product approval notification:', notificationError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
