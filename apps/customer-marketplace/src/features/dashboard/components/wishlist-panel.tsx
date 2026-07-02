'use client';

import * as React from 'react';
import { Button, Card } from '@villex/ui';

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
}

export function WishlistPanel() {
  const [wishlist, setWishlist] = React.useState<WishlistItem[]>([
    {
      id: 'w-1',
      name: 'Sony WH-1000XM5 ANC Headset',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
      price: 68900,
      oldPrice: 85000,
      discount: 19,
      rating: 4.8,
      reviewsCount: 124,
      inStock: true,
    },
    {
      id: 'w-2',
      name: 'Mechanical Backlit Keyboard G-PRO',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
      price: 12500,
      oldPrice: 18000,
      discount: 30,
      rating: 4.6,
      reviewsCount: 89,
      inStock: true,
    },
    {
      id: 'w-3',
      name: 'Ultralight Ergo Wireless Gaming Mouse',
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80',
      price: 8900,
      rating: 4.9,
      reviewsCount: 45,
      inStock: false,
    },
  ]);

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveItem = (id: string, name: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    showToast(`Removed "${name}" from your wishlist.`);
  };

  const handleMoveToCart = (id: string, name: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    showToast(`Moved "${name}" to your shopping cart.`);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-primary text-primary-foreground shadow-2xl border border-primary/20 flex items-center gap-2 animate-slide-up text-sm font-semibold">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toastMessage}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Saved Wishlist</h2>
        <p className="text-sm text-muted-foreground mt-1">Products you&apos;ve bookmarked for later. Move them to your cart to checkout.</p>
      </div>

      {wishlist.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg">Your Wishlist is Empty</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">Browse the main marketplace catalogs to discover items and add them to your saved list.</p>
          <Button className="mt-6 font-semibold" onClick={() => window.location.href = '/'}>
            Start Shopping
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col group relative border-border">
              {/* Delete Icon Overlay */}
              <button
                onClick={() => handleRemoveItem(item.id, item.name)}
                className="absolute top-3 right-3 z-10 bg-background/80 hover:bg-destructive/15 text-muted-foreground hover:text-destructive p-1.5 rounded-full backdrop-blur transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Remove Item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Product Thumbnail */}
              <div className="relative aspect-video w-full bg-secondary/50 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Discount Badge */}
                {item.discount && (
                  <span className="absolute bottom-3 left-3 bg-destructive text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    -{item.discount}%
                  </span>
                )}

                {/* Stock Indicator */}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4 flex-grow flex flex-col">
                <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-tight flex-grow mb-1.5 hover:text-primary transition-colors cursor-pointer">
                  {item.name}
                </h4>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3 text-xs">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(item.rating) ? 'fill-current' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-bold text-foreground">{item.rating}</span>
                  <span className="text-muted-foreground">({item.reviewsCount})</span>
                </div>

                {/* Price block */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-base font-bold text-foreground">PKR {item.price.toLocaleString()}</span>
                  {item.oldPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      PKR {item.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Add to Cart Actions */}
                <Button
                  onClick={() => handleMoveToCart(item.id, item.name)}
                  disabled={!item.inStock}
                  variant={item.inStock ? 'primary' : 'outline'}
                  className="w-full text-xs font-semibold h-9"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
