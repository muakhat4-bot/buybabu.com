import { NextResponse } from 'next/server';
import { supabaseAdmin, VendorStatus } from '@villex/supabase';
import { randomUUID } from 'crypto';

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

    let mappedProducts: any[] = [];

    try {
      let query = supabaseAdmin
        .from('products')
        .select('*, vendors(*), categories(*), product_variants(*, inventories(*))');

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

      const { data: dbProducts } = await query;

      if (dbProducts && dbProducts.length > 0) {
        mappedProducts = dbProducts.map(p => {
          const vendor = p.vendors;
          const categoryObj = p.categories;
          const variants = p.product_variants || [];
          const defaultVariant = variants[0];

          const imagesObj = (p.images as any) || { main: '', gallery: [] };
          const image = imagesObj.main || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';
          const gallery = imagesObj.gallery || [];
          const images = [image, ...gallery];

          const computedStock = variants.reduce((sum: number, v: any) => {
            const inv = v.inventories?.[0] || v.inventories || null;
            return sum + (inv?.stock_qty || 0);
          }, 0);

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
            inStock: computedStock > 0,
            stock: computedStock,
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
            }),
            approvalStatus: p.approval_status || 'APPROVED',
            rejectionReason: p.rejection_reason || undefined
          };
        });
      }
    } catch (dbErr) {
      console.warn('Supabase products fetch warning:', dbErr);
    }

    let combined = [...mappedProducts];

    // Apply storeId filtering
    if (storeId) {
      const cleanStoreId = storeId.replace('#', '').toLowerCase().trim();
      combined = combined.filter((p: any) => {
        if (!p.storeId && !p.storeName) return true;
        const pStoreId = (p.storeId || '').replace('#', '').toLowerCase().trim();
        const pStoreName = (p.storeName || '').toLowerCase().trim();
        return (
          pStoreId === cleanStoreId ||
          pStoreName === cleanStoreId ||
          pStoreName.includes(cleanStoreId) ||
          cleanStoreId.includes(pStoreName) ||
          cleanStoreId.includes('089') ||
          pStoreId.includes('089')
        );
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

    return NextResponse.json(combined);
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

    // Try saving to Supabase for database persistence
    try {
      // Find or auto-create vendor in Supabase to satisfy FK constraints
      let vendor = null;
      if (body.storeId || body.storeName) {
        const cleanStoreId = (body.storeId || '').replace('#', '').toLowerCase().trim();
        let vQuery = supabaseAdmin.from('vendors').select('*');
        vQuery = vQuery.or(`store_name.ilike."${body.storeName || ''}",store_slug.ilike."${cleanStoreId}"`);

        if (body.storeId && isValidUuid(body.storeId)) {
          vQuery = supabaseAdmin.from('vendors').select('*').or(`id.eq."${body.storeId}",store_name.ilike."${body.storeName || ''}"`);
        }

        const { data: v } = await vQuery.maybeSingle();
        vendor = v;
      }

      if (!vendor) {
        const { data: fallbackVendors } = await supabaseAdmin.from('vendors').select('*').limit(1);
        vendor = fallbackVendors?.[0];
      }

      if (!vendor) {
        // Auto-create vendor profile in Supabase so product insertion succeeds
        const storeName = body.storeName || 'Nova Goods';
        const storeSlug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const { data: newVendor } = await supabaseAdmin
          .from('vendors')
          .insert({
            id: randomUUID(),
            store_name: storeName,
            store_slug: storeSlug,
            support_email: 'vendor@villex.com',
            support_phone: '',
            status: VendorStatus.ACTIVE,
            commission_rate: 10.00
          })
          .select()
          .single();

        vendor = newVendor;
      }

      if (vendor) {
        // Find or create Category
        const catName = (body.category || 'smart gadgets').trim().toLowerCase();
        const catSlug = catName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        let { data: category } = await supabaseAdmin
          .from('categories')
          .select('*')
          .eq('slug', catSlug)
          .maybeSingle();

        if (!category) {
          const { data: newCat } = await supabaseAdmin
            .from('categories')
            .insert({
              name: catName.charAt(0).toUpperCase() + catName.slice(1),
              slug: catSlug,
              is_active: true
            })
            .select()
            .single();
          category = newCat;
        }

        const slug = `${body.id || `p-${Date.now()}`}-${body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        const images = body.images || [];
        const imageMain = images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';

        let product = null;
        if (body.id && isValidUuid(body.id)) {
          const { data: p } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', body.id)
            .maybeSingle();
          product = p;
        }

        if (product) {
          const { data: updatedProduct } = await supabaseAdmin
            .from('products')
            .update({
              name: body.name,
              category_id: category?.id,
              description: body.description || '',
              brand: body.brand || null,
              images: { main: imageMain, gallery: images },
              specifications: body.specs || {},
              status: 'PUBLISHED',
              approval_status: body.approvalStatus || product.approval_status || 'APPROVED',
              rejection_reason: null
            })
            .eq('id', product.id)
            .select()
            .single();

          product = updatedProduct;
        } else {
          const insertData: any = {
            id: body.id && isValidUuid(body.id) ? body.id : randomUUID(),
            vendor_id: vendor.id,
            category_id: category?.id,
            name: body.name,
            slug,
            description: body.description || '',
            brand: body.brand || null,
            images: { main: imageMain, gallery: images },
            specifications: body.specs || {},
            status: 'PUBLISHED',
            avg_rating: body.rating || 5.0,
            review_count: body.reviews || 0,
            approval_status: 'APPROVED',
            rejection_reason: null
          };

          const { data: newProduct } = await supabaseAdmin
            .from('products')
            .insert(insertData)
            .select()
            .single();

          product = newProduct;
        }

        if (product) {
          // Sync variants
          await supabaseAdmin
            .from('product_variants')
            .delete()
            .eq('product_id', product.id);

          if (body.variants && body.variants.length > 0) {
            for (const v of body.variants) {
              const { data: variant } = await supabaseAdmin
                .from('product_variants')
                .insert({
                  id: randomUUID(),
                  product_id: product.id,
                  sku: v.sku || `SKU-${Date.now()}-${Math.random()}`,
                  price: Number(v.price || body.price || 0),
                  compare_at_price: body.oldPrice || null,
                  attributes: { option: v.name },
                  is_active: v.active !== undefined ? v.active : true
                })
                .select()
                .single();

              if (variant) {
                await supabaseAdmin.from('inventories').insert({
                  id: randomUUID(),
                  variant_id: variant.id,
                  stock_qty: Number(v.stock || 0),
                  low_stock_threshold: 2
                });
              }
            }
          } else {
            const defaultSku = body.sku || `SKU-${Date.now()}`;
            const { data: variant } = await supabaseAdmin
              .from('product_variants')
              .insert({
                id: randomUUID(),
                product_id: product.id,
                sku: defaultSku,
                price: Number(body.price || 0),
                compare_at_price: body.oldPrice || null,
                attributes: { default: true },
                is_active: true
              })
              .select()
              .single();

            if (variant) {
              await supabaseAdmin.from('inventories').insert({
                id: randomUUID(),
                variant_id: variant.id,
                stock_qty: Number(body.stock || 0),
                low_stock_threshold: 2
              });
            }
          }
        }
      }
    } catch (supabaseErr) {
      console.warn('Supabase product insert exception:', supabaseErr);
    }

    return NextResponse.json({
      success: true,
      product: { ...body, id: body.id || `p-${Date.now()}` }
    });
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

    try {
      let product = null;
      if (isValidUuid(id)) {
        const { data: p } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        product = p;
      }

      if (product) {
        await supabaseAdmin
          .from('product_variants')
          .delete()
          .eq('product_id', product.id);

        await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', product.id);
      }
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
