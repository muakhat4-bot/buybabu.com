import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

// In-memory response cache (30 seconds TTL) for blazing fast sub-millisecond responses
interface CacheEntry {
  timestamp: number;
  body: string;
  totalCount: string;
  page: string;
  limit: string;
  totalPages: string;
  hasMore: string;
}
const productsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 1000;

// Flash deal check cache to avoid repeated schema misses when table is not yet migrated
let lastFlashDealCheck = 0;
let flashDealsTableAvailable = true;
let cachedFlashDealProductIds: string[] = [];
const FLASH_DEAL_CACHE_MS = 60 * 1000;

// Category slug cache to avoid redundant round-trip database queries on category listing
interface CategoryCacheData {
  timestamp: number;
  slugMap: Map<string, number>;
}
let categoryCache: CategoryCacheData | null = null;
const CATEGORY_CACHE_MS = 5 * 60 * 1000; // 5 minutes

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

/**
 * Sanitizes image URL. Converts raw base64 data URIs into lightweight streaming route URLs
 * to eliminate multi-megabyte JSON payloads, while leaving standard HTTPS URLs intact.
 */
function formatProductImageUrl(rawImage: any, productId: string, index: number = 0): string {
  if (!rawImage || typeof rawImage !== 'string') {
    return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';
  }
  const trimmed = rawImage.trim();
  if (trimmed.startsWith('data:image/') || trimmed.length > 500) {
    return `/api/products/image?id=${encodeURIComponent(productId)}&idx=${index}`;
  }
  return trimmed;
}

