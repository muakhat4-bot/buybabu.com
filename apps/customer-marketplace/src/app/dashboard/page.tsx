'use client';

import * as React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Marketplace Header */}
      <Navbar />

      {/* Main Dashboard Content */}
      <React.Suspense fallback={
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[500px]">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      }>
        <DashboardShell />
      </React.Suspense>

      {/* Footer copyright */}
      <footer className="border-t border-border bg-card/10 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Buy Babu Multi-Vendor Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
