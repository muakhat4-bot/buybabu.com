'use client';

import * as React from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand?: string;
  spec?: string;
  stockCount?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  savedItems: CartItem[];
  saveForLater: (item: CartItem) => void;
  moveToCart: (item: CartItem) => void;
  removeSaved: (id: string) => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const DEFAULT_CART: CartItem[] = [
  {
    id: 'p-1',
    name: 'Sony WH-1000XM5 ANC Headset',
    price: 68900,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
    brand: 'Sony',
    spec: 'Silver / Noise Cancelling',
    stockCount: 3,
  },
  {
    id: 'p-2',
    name: 'Mechanical Backlit Keyboard G-PRO',
    price: 12500,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80',
    brand: 'Logitech',
    spec: 'Blue Switches / RGB',
    stockCount: 5,
  },
];

const DEFAULT_SAVED: CartItem[] = [
  {
    id: 'p-3',
    name: 'Ultralight Ergo Wireless Gaming Mouse',
    price: 8900,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=80',
    brand: 'Razer',
    spec: 'Matte White',
    stockCount: 12,
  },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = React.useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem('villex_cart');
    const savedLater = localStorage.getItem('villex_saved_later');
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems(DEFAULT_CART);
      }
    } else {
      setCartItems(DEFAULT_CART);
      localStorage.setItem('villex_cart', JSON.stringify(DEFAULT_CART));
    }

    if (savedLater) {
      try {
        setSavedItems(JSON.parse(savedLater));
      } catch (e) {
        setSavedItems(DEFAULT_SAVED);
      }
    } else {
      setSavedItems(DEFAULT_SAVED);
      localStorage.setItem('villex_saved_later', JSON.stringify(DEFAULT_SAVED));
    }
    
    setIsMounted(true);
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('villex_cart', JSON.stringify(items));
    }
  };

  const saveLater = (items: CartItem[]) => {
    setSavedItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('villex_saved_later', JSON.stringify(items));
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity || 1;
    let newItems = [...cartItems];
    const existingIndex = newItems.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      const existingItem = newItems[existingIndex];
      if (existingItem) {
        existingItem.quantity += qty;
      }
    } else {
      newItems.push({ ...item, quantity: qty });
    }
    saveCart(newItems);
  };

  const removeFromCart = (id: string) => {
    const newItems = cartItems.filter((i) => i.id !== id);
    saveCart(newItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    const newItems = cartItems.map((i) => (i.id === id ? { ...i, quantity } : i));
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const saveForLater = (item: CartItem) => {
    const newCart = cartItems.filter((i) => i.id !== item.id);
    saveCart(newCart);
    if (!savedItems.some((i) => i.id === item.id)) {
      const newLater = [item, ...savedItems];
      saveLater(newLater);
    }
  };

  const moveToCart = (item: CartItem) => {
    const newLater = savedItems.filter((i) => i.id !== item.id);
    saveLater(newLater);
    addToCart(item);
  };

  const removeSaved = (id: string) => {
    const newLater = savedItems.filter((i) => i.id !== id);
    saveLater(newLater);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: isMounted ? cartItems : [],
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen: isMounted ? isCartOpen : false,
        setIsCartOpen,
        savedItems: isMounted ? savedItems : [],
        saveForLater,
        moveToCart,
        removeSaved,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
