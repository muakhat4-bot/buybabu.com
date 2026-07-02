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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUuid = (id: string) => UUID_REGEX.test(id);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const id = searchParams.get('id');

    const where: any = {};

    if (id) {
      where.id = id;
    }

    if (storeId) {
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

    const dbProducts = await prisma.product.findMany({
      where,
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
      const defaultVariant = p.variants[0];
      const imagesObj = (p.images as any) || { main: '', gallery: [] };
      const image = imagesObj.main || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';
      const gallery = imagesObj.gallery || [];
      const images = [image, ...gallery];

      const computedStock = p.variants.reduce((sum, v) => sum + (v.inventory?.stockQty || 0), 0);

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
        inStock: computedStock > 0,
        stock: computedStock,
        freeShipping: true,
        expressDelivery: true,
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
        })),
        approvalStatus: p.approvalStatus || 'APPROVED',
        rejectionReason: p.rejectionReason || undefined
      };
    });

    if (id && mappedProducts.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (id) {
      return NextResponse.json(mappedProducts[0]);
    }

    return NextResponse.json(mappedProducts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // Find vendor
    let vendor = await prisma.vendor.findFirst({
      where: {
        OR: [
          { storeName: body.storeName },
          { id: body.storeId }
        ]
      }
    });

    if (!vendor) {
      // Fallback
      vendor = await prisma.vendor.findFirst();
      if (!vendor) {
        return NextResponse.json({ error: 'No vendor profile found in database' }, { status: 400 });
      }
    }

    // Find or create Category
    const catName = (body.category || 'other').trim().toLowerCase();
    const catSlug = catName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await prisma.category.upsert({
      where: { slug: catSlug },
      update: {},
      create: {
        name: catName.charAt(0).toUpperCase() + catName.slice(1),
        slug: catSlug,
        isActive: true
      }
    });

    const slug = `${body.id || `p-${Date.now()}`}-${body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

    const approvalStatus = body.approvalStatus || 'PENDING';
    const rejectionReason = body.rejectionReason || null;

    const images = body.images || [];
    const imageMain = images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';

    // Check if product exists already (by body.id)
    let product;
    if (body.id) {
      if (isValidUuid(body.id)) {
        product = await prisma.product.findUnique({
          where: { id: body.id }
        });
      } else {
        product = await prisma.product.findFirst({
          where: {
            slug: {
              startsWith: `${body.id}-`
            }
          }
        });
      }
    }

    if (product) {
      // Update
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: body.name,
          categoryId: category.id,
          description: body.description || '',
          brand: body.brand || null,
          images: { main: imageMain, gallery: images },
          specifications: body.specs || {},
          approvalStatus,
          rejectionReason
        }
      });
    } else {
      // Create
      product = await prisma.product.create({
        data: {
          id: body.id && isValidUuid(body.id) ? body.id : undefined,
          vendorId: vendor.id,
          categoryId: category.id,
          name: body.name,
          slug,
          description: body.description || '',
          brand: body.brand || null,
          images: { main: imageMain, gallery: images },
          specifications: body.specs || {},
          status: ProductStatus.PUBLISHED,
          avgRating: body.rating || 5.0,
          reviewCount: body.reviews || 0,
          approvalStatus,
          rejectionReason
        }
      });
    }

    // Now recreate Variants and Inventories for this product
    // First, delete existing variants
    await prisma.productVariant.deleteMany({
      where: { productId: product.id }
    });

    if (body.variants && body.variants.length > 0) {
      for (const v of body.variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku || `SKU-${Date.now()}-${Math.random()}`,
            price: Number(v.price || body.price || 0),
            compareAtPrice: body.oldPrice || null,
            attributes: { option: v.name },
            isActive: v.active !== undefined ? v.active : true
          }
        });

        await prisma.inventory.create({
          data: {
            variantId: variant.id,
            stockQty: Number(v.stock || 0),
            lowStockThreshold: 2
          }
        });
      }
    } else {
      // Create a default variant
      const defaultSku = body.sku || `SKU-${Date.now()}`;
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: defaultSku,
          price: Number(body.price || 0),
          compareAtPrice: body.oldPrice || null,
          attributes: { default: true },
          isActive: true
        }
      });

      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          stockQty: Number(body.stock || 0),
          lowStockThreshold: 2
        }
      });
    }

    return NextResponse.json({ success: true, product: { ...body, id: product.id } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let product;
    if (isValidUuid(id)) {
      product = await prisma.product.findUnique({
        where: { id }
      });
    } else {
      product = await prisma.product.findFirst({
        where: {
          slug: {
            startsWith: `${id}-`
          }
        }
      });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete variants first
    await prisma.productVariant.deleteMany({
      where: { productId: product.id }
    });

    await prisma.product.delete({
      where: { id: product.id }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
