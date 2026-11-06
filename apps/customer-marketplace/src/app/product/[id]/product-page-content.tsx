'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Button, Card } from '@villex/ui';
import { ProductGallery } from '@/features/catalog/components/product-gallery';
import { ProductInfo } from '@/features/catalog/components/product-info';
import { DeliveryEstimator } from '@/features/catalog/components/delivery-estimator';
import { SellerCard } from '@/features/catalog/components/seller-card';
import { ProductReviews } from '@/features/catalog/components/product-reviews';
import { ProductFAQ } from '@/features/catalog/components/product-faq';
import { Product } from '@/features/catalog/components/product-card-view';

// Rich catalog details with images arrays
interface ProductPageContentProps {
  productId: string;
}

export function ProductPageContent({ productId }: ProductPageContentProps) {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [productInfo, setProductInfo] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?id=${encodeURIComponent(productId)}`).catch((err) => {
          console.warn('Product page fetch warning:', err);
          return null;
        });
        if (response && response.ok) {
          const product = await response.json().catch(() => null);
          if (product) {
            setProductInfo(product);

            // Fetch related products
            const relResponse = await fetch(`/api/products?category=${encodeURIComponent(product.category)}`).catch((err) => {
              console.warn('Related products fetch warning:', err);
              return null;
            });
            if (relResponse && relResponse.ok) {
              const relData: Product[] = await relResponse.json().catch(() => []);
              if (Array.isArray(relData)) {
                setRelatedProducts(relData.filter(p => p.id !== product.id).slice(0, 3));
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch product details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductData();
  }, [productId]);

  const handleAddToCart = (name: string) => {
    setToastMessage(`Added "${name}" to your cart.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Loading Product Details...</span>
        </div>
      </div>
    );
  }

  if (!productInfo) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-2xl">
            📦
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="font-bold text-lg text-foreground">Product Not Found</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              We couldn&apos;t resolve the details of the product with ID <code className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded text-primary">{productId}</code>.
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

  const gallery = productInfo.gallery && productInfo.gallery.length > 0
    ? productInfo.gallery
    : productInfo.images && productInfo.images.length > 0
      ? productInfo.images
      : [productInfo.image];

  const specs = productInfo.specs || {
    "Model": productInfo.sku,
    "Category": productInfo.category,
    "Price": `PKR ${productInfo.price.toLocaleString()}`
  };

  const sellerName = productInfo.storeName || 'ElectroPulse Store';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      {/* Marketplace navbar */}
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

      {/* Main product PDP wrapper */}
      <div className="container mx-auto px-4 py-8 flex-grow space-y-12">
        {/* Breadcrumb row */}
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-semibold">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-foreground">Catalog</Link>
          <span>/</span>
          <span className="capitalize">{productInfo.category}</span>
          <span>/</span>
          <span className="text-foreground font-bold truncate max-w-xs">{productInfo.name}</span>
        </div>

        {/* Top Media Gallery & Primary Info Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Sticky Gallery Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <ProductGallery images={gallery} name={productInfo.name} />
          </div>

          {/* Right Primary Details Column */}
          <div className="lg:col-span-7 space-y-8">
            <ProductInfo product={productInfo} onAddToCart={handleAddToCart} />
            <DeliveryEstimator />
          </div>
        </div>

        {/* Seller Info Segment */}
        <div className="border-t border-border pt-10">
          <SellerCard sellerName={sellerName} />
        </div>

        {/* Product specs & details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Detailed specs */}
          <div className="lg:col-span-7 space-y-5">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-3">Product Specifications</h3>
            
            <table className="w-full text-xs md:text-sm text-left border-collapse border border-border rounded-xl overflow-hidden">
              <tbody className="divide-y divide-border">
                {Object.entries(specs).map(([key, val]) => (
                  <tr key={key} className="bg-card/10">
                    <td className="p-4 font-bold text-muted-foreground w-1/3 bg-secondary/25 border-r border-border/80 uppercase tracking-wider text-[10px]">
                      {key}
                    </td>
                    <td className="p-4 text-foreground font-medium">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional info description */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-3">About this item</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
              Experience audiophile standard dynamics combined with active lifestyle integrations. Each {productInfo.name} undergoes direct sound calibration and structural stress inspections to match highest quality standard parameters. Packaged inside premium Buy Babu verification materials.
            </p>
          </div>
        </div>

        {/* FAQ Accordions */}
        <div className="border-t border-border pt-10">
          <ProductFAQ />
        </div>

        {/* Customer Reviews feedback */}
        <div className="border-t border-border pt-10">
          <ProductReviews productId={productInfo.id} />
        </div>

        {/* Related products recommendations carousel */}
        <div className="border-t border-border pt-10 space-y-6">
          <div>
            <h3 className="font-bold text-lg text-foreground">Customers Also Viewed</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Personalized recommendations matching search patterns.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((prod) => (
              <Card key={prod.id} className="overflow-hidden flex flex-col group border-border hover:border-primary/20 transition-all duration-300">
                <div className="relative aspect-video bg-secondary/20 flex items-center justify-center border-b border-border overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <img src={prod.image} alt={prod.name} className="max-w-full max-h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">{prod.brand}</span>
                    <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors cursor-pointer">
                      <Link href={`/product/${prod.id}`}>{prod.name}</Link>
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-black text-foreground">PKR {prod.price.toLocaleString()}</span>
                    <Link href={`/product/${prod.id}`}>
                      <Button size="sm" variant="outline" className="text-xs h-8">View Detail</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="border-t border-border bg-card/10 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Buy Babu Multi-Vendor Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
