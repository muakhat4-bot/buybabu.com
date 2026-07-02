'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@villex/ui';
import { FilterSidebar, FilterState } from '@/features/catalog/components/filter-sidebar';
import { ActiveFilters } from '@/features/catalog/components/active-filters';
import { ProductCardView, Product } from '@/features/catalog/components/product-card-view';
import { Pagination } from '@/features/catalog/components/pagination';


const ITEMS_PER_PAGE = 6;

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters sync
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const storeId = searchParams.get('storeId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const freeShipping = searchParams.get('freeShipping') === 'true';
  const expressDelivery = searchParams.get('expressDelivery') === 'true';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');
  const view = (searchParams.get('view') as 'grid' | 'list') || 'grid';

  // Local drawer toggles for mobile view
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [productsList, setProductsList] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProductsList(data);
        }
      } catch (err) {
        console.error('Failed to fetch marketplace products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const filters: FilterState = {
    category,
    minPrice,
    maxPrice,
    rating,
    freeShipping,
    expressDelivery,
    inStockOnly,
  };

  const updateQueryParams = (newParams: Record<string, string | null>) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    
    // Always reset page when filters change
    if (!newParams.hasOwnProperty('page')) {
      params.set('page', '1');
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'false') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/search?${params.toString()}`);
    // Simulate loading effect on filter changes
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleUpdateFilters = (newFilters: Partial<FilterState>) => {
    const paramsUpdate: Record<string, string | null> = {};
    Object.entries(newFilters).forEach(([key, val]) => {
      paramsUpdate[key] = val !== undefined ? String(val) : null;
    });
    updateQueryParams(paramsUpdate);
  };

  const handleClearFilters = () => {
    updateQueryParams({
      category: null,
      minPrice: null,
      maxPrice: null,
      rating: null,
      freeShipping: null,
      expressDelivery: null,
      inStockOnly: null,
    });
  };

  const handleAddToCart = (name: string) => {
    setToastMessage(`Added "${name}" to your cart.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Filter Logic
  const filteredProducts = productsList.filter((product) => {
    // Text search matching name, brand or description
    if (query) {
      const q = query.toLowerCase();
      const matchName = product.name?.toLowerCase().includes(q);
      const matchBrand = product.brand?.toLowerCase().includes(q);
      const matchDesc = product.description?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc) return false;
    }

    // Store filter
    if (storeId) {
      const cleanStoreId = storeId.replace('#', '').toLowerCase();
      const prodStoreId = product.storeId ? product.storeId.replace('#', '').toLowerCase() : '';
      if (prodStoreId !== cleanStoreId) return false;
    }

    // Category filter
    if (category) {
      const catLower = category.toLowerCase();
      const prodCatLower = product.category ? product.category.toLowerCase() : '';
      
      const categorySlugMap: Record<string, string[]> = {
        'smart-gadgets': ['smart gadgets'],
        'apparel': ['apparels & clothing', 'apparel', 'clothing'],
        'baby-care': ['mother & baby care', 'baby care'],
        'electronics': ['electronics', 'audio', 'chargers', 'keyboards', 'wearables', 'accessories'],
        'kitchen': ['kitchen essentials', 'kitchen'],
        'bath': ['bath essentials', 'bath'],
        'home': ['home arrivals', 'home'],
        'beauty': ['beauty and cosmetics', 'beauty', 'cosmetics'],
        'fitness': ['health & fitness', 'fitness'],
        'tools': ['tools'],
      };

      let matchesCategory = prodCatLower === catLower;
      if (!matchesCategory) {
        const mappedCats = categorySlugMap[catLower];
        if (mappedCats) {
          matchesCategory = mappedCats.includes(prodCatLower);
        } else {
          matchesCategory = prodCatLower.includes(catLower) || catLower.includes(prodCatLower);
        }
      }
      if (!matchesCategory) return false;
    }

    // Price bounds
    if (minPrice && product.price < parseInt(minPrice)) return false;
    if (maxPrice && product.price > parseInt(maxPrice)) return false;

    // Ratings bounds
    if (rating && product.rating < parseFloat(rating)) return false;

    // Checkboxes
    if (freeShipping && !product.freeShipping) return false;
    if (expressDelivery && !product.expressDelivery) return false;
    if (inStockOnly && !product.inStock) return false;

    return true;
  });

  // 2. Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating_desc':
        return b.rating - a.rating;
      case 'newest':
        // Tag "New" products first
        if (a.tag === 'New' && b.tag !== 'New') return -1;
        if (b.tag === 'New' && a.tag !== 'New') return 1;
        return 0;
      case 'relevance':
      default:
        return 0; // retain natural order
    }
  });

  // 3. Pagination calculation
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Breadcrumb line & query metadata info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-semibold">
            <span>Home</span>
            <span>/</span>
            <span>Catalog Search</span>
            {category && (
              <>
                <span>/</span>
                <span className="text-foreground capitalize">{category}</span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-semibold">
            {totalItems === 0 ? (
              'No items match your query'
            ) : (
              <>
                Showing <strong className="text-foreground">{startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> of{' '}
                <strong className="text-foreground">{totalItems}</strong> items{' '}
                {query && (
                  <>
                    for &ldquo;<span className="text-primary font-bold">{query}</span>&rdquo;
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {/* Dynamic 2-column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Filter Sidebar (Desktop-only) */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 bg-card/10 rounded-2xl border border-border p-5">
            <FilterSidebar
              filters={filters}
              updateFilters={handleUpdateFilters}
              clearFilters={handleClearFilters}
            />
          </aside>

          {/* Right Column: Active viewport */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Control Action Bar */}
            <div className="flex items-center justify-between gap-4 bg-card/10 border border-border rounded-xl p-3">
              {/* Sort selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Sort By:</span>
                <select
                  value={sort}
                  onChange={(e) => updateQueryParams({ sort: e.target.value })}
                  className="bg-secondary/40 border border-border rounded-lg text-xs font-bold px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Top Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {/* Grid / List Toggles */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => updateQueryParams({ view: 'grid' })}
                  className={`p-1.5 rounded-lg border transition-all duration-150 ${
                    view === 'grid'
                      ? 'bg-primary/15 text-primary border-primary/20'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                  title="Grid View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => updateQueryParams({ view: 'list' })}
                  className={`p-1.5 rounded-lg border transition-all duration-150 ${
                    view === 'list'
                      ? 'bg-primary/15 text-primary border-primary/20'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                  title="List View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Active chip tags list */}
            <ActiveFilters
              filters={filters}
              updateFilters={handleUpdateFilters}
              clearFilters={handleClearFilters}
            />

            {/* Loading / Results Viewport */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="bg-card/20 border border-border/60 rounded-xl h-72 flex flex-col justify-between p-4">
                    <div className="bg-secondary/40 aspect-[4/3] rounded-lg w-full"></div>
                    <div className="bg-secondary/40 h-4 rounded w-3/4 mt-4"></div>
                    <div className="bg-secondary/40 h-3 rounded w-1/2 mt-2"></div>
                    <div className="bg-secondary/40 h-8 rounded w-full mt-6"></div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="border border-border border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg">No Matching Products</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">We couldn&apos;t find any items that match your search filters. Try refining your keywords or clearing active filters.</p>
                <Button className="mt-6 font-semibold" onClick={handleClearFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'flex flex-col gap-6'
                }
              >
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="animate-fade-in">
                    <ProductCardView
                      product={product}
                      viewMode={view}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Stepper Pagination */}
            {!isLoading && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => updateQueryParams({ page: String(p) })}
              />
            )}
          </main>
        </div>
      </div>

      {/* Floating Action Filter Row (Mobile view-only) */}
      <div className="lg:hidden sticky bottom-6 left-0 right-0 flex justify-center z-40 px-4">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-extrabold text-xs uppercase tracking-wider rounded-full shadow-2xl hover:scale-105 active:scale-95 duration-150 border border-primary/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
          </svg>
          Filter & Refine
        </button>
      </div>

      {/* Mobile Filters slide-up Bottom Sheet drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in lg:hidden">
          <div className="w-full bg-card border-t border-border rounded-t-3xl max-h-[85vh] overflow-y-auto flex flex-col p-6 animate-slide-up shadow-2xl">
            {/* Drawer Drag line & Close Button */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <span className="font-bold text-base text-foreground">Filter Catalog</span>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar content copy */}
            <FilterSidebar
              filters={filters}
              updateFilters={handleUpdateFilters}
              clearFilters={handleClearFilters}
            />

            {/* Action buttons */}
            <div className="mt-8 border-t border-border pt-4">
              <Button onClick={() => setIsMobileFiltersOpen(false)} className="w-full font-bold">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Suspense Loader component
function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-8 items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      <span className="text-xs text-muted-foreground font-semibold mt-4">Loading catalog inventory...</span>
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<SearchSkeleton />}>
      <SearchPageContent />
    </React.Suspense>
  );
}
