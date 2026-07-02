'use client';

import * as React from 'react';
import { Button, Card } from '@villex/ui';

interface SellerCardProps {
  sellerName: string;
}

export function SellerCard({ sellerName }: SellerCardProps) {
  const [followers, setFollowers] = React.useState(23420);
  const [isFollowing, setIsFollowing] = React.useState(false);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setFollowers((prev) => prev - 1);
    } else {
      setFollowers((prev) => prev + 1);
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <Card className="p-6 border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Shop identity */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center font-extrabold text-2xl text-primary flex-shrink-0">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground flex items-center gap-1.5">
              {sellerName}
              <span className="text-[9px] bg-primary/25 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Partner Store
              </span>
            </h3>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
              <span>{followers.toLocaleString()} Followers</span>
              <span>•</span>
              <span className="text-foreground font-semibold">Active Now</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => alert('Opening Seller Shop...')} className="text-xs h-9">
            Visit Store
          </Button>
          <Button
            variant={isFollowing ? 'outline' : 'primary'}
            size="sm"
            onClick={handleFollowToggle}
            className={`text-xs h-9 ${isFollowing ? 'border-primary text-primary hover:bg-primary/5' : ''}`}
          >
            {isFollowing ? '✓ Following' : 'Follow Shop'}
          </Button>
        </div>
      </div>

      {/* Ratings stats breakdown columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border/60 text-center">
        <div>
          <span className="text-2xl font-black text-foreground block">98.4%</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mt-0.5">Positive Rating</span>
        </div>
        <div>
          <span className="text-2xl font-black text-foreground block">99.2%</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mt-0.5">Shipment Rate</span>
        </div>
        <div>
          <span className="text-2xl font-black text-foreground block">&lt; 1 hr</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mt-0.5">Response Time</span>
        </div>
        <div>
          <span className="text-2xl font-black text-foreground block">4.9 ★</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mt-0.5">Seller Rating</span>
        </div>
      </div>
    </Card>
  );
}
