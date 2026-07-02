'use client';

import * as React from 'react';
import { Button, Card } from '@villex/ui';

interface PendingReviewItem {
  id: string;
  name: string;
  image: string;
  purchaseDate: string;
  vendorName: string;
}

interface ReviewHistoryItem {
  id: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  date: string;
  vendorResponse?: string;
}

export function ReviewsPanel() {
  const [activeSubTab, setActiveSubTab] = React.useState<'pending' | 'history'>('pending');

  const [pendingReviews, setPendingReviews] = React.useState<PendingReviewItem[]>([
    {
      id: 'pr-1',
      name: 'Sony WH-1000XM5 ANC Headset',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
      purchaseDate: 'June 14, 2026',
      vendorName: 'ElectroPulse Store',
    },
    {
      id: 'pr-2',
      name: 'Mechanical Backlit Keyboard G-PRO',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80',
      purchaseDate: 'June 14, 2026',
      vendorName: 'ElectroPulse Store',
    },
  ]);

  React.useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        const vendors = await response.json();
        if (vendors && vendors.length > 0) {
          const activeVendor = vendors.find((v: { status: string; storeName: string }) => v.status === 'ACTIVE') || vendors[0];
          setPendingReviews((prev) =>
            prev.map((item) => ({
              ...item,
              vendorName: activeVendor.storeName,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to update store name in reviews:', err);
      }
    };
    fetchVendors();
  }, []);

  const [reviewHistory, setReviewHistory] = React.useState<ReviewHistoryItem[]>([
    {
      id: 'rev-1',
      productName: 'Villex Custom Sneakers Red-Pro',
      productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Extremely comfortable fit, and the red shade looks even cleaner in person! Delivery was super fast within 24 hours in Islamabad. Recommended!',
      date: 'June 05, 2026',
      vendorResponse: 'Thank you Zayn for shopping with us! We take pride in fast deliveries and premium designs. Wear them in good health!',
    },
  ]);

  // Review Form state
  const [selectedItem, setSelectedItem] = React.useState<PendingReviewItem | null>(null);
  const [rating, setRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState('');

  const handleOpenReviewForm = (item: PendingReviewItem) => {
    setSelectedItem(item);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // Add to review history list
    const newReview: ReviewHistoryItem = {
      id: `rev-${Date.now()}`,
      productName: selectedItem.name,
      productImage: selectedItem.image,
      rating,
      comment,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
    };

    setReviewHistory((prev) => [newReview, ...prev]);

    // Remove from pending reviews list
    setPendingReviews((prev) => prev.filter((item) => item.id !== selectedItem.id));

    // Clear form state
    setSelectedItem(null);
    setActiveSubTab('history');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Reviews</h2>
        <p className="text-sm text-muted-foreground mt-1">Review recently bought items to help the community, or check feedback you have already provided.</p>
      </div>

      {/* Review tabs navigation */}
      <div className="flex space-x-1 p-1 rounded-xl bg-secondary/35 border border-border max-w-sm">
        <button
          onClick={() => {
            setActiveSubTab('pending');
            setSelectedItem(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            activeSubTab === 'pending'
              ? 'bg-card text-foreground shadow-sm border border-border/40'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('history');
            setSelectedItem(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            activeSubTab === 'history'
              ? 'bg-card text-foreground shadow-sm border border-border/40'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Review History ({reviewHistory.length})
        </button>
      </div>

      {/* Write Review Form Overlay/Block */}
      {selectedItem && (
        <Card className="p-6 border-primary/20 bg-primary/5 shadow-lg relative animate-scale-in">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="font-bold text-base text-foreground mb-4">Write a Review</h3>

          <div className="flex gap-4 items-start mb-6">
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-14 h-14 rounded-lg object-cover bg-secondary/50 border border-border flex-shrink-0"
            />
            <div>
              <h4 className="font-bold text-sm text-foreground truncate">{selectedItem.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Purchased on {selectedItem.purchaseDate} • {selectedItem.vendorName}</p>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Star Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Your Rating</label>
              <div className="flex items-center space-x-1 text-2xl text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(val)}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="transition-transform duration-100 active:scale-95 focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          val <= (hoverRating ?? rating) ? 'fill-current' : 'stroke-current'
                        }`}
                        fill={val <= (hoverRating ?? rating) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Write details about item</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience! How was the build quality, sizing, sounds, packaging?"
                className="w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-150 border-border"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Submit Review
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main tab content */}
      {!selectedItem && activeSubTab === 'pending' && (
        <div className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-foreground">No Pending Reviews</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">All purchases are rated! You will see new items here once their shipping state updates to Delivered.</p>
            </Card>
          ) : (
            pendingReviews.map((item) => (
              <Card key={item.id} className="p-5 flex items-center justify-between gap-6 border-border group hover:border-primary/20 transition-all duration-200">
                <div className="flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover bg-secondary/50 border border-border flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-foreground truncate leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Purchased: {item.purchaseDate} • Vendor: {item.vendorName}</p>
                  </div>
                </div>

                <Button size="sm" onClick={() => handleOpenReviewForm(item)} className="font-semibold text-xs h-9">
                  Rate Item
                </Button>
              </Card>
            ))
          )}
        </div>
      )}

      {!selectedItem && activeSubTab === 'history' && (
        <div className="space-y-6">
          {reviewHistory.length === 0 ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
              <h3 className="font-bold text-base text-foreground">No Review History</h3>
              <p className="text-xs text-muted-foreground mt-1">Submit feedback for pending items to build trust in our community.</p>
            </Card>
          ) : (
            reviewHistory.map((item) => (
              <Card key={item.id} className="p-6 border-border space-y-4">
                {/* Product Name Header */}
                <div className="flex gap-4 items-center border-b border-border pb-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-secondary/50 border border-border flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-foreground leading-tight">{item.productName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Star Display */}
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-current' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-sm text-foreground/90 leading-relaxed font-sans italic bg-secondary/15 p-3 rounded-lg border border-border/40">
                  &ldquo;{item.comment}&rdquo;
                </p>

                {/* Vendor Reply */}
                {item.vendorResponse && (
                  <div className="pl-6 border-l-2 border-primary/40 space-y-1.5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Merchant Response</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.vendorResponse}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
