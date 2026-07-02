'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@villex/ui';

interface RevenueChartProps {
  totalRevenue: number;
  isDemoUser?: boolean;
  storeName?: string;
}

export function RevenueChart({ totalRevenue, isDemoUser = true, storeName }: RevenueChartProps) {
  const chartData = isDemoUser
    ? [
        { label: 'Mon', value: 80000, formatted: 'PKR 80K' },
        { label: 'Tue', value: 120000, formatted: 'PKR 120K' },
        { label: 'Wed', value: 110000, formatted: 'PKR 110K' },
        { label: 'Thu', value: 180000, formatted: 'PKR 180K' },
        { label: 'Fri', value: 230000, formatted: 'PKR 230K' },
        { label: 'Sat', value: 310000, formatted: 'PKR 310K' },
        { label: 'Sun', value: 360000, formatted: 'PKR 360K' },
      ]
    : [
        { label: 'Mon', value: 0, formatted: 'PKR 0' },
        { label: 'Tue', value: 0, formatted: 'PKR 0' },
        { label: 'Wed', value: 0, formatted: 'PKR 0' },
        { label: 'Thu', value: 0, formatted: 'PKR 0' },
        { label: 'Fri', value: 0, formatted: 'PKR 0' },
        { label: 'Sat', value: 0, formatted: 'PKR 0' },
        { label: 'Sun', value: 0, formatted: 'PKR 0' },
      ];

  const maxValue = 400000;
  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate coordinates
  const points = chartData.map((d, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (chartData.length - 1);
    const y = height - paddingY - (d.value / maxValue) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  // Create path strings
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
    <Card className="col-span-full lg:col-span-4 bg-card/50 border-border backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
            Sales Analytics
          </CardTitle>
          <CardDescription className="text-xs">
            Weekly sales progress for {storeName || 'ElectroPulse Store'}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2 bg-secondary/30 rounded-lg p-1 border border-border">
          <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-primary text-primary-foreground">
            7D
          </button>
          <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-muted-foreground hover:text-foreground">
            30D
          </button>
          <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-muted-foreground hover:text-foreground">
            12M
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Top sales overview */}
        <div className="flex items-baseline space-x-4 mb-6">
          <span className="text-3xl font-black tracking-tight text-foreground">
            PKR {totalRevenue.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
            +18.4% weekly growth
          </span>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full h-[200px] select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.01" />
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

            {/* Filled Area */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#chartGradient)"
              />
            )}

            {/* Stroke line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="rgb(139, 92, 246)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Markers & Interaction dots */}
            {points.map((p, i) => (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(p)}
                onMouseLeave={() => setActivePoint(null)}
              >
                {/* Invisible larger hover circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  fill="transparent"
                />
                {/* Visible inner dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={activePoint?.label === p.label ? "6" : "4"}
                  className="transition-all duration-200"
                  fill="rgb(139, 92, 246)"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip popup inside chart */}
          {activePoint && (
            <div
              className="absolute z-20 bg-popover border border-border p-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
              style={{
                left: `${(activePoint.x / width) * 100}%`,
                top: `${(activePoint.y / height) * 100 - 8}%`,
              }}
            >
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-wider leading-none">
                {activePoint.label} Sales
              </p>
              <p className="text-xs font-black text-foreground mt-1 whitespace-nowrap">
                PKR {activePoint.value.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
