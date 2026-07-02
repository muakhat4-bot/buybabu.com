'use client';

import * as React from 'react';
import { Button, Card, Input } from '@villex/ui';

export function DeliveryEstimator() {
  const [zip, setZip] = React.useState('44000');
  const [estimate, setEstimate] = React.useState({
    express: 'Express Shipping: Arrives tomorrow, June 15',
    standard: 'Standard Shipping: Arrives June 17',
    cod: 'Cash on Delivery (COD) Available',
    location: 'Islamabad Capital Territory',
  });

  const handleZipCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip === '44000') {
      setEstimate({
        express: 'Express Shipping: Arrives tomorrow, June 15',
        standard: 'Standard Shipping: Arrives June 17',
        cod: 'Cash on Delivery (COD) Available',
        location: 'Islamabad Capital Territory',
      });
    } else if (zip.startsWith('75') || zip === '75000') {
      setEstimate({
        express: 'Express Shipping: Arrives June 17 (PKR 350)',
        standard: 'Standard Shipping: Arrives June 19 (FREE)',
        cod: 'Cash on Delivery (COD) Available',
        location: 'Karachi, Sindh',
      });
    } else if (zip.startsWith('54') || zip === '54000') {
      setEstimate({
        express: 'Express Shipping: Arrives June 16 (PKR 250)',
        standard: 'Standard Shipping: Arrives June 18 (FREE)',
        cod: 'Cash on Delivery (COD) Available',
        location: 'Lahore, Punjab',
      });
    } else {
      setEstimate({
        express: 'Express Shipping: Not available for this location',
        standard: 'Standard Shipping: Arrives in 3-5 business days',
        cod: 'COD available on orders below PKR 20,000',
        location: `Postal Zone ${zip}`,
      });
    }
  };

  return (
    <Card className="p-5 border-border bg-card/20">
      <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Delivery Options & Rates
      </h3>

      {/* Zip code input form */}
      <form onSubmit={handleZipCheck} className="flex gap-2 mb-4">
        <Input
          placeholder="Enter Zip Code"
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          className="h-9 text-xs bg-secondary/20 border-border"
          required
        />
        <Button type="submit" size="sm" className="h-9 text-xs font-semibold px-4 flex-shrink-0">
          Check Options
        </Button>
      </form>

      {/* Estimates list */}
      <div className="space-y-3.5 text-xs">
        {estimate.location && (
          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
            <span>Delivering to:</span>
            <span className="text-foreground">{estimate.location}</span>
          </div>
        )}

        <div className="border-t border-border/50 pt-3 space-y-2.5">
          <div className="flex items-start gap-2 text-foreground">
            <span className="text-sm">🚚</span>
            <div>
              <span className="font-bold block">{estimate.standard}</span>
              <span className="text-[10px] text-muted-foreground">Standard Delivery charges: FREE on orders over PKR 2,000</span>
            </div>
          </div>

          {estimate.express.includes('Arrives') && (
            <div className="flex items-start gap-2 text-foreground">
              <span className="text-sm">⚡</span>
              <div>
                <span className="font-bold block text-amber-500">{estimate.express}</span>
                <span className="text-[10px] text-muted-foreground">Express logistics dispatched within 2 hours</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-foreground">
            <span className="text-sm">💵</span>
            <div>
              <span className="font-bold block">{estimate.cod}</span>
              <span className="text-[10px] text-muted-foreground">Pay at your doorstep after parcel inspection</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
