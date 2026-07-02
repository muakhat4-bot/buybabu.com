'use client';

import * as React from 'react';
import { Button, Card } from '@villex/ui';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
}

interface CheckoutSummaryProps {
  items: CheckoutItem[];
  subtotal: number;
  discountPercent: number;
  shippingFee: number;
  submitting: boolean;
  onSubmit: () => void;
  couponCode: string;
}

export function CheckoutSummary({
  items,
  subtotal,
  discountPercent,
  shippingFee,
  submitting,
  onSubmit,
  couponCode,
}: CheckoutSummaryProps) {
  const discountVal = Math.round(subtotal * (discountPercent / 100));
  const totalVal = subtotal - discountVal + shippingFee;

  return (
    <Card className="p-6 border-border bg-card/10 space-y-6 lg:sticky lg:top-24">
      <h3 className="font-bold text-sm text-foreground uppercase tracking-wider border-b border-border pb-3 mb-4">
        Order Summary
      </h3>

      {/* Item list */}
      <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover bg-secondary/50 border border-border flex-shrink-0"
            />
            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-xs text-foreground truncate leading-snug">{item.name}</h4>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-0.5">
                <span>Qty: {item.quantity}</span>
                <span className="font-semibold text-foreground/80">PKR {item.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calculations */}
      <div className="space-y-3 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
        <div className="flex justify-between">
          <span>Subtotal ({items.length} items)</span>
          <span className="text-foreground font-bold">PKR {subtotal.toLocaleString()}</span>
        </div>

        {discountVal > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Coupon Discount ({couponCode})</span>
            <span>- PKR {discountVal.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping Charges</span>
          <span className="text-foreground font-bold">
            {shippingFee === 0 ? <strong className="text-emerald-400 font-extrabold uppercase">Free</strong> : `PKR ${shippingFee}`}
          </span>
        </div>

        <div className="flex justify-between border-t border-border pt-4 text-sm font-black text-foreground">
          <span>Order Total</span>
          <span className="text-primary font-mono text-lg">PKR {totalVal.toLocaleString()}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={submitting || items.length === 0}
        className="w-full h-11 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></div>
            Processing Order...
          </>
        ) : (
          <>
            <span>🔒 Place Escrow Order</span>
          </>
        )}
      </Button>

      {/* Secure badges */}
      <div className="space-y-2.5 text-[10px] text-muted-foreground leading-snug">
        <div className="flex items-center gap-1.5 justify-center">
          <span>🛡️ SSL Secured Gateway</span>
          <span>•</span>
          <span>Insured Logistics</span>
        </div>
      </div>
    </Card>
  );
}
