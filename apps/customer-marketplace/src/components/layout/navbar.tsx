import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Input, Logo } from '@villex/ui';
import { MegaMenu } from './mega-menu';
import { CartDrawer } from './cart-drawer';
import { useCart } from '@/features/checkout/context/cart-context';

export function Navbar() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const { isCartOpen, setIsCartOpen, cartItems } = useCart();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Search autocomplete suggestion list
  const suggestions = [
    { title: 'Sony ANC headphones WH-1000XM5', category: 'Electronics' },
    { title: 'Pro mechanical keyboards wired/wireless', category: 'Accessories' },
    { title: 'Red-Pro Sports custom sneaker running shoes', category: 'Footwear' },
  ].filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 relative">
          {/* Brand & Desktop Links */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <button
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
                className="hover:text-foreground transition-colors flex items-center gap-1.5 h-16"
              >
                Categories
                <svg className={`w-4 h-4 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <a href="#" className="hover:text-foreground transition-colors">Flash Deals</a>
              <a href="#" className="hover:text-foreground transition-colors">Stores</a>
            </nav>
          </div>

          {/* Categories Mega Menu Hover Wrapper */}
          <div
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <MegaMenu isOpen={isMegaMenuOpen} />
          </div>

          {/* Search Bar with autocomplete suggestions dropdown */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="flex-1 max-w-md relative hidden md:block"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          >
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <Input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full bg-secondary/35 border-input text-xs font-semibold rounded-xl"
              />
            </div>

            {/* suggestions list popup overlay */}
            {showSuggestions && searchQuery.trim().length > 0 && (
              <Card className="absolute top-11 left-0 right-0 p-2.5 z-50 border-border bg-card shadow-xl rounded-xl space-y-1 text-xs">
                {suggestions.length === 0 ? (
                  <p className="p-2 text-muted-foreground font-semibold">No results found for &ldquo;{searchQuery}&rdquo;</p>
                ) : (
                  suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSearchQuery(s.title);
                        window.location.href = `/search?q=${encodeURIComponent(s.title)}`;
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/40 cursor-pointer font-semibold text-foreground transition-all duration-150"
                    >
                      <span className="truncate">{s.title}</span>
                      <span className="text-[10px] text-primary uppercase font-bold tracking-wider">{s.category}</span>
                    </div>
                  ))
                )}
              </Card>
            )}
          </form>

          {/* Right Actions: Account dashboard status and Cart Drawer toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </button>

            <Link href="/dashboard">
              <Button variant="outline" className="hidden sm:inline-flex h-9 px-4">My Account</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Drawer Layer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
