import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

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

    // Build query options
    const where: any = {
      status: ProductStatus.PUBLISHED
    };

    if (id) {
      where.id = id;
    }

    if (storeId) {
      // Find by vendor ID or store slug
      const cleanStoreId = storeId.replace('#', '').toLowerCase();
      where.vendor = {
        OR: [
          { id: storeId },
          { storeName: { mode: 'insensitive', equals: storeId } },
          { storeSlug: { mode: 'insensitive', equals: cleanStoreId } }
        ]
      };
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

      where.category = {
        OR: searchCategories.map(c => ({
          slug: { mode: 'insensitive', equals: c.replace(/\s+/g, '-') }
        }))
      };
    }

    if (q) {
      const queryLower = q.toLowerCase();
      where.OR = [
        { name: { contains: queryLower, mode: 'insensitive' } },
        { brand: { contains: queryLower, mode: 'insensitive' } },
        { description: { contains: queryLower, mode: 'insensitive' } }
      ];
    }

    const totalCount = await prisma.product.count({ where });

    const dbProducts = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        vendor: true,
        category: true,
        variants: {
          include: {
            inventory: true
          }
        }
      }
    });

    const mappedProducts = dbProducts.map(p => {
      // Find first variant as default
      const defaultVariant = p.variants[0];
      const imagesObj = (p.images as any) || { main: '', gallery: [] };
      const image = imagesObj.main || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';
      const gallery = imagesObj.gallery || [];
      const images = [image, ...gallery];

      return {
        id: p.id,
        sku: defaultVariant?.sku || '',
        name: p.name,
        category: p.category.name.toLowerCase(),
        price: Number(defaultVariant?.price || 0),
        oldPrice: defaultVariant?.compareAtPrice ? Number(defaultVariant.compareAtPrice) : undefined,
        discount: defaultVariant?.compareAtPrice && Number(defaultVariant.price) < Number(defaultVariant.compareAtPrice)
          ? Math.round(((Number(defaultVariant.compareAtPrice) - Number(defaultVariant.price)) / Number(defaultVariant.compareAtPrice)) * 100)
          : undefined,
        rating: Number(p.avgRating),
        reviews: p.reviewCount,
        brand: p.brand || undefined,
        inStock: defaultVariant?.inventory ? defaultVariant.inventory.stockQty > 0 : false,
        freeShipping: true, // Defaulting as in mock
        expressDelivery: true, // Defaulting as in mock
        description: p.description,
        image,
        images,
        gallery,
        specs: (p.specifications as any) || {},
        storeId: p.vendor.storeSlug,
        storeName: p.vendor.storeName,
        options: reconstructOptions(p.variants),
        variants: p.variants.map(v => ({
          name: (v.attributes as any)?.option || (v.attributes as any)?.name || 'Default',
          price: Number(v.price),
          stock: v.inventory?.stockQty || 0,
          sku: v.sku,
          active: v.isActive
        }))
      };
    });

    if (id && mappedProducts.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (id) {
      return NextResponse.json(mappedProducts[0]);
    }

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
