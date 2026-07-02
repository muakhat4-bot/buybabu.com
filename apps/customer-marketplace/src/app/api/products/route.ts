import { NextResponse } from 'next/server';
import { supabaseAdmin, ProductStatus } from '@villex/supabase';

export const dynamic = 'force-dynamic';

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

    let query = supabaseAdmin
      .from('products')
      .select('*, vendors(*), categories(*), product_variants(*, inventories(*))', { count: 'exact' })
      .eq('status', 'PUBLISHED');

    if (id) {
      query = query.eq('id', id);
    }

    if (storeId) {
      const cleanStoreId = storeId.replace('#', '').toLowerCase();
      
      // Look up vendor
      let vQuery = supabaseAdmin
        .from('vendors')
        .select('id')
        .or(`store_name.eq."${storeId}",store_slug.eq."${cleanStoreId}"`);

      // If storeId is a valid UUID, include id.eq
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeId);
      if (isUuid) {
        vQuery = supabaseAdmin
          .from('vendors')
          .select('id')
          .or(`id.eq."${storeId}",store_name.eq."${storeId}",store_slug.eq."${cleanStoreId}"`);
      }

      const { data: v, error: vError } = await vQuery.maybeSingle();

      if (!vError && v) {
        query = query.eq('vendor_id', v.id);
      } else {
        return NextResponse.json([]);
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

      const { data: cats, error: catsError } = await supabaseAdmin
        .from('categories')
        .select('id')
        .in('slug', slugs);

      if (!catsError && cats && cats.length > 0) {
        query = query.in('category_id', cats.map(c => c.id));
      } else {
        return NextResponse.json([]);
      }
    }

    if (q) {
      const queryLower = q.toLowerCase();
      query = query.or(`name.ilike.%${queryLower}%,brand.ilike.%${queryLower}%,description.ilike.%${queryLower}%`);
    }

    const { data: dbProducts, error, count } = await query
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedProducts = (dbProducts || []).map(p => {
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
        storeId: vendor?.store_slug || '',
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

    if (id && mappedProducts.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (id) {
      return NextResponse.json(mappedProducts[0]);
    }

    const totalCount = count || 0;

    return new NextResponse(JSON.stringify(mappedProducts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'x-total-count': totalCount.toString(),
        'x-page': page.toString(),
        'x-limit': limit.toString()
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
