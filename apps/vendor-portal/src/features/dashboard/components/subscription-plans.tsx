'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@villex/ui';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type PlanTier = 'FREE' | 'PREMIUM' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface SubscriptionPlan {
  tier: PlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  commissionRate: number;
  maxProducts: number | null;
  maxMonthlyOrders: number | null;
  features: string[];
  limitedFeatures: string[];
  badge?: string;
}

export interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  invoiceId: string;
}

interface UsageMetric {
  label: string;
  used: number;
  limit: number | null;
  unit: string;
  icon: React.ReactNode;
}

interface SubscriptionPlansProps {
  currentPlan: PlanTier;
  billingCycle: BillingCycle;
  onUpgrade: (plan: PlanTier, cycle: BillingCycle) => void;
  onDowngrade: (plan: PlanTier) => void;
}

// ─────────────────────────────────────────────────────────────
// Static Plan Configuration
// ─────────────────────────────────────────────────────────────

const PLANS: SubscriptionPlan[] = [
  {
    tier: 'FREE',
    name: 'Starter',
    tagline: 'Perfect for new sellers testing the marketplace',
    monthlyPrice: 0,
    annualPrice: 0,
    commissionRate: 12,
    maxProducts: 25,
    maxMonthlyOrders: 50,
    features: [
      'Up to 25 product listings',
      'Up to 50 orders/month',
      'Basic order management',
      'Standard support (48h response)',
      'Basic sales analytics',
      'Escrow-protected payouts',
    ],
    limitedFeatures: [
      'No verified seller badge',
      'No promotional slots',
      'No advanced analytics',
      'No API access',
    ],
  },
  {
    tier: 'PREMIUM',
    name: 'Growth',
    tagline: 'For scaling sellers who want lower fees and more reach',
    monthlyPrice: 4999,
    annualPrice: 47999,
    commissionRate: 7,
    maxProducts: 500,
    maxMonthlyOrders: 1000,
    badge: 'Most Popular',
    features: [
      'Up to 500 product listings',
      'Up to 1,000 orders/month',
      'Advanced order & return management',
      'Priority support (4h response)',
      'Full revenue & conversion analytics',
      'Escrow-protected payouts',
      'Verified Seller Badge',
      'Promotional homepage slots (2/mo)',
      'Bulk CSV product import/export',
      'Discount & coupon tools',
    ],
    limitedFeatures: [
      'No dedicated account manager',
      'No API access',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Unlimited power for high-volume merchants & brands',
    monthlyPrice: 24999,
    annualPrice: 239999,
    commissionRate: 4,
    maxProducts: null,
    maxMonthlyOrders: null,
    badge: 'Best Value',
    features: [
      'Unlimited product listings',
      'Unlimited monthly orders',
      'Full order management suite',
      'Dedicated account manager (SLA)',
      'Enterprise analytics & custom reports',
      'Priority escrow & instant payouts',
      'Gold Verified Seller Badge',
      'Promotional homepage slots (10/mo)',
      'Bulk CSV & API product sync',
      'Multi-store management',
      'Custom discount engines',
      'Webhook API access',
      'White-label storefront options',
      'Early access to beta features',
    ],
    limitedFeatures: [],
  },
];

const BILLING_HISTORY: BillingRecord[] = [
  {
    id: 'b1',
    date: '2026-06-01',
    description: 'Growth Plan - Monthly Subscription',
    amount: 4999,
    status: 'PAID',
    invoiceId: 'INV-VLX-20260601',
  },
  {
    id: 'b2',
    date: '2026-05-01',
    description: 'Growth Plan - Monthly Subscription',
    amount: 4999,
    status: 'PAID',
    invoiceId: 'INV-VLX-20260501',
  },
  {
    id: 'b3',
    date: '2026-04-01',
    description: 'Growth Plan - Monthly Subscription',
    amount: 4999,
    status: 'PAID',
    invoiceId: 'INV-VLX-20260401',
  },
  {
    id: 'b4',
    date: '2026-03-01',
    description: 'Starter Plan - Monthly Subscription',
    amount: 0,
    status: 'PAID',
    invoiceId: 'INV-VLX-20260301',
  },
];

const COMPARISON_ROWS = [
  { label: 'Product Listings', free: '25 products', premium: '500 products', enterprise: 'Unlimited' },
  { label: 'Monthly Orders', free: '50 orders', premium: '1,000 orders', enterprise: 'Unlimited' },
  { label: 'Commission Rate', free: '12%', premium: '7%', enterprise: '4%' },
  { label: 'Analytics', free: 'Basic', premium: 'Advanced', enterprise: 'Enterprise + Custom' },
  { label: 'Support Response', free: '48 hours', premium: '4 hours', enterprise: 'Dedicated SLA' },
  { label: 'Verified Badge', free: false, premium: true, enterprise: 'Gold Badge' },
  { label: 'Promotional Slots', free: false, premium: '2 / month', enterprise: '10 / month' },
  { label: 'Bulk Import/Export', free: false, premium: true, enterprise: true },
  { label: 'API & Webhooks', free: false, premium: false, enterprise: true },
  { label: 'Multi-Store', free: false, premium: false, enterprise: true },
  { label: 'Coupon Engine', free: false, premium: true, enterprise: true },
  { label: 'White-label Storefront', free: false, premium: false, enterprise: true },
];

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlanCard({
  plan,
  isCurrentPlan,
  billingCycle,
  onSelect,
}: {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  billingCycle: BillingCycle;
  onSelect: () => void;
}) {
  const monthlyEquivalent =
    billingCycle === 'ANNUAL' && plan.annualPrice > 0
      ? Math.round(plan.annualPrice / 12)
      : plan.monthlyPrice;
  const annualSavings =
    plan.monthlyPrice > 0
      ? Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100)
      : 0;

  const tierColors: Record<PlanTier, string> = {
    FREE: 'from-slate-500 to-slate-600',
    PREMIUM: 'from-violet-600 to-purple-700',
    ENTERPRISE: 'from-amber-500 to-orange-600',
  };

  const tierBorderColors: Record<PlanTier, string> = {
    FREE: 'border-slate-800',
    PREMIUM: 'border-violet-700/60',
    ENTERPRISE: 'border-amber-600/60',
  };

  const tierGlowColors: Record<PlanTier, string> = {
    FREE: '',
    PREMIUM: 'shadow-[0_0_40px_-8px_rgba(139,92,246,0.25)]',
    ENTERPRISE: 'shadow-[0_0_40px_-8px_rgba(245,158,11,0.20)]',
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card p-6 transition-all duration-300 ${tierBorderColors[plan.tier]} ${tierGlowColors[plan.tier]} ${
        isCurrentPlan ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      }`}
    >
      {plan.badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${tierColors[plan.tier]} shadow-lg`}
        >
          {plan.badge}
        </span>
      )}

      {isCurrentPlan && (
        <span className="absolute -top-3 right-5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-foreground bg-primary shadow-lg">
          Current Plan
        </span>
      )}

      <div className="mb-5">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierColors[plan.tier]} flex items-center justify-center mb-3 shadow-lg`}
        >
          <span className="text-lg">
            {plan.tier === 'FREE' ? '🚀' : plan.tier === 'PREMIUM' ? '⚡' : '🏆'}
          </span>
        </div>
        <h3 className="text-base font-black text-foreground">{plan.name}</h3>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5 leading-snug">{plan.tagline}</p>
      </div>

      <div className="mb-5 pb-5 border-b border-border/50">
        <div className="flex items-end gap-1">
          <span className="text-xs font-bold text-muted-foreground">PKR</span>
          <span className="text-3xl font-black text-foreground">
            {monthlyEquivalent === 0 ? '0' : monthlyEquivalent.toLocaleString()}
          </span>
          {plan.monthlyPrice > 0 && (
            <span className="text-xs text-muted-foreground font-semibold pb-1">/mo</span>
          )}
        </div>
        {billingCycle === 'ANNUAL' && annualSavings > 0 && (
          <p className="text-[11px] text-emerald-500 font-bold mt-1">
            Save {annualSavings}% annually · PKR {plan.annualPrice.toLocaleString()}/yr
          </p>
        )}
        {plan.monthlyPrice === 0 && (
          <p className="text-[11px] text-emerald-500 font-bold mt-1">Forever free to start</p>
        )}

        <div className="mt-3 flex items-center flex-wrap gap-2">
          <span className="text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
            {plan.commissionRate}% Commission
          </span>
          {plan.maxProducts !== null && (
            <span className="text-[11px] bg-secondary/60 text-muted-foreground font-bold px-2 py-0.5 rounded-full border border-border/60">
              {plan.maxProducts} Products
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-2 flex-grow mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[11px] text-foreground font-medium">
            <CheckIcon className="text-emerald-500 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
        {plan.limitedFeatures.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <CrossIcon className="text-muted-foreground/30 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        disabled={isCurrentPlan}
        className={`w-full text-xs font-black uppercase tracking-wider py-2.5 ${
          isCurrentPlan
            ? 'opacity-50 cursor-not-allowed'
            : plan.tier === 'PREMIUM'
              ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20'
              : plan.tier === 'ENTERPRISE'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20'
                : ''
        }`}
      >
        {isCurrentPlan
          ? 'Current Plan'
          : plan.tier === 'FREE'
            ? 'Downgrade to Starter'
            : `Upgrade to ${plan.name}`}
      </Button>
    </div>
  );
}

function UsageMeter({ metric }: { metric: UsageMetric }) {
  const isUnlimited = metric.limit === null;
  const isLimitZero = metric.limit === 0;
  const pct = isUnlimited || isLimitZero ? 0 : Math.min((metric.used / metric.limit!) * 100, 100);
  const isWarning = !isUnlimited && !isLimitZero && pct >= 80;
  const isCritical = !isUnlimited && !isLimitZero && pct >= 95;

  return (
    <div className="bg-card/60 border border-border/60 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-primary">{metric.icon}</span>
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
            {metric.label}
          </span>
        </div>
        <span
          className={`text-xs font-black ${
            isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-muted-foreground'
          }`}
        >
          {isUnlimited
            ? `${metric.used.toLocaleString()} ${metric.unit}`
            : isLimitZero
              ? `Not available on this plan`
              : `${metric.used.toLocaleString()} / ${metric.limit!.toLocaleString()} ${metric.unit}`}
        </span>
      </div>
      {isUnlimited ? (
        <div className="h-1.5 rounded-full bg-emerald-500/20 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
        </div>
      ) : isLimitZero ? (
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full w-0 rounded-full" />
        </div>
      ) : (
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCritical
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : isWarning
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'bg-gradient-to-r from-primary to-violet-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <p className="text-[10px] text-emerald-500 font-bold mt-1">Unlimited — No restrictions</p>
      )}
      {isLimitZero && (
        <p className="text-[10px] text-muted-foreground font-bold mt-1">Upgrade to unlock this feature</p>
      )}
      {!isUnlimited && !isLimitZero && isCritical && (
        <p className="text-[10px] text-red-400 font-bold mt-1">
          ⚠ Limit nearly reached — Upgrade recommended
        </p>
      )}
      {!isUnlimited && !isLimitZero && isWarning && !isCritical && (
        <p className="text-[10px] text-amber-400 font-bold mt-1">
          Usage at {Math.round(pct)}% — Consider upgrading soon
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function SubscriptionPlans({
  currentPlan,
  billingCycle: initialCycle,
  onUpgrade,
  onDowngrade,
}: SubscriptionPlansProps) {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>(initialCycle);
  const [activeView, setActiveView] = React.useState<'plans' | 'compare' | 'billing' | 'usage'>(
    'plans',
  );
  const [confirmPlan, setConfirmPlan] = React.useState<PlanTier | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const currentPlanData = PLANS.find((p) => p.tier === currentPlan)!;

  const usageMetrics: UsageMetric[] = [
    {
      label: 'Product Listings',
      used: 18,
      limit: currentPlanData.maxProducts,
      unit: 'products',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      label: 'Monthly Orders',
      used: 847,
      limit: currentPlanData.maxMonthlyOrders,
      unit: 'orders',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      label: 'Promotional Slots Used',
      used: 1,
      limit: currentPlan === 'FREE' ? 0 : currentPlan === 'PREMIUM' ? 2 : null,
      unit: 'slots',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
    },
    {
      label: 'API Calls (Monthly)',
      used: 0,
      limit: currentPlan === 'ENTERPRISE' ? null : 0,
      unit: 'calls',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
  ];

  const handlePlanSelect = (tier: PlanTier) => {
    if (tier === currentPlan) return;
    setConfirmPlan(tier);
  };

  const handleConfirmPlanChange = () => {
    if (!confirmPlan) return;
    setIsProcessing(true);
    setTimeout(() => {
      const planIndex = PLANS.findIndex((p) => p.tier === confirmPlan);
      const currentIndex = PLANS.findIndex((p) => p.tier === currentPlan);
      if (planIndex >= currentIndex) {
        onUpgrade(confirmPlan, billingCycle);
      } else {
        onDowngrade(confirmPlan);
      }
      setConfirmPlan(null);
      setIsProcessing(false);
    }, 1500);
  };

  const tabViews = [
    { id: 'plans', label: 'Subscription Plans' },
    { id: 'compare', label: 'Compare Features' },
    { id: 'usage', label: 'Usage & Limits' },
    { id: 'billing', label: 'Billing History' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Subscription & Billing</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Manage your plan, monitor usage, and review billing records
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-4 py-2.5 self-start sm:self-auto">
          <span
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              currentPlan === 'FREE'
                ? 'bg-slate-400'
                : currentPlan === 'PREMIUM'
                  ? 'bg-violet-500'
                  : 'bg-amber-500'
            }`}
          />
          <span className="text-xs font-black text-foreground uppercase tracking-wider">
            {currentPlanData.name} Plan
          </span>
          <span className="text-[10px] text-muted-foreground font-bold">
            · {currentPlanData.commissionRate}% commission
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 bg-secondary/30 border border-border/60 rounded-xl p-1 w-fit">
        {tabViews.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as typeof activeView)}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
              activeView === tab.id
                ? 'bg-card text-foreground shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Plans View ── */}
      {activeView === 'plans' && (
        <div className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold ${billingCycle === 'MONTHLY' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle((prev) => (prev === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY'))
              }
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                billingCycle === 'ANNUAL' ? 'bg-primary' : 'bg-secondary border border-border'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                  billingCycle === 'ANNUAL' ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold ${billingCycle === 'ANNUAL' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Annual
            </span>
            {billingCycle === 'ANNUAL' && (
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Save up to 20%
              </span>
            )}
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.tier}
                plan={plan}
                isCurrentPlan={plan.tier === currentPlan}
                billingCycle={billingCycle}
                onSelect={() => handlePlanSelect(plan.tier)}
              />
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {[
              { icon: '🔒', text: 'Secure SSL Billing' },
              { icon: '🔄', text: 'Cancel Anytime' },
              { icon: '📋', text: 'Pro-rated Charges' },
              { icon: '💬', text: 'Dedicated Support' },
            ].map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold"
              >
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Compare View ── */}
      {activeView === 'compare' && (
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-wider">
              Feature Comparison Matrix
            </CardTitle>
            <CardDescription className="text-[11px]">
              Side-by-side breakdown of all plan capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[35%]">
                      Feature
                    </th>
                    <th className="text-center p-4 w-[21%]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Starter
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">Free</span>
                        {currentPlan === 'FREE' && (
                          <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-black">
                            CURRENT
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-center p-4 bg-violet-500/5 w-[22%]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-violet-400">
                          Growth
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          PKR 4,999/mo
                        </span>
                        {currentPlan === 'PREMIUM' && (
                          <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-black">
                            CURRENT
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-center p-4 bg-amber-500/5 w-[22%]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          Enterprise
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          PKR 24,999/mo
                        </span>
                        {currentPlan === 'ENTERPRISE' && (
                          <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-black">
                            CURRENT
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-border/30 hover:bg-secondary/20 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/5'}`}
                    >
                      <td className="p-4 font-semibold text-foreground text-[11px]">{row.label}</td>
                      <td className="p-4 text-center">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <CheckIcon className="text-emerald-500 mx-auto" />
                          ) : (
                            <CrossIcon className="text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-violet-500/5">
                        {typeof row.premium === 'boolean' ? (
                          row.premium ? (
                            <CheckIcon className="text-emerald-500 mx-auto" />
                          ) : (
                            <CrossIcon className="text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-[11px] font-bold text-violet-300">
                            {row.premium}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-amber-500/5">
                        {typeof row.enterprise === 'boolean' ? (
                          row.enterprise ? (
                            <CheckIcon className="text-emerald-500 mx-auto" />
                          ) : (
                            <CrossIcon className="text-muted-foreground/30 mx-auto" />
                          )
                        ) : (
                          <span className="text-[11px] font-bold text-amber-300">
                            {row.enterprise}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Usage View ── */}
      {activeView === 'usage' && (
        <div className="space-y-5">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider">
                Current Billing Period
              </CardTitle>
              <CardDescription className="text-[11px]">
                June 1 – June 30, 2026 · Resets in 16 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {usageMetrics.map((metric) => (
                  <UsageMeter key={metric.label} metric={metric} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commission Savings Calculator */}
          <Card className="border-border/60 bg-gradient-to-br from-violet-500/5 to-purple-600/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider">
                💰 Commission Savings Calculator
              </CardTitle>
              <CardDescription className="text-[11px]">
                Based on your PKR 1,205,000 annual GMV — estimated savings by plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => {
                  const annualRevenue = 1_205_000;
                  const commissionCost = (annualRevenue * plan.commissionRate) / 100;
                  const currentCost =
                    (annualRevenue * currentPlanData.commissionRate) / 100;
                  const netSavings =
                    currentCost - commissionCost - (plan.annualPrice > 0 ? plan.annualPrice : 0);
                  return (
                    <div
                      key={plan.tier}
                      className={`rounded-xl p-4 border ${
                        plan.tier === currentPlan
                          ? 'border-primary bg-primary/5'
                          : 'border-border/60 bg-card/60'
                      }`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                        {plan.name}
                      </p>
                      <p className="text-lg font-black text-foreground">
                        PKR {commissionCost.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        commission/yr at {plan.commissionRate}%
                      </p>
                      {plan.tier !== currentPlan && netSavings > 0 && (
                        <p className="text-[10px] text-emerald-500 font-bold mt-2">
                          Net save PKR {netSavings.toLocaleString()}/yr
                        </p>
                      )}
                      {plan.tier === currentPlan && (
                        <span className="text-[10px] text-primary font-bold mt-2 block">
                          ← Your current plan
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Billing History View ── */}
      {activeView === 'billing' && (
        <Card className="border-border/60">
          <CardHeader className="pb-4 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider">
                Billing History
              </CardTitle>
              <CardDescription className="text-[11px] mt-0.5">
                All past subscription invoices and charges
              </CardDescription>
            </div>
            <Button className="text-xs font-bold px-3 py-1.5 h-auto">Download All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-secondary/10">
                    {['Date', 'Description', 'Invoice ID', 'Amount', 'Status', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground ${
                            h === 'Amount' || h === 'Status' || h === 'Actions'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {BILLING_HISTORY.map((record, i) => (
                    <tr
                      key={record.id}
                      className={`border-b border-border/30 hover:bg-secondary/10 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/5'}`}
                    >
                      <td className="px-5 py-4 font-semibold text-foreground">{record.date}</td>
                      <td className="px-5 py-4 text-muted-foreground font-medium">
                        {record.description}
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-primary/80">
                        {record.invoiceId}
                      </td>
                      <td className="px-5 py-4 text-right font-black text-foreground">
                        {record.amount === 0 ? 'Free' : `PKR ${record.amount.toLocaleString()}`}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            record.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : record.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Upgrade / Downgrade Confirmation Modal ── */}
      {confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl mx-4">
            {(() => {
              const targetPlan = PLANS.find((p) => p.tier === confirmPlan)!;
              const isUpgrade =
                PLANS.findIndex((p) => p.tier === confirmPlan) >=
                PLANS.findIndex((p) => p.tier === currentPlan);
              const price =
                billingCycle === 'ANNUAL' ? targetPlan.annualPrice : targetPlan.monthlyPrice;

              return (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${
                        confirmPlan === 'FREE'
                          ? 'from-slate-500 to-slate-600'
                          : confirmPlan === 'PREMIUM'
                            ? 'from-violet-600 to-purple-700'
                            : 'from-amber-500 to-orange-600'
                      }`}
                    >
                      {confirmPlan === 'FREE' ? '🚀' : confirmPlan === 'PREMIUM' ? '⚡' : '🏆'}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground">
                        {isUpgrade ? 'Confirm Upgrade' : 'Confirm Downgrade'}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {isUpgrade
                          ? `Switch to ${targetPlan.name} Plan`
                          : `Downgrade to ${targetPlan.name} Plan`}
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary/30 border border-border/60 rounded-xl p-4 mb-5 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-semibold">New Plan</span>
                      <span className="font-black text-foreground">
                        {targetPlan.name} ({billingCycle})
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-semibold">Commission Rate</span>
                      <span className="font-black text-primary">{targetPlan.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-semibold">
                        {billingCycle === 'ANNUAL' ? 'Annual Price' : 'Monthly Price'}
                      </span>
                      <span className="font-black text-foreground">
                        {price === 0 ? 'Free' : `PKR ${price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {!isUpgrade && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 text-[11px] text-amber-400 font-semibold">
                      ⚠ Downgrading will reduce your product and order limits immediately. Excess
                      listings will be paused automatically.
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setConfirmPlan(null)}
                      className="flex-1 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmPlanChange}
                      disabled={isProcessing}
                      className={`flex-1 text-xs font-black ${
                        isUpgrade
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {isProcessing
                        ? 'Processing...'
                        : isUpgrade
                          ? 'Confirm Upgrade'
                          : 'Confirm Downgrade'}
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
