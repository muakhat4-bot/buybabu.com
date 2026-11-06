'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';

export default function VendorRulesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-sm text-primary hover:underline inline-flex items-center gap-1.5 font-medium transition-colors"
          >
            ← Back to Marketplace
          </Link>
        </div>

        <article className="prose dark:prose-invert max-w-none bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
              Seller Fulfillment Policy (FBA Model)
            </h1>
            <p className="text-sm text-muted-foreground font-semibold">
              Effective Date: This Seller Fulfillment Policy applies to all sellers registered on our marketplace.
            </p>
          </div>

          <div className="h-px bg-border/60 my-6" />

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Welcome to our Marketplace.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our platform operates under a <strong>Fulfilled by Marketplace (FBA)</strong> model. All products sold on our platform must first be delivered to our fulfillment center or authorized physical store before they become available for sale.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By registering as a seller, you acknowledge that you have read, understood, and agreed to comply with this Seller Fulfillment Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. Inventory Submission</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All sellers are required to deliver their products to our designated warehouse or physical store.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Products will only be listed for sale after:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Quality inspection</li>
              <li>Inventory verification</li>
              <li>Product approval</li>
              <li>SKU assignment</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Products that fail inspection may be rejected and returned to the seller.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. Product Ownership</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The seller retains full legal ownership of the products until they are sold to a customer.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our marketplace acts solely as a fulfillment, storage, and sales facilitator.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">4. Product Quality Requirements</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All products supplied must be:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Brand new (unless specifically approved otherwise)</li>
              <li>Genuine and authentic</li>
              <li>Free from defects</li>
              <li>Safe for customer use</li>
              <li>Properly packaged</li>
              <li>Compliant with applicable laws and regulations</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Counterfeit, damaged, illegal, or prohibited products are strictly forbidden.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">5. Inventory Accuracy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers are responsible for ensuring that all delivered inventory matches the submitted inventory list.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Any discrepancies identified during inspection will be documented and communicated to the seller.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">6. Storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Accepted inventory will be securely stored in our fulfillment facility.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The marketplace will take reasonable measures to protect seller inventory. However, the marketplace shall not be liable for losses resulting from events beyond reasonable control, including natural disasters, government actions, theft despite reasonable security measures, or other force majeure events.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">7. Order Fulfillment</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once a customer places an order:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Our team will pick the product.</li>
              <li>Our team will pack the product.</li>
              <li>Our team will dispatch the product.</li>
              <li>Our team will provide shipment tracking.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers are not permitted to ship products directly to customers unless specifically authorized in writing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">8. Pricing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers determine the selling price of their products.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The marketplace reserves the right to recommend pricing adjustments for promotional campaigns or market competitiveness.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">9. Marketplace Commission</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The marketplace will deduct the agreed commission and any applicable fulfillment, storage, or service fees before releasing payment to the seller.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Current fee schedules will be available within the Seller Dashboard and may be updated with prior notice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">10. Payments</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seller earnings will be transferred according to the marketplace payout schedule.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Payments may be delayed in cases involving:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Pending customer returns</li>
              <li>Fraud investigations</li>
              <li>Chargebacks</li>
              <li>Policy violations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">11. Returns and Refunds</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customers may request returns in accordance with the Marketplace Return Policy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Returned products will be inspected before determining whether they are:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Restockable</li>
              <li>Damaged</li>
              <li>Used</li>
              <li>Eligible for refund</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where a return results from a seller-related issue (such as defective, incorrect, or counterfeit products), the seller may bear the associated costs in accordance with the fee schedule.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">12. Product Removal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers may request the return of unsold inventory.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Inventory release is subject to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Inventory verification</li>
              <li>Settlement of any outstanding fees</li>
              <li>Processing timelines established by the marketplace</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">13. Restricted Products</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following products are prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Counterfeit goods</li>
              <li>Illegal products</li>
              <li>Expired products</li>
              <li>Hazardous materials</li>
              <li>Weapons</li>
              <li>Narcotics</li>
              <li>Tobacco products (where prohibited)</li>
              <li>Alcohol (where prohibited)</li>
              <li>Adult products (unless specifically approved)</li>
              <li>Stolen property</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The marketplace reserves the right to refuse any product that violates applicable laws or platform policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">14. Policy Violations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The marketplace may suspend or terminate a seller account for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Fraud</li>
              <li>Fake products</li>
              <li>Misrepresentation</li>
              <li>Repeated customer complaints</li>
              <li>Violation of marketplace policies</li>
              <li>Any unlawful activity</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Serious violations may result in permanent account suspension.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">15. Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers remain responsible for the legality, authenticity, safety, and accuracy of the products they supply.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The marketplace's liability is limited to the extent permitted by applicable law and as described in these policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">16. Policy Updates</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The marketplace may update this policy from time to time.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Material changes will be communicated through the Seller Dashboard, email, or other official communication channels before they take effect where required.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Continued use of the marketplace after the effective date of updated policies constitutes acceptance of the revised policy, unless otherwise required by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">17. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any questions regarding this Seller Fulfillment Policy, sellers may contact our Seller Support Team through the official support channels provided on the marketplace.
            </p>
          </section>
        </article>
      </main>

      <footer className="border-t border-border bg-card/60 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Buy Babu Multi-Vendor Marketplace. Designed and engineered for high-performance scale.</p>
        </div>
      </footer>
    </div>
  );
}
