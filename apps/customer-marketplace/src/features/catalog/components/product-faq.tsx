'use client';

import * as React from 'react';
import { Card } from '@villex/ui';

interface FAQItem {
  q: string;
  a: string;
}

export function ProductFAQ() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'Does this product come with an official brand warranty?',
      a: 'Yes! All premium electronics from certified partner stores come with a 1-Year Local Brand Warranty. You will receive a stamped warranty card inside the retail packaging. Claims can be registered directly at authorized Sony service centers or processed through the Buy Babu support desk.',
    },
    {
      q: 'Can I inspect the parcel before paying for Cash on Delivery?',
      a: 'Absolutely! With Buy Babu Open-Parcel Inspection, you can open the shipping box and verify the product authenticity in front of the rider before completing the payment. This is part of our commitment to trust and secure shipping.',
    },
    {
      q: 'How does the 7-Day Refund Policy work?',
      a: 'If you receive a defective, damaged, or incorrect item, you can initiate a return within 7 days. Go to your Orders tab in the dashboard, click "Return Item", and select the reason. Buy Babu will schedule a free pickup from your address. The funds held in our escrow will be refunded back to you instantly upon return arrival verification.',
    },
    {
      q: 'What is Buy Babu Escrow Protection?',
      a: 'To prevent online buyer fraud, Buy Babu utilizes an Escrow holding model. When you pay online (via credit card or bank transfer), your funds are not sent directly to the vendor. Instead, they are held by Buy Babu. The vendor only receives the funds once the tracker confirms delivery and you mark the item as approved (or 7 days elapse without disputes).',
    },
  ];

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="border-b border-border pb-4">
        <h3 className="font-bold text-lg text-foreground">Frequently Asked Questions</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Quick answers to typical queries about payments, shipping speed, and warranty policies.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <Card key={idx} className="overflow-hidden border-border bg-card/10">
              {/* Question header */}
              <button
                onClick={() => handleToggle(idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-foreground hover:text-primary transition-colors focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}>
                  ▼
                </span>
              </button>

              {/* Answer content (collapsible) */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-52 opacity-100 border-t border-border/40 p-4 bg-secondary/15' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
