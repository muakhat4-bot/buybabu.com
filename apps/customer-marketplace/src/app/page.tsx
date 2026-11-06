'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Input, Logo } from '@villex/ui';
import { Navbar } from '@/components/layout/navbar';
import { Product } from '@/features/catalog/components/product-card-view';
import { HeroCarousel } from '@/components/hero-carousel';

export default function Home() {
  // Simple state for countdown timer
  const [timeLeft, setTimeLeft] = React.useState({ hours: 14, minutes: 32, seconds: 45 });
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const [productsList, setProductsList] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('/api/products').catch((err) => {
          console.warn('fetchAllProducts network warning:', err);
          return null;
        });
        if (res && res.ok) {
          const data = await res.json().catch(() => []);
          if (Array.isArray(data)) {
            setProductsList(data);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch marketplace homepage products:', err);
      }
    };

    fetchAllProducts();
  }, []);

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

  const handleAddToCart = (name: string) => {
    setToastMessage(`Added "${name}" to your cart.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Static mockup data to ensure immediate rendering
  const categories = [
    { name: 'Smart gadgets', image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400&auto=format&fit=crop&q=80', count: '800+ Items', slug: 'smart-gadgets' },
    { name: 'Apparels & Clothing', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&auto=format&fit=crop&q=80', count: '2.4k+ Items', slug: 'apparel' },
    { name: 'Mother & Baby care', image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=400&auto=format&fit=crop&q=80', count: '600+ Items', slug: 'baby-care' },
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80', count: '1.8k+ Items', slug: 'electronics' },
    { name: 'Kitchen Essentials', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80', count: '1.2k+ Items', slug: 'kitchen' },
    { name: 'Bath Essentials', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80', count: '750+ Items', slug: 'bath' },
    { name: 'Home Arrivals', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80', count: '1.5k+ Items', slug: 'home' },
    { name: 'Beauty and Cosmetics', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80', count: '950+ Items', slug: 'beauty' },
    { name: 'Health & Fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80', count: '1.1k+ Items', slug: 'fitness' },
    { name: 'Tools', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&auto=format&fit=crop&q=80', count: '500+ Items', slug: 'tools' },
  ];

  const flashDeals = React.useMemo(() => {
    const discounted = productsList.filter(p => p.discount && p.discount > 0);
    if (discounted.length > 0) return discounted.slice(0, 3);
    return productsList.slice(0, 3);
  }, [productsList]);

  const trendingProducts = React.useMemo(() => {
    const tagged = productsList.filter(p => p.tag === 'Trending' || p.tag === 'Best Seller' || p.tag === 'Popular');
    if (tagged.length > 0) return tagged.slice(0, 4);
    return productsList.slice(3, 7);
  }, [productsList]);

  const newArrivals = React.useMemo(() => {
    return [...productsList].sort((a, b) => {
      const getTimestamp = (id: string | undefined) => {
        if (!id) return 0;
        const match = id.match(/p-(\d+)/);
        return (match && match[1]) ? parseInt(match[1]) : 0;
      };
      const tA = getTimestamp(a.id);
      const tB = getTimestamp(b.id);
      if (tA !== tB) {
        return tB - tA;
      }
      return b.id.localeCompare(a.id);
    }).slice(0, 4);
  }, [productsList]);

  const hotSales = React.useMemo(() => {
    let list = productsList.filter(p => p.discount !== undefined && p.discount > 0);
    if (list.length < 5) {
      const discountedIds = new Set(list.map(p => p.id));
      const remaining = productsList
        .filter(p => !discountedIds.has(p.id))
        .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
      list = [...list, ...remaining];
    }
    return list.sort((a, b) => (b.discount || 0) - (a.discount || 0)).slice(0, 5);
  }, [productsList]);;



  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* 1. Header / Navigation Bar */}
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

      {/* 2. Hero Section with Kitchen Banner */}
      <section className="relative w-full bg-secondary/5 pt-0">
        {/* Custom 3D Parallax & Transition Hero Carousel */}
        <HeroCarousel />




      </section>

      {/* 3. Category Section */}
      <section className="py-12 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 lg:gap-6">
            {categories.map((cat, idx) => (
              <Link
                href={`/search?category=${cat.slug}`}
                key={idx}
                className="group flex flex-col rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 overflow-hidden transition-all duration-300"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-secondary/35 border-b border-border/40">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 text-center">
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors block line-clamp-1">{cat.name}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">{cat.count}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3.5. New Arrivals Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">🆕 New Arrivals</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Most recently uploaded products from our stores.</p>
            </div>
            <Link href="/search" className="text-sm font-semibold text-primary hover:underline">View All New Products →</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <Card key={p.id} className="overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-square bg-secondary/50 overflow-hidden">
                  <Link href={`/product/${p.id}`} className="block w-full h-full">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <span className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    New
                  </span>
                  {p.discount !== undefined && p.discount > 0 && (
                    <span className="absolute bottom-2.5 left-2.5 bg-destructive text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                      -{p.discount}%
                    </span>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{p.brand || 'Generic'}</span>
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer">
                      <Link href={`/product/${p.id}`}>{p.name}</Link>
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">PKR {p.price.toLocaleString()}</span>
                    <button
                      onClick={() => handleAddToCart(p.name)}
                      className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-200 active:scale-90"
                      title="Add to Cart"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Flash Deals Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight">⚡ Flash Deals</h2>
              <div className="flex items-center gap-1.5 font-mono text-sm">
                <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-1 rounded-md">{formatNumber(timeLeft.hours)}</span>:
                <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-1 rounded-md">{formatNumber(timeLeft.minutes)}</span>:
                <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-1 rounded-md">{formatNumber(timeLeft.seconds)}</span>
              </div>
            </div>
            <a href="#" className="text-sm font-semibold text-primary hover:underline">View All Deals →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flashDeals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-56 bg-secondary/50">
                  <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-3 right-3 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">-{deal.discount}%</span>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base line-clamp-1">{deal.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-primary">PKR {deal.price.toLocaleString()}</span>
                      {deal.oldPrice !== undefined && (
                        <span className="text-xs text-muted-foreground line-through">PKR {deal.oldPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sold: {deal.soldPercent}%</span>
                      <span>Stock Reserved</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${deal.soldPercent}%` }}></div>
                    </div>
                  </div>

                  <Button variant="primary" className="w-full h-9">Claim Deal</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trending Products */}
      <section className="py-16 bg-secondary/15">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">🔥 Trending Now</h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" className="rounded-full h-8">All</Button>
              <Button size="sm" variant="ghost" className="rounded-full h-8 text-muted-foreground">Electronics</Button>
              <Button size="sm" variant="ghost" className="rounded-full h-8 text-muted-foreground">Fashion</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map((p) => (
              <Card key={p.id} className="overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-square bg-secondary/50">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2.5 left-2.5 bg-primary/20 text-primary border border-primary/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    {p.tag}
                  </span>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{p.name}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">PKR {p.price.toLocaleString()}</span>
                    <button className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-200 active:scale-90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5.5. Hot Sales Section */}
      <section className="py-16 bg-gradient-to-b from-destructive/5 to-transparent border-t border-destructive/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-pulse">🔥</span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-destructive">Hot Sales</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Top deals with maximum discount and best value.</p>
              </div>
            </div>
            <Link href="/search" className="text-sm font-semibold text-destructive hover:underline">Shop All Deals →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {hotSales.map((p) => (
              <Card key={p.id} className="overflow-hidden flex flex-col group border-destructive/20 hover:border-destructive hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card relative">
                {/* Max Discount Badge */}
                {p.discount !== undefined && p.discount > 0 && (
                  <span className="absolute top-2.5 left-2.5 z-10 bg-destructive text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
                    -{p.discount}% OFF
                  </span>
                )}
                
                <div className="relative aspect-square bg-secondary/35 overflow-hidden">
                  <Link href={`/product/${p.id}`} className="block w-full h-full">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] text-destructive uppercase font-extrabold tracking-widest">{p.brand || 'HOT DEAL'}</span>
                    <h3 className="font-bold text-xs text-foreground line-clamp-2 leading-tight group-hover:text-destructive transition-colors cursor-pointer">
                      <Link href={`/product/${p.id}`}>{p.name}</Link>
                    </h3>
                    
                    {/* Star ratings */}
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 pt-1">
                      <span>⭐</span>
                      <span className="font-bold text-foreground">{p.rating}</span>
                      <span className="text-muted-foreground">({p.reviews})</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-destructive">PKR {p.price.toLocaleString()}</span>
                      {p.oldPrice && (
                        <span className="text-[10px] text-muted-foreground line-through">PKR {p.oldPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(p.name)}
                      className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors duration-200 active:scale-90"
                      title="Claim Deal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* 7. Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-background to-primary/5 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Stay updated with Buy Babu</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Subscribe to our newsletter to receive flash deals alerts, store discount coupons, and direct vendor promotional updates.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 h-11"
              required
            />
            <Button type="submit" className="h-11 px-6 font-semibold">Subscribe</Button>
          </form>
          <p className="text-xs text-muted-foreground">🔒 We care about your data privacy. Cancel subscription at any time.</p>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-border bg-card/60 py-12 text-sm text-muted-foreground">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Logo size="sm" className="mb-4" />
            <p className="text-xs leading-relaxed">
              Buy Babu is the next generation multi-vendor e-commerce platform built to prioritize trust, fast catalog parsing, and clean design interfaces.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-foreground">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground">How to Buy</a></li>
              <li><a href="#" className="hover:text-foreground">Track Order</a></li>
              <li><Link href="/return-policy" className="hover:text-foreground">Returns & Refunds</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/prohibited-products" className="hover:text-foreground">Prohibited Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Make Money</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/vendor-signup" className="hover:text-foreground">Sell on Buy Babu</Link></li>
              <li><a href="#" className="hover:text-foreground">Join Affiliate Program</a></li>
              <li><a href="#" className="hover:text-foreground">Advertising Partner</a></li>
              <li><Link href="/vendor-rules" className="hover:text-foreground">Vendor Rules</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Payment Methods</h4>
            <div className="grid grid-cols-3 gap-2">
              <span className="bg-secondary/40 text-foreground border border-border text-[10px] font-bold p-1 rounded text-center">VISA</span>
              <span className="bg-secondary/40 text-foreground border border-border text-[10px] font-bold p-1 rounded text-center">PAYPAL</span>
              <span className="bg-secondary/40 text-foreground border border-border text-[10px] font-bold p-1 rounded text-center">STRIPE</span>
              <span className="bg-secondary/40 text-foreground border border-border text-[10px] font-bold p-1 rounded text-center">COD</span>
              <span className="bg-secondary/40 text-foreground border border-border text-[10px] font-bold p-1 rounded text-center">EASYPAISA</span>
              <span className="bg-secondary/40 text-foreground border border-border text-[10px] font-bold p-1 rounded text-center">JAZZCASH</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-border/60 text-center text-xs">
          <p>© {new Date().getFullYear()} Buy Babu Multi-Vendor Marketplace. Designed and engineered for high-performance scale.</p>
        </div>
      </footer>
    </div>
  );
}
