import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

let cachedTrending: any[] | null = null;
let trendingCacheTime = 0;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedTrending && now - trendingCacheTime < CACHE_TTL_MS) {
      return NextResponse.json(cachedTrending, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
          'x-cache': 'HIT'
        }
      });
    }

    const nowIso = new Date().toISOString();

    // 1. Fetch active approved flash deal product IDs to enforce exclusivity
    let flashDealProductIds: string[] = [];
    try {
      const { data: deals } = await supabaseAdmin
        .from('flash_deals')
        .select('product_id')
        .eq('status', 'APPROVED')
        .eq('is_active', true)
        .lte('starts_at', nowIso)
        .gte('ends_at', nowIso);

      if (deals) {
        flashDealProductIds = deals.map((d: any) => d.product_id).filter(Boolean);
      }
    } catch {
      // Table may not exist yet
    }

    // 2. Fetch curated trending items ordered by display_order
    let query = supabaseAdmin
      .from('trending_items')
      .select(`
        id,
        display_order,
        priority,
        starts_at,
        ends_at,
        is_active,
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
          ),
          product_variants (
            id,
            sku,
            price,
            compare_at_price
          )
        )
      `)
      .eq('is_active', true)
      .eq('products.status', 'PUBLISHED')
      .eq('products.approval_status', 'APPROVED')
      .eq('products.vendors.status', 'ACTIVE')
      .order('display_order', { ascending: true });

    const { data: trendingData, error } = await query;

    if (error) {
      console.warn('Customer Trending Items API notice:', error.message);
      return NextResponse.json([]);
    }

    if (!trendingData || trendingData.length === 0) {
      return NextResponse.json([]);
    }

    // 3. Filter valid date range and enforce flash deal exclusivity
    const validItems = trendingData.filter((item: any) => {
      const p = item.products;
      if (!p) return false;

      // Exclude if product has an active flash deal
      if (flashDealProductIds.includes(p.id)) return false;

      // Date window check
      if (item.starts_at && new Date(item.starts_at).toISOString() > nowIso) return false;
      if (item.ends_at && new Date(item.ends_at).toISOString() < nowIso) return false;

      return true;
    });

    const mapped = validItems.map((item: any) => {
      const p = item.products;
      const variants = p.product_variants || [];
      const defaultVariant = variants[0];
      const imagesObj = (p.images as any) || { main: '', gallery: [] };
      const mainImage = imagesObj.main || (Array.isArray(imagesObj) ? imagesObj[0] : '') || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';

      const price = Number(defaultVariant?.price || 0);
      const oldPrice = defaultVariant?.compare_at_price ? Number(defaultVariant.compare_at_price) : undefined;
      const discount = oldPrice && price < oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;

      return {
        id: p.id,
        trendingId: item.id,
        displayOrder: item.display_order,
        priority: item.priority || 'NORMAL',
        tag: 'Trending',
        name: p.name,
        brand: p.brand || 'Generic',
        description: p.description || '',
        image: mainImage,
        images: [mainImage, ...(imagesObj.gallery || [])],
        price,
        oldPrice,
        discount,
        rating: Number(p.avg_rating || 5),
        reviews: p.review_count || 0,
        storeId: p.vendors?.store_slug || p.vendors?.id || '',
        storeName: p.vendors?.store_name || '',
        category: p.categories?.name?.toLowerCase() || '',
        inStock: true
      };
    });

    cachedTrending = mapped;
    trendingCacheTime = Date.now();

    return NextResponse.json(mapped, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'x-cache': 'MISS'
      }
    });
  } catch (err: any) {
    console.error('Error in /api/merchandising/trending:', err);
    return NextResponse.json([]);
  }
}
