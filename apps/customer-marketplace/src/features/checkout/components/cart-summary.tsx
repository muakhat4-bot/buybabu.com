'use client';

import * as React from 'react';
import { Button, Card } from '@villex/ui';
import Link from 'next/link';

interface CartSummaryProps {
  subtotal: number;
  discountPercent: number;
  shippingFee: number;
  couponCode: string;
}

export function CartSummary({
  subtotal,
  discountPercent,
  shippingFee,
  couponCode,
}: CartSummaryProps) {
  //Urgency Timer State: 15 minutes (900 seconds)
  const [secondsLeft, setSecondsLeft] = React.useState(900);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formatTimer = () => {
    const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const secs = (secondsLeft % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const discountVal = Math.round(subtotal * (discountPercent / 100));
  const totalVal = subtotal - discountVal + shippingFee;

  return (
    <Card className="p-6 border-border bg-card/10 space-y-6 lg:sticky lg:top-24">
      {/* 1. Urgency Counter Clock */}
      {secondsLeft > 0 ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 flex items-center justify-between font-bold animate-pulse-subtle">
          <span className="flex items-center gap-1.5">
            ⏱️ Cart reserved for you
          </span>
          <span className="font-mono text-sm">{formatTimer()}</span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center justify-between font-bold">
          <span>⚠️ Reservation Expired</span>
          <button onClick={() => setSecondsLeft(900)} className="underline hover:text-foreground">
            Renew
          </button>
        </div>
      )}

      {/* 2. Totals list */}
      <div className="space-y-3.5 border-b border-border pb-4 text-xs font-semibold text-muted-foreground">
        <div className="flex justify-between">
          <span>Cart Subtotal</span>
          <span className="text-foreground font-bold">PKR {subtotal.toLocaleString()}</span>
        </div>

        {discountVal > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Coupon ({couponCode})</span>
            <span>- PKR {discountVal.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Delivery Charges</span>
          <span className="text-foreground font-bold">
            PKR {shippingFee.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between border-t border-border pt-4 text-sm font-black text-foreground">
          <span>Order Total</span>
          <span className="text-primary font-mono text-lg">PKR {totalVal.toLocaleString()}</span>
        </div>
      </div>

      {/* 4. Secure CTA */}
      <div className="space-y-3">
        <Link href="/checkout" className="block w-full">
          <Button
            disabled={subtotal === 0}
            className="w-full h-11 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-xl shadow-primary/20 flex items-center justify-center gap-1.5"
          >
            <span>🔒 Proceed to Secure Checkout</span>
          </Button>
        </Link>
        
        <p className="text-[10px] text-center text-muted-foreground leading-normal max-w-[250px] mx-auto">
          By proceeding, your purchase funds are secured under Villex Escrow. Delivery is fully insured.
        </p>
      </div>

      {/* Escrow badge */}
      <div className="border-t border-border/50 pt-4 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
          🛡️ Escrow Guarantee Shield Active
        </span>
      </div>
    </Card>
  );
}
