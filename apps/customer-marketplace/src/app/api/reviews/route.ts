import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*, users(*)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (reviews || []).map(r => {
      const user = r.users;
      return {
        id: r.id,
        productId: r.product_id,
        orderId: r.order_id,
        name: user ? `${user.first_name} ${user.last_name}` : 'Anonymous',
        rating: r.rating,
        comment: r.comment || '',
        photos: (r.images as any) || [],
        date: new Date(r.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        verified: true,
        helpfulCount: 0
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.productId || !body.orderId || !body.customerName || !body.rating || !body.comment) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    // Get default customer user
    let { data: customerUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'customer@villex.pk')
      .maybeSingle();

    if (userError) throw userError;
    if (!customerUser) {
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: randomUUID(),
          email: 'customer@villex.pk',
          password_hash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890',
          first_name: 'Walk-in',
          last_name: 'Customer',
          phone: '0321-9876543',
          is_active: true
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      customerUser = newUser;

      const { data: role } = await supabaseAdmin
        .from('roles')
        .select('*')
        .eq('name', 'CUSTOMER')
        .maybeSingle();

      if (role) {
        await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: customerUser.id,
            role_id: role.id
          });
      }
    }

    // Create review
    const { data: review, error: createError } = await supabaseAdmin
      .from('reviews')
      .insert({
        id: randomUUID(),
        user_id: customerUser.id,
        product_id: body.productId,
        order_id: body.orderId,
        rating: Number(body.rating),
        comment: body.comment,
        images: body.photos || []
      })
      .select()
      .single();

    if (createError) throw createError;

    // Update Product statistics
    const { data: product, error: findProductError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', body.productId)
      .maybeSingle();

    if (!findProductError && product) {
      const oldCount = product.review_count || 0;
      const oldRating = Number(product.avg_rating || 0);

      const newCount = oldCount + 1;
      const newRating = Math.round(((oldRating * oldCount + Number(body.rating)) / newCount) * 10) / 10;

      await supabaseAdmin
        .from('products')
        .update({
          review_count: newCount,
          avg_rating: newRating
        })
        .eq('id', body.productId);
    }

    const newReview = {
      id: review.id,
      productId: review.product_id,
      orderId: review.order_id,
      name: body.customerName,
      rating: review.rating,
      comment: review.comment || '',
      photos: (review.images as any) || [],
      date: new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verified: true,
      helpfulCount: 0
    };

    return NextResponse.json({ success: true, review: newReview });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
