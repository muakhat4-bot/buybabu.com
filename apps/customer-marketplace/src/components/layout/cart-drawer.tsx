import * as React from 'react';
import { Button } from '@villex/ui';
import Link from 'next/link';
import { useCart } from '@/features/checkout/context/cart-context';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Sheet panel / Centered Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#121824] border border-border rounded-2xl flex flex-col justify-between shadow-2xl max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Shopping Cart ({cartItems.length})</h3>
          <button className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 pb-12">
              <span className="text-4xl">🛒</span>
              <h4 className="font-bold text-sm text-foreground">Your cart is empty</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Add some amazing products to your cart to see them here!
              </p>
              <Button onClick={onClose} variant="outline" className="text-xs px-4 h-9">
                Continue Shopping
              </Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-border/60 pb-4 relative group">
                <div className="h-16 w-16 rounded overflow-hidden bg-secondary/50 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-1 text-foreground">{item.name}</h4>
                  <p className="text-xs text-primary font-bold mt-1">PKR {item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.id, item.quantity - 1);
                        } else {
                          removeFromCart(item.id);
                        }
                      }}
                      className="h-6 w-6 rounded bg-secondary text-foreground flex items-center justify-center text-xs font-bold hover:bg-secondary/80 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 rounded bg-secondary text-foreground flex items-center justify-center text-xs font-bold hover:bg-secondary/80 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Individual remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute right-0 top-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1"
                  title="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-border space-y-4">
            <div className="flex justify-between font-bold text-base">
              <span>Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            <Link href="/checkout" className="w-full block" onClick={onClose}>
              <Button variant="primary" className="w-full h-11 text-base font-semibold flex items-center justify-center gap-2">
                🔒 Secure Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
