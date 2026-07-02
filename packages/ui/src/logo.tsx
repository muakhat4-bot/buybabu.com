import * as React from 'react';
import { cn } from '@villex/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LogoIcon({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
    >
      {/* Left wing - Deep Royal Blue in light, Primary Accent in dark */}
      <path
        d="M6 6h5.5l5 14h-5.5l-5-14z"
        fill="currentColor"
        className="text-primary transition-colors duration-200"
      />
      {/* Right wing - Warm Gold */}
      <path
        d="M26 6h-5.5l-5 14h5.5l5-14z"
        fill="#F59E0B"
      />
      {/* Accent dot at bottom-center - Warm Gold */}
      <circle
        cx="16"
        cy="25"
        r="3.5"
        fill="#F59E0B"
      />
    </svg>
  );
}

export function Logo({ className, iconOnly = false, size = 'md', ...props }: LogoProps) {
  const textSizes = {
    sm: 'text-lg tracking-wider',
    md: 'text-xl tracking-widest',
    lg: 'text-3xl tracking-widest',
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)} {...props}>
      <LogoIcon size={size} />
      {!iconOnly && (
        <span className={cn('font-black text-foreground font-sans transition-colors duration-200 uppercase', textSizes[size])}>
          Villex
          <span className="text-[#F59E0B] font-black font-sans">.</span>
        </span>
      )}
    </div>
  );
}
