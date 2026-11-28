'use client';

import * as React from 'react';
import { Button, Card, Input } from '@villex/ui';
import { useAuth } from '../../../context/vendor-auth-context';
import { Product } from './inventory-list';

interface FlashDealsPanelProps {
  products: Product[];
}

export function FlashDealsPanel({ products }: FlashDealsPanelProps) {
  const { token } = useAuth();
  const [deals, setDeals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Form states
  const [selectedProductId, setSelectedProductId] = React.useState('');
  const [selectedVariantId, setSelectedVariantId] = React.useState('');
  const [dealPrice, setDealPrice] = React.useState('');
  const [promotionalStock, setPromotionalStock] = React.useState('');
  const [startsAt, setStartsAt] = React.useState('');
  const [endsAt, setEndsAt] = React.useState('');

  // Filter only approved products
  const approvedProducts = React.useMemo(() => {
    return products.filter((p) => p.approvalStatus === 'APPROVED' || !p.approvalStatus);
  }, [products]);

  // Selected product & variant
  const selectedProduct = React.useMemo(() => {
    return approvedProducts.find((p) => p.id === selectedProductId);
  }, [approvedProducts, selectedProductId]);

  const variants = React.useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.variants && selectedProduct.variants.length > 0) {
      return selectedProduct.variants;
    }
    return [{ id: selectedProduct.id, name: 'Default Variant', price: selectedProduct.price, sku: selectedProduct.sku }];
  }, [selectedProduct]);

  const selectedVariant = React.useMemo(() => {
    return variants.find((v: any) => v.id === selectedVariantId) || variants[0];
  }, [variants, selectedVariantId]);

  const originalPrice = Number(selectedVariant?.price || selectedProduct?.price || 0);
  const numDealPrice = Number(dealPrice);
  const calculatedDiscount = originalPrice > 0 && numDealPrice > 0 && numDealPrice < originalPrice
    ? Math.round(((originalPrice - numDealPrice) / originalPrice) * 100)
    : 0;

  const fetchDeals = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('villex_vendor_token') : null);
      const res = await fetch('/api/flash-deals', {
        headers: {
          Authorization: `Bearer ${activeToken || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.deals)) {
          setDeals(data.deals);
        }
      }
    } catch (err) {
      console.warn('Failed to load flash deals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Set default dates on modal open (starts today, ends 7 days later)
  const handleOpenModal = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (approvedProducts.length > 0 && approvedProducts[0]) {
      setSelectedProductId(approvedProducts[0].id);
      const firstApproved = approvedProducts[0];
      if (firstApproved.variants && firstApproved.variants.length > 0 && firstApproved.variants[0]?.id) {
        setSelectedVariantId(firstApproved.variants[0].id);
      } else {
        setSelectedVariantId(firstApproved.id);
      }
    }
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setStartsAt(now.toISOString().slice(0, 16));
    setEndsAt(nextWeek.toISOString().slice(0, 16));
    setDealPrice('');
    setPromotionalStock('');
    setIsModalOpen(true);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedProductId || !selectedVariant) {
      setErrorMessage('Please select an approved product and variant.');
      return;
    }

    if (!numDealPrice || numDealPrice <= 0) {
      setErrorMessage('Please enter a valid deal price.');
      return;
    }

    if (numDealPrice >= originalPrice) {
      setErrorMessage(`Deal price (PKR ${numDealPrice}) must be lower than original price (PKR ${originalPrice}).`);
      return;
    }

    const stock = parseInt(promotionalStock, 10);
    if (isNaN(stock) || stock <= 0) {
      setErrorMessage('Promotional stock must be at least 1 unit.');
      return;
    }

    if (!startsAt || !endsAt) {
      setErrorMessage('Please select start and end dates.');
      return;
    }

    if (new Date(endsAt) <= new Date(startsAt)) {
      setErrorMessage('End date must be strictly after start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('villex_vendor_token') : null);
      const res = await fetch('/api/flash-deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken || ''}`
        },
        body: JSON.stringify({
          product_id: selectedProductId,
          variant_id: selectedVariant?.id || selectedProductId,
          deal_price: numDealPrice,
          promotional_stock: stock,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit flash deal proposal');
      }

      setSuccessMessage('Flash Deal proposal submitted successfully for administrator approval!');
      setIsModalOpen(false);
      fetchDeals();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting flash deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (dealId: string, action: 'PAUSE' | 'ACTIVATE' | 'CANCEL') => {
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('villex_vendor_token') : null);
      const res = await fetch('/api/flash-deals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken || ''}`
        },
        body: JSON.stringify({ id: dealId, action })
      });

      if (res.ok) {
        fetchDeals();
      }
    } catch (err) {
      console.warn('Action failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 border border-border/80 p-6 rounded-2xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">⚡</span>
            <h2 className="text-xl font-black tracking-tight text-foreground">Flash Deals Management</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create limited-time promotional deals with reserved inventory for administrator review and approval.
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          variant="primary"
          className="h-10 px-5 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
        >
          + Propose Flash Deal
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <span>✓</span> {successMessage}
        </div>
      )}

      {/* Deals Table */}
      <Card className="border border-border/80 overflow-hidden rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider border-b border-border">
              <tr>
                <th className="py-3.5 px-4">Product & Variant</th>
                <th className="py-3.5 px-4">Regular Price</th>
                <th className="py-3.5 px-4">Deal Price</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Stock (Promo / Sold)</th>
                <th className="py-3.5 px-4">Schedule</th>
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading your flash deals...</span>
                    </div>
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <span className="text-3xl block mb-2">⚡</span>
                    <strong className="block text-foreground text-sm font-bold">No Flash Deals Found</strong>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      You haven&apos;t submitted any Flash Deals yet. Propose special discounts for your approved products to increase sales velocity!
                    </p>
                  </td>
                </tr>
              ) : (
                deals.map((deal) => {
                  const product = deal.products;
                  const variant = deal.product_variants;
                  const origPrice = Number(variant?.price || 0);
                  const dPrice = Number(deal.deal_price || 0);
                  const discountPct = origPrice > 0 ? Math.round(((origPrice - dPrice) / origPrice) * 100) : 0;
                  const imagesObj = (product?.images as any) || { main: '' };
                  const image = imagesObj.main || (Array.isArray(imagesObj) ? imagesObj[0] : '') || '';

                  return (
                    <tr key={deal.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {image && (
                            <img src={image} alt="" className="w-10 h-10 rounded-lg object-cover bg-secondary/50 border border-border" />
                          )}
                          <div>
                            <span className="font-bold text-foreground block line-clamp-1">{product?.name || 'Unknown Product'}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              SKU: {variant?.sku || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground line-through">
                        PKR {origPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-primary">
                        PKR {dPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-destructive/15 text-destructive font-black text-[10px] px-2 py-0.5 rounded uppercase">
                          -{discountPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-foreground">{deal.promotional_stock}</span>
                        <span className="text-muted-foreground"> / {deal.sold_count || 0} sold</span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-muted-foreground">
                        <div>From: {new Date(deal.starts_at).toLocaleDateString()}</div>
                        <div>To: {new Date(deal.ends_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        {deal.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                            ● Active Approved
                          </span>
                        )}
                        {deal.status === 'PENDING_APPROVAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            ⏱ Pending Review
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
                            ❚❚ Paused
                          </span>
                        )}
                        {deal.status === 'ENDED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-secondary text-muted-foreground border border-border">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {deal.status === 'APPROVED' && (
                            <Button
                              onClick={() => handleAction(deal.id, 'PAUSE')}
                              size="sm"
                              variant="ghost"
                              className="text-[10px] h-7 px-2 text-muted-foreground hover:text-foreground"
                            >
                              Pause
                            </Button>
                          )}
                          {deal.status === 'PAUSED' && (
                            <Button
                              onClick={() => handleAction(deal.id, 'ACTIVATE')}
                              size="sm"
                              variant="ghost"
                              className="text-[10px] h-7 px-2 text-emerald-500"
                            >
                              Resume
                            </Button>
                          )}
                          {(deal.status === 'PENDING_APPROVAL' || deal.status === 'PAUSED' || deal.status === 'APPROVED') && (
                            <Button
                              onClick={() => handleAction(deal.id, 'CANCEL')}
                              size="sm"
                              variant="ghost"
                              className="text-[10px] h-7 px-2 text-destructive hover:bg-destructive/10"
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

      {/* Create Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-lg font-black text-foreground">Propose New Flash Deal</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitProposal} className="space-y-4 text-xs font-semibold">
              {/* Product Select */}
              <div>
                <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px] font-black">
                  Select Approved Product *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = approvedProducts.find((prod) => prod.id === e.target.value);
                    if (p && p.variants && p.variants.length > 0 && p.variants[0]?.id) {
                      setSelectedVariantId(p.variants[0].id);
                    }
                  }}
                  className="w-full h-11 px-3 bg-secondary/35 border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                >
                  {approvedProducts.length === 0 ? (
                    <option value="">No approved products available</option>
                  ) : (
                    approvedProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (PKR {Number(p.price).toLocaleString()})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Variant Select if available */}
              {variants.length > 1 && (
                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px] font-black">
                    Select Variant *
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full h-11 px-3 bg-secondary/35 border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    {variants.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.name || v.sku} (Regular: PKR {Number(v.price).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price & Discount Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px] font-black">
                    Deal Price (PKR) * <span className="text-[10px] lowercase text-muted-foreground">(Reg: PKR {originalPrice.toLocaleString()})</span>
                  </label>
                  <Input
                    type="number"
                    placeholder={`e.g. ${Math.round(originalPrice * 0.8)}`}
                    value={dealPrice}
                    onChange={(e) => setDealPrice(e.target.value)}
                    className="h-11"
                    min="1"
                    max={originalPrice > 1 ? originalPrice - 1 : 1}
                    required
                  />
                  {calculatedDiscount > 0 && (
                    <span className="text-emerald-500 text-[10px] font-bold mt-1 block">
                      ★ {calculatedDiscount}% discount for customers
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px] font-black">
                    Promotional Stock Allocation *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 25"
                    value={promotionalStock}
                    onChange={(e) => setPromotionalStock(e.target.value)}
                    className="h-11"
                    min="1"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Reserved exclusively for this Flash Deal
                  </span>
                </div>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px] font-black">
                    Start Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px] font-black">
                    End Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="font-bold text-xs uppercase tracking-wider px-6 h-11 rounded-xl shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Proposal...' : 'Submit to Administrator'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
