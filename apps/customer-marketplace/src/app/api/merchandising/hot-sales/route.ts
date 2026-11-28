import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

let cachedHotSales: any[] | null = null;
let hotSalesCacheTime = 0;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  try {
    const nowMs = Date.now();
    if (cachedHotSales && nowMs - hotSalesCacheTime < CACHE_TTL_MS) {
      return NextResponse.json(cachedHotSales, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
          'x-cache': 'HIT'
        }
      });
    }

    const now = new Date();

    // 1. Calculate Pakistan Standard Time (PKT, UTC+5) start and end of day
    const pktOffsetMs = 5 * 60 * 60 * 1000;
    const pktNow = new Date(now.getTime() + pktOffsetMs);
    const year = pktNow.getUTCFullYear();
    const month = String(pktNow.getUTCMonth() + 1).padStart(2, '0');
    const day = String(pktNow.getUTCDate()).padStart(2, '0');

    const pktDayStartUtc = new Date(`${year}-${month}-${day}T00:00:00+05:00`).toISOString();
    const pktDayEndUtc = new Date(`${year}-${month}-${day}T23:59:59.999+05:00`).toISOString();
    const nowIso = now.toISOString();

    // 2. Fetch active flash deal product IDs to enforce strict exclusivity
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

    // 3. Query qualifying orders created in Pakistan timezone today
    const { data: qualifyingOrders, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_status,
        created_at,
        payments (
          id,
          payment_method,
          status,
          transaction_id
        ),
        order_items (
          id,
          product_id,
          variant_id,
          quantity,
          unit_price
        )
      `)
      .gte('created_at', pktDayStartUtc)
      .lte('created_at', pktDayEndUtc)
      .neq('order_status', 'CANCELLED');

    if (orderErr) {
      console.warn('Hot Sales API query notice:', orderErr.message);
      return NextResponse.json([]);
    }

    if (!qualifyingOrders || qualifyingOrders.length === 0) {
      // Professional empty state: no sales recorded yet today
      return NextResponse.json([]);
    }

    // 4. Aggregate genuine sales quantities per product
    // Qualifying rules:
    // - Online payment: payment.status === 'COMPLETED'
    // - COD: order_status === 'DELIVERED'
    const salesVolumeByProduct: Record<string, number> = {};

    qualifyingOrders.forEach((order: any) => {
      const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments;
      const paymentMethod = payment?.payment_method || 'COD';
      const paymentStatus = payment?.status;
      const orderStatus = order.order_status;

      let isQualifying = false;
      if (paymentMethod === 'COD') {
        // COD qualifies only upon verified delivery
        isQualifying = orderStatus === 'DELIVERED';
      } else {
        // Online payments qualify when completed
        isQualifying = paymentStatus === 'COMPLETED';
      }

      if (isQualifying) {
        const items = order.order_items || [];
        items.forEach((item: any) => {
          if (item.product_id) {
            salesVolumeByProduct[item.product_id] = (salesVolumeByProduct[item.product_id] || 0) + Number(item.quantity || 1);
          }
        });
      }
    });

    const qualifyingProductIds = Object.keys(salesVolumeByProduct)
      .filter((pid) => !flashDealProductIds.includes(pid))
      .sort((a, b) => (salesVolumeByProduct[b] ?? 0) - (salesVolumeByProduct[a] ?? 0))
      .slice(0, 10);

    if (qualifyingProductIds.length === 0) {
      return NextResponse.json([]);
    }

    // 5. Fetch product details for top ranked products
    const { data: dbProducts, error: prodErr } = await supabaseAdmin
      .from('products')
      .select(`
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
      `)
      .in('id', qualifyingProductIds)
      .eq('status', 'PUBLISHED')
      .eq('approval_status', 'APPROVED')
      .eq('vendors.status', 'ACTIVE');

    if (prodErr || !dbProducts) {
      return NextResponse.json([]);
    }

    // Maintain ranking order by sales volume
    const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));
    const rankedProducts = qualifyingProductIds
      .map((pid, rankIndex) => {
        const p = productMap.get(pid);
        if (!p) return null;

        const variants = p.product_variants || [];
        const defaultVariant = variants[0];
        const imagesObj = (p.images as any) || { main: '', gallery: [] };
        const mainImage = imagesObj.main || (Array.isArray(imagesObj) ? imagesObj[0] : '') || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';

        const price = Number(defaultVariant?.price || 0);
        const oldPrice = defaultVariant?.compare_at_price ? Number(defaultVariant.compare_at_price) : undefined;
        const discount = oldPrice && price < oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;

        return {
          id: p.id,
          rank: rankIndex + 1,
          unitsSoldToday: salesVolumeByProduct[pid],
          tag: 'Hot Sale',
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
      })
      .filter(Boolean);

    cachedHotSales = rankedProducts;
    hotSalesCacheTime = Date.now();

    return NextResponse.json(rankedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'x-cache': 'MISS'
      }
    });
  } catch (err: any) {
    console.error('Error in /api/merchandising/hot-sales:', err);
    return NextResponse.json([]);
  }
}
