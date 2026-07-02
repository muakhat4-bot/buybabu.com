'use client';

import * as React from 'react';
import { Card } from '@villex/ui';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  spec?: string;
  stockCount: number;
}

interface CartItemRowProps {
  item: CartItem;
  onQtyChange: (id: string, newQty: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater: (item: CartItem) => void;
}

export function CartItemRow({ item, onQtyChange, onRemove, onSaveForLater }: CartItemRowProps) {

  return (
    <Card className="p-5 border-border hover:border-foreground/20 transition-all flex flex-col sm:flex-row gap-5 items-start">
      {/* Product Image */}
      <div className="w-20 h-20 bg-secondary/35 rounded-xl overflow-hidden flex-shrink-0 border border-border/60">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Product Details */}
      <div className="flex-grow min-w-0 space-y-2.5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.brand}</span>
            <h4 className="font-bold text-sm text-foreground line-clamp-1 leading-snug hover:text-primary transition-colors cursor-pointer">
              {item.name}
            </h4>
            {item.spec && <p className="text-xs text-muted-foreground mt-0.5">{item.spec}</p>}
          </div>
          <span className="text-sm font-black text-foreground text-right whitespace-nowrap">
            PKR {item.price.toLocaleString()}
          </span>
        </div>

        {/* Adjusters and links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1.5 border-t border-border/40">
          <div className="flex items-center space-x-3">
            {/* Quantity Selector */}
            <div className="flex items-center border border-border rounded-lg bg-secondary/20 h-8 overflow-hidden select-none">
              <button
                disabled={item.quantity <= 1}
                onClick={() => onQtyChange(item.id, item.quantity - 1)}
                className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 font-bold disabled:opacity-40 disabled:pointer-events-none"
              >
                —
              </button>
              <span className="w-9 text-center text-xs font-bold text-foreground">{item.quantity}</span>
              <button
                disabled={item.quantity >= item.stockCount}
                onClick={() => onQtyChange(item.id, item.quantity + 1)}
                className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 font-bold disabled:opacity-40 disabled:pointer-events-none"
              >
                +
              </button>
            </div>
            {item.stockCount <= 5 && (
              <span className="text-[10px] text-destructive font-bold animate-pulse">
                Only {item.stockCount} left!
              </span>
            )}
          </div>

          {/* Action links */}
          <div className="flex items-center space-x-3.5 text-xs font-semibold text-muted-foreground select-none">
            <button
              onClick={() => onSaveForLater(item)}
              className="hover:text-primary transition-colors"
            >
              Save for Later
            </button>
            <span>•</span>
            <button
              onClick={() => onRemove(item.id)}
              className="hover:text-destructive transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
