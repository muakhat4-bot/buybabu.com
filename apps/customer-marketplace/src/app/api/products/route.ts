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

    let mappedProducts: any[] = [];

    const categorySlugMap: Record<string, string[]> = {
      'smart-gadgets': ['smart gadgets', 'smart-gadgets'],
      'smart gadgets': ['smart gadgets', 'smart-gadgets'],
      'apparel': ['apparels & clothing', 'apparel', 'clothing'],
      'apparels & clothing': ['apparels & clothing', 'apparel', 'clothing'],
      'baby-care': ['mother & baby care', 'baby care', 'baby-care'],
      'mother & baby care': ['mother & baby care', 'baby care', 'baby-care'],
      'electronics': ['electronics', 'audio', 'chargers', 'keyboards', 'wearables', 'accessories'],
      'kitchen': ['kitchen essentials', 'kitchen-essentials', 'kitchen'],
      'kitchen-essentials': ['kitchen essentials', 'kitchen-essentials', 'kitchen'],
      'kitchen essentials': ['kitchen essentials', 'kitchen-essentials', 'kitchen'],
      'bath': ['bath essentials', 'bath-essentials', 'bath'],
      'bath essentials': ['bath essentials', 'bath-essentials', 'bath'],
      'bath-essentials': ['bath essentials', 'bath-essentials', 'bath'],
      'home': ['home arrivals', 'home-arrivals', 'home'],
      'home-arrivals': ['home arrivals', 'home-arrivals', 'home'],
      'home arrivals': ['home arrivals', 'home-arrivals', 'home'],
      'beauty': ['beauty and cosmetics', 'beauty-and-cosmetics', 'beauty', 'cosmetics'],
      'beauty and cosmetics': ['beauty and cosmetics', 'beauty-and-cosmetics', 'beauty', 'cosmetics'],
      'fitness': ['health & fitness', 'health-fitness', 'fitness'],
      'health & fitness': ['health & fitness', 'health-fitness', 'fitness'],
      'tools': ['tools'],
    };

    try {
      let query = supabaseAdmin
        .from('products')
        .select('*, vendors!inner(*), categories(*), product_variants(*)', { count: 'exact' })
        .eq('status', 'PUBLISHED')
        .eq('approval_status', 'APPROVED')
        .eq('vendors.status', 'ACTIVE')
        .is('deleted_at', null)
        .is('vendors.deleted_at', null);

      if (id) {
        query = query.eq('id', id);
      }

      if (storeId) {
        const cleanStoreId = storeId.replace('#', '').trim();
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isUuid = UUID_REGEX.test(cleanStoreId);

        let vQuery = supabaseAdmin.from('vendors').select('id');
        if (isUuid) {
          vQuery = vQuery.or(`id.eq.${cleanStoreId},store_slug.ilike."${cleanStoreId}",store_name.ilike."${cleanStoreId}"`);
        } else {
          vQuery = vQuery.or(`store_slug.ilike."${cleanStoreId}",store_name.ilike."${cleanStoreId}"`);
        }

        const { data: v } = await vQuery.maybeSingle();

        if (v) {
          query = query.eq('vendor_id', v.id);
        }
      }

      if (category) {
        const catLower = category.toLowerCase().trim();
        const catSlug = catLower.replace(/\s+/g, '-');
        const catName = catLower.replace(/-/g, ' ');

        const searchKeywords = categorySlugMap[catLower] || categorySlugMap[catSlug] || [catLower, catSlug, catName];
        const searchSlugs = Array.from(new Set([
          ...searchKeywords.map(k => k.replace(/\s+/g, '-')),
          catSlug
        ]));

        const { data: cats } = await supabaseAdmin
          .from('categories')
          .select('id')
          .in('slug', searchSlugs);

        if (cats && cats.length > 0) {
          query = query.in('category_id', cats.map(c => c.id));
        }
      }

      if (q) {
        const queryLower = q.toLowerCase();
        query = query.or(`name.ilike.%${queryLower}%,brand.ilike.%${queryLower}%,description.ilike.%${queryLower}%`);
      }

      const { data: dbProducts, error: dbError } = await query
        .range(skip, skip + limit - 1)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Supabase products fetch error in customer marketplace:', dbError);
      }

      if (dbProducts && dbProducts.length > 0) {
        // Collect all variant IDs to fetch inventory quantities separately (avoids invalid FK join issues)
        const variantIds = dbProducts
          .flatMap((p: any) => (p.product_variants || []).map((v: any) => v.id))
          .filter(Boolean);

        const inventoryMap: Record<string, number> = {};
        if (variantIds.length > 0) {
          try {
            const { data: inventoryData, error: invError } = await supabaseAdmin
              .from('inventories')
              .select('variant_id, quantity')
              .in('variant_id', variantIds);

            if (!invError && inventoryData) {
              inventoryData.forEach((item: any) => {
                if (item.variant_id) {
                  inventoryMap[item.variant_id] = (inventoryMap[item.variant_id] || 0) + Number(item.quantity || 0);
                }
              });
            }
          } catch (invErr) {
            console.warn('Inventory fetch warning in customer marketplace:', invErr);
          }
        }

        mappedProducts = dbProducts.map(p => {
          const vendor = p.vendors;
          const categoryObj = p.categories;
          const variants = p.product_variants || [];
          const defaultVariant = variants[0];
          
          const defaultStock = defaultVariant ? (inventoryMap[defaultVariant.id] || 0) : 0;
          const totalStock = variants.reduce((sum: number, v: any) => sum + (inventoryMap[v.id] || 0), 0);

          const imagesObj = (p.images as any) || { main: '', gallery: [] };
          const image = imagesObj.main || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';
          const gallery = imagesObj.gallery || [];
          const images = [image, ...gallery];

          return {
            id: p.id,
            sku: defaultVariant?.sku || '',
            name: p.name,
            category: categoryObj ? categoryObj.name.toLowerCase() : '',
            categorySlug: categoryObj?.slug || '',
            price: Number(defaultVariant?.price || 0),
            oldPrice: defaultVariant?.compare_at_price ? Number(defaultVariant.compare_at_price) : undefined,
            discount: defaultVariant?.compare_at_price && Number(defaultVariant.price) < Number(defaultVariant.compare_at_price)
              ? Math.round(((Number(defaultVariant.compare_at_price) - Number(defaultVariant.price)) / Number(defaultVariant.compare_at_price)) * 100)
              : undefined,
            rating: Number(p.avg_rating || 5),
            reviews: p.review_count || 0,
            brand: p.brand || undefined,
            inStock: totalStock > 0 || defaultStock > 0,
            stock: totalStock > 0 ? totalStock : defaultStock,
            freeShipping: true,
            expressDelivery: true,
            description: p.description,
            createdAt: p.created_at,
            image,
            images,
            gallery,
            specs: (p.specifications as any) || {},
            storeId: vendor?.store_slug || vendor?.id || '',
            storeName: vendor?.store_name || '',
            options: reconstructOptions(variants),
            variants: variants.map((v: any) => ({
              id: v.id,
              name: (v.attributes as any)?.option || (v.attributes as any)?.name || v.name || 'Default',
              price: Number(v.price),
              stock: inventoryMap[v.id] || 0,
              sku: v.sku,
              active: v.is_active
            }))
          };
        });
      }
    } catch (dbErr) {
      console.warn('Customer marketplace Supabase query warning:', dbErr);
    }

    let combined = [...mappedProducts];

    // Apply storeId filtering
    if (storeId) {
      const cleanStoreId = storeId.replace('#', '').toLowerCase().trim();
      combined = combined.filter((p: any) => {
        const pStoreId = (p.storeId || '').replace('#', '').toLowerCase().trim();
        const pStoreName = (p.storeName || '').toLowerCase().trim();
        return pStoreId === cleanStoreId || pStoreName === cleanStoreId || pStoreName.includes(cleanStoreId) || cleanStoreId.includes(pStoreName);
      });
    }

    // Apply category filtering with normalized slug and name support
    if (category) {
      const catLower = category.toLowerCase().trim();
      const catSlug = catLower.replace(/\s+/g, '-');
      const catNorm = catLower.replace(/-/g, ' ');

      const searchKeywords = categorySlugMap[catLower] || categorySlugMap[catSlug] || [catLower, catSlug, catNorm];
      const normalizedKeywords = searchKeywords.map(k => k.toLowerCase().replace(/-/g, ' ').trim());

      combined = combined.filter((p: any) => {
        const prodCat = (p.category || '').toLowerCase().trim();
        const prodCatNorm = prodCat.replace(/-/g, ' ');
        const prodSlug = (p.categorySlug || '').toLowerCase().trim();

        return (
          prodSlug === catSlug ||
          prodCat === catLower ||
          prodCatNorm === catNorm ||
          normalizedKeywords.some(k => prodCatNorm.includes(k) || k.includes(prodCatNorm))
        );
      });
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
