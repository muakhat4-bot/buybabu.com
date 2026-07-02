'use client';

import * as React from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { ProfilePanel } from './profile-panel';
import { OrderListPanel } from './order-list-panel';
import { WishlistPanel } from './wishlist-panel';
import { AddressBookPanel } from './address-book-panel';
import { ReviewsPanel } from './reviews-panel';
import { NotificationsPanel, NotificationItem } from './notifications-panel';

export function DashboardShell() {
  const [activeTab, setActiveTab] = React.useState('profile');

  // Shared state for notifications so dismiss/read updates are reflected in the sidebar count
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: 'notif-1',
      category: 'orders',
      title: 'Order Status Update',
      content: 'Your order #VLX-0089201 has been confirmed and is now being packaged by ElectroPulse Store.',
      time: '15 minutes ago',
      isRead: false,
    },
    {
      id: 'notif-2',
      category: 'security',
      title: 'New Device Session Detected',
      content: 'A new login session was registered from Windows 11 (Chrome) IP 39.34.192.122.',
      time: '1 hour ago',
      isRead: false,
    },
    {
      id: 'notif-3',
      category: 'promo',
      title: 'Mega Flash Deals Live!',
      content: 'Save up to 40% on summer sneakers. Offer valid for the next 24 hours only.',
      time: '3 hours ago',
      isRead: true,
    },
    {
      id: 'notif-4',
      category: 'orders',
      title: 'Order Delivered',
      content: 'Order #VLX-0088195 was successfully delivered to Zayn Ali (F-11 Islamabad).',
      time: '10 days ago',
      isRead: true,
    },
  ]);

  React.useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        const vendors = await response.json();
        if (vendors && vendors.length > 0) {
          const activeVendor = vendors.find((v: { status: string; storeName: string }) => v.status === 'ACTIVE') || vendors[0];
          setNotifications((prev) =>
            prev.map((n) => ({
              ...n,
              content: n.content.replace('ElectroPulse Store', activeVendor.storeName),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to update store name in notifications:', err);
      }
    };
    fetchVendors();
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePanel />;
      case 'orders':
        return <OrderListPanel />;
      case 'wishlist':
        return <WishlistPanel />;
      case 'addresses':
        return <AddressBookPanel />;
      case 'reviews':
        return <ReviewsPanel />;
      case 'notifications':
        return (
          <NotificationsPanel
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );
      default:
        return <ProfilePanel />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-grow">
      {/* Dynamic 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Navigation Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24">
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadNotificationsCount={unreadNotificationsCount}
          />
        </aside>

        {/* Right Side Content Viewport */}
        <main className="lg:col-span-9 bg-card/15 rounded-2xl p-0 lg:p-4 min-h-[500px]">
          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}
