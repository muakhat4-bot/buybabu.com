'use client';

import * as React from 'react';
import { Button, Input } from '@villex/ui';

interface CouponFormProps {
  onApplyCoupon: (discountPercent: number, code: string) => void;
  onRemoveCoupon: () => void;
  appliedCode: string;
}

export function CouponForm({ onApplyCoupon, onRemoveCoupon, appliedCode }: CouponFormProps) {
  const [inputCode, setInputCode] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formattedCode = inputCode.trim().toUpperCase();
    if (formattedCode === 'VILLEX20') {
      onApplyCoupon(20, 'VILLEX20');
      setInputCode('');
    } else if (formattedCode === '') {
      setErrorMsg('Please enter a coupon code.');
    } else {
      setErrorMsg('Invalid coupon code. Try "VILLEX20" for 20% off.');
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Have a promo code?</span>

      {appliedCode ? (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400">
          <div className="flex items-center gap-1.5 font-semibold">
            <span>✓ Coupon <strong>{appliedCode}</strong> Active (20% Off)</span>
          </div>
          <button onClick={onRemoveCoupon} className="font-extrabold hover:underline text-destructive/80 hover:text-destructive">
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. VILLEX20"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setErrorMsg(null);
              }}
              className={`h-9 text-xs bg-secondary/20 ${errorMsg ? 'border-destructive' : ''}`}
            />
            <Button type="submit" size="sm" className="h-9 text-xs font-semibold px-4 flex-shrink-0">
              Apply Code
            </Button>
          </div>
          {errorMsg && (
            <p className="text-[10px] text-destructive font-bold flex items-center gap-1 animate-pulse">
              ⚠️ {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
