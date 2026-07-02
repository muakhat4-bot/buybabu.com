import * as React from 'react';

export interface MegaMenuProps {
  isOpen: boolean;
}

export function MegaMenu({ isOpen }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 right-0 top-16 w-full bg-card border-b border-border shadow-2xl p-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="container mx-auto grid grid-cols-4 gap-8">
        {/* Column 1 */}
        <div className="space-y-4">
          <h4 className="font-bold text-foreground tracking-wider text-sm uppercase">Electronics</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">Mobile Phones</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Laptops & Computers</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Smart Watches</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Audio & Speakers</a></li>
          </ul>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <h4 className="font-bold text-foreground tracking-wider text-sm uppercase">Fashion & Apparel</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">Men&apos;s Clothing</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Women&apos;s Clothing</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Shoes & Sneakers</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Watches & Accessories</a></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <h4 className="font-bold text-foreground tracking-wider text-sm uppercase">Home & Living</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">Smart Furniture</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Kitchen Appliances</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Decor & Lights</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Bedding & Bath</a></li>
          </ul>
        </div>

        {/* Column 4 (Banner Promo Card) */}
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex flex-col justify-between border border-primary/10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Featured Offer</span>
            <h5 className="font-bold text-base text-foreground leading-tight">Samsung Galaxy S26 Series</h5>
            <p className="text-xs text-muted-foreground leading-snug mt-1">Pre-order now to secure exclusive gifts and 0% markup options.</p>
          </div>
          <a href="#" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-4">
            Pre-order Now <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
