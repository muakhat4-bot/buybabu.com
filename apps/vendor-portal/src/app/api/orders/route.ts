import { NextResponse } from 'next/server';
import { supabaseAdmin, OrderStatus, PaymentMethod, PaymentStatus } from '@villex/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: dbOrders, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*), payments(*), users(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (dbOrders || []).map(o => {
      const payment = Array.isArray(o.payments) ? o.payments[0] : o.payments;
      const user = o.users;

      let payMethodStr = 'Cash on Delivery (COD)';
      if (payment?.payment_method === PaymentMethod.EASYPAISA) payMethodStr = 'EasyPaisa';
      if (payment?.payment_method === PaymentMethod.JAZZCASH) payMethodStr = 'JazzCash';

      let statusStr = 'PENDING';
      if (o.order_status === OrderStatus.PROCESSING) statusStr = 'PROCESSING';
      if (o.order_status === OrderStatus.SHIPPED) statusStr = 'SHIPPED';
      if (o.order_status === OrderStatus.DELIVERED) statusStr = 'DELIVERED';
      if (o.order_status === OrderStatus.CANCELLED) statusStr = 'CANCELLED';

      const items = o.order_items || [];

      return {
        id: o.order_number,
        customerName: user ? `${user.first_name} ${user.last_name}` : 'Unknown Customer',
        customerPhone: (o.shipping_address as any)?.phone || user?.phone || '',
        shippingAddress: (o.shipping_address as any)?.address || '',
        date: new Date(o.created_at).toISOString().split('T')[0],
        total: Number(o.total_amount),
        paymentMethod: payMethodStr,
        status: statusStr,
        itemsCount: items.reduce((acc: number, item: any) => acc + item.quantity, 0),
        walletPhone: (payment?.gateway_response as any)?.phone || undefined,
        walletTid: payment?.transaction_id || undefined,
        items: items.map((item: any) => ({
          id: item.variant_sku,
          name: item.product_name,
          image: '',
          qty: item.quantity,
          price: Number(item.unit_price)
        }))
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.warn('Orders GET warning:', err?.message || err);
    return NextResponse.json([]);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', body.id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.order_status;
    
    // Map new status
    let newStatus = oldStatus;
    if (body.status === 'PENDING') newStatus = OrderStatus.PENDING;
    if (body.status === 'PROCESSING') newStatus = OrderStatus.PROCESSING;
    if (body.status === 'SHIPPED') newStatus = OrderStatus.SHIPPED;
    if (body.status === 'DELIVERED') newStatus = OrderStatus.DELIVERED;
    if (body.status === 'CANCELLED' || body.status === 'REFUNDED') newStatus = OrderStatus.CANCELLED;

    // Update order
    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', order.id);

    if (updateOrderError) throw updateOrderError;

    // Update order items status
    const { error: updateItemsError } = await supabaseAdmin
      .from('order_items')
      .update({ status: newStatus })
      .eq('order_id', order.id);

    if (updateItemsError) throw updateItemsError;

    // Handle wallet transitions if status changed
    if (newStatus !== oldStatus) {
      const items = order.order_items || [];
      let vendorId = items[0]?.vendor_id;
      if (!vendorId) {
        // Fallback
        const { data: fallbackVendor, error: fallbackError } = await supabaseAdmin
          .from('vendors')
          .select('*')
          .eq('support_email', 'contact@electropulse.pk')
          .maybeSingle();

        if (!fallbackError && fallbackVendor) {
          vendorId = fallbackVendor.id;
        }
      }

      if (vendorId) {
        const { data: vendor, error: vendorError } = await supabaseAdmin
          .from('vendors')
          .select('*')
          .eq('id', vendorId)
          .maybeSingle();

        if (!vendorError && vendor) {
          const wallet = (vendor.wallet as any) || {
            availableBalance: 0,
            pendingBalance: 0,
            lifetimeSales: 0,
            lifetimeCommission: 0,
            transactions: []
          };

          const orderTotal = Number(order.total_amount);
          const today = new Date().toISOString().split('T')[0];

          if (newStatus === OrderStatus.DELIVERED && oldStatus !== OrderStatus.DELIVERED) {
            wallet.pendingBalance = Math.max(0, (wallet.pendingBalance || 0) - orderTotal);
            
            const commission = Math.round(orderTotal * 0.10);
            const netAmount = orderTotal - commission;
            
            wallet.availableBalance = (wallet.availableBalance || 0) + netAmount;
            wallet.lifetimeSales = (wallet.lifetimeSales || 0) + orderTotal;
            wallet.lifetimeCommission = (wallet.lifetimeCommission || 0) + commission;

            wallet.transactions.push({
              id: `txn-sale-${order.order_number}-${Date.now()}`,
              type: 'SALE',
              amount: orderTotal,
              orderId: order.order_number,
              date: today,
              status: 'COMPLETED',
              details: `Gross Sale for Order #${order.order_number}`
            });

            wallet.transactions.push({
              id: `txn-comm-${order.order_number}-${Date.now()}`,
              type: 'COMMISSION',
              amount: commission,
              orderId: order.order_number,
              date: today,
              status: 'COMPLETED',
              details: `10% Villex Commission for Order #${order.order_number}`
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
                id: `txn-ref-${order.order_number}-${Date.now()}`,
                type: 'REFUND',
                amount: orderTotal,
                orderId: order.order_number,
                date: today,
                status: 'COMPLETED',
                details: `Refund for Order #${order.order_number} (reversing net credit PKR ${netAmount.toLocaleString()})`
              });
            } else {
              wallet.pendingBalance = Math.max(0, (wallet.pendingBalance || 0) - orderTotal);

              wallet.transactions.push({
                id: `txn-ref-${order.order_number}-${Date.now()}`,
                type: 'REFUND',
                amount: orderTotal,
                orderId: order.order_number,
                date: today,
                status: 'COMPLETED',
                details: `Cancellation/Refund for Order #${order.order_number}`
              });
            }
          }

          // Update vendor wallet
          const { error: updateVendorError } = await supabaseAdmin
            .from('vendors')
            .update({ wallet })
            .eq('id', vendor.id);

          if (updateVendorError) throw updateVendorError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
