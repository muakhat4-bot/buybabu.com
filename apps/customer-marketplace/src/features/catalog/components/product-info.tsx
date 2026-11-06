'use client';

import * as React from 'react';
import { Button } from '@villex/ui';
import { Product } from './product-card-view';
import { useCart } from '@/features/checkout/context/cart-context';
import { useRouter } from 'next/navigation';

interface ProductInfoProps {
  product: Product;
  onAddToCart: (name: string) => void;
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = React.useState('Silver');
  const [quantity, setQuantity] = React.useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  // Dynamic stock calculations based on color
  const getStockStatus = () => {
    if (selectedColor === 'Matte Black') {
      return { count: 3, label: 'Only 3 left in stock - order soon!', isLow: true };
    }
    return { count: 18, label: 'In Stock - Ready to Ship', isLow: false };
  };

  const stock = getStockStatus();
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;

  const handleAddToCartClick = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      spec: `${selectedColor}`,
      stockCount: stock.count
    });
    // Trigger parent toast
    onAddToCart(product.name);
  };

  const handleBuyNowClick = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      spec: `${selectedColor}`,
      stockCount: stock.count
    });
    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      {/* Brand & tags header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {product.brand} Official
          </span>
          {product.expressDelivery && (
            <span className="text-xs bg-amber-500/10 text-amber-500 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              ⚡ Express Delivery
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-semibold">SKU: VLX-{product.id.toUpperCase()}-902</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-foreground">
        {product.name}
      </h1>

      {/* Ratings review scroll */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <div className="flex text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
        <strong className="text-foreground">{product.rating}</strong>
        <span className="text-muted-foreground">({product.reviews} customer reviews)</span>
        <span className="text-muted-foreground">•</span>
        <a href="#reviews" className="text-primary font-bold hover:underline">
          12 Answered FAQs
        </a>
      </div>

      {/* Pricing module */}
      <div className="p-4 rounded-2xl bg-secondary/25 border border-border/80 space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-foreground">PKR {product.price.toLocaleString()}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              PKR {product.oldPrice.toLocaleString()}
            </span>
          )}
          {product.discount && (
            <span className="text-xs bg-destructive text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
              {product.discount}% OFF
            </span>
          )}
        </div>
        {savings > 0 && (
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            🎁 Direct Savings: PKR {savings.toLocaleString()} (Includes platform discount)
          </p>
        )}
      </div>

      {/* Variant Selector */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Select Color: <strong className="text-foreground">{selectedColor}</strong>
        </span>
        <div className="flex gap-2">
          {['Silver', 'Matte Black'].map((color) => {
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border bg-secondary/35 text-muted-foreground hover:text-foreground'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity & Stock Scarcity Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Quantity</span>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              stock.isLow ? 'text-destructive animate-pulse' : 'text-emerald-400'
            }`}
          >
            {stock.label}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-border rounded-xl bg-secondary/20 h-10 overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 font-bold"
            >
              —
            </button>
            <span className="w-12 text-center text-sm font-bold text-foreground">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(stock.count, q + 1))}
              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 font-bold"
            >
              +
            </button>
          </div>

          <span className="text-xs text-muted-foreground">Limit 5 per customer</span>
        </div>
      </div>

      {/* Buy Actions CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        <Button
          onClick={handleAddToCartClick}
          variant="outline"
          className="h-12 text-sm font-bold border-primary/20 text-primary hover:bg-primary/10 hover:border-primary"
        >
          Add to Cart
        </Button>
        <Button
          onClick={handleBuyNowClick}
          className="h-12 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-xl shadow-primary/15"
        >
          Buy Now
        </Button>
      </div>

      {/* Conversion Badges / Escrow secure list */}
      <div className="border-t border-border/60 pt-5 space-y-3">
        {/* Badges */}
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/[0.02] flex items-start space-x-3 text-xs leading-relaxed">
          <span className="text-xl p-1 rounded-lg bg-primary/10">🛡️</span>
          <div>
            <strong className="text-foreground block">Buy Babu Escrow Protection</strong>
            <span className="text-muted-foreground mt-0.5 block">Your funds are held securely in escrow. Money is released to the seller only *after* you receive, verify, and approve the product.</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 border border-border/80 rounded-xl p-3 bg-secondary/10">
            <span className="text-lg">✓</span>
            <div>
              <strong className="text-foreground block">100% Genuine</strong>
              <span className="text-[10px] text-muted-foreground">Direct brand verified</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-border/80 rounded-xl p-3 bg-secondary/10">
            <span className="text-lg">↩</span>
            <div>
              <strong className="text-foreground block">7 Days Return</strong>
              <span className="text-[10px] text-muted-foreground">Easy free refunds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
