import { PrismaClient, VendorStatus, ProductStatus, PaymentMethod, PaymentStatus, OrderStatus, WalletTransactionType, WalletTransactionStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper to hash password dummy (since we just import them, in development we can keep it plain text or basic)
const DEFAULT_PASSWORD_HASH = '$2b$10$devSaltPlaceholderForHashedPasswords1234567890'; // mock bcrypt

interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  orderId?: string;
  date: string;
  status: string;
  details: string;
}

interface DbVendor {
  email: string;
  password?: string;
  storeName: string;
  storeId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: string;
  joinedDate?: string;
  revenue?: number;
  orders?: number;
  verificationStatus?: string;
  legalName?: string;
  ntnNumber?: string;
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  logoUrl?: string;
  bannerUrl?: string;
  wallet?: {
    availableBalance: number;
    pendingBalance: number;
    lifetimeSales: number;
    lifetimeCommission: number;
    transactions: WalletTransaction[];
  };
  storeDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
}

interface DbProductOption {
  id: string;
  name: string;
  values: string[];
}

interface DbProductVariant {
  name: string;
  price: number;
  stock: number;
  sku: string;
  active: boolean;
}

interface DbProduct {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  category: string;
  brand?: string;
  inStock?: boolean;
  freeShipping?: boolean;
  expressDelivery?: boolean;
  description: string;
  tag?: string;
  gallery?: string[];
  specs?: Record<string, string>;
  storeId: string;
  storeName: string;
  options?: DbProductOption[];
  variants?: DbProductVariant[];
  approvalStatus?: string;
  rejectionReason?: string;
}

interface DbOrderItem {
  id: string;
  name: string;
  image: string;
  qty: number;
  price: number;
  spec?: string;
}

interface DbOrder {
  id: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  date: string;
  total: number;
  paymentMethod: string;
  status: string;
  itemsCount: number;
  items?: DbOrderItem[];
  walletPhone?: string;
  walletTid?: string;
}

interface DbData {
  vendors: DbVendor[];
  products: DbProduct[];
  orders: DbOrder[];
}

