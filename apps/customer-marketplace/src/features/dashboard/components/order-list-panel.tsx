'use client';

import * as React from 'react';
import { Button, Card, Logo } from '@villex/ui';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  qty: number;
  price: number;
  spec?: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURNED' | 'REFUNDED' | 'CANCELLED';
  items: OrderItem[];
  trackingSteps: { name: string; date?: string; done: boolean }[];
  estimatedDelivery?: string;
  paymentMethod?: string;
  walletPhone?: string;
  walletTid?: string;
  returnReason?: string;
  returnComment?: string;
}

const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'VLX-0089201',
    date: 'June 14, 2026',
    total: 81400,
    status: 'PROCESSING',
    items: [
      {
        id: 'item-1',
        name: 'Sony WH-1000XM5 ANC Headset',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
        qty: 1,
        price: 68900,
        spec: 'Silver / Noise Cancelling',
      },
      {
        id: 'item-2',
        name: 'Mechanical Backlit Keyboard G-PRO',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80',
        qty: 1,
        price: 12500,
        spec: 'Blue Switches / RGB',
      },
    ],
    trackingSteps: [
      { name: 'Ordered', date: 'June 14, 2:32 PM', done: true },
      { name: 'Processing', date: 'June 14, 5:10 PM', done: true },
      { name: 'Shipped', done: false },
      { name: 'Delivered', done: false },
    ],
    estimatedDelivery: 'June 16, 2026',
  },
  {
    id: 'VLX-0088195',
    date: 'June 02, 2026',
    total: 14500,
    status: 'DELIVERED',
    items: [
      {
        id: 'item-3',
        name: 'Villex Custom Sneakers Red-Pro',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80',
        qty: 1,
        price: 14500,
        spec: 'Red / Size 42',
      },
    ],
    trackingSteps: [
      { name: 'Ordered', date: 'June 02, 9:00 AM', done: true },
      { name: 'Processing', date: 'June 02, 11:30 AM', done: true },
      { name: 'Shipped', date: 'June 03, 10:15 AM', done: true },
      { name: 'Delivered', date: 'June 04, 3:45 PM', done: true },
    ],
    estimatedDelivery: 'Delivered June 04, 2026',
  },
  {
    id: 'VLX-0087112',
    date: 'May 20, 2026',
    total: 8900,
    status: 'CANCELLED',
    items: [
      {
        id: 'item-4',
        name: 'Ultralight Ergo Wireless Gaming Mouse',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=80',
        qty: 1,
        price: 8900,
        spec: 'Matte White',
      },
    ],
    trackingSteps: [
      { name: 'Ordered', date: 'May 20, 1:15 PM', done: true },
      { name: 'Cancelled', date: 'May 20, 2:40 PM', done: true },
    ],
  },
];

