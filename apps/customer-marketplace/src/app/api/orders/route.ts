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

    const mapped = (dbOrders || []).map((o: any) => {
      const payment = Array.isArray(o.payments) ? o.payments[0] : o.payments;
      const user = o.users;

      let payMethodStr = 'Cash on Delivery (COD)';
      if (payment?.payment_method === PaymentMethod.EASYPAISA) payMethodStr = 'EasyPaisa';
      if (payment?.payment_method === PaymentMethod.JAZZCASH) payMethodStr = 'JazzCash';
      if (payment?.payment_method === 'STRIPE') payMethodStr = 'Stripe';

      let statusStr = 'PENDING';
      if (o.order_status === OrderStatus.PROCESSING) statusStr = 'PROCESSING';
      if (o.order_status === OrderStatus.SHIPPED) statusStr = 'SHIPPED';
      if (o.order_status === OrderStatus.DELIVERED) statusStr = 'DELIVERED';
      if (o.order_status === OrderStatus.CANCELLED) statusStr = 'CANCELLED';

      const items = o.order_items || [];

      return {
        id: o.order_number,
        orderId: o.id,
        customerName: user ? `${user.first_name} ${user.last_name}`.trim() : 'Customer',
        customerEmail: user?.email || '',
        customerPhone: (o.shipping_address as any)?.phone || user?.phone || '',
        shippingAddress: (o.shipping_address as any)?.address || '',
        date: new Date(o.created_at).toISOString().split('T')[0],
        subtotal: Number(o.subtotal || o.total_amount),
        total: Number(o.total_amount),
        paymentMethod: payMethodStr,
        status: statusStr,
        itemsCount: items.reduce((acc: number, item: any) => acc + item.quantity, 0),
        walletPhone: (payment?.gateway_response as any)?.phone || undefined,
        walletTid: payment?.transaction_id || undefined,
        items: items.map((item: any) => ({
          id: item.variant_sku || item.variant_id,
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

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Checkout cart is empty.' }, { status: 400 });
    }

    // 1. Authoritative Customer Identification
    let customerUserId: string | null = null;
    const authHeader = request.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      if (userData?.user?.id) {
        customerUserId = userData.user.id;
      }
    }

    const customerEmail = (body.customerEmail || body.email || 'customer@villex.pk').toLowerCase().trim();
    const customerPhone = body.customerPhone || body.phone || '0321-9876543';
    const customerName = (body.customerName || body.name || 'Customer').trim();
    const [firstName, ...restName] = customerName.split(' ');
    const lastName = restName.join(' ') || '';

    // If unauthenticated guest, resolve or provision user record to satisfy NOT NULL FK constraint
    if (!customerUserId) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();

      if (existingUser?.id) {
        customerUserId = existingUser.id;
      } else {
        const newUserId = randomUUID();
        const { data: newUser, error: userCreateErr } = await supabaseAdmin
          .from('users')
          .insert({
            id: newUserId,
            email: customerEmail,
            password_hash: '$2b$10$devSaltPlaceholderForHashedPasswords1234567890',
            first_name: firstName || 'Walk-in',
            last_name: lastName || 'Customer',
            phone: customerPhone,
            is_active: true
          })
          .select('id')
          .single();

        if (userCreateErr || !newUser) {
          // Fallback to default walk-in customer if creation collision
          const { data: fallbackUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', 'customer@villex.pk')
            .maybeSingle();
          customerUserId = fallbackUser?.id || newUserId;
        } else {
          customerUserId = newUser.id;
          // Assign customer role if role exists
          try {
            const { data: role } = await supabaseAdmin.from('roles').select('id').eq('name', 'CUSTOMER').maybeSingle();
            if (role) {
              await supabaseAdmin.from('user_roles').insert({ user_id: customerUserId, role_id: role.id });
            }
          } catch {
            // Role assignment optional
          }
        }
      }
    }

    // 2. Persistent Idempotency Check
    const orderNumber = body.id || body.orderNumber || `BB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, order_status')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        order: {
          id: existingOrder.order_number,
          orderId: existingOrder.id,
          total: Number(existingOrder.total_amount),
          status: existingOrder.order_status
        }
      });
    }

    // 3. Server-Authoritative Pricing, Variant Resolution & Flash Deal Check
    const nowIso = new Date().toISOString();
    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      variant: any;
      product: any;
      vendor: any;
      quantity: number;
      unitPrice: number;
      lineSubtotal: number;
      commission: number;
      dealId: string | null;
    }> = [];

    // Deduplicate and aggregate quantities by item ID
    const aggregatedCartItems: Record<string, { id: string; name?: string; qty: number }> = {};
    for (const rawItem of body.items) {
      const lineId = String(rawItem.id || rawItem.variant_id || rawItem.sku || '').trim();
      const quantity = Math.max(1, parseInt(rawItem.qty || rawItem.quantity || '1', 10));
      if (!lineId) continue;
      if (!aggregatedCartItems[lineId]) {
        aggregatedCartItems[lineId] = { id: lineId, name: rawItem.name, qty: quantity };
      } else {
        aggregatedCartItems[lineId].qty += quantity;
      }
    }

    for (const lineKey of Object.keys(aggregatedCartItems)) {
      const item = aggregatedCartItems[lineKey];
      if (!item) continue;

      // Query variant by SKU, ID, or product_id
      let { data: variants } = await supabaseAdmin
        .from('product_variants')
        .select(`
          id,
          sku,
          price,
          product_id,
          products!inner (
            id,
            name,
            status,
            approval_status,
            vendor_id,
            vendors!inner (
              id,
              store_name,
              commission_rate,
              status
            )
          )
        `)
        .or(`id.eq.${item.id},sku.eq.${item.id},product_id.eq.${item.id}`)
        .limit(1);

      let variant = variants?.[0];

      if (!variant) {
        // Fallback to name match or any active variant
        const { data: variantsByName } = await supabaseAdmin
          .from('product_variants')
          .select(`
            id,
            sku,
            price,
            product_id,
            products!inner (
              id,
              name,
              status,
              approval_status,
              vendor_id,
              vendors!inner (
                id,
                store_name,
                commission_rate,
                status
              )
            )
          `)
          .eq('products.name', item.name || '')
          .limit(1);

        variant = variantsByName?.[0];
      }

      if (!variant) {
        return NextResponse.json({ success: false, error: `Product variant "${item.name || item.id}" could not be verified.` }, { status: 400 });
      }

      const rawProduct = (variant as any).products;
      const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
      const rawVendor = product?.vendors;
      const vendor = Array.isArray(rawVendor) ? rawVendor[0] : rawVendor;

      // Check for active approved Flash Deal on this product/variant
      let activeDeal: any = null;
      try {
        const { data: deal } = await supabaseAdmin
          .from('flash_deals')
          .select('*')
          .or(`variant_id.eq.${variant.id},product_id.eq.${product.id}`)
          .eq('status', 'APPROVED')
          .eq('is_active', true)
          .lte('starts_at', nowIso)
          .gte('ends_at', nowIso)
          .maybeSingle();

        if (deal) {
          const promoStock = Number(deal.promotional_stock || 0);
          const soldCount = Number(deal.sold_count || 0);
          const reservedStock = Number(deal.reserved_stock || 0);
          const availableDealStock = Math.max(0, promoStock - soldCount - reservedStock);

          if (availableDealStock >= item.qty) {
            activeDeal = deal;
          }
        }
      } catch {
        // Flash deals table might not be initialized
      }

      // Server-authoritative unit price
      const unitPrice = activeDeal ? Number(activeDeal.deal_price) : Number(variant.price || 0);
      const lineSubtotal = unitPrice * item.qty;
      calculatedSubtotal += lineSubtotal;

      // Server-authoritative vendor commission calculation
      const vendorCommissionRate = Number(vendor?.commission_rate || 10) / 100;
      const commission = Math.round(lineSubtotal * vendorCommissionRate);

      // Inventory check
      try {
        const { data: inventory } = await supabaseAdmin
          .from('inventories')
          .select('id, quantity')
          .eq('variant_id', variant.id)
          .maybeSingle();

        if (inventory && Number(inventory.quantity) < item.qty) {
          return NextResponse.json(
            { success: false, error: `Insufficient inventory for product "${product.name}". Available: ${inventory.quantity}, Requested: ${item.qty}` },
            { status: 400 }
          );
        }
      } catch {
        // Inventory table bypass if not linked
      }

      validatedItems.push({
        variant,
        product,
        vendor,
        quantity: item.qty,
        unitPrice,
        lineSubtotal,
        commission,
        dealId: activeDeal ? activeDeal.id : null
      });
    }

    const shippingFee = body.shippingFee !== undefined ? Number(body.shippingFee) : 0;
    const finalTotalAmount = calculatedSubtotal + shippingFee;

    // 4. Order and Payment Status Mapping
    let orderStatus: OrderStatus = OrderStatus.PENDING;
    if (body.status === 'PROCESSING') orderStatus = OrderStatus.PROCESSING;
    if (body.status === 'SHIPPED') orderStatus = OrderStatus.SHIPPED;
    if (body.status === 'DELIVERED') orderStatus = OrderStatus.DELIVERED;
    if (body.status === 'CANCELLED') orderStatus = OrderStatus.CANCELLED;

    let payMethod: PaymentMethod = PaymentMethod.COD;
    if (body.paymentMethod === 'EasyPaisa' || body.paymentMethod === PaymentMethod.EASYPAISA) payMethod = PaymentMethod.EASYPAISA;
    if (body.paymentMethod === 'JazzCash' || body.paymentMethod === PaymentMethod.JAZZCASH) payMethod = PaymentMethod.JAZZCASH;

    // 5. Create Parent Order
    const orderId = randomUUID();
    const shippingAddressObj = {
      name: customerName,
      address: body.shippingAddress || 'N/A',
      phone: customerPhone,
      city: body.city || 'Karachi'
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: orderId,
        user_id: customerUserId,
        order_number: orderNumber,
        subtotal: calculatedSubtotal,
        total_amount: finalTotalAmount,
        shipping_address: shippingAddressObj,
        billing_address: shippingAddressObj,
        order_status: orderStatus,
        created_at: new Date(body.date || Date.now()).toISOString()
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 6. Create Payment Record
    const paymentStatus = (orderStatus === OrderStatus.DELIVERED || body.walletTid) ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;

    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        id: randomUUID(),
        order_id: order.id,
        payment_method: payMethod,
        amount: finalTotalAmount,
        status: paymentStatus,
        transaction_id: body.walletTid || null,
        gateway_response: body.walletPhone ? { phone: body.walletPhone, tid: body.walletTid } : {}
      });

    if (paymentError) {
      console.warn('Payment insert warning:', paymentError.message);
    }

    // 7. Insert Order Items & Decrement Stock / Promotional Allocations
    for (const vItem of validatedItems) {
      const { error: itemInsertErr } = await supabaseAdmin
        .from('order_items')
        .insert({
          id: randomUUID(),
          order_id: order.id,
          variant_id: vItem.variant.id,
          vendor_id: vItem.product.vendor_id,
          product_name: vItem.product.name,
          variant_sku: vItem.variant.sku,
          unit_price: vItem.unitPrice,
          quantity: vItem.quantity,
          subtotal: vItem.lineSubtotal,
          commission_fee: vItem.commission,
          status: orderStatus
        });

      if (itemInsertErr) {
        console.error('Order item insert error:', itemInsertErr);
      }

      // Decrement inventory quantity
      try {
        const { data: currentInv } = await supabaseAdmin
          .from('inventories')
          .select('id, quantity')
          .eq('variant_id', vItem.variant.id)
          .maybeSingle();

        if (currentInv) {
          const newQty = Math.max(0, Number(currentInv.quantity) - vItem.quantity);
          await supabaseAdmin
            .from('inventories')
            .update({ quantity: newQty })
            .eq('id', currentInv.id);
        }
      } catch (invErr) {
        console.warn('Inventory decrement warning:', invErr);
      }

      // If item was purchased under an active flash deal, record sold count
      if (vItem.dealId) {
        try {
          const { data: currentDeal } = await supabaseAdmin
            .from('flash_deals')
            .select('sold_count')
            .eq('id', vItem.dealId)
            .maybeSingle();

          if (currentDeal) {
            await supabaseAdmin
              .from('flash_deals')
              .update({ sold_count: (currentDeal.sold_count || 0) + vItem.quantity })
              .eq('id', vItem.dealId);
          }
        } catch (dealErr) {
          console.warn('Flash deal sold count update warning:', dealErr);
        }
      }
    }

    // 8. Update Vendor Wallets with net pending amount
    for (const vItem of validatedItems) {
      if (vItem.vendor) {
        try {
          const { data: currentVendor } = await supabaseAdmin
            .from('vendors')
            .select('wallet')
            .eq('id', vItem.vendor.id)
            .maybeSingle();

          const wallet = (currentVendor?.wallet as any) || {
            availableBalance: 0,
            pendingBalance: 0,
            lifetimeSales: 0,
            lifetimeCommission: 0
          };
          const netVendorAmount = vItem.lineSubtotal - vItem.commission;
          wallet.pendingBalance = (wallet.pendingBalance || 0) + netVendorAmount;
          wallet.lifetimeSales = (wallet.lifetimeSales || 0) + vItem.lineSubtotal;
          wallet.lifetimeCommission = (wallet.lifetimeCommission || 0) + vItem.commission;

          await supabaseAdmin
            .from('vendors')
            .update({ wallet })
            .eq('id', vItem.vendor.id);
        } catch (wErr) {
          console.warn('Vendor wallet update warning:', wErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderNumber,
        orderId: order.id,
        subtotal: calculatedSubtotal,
        shippingFee,
        total: finalTotalAmount,
        status: orderStatus,
        customerName,
        customerPhone,
        shippingAddress: body.shippingAddress
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
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

    let nextStatus = order.order_status;
    if (body.status === 'PROCESSING') nextStatus = OrderStatus.PROCESSING;
    if (body.status === 'SHIPPED') nextStatus = OrderStatus.SHIPPED;
    if (body.status === 'DELIVERED') nextStatus = OrderStatus.DELIVERED;
    if (body.status === 'CANCELLED') nextStatus = OrderStatus.CANCELLED;

    // Idempotent cancellation and stock restoration
    if (nextStatus === OrderStatus.CANCELLED && order.order_status !== OrderStatus.CANCELLED) {
      const items = order.order_items || [];
      for (const item of items) {
        if (item.variant_id) {
          try {
            const { data: inv } = await supabaseAdmin
              .from('inventories')
              .select('id, quantity')
              .eq('variant_id', item.variant_id)
              .maybeSingle();

            if (inv) {
              await supabaseAdmin
                .from('inventories')
                .update({ quantity: (inv.quantity || 0) + item.quantity })
                .eq('id', inv.id);
            }
          } catch (invErr) {
            console.warn('Stock restoration warning:', invErr);
          }
        }
      }
    }

    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update({ order_status: nextStatus })
      .eq('id', order.id);

    if (updateOrderError) throw updateOrderError;

    const { error: updateItemsError } = await supabaseAdmin
      .from('order_items')
      .update({ status: nextStatus })
      .eq('order_id', order.id);

    if (updateItemsError) throw updateItemsError;

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
