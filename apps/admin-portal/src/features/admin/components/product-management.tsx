'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  stock: number;
  description?: string;
  images?: string[];
  options?: any[];
  variants?: any[];
  storeId: string;
  storeName: string;
  approvalStatus?: string;
  rejectionReason?: string;
}

interface ProductManagementProps {
  products: Product[];
  onApproveProduct: (id: string) => void;
  onRejectProduct: (id: string, reason: string) => void;
}

export function ProductManagement({
  products,
  onApproveProduct,
  onRejectProduct,
}: ProductManagementProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  // Drawer and Dialog state
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [rejectingProductId, setRejectingProductId] = React.useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = React.useState('');
  const [customRejectionReason, setCustomRejectionReason] = React.useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.storeName.toLowerCase().includes(searchTerm.toLowerCase());

    const status = p.approvalStatus || 'APPROVED';
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && status === 'PENDING') ||
      (statusFilter === 'APPROVED' && status === 'APPROVED') ||
      (statusFilter === 'REJECTED' && status === 'REJECTED');

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    const activeStatus = status || 'APPROVED';
    switch (activeStatus) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Approved & Live
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (id: string) => {
    onApproveProduct(id);
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(prev => prev ? { ...prev, approvalStatus: 'APPROVED' } : null);
    }
  };

  const handleRejectSubmit = () => {
    if (!rejectingProductId) return;
    const finalReason = rejectionReasonInput === 'OTHER' ? customRejectionReason : rejectionReasonInput;
    if (!finalReason.trim()) return;

    onRejectProduct(rejectingProductId, finalReason.trim());
    
    if (selectedProduct && selectedProduct.id === rejectingProductId) {
      setSelectedProduct(prev => prev ? { ...prev, approvalStatus: 'REJECTED', rejectionReason: finalReason.trim() } : null);
    }

    setRejectingProductId(null);
    setRejectionReasonInput('');
    setCustomRejectionReason('');
  };

  const REJECTION_PRESETS = [
    'Low-quality/blurry product images',
    'Incomplete product specifications or description',
    'Suspected replica/counterfeit item',
    'Incorrect category or taxonomy classification',
    'Pricing discrepancy/misleading information',
  ];

  return (
    <Card className="bg-card/50 border-border backdrop-blur-md relative">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-4 border-b border-border/60">
        <div>
          <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
            Product Approvals & Review
          </CardTitle>
          <CardDescription className="text-xs">
            Review uploaded vendor catalog listings, approve products to go live, or reject/take down violations.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs">
            <Input
              placeholder="Search by name, SKU or store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 text-xs font-semibold pl-8"
            />
            <span className="absolute left-2.5 top-3 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-secondary/30 rounded-lg p-1 border border-border">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                  statusFilter === filter
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'PENDING' ? 'Pending Review' : filter === 'APPROVED' ? 'Live' : 'Rejected'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-6">SKU Reference</th>
              <th className="py-3 px-6">Product Details</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Price (PKR)</th>
              <th className="py-3 px-6">Vendor Store</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-bold">
                  No products awaiting audit matching filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/10 transition-colors duration-150">
                  <td className="py-4 px-6 font-mono font-bold text-foreground">
                    {product.sku}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/35 border border-border flex items-center justify-center shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain p-0.5" />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate max-w-[200px]" title={product.name}>
                          {product.name}
                        </p>
                        <span className="text-[9px] text-muted-foreground font-semibold">Stock: {product.stock} units</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                    {product.category}
                  </td>
                  <td className="py-4 px-6 font-black text-foreground">
                    <div className="flex flex-col">
                      <span>PKR {product.price.toLocaleString()}</span>
                      {product.oldPrice && (
                        <span className="text-[9px] text-muted-foreground line-through font-semibold">
                          PKR {product.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-primary">
                    {product.storeName}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(product.approvalStatus)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProduct(product)}
                        className="text-[9px] font-black uppercase tracking-wider h-7 px-3 rounded-lg border border-border/60 hover:bg-secondary/50"
                      >
                        Inspect
                      </Button>
                      {(product.approvalStatus || 'APPROVED') === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApprove(product.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 border-none text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectingProductId(product.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-3 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>

      {/* Side Drawer Details */}
      {selectedProduct && (
        <div className="fixed inset-0 z-40 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-card border-l border-border h-full flex flex-col justify-between shadow-2xl relative animate-slide-in overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-border/60 flex items-center justify-between sticky top-0 bg-card z-10">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  SKU: {selectedProduct.sku}
                </span>
                <h3 className="text-base font-black uppercase tracking-wider text-foreground mt-0.5">
                  Product Audit Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors bg-secondary/30 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 flex-grow">
              {/* Image & Main Info */}
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary/45 border border-border flex items-center justify-center shrink-0">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="max-w-full max-h-full object-contain p-1" />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="space-y-1.5 min-w-0">
                  <h4 className="font-bold text-sm text-foreground leading-snug break-words">
                    {selectedProduct.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-bold">{selectedProduct.storeName}</span>
                    <span>•</span>
                    <span className="text-xs text-muted-foreground font-semibold uppercase">{selectedProduct.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-foreground">PKR {selectedProduct.price.toLocaleString()}</span>
                    {selectedProduct.oldPrice && (
                      <span className="text-xs text-muted-foreground line-through">PKR {selectedProduct.oldPrice.toLocaleString()}</span>
                    )}
                    {getStatusBadge(selectedProduct.approvalStatus)}
                  </div>
                </div>
              </div>

              {/* Specs & Description */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Product Description
                </h5>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedProduct.description || 'No description provided.'}
                </p>
              </div>

              {/* Specifications / Specs Table */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Technical Specifications & Stock
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="border border-border/60 bg-secondary/15 rounded-xl p-3">
                    <span className="text-muted-foreground font-semibold block text-[10px] uppercase">Base Stock</span>
                    <span className="font-bold text-foreground text-sm">{selectedProduct.stock} units</span>
                  </div>
                  <div className="border border-border/60 bg-secondary/15 rounded-xl p-3">
                    <span className="text-muted-foreground font-semibold block text-[10px] uppercase">Discount Applied</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedProduct.discount ? `${selectedProduct.discount}% OFF` : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Images Grid if multiple */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                    Image Gallery ({selectedProduct.images.length})
                  </h5>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.images.map((img, i) => (
                      <div key={i} className="aspect-square bg-secondary/35 border border-border rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={img} alt="Gallery" className="max-w-full max-h-full object-contain p-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Details if Rejected */}
              {(selectedProduct.approvalStatus || 'APPROVED') === 'REJECTED' && selectedProduct.rejectionReason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-destructive block">
                    Rejection Audit Reason
                  </span>
                  <p className="text-xs text-destructive font-semibold">
                    &ldquo;{selectedProduct.rejectionReason}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Footer Audit Controls */}
            <div className="p-6 border-t border-border/60 flex items-center gap-3 sticky bottom-0 bg-card z-10">
              {(selectedProduct.approvalStatus || 'APPROVED') === 'PENDING' ? (
                <>
                  <Button
                    onClick={() => setRejectingProductId(selectedProduct.id)}
                    variant="outline"
                    className="flex-1 text-[10px] font-black uppercase tracking-wider border-destructive/40 text-destructive hover:bg-destructive/10 h-11 rounded-xl"
                  >
                    Reject Product
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedProduct.id)}
                    variant="primary"
                    className="flex-1 text-[10px] font-black uppercase tracking-wider h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-none text-white"
                  >
                    Approve & Push Live
                  </Button>
                </>
              ) : (selectedProduct.approvalStatus || 'APPROVED') === 'REJECTED' ? (
                <Button
                  onClick={() => handleApprove(selectedProduct.id)}
                  variant="primary"
                  className="w-full text-[10px] font-black uppercase tracking-wider h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-none text-white"
                >
                  Override Approval & Push Live
                </Button>
              ) : (
                <Button
                  onClick={() => setRejectingProductId(selectedProduct.id)}
                  variant="outline"
                  className="w-full text-[10px] font-black uppercase tracking-wider border-destructive/40 text-destructive hover:bg-destructive/10 h-11 rounded-xl"
                >
                  Suspend / Take Down Product
                </Button>
              )}
            </div>
          </div>
          <div className="flex-grow" onClick={() => setSelectedProduct(null)} />
        </div>
      )}

      {/* Reject Reason Dialog Modal */}
      {rejectingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-card border-border shadow-2xl animate-scale-in">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">
                Provide Rejection Audit Reason
              </CardTitle>
              <CardDescription className="text-[11px]">
                State why this product catalog upload request was declined. This reason will be visible to the vendor.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Select Quick Reason
                </label>
                <select
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-xs font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                >
                  <option value="" disabled className="bg-background text-muted-foreground">-- Select Audit Preset Reason --</option>
                  {REJECTION_PRESETS.map((preset) => (
                    <option key={preset} value={preset} className="bg-background text-foreground">
                      {preset}
                    </option>
                  ))}
                  <option value="OTHER" className="bg-background text-foreground">Other / Write Custom Reason</option>
                </select>
              </div>

              {rejectionReasonInput === 'OTHER' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground animate-fade-in">
                    Write Custom Reason
                  </label>
                  <textarea
                    placeholder="Enter specific audit details (e.g. replica branding details, CNIC mismatch etc)..."
                    value={customRejectionReason}
                    onChange={(e) => setCustomRejectionReason(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-xs font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 animate-fade-in"
                  />
                </div>
              )}
            </CardContent>
            <div className="flex items-center justify-end space-x-2 p-6 pt-0 border-t border-border/40 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectingProductId(null);
                  setRejectionReasonInput('');
                  setCustomRejectionReason('');
                }}
                className="text-[10px] font-black uppercase tracking-wider h-9 px-4 rounded-xl border-border"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleRejectSubmit}
                disabled={
                  !rejectionReasonInput ||
                  (rejectionReasonInput === 'OTHER' && !customRejectionReason.trim())
                }
                className="text-[10px] font-black uppercase tracking-wider h-9 px-5 rounded-xl bg-destructive hover:bg-destructive/90 border-none text-white"
              >
                Decline Upload
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
