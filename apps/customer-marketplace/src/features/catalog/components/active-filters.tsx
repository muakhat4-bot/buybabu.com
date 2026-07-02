'use client';

import * as React from 'react';
import { FilterState } from './filter-sidebar';

interface ActiveFiltersProps {
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  clearFilters: () => void;
}

export function ActiveFilters({ filters, updateFilters, clearFilters }: ActiveFiltersProps) {
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'electronics': return 'Electronics & Audio';
      case 'apparel': return 'Fashion & Apparel';
      case 'beauty': return 'Beauty & Cosmetics';
      case 'home': return 'Home & Living';
      case 'sports': return 'Sports & Outdoors';
      case 'groceries': return 'Groceries & Foods';
      default: return cat;
    }
  };

  const activeChips: { id: keyof FilterState; label: string; resetValue: string | boolean }[] = [];

  if (filters.category) {
    activeChips.push({
      id: 'category',
      label: `Category: ${getCategoryLabel(filters.category)}`,
      resetValue: '',
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `PKR ${parseInt(filters.minPrice).toLocaleString()}` : '0';
    const max = filters.maxPrice ? `PKR ${parseInt(filters.maxPrice).toLocaleString()}` : 'Max';
    activeChips.push({
      id: 'minPrice',
      label: `Price: ${min} - ${max}`,
      resetValue: '',
    });
  }

  if (filters.rating) {
    activeChips.push({
      id: 'rating',
      label: `Rating: ${filters.rating}★ & above`,
      resetValue: '',
    });
  }

  if (filters.freeShipping) {
    activeChips.push({
      id: 'freeShipping',
      label: 'Free Shipping',
      resetValue: false,
    });
  }

  if (filters.expressDelivery) {
    activeChips.push({
      id: 'expressDelivery',
      label: 'Express Shipping',
      resetValue: false,
    });
  }

  if (filters.inStockOnly) {
    activeChips.push({
      id: 'inStockOnly',
      label: 'In Stock Only',
      resetValue: false,
    });
  }

  const handleDismissChip = (chip: typeof activeChips[0]) => {
    if (chip.id === 'minPrice') {
      updateFilters({ minPrice: '', maxPrice: '' });
    } else {
      updateFilters({ [chip.id]: chip.resetValue });
    }
  };

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in">
      <span className="text-xs text-muted-foreground font-semibold">Active:</span>
      {activeChips.map((chip, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/60 border border-border text-xs text-foreground font-medium"
        >
          {chip.label}
          <button
            onClick={() => handleDismissChip(chip)}
            className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary font-bold transition-colors ml-1">
        Clear All
      </button>
    </div>
  );
}
