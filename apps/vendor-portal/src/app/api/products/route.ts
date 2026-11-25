import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
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

interface AuthSuccess {
  vendor: any;
  user: any;
}

interface AuthError {
  errorResponse: NextResponse;
}

type AuthResult = AuthSuccess | AuthError;

/**
 * Strict authentication helper:
 * - Requires a valid Supabase JWT in the Authorization header.
 * - Verifies the token using supabaseAdmin.auth.getUser(token).
 * - Rejects missing, invalid, or expired tokens with HTTP 401.
 * - Resolves the vendor record EXCLUSIVELY via vendors.owner_id = user.id.
 * - Never trusts client-supplied storeId, storeName, or vendorEmail.
 * - Never falls back to arbitrary or auto-created vendors.
 * - Rejects authenticated users without a vendor store record with HTTP 403.
 */
async function authenticateVendor(request: Request): Promise<AuthResult> {
  // Support standard Authorization header and common reverse-proxy headers (e.g. Apache/LiteSpeed on Hostinger)
  const authHeader =
    request.headers.get('authorization') ||
    request.headers.get('x-forwarded-authorization') ||
    request.headers.get('x-vendor-token') ||
    request.headers.get('x-supabase-auth');

  if (!authHeader || !authHeader.trim()) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Missing or malformed Authorization header' },
        { status: 401 }
      ),
    };
  }

  // Handle both "Bearer <token>" and raw token header formats
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Bearer token is empty' },
        { status: 401 }
      ),
    };
  }

  try {
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: `Unauthorized: Invalid or expired token (${authError?.message || 'Authentication failed'})` },
          { status: 401 }
        ),
      };
    }

    const user = userData.user;

    // Resolve vendor strictly through verified user id -> vendors.owner_id
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (vendorError) {
      console.error('Database error resolving vendor by owner_id:', vendorError);
      return {
        errorResponse: NextResponse.json(
          { success: false, error: 'Internal server error resolving vendor account' },
          { status: 500 }
        ),
      };
    }

    if (!vendor) {
      return {
        errorResponse: NextResponse.json(
          { success: false, error: 'Forbidden: No registered vendor profile associated with this account' },
          { status: 403 }
        ),
      };
    }

    return { vendor, user };
  } catch (err: any) {
    console.error('Unexpected auth verification exception:', err);
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication service error' },
        { status: 401 }
      ),
    };
  }
}

