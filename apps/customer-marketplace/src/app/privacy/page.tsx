'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground font-semibold">
              Effective Date: 01-07-2026
            </p>
          </div>

          <div className="h-px bg-border/60 my-6" />

          <p className="text-base text-muted-foreground leading-relaxed">
            Welcome to <strong>Villex</strong>
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use our website, mobile applications, physical stores, and related services.
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            By accessing or using our Marketplace, you acknowledge that you have read and understood this Privacy Policy.
          </p>

          <div className="h-px bg-border/60 my-6" />

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may collect the following categories of information:
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-4">Personal Information</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Mobile Number</li>
              <li>Delivery Address</li>
              <li>Billing Address</li>
              <li>National ID (where required)</li>
              <li>Date of Birth (if voluntarily provided)</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">Account Information</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Username</li>
              <li>Password (stored in encrypted form)</li>
              <li>Account Preferences</li>
              <li>Order History</li>
              <li>Wishlist</li>
              <li>Saved Addresses</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">Seller Information</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For approved sellers, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Business Name</li>
              <li>Business Registration Information</li>
              <li>Tax Information (where applicable)</li>
              <li>Bank Account Details</li>
              <li>Store Logo and Profile Information</li>
              <li>Identity Verification Documents</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">Payment Information</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Payments are processed through authorized payment providers.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not intentionally store complete debit or credit card numbers on our Marketplace unless specifically required and protected in accordance with applicable security standards.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-4">Device & Technical Information</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may automatically collect:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>IP Address</li>
              <li>Browser Type</li>
              <li>Device Information</li>
              <li>Operating System</li>
              <li>Language Preferences</li>
              <li>Time Zone</li>
              <li>Cookies</li>
              <li>Usage Data</li>
              <li>Crash Logs</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use your information to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Create and manage your account.</li>
              <li>Process orders and payments.</li>
              <li>Deliver purchased products.</li>
              <li>Manage returns and refunds.</li>
              <li>Verify seller identities.</li>
              <li>Prevent fraud and unauthorized activity.</li>
              <li>Improve our website and services.</li>
              <li>Provide customer support.</li>
              <li>Send order updates and service notifications.</li>
              <li>Comply with legal obligations.</li>
              <li>Conduct internal reporting and analytics.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where required by law, marketing communications will only be sent with your consent or another lawful basis.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. Cookies & Tracking Technologies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our Marketplace uses cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Remember your login session.</li>
              <li>Save shopping cart information.</li>
              <li>Improve website performance.</li>
              <li>Personalize user experience.</li>
              <li>Measure website traffic.</li>
              <li>Detect fraudulent activity.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may disable cookies through your browser settings; however, some Marketplace features may not function properly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">4. Information Sharing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not sell your personal information.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may share information with:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Payment service providers.</li>
              <li>Courier and delivery partners.</li>
              <li>Approved sellers (only information necessary to fulfill orders).</li>
              <li>Technology service providers.</li>
              <li>Government authorities where legally required.</li>
              <li>Professional advisers (such as auditors or legal advisers) where necessary.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All third parties are expected to use your information only for authorized purposes and in accordance with applicable laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">5. Seller Access to Customer Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Approved sellers receive only the information reasonably necessary to fulfill customer orders, such as:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Customer Name</li>
              <li>Delivery Address</li>
              <li>Contact Number</li>
              <li>Purchased Products</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers must not use customer information for marketing, resale, or any purpose unrelated to fulfilling Marketplace orders without the customer&#39;s consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">6. Data Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement reasonable administrative, technical, and organizational measures to help protect personal information from unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              However, no method of internet transmission or electronic storage can be guaranteed to be completely secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">7. Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain personal information only for as long as necessary to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Provide Marketplace services.</li>
              <li>Complete transactions.</li>
              <li>Resolve disputes.</li>
              <li>Enforce agreements.</li>
              <li>Meet legal, accounting, and regulatory obligations.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When information is no longer required, it will be securely deleted or anonymized where appropriate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">8. Your Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subject to applicable law, you may have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Access your personal information.</li>
              <li>Correct inaccurate information.</li>
              <li>Update your account details.</li>
              <li>Request deletion of eligible personal information.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Some requests may be limited where legal obligations require us to retain certain information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">9. Children&#39;s Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our Marketplace is not intended for children under the age of 13 (or the minimum age required by applicable law).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not knowingly collect personal information from children without appropriate authorization.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">10. Third-Party Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our Marketplace may contain links to third-party websites or services.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are not responsible for the privacy practices or content of third-party platforms.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users should review the privacy policies of those services before providing personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">11. International Data Transfers</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where necessary, personal information may be processed or stored outside your country through trusted service providers.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Appropriate safeguards will be implemented where required by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">12. Marketing Communications</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you choose to receive promotional communications, we may send information about:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>New products</li>
              <li>Promotions</li>
              <li>Discounts</li>
              <li>Marketplace announcements</li>
              <li>Special events</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may unsubscribe from marketing communications at any time using the unsubscribe option provided or by contacting Customer Support.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Service-related communications, such as order confirmations and delivery updates, may still be sent where necessary.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">13. Changes to This Privacy Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Material changes will be communicated through our website, user account, email, or other official communication channels where appropriate.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The updated version will become effective on the date specified at the top of this Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">14. Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:
            </p>
            <p className="text-sm text-foreground font-semibold">
              <strong>[Villex]</strong> Customer Service
            </p>
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
