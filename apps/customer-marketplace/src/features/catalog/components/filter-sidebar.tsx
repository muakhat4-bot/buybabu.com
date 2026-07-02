'use client';

import * as React from 'react';
import { Button, Input } from '@villex/ui';

export interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  rating: string;
  freeShipping: boolean;
  expressDelivery: boolean;
  inStockOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  clearFilters: () => void;
}

export function FilterSidebar({ filters, updateFilters, clearFilters }: FilterSidebarProps) {
  const [minInput, setMinInput] = React.useState(filters.minPrice);
  const [maxInput, setMaxInput] = React.useState(filters.maxPrice);

  React.useEffect(() => {
    setMinInput(filters.minPrice);
    setMaxInput(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ minPrice: minInput, maxPrice: maxInput });
  };

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Smart gadgets', value: 'smart-gadgets' },
    { label: 'Apparels & Clothing', value: 'apparel' },
    { label: 'Mother & Baby care', value: 'baby-care' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Kitchen Essentials', value: 'kitchen' },
    { label: 'Bath Essentials', value: 'bath' },
    { label: 'Home Arrivals', value: 'home' },
    { label: 'Beauty and Cosmetics', value: 'beauty' },
    { label: 'Health & Fitness', value: 'fitness' },
    { label: 'Tools', value: 'tools' },
  ];

  const ratings = [
    { label: '4.5 ★ & above', value: '4.5' },
    { label: '4.0 ★ & above', value: '4.0' },
    { label: '3.5 ★ & above', value: '3.5' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
          </svg>
          Filters
        </h3>
        {(filters.category || filters.minPrice || filters.maxPrice || filters.rating || filters.freeShipping || filters.expressDelivery || filters.inStockOnly) && (
          <button onClick={clearFilters} className="text-xs text-primary font-bold hover:underline">
            Clear All
          </button>
        )}
      </div>

      {/* Categories group */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Product Category</span>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => updateFilters({ category: cat.value })}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range group */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Price Range (PKR)</span>
        <form onSubmit={handlePriceSubmit} className="space-y-2.5">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Min"
              type="number"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="h-8 text-xs bg-secondary/20"
            />
            <span className="text-muted-foreground text-xs font-bold">—</span>
            <Input
              placeholder="Max"
              type="number"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="h-8 text-xs bg-secondary/20"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full h-8 text-xs font-semibold">
            Apply Range
          </Button>
        </form>
      </div>

      {/* Rating group */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Customer Rating</span>
        <div className="space-y-1">
          {ratings.map((rate) => {
            const isSelected = filters.rating === rate.value;
            return (
              <button
                key={rate.value}
                onClick={() => updateFilters({ rating: rate.value })}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground border border-transparent'
                }`}
              >
                <span>{rate.label}</span>
                <span className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(parseFloat(rate.value)) ? 'fill-current' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shipping & Availability checkboxes */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Service & Availability</span>
        <div className="space-y-2">
          <label className="flex items-center space-x-2.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.freeShipping}
              onChange={(e) => updateFilters({ freeShipping: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-secondary/50"
            />
            <span>Free Shipping</span>
          </label>

          <label className="flex items-center space-x-2.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.expressDelivery}
              onChange={(e) => updateFilters({ expressDelivery: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-secondary/50"
            />
            <span>Express Shipping</span>
          </label>

          <label className="flex items-center space-x-2.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => updateFilters({ inStockOnly: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-secondary/50"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>
    </div>
  );
}
