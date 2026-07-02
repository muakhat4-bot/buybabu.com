import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbProducts = await prisma.product.findMany({
      include: {
        vendor: true,
        category: true,
        variants: true
      }
    });

    const mapped = dbProducts.map(p => {
      const defaultVariant = p.variants[0];
      const imagesObj = (p.images as any) || { main: '', gallery: [] };
      const image = imagesObj.main || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';

      return {
        id: p.id,
        sku: defaultVariant?.sku || '',
        name: p.name,
        category: p.category.name.toLowerCase(),
        price: Number(defaultVariant?.price || 0),
        brand: p.brand || undefined,
        description: p.description,
        image,
        storeId: p.vendor.storeSlug,
        storeName: p.vendor.storeName,
        approvalStatus: p.approvalStatus || 'APPROVED',
        rejectionReason: p.rejectionReason || undefined
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const product = await prisma.product.findUnique({
      where: { id: body.id }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.update({
      where: { id: body.id },
      data: {
        approvalStatus: body.approvalStatus,
        rejectionReason: body.rejectionReason || null
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
