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

// ─── Admin Credentials (hardcoded) ───────────────────────────────────────────
const ADMIN_EMAIL = 'Almanar.edu.pk@gmail.com';
const ADMIN_PASSWORD = 'Pass@2025/-WebSite';
const ADMIN_NAME = 'Abu Saad';

export default function AdminDashboard() {
  // ── Auth state ─────────────────────────────────────────────────────────────
  // IMPORTANT: Always initialise to `false` so SSR and client render the same
  // HTML (login screen). After mount, useEffect reads sessionStorage and
  // switches to `true` if a valid session exists. This eliminates the
  // React hydration mismatch caused by typeof-window guards in useState.
  const [mounted, setMounted] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Sync session from sessionStorage after first client render
  React.useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('villex_admin_session') === '1') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    await new Promise((r) => setTimeout(r, 600));
    if (loginEmail.trim() === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem('villex_admin_session', '1');
      setIsLoggedIn(true);
    } else {
      setLoginError('Invalid email or password. Please try again.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('villex_admin_session');
    setIsLoggedIn(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  };

  // ── Dashboard state (all hooks must be declared unconditionally) ────────────
  const [activeTab, setActiveTab] = React.useState<string>('overview');
  const [isMobileOpen, setIsMobileOpen] = React.useState<boolean>(false);

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Suppress unused warnings for backward compatibility
    if (auditLogs.length > 0) {}
  }, [auditLogs]);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin notifications:', err);
    }
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

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
    fetchVendors();
    fetchOrders();
    fetchProducts();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchVendors, fetchOrders, fetchProducts, fetchNotifications]);



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
  const approvedVendorsCount = vendors.filter((v) => v.status === 'ACTIVE').length;
  const pendingPayoutsCount = payouts.filter((p) => p.status === 'PENDING').length;
  const pendingProductsCount = products.filter((p) => p.approvalStatus === 'PENDING').length;
  const approvedProductsCount = products.filter((p) => p.approvalStatus === 'APPROVED').length;
  const rejectedProductsCount = products.filter((p) => p.approvalStatus === 'REJECTED').length;
  const verificationRequestsCount = vendors.filter((v) => v.status === 'PENDING_APPROVAL').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

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
          verificationStatus: 'REJECTED',
          rejectionReason: reason
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

  const handleDeleteVendor = async (id: string) => {
    try {
      const response = await fetch(`/api/vendors?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setVendors((prev) => prev.filter((v) => v.id !== id));
        const newLog = {
          id: Date.now().toString(),
          msg: `Deleted store and associated resources for vendor ID: ${id}`,
          time: 'Just now',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      } else {
        alert(`Failed to delete vendor: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to delete vendor:', err);
      alert('Failed to delete vendor due to network/server exception.');
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

  // Before mount: render a minimal shell that matches the SSR output exactly.
  // This prevents a hydration mismatch because both server and client render
  // the same blank loader until useEffect runs and the session is verified.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
      </div>
    );
  }

  return (
    <>
      {/* ── Login Screen ──────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
          {/* Ambient background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          </div>
          <div className="relative w-full max-w-[420px]">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/buybabu-logo.png"
                  alt="Buy Babu"
                  className="h-10 w-auto object-contain select-none"
                />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Super Admin Portal</p>
            </div>
            {/* Card */}
            <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-2xl shadow-black/20">
              <div className="mb-6">
                <h1 className="text-xl font-black text-foreground">Sign In</h1>
                <p className="text-xs text-muted-foreground mt-1">Access the administrative control panel</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="admin-email" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </span>
                    <input
                      id="admin-email"
                      type="email"
                      required
                      autoComplete="username"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-11 bg-secondary/40 border border-input rounded-xl pl-10 pr-4 text-sm font-semibold placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-150"
                    />
                  </div>
                </div>
                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="admin-password" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-11 bg-secondary/40 border border-input rounded-xl pl-10 pr-12 text-sm font-semibold placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {/* Error */}
                {loginError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {loginError}
                  </div>
                )}
                {/* Submit */}
                <button
                  id="admin-login-btn"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25 mt-2"
                >
                  {isLoggingIn ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
              </form>
              <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Admin Access</span>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
              © 2026 Buy Babu Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      )}

      {/* ── Dashboard ─────────────────────────────────────────────────────── */}
      {isLoggedIn && (
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

            {/* Profile Info + Logout */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center font-bold text-sm text-primary-foreground shadow-md shadow-primary/10 select-none">
                  AS
                </div>
                <div className="hidden xl:block select-none">
                  <p className="text-xs font-black text-foreground">{ADMIN_NAME}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                    Super Admin
                  </p>
                </div>
              </div>
              <button
                id="admin-logout-btn"
                onClick={handleLogout}
                title="Sign Out"
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-150 text-[11px] font-black uppercase tracking-wider"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
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
                pendingVendorsCount={pendingVendorsCount}
                approvedVendorsCount={approvedVendorsCount}
                pendingProductsCount={pendingProductsCount}
                approvedProductsCount={approvedProductsCount}
                rejectedProductsCount={rejectedProductsCount}
                verificationRequestsCount={verificationRequestsCount}
                unreadNotificationsCount={unreadNotificationsCount}
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
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-muted-foreground font-semibold">No admin activity logs yet.</p>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div key={n.id} className="flex space-x-3 text-xs leading-snug">
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-indigo-500/40' : 'bg-amber-500 animate-pulse'}`} />
                              <div className="flex-grow">
                                <p className="text-xs font-semibold text-foreground">
                                  {n.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1 select-none">
                                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider block">
                                    {formatTimeAgo(n.created_at)}
                                  </span>
                                  {!n.is_read && (
                                    <button
                                      onClick={async () => {
                                        await fetch('/api/notifications', {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ id: n.id })
                                        });
                                        fetchNotifications();
                                      }}
                                      className="text-[9px] text-primary hover:underline font-bold uppercase tracking-wider"
                                    >
                                      Dismiss
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
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
              onDeleteVendor={handleDeleteVendor}
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
      )}
    </>
  );
}
