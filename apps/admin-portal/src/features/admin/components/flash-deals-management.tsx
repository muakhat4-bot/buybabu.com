'use client';

import * as React from 'react';
import { Button, Card } from '@villex/ui';

export function FlashDealsManagement() {
  const [deals, setDeals] = React.useState<any[]>([]);
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [isLoading, setIsLoading] = React.useState(true);
  const [rejectingDealId, setRejectingDealId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [isActionLoading, setIsActionLoading] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const getAdminToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('villex_admin_token') || sessionStorage.getItem('villex_admin_token');
    }
    return null;
  };

  const fetchDeals = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAdminToken();
      const url = filterStatus === 'ALL' ? '/api/flash-deals' : `/api/flash-deals?status=${filterStatus}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.deals)) {
          setDeals(data.deals);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admin flash deals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  React.useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleAction = async (id: string, action: string, reason?: string) => {
    setIsActionLoading(true);
    setFeedbackMessage(null);
    try {
      const token = getAdminToken();
      const res = await fetch('/api/flash-deals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ id, action, rejectionReason: reason })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Action failed');
      }

      setFeedbackMessage(`Deal status successfully updated to ${action}`);
      setRejectingDealId(null);
      setRejectionReason('');
      fetchDeals();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 border border-border/80 p-6 rounded-2xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-black tracking-tight text-foreground">Flash Deals Approval Center</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Review, approve, or reject vendor-submitted limited-time promotional deals with reserved inventory.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-secondary/35 p-1 rounded-xl border border-border">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAUSED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <span>✓</span> {feedbackMessage}
        </div>
      )}

      {/* Deals Table */}
      <Card className="border border-border/80 overflow-hidden rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider border-b border-border">
              <tr>
                <th className="py-3.5 px-4">Vendor Store</th>
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">Regular Price</th>
                <th className="py-3.5 px-4">Deal Price</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Promo Stock</th>
                <th className="py-3.5 px-4">Deal Schedule</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading submitted flash deals...</span>
                    </div>
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted-foreground">
                    <span className="text-3xl block mb-2">⚡</span>
                    <strong className="block text-foreground text-sm font-bold">No Flash Deals Found</strong>
                    <p className="text-xs text-muted-foreground mt-1">
                      No deals match the selected filter status.
                    </p>
                  </td>
                </tr>
              ) : (
                deals.map((deal) => {
                  const product = deal.products;
                  const variant = deal.product_variants;
                  const vendor = deal.vendors;
                  const origPrice = Number(variant?.price || 0);
                  const dPrice = Number(deal.deal_price || 0);
                  const discountPct = origPrice > 0 ? Math.round(((origPrice - dPrice) / origPrice) * 100) : 0;
                  const imagesObj = (product?.images as any) || { main: '' };
                  const image = imagesObj.main || (Array.isArray(imagesObj) ? imagesObj[0] : '') || '';

                  return (
                    <tr key={deal.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground block">{vendor?.store_name || 'Vendor'}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {vendor?.id?.slice(0, 8)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {image && (
                            <img src={image} alt="" className="w-9 h-9 rounded-lg object-cover bg-secondary/50 border border-border shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-foreground block line-clamp-1">{product?.name || 'Product'}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">SKU: {variant?.sku || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground line-through">
                        PKR {origPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-black text-primary">
                        PKR {dPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-destructive/15 text-destructive font-black text-[10px] px-2 py-0.5 rounded uppercase">
                          -{discountPct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground">{deal.promotional_stock} units</span>
                        <span className="text-muted-foreground block text-[10px]">{deal.sold_count || 0} sold</span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-muted-foreground">
                        <div>From: {new Date(deal.starts_at).toLocaleDateString()}</div>
                        <div>To: {new Date(deal.ends_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {deal.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                            ● Approved
                          </span>
                        )}
                        {deal.status === 'PENDING_APPROVAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse">
                            ⏱ Review Required
                          </span>
                        )}
                        {deal.status === 'REJECTED' && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-destructive/10 text-destructive border border-destructive/30">
                              ✕ Rejected
                            </span>
                            {deal.rejection_reason && (
                              <p className="text-[10px] text-destructive/80 mt-1 max-w-xs">{deal.rejection_reason}</p>
                            )}
                          </div>
                        )}
                        {deal.status === 'PAUSED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-secondary text-muted-foreground border border-border">
                            Paused
                          </span>
                        )}
                        {deal.status === 'ENDED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-secondary text-muted-foreground border border-border">
                            Ended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {deal.status === 'PENDING_APPROVAL' && (
                            <>
                              <Button
                                onClick={() => handleAction(deal.id, 'APPROVE')}
                                size="sm"
                                variant="primary"
                                className="h-7 px-3 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700"
                                disabled={isActionLoading}
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => {
                                  setRejectingDealId(deal.id);
                                  setRejectionReason('');
                                }}
                                size="sm"
                                variant="ghost"
                                className="h-7 px-3 text-[10px] font-extrabold uppercase tracking-wider text-destructive hover:bg-destructive/10"
                                disabled={isActionLoading}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {deal.status === 'APPROVED' && (
                            <Button
                              onClick={() => handleAction(deal.id, 'PAUSE')}
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2.5 text-[10px] text-muted-foreground hover:text-foreground"
                              disabled={isActionLoading}
                            >
                              Pause
                            </Button>
                          )}
                          {deal.status === 'PAUSED' && (
                            <Button
                              onClick={() => handleAction(deal.id, 'ACTIVATE')}
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2.5 text-[10px] text-emerald-500 hover:bg-emerald-500/10"
                              disabled={isActionLoading}
                            >
                              Activate
                            </Button>
                          )}
                          {(deal.status === 'APPROVED' || deal.status === 'PAUSED') && (
                            <Button
                              onClick={() => handleAction(deal.id, 'END')}
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                              disabled={isActionLoading}
                            >
                              End
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rejection Reason Modal */}
      {rejectingDealId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">Reject Flash Deal Proposal</h3>
            <p className="text-xs text-muted-foreground">
              Please provide the reason for rejecting this promotional deal so the vendor can rectify their proposal.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Discount is insufficient, promotional stock does not meet minimum standards..."
              className="w-full h-24 p-3 bg-secondary/35 border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-destructive/40"
              required
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectingDealId(null)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-destructive hover:bg-destructive/90 text-white font-bold text-xs uppercase"
                onClick={() => handleAction(rejectingDealId, 'REJECT', rejectionReason)}
                disabled={isActionLoading || !rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
