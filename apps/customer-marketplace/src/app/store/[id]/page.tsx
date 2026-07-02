'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button, Input } from '@villex/ui';
import { ProductCardView, Product } from '@/features/catalog/components/product-card-view';

interface Vendor {
  email: string;
  storeName: string;
  storeId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  joinedDate?: string;
  verificationStatus?: string;
  storeDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export default function StoreDetailPage() {
  const params = useParams();
  const rawId = params?.id as string;
  const storeId = rawId ? decodeURIComponent(rawId) : '';

  const [vendor, setVendor] = React.useState<Vendor | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!storeId) return;

    const fetchStoreData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch vendor profile
        const vendorRes = await fetch('/api/vendors');
        if (vendorRes.ok) {
          const vendorsData = await vendorRes.json();
          // Match by storeId (stripping # for safety)
          const matchedVendor = vendorsData.find(
            (v: Vendor) =>
              v.storeId &&
              v.storeId.replace('#', '').toLowerCase() === storeId.replace('#', '').toLowerCase()
          );
          if (matchedVendor) {
            setVendor(matchedVendor);
          }
        }

        // 2. Fetch products for this store
        const productsRes = await fetch(`/api/products?storeId=${encodeURIComponent(storeId)}`);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }
      } catch (err) {
        console.error('Failed to load store details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  const handleAddToCart = (name: string) => {
    setToastMessage(`Added "${name}" to your cart.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Loading Store Profile...</span>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-2xl">
            🏪
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="font-bold text-lg text-foreground">Store Not Found</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              We couldn&apos;t resolve a verified merchant store with the reference identifier <code className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded text-primary">{storeId}</code>.
            </p>
          </div>
          <Link href="/">
            <Button variant="primary" className="text-xs font-bold uppercase tracking-wider h-9 px-5 rounded-xl">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate initials for logo
  const storeInitials = vendor.storeName
    ? vendor.storeName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'VS';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
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

      {/* Premium Store Banner */}
      <div className="relative w-full h-48 sm:h-64 bg-gradient-to-r from-primary/30 via-violet-500/10 to-primary/20 border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>
      </div>

      {/* Store Metadata Card */}
      <div className="container mx-auto px-4 relative -mt-16 sm:-mt-24 z-10 pb-8">
        <div className="bg-card border border-border/80 shadow-2xl rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Store Logo */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-violet-500 border-2 border-border shadow-2xl flex items-center justify-center text-4xl text-primary-foreground font-black select-none shrink-0">
              {storeInitials}
            </div>

            {/* Store Information */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-foreground">
                  {vendor.storeName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  Verified Merchant
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                {vendor.storeDescription || `Welcome to ${vendor.storeName}. We offer curated collections of high-quality verified items, covered by escrow protection.`}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  📧 <span className="text-foreground">{vendor.supportEmail || vendor.email}</span>
                </span>
                {vendor.supportPhone && (
                  <span className="flex items-center gap-1">
                    📞 <span className="text-foreground">{vendor.supportPhone}</span>
                  </span>
                )}
                {vendor.joinedDate && (
                  <span className="flex items-center gap-1">
                    🗓️ Member since: <span className="text-foreground">{vendor.joinedDate}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Store Statistics Widget */}
          <div className="grid grid-cols-2 gap-4 border border-border/60 bg-secondary/10 p-4 rounded-xl text-center md:w-64">
            <div>
              <span className="block text-lg font-black text-foreground">⭐ 4.9</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Store Rating</span>
            </div>
            <div>
              <span className="block text-lg font-black text-foreground">100%</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Fulfillment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Catalog Section */}
      <div className="container mx-auto px-4 py-8 flex-grow space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-foreground">
              Store Products ({filteredProducts.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse products published directly by {vendor.storeName}.
            </p>
          </div>

          {/* Search bar inside the store */}
          <div className="relative max-w-xs w-full">
            <Input
              type="text"
              placeholder="Search in this store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs font-semibold pl-9 h-9 w-full"
            />
            <span className="absolute left-3 top-2.5 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Product Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-border border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
              📦
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm">No Products Listed</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                This store has no active products matching your search keywords at the moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="animate-fade-in">
                <ProductCardView
                  product={product}
                  viewMode="grid"
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 py-8 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Villex Multi-Vendor Marketplace. Escrow Protection Active.</p>
        </div>
      </footer>
    </div>
  );
}
