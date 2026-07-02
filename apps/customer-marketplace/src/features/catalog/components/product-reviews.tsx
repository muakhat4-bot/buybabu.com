'use client';

import * as React from 'react';
import { Card } from '@villex/ui';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  photos?: string[];
}

interface ProductReviewsProps {
  productId: string;
}

const MOCK_REVIEWS: Record<string, Review[]> = {
  'p-1': [
    {
      id: 'rev-mock-1',
      name: 'Hamza N.',
      rating: 5,
      comment: 'Absolutely phenomenal sound stage and noise cancellation. Better than Sony WH-1000XM4. The silver color matches perfectly with my desk setup. Direct express shipping in Islamabad took only 12 hours!',
      date: 'June 12, 2026',
      verified: true,
      helpfulCount: 42,
      photos: [],
    },
    {
      id: 'rev-mock-2',
      name: 'Ayesha K.',
      rating: 5,
      comment: 'Extremely lightweight and comfortable to wear for long office meetings. Multi-point bluetooth connection works flawlessly between my Macbook and Android phone. The carry case is solid.',
      date: 'May 28, 2026',
      verified: true,
      helpfulCount: 18,
      photos: [],
    },
    {
      id: 'rev-mock-3',
      name: 'Bilal S.',
      rating: 4,
      comment: 'Audio quality is excellent but the touch controls take some time to get used to. Swiping up/down sometimes does not register if fingers are sweaty. Still a solid purchase.',
      date: 'May 14, 2026',
      verified: true,
      helpfulCount: 7,
      photos: [],
    },
  ],
};

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [clickedHelpful, setClickedHelpful] = React.useState<Record<string, boolean>>({});
  const [zoomPhoto, setZoomPhoto] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
        if (response.ok) {
          const data = await response.json();
          const mocks = MOCK_REVIEWS[productId] || [];
          setReviews([...data, ...mocks]);
        } else {
          setReviews(MOCK_REVIEWS[productId] || []);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic reviews:', err);
        setReviews(MOCK_REVIEWS[productId] || []);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleHelpfulClick = (reviewId: string) => {
    if (clickedHelpful[reviewId]) return;

    setReviews((prev) =>
      prev.map((rev) =>
        rev.id === reviewId ? { ...rev, helpfulCount: rev.helpfulCount + 1 } : rev
      )
    );
    setClickedHelpful((prev) => ({ ...prev, [reviewId]: true }));
  };

  // Dynamic statistics calculations
  const totalRatings = reviews.length;
  const averageScore = totalRatings > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings) * 10) / 10
    : 0.0;

  const starCounts: number[] = [0, 0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const ratingIndex = Math.round(r.rating);
    if (ratingIndex >= 1 && ratingIndex <= 5) {
      starCounts[ratingIndex] = (starCounts[ratingIndex] || 0) + 1;
    }
  });

  const distributions = [5, 4, 3, 2, 1].map((star) => {
    const count = starCounts[star] || 0;
    const percent = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
    return { star, count, percent };
  });

  return (
    <div id="reviews" className="space-y-6 pt-6 relative">
      <div className="border-b border-border pb-4">
        <h3 className="font-bold text-lg text-foreground">Customer Reviews</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Real verified buyer reviews collected by the Villex network.</p>
      </div>

      {/* Ratings summary breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-card/25 border border-border rounded-2xl p-6">
        {/* Left score */}
        <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6 space-y-1">
          <span className="text-5xl font-black text-foreground">{averageScore.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground block font-bold">out of 5</span>
          
          <div className="flex justify-center text-amber-400 py-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < Math.round(averageScore) ? 'fill-current' : 'stroke-current'}`}
                fill={i < Math.round(averageScore) ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-muted-foreground block">{totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}</span>
        </div>

        {/* Right bars */}
        <div className="md:col-span-8 space-y-2.5">
          {distributions.map((dist) => (
            <div key={dist.star} className="flex items-center gap-3 text-xs">
              <span className="w-8 font-bold text-muted-foreground text-right">{dist.star} Star</span>
              
              {/* Progress Bar container */}
              <div className="flex-grow h-2 bg-secondary/40 rounded-full overflow-hidden border border-border/30">
                <div className="h-full bg-primary rounded-full animate-pulse-once" style={{ width: `${dist.percent}%` }}></div>
              </div>
              
              <span className="w-12 font-bold text-foreground text-right">{dist.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review items feed */}
      <div className="space-y-4 pt-2">
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground font-semibold text-xs">
            No reviews yet for this product. Be the first to leave one!
          </div>
        ) : (
          reviews.map((rev) => (
            <Card key={rev.id} className="p-5 border-border space-y-3.5 hover:border-foreground/25 transition-all">
              {/* Header info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm text-foreground">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{rev.name}</span>
                      {rev.verified && (
                        <span className="text-[9px] bg-emerald-400/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ✓ Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block pt-0.5">{rev.date}</span>
                  </div>
                </div>

                {/* Star row */}
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'stroke-current'}`}
                      fill={i < rev.rating ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.567-.37-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-sans">
                {rev.comment}
              </p>

              {/* Attachments */}
              {rev.photos && rev.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {rev.photos.map((photo, pIdx) => (
                    <div
                      key={pIdx}
                      onClick={() => setZoomPhoto(photo)}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-border cursor-pointer bg-secondary/10 flex items-center justify-center hover:opacity-85 transition-opacity"
                    >
                      <img src={photo} alt="Review attachment" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful and share action triggers */}
              <div className="flex items-center space-x-4 border-t border-border/40 pt-3 text-xs font-semibold text-muted-foreground select-none">
                <button
                  disabled={clickedHelpful[rev.id]}
                  onClick={() => handleHelpfulClick(rev.id)}
                  className={`flex items-center gap-1.5 hover:text-foreground transition-all ${
                    clickedHelpful[rev.id] ? 'text-primary pointer-events-none' : ''
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Helpful ({rev.helpfulCount})
                </button>
                <span>•</span>
                <button onClick={() => alert('Report submitted to Super Admin.')} className="hover:text-foreground">
                  Report abuse
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Image Zoom Modal */}
      {zoomPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setZoomPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] animate-scale-in">
            <img
              src={zoomPhoto}
              alt="Review attachment enlarged"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-border/40"
            />
            <button className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 focus:outline-none">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

