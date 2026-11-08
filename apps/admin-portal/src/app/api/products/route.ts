import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
import { randomUUID } from 'crypto';
import { isAuthorizedAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const { data: dbProducts, error } = await supabaseAdmin
      .from('products')
      .select('*, vendors(*), categories(*), product_variants(*)');

    if (error) throw error;

    const mappedProducts = (dbProducts || []).map(p => {
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
        storeId: vendor?.store_slug || vendor?.id || '',
        storeName: vendor?.store_name || '',
        approvalStatus: p.approval_status || 'APPROVED',
        rejectionReason: p.rejection_reason || undefined
      };
    });

    return NextResponse.json(mappedProducts);
  } catch (err: any) {
    console.warn('Supabase fetch products error in admin-portal:', err);
    return NextResponse.json([]);
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const { data: product, error: findError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', body.id)
      .maybeSingle();

    if (findError) throw findError;

    if (product) {
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({
          approval_status: body.approvalStatus,
          rejection_reason: body.rejectionReason || null,
          status: body.approvalStatus === 'APPROVED' ? 'PUBLISHED' : 'DRAFT'
        })
        .eq('id', body.id);

      if (updateError) throw updateError;

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
      } catch (notifErr) {
        console.error('Failed notification creation in admin-portal:', notifErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin product PUT error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
