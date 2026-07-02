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
      <DashboardShell />

      {/* Footer copyright */}
      <footer className="border-t border-border bg-card/10 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Villex Multi-Vendor Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
