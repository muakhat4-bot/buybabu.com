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
      let payMethodStr = 'Cash on Delivery (COD)';
      if (o.payment?.paymentMethod === PaymentMethod.EASYPAISA) payMethodStr = 'EasyPaisa';
      if (o.payment?.paymentMethod === PaymentMethod.JAZZCASH) payMethodStr = 'JazzCash';

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
          id: item.variantSku,
          name: item.productName,
          image: '',
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const order = await prisma.order.findUnique({
      where: { orderNumber: body.id },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.orderStatus;
    
    // Map new status
    let newStatus = oldStatus;
    if (body.status === 'PENDING') newStatus = OrderStatus.PENDING;
    if (body.status === 'PROCESSING') newStatus = OrderStatus.PROCESSING;
    if (body.status === 'SHIPPED') newStatus = OrderStatus.SHIPPED;
    if (body.status === 'DELIVERED') newStatus = OrderStatus.DELIVERED;
    if (body.status === 'CANCELLED' || body.status === 'REFUNDED') newStatus = OrderStatus.CANCELLED;

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: newStatus
      }
    });

    // Update order items status
    await prisma.orderItem.updateMany({
      where: { orderId: order.id },
      data: { status: newStatus }
    });

    // Handle wallet transitions if status changed
    if (newStatus !== oldStatus) {
      // Find vendor
      let vendorId = order.items[0]?.vendorId;
      if (!vendorId) {
        // Fallback
        const fallbackVendor = await prisma.vendor.findFirst({
          where: { supportEmail: 'contact@electropulse.pk' }
        });
        vendorId = fallbackVendor?.id;
      }

      if (vendorId) {
        const vendor = await prisma.vendor.findUnique({
          where: { id: vendorId }
        });

        if (vendor) {
          const wallet = (vendor.wallet as any) || {
            availableBalance: 0,
            pendingBalance: 0,
            lifetimeSales: 0,
            lifetimeCommission: 0,
            transactions: []
          };

          const orderTotal = Number(order.totalAmount);
          const today = new Date().toISOString().split('T')[0];

          if (newStatus === OrderStatus.DELIVERED && oldStatus !== OrderStatus.DELIVERED) {
            wallet.pendingBalance = Math.max(0, (wallet.pendingBalance || 0) - orderTotal);
            
            const commission = Math.round(orderTotal * 0.10);
            const netAmount = orderTotal - commission;
            
            wallet.availableBalance = (wallet.availableBalance || 0) + netAmount;
            wallet.lifetimeSales = (wallet.lifetimeSales || 0) + orderTotal;
            wallet.lifetimeCommission = (wallet.lifetimeCommission || 0) + commission;

            wallet.transactions.push({
              id: `txn-sale-${order.orderNumber}-${Date.now()}`,
              type: 'SALE',
              amount: orderTotal,
              orderId: order.orderNumber,
              date: today,
              status: 'COMPLETED',
              details: `Gross Sale for Order #${order.orderNumber}`
            });

            wallet.transactions.push({
              id: `txn-comm-${order.orderNumber}-${Date.now()}`,
              type: 'COMMISSION',
              amount: commission,
              orderId: order.orderNumber,
              date: today,
              status: 'COMPLETED',
              details: `10% Villex Commission for Order #${order.orderNumber}`
            });
          }

          if (newStatus === OrderStatus.CANCELLED && oldStatus !== OrderStatus.CANCELLED) {
            if (oldStatus === OrderStatus.DELIVERED) {
              const commission = Math.round(orderTotal * 0.10);
              const netAmount = orderTotal - commission;
              
              wallet.availableBalance = Math.max(0, (wallet.availableBalance || 0) - netAmount);
              wallet.lifetimeSales = Math.max(0, (wallet.lifetimeSales || 0) - orderTotal);
              wallet.lifetimeCommission = Math.max(0, (wallet.lifetimeCommission || 0) - commission);

              wallet.transactions.push({
                id: `txn-ref-${order.orderNumber}-${Date.now()}`,
                type: 'REFUND',
                amount: orderTotal,
                orderId: order.orderNumber,
                date: today,
                status: 'COMPLETED',
                details: `Refund for Order #${order.orderNumber} (reversing net credit PKR ${netAmount.toLocaleString()})`
              });
            } else {
              wallet.pendingBalance = Math.max(0, (wallet.pendingBalance || 0) - orderTotal);

              wallet.transactions.push({
                id: `txn-ref-${order.orderNumber}-${Date.now()}`,
                type: 'REFUND',
                amount: orderTotal,
                orderId: order.orderNumber,
                date: today,
                status: 'COMPLETED',
                details: `Cancellation/Refund for Order #${order.orderNumber}`
              });
            }
          }

          // Update vendor wallet
          await prisma.vendor.update({
            where: { id: vendor.id },
            data: { wallet }
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
