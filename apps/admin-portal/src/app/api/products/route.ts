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

function readLocalDbProducts() {
  try {
    const p = getDbJsonPath();
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      return data.products || [];
    }
  } catch (err) {
    console.error('Error reading db.json in admin-portal:', err);
  }
  return [];
}

function updateLocalDbProductApproval(id: string, approvalStatus: string, rejectionReason?: string) {
  try {
    const p = getDbJsonPath();
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.products) return;

    let updated = false;
    data.products = data.products.map((prod: any) => {
      if (prod.id === id || (prod.sku && prod.sku === id)) {
        updated = true;
        return {
          ...prod,
          approvalStatus,
          approval_status: approvalStatus,
          rejectionReason: rejectionReason || null,
          status: approvalStatus === 'APPROVED' ? 'PUBLISHED' : 'DRAFT'
        };
      }
      return prod;
    });

    if (updated) {
      fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error updating db.json product in admin-portal:', err);
  }
}

export async function GET() {
  try {
    let mappedProducts: any[] = [];

    try {
      const { data: dbProducts } = await supabaseAdmin
        .from('products')
        .select('*, vendors(*), categories(*), product_variants(*)');

      if (dbProducts && dbProducts.length > 0) {
        mappedProducts = dbProducts.map(p => {
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
      }
    } catch (err) {
      console.warn('Supabase fetch products warning in admin-portal:', err);
    }

    const localProducts = readLocalDbProducts();
    let combined = [...mappedProducts];

    for (const lp of localProducts) {
      const exists = combined.some((p) => p.id === lp.id || (p.sku && lp.sku && p.sku.toLowerCase() === lp.sku.toLowerCase()));
      if (!exists) {
        combined.push({
          ...lp,
          approvalStatus: lp.approvalStatus || lp.approval_status || 'APPROVED'
        });
      }
    }

    return NextResponse.json(combined);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    updateLocalDbProductApproval(body.id, body.approvalStatus, body.rejectionReason);

    try {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', body.id)
        .maybeSingle();

      if (product) {
        await supabaseAdmin
          .from('products')
          .update({
            approval_status: body.approvalStatus,
            rejection_reason: body.rejectionReason || null,
            status: body.approvalStatus === 'APPROVED' ? 'PUBLISHED' : 'DRAFT'
          })
          .eq('id', body.id);

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
        } catch (notifErr) {
          console.error('Failed notification creation:', notifErr);
        }
      }
    } catch (err) {
      console.warn('Supabase PUT product warning in admin-portal:', err);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
