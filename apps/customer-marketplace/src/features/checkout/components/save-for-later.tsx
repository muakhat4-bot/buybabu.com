'use client';

import * as React from 'react';
import { Card } from '@villex/ui';
import { CartItem } from './cart-item-row';

interface SaveForLaterProps {
  savedItems: CartItem[];
  onMoveToCart: (item: CartItem) => void;
  onRemove: (id: string) => void;
}

export function SaveForLater({ savedItems, onMoveToCart, onRemove }: SaveForLaterProps) {
  if (savedItems.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-border/60">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
          <span>📁 Saved for Later</span>
          <span className="text-[10px] bg-secondary text-muted-foreground font-bold px-2 py-0.5 rounded-full">
            {savedItems.length} items
          </span>
        </h3>
        <p className="text-[10px] text-muted-foreground font-semibold">These items are saved but excluded from checkout subtotal.</p>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {savedItems.map((item) => (
          <Card
            key={item.id}
            className="p-4 bg-secondary/10 border-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between opacity-85 hover:opacity-100 transition-opacity"
          >
            <div className="flex gap-3.5 items-center">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-secondary/40 border border-border flex-shrink-0" />
              <div>
                <span className="text-[9px] text-muted-foreground uppercase font-bold block">{item.brand}</span>
                <h4 className="font-bold text-xs text-foreground line-clamp-1 leading-snug">{item.name}</h4>
                <span className="text-xs text-primary font-bold block mt-0.5">PKR {item.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 flex-shrink-0 text-xs font-semibold select-none">
              <button
                onClick={() => onMoveToCart(item)}
                className="text-primary hover:underline"
              >
                Move to Cart
              </button>
              <span className="text-muted-foreground/60">•</span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
