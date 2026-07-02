'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@villex/ui';

export interface AlertNotification {
  id: string;
  type: 'ORDER' | 'INVENTORY' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'SUCCESS';
  message: string;
  timestamp: string;
  read: boolean;
}

interface AlertCenterProps {
  notifications: AlertNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export function AlertCenter({ notifications, onMarkAsRead, onClearAll }: AlertCenterProps) {
  const [filter, setFilter] = React.useState<'ALL' | 'ORDER' | 'INVENTORY' | 'SYSTEM'>('ALL');

  const filteredNotifications = notifications.filter(
    (n) => filter === 'ALL' || n.type === filter
  );

  const getAlertStyle = (severity: AlertNotification['severity']) => {
    switch (severity) {
      case 'WARNING':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      case 'SUCCESS':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      case 'INFO':
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
    }
  };

  const getAlertIcon = (type: AlertNotification['type']) => {
    switch (type) {
      case 'ORDER':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'INVENTORY':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'SYSTEM':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Card className="bg-card/50 border-border backdrop-blur-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/60">
        <div>
          <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
            System Alerts & Logs
          </CardTitle>
          <CardDescription className="text-xs">
            Review live alerts regarding orders, store stock, and financial settlements.
          </CardDescription>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-1.5 bg-secondary/30 rounded-lg p-1 border border-border">
            {(['ALL', 'ORDER', 'INVENTORY', 'SYSTEM'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                  filter === type
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onClearAll}
            className="text-[10px] font-black uppercase tracking-wider border-border hover:bg-secondary/40 h-[34px]"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground font-bold">
              No alerts or notifications at this time.
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-200 ${
                  notif.read ? 'bg-secondary/20 border-border/40 opacity-70' : 'bg-card border-border/80 shadow-md'
                }`}
              >
                <div className="flex space-x-3.5">
                  <div className={`p-2 rounded-lg border ${getAlertStyle(notif.severity)}`}>
                    {getAlertIcon(notif.type)}
                  </div>
                  <div>
                    <p className={`text-xs font-bold text-foreground leading-snug ${!notif.read && 'font-extrabold'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1.5 block">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>
                {!notif.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkAsRead(notif.id)}
                    className="text-[10px] font-black uppercase tracking-wider hover:bg-secondary/50 text-primary hover:text-primary/80 h-7 px-2.5 rounded-lg shrink-0 ml-4"
                  >
                    Mark read
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
