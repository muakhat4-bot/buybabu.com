'use client';

import * as React from 'react';
import { SidebarNav } from '../features/dashboard/components/sidebar-nav';
import { StatsGrid } from '../features/dashboard/components/stats-grid';
import { RevenueChart } from '../features/dashboard/components/revenue-chart';
import { OrdersTable, Order } from '../features/dashboard/components/orders-table';
import { InventoryList, Product } from '../features/dashboard/components/inventory-list';
import { AlertCenter, AlertNotification } from '../features/dashboard/components/alert-center';
import { ProductForm, ProductFormData } from '../features/dashboard/components/product-form';
import { ShippingDialog } from '../features/dashboard/components/shipping-dialog';
import { VerificationHub, VerificationDocs } from '../features/dashboard/components/verification-hub';
import { SubscriptionPlans, PlanTier, BillingCycle } from '../features/dashboard/components/subscription-plans';
import { Button, Card, Input, Logo } from '@villex/ui';
import { useAuth } from '../context/vendor-auth-context';
import { WalletPanel, WalletData } from '../features/dashboard/components/wallet-panel';
import { MediaPanel } from '../features/dashboard/components/media-panel';

interface RegisteredVendor {
  email: string;
  password?: string;
  storeName: string;
  storeId?: string;
  firstName: string;
  lastName: string;
}


const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: '#VLX-ORD-5192',
    customerName: 'Sarah Khan',
    customerPhone: '0321-9876543',
    shippingAddress: 'House 14A, Street 3, F-8/2, Islamabad',
    date: '2026-06-14',
    total: 15500,
    paymentMethod: 'Card',
    status: 'PROCESSING',
    itemsCount: 1,
    items: [{ name: 'ElectroPulse SoundBlast Wireless Speaker', qty: 1, price: 15500 }],
  },
  {
    id: '#VLX-ORD-5193',
    customerName: 'Muhammad Ahmed',
    customerPhone: '0333-8765432',
    shippingAddress: 'Apartment 4B, Askari 11, Lahore',
    date: '2026-06-13',
    total: 9600,
    paymentMethod: 'COD',
    status: 'SHIPPED',
    itemsCount: 2,
    items: [{ name: 'VoltCharge 100W GaN Fast Charger', qty: 2, price: 4800 }],
    carrier: 'Leopards Express',
    trackingNumber: 'VLX-TRK-983021820',
  },
  {
    id: '#VLX-ORD-5194',
    customerName: 'Zainab Bibi',
    customerPhone: '0300-7654321',
    shippingAddress: 'Plot 182, Block 3, PECHS, Karachi',
    date: '2026-06-12',
    total: 12500,
    paymentMethod: 'Card',
    status: 'PROCESSING',
    itemsCount: 1,
    items: [{ name: 'ApexPro Wired Mechanical Keyboard', qty: 1, price: 12500 }],
  },
  {
    id: '#VLX-ORD-5195',
    customerName: 'Bilal Mustafa',
    customerPhone: '0312-3456789',
    shippingAddress: 'House 55, Sector D, Askari 14, Rawalpindi',
    date: '2026-06-11',
    total: 6500,
    paymentMethod: 'COD',
    status: 'CANCELLED',
    itemsCount: 1,
    items: [{ name: 'NebulaRGB Gaming Mouse', qty: 1, price: 6500 }],
  },
  {
    id: '#VLX-ORD-5196',
    customerName: 'Ayesha Malik',
    customerPhone: '0345-1234567',
    shippingAddress: 'House 19, Phase 5, DHA, Lahore',
    date: '2026-06-10',
    total: 21300,
    paymentMethod: 'Card',
    status: 'DELIVERED',
    itemsCount: 3,
    items: [
      { name: 'VoltCharge 100W GaN Fast Charger', qty: 1, price: 4800 },
      { name: 'Lumina Desk LED Smart Lamp', qty: 1, price: 8900 },
      { name: 'NebulaRGB Gaming Mouse', qty: 1, price: 6500 }
    ],
    carrier: 'TCS Courier',
    trackingNumber: 'VLX-TRK-108291023',
  },
  {
    id: '#VLX-ORD-5197',
    customerName: 'Hamza Yusuf',
    customerPhone: '0322-1122334',
    shippingAddress: 'House 90, Street 12, Sector I-8/4, Islamabad',
    date: '2026-06-09',
    total: 8900,
    paymentMethod: 'Card',
    status: 'RETURN_REQUESTED',
    itemsCount: 1,
    items: [{ name: 'Lumina Desk LED Smart Lamp', qty: 1, price: 8900 }],
    returnReason: 'Smart lamp connectivity keeps dropping out and light flickers frequently.',
  },
];

