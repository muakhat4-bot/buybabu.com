'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@villex/ui';

export function ReportsPerformance() {
  const categories = [
    { name: 'Audio & Acoustics', share: 45, gtv: 5602500, color: 'bg-indigo-500' },
    { name: 'Power & Charging Accessories', share: 25, gtv: 3112500, color: 'bg-blue-500' },
    { name: 'Wired/Wireless Keyboards', share: 15, gtv: 1867500, color: 'bg-emerald-500' },
    { name: 'Smart Home Hubs & LED Lamps', share: 15, gtv: 1867500, color: 'bg-violet-500' },
  ];

  const commissionEarnings = [
    { label: 'Mon', value: 8000 },
    { label: 'Tue', value: 12000 },
    { label: 'Wed', value: 11000 },
    { label: 'Thu', value: 18000 },
    { label: 'Fri', value: 23000 },
    { label: 'Sat', value: 31000 },
    { label: 'Sun', value: 36000 },
  ];

  const maxValue = 40000;
  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 20;

  const points = commissionEarnings.map((d, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (commissionEarnings.length - 1);
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
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
      {/* Category Share Distribution */}
      <Card className="lg:col-span-3 bg-card/50 border-border backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase tracking-wider text-foreground">
            Category Share Performance
          </CardTitle>
          <CardDescription className="text-xs">
            Gross Transaction Value distribution across categories.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((c, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">{c.name}</span>
                <span className="text-muted-foreground font-mono">
                  {c.share}% (PKR {c.gtv.toLocaleString()})
                </span>
              </div>
              <div className="w-full h-2 bg-secondary/40 rounded-full overflow-hidden border border-border/40">
                <div
                  className={`h-full ${c.color} rounded-full`}
                  style={{ width: `${c.share}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Commission Earnings SVG Chart */}
      <Card className="lg:col-span-3 bg-card/50 border-border backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-black tracking-wider uppercase text-foreground">
              Admin Commission Revenue
            </CardTitle>
            <CardDescription className="text-xs">
              Daily earnings from Villex 10% platform fees.
            </CardDescription>
          </div>
          <div className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider">
            +PKR 139,000 / week
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative w-full h-[180px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="commGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.01" />
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
                      {gridVal / 1000}k
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
                <path d={areaPath} fill="url(#commGradient)" />
              )}

              {/* Stroke */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="rgb(16, 185, 129)"
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
                    fill="rgb(16, 185, 129)"
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
                  {activePoint.label} Earnings
                </p>
                <p className="text-xs font-black text-foreground mt-1 whitespace-nowrap">
                  PKR {activePoint.value.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
