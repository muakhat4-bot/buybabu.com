'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, Button } from '@villex/ui';
import { useCart } from '@/features/checkout/context/cart-context';

export default function FlashDealsPage() {
  const [deals, setDeals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const { addToCart } = useCart();

  // Countdown timer state
  const [timeLeft, setTimeLeft] = React.useState({ hours: 12, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch('/api/merchandising/flash-deals');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDeals(data);

            // If we have deals, calculate nearest expiration
            if (data.length > 0 && data[0].endsAt) {
              const endsTime = new Date(data[0].endsAt).getTime();
              const diffMs = Math.max(0, endsTime - Date.now());
              const totalSec = Math.floor(diffMs / 1000);
              const hours = Math.floor(totalSec / 3600);
              const minutes = Math.floor((totalSec % 3600) / 60);
              const seconds = totalSec % 60;
              setTimeLeft({ hours, minutes, seconds });
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching flash deals:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeals();
  }, []);

  // Live countdown interval
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const handleClaimDeal = (deal: any) => {
    addToCart({
      id: deal.variantId || deal.productId,
      name: deal.name,
      price: deal.price,
      image: deal.image,
      brand: deal.brand,
      spec: 'Flash Deal Special',
      stockCount: deal.remainingStock || deal.promotionalStock || 10
    });
    setToastMessage(`Flash Deal "${deal.name}" added to cart at PKR ${deal.price.toLocaleString()}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-primary text-primary-foreground shadow-2xl border border-primary/20 flex items-center gap-2 animate-slide-up text-sm font-semibold">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-primary/10 via-destructive/5 to-primary/10 border-b border-border py-12">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-bold uppercase tracking-wider mb-4">
            <span className="animate-ping inline-flex h-2 w-2 rounded-full bg-destructive opacity-75"></span>
            Limited Time Offers
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            ⚡ Flash Deals & Exclusive Discounts
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-6">
            Hand-picked deals approved by BuyBabu with verified discounts and reserved promotional inventory.
          </p>

          {/* Live Countdown Box */}
          <div className="inline-flex items-center gap-3 bg-card border border-border/80 px-6 py-3 rounded-2xl shadow-sm">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Deals End In:</span>
            <div className="flex items-center gap-1.5 font-mono text-base font-extrabold text-destructive">
              <span className="bg-destructive/10 px-2.5 py-1 rounded-lg border border-destructive/20">{formatNumber(timeLeft.hours)}h</span>:
              <span className="bg-destructive/10 px-2.5 py-1 rounded-lg border border-destructive/20">{formatNumber(timeLeft.minutes)}m</span>:
              <span className="bg-destructive/10 px-2.5 py-1 rounded-lg border border-destructive/20">{formatNumber(timeLeft.seconds)}s</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content / Deals Grid */}
      <main className="flex-1 container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-border p-4 h-96 animate-pulse bg-secondary/20 flex flex-col justify-between">
                <div className="h-48 bg-secondary/40 rounded-xl mb-4"></div>
                <div className="h-4 bg-secondary/40 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-secondary/40 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-secondary/40 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16 px-4 bg-card rounded-3xl border border-border shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl">
              ⚡
            </div>
            <h2 className="text-xl font-bold mb-2">No Active Flash Deals</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Our marketplace vendors frequently submit new promotional deals for administrator verification. Please check back soon or explore our newest catalog arrivals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="secondary" className="w-full sm:w-auto">Return Home</Button>
              </Link>
              <Link href="/search">
                <Button variant="primary" className="w-full sm:w-auto">Explore All Products</Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Deals Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {deals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden flex flex-col group border border-border/80 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                {/* Image & Discount Badge */}
                <div className="relative aspect-square bg-secondary/35 overflow-hidden">
                  <Link href={`/product/${deal.productId}`} className="block w-full h-full">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <span className="absolute top-2.5 right-2.5 bg-destructive text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
                    -{deal.discountPercentage}% OFF
                  </span>
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {deal.storeName || 'Verified Store'}
                  </span>
                </div>

                {/* Details */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{deal.brand || 'Generic'}</span>
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight mt-1 hover:text-primary transition-colors">
                      <Link href={`/product/${deal.productId}`}>{deal.name}</Link>
                    </h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-black text-primary">PKR {deal.price.toLocaleString()}</span>
                      {deal.originalPrice > deal.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          PKR {deal.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Promotional Stock Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                      <span>Claimed: {deal.soldPercent}%</span>
                      <span>Stock: {deal.remainingStock} left</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-destructive transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(5, deal.soldPercent)}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleClaimDeal(deal)}
                    variant="primary"
                    className="w-full h-10 font-bold text-xs uppercase tracking-wider"
                    disabled={deal.remainingStock <= 0}
                  >
                    {deal.remainingStock <= 0 ? 'Sold Out' : 'Claim Deal'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
