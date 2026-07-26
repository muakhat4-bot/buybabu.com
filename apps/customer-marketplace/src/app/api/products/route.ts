import { NextResponse } from 'next/server';
import { supabaseAdmin, ProductStatus } from '@villex/supabase';
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
    console.error('Error reading local db.json products in marketplace:', err);
  }
  return [];
}

function reconstructOptions(variants: any[]): any[] {
  const optionsMap: Record<string, Set<string>> = {};

  variants.forEach((v) => {
    const attrs = (v.attributes as Record<string, any>) || {};
    Object.keys(attrs).forEach((key) => {
      if (!optionsMap[key]) {
        optionsMap[key] = new Set<string>();
      }
      const val = attrs[key];
      if (val) {
        optionsMap[key].add(String(val));
      }
    });
  });

  return Object.keys(optionsMap).map((key, index) => ({
    id: `opt-${index}-${key}`,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    values: Array.from(optionsMap[key] || new Set<string>())
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip = (page - 1) * limit;

    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const id = searchParams.get('id');

    let mappedProducts: any[] = [];

    try {
      let query = supabaseAdmin
        .from('products')
        .select('*, vendors!inner(*), categories(*), product_variants(*, inventories(*))', { count: 'exact' })
        .eq('status', 'PUBLISHED')
        .eq('approval_status', 'APPROVED')
        .eq('vendors.status', 'ACTIVE');

      if (id) {
        query = query.eq('id', id);
      }

      if (storeId) {
        const cleanStoreId = storeId.replace('#', '').toLowerCase().trim();
        let vQuery = supabaseAdmin.from('vendors').select('id');
        vQuery = vQuery.or(`id.eq."${storeId}",store_name.ilike."${storeId}",store_slug.ilike."${cleanStoreId}"`);

        const { data: v } = await vQuery.maybeSingle();

        if (v) {
          query = query.eq('vendor_id', v.id);
        }
      }

      if (category) {
        const catLower = category.toLowerCase().trim();
        const categorySlugMap: Record<string, string[]> = {
          'smart-gadgets': ['smart gadgets'],
          'apparel': ['apparels & clothing', 'apparel', 'clothing'],
          'baby-care': ['mother & baby care', 'baby care'],
          'electronics': ['electronics', 'audio', 'chargers', 'keyboards', 'wearables', 'accessories'],
          'kitchen': ['kitchen essentials', 'kitchen'],
          'bath': ['bath essentials', 'bath'],
          'home': ['home arrivals', 'home'],
          'beauty': ['beauty and cosmetics', 'beauty', 'cosmetics'],
          'fitness': ['health & fitness', 'fitness'],
          'tools': ['tools'],
        };

        const searchCategories = categorySlugMap[catLower] || [catLower];
        const slugs = searchCategories.map(c => c.replace(/\s+/g, '-').toLowerCase());

        const { data: cats } = await supabaseAdmin
          .from('categories')
          .select('id')
          .in('slug', slugs);

        if (cats && cats.length > 0) {
          query = query.in('category_id', cats.map(c => c.id));
        }
      }

      if (q) {
        const queryLower = q.toLowerCase();
        query = query.or(`name.ilike.%${queryLower}%,brand.ilike.%${queryLower}%,description.ilike.%${queryLower}%`);
      }

      const { data: dbProducts } = await query
        .range(skip, skip + limit - 1)
        .order('created_at', { ascending: false });

      if (dbProducts && dbProducts.length > 0) {
        mappedProducts = dbProducts.map(p => {
          const vendor = p.vendors;
          const categoryObj = p.categories;
          const variants = p.product_variants || [];
          const defaultVariant = variants[0];
          const inventory = defaultVariant?.inventories?.[0] || defaultVariant?.inventories || null;

          const imagesObj = (p.images as any) || { main: '', gallery: [] };
          const image = imagesObj.main || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';
          const gallery = imagesObj.gallery || [];
          const images = [image, ...gallery];

          return {
            id: p.id,
            sku: defaultVariant?.sku || '',
            name: p.name,
            category: categoryObj ? categoryObj.name.toLowerCase() : '',
            price: Number(defaultVariant?.price || 0),
            oldPrice: defaultVariant?.compare_at_price ? Number(defaultVariant.compare_at_price) : undefined,
            discount: defaultVariant?.compare_at_price && Number(defaultVariant.price) < Number(defaultVariant.compare_at_price)
              ? Math.round(((Number(defaultVariant.compare_at_price) - Number(defaultVariant.price)) / Number(defaultVariant.compare_at_price)) * 100)
              : undefined,
            rating: Number(p.avg_rating),
            reviews: p.review_count,
            brand: p.brand || undefined,
            inStock: inventory ? inventory.stock_qty > 0 : false,
            freeShipping: true,
            expressDelivery: true,
            description: p.description,
            image,
            images,
            gallery,
            specs: (p.specifications as any) || {},
            storeId: vendor?.store_slug || vendor?.id || '',
            storeName: vendor?.store_name || '',
            options: reconstructOptions(variants),
            variants: variants.map((v: any) => {
              const inv = v.inventories?.[0] || v.inventories || null;
              return {
                name: (v.attributes as any)?.option || (v.attributes as any)?.name || 'Default',
                price: Number(v.price),
                stock: inv?.stock_qty || 0,
                sku: v.sku,
                active: v.is_active
              };
            })
          };
        });
      }
    } catch (dbErr) {
      console.warn('Customer marketplace Supabase query warning:', dbErr);
    }

    // Merge with db.json products
    const localProducts = readLocalDbProducts();
    let combined = [...mappedProducts];

    for (const lp of localProducts) {
      const exists = combined.some((p) => p.id === lp.id || (p.sku && lp.sku && p.sku.toLowerCase() === lp.sku.toLowerCase()));
      if (!exists) {
        combined.push(lp);
      }
    }

    // Apply storeId filtering
    if (storeId) {
      const cleanStoreId = storeId.replace('#', '').toLowerCase().trim();
      combined = combined.filter((p: any) => {
        const pStoreId = (p.storeId || '').replace('#', '').toLowerCase().trim();
        const pStoreName = (p.storeName || '').toLowerCase().trim();
        return pStoreId === cleanStoreId || pStoreName === cleanStoreId || pStoreName.includes(cleanStoreId) || cleanStoreId.includes(pStoreName);
      });
    }

    // Apply category filtering
    if (category) {
      const catLower = category.toLowerCase().trim();
      combined = combined.filter((p: any) => (p.category || '').toLowerCase().includes(catLower));
    }

    // Apply query search filtering
    if (q) {
      const qLower = q.toLowerCase().trim();
      combined = combined.filter((p: any) =>
        (p.name || '').toLowerCase().includes(qLower) ||
        (p.sku || '').toLowerCase().includes(qLower) ||
        (p.description || '').toLowerCase().includes(qLower)
      );
    }

    // Apply single ID filtering
    if (id) {
      const matched = combined.find((p: any) => p.id === id);
      if (!matched) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(matched);
    }

    const totalCount = combined.length;

    return new NextResponse(JSON.stringify(combined), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-total-count': totalCount.toString(),
        'x-page': page.toString(),
        'x-limit': limit.toString()
      }
    });
  } catch (err: any) {
    console.error('API /api/products error:', err);
    return NextResponse.json([]);
  }
}
