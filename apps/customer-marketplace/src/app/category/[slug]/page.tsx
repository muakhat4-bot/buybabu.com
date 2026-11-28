'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Button, Card, CardContent } from '@villex/ui';
import { useCart } from '@/features/checkout/context/cart-context';

interface Props {
  params: Promise<{ slug: string }>;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'smart-gadgets': 'Smart Gadgets',
  'smart gadgets': 'Smart Gadgets',
  'apparel': 'Apparels & Clothing',
  'apparels & clothing': 'Apparels & Clothing',
  'clothing': 'Apparels & Clothing',
  'baby-care': 'Mother & Baby Care',
  'mother & baby care': 'Mother & Baby Care',
  'baby care': 'Mother & Baby Care',
  'electronics': 'Electronics',
  'kitchen': 'Kitchen Essentials',
  'kitchen-essentials': 'Kitchen Essentials',
  'kitchen essentials': 'Kitchen Essentials',
  'bath': 'Bath Essentials',
  'bath-essentials': 'Bath Essentials',
  'bath essentials': 'Bath Essentials',
  'home': 'Home Arrivals',
  'home-arrivals': 'Home Arrivals',
  'home arrivals': 'Home Arrivals',
  'beauty': 'Beauty & Cosmetics',
  'beauty and cosmetics': 'Beauty & Cosmetics',
  'cosmetics': 'Beauty & Cosmetics',
  'fitness': 'Health & Fitness',
  'health & fitness': 'Health & Fitness',
  'tools': 'Tools',
};

function CategoryPageContent({ rawSlug }: { rawSlug: string }) {
  const decodedSlug = decodeURIComponent(rawSlug).trim();
  const slugKey = decodedSlug.toLowerCase().replace(/\s+/g, '-');
  const displayName =
    CATEGORY_DISPLAY_NAMES[slugKey] ||
    CATEGORY_DISPLAY_NAMES[decodedSlug.toLowerCase()] ||
    decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState('newest');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const { addToCart } = useCart();

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadCategoryProducts() {
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(decodedSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.warn('Category product fetch error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCategoryProducts();
    return () => {
      isMounted = false;
    };
  }, [decodedSlug]);

  const sortedProducts = React.useMemo(() => {
    const list = [...products];
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    // Default newest
    return list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [products, sortBy]);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      spec: 'Standard',
      stockCount: product.stock || 10
    });
    setToastMessage(`Added "${product.name}" to your cart.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
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

      {/* Category Hero / Header */}
      <section className="bg-secondary/15 border-b border-border py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-primary transition-colors">Categories</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">{displayName}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight">{displayName}</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Explore authentic and approved products in {displayName}. Verified quality guaranteed.
              </p>
            </div>

            {/* Sort & Count Controls */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-semibold">
                {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 bg-card border border-input rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="rounded-2xl border border-border p-4 h-80 animate-pulse bg-secondary/15 flex flex-col justify-between">
                <div className="h-44 bg-secondary/35 rounded-xl mb-4"></div>
                <div className="h-4 bg-secondary/35 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-secondary/35 rounded w-1/2 mb-4"></div>
                <div className="h-9 bg-secondary/35 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16 px-4 bg-card rounded-3xl border border-border shadow-sm my-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
              📦
            </div>
            <h2 className="text-lg font-bold mb-1">No Products in {displayName}</h2>
            <p className="text-xs text-muted-foreground mb-6">
              There are currently no approved products listed under this category. Please explore our other categories or check back soon!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="secondary" className="w-full sm:w-auto text-xs">Return Home</Button>
              </Link>
              <Link href="/search">
                <Button variant="primary" className="w-full sm:w-auto text-xs">Browse All Categories</Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sortedProducts.map((p) => (
              <Card key={p.id} className="overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-border/80">
                <div className="relative aspect-square bg-secondary/35 overflow-hidden">
                  <Link href={`/product/${p.id}`} className="block w-full h-full">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  {p.discount !== undefined && p.discount > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-destructive text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      -{p.discount}%
                    </span>
                  )}
                  {p.storeName && (
                    <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      {p.storeName}
                    </span>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {p.brand || 'GENERIC'}
                    </span>
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      <Link href={`/product/${p.id}`}>{p.name}</Link>
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-foreground">
                        PKR {Number(p.price).toLocaleString()}
                      </span>
                      {p.oldPrice && (
                        <span className="text-[10px] text-muted-foreground line-through block">
                          PKR {Number(p.oldPrice).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(p)}
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
        )}
      </main>
    </div>
  );
}

export default function CategoryPage({ params }: Props) {
  const unwrappedParams = React.use(params);
  return <CategoryPageContent rawSlug={unwrappedParams.slug} />;
}
