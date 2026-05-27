import React from 'react';
import clsx from 'clsx';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'gold' | 'teal' | 'white';

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantStyles: Record<SpinnerVariant, string> = {
  default: 'text-gold',
  gold: 'text-gold',
  teal: 'text-teal',
  white: 'text-white',
};

interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  (
    {
      size = 'md',
      variant = 'default',
      label = 'Loading',
      className,
      ...props
    },
    ref
  ) => (
    <>
      <svg
        ref={ref}
        className={clsx(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </>
  )
);

Spinner.displayName = 'Spinner';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  fullscreen?: boolean;
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ label, fullscreen = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'flex flex-col items-center justify-center gap-4',
        fullscreen && 'fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50',
        !fullscreen && 'py-12',
        className
      )}
      {...props}
    >
      <Spinner size="lg" />
      {label && <p className="text-sm text-text-secondary">{label}</p>}
    </div>
  )
);

Loader.displayName = 'Loader';

export { Spinner, Loader };
