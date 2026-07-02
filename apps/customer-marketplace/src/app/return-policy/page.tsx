'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';

export default function ReturnPolicyPage() {
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
              Return & Refund Policy
            </h1>
            <p className="text-sm text-muted-foreground font-semibold">
              Effective Date: 01-07-2026
            </p>
          </div>

          <div className="h-px bg-border/60 my-6" />

          <p className="text-base text-muted-foreground leading-relaxed">
            At <strong>Villex</strong>, customer satisfaction is important to us. This Return & Refund Policy explains the conditions under which products may be returned or refunded.
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            By placing an order through our Marketplace, you agree to this policy.
          </p>

          <div className="h-px bg-border/60 my-6" />

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Return Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customers may request a return within <strong>7 calendar days</strong> from the date of delivery, provided the product meets the eligibility requirements described in this policy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To qualify for a return, the product must:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Be unused and in its original condition.</li>
              <li>Be returned with all original accessories, manuals, tags, and packaging.</li>
              <li>Include the original purchase invoice or order confirmation.</li>
              <li>Not fall under any non-returnable category listed below.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. Damaged or Broken Products</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you receive a product that is:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Broken</li>
              <li>Physically damaged</li>
              <li>Defective upon arrival</li>
              <li>Incorrect item</li>
              <li>Missing parts</li>
            </ul>
            <p className="text-sm text-foreground font-semibold leading-relaxed">
              <strong>You must notify our Customer Support Team immediately upon receiving the parcel.</strong>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customers are strongly advised to inspect their package at the time of delivery.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Failure to report shipping damage or incorrect items promptly may result in the return or refund request being declined.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Marketplace may request clear photographs or videos of the product, packaging, shipping label, and invoice to verify the claim.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. Seven (7) Day Return Window</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Eligible products may be returned within <strong>7 days</strong> of delivery.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Return requests submitted after the 7-day period will generally not be accepted unless required by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">4. Non-Returnable & Non-Refundable Products</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following items are <strong>not eligible for return or refund</strong>, except where required by applicable law:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Chinese electronic gadgets and accessories.</li>
              <li>Products damaged due to customer misuse, negligence, accidents, or unauthorized repairs.</li>
              <li>Products with missing accessories or original packaging.</li>
              <li>Products showing signs of use beyond reasonable inspection.</li>
              <li>Customized or personalized products.</li>
              <li>Digital products, software, downloadable content, or gift cards.</li>
              <li>Clearance, final sale, or &quot;Non-Returnable&quot; items clearly marked at the time of purchase.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">5. Chinese Gadgets Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
              <strong>All Chinese electronic gadgets and related accessories are sold on a &quot;No Return, No Refund&quot; basis.</strong>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customers are encouraged to carefully review product specifications before placing an order.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This restriction does not affect any rights that cannot legally be excluded under applicable consumer protection laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">6. Return Inspection</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All returned products will undergo an inspection by our Quality Assurance Team.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If the product satisfies the return requirements, the refund or replacement will be processed.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If the returned product fails inspection, it may be returned to the customer without a refund.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">7. Refund Method</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Approved refunds will be processed using the original payment method whenever reasonably possible.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For Cash on Delivery (COD) orders, refunds may be issued through:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Bank Transfer</li>
              <li>Approved Digital Wallet</li>
              <li>Marketplace Wallet (if applicable)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">8. Refund Processing Time</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once the returned product has been received and approved after inspection, refunds will generally be processed within <strong>7 business days</strong>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Actual crediting time may vary depending on the payment provider or financial institution.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">9. Exchange Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where stock is available, eligible products may be exchanged instead of refunded.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If the replacement product is unavailable, an eligible refund may be offered.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">10. Return Shipping</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where the return is approved due to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Marketplace error</li>
              <li>Wrong item shipped</li>
              <li>Product damaged before delivery</li>
              <li>Manufacturing defect confirmed upon inspection</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Marketplace will bear the reasonable return shipping cost.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For returns requested for other eligible reasons, return shipping costs may be the responsibility of the customer unless otherwise stated.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">11. Fraudulent Claims</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Marketplace reserves the right to reject return or refund requests involving:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>False claims</li>
              <li>Altered products</li>
              <li>Intentional damage</li>
              <li>Abuse of the return policy</li>
              <li>Missing or substituted items</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fraudulent activity may result in suspension or permanent closure of the customer&#39;s account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">12. Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any return or refund request, please contact our Customer Support Team as soon as possible.
            </p>
            <ul className="list-none space-y-2 text-sm text-muted-foreground">
              <li><strong>Email:</strong> support@villex.com</li>
              <li><strong>Phone:</strong> 051-5551234</li>
              <li><strong>Website:</strong> <Link href="/" className="text-primary hover:underline">www.villex.com</Link></li>
            </ul>
          </section>
        </article>
      </main>

      <footer className="border-t border-border bg-card/60 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Villex Multi-Vendor Marketplace. Designed and engineered for high-performance scale.</p>
        </div>
      </footer>
    </div>
  );
}
