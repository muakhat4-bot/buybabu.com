'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@villex/ui';

interface StatsOverviewProps {
  totalGtv: number;
  escrowLocked: number;
  activeVendors: number;
  payoutRequestsCount: number;
  pendingVendorsCount: number;
  approvedVendorsCount: number;
  pendingProductsCount: number;
  approvedProductsCount: number;
  rejectedProductsCount: number;
  verificationRequestsCount: number;
  unreadNotificationsCount: number;
}

export function StatsOverview({
  totalGtv,
  escrowLocked,
  activeVendors,
  payoutRequestsCount,
  pendingVendorsCount,
  approvedVendorsCount,
  pendingProductsCount,
  approvedProductsCount,
  rejectedProductsCount,
  verificationRequestsCount,
  unreadNotificationsCount
}: StatsOverviewProps) {
  const stats = [
    {
      title: 'Gross Transaction Value (GTV)',
      value: `PKR ${totalGtv.toLocaleString()}`,
      change: '+24.6% YoY',
      isPositive: true,
      timeframe: 'vs last quarter',
      icon: (
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: 'Secured Escrow Hold',
      value: `PKR ${escrowLocked.toLocaleString()}`,
      change: '100% Secured',
      isPositive: true,
      timeframe: 'Protected Balance',
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Registered Merchants',
      value: activeVendors.toLocaleString(),
      change: '+14 New Stores',
      isPositive: true,
      timeframe: 'this month',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Pending Settlements',
      value: payoutRequestsCount.toLocaleString(),
      change: payoutRequestsCount > 0 ? 'Action required' : 'Clear',
      isPositive: payoutRequestsCount === 0,
      timeframe: 'Payout requests',
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const chartData = [
    { label: 'Jan', value: 850000 },
    { label: 'Feb', value: 1200000 },
    { label: 'Mar', value: 1100000 },
    { label: 'Apr', value: 1650000 },
    { label: 'May', value: 2100000 },
    { label: 'Jun', value: 2600000 },
    { label: 'Jul', value: 3000000 },
  ];

  const maxValue = 3500000;
  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 20;

  const points = chartData.map((d, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (chartData.length - 1);
    const y = height - paddingY - (d.value / maxValue) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = (points.length > 0 && firstPoint && lastPoint)
    ? `${linePath} L ${lastPoint.x} ${height - paddingY} L ${firstPoint.x} ${height - paddingY} Z`
    : '';

  const [activePoint, setActivePoint] = React.useState<typeof points[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* 4 KPIs row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="overflow-hidden border-border bg-card/50 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </span>
                <div className="p-2 bg-secondary/50 rounded-xl border border-border/60">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex flex-col justify-end">
                <span className="text-xl font-black tracking-tight text-foreground">
                  {stat.value}
                </span>
                <div className="mt-2 flex items-center space-x-1.5">
                  <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    stat.isPositive
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    {stat.timeframe}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SVG Chart */}
      <Card className="bg-card/50 border-border backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-black tracking-wider uppercase text-foreground">
              Marketplace GTV Volume
            </CardTitle>
            <CardDescription className="text-xs">
              Monthly platform Gross Transaction Value trends.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 bg-secondary/30 rounded-lg p-1 border border-border">
            <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-primary text-primary-foreground">
              6M
            </button>
            <button className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md text-muted-foreground hover:text-foreground">
              12M
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative w-full h-[220px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gtvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Y Grid lines */}
              {[0, 1, 2, 3].map((val) => {
                const y = paddingY + (val * (height - 2 * paddingY)) / 3;
                const gridVal = maxValue - (val * maxValue) / 3;
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="currentColor"
                      className="text-border/40"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fill="currentColor"
                      className="text-[9px] font-bold text-muted-foreground/80 font-mono text-right"
                      textAnchor="end"
                    >
                      {(gridVal / 1000000).toFixed(1)}M
                    </text>
                  </g>
                );
              })}

              {/* X Labels */}
              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={height - 2}
                  fill="currentColor"
                  className="text-[10px] font-black tracking-wider text-muted-foreground uppercase text-center"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              ))}

              {/* Area */}
              {areaPath && (
                <path d={areaPath} fill="url(#gtvGradient)" />
              )}

              {/* Stroke */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="rgb(99, 102, 241)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Dots */}
              {points.map((p, i) => (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setActivePoint(p)}
                  onMouseLeave={() => setActivePoint(null)}
                >
                  <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activePoint?.label === p.label ? "6" : "4"}
                    className="transition-all duration-200"
                    fill="rgb(99, 102, 241)"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                </g>
              ))}
            </svg>

            {/* Tooltip */}
            {activePoint && (
              <div
                className="absolute z-20 bg-popover border border-border p-2.5 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
                style={{
                  left: `${(activePoint.x / width) * 100}%`,
                  top: `${(activePoint.y / height) * 100 - 8}%`,
                }}
              >
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-wider leading-none">
                  {activePoint.label} Volume
                </p>
                <p className="text-xs font-black text-foreground mt-1 whitespace-nowrap">
                  PKR {activePoint.value.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approvals and Queue KPIs row */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2 select-none">
          <span>Administrative Approvals & Notifications Queue</span>
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </h3>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 select-none">
          <Card className="border-border bg-card/40">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground truncate">
                Pending Vendors
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={`text-xl font-black ${pendingVendorsCount > 0 ? 'text-amber-500 animate-pulse' : 'text-foreground'}`}>
                  {pendingVendorsCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground truncate">
                Active Vendors
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-xl font-black text-emerald-500">
                  {approvedVendorsCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground truncate">
                Pending Products
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={`text-xl font-black ${pendingProductsCount > 0 ? 'text-amber-500 animate-pulse' : 'text-foreground'}`}>
                  {pendingProductsCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground truncate">
                Approved Products
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-xl font-black text-emerald-500">
                  {approvedProductsCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground truncate">
                Declined Products
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-xl font-black text-rose-500">
                  {rejectedProductsCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground truncate">
                Verification Regs
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={`text-xl font-black ${verificationRequestsCount > 0 ? 'text-indigo-400' : 'text-foreground'}`}>
                  {verificationRequestsCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground truncate">
                Unread Alerts
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={`text-xl font-black ${unreadNotificationsCount > 0 ? 'text-red-400 animate-pulse' : 'text-foreground'}`}>
                  {unreadNotificationsCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
