import * as React from 'react';
import { cn } from '@villex/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'premium' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] duration-150',
          {
            'bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20': variant === 'primary',
            'bg-card text-primary border-2 border-primary hover:bg-primary/5': variant === 'secondary',
            'bg-success text-success-foreground hover:bg-success/90 shadow-md shadow-success/15 hover:shadow-lg hover:shadow-success/25': variant === 'success',
            'bg-warning text-warning-foreground hover:bg-warning/90 shadow-md shadow-warning/15 hover:shadow-lg hover:shadow-warning/25': variant === 'premium',
            'border border-input bg-transparent hover:bg-secondary hover:text-foreground': variant === 'outline',
            'hover:bg-secondary hover:text-foreground': variant === 'ghost',
          },
          {
            'h-9 px-3 text-xs': size === 'sm',
            'h-10 px-5 text-sm': size === 'md',
            'h-11 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
