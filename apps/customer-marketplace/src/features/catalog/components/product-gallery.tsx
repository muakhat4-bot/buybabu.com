'use client';

import * as React from 'react';
import { Card } from '@villex/ui';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [zoomStyle, setZoomStyle] = React.useState({ display: 'none', backgroundPosition: '0% 0%' });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  return (
    <div className="space-y-4">
      {/* Main image viewport with hover zoom */}
      <Card
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-square w-full bg-secondary/20 overflow-hidden cursor-crosshair border-border flex items-center justify-center group"
      >
        <img
          src={images[activeIdx] || images[0]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:opacity-0"
        />

        {/* Dynamic Zoom Loupe overlay */}
        <div
          className="absolute inset-0 bg-no-repeat pointer-events-none hidden group-hover:block transition-opacity duration-200"
          style={{
            backgroundImage: `url(${images[activeIdx] || images[0]})`,
            backgroundSize: '200%',
            ...zoomStyle,
          }}
        ></div>

        {/* Scarcity / Trust label overlay */}
        <span className="absolute bottom-4 right-4 bg-background/90 text-[10px] font-bold text-foreground px-2.5 py-1 rounded-md border border-border backdrop-blur-sm shadow flex items-center gap-1 select-none">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Hover to zoom
        </span>
      </Card>

      {/* Thumbnail rows */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {images.map((img, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-secondary/30 transition-all flex-shrink-0 duration-200 ${
                isActive
                  ? 'border-primary ring-2 ring-primary/20 scale-95'
                  : 'border-border hover:border-foreground/45 hover:scale-95'
              }`}
            >
              <img src={img} alt={`${name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
