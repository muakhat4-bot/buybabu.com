import * as React from 'react';
import { cn } from '@villex/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LogoIcon({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
  };

  return (
    <img
      src="/buybabu-logo.png"
      alt="Buy Babu"
      className={cn('object-contain select-none', sizeClasses[size], className)}
    />
  );
}

export function Logo({ className, iconOnly = false, size = 'md', ...props }: LogoProps) {
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  };

  return (
    <div className={cn('flex items-center select-none', className)} {...props}>
      <img
        src="/buybabu-logo.png"
        alt="Buy Babu"
        className={cn('w-auto object-contain', sizeClasses[size])}
      />
    </div>
  );
}
