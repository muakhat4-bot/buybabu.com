import { NextResponse } from 'next/server';
import { supabaseAdmin, OrderStatus, PaymentMethod, PaymentStatus } from '@villex/supabase';
import { randomUUID } from 'crypto';

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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
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
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: randomUUID(),
        user_id: customerUser.id,
        order_number: orderNumber,
        subtotal: body.total,
        total_amount: body.total,
        shipping_address: { address: body.shippingAddress || 'N/A', phone: body.customerPhone || '' },
        billing_address: { address: body.shippingAddress || 'N/A', phone: body.customerPhone || '' },
        order_status: orderStatus,
        created_at: new Date(body.date || Date.now()).toISOString()
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create Payment
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        id: randomUUID(),
        order_id: order.id,
        payment_method: payMethod,
        amount: body.total,
        status: orderStatus === OrderStatus.DELIVERED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        transaction_id: body.walletTid || null,
        gateway_response: body.walletPhone ? { phone: body.walletPhone } : {}
      });

    if (paymentError) throw paymentError;

    // Find and update Vendor Wallet
    let matchedVendor: any = null;

    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        // Find variant - try SKU first, then product UUID, then product name
        let { data: variantsBySku } = await supabaseAdmin
          .from('product_variants')
          .select('*, products!inner(*, vendors(*))')
          .eq('sku', item.id);

        let variant = variantsBySku?.[0];

        if (!variant) {
          const { data: variantsByProductId } = await supabaseAdmin
            .from('product_variants')
            .select('*, products!inner(*, vendors(*))')
            .eq('product_id', item.id);
          variant = variantsByProductId?.[0];
        }

        if (!variant) {
          const { data: variantsByName } = await supabaseAdmin
            .from('product_variants')
            .select('*, products!inner(*, vendors(*))')
            .eq('products.name', item.name);
          variant = variantsByName?.[0];
        }

        if (!variant) {
          const { data: fallbackVariants } = await supabaseAdmin
            .from('product_variants')
            .select('*, products!inner(*, vendors(*))')
            .limit(1);
          variant = fallbackVariants?.[0];
        }

        if (variant) {
          matchedVendor = variant.products?.vendors;
          const commission = Math.round(Number(item.price) * item.qty * 0.10);

          const { error: orderItemError } = await supabaseAdmin
            .from('order_items')
            .insert({
              id: randomUUID(),
              order_id: order.id,
              variant_id: variant.id,
              vendor_id: variant.products.vendor_id,
              product_name: item.name,
              variant_sku: variant.sku,
              unit_price: item.price,
              quantity: item.qty,
              subtotal: item.price * item.qty,
              commission_fee: commission,
              status: orderStatus
            });

          if (orderItemError) throw orderItemError;
        }
      }
    }

    // Default vendor if none matched
    if (!matchedVendor) {
      const { data: fallbackVendor } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('support_email', 'contact@electropulse.pk')
        .maybeSingle();

      matchedVendor = fallbackVendor;
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

      const { error: walletUpdateError } = await supabaseAdmin
        .from('vendors')
        .update({ wallet })
        .eq('id', matchedVendor.id);

      if (walletUpdateError) throw walletUpdateError;
    }

    return NextResponse.json({ success: true, order: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', body.id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Map orderStatus
    let orderStatus = order.order_status;
    if (body.status === 'PROCESSING') orderStatus = OrderStatus.PROCESSING;
    if (body.status === 'SHIPPED') orderStatus = OrderStatus.SHIPPED;
    if (body.status === 'DELIVERED') orderStatus = OrderStatus.DELIVERED;
    if (body.status === 'CANCELLED') orderStatus = OrderStatus.CANCELLED;

    // Update main order
    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update({ order_status: orderStatus })
      .eq('id', order.id);

    if (updateOrderError) throw updateOrderError;

    // Update order items status
    const { error: updateItemsError } = await supabaseAdmin
      .from('order_items')
      .update({ status: orderStatus })
      .eq('order_id', order.id);

    if (updateItemsError) throw updateItemsError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
