'use client';

import * as React from 'react';
import { Sidebar } from '../features/admin/components/sidebar';
import { StatsOverview } from '../features/admin/components/stats-overview';
import { VendorManagement, Vendor } from '../features/admin/components/vendor-management';
import { CustomerManagement, Customer } from '../features/admin/components/customer-management';
import { OrdersLedger, GlobalOrder } from '../features/admin/components/orders-ledger';
import { PaymentsLedger, Payout } from '../features/admin/components/payments-ledger';
import { ReportsPerformance } from '../features/admin/components/reports-performance';
import { PlatformSettings } from '../features/admin/components/platform-settings';
import { SubscriptionManagement, VendorSubscription, PlanTier as SubPlanTier } from '../features/admin/components/subscription-management';
import { BrandKit } from '../features/admin/components/brand-kit';
import { ProductManagement, Product } from '../features/admin/components/product-management';

const INITIAL_MOCK_ORDERS: GlobalOrder[] = [
  {
    id: '#VLX-ORD-5192',
    customerName: 'Sarah Khan',
    vendorStoreName: 'ElectroPulse Store',
    date: '2026-06-14',
    total: 15500,
    status: 'PROCESSING',
    escrowStatus: 'SECURED_HOLD',
    itemsCount: 1,
    items: [{ name: 'ElectroPulse SoundBlast Wireless Speaker', qty: 1, price: 15500 }],
  },
  {
    id: '#VLX-ORD-5193',
    customerName: 'Muhammad Ahmed',
    vendorStoreName: 'ElectroPulse Store',
    date: '2026-06-13',
    total: 9600,
    status: 'SHIPPED',
    escrowStatus: 'SECURED_HOLD',
    itemsCount: 2,
    items: [{ name: 'VoltCharge 100W GaN Fast Charger', qty: 2, price: 4800 }],
  },
  {
    id: '#VLX-ORD-5194',
    customerName: 'Zainab Bibi',
    vendorStoreName: 'ElectroPulse Store',
    date: '2026-06-12',
    total: 12500,
    status: 'PROCESSING',
    escrowStatus: 'SECURED_HOLD',
    itemsCount: 1,
    items: [{ name: 'ApexPro Wired Mechanical Keyboard', qty: 1, price: 12500 }],
  },
  {
    id: '#VLX-ORD-5195',
    customerName: 'Bilal Mustafa',
    vendorStoreName: 'ElectroPulse Store',
    date: '2026-06-11',
    total: 6500,
    status: 'CANCELLED',
    escrowStatus: 'REFUNDED',
    itemsCount: 1,
    items: [{ name: 'NebulaRGB Gaming Mouse', qty: 1, price: 6500 }],
  },
  {
    id: '#VLX-ORD-5196',
    customerName: 'Ayesha Malik',
    vendorStoreName: 'ElectroPulse Store',
    date: '2026-06-10',
    total: 21300,
    status: 'DELIVERED',
    escrowStatus: 'RELEASED',
    itemsCount: 3,
    items: [
      { name: 'VoltCharge 100W GaN Fast Charger', qty: 1, price: 4800 },
      { name: 'Lumina Desk LED Smart Lamp', qty: 1, price: 8900 },
      { name: 'NebulaRGB Gaming Mouse', qty: 1, price: 6500 }
    ],
  },
  {
    id: '#VLX-ORD-5197',
    customerName: 'Hamza Yusuf',
    vendorStoreName: 'Smart Living Devices',
    date: '2026-06-09',
    total: 8900,
    status: 'RETURNED',
    escrowStatus: 'REFUNDED',
    itemsCount: 1,
    items: [{ name: 'Lumina Desk LED Smart Lamp', qty: 1, price: 8900 }],
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<string>('overview');
  const [isMobileOpen, setIsMobileOpen] = React.useState<boolean>(false);

  // Platform Audit notifications
  const [auditLogs, setAuditLogs] = React.useState<Array<{ id: string; msg: string; time: string }>>([
    { id: '1', msg: 'Payout request of PKR 450,000 approved for ElectroPulse Store', time: '10 mins ago' },
    { id: '2', msg: 'System check: Escrow protection buffers holding PKR 384,900 securely', time: '1 hour ago' },
    { id: '3', msg: 'New vendor onboarding: "Lumina Lights" store submitted verification details', time: '3 hours ago' },
  ]);

  // Platform Settings State
  const [defaultCommissionRate, setDefaultCommissionRate] = React.useState(10);
  const [escrowDelayHours, setEscrowDelayHours] = React.useState(24);
  const [isMaintenanceMode, setIsMaintenanceMode] = React.useState(false);

  interface VendorDbItem {
    storeId?: string;
    storeName: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    commissionRate?: number;
    revenue?: number;
    ntnNumber?: string;
    bankAccountTitle?: string;
    bankAccountNumber?: string;
    bankName?: string;
    joinedDate?: string;
    wallet?: {
      availableBalance: number;
      pendingBalance: number;
      lifetimeSales: number;
      lifetimeCommission: number;
      transactions: Array<{
        id: string;
        type: string;
        amount: number;
        date: string;
        status: string;
        details: string;
      }>;
    };
  }

  // Mock Vendors Database
  const [vendors, setVendors] = React.useState<Vendor[]>([]);

  // Products Database
  const [products, setProducts] = React.useState<Product[]>([]);

  const fetchVendors = React.useCallback(async () => {
    try {
      const response = await fetch('/api/vendors');
      const data = (await response.json()) as VendorDbItem[];
      
      const mappedVendors = data.map((v: VendorDbItem) => ({
        id: v.storeId || `#VLX-MER-${Math.floor(100 + Math.random() * 900)}`,
        storeName: v.storeName,
        ownerName: `${v.firstName} ${v.lastName}`,
        email: v.email,
        status: v.status === 'PENDING' ? ('PENDING_APPROVAL' as const) : (v.status as 'ACTIVE' | 'SUSPENDED' | 'REJECTED'),
        commissionRate: v.commissionRate || 10,
        escrowBalance: v.wallet ? v.wallet.availableBalance : (v.revenue || 0),
        verificationDocs: {
          cnicName: `${v.firstName} ${v.lastName}`,
          cnicNumber: v.ntnNumber || '37405-1234567-1',
          ntnNumber: v.ntnNumber || 'NTN-8901238-1',
          bankAccountTitle: v.bankAccountTitle || v.storeName,
          bankAccountNumber: v.bankAccountNumber || 'HBL-0091820192801',
          bankName: v.bankName || 'Habib Bank Limited (HBL)',
          emailDomain: v.email.split('@')[1] || 'electropulse.pk',
          type: (v.status === 'PENDING' ? 'HIGH_RISK' : 'VALID') as 'VALID' | 'HIGH_RISK',
        }
      }));
      
      setVendors(mappedVendors);

      const mappedSubs = data.map((v: VendorDbItem) => ({
        vendorId: v.storeId || `#VLX-MER-${Math.floor(100 + Math.random() * 900)}`,
        storeName: v.storeName,
        ownerName: `${v.firstName} ${v.lastName}`,
        email: v.email,
        plan: v.email === 'contact@electropulse.pk' ? ('PREMIUM' as const) : ('FREE' as const),
        billingCycle: 'MONTHLY' as const,
        nextBillingDate: v.email === 'contact@electropulse.pk' ? '2026-07-01' : 'N/A',
        mrr: v.email === 'contact@electropulse.pk' ? 4999 : 0,
        commissionRate: v.email === 'contact@electropulse.pk' ? 7 : 12,
        status: v.status === 'ACTIVE' ? ('ACTIVE' as const) : ('TRIAL' as const),
        joinedDate: (v.joinedDate || new Date().toISOString().split('T')[0]) as string,
        totalRevenue: v.wallet ? v.wallet.lifetimeSales : (v.revenue || 0),
      }));
      setVendorSubscriptions(mappedSubs);

      // Extract withdrawal requests dynamically from live wallets
      const extractedPayouts: Payout[] = [];
      data.forEach((v: any) => {
        if (v.wallet && v.wallet.transactions) {
          v.wallet.transactions.forEach((tx: any) => {
            if (tx.type === 'WITHDRAWAL') {
              let bankNameVal = v.bankName || 'N/A';
              let accountNumberVal = v.bankAccountNumber || 'N/A';
              let accountTitleVal = v.bankAccountTitle || v.storeName || '';
              
              if (tx.payoutMethod) {
                if (tx.payoutMethod === 'BANK') {
                  bankNameVal = tx.payoutDetails?.bankName || bankNameVal;
                  accountNumberVal = tx.payoutDetails?.accountNumber || accountNumberVal;
                  accountTitleVal = tx.payoutDetails?.accountTitle || accountTitleVal;
                } else if (tx.payoutMethod === 'JAZZCASH') {
                  bankNameVal = 'JazzCash';
                  accountNumberVal = tx.payoutDetails?.mobileNumber || accountNumberVal;
                  accountTitleVal = tx.payoutDetails?.accountTitle || accountTitleVal;
                } else if (tx.payoutMethod === 'EASYPAISA') {
                  bankNameVal = 'Easypaisa';
                  accountNumberVal = tx.payoutDetails?.mobileNumber || accountNumberVal;
                  accountTitleVal = tx.payoutDetails?.accountTitle || accountTitleVal;
                }
              }
              
              extractedPayouts.push({
                id: tx.id,
                storeName: v.storeName,
                amount: tx.amount,
                bankName: bankNameVal,
                accountNumber: accountNumberVal,
                accountTitle: accountTitleVal,
                requestedDate: tx.date,
                status: tx.status === 'PAID' ? 'PAID' : tx.status === 'APPROVED' ? 'APPROVED' : tx.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
                payoutMethod: tx.payoutMethod
              });
            }
          });
        }
      });
      setPayouts(extractedPayouts);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  }, []);

  const fetchOrders = React.useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        const mappedOrders = data.map((o: any) => ({
          id: o.id,
          customerName: o.customerName,
          vendorStoreName: o.vendorStoreName || 'ElectroPulse Store',
          date: o.date,
          total: o.total,
          status: o.status,
          escrowStatus: o.status === 'REFUNDED' ? 'REFUNDED' as const : o.status === 'DELIVERED' ? 'RELEASED' as const : 'SECURED_HOLD' as const,
          itemsCount: o.itemsCount || (o.items ? o.items.length : 0),
          items: o.items,
          returnReason: o.returnReason,
          returnComment: o.returnComment
        }));
        setOrders([...mappedOrders, ...INITIAL_MOCK_ORDERS]);
      } else {
        setOrders(INITIAL_MOCK_ORDERS);
      }
    } catch (err) {
      console.error('Failed to fetch global orders:', err);
      setOrders(INITIAL_MOCK_ORDERS);
    }
  }, []);

  React.useEffect(() => {
    fetchVendors();
    fetchOrders();
  }, [fetchVendors, fetchOrders]);

  const fetchProducts = React.useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products for admin review:', err);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Mock Customers Database
  const [customers, setCustomers] = React.useState<Customer[]>([
    {
      id: '#VLX-BUY-592',
      name: 'Sarah Khan',
      email: 'sarah.k@gmail.com',
      ordersCount: 8,
      walletBalance: 25000,
      status: 'ACTIVE',
    },
    {
      id: '#VLX-BUY-108',
      name: 'Muhammad Ahmed',
      email: 'm.ahmed@hotmail.com',
      ordersCount: 12,
      walletBalance: 4800,
      status: 'ACTIVE',
    },
    {
      id: '#VLX-BUY-981',
      name: 'Zainab Bibi',
      email: 'zainab.bibi@yahoo.com',
      ordersCount: 3,
      walletBalance: 12500,
      status: 'ACTIVE',
    },
    {
      id: '#VLX-BUY-042',
      name: 'Bilal Mustafa',
      email: 'bilal.m@gmail.com',
      ordersCount: 1,
      walletBalance: 0,
      status: 'SUSPENDED',
    },
    {
      id: '#VLX-BUY-256',
      name: 'Ayesha Malik',
      email: 'ayesha.malik@outlook.com',
      ordersCount: 5,
      walletBalance: 9600,
      status: 'ACTIVE',
    },
  ]);

  // Live Global Orders State
  const [orders, setOrders] = React.useState<GlobalOrder[]>([]);

  // Mock Payout requests database
  const [payouts, setPayouts] = React.useState<Payout[]>([
    {
      id: '#VLX-PAY-101',
      storeName: 'ElectroPulse Store',
      amount: 450000,
      bankName: 'Habib Bank Limited (HBL)',
      accountNumber: 'HBL-0091820192801',
      requestedDate: '2026-06-14',
      status: 'PENDING',
    },
    {
      id: '#VLX-PAY-098',
      storeName: 'Alpha Tech Accessories',
      amount: 80000,
      bankName: 'Meezan Bank',
      accountNumber: 'MEZN-0038910283018',
      requestedDate: '2026-06-13',
      status: 'APPROVED',
    },
    {
      id: '#VLX-PAY-085',
      storeName: 'Luxe Wearable Gadgets',
      amount: 12000,
      bankName: 'Bank Alfalah',
      accountNumber: 'ALFH-0938209381023',
      requestedDate: '2026-06-11',
      status: 'REJECTED',
    },
  ]);

  // Derived calculations
  const totalGtv = 12450000;
  const escrowLocked = orders
    .filter((o) => o.escrowStatus === 'SECURED_HOLD')
    .reduce((sum, o) => sum + o.total, 0);

  const activeVendors = vendors.filter((v) => v.status === 'ACTIVE').length;
  
  const pendingVendorsCount = vendors.filter((v) => v.status === 'PENDING_APPROVAL').length;
  const pendingPayoutsCount = payouts.filter((p) => p.status === 'PENDING').length;
  const pendingProductsCount = products.filter((p) => p.approvalStatus === 'PENDING').length;

  // Mock Subscription Data
  const [vendorSubscriptions, setVendorSubscriptions] = React.useState<VendorSubscription[]>([]);

  // Actions Callbacks
  const handleApproveVendor = async (id: string) => {
    const store = vendors.find((v) => v.id === id);
    if (!store) return;
    
    try {
      await fetch('/api/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: store.email,
          status: 'ACTIVE',
          verificationStatus: 'APPROVED'
        })
      });
      
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'ACTIVE' as const } : v))
      );
      
      const newLog = {
        id: Date.now().toString(),
        msg: `Approved onboarding request for merchant "${store.storeName}"`,
        time: 'Just now',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error('Failed to approve vendor:', err);
    }
  };

  const handleApproveProduct = async (id: string) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approvalStatus: 'APPROVED' }),
      });
      if (response.ok) {
        fetchProducts();
        const targetProduct = products.find(p => p.id === id);
        const newLog = {
          id: Date.now().toString(),
          msg: `Approved catalog product "${targetProduct?.name || id}"`,
          time: 'Just now',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      }
    } catch (err) {
      console.error('Failed to approve product:', err);
    }
  };

  const handleRejectProduct = async (id: string, reason: string) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approvalStatus: 'REJECTED', rejectionReason: reason }),
      });
      if (response.ok) {
        fetchProducts();
        const targetProduct = products.find(p => p.id === id);
        const newLog = {
          id: Date.now().toString(),
          msg: `Rejected catalog product "${targetProduct?.name || id}". Reason: "${reason}"`,
          time: 'Just now',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      }
    } catch (err) {
      console.error('Failed to reject product:', err);
    }
  };

  const handleRejectVendor = async (id: string, reason: string) => {
    const store = vendors.find((v) => v.id === id);
    if (!store) return;
    
    try {
      await fetch('/api/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: store.email,
          status: 'REJECTED',
          verificationStatus: 'REJECTED'
        })
      });
      
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'REJECTED' as const, rejectionReason: reason } : v))
      );
      
      const newLog = {
        id: Date.now().toString(),
        msg: `Declined onboarding request for merchant "${store.storeName}". Reason: "${reason}"`,
        time: 'Just now',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error('Failed to reject vendor:', err);
    }
  };

  const handleToggleVendorStatus = async (id: string) => {
    const store = vendors.find((v) => v.id === id);
    if (!store) return;
    
    const nextStatus = store.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    
    try {
      await fetch('/api/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: store.email,
          status: nextStatus,
          verificationStatus: nextStatus === 'ACTIVE' ? 'APPROVED' : 'REJECTED'
        })
      });
      
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: nextStatus } : v))
      );
      
      const newLog = {
        id: Date.now().toString(),
        msg: `Store "${store.storeName}" status override changed to ${nextStatus}`,
        time: 'Just now',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error('Failed to toggle vendor status:', err);
    }
  };

  const handleOverrideCommission = (id: string, rate: number) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, commissionRate: rate } : v))
    );
    const store = vendors.find((v) => v.id === id);
    const newLog = {
      id: Date.now().toString(),
      msg: `Commission override of ${rate}% set for store "${store?.storeName || id}"`,
      time: 'Just now',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleToggleCustomerStatus = (id: string) => {
    let nextStatus: Customer['status'] = 'ACTIVE';
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          nextStatus = c.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
    const buyer = customers.find((c) => c.id === id);
    const newLog = {
      id: Date.now().toString(),
      msg: `Customer account "${buyer?.name || id}" status changed to ${nextStatus}`,
      time: 'Just now',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleApprovePayout = async (id: string) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve_withdrawal',
          transactionId: id,
        }),
      });

      if (response.ok) {
        fetchVendors();
        const payout = payouts.find((p) => p.id === id);
        const methodText = payout?.payoutMethod === 'BANK' ? 'bank transfer' : payout?.bankName || 'transfer';
        const newLog = {
          id: Date.now().toString(),
          msg: `Approved ${methodText} payout request of PKR ${payout?.amount.toLocaleString()} for "${payout?.storeName}"`,
          time: 'Just now',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      }
    } catch (err) {
      console.error('Failed to approve payout:', err);
    }
  };

  const handlePayPayout = async (id: string) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'pay_withdrawal',
          transactionId: id,
        }),
      });

      if (response.ok) {
        fetchVendors();
        const payout = payouts.find((p) => p.id === id);
        const methodText = payout?.payoutMethod === 'BANK' ? 'bank transfer' : payout?.bankName || 'transfer';
        const newLog = {
          id: Date.now().toString(),
          msg: `Settled & Paid ${methodText} payout of PKR ${payout?.amount.toLocaleString()} for "${payout?.storeName}"`,
          time: 'Just now',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      }
    } catch (err) {
      console.error('Failed to pay payout:', err);
    }
  };

  const handleDeclinePayout = async (id: string) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject_withdrawal',
          transactionId: id,
        }),
      });

      if (response.ok) {
        fetchVendors();
        const payout = payouts.find((p) => p.id === id);
        const methodText = payout?.payoutMethod === 'BANK' ? 'bank transfer' : payout?.bankName || 'transfer';
        const newLog = {
          id: Date.now().toString(),
          msg: `Rejected ${methodText} payout request of PKR ${payout?.amount.toLocaleString()} for "${payout?.storeName}" (funds refunded)`,
          time: 'Just now',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      }
    } catch (err) {
      console.error('Failed to decline payout:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (orderId.startsWith('VLX-') || orderId.startsWith('#VLX-')) {
      try {
        const idToUpdate = orderId.startsWith('#') ? orderId.slice(1) : orderId;
        const response = await fetch('/api/orders', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: idToUpdate,
            status,
          }),
        });

        if (response.ok) {
          fetchOrders();
          fetchVendors();
          return true;
        }
      } catch (err) {
        console.error('Failed to update live order status:', err);
      }
      return false;
    } else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: status as any,
                escrowStatus: status === 'REFUNDED' ? 'REFUNDED' : status === 'DELIVERED' ? 'RELEASED' : 'SECURED_HOLD',
              }
            : o
        )
      );
      return true;
    }
  };

  const handleApproveReturn = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'RETURN_APPROVED');
    if (ok) {
      const newLog = {
        id: Date.now().toString(),
        msg: `Approved return request for order ${orderId}`,
        time: 'Just now',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleRejectReturn = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'DELIVERED');
    if (ok) {
      const newLog = {
        id: Date.now().toString(),
        msg: `Declined return request for order ${orderId} (item returned to customer)`,
        time: 'Just now',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleMarkReturned = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'RETURNED');
    if (ok) {
      const newLog = {
        id: Date.now().toString(),
        msg: `Marked order ${orderId} return items as Picked Up / Returned`,
        time: 'Just now',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleAdminIssueRefund = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'REFUNDED');
    if (ok) {
      const target = orders.find((o) => o.id === orderId);
      const newLog = {
        id: Date.now().toString(),
        msg: `Issued escrow refund of PKR ${target?.total.toLocaleString()} for order ${orderId}`,
        time: 'Just now',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleSaveSettings = (commission: number, escrowDelay: number, maintenance: boolean) => {
    setDefaultCommissionRate(commission);
    setEscrowDelayHours(escrowDelay);
    setIsMaintenanceMode(maintenance);

    const newLog = {
      id: Date.now().toString(),
      msg: `Platform core settings adjusted: Commission ${commission}%, Escrow Release Delay ${escrowDelay}h, Maintenance Mode ${maintenance ? 'ON' : 'OFF'}`,
      time: 'Just now',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleOverridePlan = (vendorId: string, newPlan: SubPlanTier) => {
    const commissionRates: Record<SubPlanTier, number> = { FREE: 12, PREMIUM: 7, ENTERPRISE: 4 };
    setVendorSubscriptions((prev) =>
      prev.map((s) =>
        s.vendorId === vendorId
          ? { ...s, plan: newPlan, commissionRate: commissionRates[newPlan], status: 'ACTIVE' as const }
          : s
      )
    );
    const sub = vendorSubscriptions.find((s) => s.vendorId === vendorId);
    const newLog = {
      id: Date.now().toString(),
      msg: `Admin override: "${sub?.storeName || vendorId}" subscription plan changed to ${newPlan}`,
      time: 'Just now',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleCancelSubscription = (vendorId: string) => {
    setVendorSubscriptions((prev) =>
      prev.map((s) =>
        s.vendorId === vendorId ? { ...s, status: 'CANCELLED' as const } : s
      )
    );
    const sub = vendorSubscriptions.find((s) => s.vendorId === vendorId);
    const newLog = {
      id: Date.now().toString(),
      msg: `Admin cancelled subscription for "${sub?.storeName || vendorId}"`,
      time: 'Just now',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - desktop sticky */}
      <aside className="w-[260px] border-r border-border bg-card/25 px-4 py-6 shrink-0 hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingVendorsCount={pendingVendorsCount}
          pendingPayoutsCount={pendingPayoutsCount}
          pendingProductsCount={pendingProductsCount}
        />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-sm">
          <div className="w-[280px] bg-card border-r border-border p-6 flex flex-col justify-between shadow-2xl relative animate-slide-in">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileOpen(false);
              }}
              pendingVendorsCount={pendingVendorsCount}
              pendingPayoutsCount={pendingPayoutsCount}
              pendingProductsCount={pendingProductsCount}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-border bg-card/25 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          {/* Left: Global Search or Mobile Hamburger */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground bg-secondary/30 border border-border/60 rounded-xl animate-pulse"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div className="relative hidden sm:block">
              <span className="absolute left-3 top-3 text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Global admin portal lookup..."
                className="w-64 h-10 bg-secondary/30 border border-input rounded-xl pl-9 pr-4 text-xs font-semibold placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-150"
              />
            </div>
          </div>

          {/* Right: Escrow indicator alerts and Profile Info */}
          <div className="flex items-center space-x-4">
            {/* Escrow Buffer indicator */}
            <div className="hidden lg:flex items-center space-x-2 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span>Escrow Protected: PKR {escrowLocked.toLocaleString()}</span>
            </div>

            {/* Profile Info */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center font-bold text-sm text-primary-foreground shadow-md shadow-primary/10 select-none">
                SA
              </div>
              <div className="hidden xl:block select-none">
                <p className="text-xs font-black text-foreground">Super Admin</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                  Root Controller
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-grow">
          {activeTab === 'overview' && (
            <>
              {/* Dashboard KPIs statistics */}
              <StatsOverview
                totalGtv={totalGtv}
                escrowLocked={escrowLocked}
                activeVendors={activeVendors}
                payoutRequestsCount={pendingPayoutsCount}
              />

              {/* Main dashboard content grids */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                {/* Reports visual */}
                <div className="lg:col-span-4">
                  <ReportsPerformance />
                </div>

                {/* Audit Logs side list */}
                <div className="lg:col-span-2">
                  <div className="bg-card/50 border border-border backdrop-blur-md rounded-xl p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                          Administrative Audit Log
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="flex space-x-3 text-xs leading-snug">
                            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-indigo-500" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {log.msg}
                              </p>
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1 block">
                                {log.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'vendors' && (
            <VendorManagement
              vendors={vendors}
              onApproveVendor={handleApproveVendor}
              onRejectVendor={handleRejectVendor}
              onToggleVendorStatus={handleToggleVendorStatus}
              onOverrideCommission={handleOverrideCommission}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagement
              products={products}
              onApproveProduct={handleApproveProduct}
              onRejectProduct={handleRejectProduct}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement
              customers={customers}
              onToggleCustomerStatus={handleToggleCustomerStatus}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersLedger
              orders={orders}
              onApproveReturn={handleApproveReturn}
              onRejectReturn={handleRejectReturn}
              onMarkReturned={handleMarkReturned}
              onIssueRefund={handleAdminIssueRefund}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsLedger
              payouts={payouts}
              onApprovePayout={handleApprovePayout}
              onDeclinePayout={handleDeclinePayout}
              onPayPayout={handlePayPayout}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPerformance />
          )}

          {activeTab === 'settings' && (
            <PlatformSettings
              defaultCommissionRate={defaultCommissionRate}
              escrowDelayHours={escrowDelayHours}
              isMaintenanceMode={isMaintenanceMode}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionManagement
              subscriptions={vendorSubscriptions}
              onOverridePlan={handleOverridePlan}
              onCancelSubscription={handleCancelSubscription}
            />
          )}

          {activeTab === 'brand' && (
            <BrandKit />
          )}
        </main>
      </div>
    </div>
  );
}
