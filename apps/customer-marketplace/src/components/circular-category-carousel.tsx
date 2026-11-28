'use client';

import * as React from 'react';
import Link from 'next/link';

export interface CategoryItem {
  id?: number | string;
  name: string;
  slug: string;
  image?: string;
  image_url?: string;
  count?: string;
}

interface CircularCategoryShowcaseProps {
  categories: CategoryItem[];
  title?: string;
  subtitle?: string;
}

export function CircularCategoryShowcase({
  categories = [],
  title = 'Browse Categories',
  subtitle = 'Discover products across our curated marketplace departments'
}: CircularCategoryShowcaseProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState(1200);
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);
  const [isInViewport, setIsInViewport] = React.useState(true);

  // Drag / Touch gesture state (Ref-based for synchronous click prevention without re-render lags)
  const dragStartXRef = React.useRef<number | null>(null);
  const dragStartYRef = React.useRef<number | null>(null);
  const isDraggingRef = React.useRef(false);
  const dragOccurredRef = React.useRef(false);
  const [dragDeltaX, setDragDeltaX] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const autoPlayTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const total = categories.length;

  // 1. Detect Screen Width & Viewport Visibility
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      } else {
        setContainerWidth(window.innerWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    // Intersection Observer to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      mediaQuery.removeEventListener('change', listener);
      window.removeEventListener('resize', updateWidth);
      observer.disconnect();
    };
  }, []);

  // 2. Navigation Handlers
  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = React.useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleSelectIndex = (index: number) => {
    setActiveIndex(index);
    pauseAndScheduleResume();
  };

  // 3. Auto-Rotation Timer with Inactivity Resume
  const pauseAndScheduleResume = React.useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4500);
  }, []);

  React.useEffect(() => {
    if (isReducedMotion || isPaused || !isInViewport || total <= 1) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, 4200);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [handleNext, isPaused, isInViewport, isReducedMotion, total]);

  // 4. Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
      pauseAndScheduleResume();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
      pauseAndScheduleResume();
    }
  };

  // 5. Touch / Swipe Handlers (Non-intrusive to vertical scroll)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      dragStartXRef.current = e.touches[0].clientX;
      dragStartYRef.current = e.touches[0].clientY;
      isDraggingRef.current = false;
      dragOccurredRef.current = false;
      setDragDeltaX(0);
      setIsPaused(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartXRef.current === null || dragStartYRef.current === null || !e.touches[0]) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - dragStartXRef.current;
    const dy = currentY - dragStartYRef.current;

    if (!isDraggingRef.current) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        isDraggingRef.current = true;
      }
    }

    if (isDraggingRef.current) {
      setDragDeltaX(dx);
    }
  };

  const handleTouchEnd = () => {
    if (isDraggingRef.current) {
      dragOccurredRef.current = true;
      // Clear drag flag shortly after touch ends so subsequent regular clicks work
      setTimeout(() => {
        dragOccurredRef.current = false;
      }, 350);

      if (Math.abs(dragDeltaX) > 40) {
        if (dragDeltaX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
    dragStartXRef.current = null;
    dragStartYRef.current = null;
    isDraggingRef.current = false;
    setDragDeltaX(0);
    pauseAndScheduleResume();
  };

  // 6. Responsive 3D Geometry Dimensions
  const isMobile = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;

  const radius = isMobile ? 135 : isTablet ? 270 : 400;
  const cardWidth = isMobile ? 118 : isTablet ? 180 : 220;
  const cardHeight = isMobile ? 180 : isTablet ? 245 : 295;

  return (
    <section
      ref={containerRef}
      role="region"
      aria-label="3D Category Showcase"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => pauseAndScheduleResume()}
      className="relative w-full py-10 md:py-16 bg-gradient-to-b from-secondary/15 via-background to-secondary/10 overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4">
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 md:mb-10">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Explore Collections
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xl">
              {subtitle}
            </p>
          </div>

          {/* Desktop/Tablet Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => {
                handlePrev();
                pauseAndScheduleResume();
              }}
              aria-label="Previous Category"
              className="w-11 h-11 rounded-full bg-card hover:bg-secondary/40 border border-border/80 hover:border-primary/50 text-foreground shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group active:scale-95"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                handleNext();
                pauseAndScheduleResume();
              }}
              aria-label="Next Category"
              className="w-11 h-11 rounded-full bg-card hover:bg-secondary/40 border border-border/80 hover:border-primary/50 text-foreground shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group active:scale-95"
            >
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 3D Circular Ring Stage */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full mx-auto flex items-center justify-center"
          style={{
            height: `${cardHeight + (isMobile ? 50 : 80)}px`,
            perspective: isMobile ? '700px' : '1300px',
            perspectiveOrigin: '50% 50%'
          }}
        >
          {/* Subtle Ground Perspective Ring (Visual Depth Guide) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 pointer-events-none -z-10"
            style={{
              width: `${radius * 2 + cardWidth * 0.4}px`,
              height: `${radius * 0.65}px`,
              transform: 'translate(-50%, 40%) rotateX(75deg)'
            }}
          />

          {categories.map((cat, idx) => {
            // Compute relative step distance from active index (-total/2 to +total/2)
            let diff = idx - activeIndex;
            while (diff > total / 2) diff -= total;
            while (diff < -total / 2) diff += total;

            // Compute angle around circular ring
            const stepDeg = 360 / Math.max(1, total);
            const angleDeg = diff * stepDeg;
            const angleRad = (angleDeg * Math.PI) / 180;

            // Cartesian 3D coordinates on horizontal ring
            const sinVal = Math.sin(angleRad);
            const cosVal = Math.cos(angleRad);

            const x = sinVal * radius;
            const z = (cosVal - 1) * radius * 0.85; // Front card is at z = 0, recessed cards have z < 0

            const isCenterActive = Math.abs(diff) < 0.5;
            const isAdjacent = Math.abs(diff) >= 0.5 && Math.abs(diff) < 1.5;

            // On mobile, show center and adjacent cards to prevent viewport overflow
            const isVisible = isMobile ? Math.abs(diff) <= 1.2 : cosVal > -0.15;

            // Depth scaling: front card is larger (1.15), adjacent cards are natural (0.88 - 0.92)
            const scale = isCenterActive
              ? 1.15
              : 0.74 + 0.22 * Math.pow(Math.max(0, cosVal), 1.5);

            // Realistic perspective Y-rotation
            const rotateY = -angleDeg * 0.65;

            // Visual clarity: Keep all visible cards solid and fully opaque to prevent washed-out white bleed-through
            const opacity = isVisible
              ? isCenterActive
                ? 1.0
                : isAdjacent
                  ? 0.98
                  : 0.94
              : 0;

            const zIndex = Math.round((cosVal + 1) * 50);

            const imageUrl =
              cat.image ||
              cat.image_url ||
              'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400&auto=format&fit=crop&q=80';

            return (
              <Link
                key={cat.slug || idx}
                href={`/category/${cat.slug}`}
                onClick={(e) => {
                  // If user performed a swipe gesture, prevent link navigation
                  if (dragOccurredRef.current) {
                    e.preventDefault();
                    return;
                  }
                }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out group block ${
                  isVisible ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `translate3d(calc(-50% + ${x}px), -50%, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  visibility: opacity <= 0.05 ? 'hidden' : 'visible',
                  willChange: 'transform, opacity'
                }}
                aria-label={`View ${cat.name} category`}
              >
                <div
                  className={`relative w-full h-full rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 bg-card border ${
                    isCenterActive
                      ? 'border-2 border-primary shadow-[0_20px_50px_-12px_rgba(234,88,12,0.3)] ring-2 ring-primary/20'
                      : 'border border-border/80 shadow-md shadow-black/8 hover:border-primary/50 hover:shadow-xl'
                  }`}
                >
                  {/* Category Image Area */}
                  <div className="relative w-full h-[58%] overflow-hidden bg-muted">
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{
                        filter: isCenterActive ? 'none' : 'brightness(0.97) contrast(1.02)'
                      }}
                    />
                    {/* Subtle Dark Vignette at Bottom Edge (Enriches depth without white wash) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                    {/* Active Ribbon / Indicator */}
                    {isCenterActive && (
                      <span className="absolute top-2.5 right-2.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md animate-pulse">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Category Details */}
                  <div className="p-2.5 md:p-3.5 flex flex-col justify-between flex-1 text-center bg-card border-t border-border/40">
                    <div>
                      <h3
                        className={`font-extrabold line-clamp-1 transition-colors ${
                          isCenterActive
                            ? 'text-xs md:text-sm text-primary'
                            : 'text-[11px] md:text-xs text-foreground group-hover:text-primary'
                        }`}
                      >
                        {cat.name}
                      </h3>
                      {cat.count && (
                        <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 font-medium">
                          {cat.count}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-1.5 md:mt-2">
                      {isCenterActive ? (
                        <span className="inline-flex items-center justify-center w-full py-1 md:py-1.5 px-2 md:px-3 rounded-xl bg-primary text-primary-foreground text-[11px] md:text-xs font-bold shadow-md group-hover:bg-primary/90 transition-colors">
                          Explore Category →
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-full py-0.5 md:py-1 px-2 md:px-2.5 rounded-xl bg-secondary/80 text-foreground text-[10px] md:text-[11px] font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                          View Collection →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Navigation Controls & Carousel Dots */}
        <div className="flex flex-col items-center gap-3.5 mt-4 md:mt-6">
          {/* Mobile Prev / Next Buttons */}
          <div className="flex sm:hidden items-center justify-center gap-4">
            <button
              onClick={() => {
                handlePrev();
                pauseAndScheduleResume();
              }}
              aria-label="Previous Category"
              className="w-9 h-9 rounded-full bg-card hover:bg-secondary/40 border border-border/80 text-foreground shadow-sm flex items-center justify-center active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-muted-foreground">
              {activeIndex + 1} of {total}
            </span>
            <button
              onClick={() => {
                handleNext();
                pauseAndScheduleResume();
              }}
              aria-label="Next Category"
              className="w-9 h-9 rounded-full bg-card hover:bg-secondary/40 border border-border/80 text-foreground shadow-sm flex items-center justify-center active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-sm">
            {categories.map((c, i) => (
              <button
                key={c.slug || i}
                onClick={() => handleSelectIndex(i)}
                aria-label={`Go to ${c.name}`}
                className={`transition-all duration-300 rounded-full ${
                  i === activeIndex
                    ? 'w-6 md:w-7 h-1.5 md:h-2 bg-primary shadow-sm shadow-primary/30'
                    : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-muted hover:bg-muted-foreground/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
