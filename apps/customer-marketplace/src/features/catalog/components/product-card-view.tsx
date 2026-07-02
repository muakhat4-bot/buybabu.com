'use client';

import * as React from 'react';
import { Button, Card } from '@villex/ui';
import Link from 'next/link';
import { useCart } from '@/features/checkout/context/cart-context';

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  inStock: boolean;
  freeShipping: boolean;
  expressDelivery: boolean;
  description: string;
  tag?: string;
  storeId?: string;
  storeName?: string;
  soldPercent?: number;
  images?: string[];
  gallery?: string[];
  specs?: Record<string, string>;
  sku?: string;
}

interface ProductCardViewProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (productName: string) => void;
}

export function ProductCardView({ product, viewMode, onAddToCart }: ProductCardViewProps) {
  const isGrid = viewMode === 'grid';
  const { addToCart } = useCart();

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
    });
    if (onAddToCart) {
      onAddToCart(product.name);
    }
  };

  return (
    <Card
      className={`overflow-hidden group border-border transition-all duration-300 ${
        isGrid
          ? 'flex flex-col relative h-full hover:-translate-y-1 hover:shadow-xl hover:border-primary/20'
          : 'flex flex-col md:flex-row gap-6 p-5 hover:border-primary/20 hover:shadow-lg'
      }`}
    >
      {/* Product Image Panel */}
      <div
        className={`relative bg-secondary/35 overflow-hidden flex-shrink-0 ${
          isGrid ? 'aspect-[4/3] w-full' : 'aspect-square w-full md:w-48 rounded-xl'
        }`}
      >
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Dynamic Tags */}
        {product.tag && (
          <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {product.tag}
          </span>
        )}

        {/* Discount Overlay */}
        {product.discount && (
          <span className="absolute bottom-3 left-3 z-10 bg-destructive text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
            -{product.discount}%
          </span>
        )}

        {/* Stock Out Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information Panel */}
      <div className={`flex flex-col flex-grow ${isGrid ? 'p-4' : 'justify-between py-1'}`}>
        <div className="space-y-1.5">
          {/* Brand & tags */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{product.brand}</span>
            {product.expressDelivery && (
              <span className="text-[9px] bg-amber-500/10 text-amber-500 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                ⚡ Express
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-tight">
            <Link href={`/product/${product.id}`}>{product.name}</Link>
          </h4>

          {/* Star Rating Row */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            <span className="font-bold text-foreground mt-0.5">{product.rating}</span>
            <span className="text-muted-foreground mt-0.5">({product.reviews})</span>
          </div>

          {/* Description (List View only) */}
          {!isGrid && (
            <p className="text-xs text-muted-foreground leading-relaxed pt-2 max-w-xl line-clamp-3">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & CTA block */}
        <div className={`flex items-center justify-between mt-4 ${isGrid ? '' : 'border-t border-border/40 pt-4'}`}>
          <div className="flex flex-col">
            <span className="text-base font-black text-foreground">PKR {product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className="text-[10px] text-muted-foreground line-through">
                PKR {product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCartClick}
            disabled={!product.inStock}
            size="sm"
            className={`${isGrid ? 'w-9 h-9 p-0 rounded-full' : 'px-4 h-9 font-semibold text-xs'}`}
            title="Add to Cart"
          >
            {isGrid ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
