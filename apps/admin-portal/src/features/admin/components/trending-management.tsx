'use client';

import * as React from 'react';
import { Button, Card, Input } from '@villex/ui';
import { Product } from './product-management';

interface TrendingManagementProps {
  products: Product[];
}

export function TrendingManagement({ products }: TrendingManagementProps) {
  const [trendingItems, setTrendingItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Add form state
  const [selectedProductId, setSelectedProductId] = React.useState('');
  const [displayOrder, setDisplayOrder] = React.useState('1');
  const [priority, setPriority] = React.useState('NORMAL');
  const [productSearch, setProductSearch] = React.useState('');

  const getAdminToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('villex_admin_token') || sessionStorage.getItem('villex_admin_token');
    }
    return null;
  };

  const fetchTrendingItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAdminToken();
      const res = await fetch('/api/trending', {
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setTrendingItems(data.items);
        }
      }
    } catch (err) {
      console.warn('Failed to load trending items:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTrendingItems();
  }, [fetchTrendingItems]);

  // Filter approved products eligible for trending (not already added)
  const existingTrendingProductIds = React.useMemo(() => {
    return new Set(trendingItems.map((item) => item.product_id));
  }, [trendingItems]);

  const eligibleProducts = React.useMemo(() => {
    return products
      .filter((p) => p.approvalStatus === 'APPROVED' || !p.approvalStatus)
      .filter((p) => !existingTrendingProductIds.has(p.id))
      .filter((p) => {
        if (!productSearch.trim()) return true;
        const q = productSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
      });
  }, [products, existingTrendingProductIds, productSearch]);

  const handleOpenAddModal = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setProductSearch('');
    setDisplayOrder(String(trendingItems.length + 1));
    setPriority('NORMAL');
    if (eligibleProducts.length > 0 && eligibleProducts[0]) {
      setSelectedProductId(eligibleProducts[0].id);
    } else {
      setSelectedProductId('');
    }
    setIsAddModalOpen(true);
  };

  const handleAddTrendingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedProductId) {
      setErrorMessage('Please select a product to curate into Trending Items.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getAdminToken();
      const res = await fetch('/api/trending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          product_id: selectedProductId,
          display_order: parseInt(displayOrder || '1', 10),
          priority
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add product to Trending Items');
      }

      setSuccessMessage('Product curated into Trending Items successfully!');
      setIsAddModalOpen(false);
      fetchTrendingItems();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error curating trending product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: any) => {
    try {
      const token = getAdminToken();
      await fetch('/api/trending', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          id: item.id,
          is_active: !item.is_active
        })
      });
      fetchTrendingItems();
    } catch (err) {
      console.warn('Toggle failed:', err);
    }
  };

  const handleOrderChange = async (item: any, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 1) return;
    try {
      const token = getAdminToken();
      await fetch('/api/trending', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          id: item.id,
          display_order: newOrder
        })
      });
      fetchTrendingItems();
    } catch (err) {
      console.warn('Update order failed:', err);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from Trending Items?')) return;
    try {
      const token = getAdminToken();
      await fetch(`/api/trending?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      });
      fetchTrendingItems();
    } catch (err) {
      console.warn('Remove failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 border border-border/80 p-6 rounded-2xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🔥</span>
            <h2 className="text-xl font-black tracking-tight text-foreground">Trending Items Merchandising</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Super-Admin controlled merchandising feed displayed on the Customer Marketplace homepage. Products on active Flash Deals are strictly prohibited.
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          className="h-10 px-5 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
        >
          + Curate Product to Trending
        </Button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <span>✓</span> {successMessage}
        </div>
      )}

      {/* Trending Items Table */}
      <Card className="border border-border/80 overflow-hidden rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider border-b border-border">
              <tr>
                <th className="py-3.5 px-4 w-20 text-center">Display Order</th>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Priority Badge</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading curated trending items...</span>
                    </div>
                  </td>
                </tr>
              ) : trendingItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <span className="text-3xl block mb-2">🔥</span>
                    <strong className="block text-foreground text-sm font-bold">No Trending Products Curated</strong>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Trending items are manually curated by Super Admin. Click &ldquo;Curate Product to Trending&rdquo; to handpick featured catalog items!
                    </p>
                  </td>
                </tr>
              ) : (
                trendingItems.map((item) => {
                  const product = item.products;
                  const imagesObj = (product?.images as any) || { main: '' };
                  const image = imagesObj.main || (Array.isArray(imagesObj) ? imagesObj[0] : '') || '';
                  const variant = product?.product_variants?.[0];
                  const price = Number(variant?.price || product?.price || 0);

                  return (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          defaultValue={item.display_order}
                          onBlur={(e) => handleOrderChange(item, parseInt(e.target.value, 10))}
                          className="w-14 h-8 text-center bg-secondary/40 border border-input rounded-lg font-bold text-xs"
                          min="1"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {image && (
                            <img src={image} alt="" className="w-10 h-10 rounded-lg object-cover bg-secondary/50 border border-border shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-foreground block line-clamp-1">{product?.name || 'Product'}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{product?.brand || 'Generic'} • {product?.categories?.name || 'Category'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground block">{product?.vendors?.store_name || 'Vendor'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        PKR {price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.priority === 'URGENT'
                            ? 'bg-destructive/15 text-destructive'
                            : item.priority === 'HIGH'
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-primary/15 text-primary'
                        }`}>
                          {item.priority || 'NORMAL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                            item.is_active
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                          {item.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => handleRemove(item.id)}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2.5 text-[10px] text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Curate Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <h3 className="text-base font-black text-foreground">Curate Product into Trending</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold p-1 text-lg"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddTrendingItem} className="space-y-4 text-xs font-semibold">
              {/* Product Search & Dropdown */}
              <div>
                <label className="block text-muted-foreground mb-1 uppercase tracking-wider text-[10px] font-black">
                  Search & Select Approved Product *
                </label>
                <Input
                  type="text"
                  placeholder="Filter by title, brand, or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="h-9 mb-2"
                />
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-11 px-3 bg-secondary/35 border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  required
                >
                  {eligibleProducts.length === 0 ? (
                    <option value="">No matching eligible products available</option>
                  ) : (
                    eligibleProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand || 'Generic'} - PKR {Number(p.price).toLocaleString()})
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Only approved, published products without active Flash Deals can be selected.
                </span>
              </div>

              {/* Display Order & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1 uppercase tracking-wider text-[10px] font-black">
                    Display Priority Order *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="h-10"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">1 = First position</span>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 uppercase tracking-wider text-[10px] font-black">
                    Priority Tier
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-10 px-3 bg-secondary/35 border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent / Top Feature</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="font-bold text-xs uppercase tracking-wider px-5 h-10 rounded-xl shadow-md"
                  disabled={isSubmitting || !selectedProductId}
                >
                  {isSubmitting ? 'Curating...' : 'Publish to Trending'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
