'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

export interface GlobalOrder {
  id: string;
  customerName: string;
  vendorStoreName: string;
  date: string;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURNED' | 'REFUNDED' | 'CANCELLED';
  escrowStatus: 'SECURED_HOLD' | 'RELEASED' | 'REFUNDED';
  itemsCount: number;
  items?: Array<{ name: string; qty: number; price: number }>;
  returnReason?: string;
  returnComment?: string;
}

interface OrdersLedgerProps {
  orders: GlobalOrder[];
  onApproveReturn?: (id: string) => void;
  onRejectReturn?: (id: string) => void;
  onMarkReturned?: (id: string) => void;
  onIssueRefund?: (id: string) => void;
}

export function OrdersLedger({
  orders,
  onApproveReturn,
  onRejectReturn,
  onMarkReturned,
  onIssueRefund,
}: OrdersLedgerProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [escrowFilter, setEscrowFilter] = React.useState<'ALL' | 'SECURED_HOLD' | 'RELEASED' | 'REFUNDED'>('ALL');
  const [selectedOrder, setSelectedOrder] = React.useState<GlobalOrder | null>(null);

  // Sync selectedOrder with parent orders state updates
  React.useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find((o) => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [orders, selectedOrder]);

  const getStatusBadge = (status: GlobalOrder['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            Pending Verification
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Processing
          </span>
        );
      case 'READY_TO_SHIP':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">
            Ready to Ship
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Delivered
          </span>
        );
      case 'RETURN_REQUESTED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse">
            Return Requested
          </span>
        );
      case 'RETURN_APPROVED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
            Return Approved
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Item Picked Up
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
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

  const getEscrowBadge = (escrow: GlobalOrder['escrowStatus']) => {
    switch (escrow) {
      case 'SECURED_HOLD':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            Secured Hold
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Released to Seller
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Returned to Buyer
          </span>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.vendorStoreName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEscrow = escrowFilter === 'ALL' || o.escrowStatus === escrowFilter;

    return matchesSearch && matchesEscrow;
  });

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border backdrop-blur-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-4 border-b border-border/60">
          <div>
            <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
              Global Order Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Audit platform-wide marketplace orders, link connections, and track active escrow locks.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative max-w-xs">
              <Input
                placeholder="Search by ID, buyer or store..."
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
              {(['ALL', 'SECURED_HOLD', 'RELEASED', 'REFUNDED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setEscrowFilter(filter)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                    escrowFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter === 'ALL' ? 'All Holds' : filter === 'SECURED_HOLD' ? 'On Hold' : filter === 'RELEASED' ? 'Released' : 'Refunded'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Buyer</th>
                <th className="py-3 px-6">Merchant Store</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6 text-right">Total</th>
                <th className="py-3 px-6">Order Status</th>
                <th className="py-3 px-6 text-center">Escrow Security State</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-bold">
                    No orders registered.
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
                    <td className="py-4 px-6 font-bold text-foreground">
                      {order.vendorStoreName}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-medium">
                      {order.date}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-foreground">
                      PKR {order.total.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getEscrowBadge(order.escrowStatus)}
                    </td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        {order.status === 'RETURN_REQUESTED' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => onApproveReturn && onApproveReturn(order.id)}
                              className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRejectReturn && onRejectReturn(order.id)}
                              className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {order.status === 'RETURN_APPROVED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onMarkReturned && onMarkReturned(order.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Mark Picked Up
                          </Button>
                        )}
                        {order.status === 'RETURNED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onIssueRefund && onIssueRefund(order.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            Issue Refund
                          </Button>
                        )}
                        {!['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED'].includes(order.status) && (
                          <span className="text-[9px] font-bold text-muted-foreground/60 font-mono italic">
                            —
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

      {/* Detail slide out drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="flex-grow" onClick={() => setSelectedOrder(null)} />
          <div className="w-full max-w-md bg-card border-l border-border h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl relative select-none animate-slide-in animate-duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Order details</h3>
                  <p className="font-mono text-base font-black text-foreground">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-0.5">Buyer</span>
                    <p className="text-foreground font-bold">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-0.5">Merchant Store</span>
                    <p className="text-foreground font-bold">{selectedOrder.vendorStoreName}</p>
                  </div>
                </div>

                <div className="bg-secondary/15 border border-border/60 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">Escrow Hold Status</span>
                    <div className="mt-1">{getEscrowBadge(selectedOrder.escrowStatus)}</div>
                  </div>
                  <p className="text-[10px] leading-normal font-semibold text-muted-foreground">
                    {selectedOrder.escrowStatus === 'SECURED_HOLD'
                      ? 'Funds are safely locked in Buy Babu Platform Escrow hold. Ready for release to seller after courier delivery confirmation.'
                      : selectedOrder.escrowStatus === 'RELEASED'
                        ? 'Escrow holds resolved. Funds have been credited to the merchant payout ledger.'
                        : 'Escrow refunded. Transaction cancelled and funds returned to customer wallet balance.'}
                  </p>
                </div>

                {selectedOrder.returnReason && (
                  <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-4 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 block">Customer Return request reason</span>
                    <p className="text-xs font-bold text-foreground font-sans leading-normal">
                      {selectedOrder.returnReason}
                    </p>
                    {selectedOrder.returnComment && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 font-medium leading-relaxed">
                        &ldquo;{selectedOrder.returnComment}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Line Items Listing</span>
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
                        <span className="text-foreground font-bold">Marketplace Electronic Item <span className="text-muted-foreground ml-1">x{selectedOrder.itemsCount}</span></span>
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
            </div>
            
            <div className="border-t border-border/60 pt-4 flex space-x-2 mt-6">
              {selectedOrder.status === 'RETURN_REQUESTED' && (
                <>
                  <Button
                    onClick={() => onApproveReturn && onApproveReturn(selectedOrder.id)}
                    className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Approve Return
                  </Button>
                  <Button
                    onClick={() => onRejectReturn && onRejectReturn(selectedOrder.id)}
                    variant="outline"
                    className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                  >
                    Reject Return
                  </Button>
                </>
              )}
              {selectedOrder.status === 'RETURN_APPROVED' && (
                <Button
                  onClick={() => onMarkReturned && onMarkReturned(selectedOrder.id)}
                  className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Mark Picked Up
                </Button>
              )}
              {selectedOrder.status === 'RETURNED' && (
                <Button
                  onClick={() => onIssueRefund && onIssueRefund(selectedOrder.id)}
                  className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Issue Refund
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="text-[10px] font-black uppercase tracking-wider h-10 rounded-xl border-border px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

