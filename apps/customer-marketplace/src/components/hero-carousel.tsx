'use client';

import * as React from 'react';
import Link from 'next/link';

interface BannerSlide {
  id: string;
  image: string;
  title: string;
  link: string;
  floatingText: string;
  savingText: string;
}

const slides: BannerSlide[] = [
  {
    id: 'households',
    image: '/households-banner.png',
    title: 'New Home Arrivals',
    link: '/search?category=home',
    floatingText: 'Up to 40% Off',
    savingText: 'Save PKR 2,400'
  },
  {
    id: 'smart-gadgets',
    image: '/gadgets-banner.png',
    title: 'Next-Generation Smart Gadgets',
    link: '/search?category=smart-gadgets',
    floatingText: '100% Authentic',
    savingText: 'Free Shipping Included'
  },
  {
    id: 'kitchen-essentials',
    image: '/kitchen-banner-new.png',
    title: 'Professional Grade Kitchen Essentials',
    link: '/search?category=kitchen',
    floatingText: 'Chef Approved',
    savingText: 'Save PKR 1,500'
  }
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [prevIndex, setPrevIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<'next' | 'prev'>('next');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const autoPlayTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = React.useCallback(() => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, 7000); // Cycle every 7 seconds
  }, [activeIndex]);

  React.useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [startAutoPlay]);

  const handleNext = React.useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection('next');
    setPrevIndex(activeIndex);
    setActiveIndex((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [activeIndex, isTransitioning]);

  const handlePrev = React.useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection('prev');
    setPrevIndex(activeIndex);
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [activeIndex, isTransitioning]);

  const handleDotClick = (index: number) => {
    if (isTransitioning || index === activeIndex) return;
    setIsTransitioning(true);
    setDirection(index > activeIndex ? 'next' : 'prev');
    setPrevIndex(activeIndex);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-background aspect-[16/9] md:aspect-[1024/576] max-h-[500px] select-none border-b border-border/20 group/carousel"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Slide Track */}
      <div className="w-full h-full relative carousel-3d-container">
        {slides.map((slide, idx) => {
          let transitionClass = '';
          
          if (idx === activeIndex) {
            transitionClass = 'slide-active';
          } else if (idx === prevIndex) {
            transitionClass = direction === 'next' ? 'slide-exit-next' : 'slide-exit-prev';
          } else {
            transitionClass = direction === 'next' ? 'slide-enter-next' : 'slide-enter-prev';
          }

          const isActive = idx === activeIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full carousel-3d-slide ${transitionClass}`}
              style={{
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <Link href={slide.link} className="block w-full h-full relative cursor-pointer">
                {/* Slide Background with Ken Burns & Mouse Parallax */}
                <div 
                  className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out"
                  style={{
                    transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) scale(1.04)`,
                  }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={`w-full h-full object-cover ${isActive ? 'animate-kenburns' : ''}`}
                  />
                  {/* Subtle shadow overlay at the bottom for navigation and aesthetics */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-60" />
                </div>

                {/* Glassmorphic Floating Button CTA in bottom-left */}
                <div className="absolute left-[5%] bottom-[12%] z-20 pointer-events-none">
                  <div
                    className={`px-5 py-2.5 rounded-xl bg-background/70 backdrop-blur-md border border-white/10 dark:border-border/30 shadow-lg text-xs font-black text-foreground hover:bg-background/80 transition-all duration-700 ease-out transform ${
                      isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                    }`}
                    style={{
                      transform: `rotateY(${mousePos.x * 12}deg) rotateX(${mousePos.y * -12}deg) translateZ(10px)`,
                    }}
                  >
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      Shop Collection
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>




              </Link>
            </div>
          );
        })}
      </div>

      {/* Glassmorphic Side Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full flex items-center justify-center border border-white/10 dark:border-border/30 bg-background/30 backdrop-blur-md text-foreground shadow-lg hover:bg-background/65 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300"
        aria-label="Previous Slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full flex items-center justify-center border border-white/10 dark:border-border/30 bg-background/30 backdrop-blur-md text-foreground shadow-lg hover:bg-background/65 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300"
        aria-label="Next Slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Progress Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              handleDotClick(idx);
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === activeIndex
                ? 'w-7 bg-primary'
                : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
