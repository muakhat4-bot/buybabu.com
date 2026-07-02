'use client';

import * as React from 'react';
import { Card } from '@villex/ui';

export interface NotificationItem {
  id: string;
  category: 'orders' | 'promo' | 'security';
  title: string;
  content: string;
  time: string;
  isRead: boolean;
}

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export function NotificationsPanel({ notifications, setNotifications }: NotificationsPanelProps) {
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'orders' | 'promo' | 'security'>('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'all') return true;
    return notif.category === activeFilter;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const handleClearAll = () => {
    if (confirm('Clear all notifications?')) {
      setNotifications([]);
    }
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: !notif.isRead } : notif))
    );
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'orders':
        return (
          <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
      case 'promo':
        return (
          <div className="p-2 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'security':
        return (
          <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Header & Quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Stay updated with status logs, promotional campaigns, and login security warnings.</p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center space-x-2.5">
            <button onClick={handleMarkAllRead} className="text-xs font-semibold text-primary hover:underline">
              Mark all as read
            </button>
            <span className="text-muted-foreground text-xs">•</span>
            <button onClick={handleClearAll} className="text-xs font-semibold text-destructive hover:underline">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'orders', 'promo', 'security'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 uppercase tracking-wider ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/15'
                  : 'bg-secondary/30 text-muted-foreground border-border hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 0h-1.5a1.5 1.5 0 00-1.5 1.5v1.5a1.5 1.5 0 001.5 1.5H20" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-foreground">No Notifications Found</h3>
            <p className="text-xs text-muted-foreground mt-1">Your inbox is clear of messages in this filter tab.</p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 flex gap-4 items-start justify-between border-border group transition-all duration-200 ${
                notif.isRead ? 'opacity-75 hover:opacity-100' : 'bg-primary/[0.02] border-primary/10 shadow-sm'
              }`}
            >
              <div className="flex gap-4 items-start flex-grow min-w-0">
                {getIcon(notif.category)}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm text-foreground truncate ${notif.isRead ? 'font-medium' : 'font-bold'}`}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 animate-pulse" title="New Message"></span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.content}</p>
                  <span className="text-[10px] text-muted-foreground block pt-1">{notif.time}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 flex-shrink-0">
                <button
                  onClick={() => handleToggleRead(notif.id)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-all duration-200"
                  title={notif.isRead ? 'Mark as Unread' : 'Mark as Read'}
                >
                  {notif.isRead ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m-9-1.35V9" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleDismiss(notif.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive transition-all duration-200"
                  title="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
