'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  date: string;
  total: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURNED' | 'REFUNDED' | 'CANCELLED';
  itemsCount: number;
  items?: Array<{ name: string; qty: number; price: number }>;
  carrier?: string;
  trackingNumber?: string;
  returnReason?: string;
  returnComment?: string;
  walletPhone?: string;
  walletTid?: string;
}

interface OrdersTableProps {
  orders: Order[];
  onProcessFulfillment: (orderId: string) => void;
  onOpenShippingModal: (orderId: string) => void;
  onApproveReturn: (orderId: string) => void;
  onRejectReturn: (orderId: string) => void;
  onIssueRefund: (orderId: string) => void;
  onConfirmPayment: (orderId: string) => void;
  onMarkAsDelivered?: (orderId: string) => void;
  onMarkAsPickedUp?: (orderId: string) => void;
  isCompact?: boolean;
  storeName?: string;
}

export function OrdersTable({
  orders,
  onProcessFulfillment,
  onOpenShippingModal,
  onApproveReturn,
  onRejectReturn,
  onIssueRefund,
  onConfirmPayment,
  onMarkAsDelivered,
  onMarkAsPickedUp,
  isCompact = false,
  storeName,
}: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'RETURNS' | 'REFUNDS'>('ALL');
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = React.useState(false);

  // Sync selectedOrder with state updates
  React.useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [orders, selectedOrder]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchesStatus = ['PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(order.status);
    } else if (statusFilter === 'RETURNS') {
      matchesStatus = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED'].includes(order.status);
    } else if (statusFilter === 'REFUNDS') {
      matchesStatus = order.status === 'REFUNDED';
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            Pending Verification
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Processing
          </span>
        );
      case 'READY_TO_SHIP':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">
            Ready to Ship
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Delivered
          </span>
        );
      case 'RETURN_REQUESTED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse">
            Return Requested
          </span>
        );
      case 'RETURN_APPROVED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
            Return Approved
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Item Picked Up
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
            Refunded
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border backdrop-blur-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-4 border-b border-border/60">
          <div>
            <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
              {isCompact ? 'Recent Orders' : 'Order Ledger'}
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your store&apos;s customer orders, multi-step dispatches, returns evaluation, and refunds ledger.
            </CardDescription>
          </div>
          {!isCompact && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative max-w-xs">
                <Input
                  placeholder="Search by ID or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 text-xs font-semibold pl-8"
                />
                <span className="absolute left-2.5 top-3 text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>

              <div className="flex items-center space-x-1.5 bg-secondary/30 rounded-lg p-1 border border-border">
                {(['ALL', 'ACTIVE', 'RETURNS', 'REFUNDS'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                      statusFilter === filter
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter === 'ALL' ? 'All Ledger' : filter === 'ACTIVE' ? 'Active Dispatches' : filter === 'RETURNS' ? 'Returns' : 'Refunded'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6 px-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6 text-center">Items</th>
                <th className="py-3 px-6 text-right">Total</th>
                <th className="py-3 px-6">Payment</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-center">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-bold">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-secondary/10 cursor-pointer transition-colors duration-150"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-foreground">
                      {order.id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-foreground">
                      {order.customerName}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-medium">
                      {order.date}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-semibold text-center">
                      {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-foreground">
                      PKR {order.total.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-bold tracking-wider text-[10px] uppercase">
                      {order.paymentMethod}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        {order.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onConfirmPayment(order.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                          >
                            Confirm Payment
                          </Button>
                        )}
                        {order.status === 'PROCESSING' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onProcessFulfillment(order.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg"
                          >
                            Process Slip
                          </Button>
                        )}
                        {order.status === 'READY_TO_SHIP' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onOpenShippingModal(order.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-violet-600 hover:bg-violet-700"
                          >
                            Dispatch Carrier
                          </Button>
                        )}
                        {order.status === 'RETURN_REQUESTED' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => onApproveReturn(order.id)}
                              className="text-[9px] font-black uppercase tracking-wider h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRejectReturn(order.id)}
                              className="text-[9px] font-black uppercase tracking-wider h-7 px-2 rounded-lg border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {order.status === 'RETURN_APPROVED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onMarkAsPickedUp && onMarkAsPickedUp(order.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                          >
                            Mark Picked Up
                          </Button>
                        )}
                        {order.status === 'RETURNED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onIssueRefund(order.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700"
                          >
                            Issue Refund
                          </Button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onMarkAsDelivered && onMarkAsDelivered(order.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                          >
                            Mark as Delivered
                          </Button>
                        )}
                        {!['PENDING', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED'].includes(order.status) && (
                          <span className="text-[9px] font-bold text-muted-foreground/80 font-mono italic">
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Slide-out Order Details Drawer Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm">
          {/* Backdrop click closer */}
          <div className="flex-grow" onClick={() => { setSelectedOrder(null); setShowInvoicePreview(false); }} />
          
          <div className="w-full max-w-lg bg-card border-l border-border h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl relative">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Order details</h3>
                  <p className="font-mono text-base font-black text-foreground">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => { setSelectedOrder(null); setShowInvoicePreview(false); }}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Stepper */}
              <div className="bg-secondary/25 border border-border/80 rounded-xl p-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">Fulfillment Stepper</span>
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                  <span className={`flex items-center space-x-1 ${selectedOrder.status !== 'CANCELLED' && 'text-primary'}`}>
                    <span>1. Processing</span>
                  </span>
                  <span className="h-0.5 w-8 bg-border" />
                  <span className={`flex items-center space-x-1 ${['READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'RETURNED', 'REFUNDED'].includes(selectedOrder.status) && 'text-primary'}`}>
                    <span>2. Packed</span>
                  </span>
                  <span className="h-0.5 w-8 bg-border" />
                  <span className={`flex items-center space-x-1 ${['SHIPPED', 'DELIVERED', 'RETURNED', 'REFUNDED'].includes(selectedOrder.status) && 'text-primary'}`}>
                    <span>3. In Transit</span>
                  </span>
                </div>
              </div>

              {/* Printable Packing Slip / Invoice preview toggle */}
              {showInvoicePreview ? (
                /* Invoice printable preview card */
                <div className="border-2 border-dashed border-black bg-white text-black p-5 rounded-xl font-mono text-xs space-y-4 mb-6 shadow-inner select-text">
                  <div className="text-center border-b border-black pb-2">
                    <h4 className="font-bold text-sm">BUY BABU MARKETPLACE</h4>
                    <p className="text-[10px]">Merchant Packing Slip Receipt</p>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <div>
                      <p>Store: {storeName || 'ElectroPulse'}</p>
                      <p>Order: {selectedOrder.id}</p>
                    </div>
                    <div className="text-right">
                      <p>Date: {selectedOrder.date}</p>
                      <p>Type: {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="border-t border-b border-black py-2 my-2 space-y-1">
                    <p className="font-bold">Ship To:</p>
                    <p>{selectedOrder.customerName}</p>
                    <p>{selectedOrder.shippingAddress || 'House 22, Street 8, G-11/2, Islamabad'}</p>
                    <p>Phone: {selectedOrder.customerPhone || '0300-1234567'}</p>
                  </div>
                  <div>
                    <p className="font-bold border-b border-black pb-1 mb-1">Items Description</p>
                    {selectedOrder.items ? (
                      selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span>{item.name} x {item.qty}</span>
                          <span>PKR {(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-[10px]">
                        <span>Standard Electronic Item x {selectedOrder.itemsCount}</span>
                        <span>PKR {selectedOrder.total.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-black pt-2 text-right font-bold flex justify-between">
                    <span>Grand Total:</span>
                    <span>PKR {selectedOrder.total.toLocaleString()}</span>
                  </div>
                  
                  {/* barcode mock */}
                  <div className="text-center pt-2 font-mono text-[9px]">
                    <div className="border-t-8 border-b-8 border-black w-32 mx-auto tracking-widest leading-none mb-1">
                      |||| | ||||| | |||
                    </div>
                    <span>*VLX-{selectedOrder.id.replace('#', '')}*</span>
                  </div>

                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInvoicePreview(false)}
                      className="text-[9px] font-black bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 h-7 rounded-lg"
                    >
                      Close Slip View
                    </Button>
                  </div>
                </div>
              ) : (
                /* Standard Drawer specs info */
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-0.5">Customer details</span>
                      <p className="text-foreground font-bold">{selectedOrder.customerName}</p>
                      <p className="text-muted-foreground font-medium mt-0.5">{selectedOrder.customerPhone || '0300-1234567'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-0.5">Shipping Address</span>
                      <p className="text-muted-foreground leading-normal font-medium">
                        {selectedOrder.shippingAddress || 'House 22, Street 8, G-11/2, Islamabad'}
                      </p>
                    </div>
                  </div>

                  {['JazzCash', 'EasyPaisa'].includes(selectedOrder.paymentMethod) && (
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 block">Sender Wallet Phone</span>
                        <p className="text-foreground font-black mt-0.5">{(selectedOrder as any).walletPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 block">Transaction ID (TID)</span>
                        <p className="text-foreground font-mono font-bold mt-0.5">{(selectedOrder as any).walletTid || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1.5 font-bold">Escrow Hold Safeguard details</span>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-start space-x-2.5">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div className="text-[10px] leading-normal font-semibold text-muted-foreground">
                        <p className="text-foreground font-black uppercase tracking-wider text-[8px] text-emerald-500">Escrow Protected Status</p>
                        <p className="mt-1">
                          Funds for {selectedOrder.id} are secured in the Buy Babu Escrow Hold. Payouts will release to the vendor balance 24 hours after customer delivery verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.carrier && (
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-secondary/15 border border-border/60 rounded-xl p-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">Shipping Carrier</span>
                        <p className="text-foreground font-black mt-0.5">{selectedOrder.carrier}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">Tracking Number</span>
                        <p className="text-foreground font-mono font-bold mt-0.5">{selectedOrder.trackingNumber}</p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.returnReason && (
                    <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-4 space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 block">Customer Return request reason</span>
                      <p className="text-xs font-bold text-foreground font-sans leading-normal">
                        &ldquo;{selectedOrder.returnReason}&rdquo;
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Line Items Listing</span>
                      <button
                        onClick={() => setShowInvoicePreview(true)}
                        className="text-[9px] font-black uppercase text-primary hover:text-primary/80 tracking-wider flex items-center space-x-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Print Packing Slip</span>
                      </button>
                    </div>
                    <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/60 bg-secondary/10 text-xs font-semibold">
                      {selectedOrder.items ? (
                        selectedOrder.items.map((item, i) => (
                          <div key={i} className="flex justify-between p-3">
                            <span className="text-foreground font-bold">{item.name} <span className="text-muted-foreground ml-1">x{item.qty}</span></span>
                            <span className="text-foreground font-black">PKR {(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between p-3">
                          <span className="text-foreground font-bold">Electronic Marketplace Item <span className="text-muted-foreground ml-1">x{selectedOrder.itemsCount}</span></span>
                          <span className="text-foreground font-black">PKR {selectedOrder.total.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between p-3 bg-secondary/20 font-black border-t border-border/80">
                        <span className="text-foreground">Total Value:</span>
                        <span className="text-foreground">PKR {selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="border-t border-border/60 pt-4 flex space-x-2 mt-6">
              {selectedOrder.status === 'SHIPPED' && (
                <Button
                  onClick={() => {
                    if (onMarkAsDelivered) {
                      onMarkAsDelivered(selectedOrder.id);
                    }
                  }}
                  className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                >
                  Confirm Delivery
                </Button>
              )}
              {selectedOrder.status === 'PENDING' && (
                <Button
                  onClick={() => onConfirmPayment(selectedOrder.id)}
                  className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm Payment
                </Button>
              )}
              {selectedOrder.status === 'PROCESSING' && (
                <Button
                  onClick={() => onProcessFulfillment(selectedOrder.id)}
                  className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl"
                >
                  Process Packing Slip
                </Button>
              )}
              {selectedOrder.status === 'READY_TO_SHIP' && (
                <Button
                  onClick={() => onOpenShippingModal(selectedOrder.id)}
                  className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-violet-600 hover:bg-violet-700"
                >
                  Dispatch Shipment
                </Button>
              )}
              {selectedOrder.status === 'RETURN_REQUESTED' && (
                <>
                  <Button
                    onClick={() => onApproveReturn(selectedOrder.id)}
                    className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    Approve Return
                  </Button>
                  <Button
                    onClick={() => onRejectReturn(selectedOrder.id)}
                    variant="outline"
                    className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                  >
                    Reject Request
                  </Button>
                </>
              )}
              {selectedOrder.status === 'RETURN_APPROVED' && (
                <Button
                  onClick={() => onMarkAsPickedUp && onMarkAsPickedUp(selectedOrder.id)}
                  className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                >
                  Mark as Picked Up
                </Button>
              )}
              {selectedOrder.status === 'RETURNED' && (
                <Button
                  onClick={() => onIssueRefund(selectedOrder.id)}
                  className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-rose-600 hover:bg-rose-700"
                >
                  Issue Refund
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => { setSelectedOrder(null); setShowInvoicePreview(false); }}
                className="text-[10px] font-black uppercase tracking-wider h-10 px-4 rounded-xl border-border"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