const INITIAL_MOCK_NOTIFICATIONS: AlertNotification[] = [
  {
    id: 'n1',
    type: 'INVENTORY',
    severity: 'WARNING',
    message: 'Stock critical: ApexPro Wired Mechanical Keyboard is out of stock!',
    timestamp: '10 minutes ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'ORDER',
    severity: 'INFO',
    message: 'New order #VLX-ORD-5192 received from Sarah Khan',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'INVENTORY',
    severity: 'WARNING',
    message: 'Stock low: ElectroPulse SoundBlast Wireless Speaker has only 8 units left',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'n4',
    type: 'SYSTEM',
    severity: 'SUCCESS',
    message: 'Payout of PKR 450,000 processed to your bank account',
    timestamp: '1 day ago',
    read: true,
  },
];

export default function Home() {
  const { isLoggedIn: authIsLoggedIn, user: authUser, store: authStore, login: authLogin, logout: authLogout, isLoading: authIsLoading } = useAuth();

  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [loginError, setLoginError] = React.useState<string>('');
  const [rememberMe, setRememberMe] = React.useState<boolean>(false);

  const [activeTab, setActiveTab] = React.useState<string>('overview');
  const [isStoreOnline, setIsStoreOnline] = React.useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = React.useState<boolean>(false);

  const isDemoUser = authStore ? authStore.id === '#VLX-MER-089' : true;
  const storeName = authStore ? authStore.storeName : 'ElectroPulse Store';
  const storeId = authStore ? authStore.id : '#VLX-MER-089';
  const ownerName = authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Ehsan Paracha';
  const vendorEmail = authUser ? authUser.email : '';
  const vendorRole = authUser ? authUser.role : 'Store Manager';

  // Sub-view routing inside the Inventory tab
  const [inventorySubView, setInventorySubView] = React.useState<'list' | 'create' | 'edit'>('list');
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);

  // shipping modal trigger state
  const [shippingOrderId, setShippingOrderId] = React.useState<string | null>(null);
  const [refundedAmount, setRefundedAmount] = React.useState<number>(0);

  // Onboarding verification states
  const [verificationStatus, setVerificationStatus] = React.useState<'NOT_SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('NOT_SUBMITTED');
  const [rejectionReason, setRejectionReason] = React.useState<string>('');

  // Subscription & Billing state
  const [currentPlan, setCurrentPlan] = React.useState<PlanTier>('PREMIUM');
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('MONTHLY');

  // Stateful lists derived on auth state loading
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [notifications, setNotifications] = React.useState<AlertNotification[]>([]);
  const [simulatedNotifications, setSimulatedNotifications] = React.useState<Array<{ id: string; type: 'SMS' | 'EMAIL'; title: string; body: string }>>([]);
  const prevOrdersRef = React.useRef<Order[]>([]);

  // Wallet States & Fetchers
  const [wallet, setWallet] = React.useState<WalletData | undefined>(undefined);
  const [bankName, setBankName] = React.useState<string>('Habib Bank Limited (HBL)');
  const [bankAccountTitle, setBankAccountTitle] = React.useState<string>('ElectroPulse Store Official');
  const [bankAccountNumber, setBankAccountNumber] = React.useState<string>('HBL-0091820192801');

  const fetchWallet = React.useCallback(async () => {
    if (!authUser?.email) return;
    try {
      const response = await fetch('/api/vendors');
      if (response.ok) {
        const data = await response.json();
        const matched = data.find((v: any) => v.email.toLowerCase() === authUser.email.toLowerCase());
        if (matched) {
          if (matched.wallet) setWallet(matched.wallet);
          if (matched.bankName) setBankName(matched.bankName);
          if (matched.bankAccountTitle) setBankAccountTitle(matched.bankAccountTitle);
          if (matched.bankAccountNumber) setBankAccountNumber(matched.bankAccountNumber);
        }
      }
    } catch (err) {
      console.error('Failed to fetch wallet details:', err);
    }
  }, [authUser?.email]);

  const fetchProducts = React.useCallback(async () => {
    if (!authStore?.id) return;
    try {
      const response = await fetch(`/api/products?storeId=${encodeURIComponent(authStore.id)}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch vendor products:', err);
    }
  }, [authStore?.id]);

  const fetchOrders = React.useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map((o: any) => ({
          id: o.id,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          shippingAddress: o.shippingAddress,
          date: o.date,
          total: o.total,
          paymentMethod: o.paymentMethod,
          status: o.status,
          itemsCount: o.itemsCount,
          items: o.items,
          walletPhone: o.walletPhone,
          walletTid: o.walletTid,
          carrier: o.carrier,
          trackingNumber: o.trackingNumber,
          returnReason: o.returnReason,
        }));
        
        setOrders([...formatted, ...INITIAL_MOCK_ORDERS]);

        // Generate automatic warning alerts for PENDING orders
        const pendingOrders = formatted.filter((o: any) => o.status === 'PENDING');
        if (pendingOrders.length > 0) {
          const newAlerts = pendingOrders.map((o: any) => ({
            id: `alert-pending-${o.id}`,
            type: 'ORDER' as const,
            severity: 'WARNING' as const,
            message: `Awaiting payment validation for order ${o.id} via ${o.paymentMethod}`,
            timestamp: 'Just now',
            read: false,
          }));
          setNotifications(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const filteredNew = newAlerts.filter((a: AlertNotification) => !existingIds.has(a.id));
            return [...filteredNew, ...prev];
          });
        }
      } else {
        setOrders(INITIAL_MOCK_ORDERS);
      }
    } catch (err) {
      console.error('Failed to fetch vendor orders:', err);
      setOrders(INITIAL_MOCK_ORDERS);
    }
  }, []);

  React.useEffect(() => {
    if (authIsLoggedIn && authStore) {
      fetchProducts();
      fetchOrders();
      fetchWallet();
      if (!isDemoUser) {
        setNotifications([
          {
            id: 'welcome',
            type: 'SYSTEM',
            severity: 'SUCCESS',
            message: `Welcome to Villex, ${authUser?.firstName}! Your store '${authStore?.storeName}' is registered successfully.`,
            timestamp: 'Just now',
            read: false,
          }
        ]);
      } else {
        setNotifications(INITIAL_MOCK_NOTIFICATIONS);
      }
    } else {
      setProducts([]);
      setOrders([]);
      setWallet(undefined);
      setNotifications([]);
    }
  }, [authIsLoggedIn, isDemoUser, authUser?.firstName, authStore, fetchProducts, fetchOrders, fetchWallet]);

  React.useEffect(() => {
    if (authIsLoggedIn && authStore) {
      if (authStore.status === 'PENDING') {
        setVerificationStatus('UNDER_REVIEW');
      } else if (authStore.status === 'ACTIVE') {
        setVerificationStatus('APPROVED');
      } else if (authStore.status === 'REJECTED') {
        setVerificationStatus('REJECTED');
      } else {
        setVerificationStatus('NOT_SUBMITTED');
      }
    } else {
      setVerificationStatus('NOT_SUBMITTED');
    }
  }, [authIsLoggedIn, authStore]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const signupSuccess = params.get('signup_success');
      const emailParam = params.get('email');

      if (signupSuccess === 'true' && emailParam) {
        const passwordParam = params.get('password') || '';
        const storeNameParam = params.get('storeName') || '';
        const firstNameParam = params.get('firstName') || '';
        const lastNameParam = params.get('lastName') || '';

        let list: RegisteredVendor[] = [];
        const stored = localStorage.getItem('villex_registered_vendors');
        if (stored) {
          try {
            list = JSON.parse(stored);
          } catch {
            list = [];
          }
        }

        // Avoid duplicates
        const exists = list.some((v) => v.email.toLowerCase() === emailParam.toLowerCase());
        if (!exists) {
          const generatedStoreId = `#VLX-MER-${Math.floor(100 + Math.random() * 900)}`;
          list.push({
            email: emailParam,
            password: passwordParam,
            storeName: storeNameParam,
            storeId: generatedStoreId,
            firstName: firstNameParam,
            lastName: lastNameParam,
          });
          localStorage.setItem('villex_registered_vendors', JSON.stringify(list));
        }

        // Clean URL to only keep email for autofill
        const newUrl = `${window.location.origin}${window.location.pathname}?email=${encodeURIComponent(emailParam)}`;
        window.history.replaceState({}, document.title, newUrl);
        setEmail(emailParam);
        setPassword(passwordParam);
      } else if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  // Dynamic state calculations
  const baseRevenue = isDemoUser ? 1205000 : 0;
  const totalRevenue = baseRevenue + orders
    .filter((o) => ['SHIPPED', 'DELIVERED', 'RETURNED', 'REFUNDED'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0) - refundedAmount;

  const totalOrders = (isDemoUser ? 1830 : 0) + orders.filter((o) => o.status !== 'CANCELLED').length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const conversionRate = isDemoUser ? 3.42 : 0.0;

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Callback to toggle Store status
  const handleToggleStoreStatus = () => {
    const nextStatus = !isStoreOnline;
    setIsStoreOnline(nextStatus);

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'SYSTEM',
      severity: nextStatus ? 'SUCCESS' : 'WARNING',
      message: `Store status changed to ${nextStatus ? 'ONLINE' : 'OFFLINE'}.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    extraFields?: { carrier?: string; trackingNumber?: string }
  ) => {
    if (orderId.startsWith('VLX-')) {
      try {
        const response = await fetch('/api/orders', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: orderId,
            status,
            ...extraFields,
          }),
        });

        if (response.ok) {
          fetchOrders();
          fetchWallet();
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
            ? { ...o, status, ...(extraFields || {}) }
            : o
        )
      );
      return true;
    }
  };

  // Callback to process fulfillment packing slip
  const handleProcessFulfillment = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'READY_TO_SHIP');
    if (!ok) return;

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'ORDER',
      severity: 'SUCCESS',
      message: `Packing slip printed. Order ${orderId} is packed and ready for dispatch.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  // Callback to dispatch shipment
  const handleConfirmShipping = async (carrier: string, trackingNumber: string) => {
    if (!shippingOrderId) return;

    const ok = await updateOrderStatus(shippingOrderId, 'SHIPPED', { carrier, trackingNumber });
    if (!ok) return;

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'ORDER',
      severity: 'SUCCESS',
      message: `Order ${shippingOrderId} has been shipped via ${carrier} with Tracking ID ${trackingNumber}.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
    setShippingOrderId(null);
  };

  // Callback to approve return
  const handleApproveReturn = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'RETURN_APPROVED');
    if (!ok) return;

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'ORDER',
      severity: 'SUCCESS',
      message: `Return request for order ${orderId} has been Approved. Awaiting courier pickup.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  // Callback to mark returned order as picked up
  const handleMarkAsPickedUp = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'RETURNED');
    if (!ok) return;

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'ORDER',
      severity: 'SUCCESS',
      message: `Return item for order ${orderId} marked as Picked Up. Ready for refund.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  // Callback to reject return
  const handleRejectReturn = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'DELIVERED');
    if (!ok) return;

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'ORDER',
      severity: 'WARNING',
      message: `Return request for order ${orderId} has been Declined. Item returned to customer delivery log.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  // Callback to issue refund
  const handleIssueRefund = async (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const ok = await updateOrderStatus(orderId, 'REFUNDED');
    if (!ok) return;

    setRefundedAmount((prev) => prev + target.total);

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'ORDER',
      severity: 'WARNING',
      message: `Refund of PKR ${target.total.toLocaleString()} processed for order ${orderId}. Funds deducted from revenue balance.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  // Callback to confirm payment of wallet order
  const handleConfirmPayment = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'PROCESSING');
    if (!ok) return;

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'ORDER',
      severity: 'SUCCESS',
      message: `Mobile wallet payment verified. Order ${orderId} status set to Processing.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  const triggerSimulatedNotification = React.useCallback((type: 'SMS' | 'EMAIL', title: string, body: string) => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    setSimulatedNotifications((prev) => [...prev, { id, type, title, body }]);
    setTimeout(() => {
      setSimulatedNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 8500);
  }, []);

  React.useEffect(() => {
    if (orders.length === 0) return;
    const prevOrders = prevOrdersRef.current;
    
    if (prevOrders.length === 0) {
      prevOrdersRef.current = orders;
      return;
    }

    orders.forEach((currentOrder) => {
      const prevOrder = prevOrders.find((o) => o.id === currentOrder.id);
      
      if (!prevOrder) {
        // New order placed!
        const alertId = `alert-new-${currentOrder.id}`;
        setNotifications(prev => {
          if (prev.some(n => n.id === alertId)) return prev;
          return [{
            id: alertId,
            type: 'ORDER' as const,
            severity: 'INFO' as const,
            message: `New Order ${currentOrder.id} received from ${currentOrder.customerName}.`,
            timestamp: 'Just now',
            read: false,
          }, ...prev];
        });

        triggerSimulatedNotification(
          'SMS',
          '📱 SMS to Seller',
          `New order ${currentOrder.id} placed by ${currentOrder.customerName}! Total: PKR ${currentOrder.total.toLocaleString()}. Payment: ${currentOrder.paymentMethod}.`
        );
        triggerSimulatedNotification(
          'EMAIL',
          '✉️ Email to Seller',
          `New order placement receipt for ${currentOrder.id} generated and sent to merchant store account.`
        );
      } else if (prevOrder.status !== currentOrder.status && currentOrder.status === 'DELIVERED') {
        // Order delivered!
        const alertId = `alert-delivered-${currentOrder.id}`;
        setNotifications(prev => {
          if (prev.some(n => n.id === alertId)) return prev;
          return [{
            id: alertId,
            type: 'ORDER' as const,
            severity: 'SUCCESS' as const,
            message: `Order ${currentOrder.id} has been delivered successfully.`,
            timestamp: 'Just now',
            read: false,
          }, ...prev];
        });

        triggerSimulatedNotification(
          'SMS',
          '📱 SMS to Seller',
          `Delivery confirmed! Order ${currentOrder.id} has been delivered to ${currentOrder.customerName}. Escrow release initiated.`
        );
        triggerSimulatedNotification(
          'EMAIL',
          '✉️ Email to Seller',
          `Delivery confirmation invoice for ${currentOrder.id} dispatched to store manager email.`
        );
      }
    });

    prevOrdersRef.current = orders;
  }, [orders, triggerSimulatedNotification]);

  const handleMarkAsDelivered = async (orderId: string) => {
    const ok = await updateOrderStatus(orderId, 'DELIVERED');
    if (!ok) return;

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'ORDER',
      severity: 'SUCCESS',
      message: `Order ${orderId} marked as Delivered. Escrow funds scheduling release.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  // Callback to submit verification docs
  const handleSubmitVerification = (docs: VerificationDocs) => {
    setVerificationStatus('UNDER_REVIEW');

    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'SYSTEM',
      severity: 'INFO',
      message: 'Onboarding audit documents submitted successfully. Auditing risk profile.',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);

    // Simulate approval or rejection after a small timeout to make testing interactive!
    setTimeout(() => {
      if (docs.type === 'VALID') {
        setVerificationStatus('APPROVED');
        const successAlert: AlertNotification = {
          id: (Date.now() + 1).toString(),
          type: 'SYSTEM',
          severity: 'SUCCESS',
          message: 'Merchant verification complete. Escrow payouts activated.',
          timestamp: 'Just now',
          read: false,
        };
        setNotifications((prev) => [successAlert, ...prev]);
      } else {
        setVerificationStatus('REJECTED');
        setRejectionReason('Mismatched identity name fields between voided check and CNIC card.');
        const failedAlert: AlertNotification = {
          id: (Date.now() + 1).toString(),
          type: 'SYSTEM',
          severity: 'WARNING',
          message: 'Merchant verification failed: Mismatched bank details.',
          timestamp: 'Just now',
          read: false,
        };
        setNotifications((prev) => [failedAlert, ...prev]);
      }
    }, 4000);
  };

  const handleResetVerification = () => {
    setVerificationStatus('NOT_SUBMITTED');
    setRejectionReason('');
  };

  // Subscription handlers
  const handleUpgradePlan = (plan: PlanTier, cycle: BillingCycle) => {
    setCurrentPlan(plan);
    setBillingCycle(cycle);
    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'SYSTEM',
      severity: 'SUCCESS',
      message: `Subscription upgraded to ${plan} plan (${cycle}). New commission rates are now active.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  const handleDowngradePlan = (plan: PlanTier) => {
    setCurrentPlan(plan);
    const newAlert: AlertNotification = {
      id: Date.now().toString(),
      type: 'SYSTEM',
      severity: 'WARNING',
      message: `Subscription downgraded to ${plan} plan. Some features may be restricted.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newAlert, ...prev]);
  };

  // Callback to restock inventory simple ledger adjustment
  const handleRestockProduct = (productId: string, amount: number) => {
    let productDetails: Product | undefined;
    let nextStock = amount;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          productDetails = p;
          const currentStock = typeof p.stock === 'number' && !isNaN(p.stock) ? p.stock : 0;
          nextStock = currentStock + amount;
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );

    if (productDetails) {
      const newAlert: AlertNotification = {
        id: Date.now().toString(),
        type: 'INVENTORY',
        severity: 'SUCCESS',
        message: `Restocked ${amount} units for "${productDetails.name}". New Stock: ${nextStock}.`,
        timestamp: 'Just now',
        read: false,
      };
      setNotifications((prev) => [newAlert, ...prev]);
    }
  };

  // Callback to delete a product
  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const productDetails = products.find(p => p.id === productId);
        const name = productDetails ? productDetails.name : 'Product';

        // Refresh products list
        await fetchProducts();

        const newAlert: AlertNotification = {
          id: Date.now().toString(),
          type: 'INVENTORY',
          severity: 'WARNING',
          message: `Product "${name}" has been deleted from your store.`,
          timestamp: 'Just now',
          read: false,
        };
        setNotifications((prev) => [newAlert, ...prev]);
      } else {
        console.error('Failed to delete product via API');
      }
    } catch (err) {
      console.error('Network error deleting product:', err);
    }
  };

  // Save or update product inside form view
  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          storeId: storeId || '#VLX-MER-089',
          storeName: storeName || 'ElectroPulse Store',
        }),
      });

      if (response.ok) {
        await fetchProducts();

        const isEdit = !!formData.id;
        const newAlert: AlertNotification = {
          id: Date.now().toString(),
          type: 'INVENTORY',
          severity: 'SUCCESS',
          message: isEdit
            ? `Product "${formData.name}" has been successfully updated.`
            : `New product "${formData.name}" has been published to the marketplace.`,
          timestamp: 'Just now',
          read: false,
        };
        setNotifications((prev) => [newAlert, ...prev]);
      } else {
        console.error('Failed to save product via API');
      }
    } catch (err) {
      console.error('Network error saving product:', err);
    }

    setInventorySubView('list');
    setEditingProductId(null);
  };

  // Callback to mark alert as read
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Callback to clear notifications
  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSignOut = () => {
    authLogout();
    if (typeof window !== 'undefined') {
      window.location.href = `?email=${encodeURIComponent(email)}`;
    }
  };

  if (authIsLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] text-[#111827] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verifying Session...</span>
        </div>
      </div>
    );
  }

  if (!authIsLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] text-[#111827] flex items-center justify-center py-12 px-4 relative overflow-hidden font-sans">
        {/* Glow effects */}
        <div className="absolute inset-0 bg-[#1E40AF]/5 rounded-full filter blur-3xl opacity-30 w-96 h-96 -top-20 -left-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[#10B981]/5 rounded-full filter blur-3xl opacity-30 w-96 h-96 -bottom-20 -right-20 pointer-events-none"></div>

        <Card className="w-full max-w-md bg-card border-border shadow-2xl relative z-10 p-8 rounded-2xl flex flex-col space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Logo size="lg" className="mb-4" />
            <h1 className="text-2xl font-black uppercase tracking-wider text-foreground">
              Merchant Login
            </h1>
            <p className="text-xs text-muted-foreground">
              Access your Villex store dashboard, inventory, and orders.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!email || !password) {
                setLoginError('Email and password are required.');
                return;
              }

              const success = await authLogin(email, password);
              if (!success) {
                setLoginError('Invalid credentials. (Use your registered vendor account or "contact@electropulse.pk")');
              }
            }}
            className="space-y-4"
          >
            {loginError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3 rounded-lg text-center animate-fade-in">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="merchant@villex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <a href="#" className="text-[10px] font-semibold text-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border bg-secondary/35 text-primary focus:ring-primary h-4 w-4 animate-none"
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                Remember my store session
              </label>
            </div>

            <Button type="submit" variant="primary" className="w-full h-11 font-semibold mt-4">
              Sign In
            </Button>
          </form>

          <div className="border-t border-border/60 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              New to Villex?{' '}
              <a
                href="http://localhost:3000/vendor-signup"
                className="font-bold text-primary hover:underline"
              >
                Register your store
              </a>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - desktop sticky */}
      <aside className="w-[260px] border-r border-border bg-card/25 px-4 py-6 shrink-0 hidden md:block">
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setInventorySubView('list'); // reset internal inventory panels
            setEditingProductId(null);
          }}
          notificationsCount={unreadNotificationsCount}
          onSignOut={handleSignOut}
          storeName={storeName}
          storeId={storeId}
          vendorEmail={vendorEmail}
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
            <SidebarNav
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setInventorySubView('list');
                setEditingProductId(null);
                setIsMobileOpen(false);
              }}
              notificationsCount={unreadNotificationsCount}
              onSignOut={handleSignOut}
              storeName={storeName}
              storeId={storeId}
              vendorEmail={vendorEmail}
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
              className="md:hidden p-2 text-muted-foreground hover:text-foreground bg-secondary/30 border border-border/60 rounded-xl"
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
                placeholder="Global portal search..."
                className="w-64 h-10 bg-secondary/30 border border-input rounded-xl pl-9 pr-4 text-xs font-semibold placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-150"
              />
            </div>
          </div>

          {/* Right: Actions, Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Store Status Toggle */}
            <div className="flex items-center space-x-2 bg-secondary/30 px-3.5 py-1.5 rounded-xl border border-border/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground hidden lg:inline">
                Store Status:
              </span>
              <button
                onClick={handleToggleStoreStatus}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isStoreOnline ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'
                  } transition-colors duration-300`}
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground">
                  {isStoreOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </button>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => {
                setActiveTab('notifications');
                setInventorySubView('list');
                setEditingProductId(null);
              }}
              className="relative p-2 bg-secondary/30 border border-border/80 hover:bg-secondary/50 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-ping" />
              )}
            </button>

            {/* Divider */}
            <span className="h-6 w-px bg-border hidden sm:block" />

            {/* Profile Info */}
            <div className="flex items-center space-x-2.5">
              {authUser?.avatarUrl ? (
                <img src={authUser.avatarUrl} alt={ownerName} className="w-9 h-9 rounded-xl object-cover shadow-md shadow-primary/10" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center font-bold text-sm text-primary-foreground shadow-md shadow-primary/10 select-none">
                  {ownerName ? ownerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'EP'}
                </div>
              )}
              <div className="hidden sm:block select-none text-left">
                <p className="text-xs font-black text-foreground">
                  {ownerName || 'Villex Admin'}{' '}
                  <span className="text-[10px] text-primary font-bold lowercase">
                    ({vendorRole.toLowerCase()})
                  </span>
                </p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                  {storeName}
                </p>
              </div>
              {/* Quick Sign Out icon in top header */}
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 rounded-xl text-destructive transition-all duration-200 ml-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-grow">
          {/* Tab Views rendering */}
          {activeTab === 'overview' && (
            <>
              {/* Top overview stats grid */}
              <StatsGrid
                totalRevenue={totalRevenue}
                totalOrders={totalOrders}
                averageOrderValue={averageOrderValue}
                conversionRate={conversionRate}
              />

              {/* Main dashboard content grids */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                {/* Sales Chart */}
                <div className="lg:col-span-4">
                  <RevenueChart totalRevenue={totalRevenue} isDemoUser={isDemoUser} storeName={storeName} />
                </div>

                {/* Notifications Panel side list */}
                <div className="lg:col-span-2">
                  <div className="bg-card/50 border border-border backdrop-blur-md rounded-xl p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                          Latest System Alerts
                        </h3>
                        <button
                          onClick={() => {
                            setActiveTab('notifications');
                            setInventorySubView('list');
                            setEditingProductId(null);
                          }}
                          className="text-[9px] font-black uppercase text-primary hover:text-primary/80 tracking-wider transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="space-y-4">
                        {notifications.slice(0, 3).map((notif) => (
                          <div key={notif.id} className="flex space-x-3 text-xs leading-snug">
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                notif.severity === 'WARNING'
                                  ? 'bg-amber-500'
                                  : notif.severity === 'SUCCESS'
                                    ? 'bg-emerald-500'
                                    : 'bg-primary'
                              }`}
                            />
                            <div>
                              <p
                                className={`text-xs ${
                                  !notif.read ? 'font-bold text-foreground' : 'text-muted-foreground'
                                }`}
                              >
                                {notif.message}
                              </p>
                              <span className="text-[9px] text-muted-foreground font-semibold mt-1 block">
                                {notif.timestamp}
                              </span>
                            </div>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <p className="text-xs text-muted-foreground font-semibold text-center py-6">
                            No active alerts.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="lg:col-span-6">
                  <OrdersTable
                    orders={orders.slice(0, 4)}
                    onProcessFulfillment={handleProcessFulfillment}
                    onOpenShippingModal={(id) => setShippingOrderId(id)}
                    onApproveReturn={handleApproveReturn}
                    onRejectReturn={handleRejectReturn}
                    onIssueRefund={handleIssueRefund}
                    onConfirmPayment={handleConfirmPayment}
                    onMarkAsDelivered={handleMarkAsDelivered}
                    onMarkAsPickedUp={handleMarkAsPickedUp}
                    isCompact={true}
                    storeName={storeName}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-black uppercase tracking-wider text-primary hover:text-primary/80 inline-flex items-center space-x-1 transition-colors"
                    >
                      <span>Go to Order Manager</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <OrdersTable
              orders={orders}
              onProcessFulfillment={handleProcessFulfillment}
              onOpenShippingModal={(id) => setShippingOrderId(id)}
              onApproveReturn={handleApproveReturn}
              onRejectReturn={handleRejectReturn}
              onIssueRefund={handleIssueRefund}
              onConfirmPayment={handleConfirmPayment}
              onMarkAsDelivered={handleMarkAsDelivered}
              onMarkAsPickedUp={handleMarkAsPickedUp}
              storeName={storeName}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletPanel
              wallet={wallet}
              vendorEmail={vendorEmail}
              bankName={bankName}
              bankAccountTitle={bankAccountTitle}
              bankAccountNumber={bankAccountNumber}
              onRefreshWallet={fetchWallet}
            />
          )}

          {activeTab === 'inventory' && (
            <>
              {inventorySubView === 'list' && (
                <InventoryList
                  products={products}
                  onRestock={handleRestockProduct}
                  onAddProduct={() => {
                    setInventorySubView('create');
                    setEditingProductId(null);
                  }}
                  onEditProduct={(id) => {
                    setEditingProductId(id);
                    setInventorySubView('edit');
                  }}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {(inventorySubView === 'create' || inventorySubView === 'edit') && (
                <ProductForm
                  initialData={
                    inventorySubView === 'edit'
                      ? (products.find((p) => p.id === editingProductId) as unknown as ProductFormData)
                      : undefined
                  }
                  onSave={handleSaveProduct}
                  onCancel={() => {
                    setInventorySubView('list');
                    setEditingProductId(null);
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'verification' && (
            <VerificationHub
              status={verificationStatus}
              rejectionReason={rejectionReason}
              onSubmit={handleSubmitVerification}
              onReset={handleResetVerification}
              storeName={storeName}
              ownerName={ownerName}
              email={email}
            />
          )}

          {activeTab === 'subscription' && (
            <SubscriptionPlans
              currentPlan={currentPlan}
              billingCycle={billingCycle}
              onUpgrade={handleUpgradePlan}
              onDowngrade={handleDowngradePlan}
            />
          )}

          {activeTab === 'media' && (
            <MediaPanel />
          )}

          {activeTab === 'notifications' && (
            <AlertCenter
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearAllNotifications}
            />
          )}
        </main>
      </div>

      {/* Shipping Dialog Overlay */}
      {shippingOrderId && (
        <ShippingDialog
          orderId={shippingOrderId}
          onConfirm={handleConfirmShipping}
          onClose={() => setShippingOrderId(null)}
        />
      )}

      {/* Floating Simulated Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {simulatedNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start space-x-3.5 transition-all duration-300 animate-slide-up bg-card/95 backdrop-blur-md ${
              notif.type === 'SMS'
                ? 'border-amber-500/30 ring-1 ring-amber-500/10'
                : 'border-blue-500/30 ring-1 ring-blue-500/10'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              notif.type === 'SMS' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {notif.type === 'SMS' ? '📱' : '✉️'}
            </div>
            <div className="flex-grow min-w-0">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-foreground">
                {notif.title}
              </h5>
              <p className="text-xs font-semibold text-muted-foreground mt-1 leading-normal">
                {notif.body}
              </p>
              <span className="text-[8px] font-black uppercase tracking-wider text-primary mt-1.5 block">
                Simulated Transmission Verified ✓
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
