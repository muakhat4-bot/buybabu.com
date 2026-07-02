import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const mapped = reviews.map(r => ({
      id: r.id,
      productId: r.productId,
      orderId: r.orderId,
      name: `${r.user.firstName} ${r.user.lastName}`,
      rating: r.rating,
      comment: r.comment || '',
      photos: (r.images as any) || [],
      date: r.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verified: true,
      helpfulCount: 0
    }));

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
    const customerUser = await prisma.user.findFirst({
      where: { email: 'customer@villex.pk' }
    });
    if (!customerUser) {
      return NextResponse.json({ error: 'Customer user not found' }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: customerUser.id,
        productId: body.productId,
        orderId: body.orderId,
        rating: Number(body.rating),
        comment: body.comment,
        images: body.photos || []
      }
    });

    // Update Product statistics
    const product = await prisma.product.findUnique({
      where: { id: body.productId }
    });

    if (product) {
      const oldCount = product.reviewCount || 0;
      const oldRating = Number(product.avgRating || 0);

      const newCount = oldCount + 1;
      const newRating = Math.round(((oldRating * oldCount + Number(body.rating)) / newCount) * 10) / 10;

      await prisma.product.update({
        where: { id: body.productId },
        data: {
          reviewCount: newCount,
          avgRating: newRating
        }
      });
    }

    const newReview = {
      id: review.id,
      productId: review.productId,
      orderId: review.orderId,
      name: body.customerName,
      rating: review.rating,
      comment: review.comment || '',
      photos: (review.images as any) || [],
      date: review.createdAt.toLocaleDateString('en-US', {
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