export async function GET(request: Request) {
  try {
    const cacheKey = request.url;
    const now = Date.now();
    const cached = productsCache.get(cacheKey);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return new NextResponse(cached.body, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
          'x-cache': 'HIT',
          'x-total-count': cached.totalCount,
          'x-page': cached.page,
          'x-limit': cached.limit,
          'x-total-pages': cached.totalPages,
          'x-has-more': cached.hasMore
        }
      });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '24', 10));
    const skip = (page - 1) * limit;

    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const id = searchParams.get('id');

    let mappedProducts: any[] = [];
    let activeFlashDealProductIds: string[] = [];

    const categorySlugMap: Record<string, string[]> = {
      'smart-gadgets': ['smart gadgets', 'smart-gadgets'],
      'smart gadgets': ['smart gadgets', 'smart-gadgets'],
      'apparel': ['apparels & clothing', 'apparel', 'clothing'],
      'apparels & clothing': ['apparels & clothing', 'apparel', 'clothing'],
      'clothing': ['apparels & clothing', 'apparel', 'clothing'],
      'baby-care': ['mother & baby care', 'baby care', 'baby-care'],
      'mother & baby care': ['mother & baby care', 'baby care', 'baby-care'],
      'baby care': ['mother & baby care', 'baby care', 'baby-care'],
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
      'cosmetics': ['beauty and cosmetics', 'beauty-and-cosmetics', 'beauty', 'cosmetics'],
      'fitness': ['health & fitness', 'health-fitness', 'fitness'],
      'health & fitness': ['health & fitness', 'health-fitness', 'fitness'],
      'tools': ['tools'],
    };

    // Parallel Flash Deals check promise to overlap network latency with the products query
    const flashDealsPromise = (async (): Promise<string[]> => {
      if (!flashDealsTableAvailable || (now - lastFlashDealCheck <= FLASH_DEAL_CACHE_MS && cachedFlashDealProductIds.length > 0)) {
        return cachedFlashDealProductIds;
      }
      lastFlashDealCheck = now;
      try {
        const nowIso = new Date().toISOString();
        const { data: deals, error: dealsErr } = await supabaseAdmin
          .from('flash_deals')
          .select('product_id')
          .eq('status', 'APPROVED')
          .eq('is_active', true)
          .lte('starts_at', nowIso)
          .gte('ends_at', nowIso);

        if (dealsErr) {
          if (dealsErr.message && (dealsErr.message.includes('does not exist') || dealsErr.message.includes('schema cache'))) {
            flashDealsTableAvailable = false;
          }
          return cachedFlashDealProductIds;
        }
        if (deals) {
          cachedFlashDealProductIds = deals.map((d: any) => d.product_id).filter(Boolean);
        }
        return cachedFlashDealProductIds;
      } catch {
        flashDealsTableAvailable = false;
        return cachedFlashDealProductIds;
      }
    })();

    try {
      // Full column selection preserves complete data integrity across all callers
      const columns = '*, vendors!inner(id, store_name, store_slug, status, deleted_at), categories(id, name, slug), product_variants(*)';

      let query: any = (supabaseAdmin
        .from('products') as any)
        .select(columns)
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
        const catLower = decodeURIComponent(category).toLowerCase().trim();
        const catSlug = catLower.replace(/\s+/g, '-');
        const catName = catLower.replace(/-/g, ' ');

        const searchKeywords = categorySlugMap[catLower] || categorySlugMap[catSlug] || [catLower, catSlug, catName];
        const searchSlugs = Array.from(new Set([
          ...searchKeywords.map(k => k.replace(/\s+/g, '-')),
          catSlug
        ]));

        const isNumericId = /^\d+$/.test(catLower);
        const catIds: number[] = [];

        if (isNumericId) {
          catIds.push(parseInt(catLower, 10));
        }

        // Fast in-memory category slug resolution (avoids extra sequential round-trip DB latency)
        if (categoryCache && now - categoryCache.timestamp < CATEGORY_CACHE_MS) {
          searchSlugs.forEach(s => {
            const resolvedId = categoryCache!.slugMap.get(s);
            if (resolvedId !== undefined) catIds.push(resolvedId);
          });
        } else {
          try {
            const { data: cats } = await supabaseAdmin
              .from('categories')
              .select('id, slug, name');

            if (cats && cats.length > 0) {
              const newMap = new Map<string, number>();
              cats.forEach((c: any) => {
                if (c.slug) newMap.set(c.slug.toLowerCase(), c.id);
                if (c.name) newMap.set(c.name.toLowerCase(), c.id);
              });
              categoryCache = {
                timestamp: now,
                slugMap: newMap
              };
              searchSlugs.forEach(s => {
                const resolvedId = newMap.get(s);
                if (resolvedId !== undefined) catIds.push(resolvedId);
              });
            }
          } catch (catErr) {
            console.warn('Category resolve error:', catErr);
          }
        }

        if (catIds.length > 0) {
          query = query.in('category_id', Array.from(new Set(catIds)));
        }
      }

      if (q) {
        const queryLower = q.toLowerCase();
        query = query.or(`name.ilike.%${queryLower}%,brand.ilike.%${queryLower}%,description.ilike.%${queryLower}%`);
      }

      // Concurrently execute products query and flash deals check in parallel
      const [dbResult, dealIds] = await Promise.all([
        query.range(skip, skip + limit - 1).order('created_at', { ascending: false }),
        flashDealsPromise
      ]);
      activeFlashDealProductIds = dealIds;

      const { data: dbProducts, error: dbError } = dbResult;

      if (dbError) {
        console.error('Supabase products fetch error in customer marketplace:', dbError);
        return NextResponse.json(
          { error: 'Failed to retrieve products from database', details: dbError.message },
          { status: 500 }
        );
      }

      if (dbProducts && dbProducts.length > 0) {
        // Collect all variant IDs to fetch inventory quantities separately (avoids invalid FK join issues)
        const variantIds = (dbProducts as any[])
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

        mappedProducts = (dbProducts as any[]).map((p: any) => {
          const vendor = p.vendors;
          const categoryObj = p.categories;
          const variants = p.product_variants || [];
          const defaultVariant = variants[0];
          
          const defaultStock = defaultVariant ? (inventoryMap[defaultVariant.id] || 0) : 0;
          const totalStock = variants.reduce((sum: number, v: any) => sum + (inventoryMap[v.id] || 0), 0);

          const imagesObj = (p.images as any) || { main: '', gallery: [] };
          let rawMainImage = '';
          let rawGallery: string[] = [];

          if (Array.isArray(imagesObj)) {
            rawMainImage = imagesObj[0] || '';
            rawGallery = imagesObj.slice(1);
          } else if (typeof imagesObj === 'object' && imagesObj !== null) {
            rawMainImage = imagesObj.main || '';
            rawGallery = Array.isArray(imagesObj.gallery) ? imagesObj.gallery : [];
          } else if (typeof imagesObj === 'string') {
            rawMainImage = imagesObj;
          }

          const sanitizedCoverImage = formatProductImageUrl(rawMainImage, p.id, 0);
          const sanitizedGallery = rawGallery.map((img: string, idx: number) => formatProductImageUrl(img, p.id, idx + 1));
          const sanitizedImages = [sanitizedCoverImage, ...sanitizedGallery];

          // Complete data model: every single field is preserved for 100% caller compatibility
          return {
            id: p.id,
            sku: defaultVariant?.sku || '',
            name: p.name,
            categoryId: categoryObj?.id || p.category_id,
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
            description: p.description || '',
            createdAt: p.created_at,
            image: sanitizedCoverImage,
            images: sanitizedImages,
            gallery: sanitizedGallery,
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
      const catLower = decodeURIComponent(category).toLowerCase().trim();
      const catSlug = catLower.replace(/\s+/g, '-');
      const catNorm = catLower.replace(/-/g, ' ');

      const searchKeywords = categorySlugMap[catLower] || categorySlugMap[catSlug] || [catLower, catSlug, catNorm];
      const normalizedKeywords = searchKeywords.map(k => k.toLowerCase().replace(/-/g, ' ').trim());

      combined = combined.filter((p: any) => {
        const prodCat = (p.category || '').toLowerCase().trim();
        const prodCatNorm = prodCat.replace(/-/g, ' ');
        const prodSlug = (p.categorySlug || '').toLowerCase().trim();
        const prodCatId = String(p.categoryId || '');

        return (
          prodCatId === catLower ||
          prodSlug === catSlug ||
          prodCat === catLower ||
          prodCatNorm === catNorm ||
          normalizedKeywords.some(k => prodCatNorm.includes(k) || k.includes(prodCatNorm) || prodSlug.includes(k))
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

    // Exclude products with active approved flash deals from general catalog/category/search listings
    if (!id && activeFlashDealProductIds.length > 0) {
      combined = combined.filter((p: any) => !activeFlashDealProductIds.includes(p.id));
    }

    // Apply single ID filtering (Direct PDP lookup)
    if (id) {
      const matched = combined.find((p: any) => p.id === id);
      if (!matched) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // If product has an active approved flash deal, attach deal info and apply deal price
      if (activeFlashDealProductIds.includes(id)) {
        try {
          const nowIso = new Date().toISOString();
          const { data: deal } = await supabaseAdmin
            .from('flash_deals')
            .select('*')
            .eq('product_id', id)
            .eq('status', 'APPROVED')
            .eq('is_active', true)
            .lte('starts_at', nowIso)
            .gte('ends_at', nowIso)
            .maybeSingle();

          if (deal) {
            const originalPrice = matched.price;
            const dealPrice = Number(deal.deal_price);
            const discountPct = originalPrice > 0 ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100) : 0;
            const remainingStock = Math.max(0, Number(deal.promotional_stock || 0) - Number(deal.reserved_stock || 0) - Number(deal.sold_count || 0));

            matched.flashDeal = {
              id: deal.id,
              dealPrice,
              originalPrice,
              discountPercentage: discountPct,
              promotionalStock: Number(deal.promotional_stock || 0),
              remainingStock,
              soldCount: Number(deal.sold_count || 0),
              startsAt: deal.starts_at,
              endsAt: deal.ends_at
            };
            matched.oldPrice = originalPrice;
            matched.price = dealPrice;
            matched.discount = discountPct;
          }
        } catch {
          // Graceful fallback
        }
      }

      return NextResponse.json(matched);
    }

    const totalCount = combined.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasMore = page < totalPages;
    const responseJson = JSON.stringify(combined);

    // Save in cache
    productsCache.set(cacheKey, {
      timestamp: Date.now(),
      body: responseJson,
      totalCount: totalCount.toString(),
      page: page.toString(),
      limit: limit.toString(),
      totalPages: totalPages.toString(),
      hasMore: hasMore.toString()
    });

    return new NextResponse(responseJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'x-cache': 'MISS',
        'x-total-count': totalCount.toString(),
        'x-page': page.toString(),
        'x-limit': limit.toString(),
        'x-total-pages': totalPages.toString(),
        'x-has-more': hasMore.toString()
      }
    });
  } catch (err: any) {
    console.error('API /api/products error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