export function OrderListPanel() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [activeInvoice, setActiveInvoice] = React.useState<Order | null>(null);
  
  const [returnOrder, setReturnOrder] = React.useState<Order | null>(null);
  const [returnReason, setReturnReason] = React.useState<'Wrong Product' | 'Damaged Product' | 'Fake Product' | 'Size Issue'>('Wrong Product');
  const [returnComment, setReturnComment] = React.useState('');
  const [submittingReturn, setSubmittingReturn] = React.useState(false);

  // Reviews states
  const [reviewItem, setReviewItem] = React.useState<{ orderId: string; productId: string; name: string; image: string } | null>(null);
  const [reviewRating, setReviewRating] = React.useState<number>(5);
  const [reviewComment, setReviewComment] = React.useState<string>('');
  const [reviewPhotos, setReviewPhotos] = React.useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = React.useState<boolean>(false);
  const [reviewedKeys, setReviewedKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('reviewed_')) {
        keys.push(key);
      }
    }
    setReviewedKeys(keys);
  }, []);

  const getProductId = (itemId: string, itemName: string) => {
    if (itemId === 'item-1' || itemName.includes('Sony WH-1000XM5')) return 'p-1';
    if (itemId === 'item-2' || itemName.includes('Mechanical Backlit Keyboard')) return 'p-2';
    if (itemId === 'item-3' || itemName.includes('Villex Custom Sneakers')) return 'p-3';
    if (itemId === 'item-4' || itemName.includes('Ultralight Ergo Wireless Gaming Mouse')) return 'p-4';
    return itemId;
  };

  const isItemReviewed = (orderId: string, itemId: string, itemName: string) => {
    const productId = getProductId(itemId, itemName);
    return reviewedKeys.includes(`reviewed_${orderId}_${productId}`);
  };

  const markItemAsReviewed = (orderId: string, productId: string) => {
    const key = `reviewed_${orderId}_${productId}`;
    localStorage.setItem(key, 'true');
    setReviewedKeys((prev) => [...prev, key]);
  };

  const handleOpenReviewModal = (orderId: string, item: any) => {
    const productId = getProductId(item.id, item.name);
    setReviewItem({
      orderId,
      productId,
      name: item.name,
      image: item.image,
    });
    setReviewRating(5);
    setReviewComment('');
    setReviewPhotos([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReviewPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setReviewPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem) return;
    if (!reviewComment.trim()) {
      alert('Please enter a review comment.');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: reviewItem.productId,
          orderId: reviewItem.orderId,
          customerName: 'Zayn Ali',
          rating: reviewRating,
          comment: reviewComment,
          photos: reviewPhotos,
        }),
      });
      
      if (response.ok) {
        markItemAsReviewed(reviewItem.orderId, reviewItem.productId);
        alert('Review submitted successfully! Thank you for your feedback.');
        setReviewItem(null);
      } else {
        alert('Failed to submit review.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('An error occurred while submitting review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRequestReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrder) return;
    if (!returnComment.trim()) {
      alert('Please provide some details/comments for your return request.');
      return;
    }
    
    setSubmittingReturn(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: returnOrder.id,
          status: 'RETURN_REQUESTED',
          returnReason,
          returnComment,
        }),
      });
      
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === returnOrder.id
              ? {
                  ...o,
                  status: 'RETURN_REQUESTED',
                  returnReason,
                  returnComment,
                  estimatedDelivery: 'Return Processing',
                  trackingSteps: [
                    { name: 'Ordered', date: o.date, done: true },
                    { name: 'Delivered', done: true },
                    { name: 'Return Request', done: true },
                    { name: 'Approved', done: false },
                    { name: 'Picked Up', done: false },
                    { name: 'Refunded', done: false },
                  ],
                }
              : o
          )
        );
        alert('Return request submitted successfully! Awaiting Seller/Admin review.');
        setReturnOrder(null);
        setReturnComment('');
      } else {
        alert('Failed to submit return request. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit return request:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((o: any) => {
            const steps: { name: string; date?: string; done: boolean }[] = [{ name: 'Ordered', date: o.date, done: true }];
            const isReturn = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED', 'REFUNDED'].includes(o.status);

            if (o.status === 'PENDING') {
              steps.push({ name: 'Payment Verifying', done: true });
              steps.push({ name: 'Shipped', done: false });
              steps.push({ name: 'Delivered', done: false });
            } else if (isReturn) {
              steps.push({ name: 'Delivered', done: true });
              steps.push({ name: 'Return Request', done: true });
              steps.push({ name: 'Approved', done: ['RETURN_APPROVED', 'RETURNED', 'REFUNDED'].includes(o.status) });
              steps.push({ name: 'Picked Up', done: ['RETURNED', 'REFUNDED'].includes(o.status) });
              steps.push({ name: 'Refunded', done: o.status === 'REFUNDED' });
            } else {
              steps.push({ name: 'Processing', date: o.date, done: true });
              steps.push({ name: 'Shipped', done: o.status === 'SHIPPED' || o.status === 'DELIVERED' });
              steps.push({ name: 'Delivered', done: o.status === 'DELIVERED' });
            }

            return {
              id: o.id,
              date: o.date,
              total: o.total,
              status: o.status === 'READY_TO_SHIP' ? 'PROCESSING' : o.status,
              items: o.items.map((item: any, index: number) => ({
                id: `live-item-${index}`,
                name: item.name,
                image: item.image,
                qty: item.qty,
                price: item.price,
                spec: item.spec,
              })),
              trackingSteps: steps,
              estimatedDelivery: o.status === 'DELIVERED' ? 'Delivered' : isReturn ? 'Return Processing' : 'June 23, 2026',
              paymentMethod: o.paymentMethod,
              walletPhone: o.walletPhone,
              walletTid: o.walletTid,
              returnReason: o.returnReason,
              returnComment: o.returnComment,
            };
          });
          setOrders([...formatted, ...INITIAL_MOCK_ORDERS]);
        } else {
          setOrders(INITIAL_MOCK_ORDERS);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
        setOrders(INITIAL_MOCK_ORDERS);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PROCESSING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse';
      case 'SHIPPED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'RETURN_REQUESTED':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse';
      case 'RETURN_APPROVED':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'RETURNED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'REFUNDED':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-secondary text-foreground border-border';
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: 'CANCELLED',
                trackingSteps: [
                  ...order.trackingSteps.map((step) => ({ ...step, done: step.name === 'Ordered' })),
                  { name: 'Cancelled', date: 'Just now', done: true },
                ],
              }
            : order
        )
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
        <p className="text-sm text-muted-foreground mt-1">Review the status of current shipments, download invoices, and trace previous transactions.</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 overflow-hidden relative border-border">
            {/* Order Card Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wide">Order Identifier</span>
                  <span className="font-mono font-bold text-foreground">{order.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wide">Date Placed</span>
                  <span className="text-foreground font-semibold">{order.date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wide">Grand Total</span>
                  <span className="text-primary font-bold">PKR {order.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveInvoice(order)}
                  className="h-8 text-xs font-medium"
                >
                  Invoice
                </Button>
                {order.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
                  >
                    Cancel Order
                  </Button>
                )}
                {order.status === 'DELIVERED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReturnOrder(order)}
                    className="h-8 text-xs text-orange-500 hover:bg-orange-500/10 border-orange-500/20"
                  >
                    Request Return
                  </Button>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-secondary/50 border border-border flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                    {item.spec && <p className="text-xs text-muted-foreground mt-0.5">{item.spec}</p>}
                    <div className="flex items-center justify-between text-xs mt-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-muted-foreground">Qty: {item.qty}</span>
                        {order.status === 'DELIVERED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(order.id, item)}
                            disabled={isItemReviewed(order.id, item.id, item.name)}
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md transition-all ${
                              isItemReviewed(order.id, item.id, item.name)
                                ? 'bg-secondary/50 text-muted-foreground/60 cursor-not-allowed border border-border/40'
                                : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
                            }`}
                          >
                            {isItemReviewed(order.id, item.id, item.name) ? 'Reviewed ✓' : 'Review Item'}
                          </button>
                        )}
                      </div>
                      <span className="font-semibold text-foreground">PKR {item.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tracking Stepper / Timeline */}
            {order.status !== 'CANCELLED' && (
              <div className="border-t border-border pt-5 mt-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Logistics Tracker</span>
                  {order.estimatedDelivery && (
                    <span className="text-xs text-muted-foreground">
                      Estimated Delivery: <strong className="text-foreground">{order.estimatedDelivery}</strong>
                    </span>
                  )}
                </div>

                <div className="relative pt-2 pb-6">
                  {/* Progress Line Background */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary/50 -translate-y-1/2"></div>
                  
                  {/* Active Progress Line */}
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500"
                    style={{
                      width: `${
                        order.status === 'DELIVERED'
                          ? 100
                          : order.status === 'SHIPPED'
                          ? 66
                          : order.status === 'PROCESSING'
                          ? 33
                          : 0
                      }%`,
                    }}
                  ></div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {order.trackingSteps.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center relative z-10 transition-colors duration-300 ${
                            step.done
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'bg-background border-secondary/70 text-muted-foreground'
                          }`}
                        >
                          {step.done ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                          )}
                        </div>
                        <span className="text-[11px] font-bold mt-2 text-foreground">{step.name}</span>
                        {step.date && <span className="text-[9px] text-muted-foreground mt-0.5">{step.date}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* simulated Invoice Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl bg-card border-border shadow-2xl relative flex flex-col p-6 animate-scale-in">
            {/* Modal Close */}
            <button
              onClick={() => setActiveInvoice(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Invoice Header */}
            <div className="flex items-center justify-between border-b border-border pb-6 mb-6">
              <div>
                <Logo size="sm" />
                <p className="text-xs text-muted-foreground mt-1">Certified Digital Merchant Invoice</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold">INVOICE</h3>
                <span className="font-mono text-xs text-muted-foreground">#{activeInvoice.id}</span>
              </div>
            </div>

            {/* Bill To & Details */}
            <div className="grid grid-cols-2 gap-8 text-xs mb-6">
              <div>
                <span className="text-muted-foreground uppercase font-bold block mb-1 tracking-wider text-[9px]">Bill To</span>
                <strong className="text-sm text-foreground block">Zayn Ali</strong>
                <p className="text-muted-foreground leading-relaxed mt-1">
                  House 412, Sector F-11<br />
                  Islamabad, 44000, Pakistan
                </p>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Date Issued</span>
                  <strong>{activeInvoice.date}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Payment Status</span>
                  <span className="text-emerald-400 font-bold">Paid / Escrow Settled</span>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/35 border-b border-border text-muted-foreground font-bold">
                    <th className="p-3">Product Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeInvoice.items.map((item) => (
                    <tr key={item.id} className="text-foreground">
                      <td className="p-3 font-semibold">
                        {item.name}
                        {item.spec && <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">{item.spec}</span>}
                      </td>
                      <td className="p-3 text-center">{item.qty}</td>
                      <td className="p-3 text-right font-mono">PKR {item.price.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-semibold">PKR {(item.price * item.qty).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="w-80 ml-auto text-xs space-y-2 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono">PKR {activeInvoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Fee:</span>
                <span className="font-mono text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm">
                <strong className="text-foreground">Total Paid:</strong>
                <strong className="text-primary font-mono">PKR {activeInvoice.total.toLocaleString()}</strong>
              </div>
            </div>

            {/* Print/Download button */}
            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <Button variant="ghost" size="sm" onClick={() => setActiveInvoice(null)}>
                Close
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </Card>
        </div>
      )}
      {/* Return Request Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md bg-card border-border shadow-2xl relative flex flex-col p-6 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setReturnOrder(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/40"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-lg font-bold text-foreground">Request Product Return</h3>
              <p className="text-xs text-muted-foreground mt-1">Order Ref: {returnOrder.id}</p>
            </div>

            <form onSubmit={handleRequestReturnSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e: any) => setReturnReason(e.target.value)}
                  className="w-full bg-secondary/30 border border-input rounded-xl h-10 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                >
                  <option value="Wrong Product">Wrong Product</option>
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Fake Product">Fake Product</option>
                  <option value="Size Issue">Size Issue</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Detailed Comments & Issues
                </label>
                <textarea
                  placeholder="Describe the issue you experienced in detail (e.g. wrong size shipped, damaged box, item not working...)"
                  value={returnComment}
                  onChange={(e) => setReturnComment(e.target.value)}
                  className="w-full bg-secondary/30 border border-input rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 h-28 resize-none text-foreground"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReturnOrder(null)}
                  disabled={submittingReturn}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  disabled={submittingReturn}
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Write Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md bg-card border-border shadow-2xl relative flex flex-col p-6 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setReviewItem(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary/40"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="pb-4 border-b border-border mb-4 flex items-center space-x-3">
              <img
                src={reviewItem.image}
                alt={reviewItem.name}
                className="w-12 h-12 rounded-lg object-cover bg-secondary/50 border border-border"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-foreground truncate">{reviewItem.name}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Rate purchased product</p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-2 text-center py-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  How would you rate this item?
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= reviewRating ? 'text-amber-400 fill-current' : 'text-muted-foreground/40 stroke-current'}`}
                        fill={star <= reviewRating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  {reviewRating === 5 ? 'Excellent' : reviewRating === 4 ? 'Very Good' : reviewRating === 3 ? 'Good' : reviewRating === 2 ? 'Fair' : 'Poor'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Written Review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this item's performance, build quality, and shipping..."
                  className="w-full bg-secondary/30 border border-input rounded-xl p-3 text-xs placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground min-h-[90px] resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Attach Photos
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {reviewPhotos.map((photo, index) => (
                    <div key={index} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border group bg-secondary/20">
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-[10px] font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {reviewPhotos.length < 3 && (
                    <label className="w-14 h-14 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-secondary/10">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground">Attach up to 3 photos (Max 2MB each)</span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewItem(null)}
                  className="flex-grow h-10 text-[10px] font-black uppercase tracking-wider"
                  disabled={isSubmittingReview}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-grow h-10 text-[10px] font-black uppercase tracking-wider"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
