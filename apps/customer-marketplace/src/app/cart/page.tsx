'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Button, Card } from '@villex/ui';
import { CartItemRow, CartItem } from '@/features/checkout/components/cart-item-row';
import { SaveForLater } from '@/features/checkout/components/save-for-later';
import { CartSummary } from '@/features/checkout/components/cart-summary';
import { useCart } from '@/features/checkout/context/cart-context';

export default function CartPage() {
  const {
    cartItems,
    savedItems,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeSaved,
  } = useCart();

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Type conversion to match components props requirement
  const typedCartItems = React.useMemo(() => {
    return cartItems.map((item) => ({
      ...item,
      brand: item.brand || 'ElectroPulse',
      spec: item.spec || '',
      stockCount: item.stockCount || 10,
    }));
  }, [cartItems]);

  const typedSavedItems = React.useMemo(() => {
    return savedItems.map((item) => ({
      ...item,
      brand: item.brand || 'ElectroPulse',
      spec: item.spec || '',
      stockCount: item.stockCount || 10,
    }));
  }, [savedItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQtyChange = (id: string, newQty: number) => {
    updateQuantity(id, newQty);
  };

  const handleRemoveItem = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    removeFromCart(id);
    if (item) showToast(`Removed "${item.name}" from your cart.`);
  };

  const handleSaveForLater = (item: CartItem) => {
    saveForLater(item);
    showToast(`Saved "${item.name}" for later.`);
  };

  const handleMoveToCart = (item: CartItem) => {
    moveToCart(item);
    showToast(`Moved "${item.name}" back to cart.`);
  };

  const handleRemoveSaved = (id: string) => {
    const item = savedItems.find((i) => i.id === id);
    removeSaved(id);
    if (item) showToast(`Deleted "${item.name}" from saved list.`);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      {/* Navbar header */}
      <Navbar />

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-primary text-primary-foreground shadow-2xl border border-primary/20 flex items-center gap-2 animate-slide-up text-sm font-semibold">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Main viewport */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-black tracking-tight mb-2">Shopping Cart</h1>
        <p className="text-xs text-muted-foreground mb-8">Inspect your items, apply vouchers, and complete your order checkout securely.</p>

        {cartItems.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Empty cart card */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg">Your Cart is Empty</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">Browse our listing catalog to discover items and add them to your cart.</p>
                <Link href="/search" className="mt-6">
                  <Button className="font-semibold">Start Discovering</Button>
                </Link>
              </Card>

              {/* Save for later list */}
              <SaveForLater
                savedItems={typedSavedItems}
                onMoveToCart={handleMoveToCart}
                onRemove={handleRemoveSaved}
              />
            </div>

            {/* Sidebar totals (disabled) */}
            <div className="lg:col-span-4">
              <CartSummary
                subtotal={0}
                discountPercent={0}
                shippingFee={0}
                couponCode=""
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Items and Save for later */}
            <div className="lg:col-span-8 space-y-6">
              {/* Active Items */}
              <div className="space-y-4">
                {typedCartItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemoveItem}
                    onSaveForLater={handleSaveForLater}
                  />
                ))}
              </div>

              {/* Save for Later shelf */}
              <SaveForLater
                savedItems={typedSavedItems}
                onMoveToCart={handleMoveToCart}
                onRemove={handleRemoveSaved}
              />
            </div>

            {/* Right Column: Checkout Summary */}
            <div className="lg:col-span-4 space-y-6">
              <CartSummary
                subtotal={subtotal}
                discountPercent={0}
                shippingFee={250}
                couponCode=""
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer copyright */}
      <footer className="border-t border-border bg-card/10 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p className="©">© {new Date().getFullYear()} Buy Babu Multi-Vendor Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