async function main() {
  console.log('Starting database seeding from db.json...');

  const dbPath = path.join(__dirname, '..', '..', '..', 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.error(`db.json not found at ${dbPath}`);
    return;
  }

  const rawData = fs.readFileSync(dbPath, 'utf8');
  const dbData = JSON.parse(rawData) as DbData;

  // 0. Clear existing data
  console.log('Clearing existing data from database...');
  await prisma.systemSetting.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.returnRequest.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.payout.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.vendorVerification.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.userRoleLink.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Roles
  console.log('Creating system roles...');
  const roles = [
    { name: 'SUPER_ADMIN', description: 'System Administrator' },
    { name: 'VENDOR_ADMIN', description: 'Merchant / Store Owner' },
    { name: 'CUSTOMER', description: 'Marketplace Shopper' }
  ];

  const roleMap: Record<string, any> = {};
  for (const r of roles) {
    const roleObj = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r
    });
    roleMap[r.name] = roleObj;
  }

  // 2. Create default customer/shopper user for existing orders
  console.log('Creating default customer user...');
  const defaultCustomerUser = await prisma.user.upsert({
    where: { email: 'customer@villex.pk' },
    update: {},
    create: {
      email: 'customer@villex.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Default',
      lastName: 'Customer',
      phone: '03001234567',
      isActive: true
    }
  });

  // Link Default Customer Role
  await prisma.userRoleLink.upsert({
    where: {
      userId_roleId: {
        userId: defaultCustomerUser.id,
        roleId: roleMap['CUSTOMER'].id
      }
    },
    update: {},
    create: {
      userId: defaultCustomerUser.id,
      roleId: roleMap['CUSTOMER'].id
    }
  });

  // 3. Create Categories
  console.log('Seeding categories...');
  const categoriesList = Array.from(new Set(dbData.products.map(p => p.category.toLowerCase().trim())));
  const categoryMap: Record<string, any> = {};

  for (const catName of categoriesList) {
    const slug = catName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: catName.charAt(0).toUpperCase() + catName.slice(1),
        slug,
        isActive: true
      }
    });
    categoryMap[catName] = category;
  }

  // 4. Create Vendors & Users
  console.log('Seeding merchants/vendors...');
  const vendorMap: Record<string, any> = {};

  for (const v of dbData.vendors) {
    const email = v.email.toLowerCase().trim();
    // Create User account for vendor
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: DEFAULT_PASSWORD_HASH,
        firstName: v.firstName || v.storeName.split(' ')[0] || 'Owner',
        lastName: v.lastName || 'Owner',
        phone: v.phone || '',
        isActive: true
      }
    });

    // Link Vendor Role
    await prisma.userRoleLink.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: roleMap['VENDOR_ADMIN'].id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: roleMap['VENDOR_ADMIN'].id
      }
    });

    // Map vendor status
    let status: VendorStatus = VendorStatus.PENDING;
    if (v.status === 'ACTIVE') status = VendorStatus.ACTIVE;
    if (v.status === 'SUSPENDED') status = VendorStatus.SUSPENDED;
    if (v.status === 'REJECTED') status = VendorStatus.REJECTED;

    const storeSlug = v.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Create Vendor profile
    const vendor = await prisma.vendor.upsert({
      where: { storeName: v.storeName },
      update: {
        status,
        logoUrl: v.logoUrl || null,
        bannerUrl: v.bannerUrl || null,
        description: v.storeDescription || null,
        wallet: (v.wallet as any) || null
      },
      create: {
        ownerId: user.id,
        storeName: v.storeName,
        storeSlug,
        description: v.storeDescription || null,
        supportEmail: v.supportEmail || email,
        supportPhone: v.supportPhone || v.phone || '',
        status,
        commissionRate: 10.00,
        wallet: (v.wallet as any) || null
      }
    });

    // Store vendor in map by storeId (e.g. #VLX-MER-089)
    vendorMap[v.storeId] = vendor;

    // Create vendor verification if NTN is present
    if (v.ntnNumber) {
      await prisma.vendorVerification.create({
        data: {
          vendorId: vendor.id,
          legalName: v.legalName || v.storeName,
          taxId: v.ntnNumber,
          documentUrls: {},
          verifiedAt: v.verificationStatus === 'APPROVED' ? new Date() : null
        }
      });
    }

    // Seed normalized Wallet & WalletTransactions
    let availableBalance = 0;
    let pendingBalance = 0;
    let lifetimeSales = 0;
    let lifetimeCommission = 0;

    if (v.wallet) {
      availableBalance = v.wallet.availableBalance || 0;
      pendingBalance = v.wallet.pendingBalance || 0;
      lifetimeSales = v.wallet.lifetimeSales || 0;
      lifetimeCommission = v.wallet.lifetimeCommission || 0;
    }

    const wallet = await prisma.wallet.create({
      data: {
        vendorId: vendor.id,
        availableBalance,
        pendingBalance,
        lifetimeSales,
        lifetimeCommission
      }
    });

    if (v.wallet && v.wallet.transactions && Array.isArray(v.wallet.transactions)) {
      for (const tx of v.wallet.transactions) {
        let type: WalletTransactionType = WalletTransactionType.SALE;
        if (tx.type === 'REFUND') type = WalletTransactionType.REFUND;
        if (tx.type === 'COMMISSION') type = WalletTransactionType.COMMISSION;
        if (tx.type === 'WITHDRAWAL') type = WalletTransactionType.WITHDRAWAL;

        let status: WalletTransactionStatus = WalletTransactionStatus.COMPLETED;
        if (tx.status === 'PENDING') status = WalletTransactionStatus.PENDING;
        if (tx.status === 'APPROVED') status = WalletTransactionStatus.APPROVED;
        if (tx.status === 'REJECTED') status = WalletTransactionStatus.REJECTED;
        if (tx.status === 'PAID') status = WalletTransactionStatus.PAID;

        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type,
            amount: tx.amount,
            orderNumber: tx.orderId || null,
            status,
            details: tx.details || '',
            createdAt: tx.date ? new Date(tx.date) : new Date()
          }
        });
      }
    }
  }

  // 5. Create Products & Variants
  console.log('Seeding products...');
  const productMap: Record<string, any> = {};
  const variantSkuMap: Record<string, any> = {};

  // Track unique SKUs to prevent DB constraint failures on duplicate mock data
  const seenSkus = new Set<string>();
  const getUniqueSku = (baseSku: string): string => {
    const sku = baseSku.trim().toUpperCase() || 'VLX-GENERIC-SKU';
    let counter = 1;
    let uniqueSku = sku;
    while (seenSkus.has(uniqueSku)) {
      uniqueSku = `${sku}-${counter}`;
      counter++;
    }
    seenSkus.add(uniqueSku);
    return uniqueSku;
  };

  for (const p of dbData.products) {
    const matchedVendor = vendorMap[p.storeId];
    if (!matchedVendor) {
      console.warn(`Vendor code ${p.storeId} not found for product: ${p.name}`);
      continue;
    }

    const matchedCategory = categoryMap[p.category.toLowerCase().trim()];
    if (!matchedCategory) {
      console.warn(`Category ${p.category} not found for product: ${p.name}`);
      continue;
    }

    const slug = `${p.id}-${p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

    // Map product fields
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        approvalStatus: p.approvalStatus || 'APPROVED',
        rejectionReason: p.rejectionReason || null
      },
      create: {
        vendorId: matchedVendor.id,
        categoryId: matchedCategory.id,
        name: p.name,
        slug,
        description: p.description || '',
        brand: p.brand || null,
        images: { main: p.image, gallery: p.gallery || [] },
        specifications: (p.specs as any) || {},
        status: p.inStock ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        avgRating: p.rating || 0.0,
        reviewCount: p.reviews || 0,
        approvalStatus: p.approvalStatus || 'APPROVED',
        rejectionReason: p.rejectionReason || null
      }
    });

    productMap[p.id] = product;

    // Create Variants
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        const uniqueSku = getUniqueSku(v.sku);
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: uniqueSku,
            price: v.price,
            compareAtPrice: p.oldPrice || null,
            attributes: { option: v.name },
            isActive: v.active
          }
        });
        variantSkuMap[v.sku] = variant;
        variantSkuMap[uniqueSku] = variant;

        // Create Inventory
        await prisma.inventory.create({
          data: {
            variantId: variant.id,
            stockQty: v.stock,
            lowStockThreshold: 2
          }
        });
      }
    } else {
      // Create a default variant
      const defaultSku = p.sku || `VLX-${p.id.toUpperCase()}`;
      const uniqueSku = getUniqueSku(defaultSku);
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: uniqueSku,
          price: p.price,
          compareAtPrice: p.oldPrice || null,
          attributes: { default: true },
          isActive: true
        }
      });
      variantSkuMap[defaultSku] = variant;
      variantSkuMap[uniqueSku] = variant;
      variantSkuMap[p.name] = variant; // Fallback map by name for order matching

      // Create Inventory
      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          stockQty: p.inStock ? 50 : 0,
          lowStockThreshold: 2
        }
      });
    }
  }

  // 6. Create Orders
  console.log('Seeding orders...');
  for (const o of dbData.orders) {
    // Map OrderStatus
    let status: OrderStatus = OrderStatus.PENDING;
    if (o.status === 'PROCESSING') status = OrderStatus.PROCESSING;
    if (o.status === 'SHIPPED') status = OrderStatus.SHIPPED;
    if (o.status === 'DELIVERED') status = OrderStatus.DELIVERED;
    if (o.status === 'CANCELLED' || o.status === 'REFUNDED') status = OrderStatus.CANCELLED;

    // Map PaymentMethod
    let payMethod: PaymentMethod = PaymentMethod.COD;
    if (o.paymentMethod === 'EasyPaisa') payMethod = PaymentMethod.EASYPAISA;
    if (o.paymentMethod === 'JazzCash') payMethod = PaymentMethod.JAZZCASH;

    const orderNumber = o.id;

    // Create main Order
    const order = await prisma.order.create({
      data: {
        userId: defaultCustomerUser.id,
        orderNumber,
        subtotal: o.total,
        totalAmount: o.total,
        shippingAddress: { address: o.shippingAddress || 'N/A', phone: o.customerPhone || '' },
        billingAddress: { address: o.shippingAddress || 'N/A', phone: o.customerPhone || '' },
        orderStatus: status,
        createdAt: new Date(o.date)
      }
    });

    // Create Payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: payMethod,
        amount: o.total,
        status: status === OrderStatus.DELIVERED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        transactionId: o.walletTid || null,
        gatewayResponse: o.walletPhone ? { phone: o.walletPhone } : {}
      }
    });

    // Create OrderItems
    if (o.items && o.items.length > 0) {
      for (const item of o.items) {
        // Try to match variant by SKU or name
        let matchedVariant = variantSkuMap[item.name];
        if (!matchedVariant) {
          // Find first variant of any product matching the name or try fallback
          const matchedProd = dbData.products.find(p => p.name === item.name);
          if (matchedProd) {
            matchedVariant = variantSkuMap[matchedProd.sku || `VLX-${matchedProd.id.toUpperCase()}`];
          }
        }

        if (!matchedVariant) {
          // Create a dynamic one-off product/variant for orders with missing products
          console.warn(`Could not resolve variant for item ${item.name} in order ${o.id}. Creating fallback...`);
          continue;
        }

        // Get product details
        const prod = await prisma.product.findUnique({
          where: { id: matchedVariant.productId },
          include: { vendor: true }
        });

        if (!prod) continue;

        const commission = Math.round(Number(item.price) * item.qty * 0.10);

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            variantId: matchedVariant.id,
            vendorId: prod.vendorId,
            productName: item.name,
            variantSku: matchedVariant.sku,
            unitPrice: item.price,
            quantity: item.qty,
            subtotal: item.price * item.qty,
            commissionFee: commission,
            status: status
          }
        });
      }
    }
  }

  // Seed default system settings
  console.log('Seeding system settings...');
  const settings = [
    { key: 'site_name', value: 'Villex Multi-Vendor Marketplace' },
    { key: 'support_email', value: 'support@villex.pk' },
    { key: 'commission_rate', value: '10.00' }
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    });
  }

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
