import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

let cachedDeals: any[] | null = null;
let dealsCacheTime = 0;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedDeals && now - dealsCacheTime < CACHE_TTL_MS) {
      return NextResponse.json(cachedDeals, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
          'x-cache': 'HIT'
        }
      });
    }

    const nowIso = new Date().toISOString();

    const { data: dbDeals, error } = await supabaseAdmin
      .from('flash_deals')
      .select(`
        *,
        products!inner (
          id,
          name,
          brand,
          description,
          images,
          avg_rating,
          review_count,
          status,
          approval_status,
          vendors!inner (
            id,
            store_name,
            store_slug,
            status
          ),
          categories (
            id,
            name,
            slug
          )
        ),
        product_variants (
          id,
          sku,
          price,
          compare_at_price,
          attributes
        )
      `)
      .eq('status', 'APPROVED')
      .eq('is_active', true)
      .lte('starts_at', nowIso)
      .gte('ends_at', nowIso)
      .eq('products.status', 'PUBLISHED')
      .eq('products.approval_status', 'APPROVED')
      .eq('products.vendors.status', 'ACTIVE')
      .order('starts_at', { ascending: false });

    if (error) {
      // Table may not exist yet if migration has not been applied
      console.warn('Customer Flash Deals API notice:', error.message);
      return NextResponse.json([]);
    }

    if (!dbDeals || dbDeals.length === 0) {
      return NextResponse.json([]);
    }

    const mappedDeals = dbDeals.map((d: any) => {
      const product = d.products;
      const variant = d.product_variants;
      const imagesObj = (product.images as any) || { main: '', gallery: [] };
      const mainImage = imagesObj.main || (Array.isArray(imagesObj) ? imagesObj[0] : '') || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';

      const originalPrice = Number(variant?.price || d.deal_price || 0);
      const dealPrice = Number(d.deal_price || 0);
      const discountPct = originalPrice > 0 ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100) : 0;
      const promotionalStock = Number(d.promotional_stock || 0);
      const soldCount = Number(d.sold_count || 0);
      const soldPercent = promotionalStock > 0 ? Math.min(100, Math.round((soldCount / promotionalStock) * 100)) : 0;
      const remainingStock = Math.max(0, promotionalStock - soldCount - Number(d.reserved_stock || 0));

      return {
        id: d.id,
        dealId: d.id,
        productId: product.id,
        variantId: variant?.id || null,
        name: product.name,
        brand: product.brand || 'Generic',
        description: product.description || '',
        image: mainImage,
        images: [mainImage, ...(imagesObj.gallery || [])],
        price: dealPrice,
        originalPrice,
        oldPrice: originalPrice,
        discount: discountPct,
        discountPercentage: discountPct,
        promotionalStock,
        soldCount,
        soldPercent,
        remainingStock,
        startsAt: d.starts_at,
        endsAt: d.ends_at,
        storeId: product.vendors?.store_slug || product.vendors?.id || '',
        storeName: product.vendors?.store_name || '',
        category: product.categories?.name?.toLowerCase() || '',
        rating: Number(product.avg_rating || 5),
        reviews: product.review_count || 0,
        inStock: remainingStock > 0
      };
    });

    cachedDeals = mappedDeals;
    dealsCacheTime = Date.now();

    return NextResponse.json(mappedDeals, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'x-cache': 'MISS'
      }
    });
  } catch (err: any) {
    console.error('Error in /api/merchandising/flash-deals:', err);
    return NextResponse.json([]);
  }
}
