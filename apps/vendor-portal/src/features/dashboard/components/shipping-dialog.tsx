'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

interface ShippingDialogProps {
  orderId: string;
  onConfirm: (carrier: string, trackingNumber: string) => void;
  onClose: () => void;
}

const CARRIERS = [
  'TCS Courier',
  'Leopards Express',
  'BlueEx Courier',
  'Pakistan Post Speed Logix',
];

export function ShippingDialog({ orderId, onConfirm, onClose }: ShippingDialogProps) {
  const [carrier, setCarrier] = React.useState(CARRIERS[0] || 'TCS Courier');
  const [trackingNumber, setTrackingNumber] = React.useState('');

  // Auto-generate mock tracking code on mount
  React.useEffect(() => {
    const rand = Math.floor(100000000 + Math.random() * 900000000);
    setTrackingNumber(`VLX-TRK-${rand}`);
  }, [orderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (carrier && trackingNumber.trim()) {
      onConfirm(carrier, trackingNumber.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl animate-scale-in">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-black uppercase tracking-wider text-foreground">
              Dispatch Shipping Details
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <CardDescription className="text-xs">
            Log carrier details for Order <span className="font-mono font-bold text-primary">{orderId}</span> to dispatch shipment.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Shipping Carrier / Courier Service
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-xs font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
              >
                {CARRIERS.map((c) => (
                  <option key={c} value={c} className="bg-background text-foreground">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Tracking Number Reference
              </label>
              <Input
                placeholder="e.g. TRK-8910238"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
                className="font-mono text-xs font-bold"
              />
            </div>
            
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 flex items-start space-x-2.5">
              <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                Confirming dispatch will automatically email the tracking number to the buyer and release funds to escrow verification hold.
              </p>
            </div>
          </CardContent>
          <div className="flex items-center justify-end space-x-2 p-6 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-[10px] font-black uppercase tracking-wider h-9 px-4 rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="text-[10px] font-black uppercase tracking-wider h-9 px-5 rounded-xl"
            >
              Confirm Dispatch
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
