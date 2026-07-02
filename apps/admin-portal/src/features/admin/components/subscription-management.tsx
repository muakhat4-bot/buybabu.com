'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type PlanTier = 'FREE' | 'PREMIUM' | 'ENTERPRISE';

export interface VendorSubscription {
  vendorId: string;
  storeName: string;
  ownerName: string;
  email: string;
  plan: PlanTier;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  nextBillingDate: string;
  mrr: number; // Monthly Recurring Revenue
  commissionRate: number;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIAL';
  joinedDate: string;
  totalRevenue: number; // Platform commission earned from this vendor
}

interface SubscriptionManagementProps {
  subscriptions: VendorSubscription[];
  onOverridePlan: (vendorId: string, newPlan: PlanTier) => void;
  onCancelSubscription: (vendorId: string) => void;
}

// ─────────────────────────────────────────────────────────────
// Revenue Summary
// ─────────────────────────────────────────────────────────────

function SubscriptionRevenueCard({ subscriptions }: { subscriptions: VendorSubscription[] }) {
  const totalMRR = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + s.mrr, 0);
  const freeCount = subscriptions.filter((s) => s.plan === 'FREE').length;
  const premiumCount = subscriptions.filter((s) => s.plan === 'PREMIUM').length;
  const enterpriseCount = subscriptions.filter((s) => s.plan === 'ENTERPRISE').length;
  const annualARR = totalMRR * 12;

  const summaryItems = [
    {
      label: 'Monthly Recurring Revenue',
      value: `PKR ${totalMRR.toLocaleString()}`,
      sub: `PKR ${annualARR.toLocaleString()} ARR projected`,
      color: 'text-primary',
      icon: '💰',
    },
    {
      label: 'Starter (Free)',
      value: freeCount.toString(),
      sub: `${Math.round((freeCount / subscriptions.length) * 100)}% of vendors`,
      color: 'text-slate-400',
      icon: '🚀',
    },
    {
      label: 'Growth (Premium)',
      value: premiumCount.toString(),
      sub: `PKR ${(premiumCount * 4999).toLocaleString()} /mo`,
      color: 'text-violet-400',
      icon: '⚡',
    },
    {
      label: 'Enterprise',
      value: enterpriseCount.toString(),
      sub: `PKR ${(enterpriseCount * 24999).toLocaleString()} /mo`,
      color: 'text-amber-400',
      icon: '🏆',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {summaryItems.map((item) => (
        <Card key={item.label} className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
            </div>
            <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{item.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function SubscriptionManagement({
  subscriptions,
  onOverridePlan,
  onCancelSubscription,
}: SubscriptionManagementProps) {
  const [search, setSearch] = React.useState('');
  const [planFilter, setPlanFilter] = React.useState<'ALL' | PlanTier>('ALL');
  const [overrideTarget, setOverrideTarget] = React.useState<VendorSubscription | null>(null);
  const [overridePlan, setOverridePlan] = React.useState<PlanTier>('FREE');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const filtered = subscriptions.filter((s) => {
    const matchSearch =
      s.storeName.toLowerCase().includes(search.toLowerCase()) ||
      s.vendorId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'ALL' || s.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const planBadge = (plan: PlanTier) => {
    const styles: Record<PlanTier, string> = {
      FREE: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      PREMIUM: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      ENTERPRISE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    const labels: Record<PlanTier, string> = {
      FREE: 'Starter',
      PREMIUM: 'Growth',
      ENTERPRISE: 'Enterprise',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[plan]}`}
      >
        {labels[plan]}
      </span>
    );
  };

  const statusBadge = (status: VendorSubscription['status']) => {
    const styles: Record<typeof status, string> = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      PAST_DUE: 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse',
      CANCELLED: 'bg-secondary text-muted-foreground border-border/60',
      TRIAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  const handleConfirmOverride = () => {
    if (!overrideTarget) return;
    setIsProcessing(true);
    setTimeout(() => {
      onOverridePlan(overrideTarget.vendorId, overridePlan);
      setOverrideTarget(null);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-foreground">Subscription Management</h2>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          Platform-wide vendor subscription overview, MRR tracking, and plan administration
        </p>
      </div>

      {/* Revenue Summary Cards */}
      <SubscriptionRevenueCard subscriptions={subscriptions} />

      {/* MRR Bar Chart Visualization */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black uppercase tracking-wider">
            Plan Revenue Distribution
          </CardTitle>
          <CardDescription className="text-[11px]">
            Monthly subscription revenue breakdown by plan tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                label: 'Enterprise Plans',
                color: 'bg-gradient-to-r from-amber-500 to-orange-600',
                count: subscriptions.filter((s) => s.plan === 'ENTERPRISE').length,
                revenue: subscriptions
                  .filter((s) => s.plan === 'ENTERPRISE')
                  .reduce((sum, s) => sum + s.mrr, 0),
                total: subscriptions.reduce((sum, s) => sum + s.mrr, 0),
              },
              {
                label: 'Growth Plans',
                color: 'bg-gradient-to-r from-violet-500 to-purple-600',
                count: subscriptions.filter((s) => s.plan === 'PREMIUM').length,
                revenue: subscriptions
                  .filter((s) => s.plan === 'PREMIUM')
                  .reduce((sum, s) => sum + s.mrr, 0),
                total: subscriptions.reduce((sum, s) => sum + s.mrr, 0),
              },
              {
                label: 'Starter Plans (Free)',
                color: 'bg-secondary',
                count: subscriptions.filter((s) => s.plan === 'FREE').length,
                revenue: 0,
                total: subscriptions.reduce((sum, s) => sum + s.mrr, 0),
              },
            ].map((row) => {
              const pct =
                row.total > 0 ? Math.round((row.revenue / row.total) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {row.count} vendors
                      </span>
                      <span className="text-[11px] font-black text-foreground">
                        PKR {row.revenue.toLocaleString()}/mo
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${row.color}`}
                      style={{ width: `${row.total > 0 ? pct : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Subscriptions Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider">
                All Vendor Subscriptions
              </CardTitle>
              <CardDescription className="text-[11px] mt-0.5">
                {filtered.length} of {subscriptions.length} vendors shown
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                type="text"
                placeholder="Search store, ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52 h-8 text-xs"
              />
              {(['ALL', 'FREE', 'PREMIUM', 'ENTERPRISE'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPlanFilter(f)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors border ${
                    planFilter === f
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/40 text-muted-foreground border-border/60 hover:bg-secondary'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'FREE' ? 'Starter' : f === 'PREMIUM' ? 'Growth' : 'Enterprise'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/10">
                  {[
                    'Vendor',
                    'Plan Tier',
                    'Billing',
                    'Next Invoice',
                    'MRR',
                    'Commission Earned',
                    'Status',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => (
                  <tr
                    key={sub.vendorId}
                    className={`border-b border-border/30 hover:bg-secondary/10 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/5'}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-black text-foreground text-xs">{sub.storeName}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {sub.vendorId}
                      </p>
                    </td>
                    <td className="px-5 py-4">{planBadge(sub.plan)}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {sub.billingCycle}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-foreground">{sub.nextBillingDate}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-foreground">
                        PKR {sub.mrr.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-emerald-400">
                        PKR {sub.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">{statusBadge(sub.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setOverrideTarget(sub);
                            setOverridePlan(sub.plan);
                          }}
                          className="text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                        >
                          Override
                        </button>
                        {sub.status === 'ACTIVE' && (
                          <button
                            onClick={() => onCancelSubscription(sub.vendorId)}
                            className="text-[10px] font-black text-destructive hover:text-destructive/80 transition-colors uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-xs text-muted-foreground font-semibold"
                    >
                      No subscriptions match your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Override Plan Modal */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">
                ⚙️
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">Override Subscription Plan</h3>
                <p className="text-[11px] text-muted-foreground">{overrideTarget.storeName}</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 text-[11px] text-amber-400 font-semibold">
              ⚠ Admin override will immediately change the vendor&apos;s plan, commission rate, and
              feature access. This action is logged in the audit trail.
            </div>

            <div className="mb-5 space-y-2">
              <label className="text-[11px] font-black text-foreground uppercase tracking-wider">
                Select New Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['FREE', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map((tier) => {
                  const labels: Record<PlanTier, string> = {
                    FREE: 'Starter\nFree',
                    PREMIUM: 'Growth\nPKR 4,999',
                    ENTERPRISE: 'Enterprise\nPKR 24,999',
                  };
                  const colors: Record<PlanTier, string> = {
                    FREE: 'border-slate-600 bg-slate-500/10 text-slate-300',
                    PREMIUM: 'border-violet-600 bg-violet-500/10 text-violet-300',
                    ENTERPRISE: 'border-amber-600 bg-amber-500/10 text-amber-300',
                  };
                  return (
                    <button
                      key={tier}
                      onClick={() => setOverridePlan(tier)}
                      className={`border rounded-xl p-3 text-center transition-all text-[10px] font-black uppercase tracking-wider whitespace-pre-line ${
                        overridePlan === tier
                          ? `${colors[tier]} ring-2 ring-offset-1 ring-offset-background ring-primary`
                          : 'border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {labels[tier]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setOverrideTarget(null)}
                className="flex-1 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmOverride}
                disabled={isProcessing || overridePlan === overrideTarget.plan}
                className="flex-1 text-xs font-black bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isProcessing ? 'Applying...' : 'Apply Override'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
