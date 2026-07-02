'use client';

import * as React from 'react';
import { LogoIcon } from '@villex/ui';

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notificationsCount: number;
  onSignOut?: () => void;
  storeName?: string;
  storeId?: string;
  vendorEmail?: string;
}

export function SidebarNav({ activeTab, setActiveTab, notificationsCount, onSignOut, storeName, storeId, vendorEmail }: SidebarNavProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Order Manager',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'wallet',
      label: 'My Wallet',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'inventory',
      label: 'Inventory Control',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'verification',
      label: 'Verification Hub',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'media',
      label: 'Media Library',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'subscription',
      label: 'Subscription & Billing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'System Alerts',
      icon: (
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full">
              {notificationsCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* Brand details */}
      <div className="flex items-center space-x-2.5 px-3">
        <LogoIcon size="md" />
        <div>
          <span className="text-sm font-black tracking-wider block text-foreground uppercase">
            VILLEX<span className="text-[#F59E0B] font-black font-sans">.</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Merchant Portal
          </span>
        </div>
      </div>

      {/* Seller Details Card */}
      <div className="rounded-xl border border-border bg-card/40 p-4 relative overflow-hidden select-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary">
            {storeName ? storeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'EP'}
          </div>
          <div>
            <h4 className="font-bold text-xs text-foreground truncate max-w-[130px]">{storeName || 'ElectroPulse Store'}</h4>
            <span className="text-[9px] text-muted-foreground font-semibold block">{storeId || '#VLX-MER-089'}</span>
            {vendorEmail && <span className="text-[8px] text-muted-foreground truncate block max-w-[130px]">{vendorEmail}</span>}
          </div>
        </div>
      </div>

      {/* Menu links list */}
      <nav className="flex-grow space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              }`}
            >
              <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`}>
                {item.icon}
              </span>
              <span className="flex-grow text-left">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-ping absolute right-4"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer details */}
      <div className="border-t border-border pt-4 flex flex-col space-y-3 px-2">
        <div>
          <p className="text-[10px] text-muted-foreground">Villex Vendor Admin</p>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">v1.2.0-SaaS</p>
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center space-x-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-left border border-transparent hover:border-destructive/10"
          >
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}