export async function GET(request: Request) {
  const auth = await authenticateVendor(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }
  const vendor = auth.vendor;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const id = searchParams.get('id');

    let mappedProducts: any[] = [];

    try {
      // Strictly isolate products to the authenticated vendor
      let query = supabaseAdmin
        .from('products')
        .select('*, vendors(*), categories(*), product_variants(*)')
        .eq('vendor_id', vendor.id);

      if (id) {
        query = query.eq('id', id);
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

      const { data: dbProducts, error: dbError } = await query;

      if (dbError) {
        console.error('Supabase products fetch error:', dbError);
        return NextResponse.json({ error: 'Failed to fetch products: ' + dbError.message }, { status: 500 });
      }

      if (dbProducts && dbProducts.length > 0) {
        // Fetch inventory quantities separately by variant_id to avoid missing FK join issues
        const variantIds = dbProducts.flatMap((p: any) => (p.product_variants || []).map((v: any) => v.id)).filter(Boolean);
        const inventoryMap: Record<string, number> = {};

        if (variantIds.length > 0) {
          const { data: invRecords, error: invError } = await supabaseAdmin
            .from('inventories')
            .select('variant_id, quantity')
            .in('variant_id', variantIds);

          if (!invError && invRecords) {
            invRecords.forEach((inv: any) => {
              inventoryMap[inv.variant_id] = (inventoryMap[inv.variant_id] || 0) + (Number(inv.quantity) || 0);
            });
          }
        }

        mappedProducts = dbProducts.map(p => {
          const vData = p.vendors;
          const categoryObj = p.categories;
          const variants = p.product_variants || [];
          const defaultVariant = variants[0];

          const imagesObj = (p.images as any) || { main: '', gallery: [] };
          const image = imagesObj.main || (Array.isArray(imagesObj) ? imagesObj[0] : '') || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';
          const gallery = imagesObj.gallery || (Array.isArray(imagesObj) ? imagesObj : []);
          const images = Array.isArray(p.images) ? p.images : (imagesObj.gallery ? [image, ...imagesObj.gallery] : [image]);

          const computedStock = variants.length > 0
            ? variants.reduce((sum: number, v: any) => sum + (inventoryMap[v.id] ?? 0), 0)
            : 0;

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
            rating: Number(p.avg_rating || 5.0),
            reviews: p.review_count || 0,
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
            storeId: vData?.store_slug || vData?.id || '',
            storeName: vData?.store_name || '',
            status: p.status || 'DRAFT',
            approvalStatus: p.approval_status || 'PENDING',
            rejectionReason: p.rejection_reason || undefined,
            options: reconstructOptions(variants),
            variants: variants.map((v: any) => ({
              name: (v.attributes as any)?.option || (v.attributes as any)?.name || 'Default',
              price: Number(v.price),
              stock: inventoryMap[v.id] ?? 0,
              sku: v.sku,
              active: v.is_active
            }))
          };
        });
      }
    } catch (dbErr: any) {
      console.error('Supabase products fetch exception:', dbErr);
      return NextResponse.json({ error: 'Failed to fetch products: ' + (dbErr?.message || 'Server error') }, { status: 500 });
    }

    if (id) {
      const matched = mappedProducts.find((p: any) => p.id === id);
      if (!matched) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(matched);
    }

    return NextResponse.json(mappedProducts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authenticateVendor(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }
  const vendor = auth.vendor;

  let createdProductId: string | null = null;
  let isNewProduct = false;

  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    // 1. Find or auto-create Category
    const catName = (body.category || 'smart gadgets').trim().toLowerCase();
    const catSlug = catName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    let { data: category } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('slug', catSlug)
      .maybeSingle();

    if (!category) {
      const { data: newCat, error: catCreateErr } = await supabaseAdmin
        .from('categories')
        .insert({
          name: catName.charAt(0).toUpperCase() + catName.slice(1),
          slug: catSlug,
          is_active: true
        })
        .select()
        .single();

      if (!catCreateErr && newCat) {
        category = newCat;
      }
    }

    // 2. Prepare images and slug
    const images = Array.isArray(body.images) ? body.images : [];
    const imageMain = images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';
    const baseSlug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    // 3. Determine if updating existing product or inserting new product
    let product = null;
    if (body.id && isValidUuid(body.id)) {
      const { data: existingP, error: findError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', body.id)
        .maybeSingle();

      if (findError) {
        throw new Error(`Database error looking up product: ${findError.message}`);
      }

      product = existingP;

      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
    }

    if (product) {
      // STRICT OWNERSHIP CHECK: verify product belongs to authenticated vendor
      if (product.vendor_id !== vendor.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You do not have permission to modify this product' },
          { status: 403 }
        );
      }

      // Existing product update
      const { data: updatedProduct, error: updateErr } = await supabaseAdmin
        .from('products')
        .update({
          name: body.name.trim(),
          category_id: category?.id,
          description: body.description || '',
          brand: body.brand || null,
          images: { main: imageMain, gallery: images },
          specifications: body.specs || {},
          status: 'DRAFT',
          approval_status: 'PENDING',
          rejection_reason: null
        })
        .eq('id', product.id)
        .select()
        .single();

      if (updateErr || !updatedProduct) {
        throw new Error(`Failed to update product: ${updateErr?.message || 'Database error'}`);
      }
      product = updatedProduct;
    } else {
      // Check for rapid duplicate submission by the same vendor (within 10 seconds)
      const { data: duplicateProduct } = await supabaseAdmin
        .from('products')
        .select('id, created_at')
        .eq('vendor_id', vendor.id)
        .ilike('name', body.name.trim())
        .eq('approval_status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (duplicateProduct && duplicateProduct.created_at) {
        const elapsedMs = Date.now() - new Date(duplicateProduct.created_at).getTime();
        if (elapsedMs < 10000) {
          return NextResponse.json(
            { success: false, error: 'A product with this name was just submitted. Please wait a moment before submitting again.' },
            { status: 429 }
          );
        }
      }

      // New product insert: vendor_id derived EXCLUSIVELY from authenticated vendor.id
      isNewProduct = true;
      const newProductId = randomUUID();

      const insertData = {
        id: newProductId,
        vendor_id: vendor.id, // Strictly authenticated vendor ID; client-supplied IDs are completely ignored
        category_id: category?.id,
        name: body.name.trim(),
        slug,
        description: body.description || '',
        brand: body.brand || null,
        images: { main: imageMain, gallery: images },
        specifications: body.specs || {},
        status: 'DRAFT',
        avg_rating: body.rating || 5.0,
        review_count: body.reviews || 0,
        approval_status: 'PENDING',
        rejection_reason: null
      };

      const { data: newProduct, error: insertErr } = await supabaseAdmin
        .from('products')
        .insert(insertData)
        .select()
        .single();

      if (insertErr || !newProduct) {
        throw new Error(`Failed to create product: ${insertErr?.message || 'Database error'}`);
      }
      product = newProduct;
      createdProductId = newProduct.id;
    }

    // 4. Clean up previous variants and inventories before re-inserting
    const { data: oldVariants } = await supabaseAdmin
      .from('product_variants')
      .select('id')
      .eq('product_id', product.id);

    if (oldVariants && oldVariants.length > 0) {
      const oldVarIds = oldVariants.map((v) => v.id);
      await supabaseAdmin.from('inventories').delete().in('variant_id', oldVarIds);
      await supabaseAdmin.from('product_variants').delete().eq('product_id', product.id);
    }

    // 5. Insert variants and inventories with correct 'quantity' column
    const defaultSku = body.sku || `SKU-${Date.now().toString().slice(-6)}`;

    if (body.variants && body.variants.length > 0) {
      for (const v of body.variants) {
        const variantId = randomUUID();
        const { data: variant, error: varError } = await supabaseAdmin
          .from('product_variants')
          .insert({
            id: variantId,
            product_id: product.id,
            sku: v.sku || `SKU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`,
            price: Number(v.price || body.price || 0),
            compare_at_price: body.oldPrice ? Number(body.oldPrice) : null,
            attributes: { option: v.name },
            is_active: v.active !== undefined ? v.active : true
          })
          .select()
          .single();

        if (varError || !variant) {
          throw new Error(`Failed to create product variant: ${varError?.message || 'Database error'}`);
        }

        const { error: invError } = await supabaseAdmin.from('inventories').insert({
          id: randomUUID(),
          variant_id: variant.id,
          quantity: Number(v.stock || 0),
          low_stock_threshold: 2
        });

        if (invError) {
          throw new Error(`Failed to create inventory record: ${invError.message}`);
        }
      }
    } else {
      const variantId = randomUUID();
      const { data: variant, error: varError } = await supabaseAdmin
        .from('product_variants')
        .insert({
          id: variantId,
          product_id: product.id,
          sku: defaultSku,
          price: Number(body.price || 0),
          compare_at_price: body.oldPrice ? Number(body.oldPrice) : null,
          attributes: { default: true },
          is_active: true
        })
        .select()
        .single();

      if (varError || !variant) {
        throw new Error(`Failed to create default variant: ${varError?.message || 'Database error'}`);
      }

      const { error: invError } = await supabaseAdmin.from('inventories').insert({
        id: randomUUID(),
        variant_id: variant.id,
        quantity: Number(body.stock || 0),
        low_stock_threshold: 2
      });

      if (invError) {
        throw new Error(`Failed to create inventory record: ${invError.message}`);
      }
    }

    // 6. Construct mapped product response matching GET schema
    const computedStock = Number(body.stock || 0);
    const mappedResponseProduct = {
      id: product.id,
      sku: body.sku || defaultSku,
      name: product.name,
      category: category ? category.name.toLowerCase() : (body.category || '').toLowerCase(),
      price: Number(body.price || 0),
      oldPrice: body.oldPrice ? Number(body.oldPrice) : undefined,
      discount: body.discount,
      rating: Number(product.avg_rating || 5.0),
      reviews: product.review_count || 0,
      brand: product.brand || undefined,
      inStock: computedStock > 0,
      stock: computedStock,
      freeShipping: true,
      expressDelivery: true,
      description: product.description,
      image: imageMain,
      images: images.length > 0 ? images : [imageMain],
      gallery: images,
      specs: product.specifications || {},
      storeId: vendor.store_slug || vendor.id,
      storeName: vendor.store_name,
      status: 'DRAFT',
      approvalStatus: 'PENDING',
      rejectionReason: undefined,
      options: body.options || [],
      variants: body.variants || []
    };

    return NextResponse.json({
      success: true,
      product: mappedResponseProduct
    });
  } catch (err: any) {
    console.error('Supabase product save exception:', err);

    let rollbackErrorMsg: string | null = null;
    // Roll back created partial product on failure (strictly only for newly inserted products)
    if (isNewProduct && createdProductId) {
      try {
        const { data: createdVars } = await supabaseAdmin
          .from('product_variants')
          .select('id')
          .eq('product_id', createdProductId);

        if (createdVars && createdVars.length > 0) {
          const { error: delInvErr } = await supabaseAdmin
            .from('inventories')
            .delete()
            .in('variant_id', createdVars.map((v) => v.id));
          if (delInvErr) rollbackErrorMsg = `Inventory cleanup failed: ${delInvErr.message}`;

          const { error: delVarErr } = await supabaseAdmin
            .from('product_variants')
            .delete()
            .eq('product_id', createdProductId);
          if (delVarErr) rollbackErrorMsg = (rollbackErrorMsg ? rollbackErrorMsg + '; ' : '') + `Variant cleanup failed: ${delVarErr.message}`;
        }

        const { error: delProdErr } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', createdProductId);
        if (delProdErr) rollbackErrorMsg = (rollbackErrorMsg ? rollbackErrorMsg + '; ' : '') + `Product cleanup failed: ${delProdErr.message}`;
      } catch (cleanupErr: any) {
        console.error('Error rolling back partial product:', cleanupErr);
        rollbackErrorMsg = cleanupErr?.message || 'Unexpected rollback failure';
      }
    }

    const finalErrorMessage = rollbackErrorMsg
      ? `${err?.message || 'Failed to save product'} (Rollback warning: ${rollbackErrorMsg})`
      : (err?.message || 'Failed to save product');

    return NextResponse.json(
      { success: false, error: finalErrorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await authenticateVendor(request);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }
  const vendor = auth.vendor;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidUuid(id)) {
      return NextResponse.json({ success: false, error: 'Valid Product UUID is required' }, { status: 400 });
    }

    // 1. Fetch target product to verify existence and ownership
    const { data: targetProduct, error: findError } = await supabaseAdmin
      .from('products')
      .select('id, vendor_id')
      .eq('id', id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ success: false, error: `Database error: ${findError.message}` }, { status: 500 });
    }

    if (!targetProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // 2. Verify ownership: product.vendor_id MUST match authenticated vendor.id
    if (targetProduct.vendor_id !== vendor.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to delete this product' },
        { status: 403 }
      );
    }

    // 3. Clean up associated inventories and variants
    const { data: variants, error: varError } = await supabaseAdmin
      .from('product_variants')
      .select('id')
      .eq('product_id', id);

    if (varError) {
      return NextResponse.json({ success: false, error: `Error fetching variants: ${varError.message}` }, { status: 500 });
    }

    if (variants && variants.length > 0) {
      const { error: invDelErr } = await supabaseAdmin
        .from('inventories')
        .delete()
        .in('variant_id', variants.map((v) => v.id));

      if (invDelErr) {
        return NextResponse.json({ success: false, error: `Error deleting inventory records: ${invDelErr.message}` }, { status: 500 });
      }

      const { error: varDelErr } = await supabaseAdmin
        .from('product_variants')
        .delete()
        .eq('product_id', id);

      if (varDelErr) {
        return NextResponse.json({ success: false, error: `Error deleting product variants: ${varDelErr.message}` }, { status: 500 });
      }
    }

    // 4. Delete product record
    const { error: delError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (delError) {
      return NextResponse.json({ success: false, error: delError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
