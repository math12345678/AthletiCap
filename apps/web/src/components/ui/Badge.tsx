import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'gold' | 'teal';
type BadgeSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-gold-100 text-gold-900 border border-gold-300',
  secondary: 'bg-bg-elevated text-text-primary border border-border-color',
  success: 'bg-success-100 text-success-900 border border-success-300',
  error: 'bg-error-100 text-error-900 border border-error-300',
  warning: 'bg-warning-100 text-warning-900 border border-warning-300',
  info: 'bg-info-100 text-info-900 border border-info-300',
  gold: 'bg-gold-500 text-bg-primary',
  teal: 'bg-teal-500 text-bg-primary',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs font-medium rounded',
  md: 'px-3 py-1 text-sm font-medium rounded-md',
  lg: 'px-4 py-1.5 text-base font-medium rounded-lg',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  isDot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      icon,
      isDot = false,
      children,
      ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon && <span className="h-4 w-4">{icon}</span>}
      {children}
    </span>
  )
);

Badge.displayName = 'Badge';

export { Badge };
