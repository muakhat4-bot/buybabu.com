'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

import { ProductOption, ProductVariant } from './product-form';

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
  options?: ProductOption[];
  variants?: ProductVariant[];
  approvalStatus?: string;
  rejectionReason?: string;
}

interface InventoryListProps {
  products: Product[];
  onRestock: (productId: string, amount: number) => void;
  onAddProduct?: () => void;
  onEditProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  isCompact?: boolean;
}

export function InventoryList({
  products,
  onRestock,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  isCompact = false,
}: InventoryListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [stockFilter, setStockFilter] = React.useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  const filteredProducts = products.filter((product) => {
    const stockVal = typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0;

    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStock = 
      stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && stockVal > 0 && stockVal <= 15) ||
      (stockFilter === 'OUT' && stockVal === 0);

    return matchesSearch && matchesStock;
  });

  const getStockStatus = (stock: number) => {
    const stockVal = typeof stock === 'number' && !isNaN(stock) ? stock : 0;
    if (stockVal === 0) {
      return (
        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
          Out of Stock
        </span>
      );
    }
    if (stockVal <= 15) {
      return (
        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
          Low Stock ({stockVal})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        In Stock ({stockVal})
      </span>
    );
  };

  const getApprovalStatusBadge = (product: Product) => {
    const status = product.approvalStatus || 'APPROVED';
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Live
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <div className="flex flex-col items-center space-y-0.5">
          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20" title={product.rejectionReason || 'No reason provided'}>
            Rejected
          </span>
          {product.rejectionReason && (
            <span className="text-[9px] text-destructive font-semibold max-w-[120px] truncate" title={product.rejectionReason}>
              {product.rejectionReason}
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
        Pending Review
      </span>
    );
  };

  return (
    <Card className="bg-card/50 border-border backdrop-blur-md">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-4 border-b border-border/60">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
              {isCompact ? 'Inventory Overview' : 'Inventory Control'}
            </CardTitle>
            {!isCompact && onAddProduct && (
              <Button
                onClick={onAddProduct}
                size="sm"
                variant="primary"
                className="text-[10px] font-black uppercase tracking-wider h-7 px-3.5 rounded-lg"
              >
                + Add Product
              </Button>
            )}
          </div>
          <CardDescription className="text-xs">
            Monitor product stocks, categories, and replenishment alerts.
          </CardDescription>
        </div>
        {!isCompact && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative max-w-xs">
              <Input
                placeholder="Search products or SKU..."
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
              {(['ALL', 'LOW', 'OUT'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStockFilter(filter)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                    stockFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter === 'ALL' ? 'All Items' : filter === 'LOW' ? 'Low Stock' : 'Out of Stock'}
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
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6">Product Name</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6 text-right">Price</th>
              <th className="py-3 px-6 text-center">Stock Level</th>
              <th className="py-3 px-6">Stock Status</th>
              <th className="py-3 px-6 text-center">Approval Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-bold">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/10 transition-colors duration-150">
                  <td className="py-4 px-6 font-mono font-bold text-foreground">
                    {product.sku}
                  </td>
                  <td className="py-4 px-6 font-semibold text-foreground">
                    {product.name}
                  </td>
                  <td className="py-4 px-6 text-muted-foreground font-medium">
                    {product.category}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-foreground">
                    <div className="flex flex-col items-end">
                      <span>PKR {product.price.toLocaleString()}</span>
                      {product.oldPrice && (
                        <span className="text-[10px] text-muted-foreground line-through font-semibold">
                          PKR {product.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-bold font-mono text-foreground">
                    {typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0}
                  </td>
                  <td className="py-4 px-6">
                    {getStockStatus(typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getApprovalStatusBadge(product)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {!isCompact && onEditProduct && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditProduct(product.id)}
                          className="text-[10px] font-black uppercase tracking-wider h-7 px-3 rounded-lg border border-border/60 hover:bg-secondary/50 transition-all duration-150"
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onRestock(product.id, 10)}
                        className="text-[10px] font-black uppercase tracking-wider h-7 px-3 rounded-lg border border-border/60 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all duration-200"
                      >
                        +10 Restock
                      </Button>
                      {!isCompact && onDeleteProduct && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className="text-[10px] font-black uppercase tracking-wider h-7 px-3 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-150"
                        >
                          Delete
                        </Button>
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
  );
}
