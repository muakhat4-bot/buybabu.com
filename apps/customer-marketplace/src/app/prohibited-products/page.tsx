'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';

export default function ProhibitedProductsPage() {
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
              Buy Babu Prohibited Products Policy
            </h1>
            <p className="text-sm text-muted-foreground font-semibold">
              Effective Date: 01-07-2026
            </p>
          </div>

          <div className="h-px bg-border/60 my-6" />

          <p className="text-base text-muted-foreground leading-relaxed">
            Welcome to <strong>Buy Babu</strong>.
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            At Buy Babu, we are committed to providing a safe, trusted, and legally compliant marketplace for our customers and sellers.
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            This Prohibited Products Policy identifies products that are not permitted to be listed, stored, advertised, sold, or distributed through the Buy Babu Marketplace or its fulfillment centers.
          </p>

          <p className="text-base text-muted-foreground leading-relaxed font-semibold">
            All sellers are responsible for ensuring that their products comply with this Policy and all applicable laws and regulations of the Islamic Republic of Pakistan.
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            Failure to comply may result in product removal, account suspension, permanent account termination, cancellation of orders, withholding of payments where legally permitted, and reporting to the relevant authorities when required by law.
          </p>

          <div className="h-px bg-border/60 my-6" />

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Illegal Products</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following products are strictly prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Any product prohibited under the laws of Pakistan.</li>
              <li>Stolen goods.</li>
              <li>Smuggled goods.</li>
              <li>Counterfeit or fake products.</li>
              <li>Products obtained through unlawful means.</li>
              <li>Products that infringe intellectual property rights.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. Counterfeit & Trademark Infringement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers must not list:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Fake branded products.</li>
              <li>Unauthorized replicas.</li>
              <li>Trademark-infringing products.</li>
              <li>Copyright-infringing products.</li>
              <li>Pirated software.</li>
              <li>Pirated games.</li>
              <li>Pirated movies.</li>
              <li>Pirated music.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Only genuine and legally authorized products may be sold.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. Weapons & Dangerous Items</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following are prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Firearms.</li>
              <li>Ammunition.</li>
              <li>Explosives.</li>
              <li>Bomb-making materials.</li>
              <li>Grenades.</li>
              <li>Military explosives.</li>
              <li>Illegal knives or other prohibited weapons.</li>
              <li>Items intended primarily for unlawful violence.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lawfully permitted tools or equipment may only be listed where allowed by applicable law and approved by Buy Babu.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">4. Drugs & Controlled Substances</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following may not be sold:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Illegal narcotics.</li>
              <li>Controlled drugs without legal authorization.</li>
              <li>Recreational drugs prohibited by law.</li>
              <li>Drug paraphernalia intended for unlawful drug use.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Prescription medicines may only be sold where expressly permitted by law and approved in writing by Buy Babu.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">5. Alcohol & Tobacco</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unless specifically permitted by applicable law and approved by Buy Babu, the following are prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Alcoholic beverages.</li>
              <li>Cigarettes.</li>
              <li>Cigars.</li>
              <li>E-cigarettes.</li>
              <li>Vapes.</li>
              <li>Tobacco products.</li>
              <li>Nicotine products.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">6. Adult & Obscene Products</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Products that are illegal or inconsistent with Pakistani laws and public decency standards are prohibited, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Pornographic material.</li>
              <li>Sex toys.</li>
              <li>Adult entertainment products.</li>
              <li>Explicit sexual content.</li>
              <li>Obscene publications.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">7. Offensive & Hate Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Products promoting or encouraging:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Religious hatred.</li>
              <li>Sectarian violence.</li>
              <li>Terrorism.</li>
              <li>Extremism.</li>
              <li>Racism.</li>
              <li>Ethnic hatred.</li>
              <li>Criminal activity.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              are strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">8. Hazardous Materials</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following products are prohibited unless specifically approved and legally permitted:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Toxic chemicals.</li>
              <li>Hazardous industrial chemicals.</li>
              <li>Radioactive materials.</li>
              <li>Biohazard materials.</li>
              <li>Dangerous laboratory substances.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">9. Expired & Unsafe Products</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers may not sell:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Expired products.</li>
              <li>Recalled products.</li>
              <li>Unsafe products.</li>
              <li>Products with altered expiry dates.</li>
              <li>Damaged consumable products.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">10. Food & Beverages</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Food products must:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Be legally permitted for sale in Pakistan.</li>
              <li>Be within their expiry date.</li>
              <li>Be properly labeled.</li>
              <li>Be safe for consumption.</li>
              <li>Comply with applicable food safety regulations.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buy Babu may reject products that do not meet its quality standards.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">11. Cosmetics & Personal Care</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cosmetics and personal care products must:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Be genuine.</li>
              <li>Be properly labeled.</li>
              <li>Be within expiry.</li>
              <li>Comply with applicable regulatory requirements.</li>
              <li>Not contain prohibited substances.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Counterfeit beauty products are strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">12. Electronics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Electronic products must:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Be safe for consumer use.</li>
              <li>Be accurately described.</li>
              <li>Not be counterfeit.</li>
              <li>Include genuine accessories where applicable.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buy Babu may refuse products with known safety defects or excessive customer complaints.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">13. Animals & Wildlife</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following are prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Live animals.</li>
              <li>Protected wildlife.</li>
              <li>Endangered species.</li>
              <li>Products whose sale is prohibited under wildlife protection laws.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">14. Financial & Identity Documents</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The following may not be sold:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Government-issued identity documents.</li>
              <li>Passports.</li>
              <li>Driver&#39;s licenses.</li>
              <li>National identity cards.</li>
              <li>Blank certificates intended for fraud.</li>
              <li>Counterfeit documents.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">15. Stolen Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Any item suspected of being stolen, unlawfully acquired, or otherwise involved in criminal activity is prohibited.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buy Babu reserves the right to cooperate with law enforcement authorities where required.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">16. Restricted Products</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Certain products may require prior written approval from Buy Babu before listing, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>High-value electronics.</li>
              <li>Precious metals.</li>
              <li>Precious stones.</li>
              <li>Professional equipment.</li>
              <li>Regulated medical devices.</li>
              <li>Other categories identified by Buy Babu from time to time.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Approval does not remove the seller&#39;s responsibility to comply with applicable laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">17. Seller Responsibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each seller is solely responsible for ensuring that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Products comply with Pakistani laws.</li>
              <li>Products comply with Buy Babu policies.</li>
              <li>Product descriptions are accurate.</li>
              <li>Products are genuine and safe.</li>
              <li>Necessary licenses or approvals are obtained where required.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">18. Enforcement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buy Babu reserves the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Reject inventory during inspection.</li>
              <li>Remove product listings.</li>
              <li>Cancel orders.</li>
              <li>Suspend seller accounts.</li>
              <li>Permanently terminate seller accounts.</li>
              <li>Withhold payments where legally permitted.</li>
              <li>Report unlawful activities to the relevant authorities.</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buy Babu may take these actions without prior notice where necessary to protect customers, comply with legal obligations, or maintain marketplace integrity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">19. Policy Updates</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buy Babu may amend this Prohibited Products Policy from time to time.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Updated versions will be published on the Marketplace and will become effective on the date specified in the revised policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">20. Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions regarding this Prohibited Products Policy, please contact:
            </p>
            <p className="text-sm text-foreground font-semibold">
              Buy Babu Customer Support
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
