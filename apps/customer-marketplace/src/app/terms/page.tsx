'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';

export default function TermsPage() {
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
              Marketplace Terms & Conditions
            </h1>
            <p className="text-sm text-muted-foreground font-semibold">
              Effective Date: 01-07-2026
            </p>
          </div>

          <div className="h-px bg-border/60 my-6" />

          <p className="text-base text-foreground leading-relaxed">
            Welcome to <strong>Buy Babu</strong>
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            These Marketplace Terms & Conditions (&quot;Terms&quot;) govern your access to and use of our website, mobile applications, physical stores, and related services. By accessing or using our Marketplace, you agree to be bound by these Terms.
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            If you do not agree with these Terms, you must not use our Marketplace.
          </p>

          <div className="h-px bg-border/60 my-6" />

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Definitions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For the purposes of these Terms:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li><strong>Marketplace</strong> means Buy Babu.</li>
              <li><strong>Customer</strong> means any person purchasing products through the Marketplace.</li>
              <li><strong>Seller</strong> means an individual or business approved to sell products through the Marketplace.</li>
              <li><strong>User</strong> means any visitor, customer, or seller using the Marketplace.</li>
              <li><strong>Order</strong> means a confirmed purchase placed through the Marketplace.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To use our Marketplace, you must:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Be at least 18 years of age or otherwise have legal capacity under applicable law.</li>
              <li>Provide accurate, complete, and up-to-date information.</li>
              <li>Use the Marketplace only for lawful purposes.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to refuse service, suspend access, or terminate accounts where permitted by these Terms or applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. User Accounts</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users are responsible for maintaining the confidentiality of their account credentials.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Keep your password secure.</li>
              <li>Notify us immediately of any unauthorized access.</li>
              <li>Accept responsibility for activities conducted through your account unless caused by our negligence or security failure.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">4. Marketplace Model</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our Marketplace operates under a <strong>Fulfilled by Marketplace (FBA)</strong> model.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All products offered for sale are stored, packed, and dispatched by our fulfillment operations after being received from approved sellers.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers are not authorized to ship products directly to customers unless expressly approved by the Marketplace.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">5. Product Listings</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We strive to ensure product descriptions, specifications, prices, and images are accurate.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              However:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Product images may differ slightly from actual products.</li>
              <li>Packaging may vary.</li>
              <li>Minor specification changes by manufacturers may occur.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Obvious pricing or typographical errors may be corrected before order acceptance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">6. Pricing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All prices displayed are subject to change without prior notice.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Applicable taxes, shipping charges, or other fees will be shown during checkout where required.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">7. Orders</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An order confirmation acknowledges receipt of your order request but does not necessarily constitute final acceptance.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to cancel or refuse an order due to reasons including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Inventory unavailability</li>
              <li>Pricing errors</li>
              <li>Suspected fraud</li>
              <li>Payment verification issues</li>
              <li>Legal or regulatory requirements</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where payment has already been collected for a cancelled order, an appropriate refund will be processed.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">8. Payments</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We accept payment methods displayed during checkout.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Orders may be subject to payment verification.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to refuse transactions reasonably suspected of fraud or unauthorized use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">9. Shipping & Delivery</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Estimated delivery times are provided for convenience only and are not guaranteed unless expressly stated.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Delivery delays may occur due to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Weather conditions</li>
              <li>Courier delays</li>
              <li>Public holidays</li>
              <li>Government restrictions</li>
              <li>Other events beyond our reasonable control</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Risk of loss passes to the customer upon delivery, except where applicable law provides otherwise.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">10. Returns & Refunds</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Returns and refunds are governed by our separate Return & Refund Policy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Products returned must satisfy the eligibility conditions described in that policy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Certain categories may be non-returnable where permitted by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">11. Physical Store Returns</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where applicable, eligible products purchased through our Marketplace may be returned at authorized physical store locations in accordance with our Return & Refund Policy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Proof of purchase may be required.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">12. Seller Responsibilities</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Approved sellers must:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Supply genuine products.</li>
              <li>Comply with applicable laws.</li>
              <li>Maintain product quality.</li>
              <li>Follow all Marketplace policies.</li>
              <li>Honor applicable warranties.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers remain responsible for the legality, authenticity, and safety of the products they provide.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">13. Prohibited Activities</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users must not:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Commit fraud.</li>
              <li>Upload false information.</li>
              <li>Attempt unauthorized access.</li>
              <li>Distribute malware.</li>
              <li>Interfere with Marketplace operations.</li>
              <li>Infringe intellectual property rights.</li>
              <li>Engage in unlawful conduct.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Violation may result in account suspension or termination.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">14. Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All Marketplace content, including logos, trademarks, graphics, software, text, layouts, and designs, is owned by or licensed to the Marketplace.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No content may be copied, reproduced, distributed, or used without prior written permission, except as permitted by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">15. User Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where users submit reviews, ratings, images, or other content, they grant the Marketplace a non-exclusive, worldwide, royalty-free license to display, reproduce, and use such content for operating and promoting the Marketplace, subject to applicable law and our Privacy Policy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users remain responsible for ensuring that submitted content does not infringe the rights of others.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">16. Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our collection and use of personal information is governed by our Privacy Policy.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By using the Marketplace, you acknowledge that your information will be handled in accordance with that policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">17. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, the Marketplace shall not be liable for indirect, incidental, consequential, special, or punitive damages arising from the use of the Marketplace.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nothing in these Terms excludes or limits liability where such exclusion is prohibited by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">18. Indemnification</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless the Marketplace, its officers, employees, affiliates, and partners against claims, losses, liabilities, damages, and expenses arising from:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Your breach of these Terms.</li>
              <li>Your misuse of the Marketplace.</li>
              <li>Your violation of applicable law.</li>
              <li>Your infringement of third-party rights.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the extent permitted by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">19. Force Majeure</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Marketplace shall not be responsible for delays or failure to perform obligations resulting from events beyond its reasonable control, including natural disasters, war, strikes, pandemics, government actions, internet outages, or failures of third-party service providers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">20. Suspension and Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may suspend or terminate accounts where reasonably necessary due to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Policy violations</li>
              <li>Fraud</li>
              <li>Illegal activities</li>
              <li>Security concerns</li>
              <li>Repeated abuse of Marketplace services</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where appropriate, affected users may be informed of the reasons for such action.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">21. Changes to These Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these Terms from time to time.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Material changes will be communicated through our website, user account, email, or other official communication channels before taking effect where required by applicable law.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Continued use of the Marketplace after the effective date of updated Terms constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">22. Governing Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms shall be governed by and interpreted in accordance with the laws of the <strong>Islamic Republic of Pakistan</strong>, unless otherwise required by mandatory applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">23. Dispute Resolution</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We encourage users to first contact our Customer Support Team to resolve disputes amicably.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where a dispute cannot be resolved informally, it shall be subject to the jurisdiction of the competent courts of Pakistan, unless applicable law requires otherwise.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">24. Contact Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For questions regarding these Terms & Conditions, please contact:
            </p>
            <p className="text-sm text-foreground font-semibold">
              <strong>Buy Babu</strong> Customer Service Team.
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
