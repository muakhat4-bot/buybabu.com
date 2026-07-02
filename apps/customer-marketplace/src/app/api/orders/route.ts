import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbOrders = await prisma.order.findMany({
      include: {
        items: true,
        payment: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const mapped = dbOrders.map(o => {
      // Determine paymentMethod string
      let payMethodStr = 'Cash on Delivery (COD)';
      if (o.payment?.paymentMethod === PaymentMethod.EASYPAISA) payMethodStr = 'EasyPaisa';
      if (o.payment?.paymentMethod === PaymentMethod.JAZZCASH) payMethodStr = 'JazzCash';

      // Determine status string
      let statusStr = 'PENDING';
      if (o.orderStatus === OrderStatus.PROCESSING) statusStr = 'PROCESSING';
      if (o.orderStatus === OrderStatus.SHIPPED) statusStr = 'SHIPPED';
      if (o.orderStatus === OrderStatus.DELIVERED) statusStr = 'DELIVERED';
      if (o.orderStatus === OrderStatus.CANCELLED) statusStr = 'CANCELLED';

      return {
        id: o.orderNumber,
        customerName: `${o.user.firstName} ${o.user.lastName}`,
        customerPhone: (o.shippingAddress as any)?.phone || o.user.phone || '',
        shippingAddress: (o.shippingAddress as any)?.address || '',
        date: o.createdAt.toISOString().split('T')[0],
        total: Number(o.totalAmount),
        paymentMethod: payMethodStr,
        status: statusStr,
        itemsCount: o.items.reduce((acc, item) => acc + item.quantity, 0),
        walletPhone: (o.payment?.gatewayResponse as any)?.phone || undefined,
        walletTid: o.payment?.transactionId || undefined,
        items: o.items.map(item => ({
          id: item.variantSku, // or mapping to product ID
          name: item.productName,
          image: '', // We can look this up if needed, or leave empty
          qty: item.quantity,
          price: Number(item.unitPrice)
        }))
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get default customer user
    const customerUser = await prisma.user.findUnique({
      where: { email: 'customer@villex.pk' }
    });
    if (!customerUser) {
      return NextResponse.json({ success: false, error: 'Customer user not found' }, { status: 400 });
    }

    // Determine status
    let orderStatus: OrderStatus = OrderStatus.PENDING;
    if (body.status === 'PROCESSING') orderStatus = OrderStatus.PROCESSING;
    if (body.status === 'SHIPPED') orderStatus = OrderStatus.SHIPPED;
    if (body.status === 'DELIVERED') orderStatus = OrderStatus.DELIVERED;
    if (body.status === 'CANCELLED') orderStatus = OrderStatus.CANCELLED;

    // Determine PaymentMethod enum
    let payMethod: PaymentMethod = PaymentMethod.COD;
    if (body.paymentMethod === 'EasyPaisa') payMethod = PaymentMethod.EASYPAISA;
    if (body.paymentMethod === 'JazzCash') payMethod = PaymentMethod.JAZZCASH;

    const orderNumber = body.id || `VLX-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Order
    const order = await prisma.order.create({
      data: {
        userId: customerUser.id,
        orderNumber,
        subtotal: body.total,
        totalAmount: body.total,
        shippingAddress: { address: body.shippingAddress || 'N/A', phone: body.customerPhone || '' },
        billingAddress: { address: body.shippingAddress || 'N/A', phone: body.customerPhone || '' },
        orderStatus,
        createdAt: new Date(body.date || Date.now())
      }
    });

    // Create Payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: payMethod,
        amount: body.total,
        status: orderStatus === OrderStatus.DELIVERED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        transactionId: body.walletTid || null,
        gatewayResponse: body.walletPhone ? { phone: body.walletPhone } : {}
      }
    });

    // Find and update Vendor Wallet
    let matchedVendor: any = null;

    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        // Find variant
        let variant = await prisma.productVariant.findFirst({
          where: {
            OR: [
              { sku: item.id },
              { product: { name: item.name } }
            ]
          },
          include: { product: { include: { vendor: true } } }
        });

        if (!variant) {
          // Fallback first variant
          variant = await prisma.productVariant.findFirst({
            include: { product: { include: { vendor: true } } }
          });
        }

        if (variant) {
          matchedVendor = variant.product.vendor;
          const commission = Math.round(Number(item.price) * item.qty * 0.10);

          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              variantId: variant.id,
              vendorId: variant.product.vendorId,
              productName: item.name,
              variantSku: variant.sku,
              unitPrice: item.price,
              quantity: item.qty,
              subtotal: item.price * item.qty,
              commissionFee: commission,
              status: orderStatus
            }
          });
        }
      }
    }

    // Default vendor if none matched
    if (!matchedVendor) {
      matchedVendor = await prisma.vendor.findFirst({
        where: { supportEmail: 'contact@electropulse.pk' }
      });
    }

    if (matchedVendor) {
      const wallet = (matchedVendor.wallet as any) || {
        availableBalance: 0,
        pendingBalance: 0,
        lifetimeSales: 0,
        lifetimeCommission: 0,
        transactions: []
      };
      wallet.pendingBalance = (wallet.pendingBalance || 0) + body.total;

      await prisma.vendor.update({
        where: { id: matchedVendor.id },
        data: { wallet }
      });
    }

    return NextResponse.json({ success: true, order: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const order = await prisma.order.findUnique({
      where: { orderNumber: body.id }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Map orderStatus
    let orderStatus = order.orderStatus;
    if (body.status === 'PROCESSING') orderStatus = OrderStatus.PROCESSING;
    if (body.status === 'SHIPPED') orderStatus = OrderStatus.SHIPPED;
    if (body.status === 'DELIVERED') orderStatus = OrderStatus.DELIVERED;
    if (body.status === 'CANCELLED') orderStatus = OrderStatus.CANCELLED;

    // Update main order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus
      }
    });

    // Update order items status
    await prisma.orderItem.updateMany({
      where: { orderId: order.id },
      data: { status: orderStatus }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
