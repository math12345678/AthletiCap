import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'teal';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
type IconPosition = 'left' | 'right';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#1A56DB] text-white hover:opacity-90 focus-visible:ring-[#1A56DB]',
  secondary: 'bg-[#F4F3EF] text-[#1A1916] hover:bg-[#E8E5DC] border border-[#D8D5CC]',
  ghost: 'text-[#1A1916] hover:bg-[#F4F3EF]',
  danger: 'bg-[#C0392B] text-white hover:opacity-90 focus-visible:ring-[#C0392B]',
  success: 'bg-[#2DD09A] text-white hover:opacity-90 focus-visible:ring-[#2DD09A]',
  outline: 'border border-[#D8D5CC] text-[#1A1916] hover:bg-[#F4F3EF]',
  teal: 'bg-[#06B6D4] text-white hover:opacity-90 focus-visible:ring-[#06B6D4]',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-8 px-3 text-xs gap-1.5',
  sm: 'h-9 px-3 text-sm gap-2',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  xl: 'h-14 px-8 text-lg gap-3',
  icon: 'h-10 w-10 p-0',
  'icon-sm': 'h-8 w-8 p-0',
  'icon-lg': 'h-12 w-12 p-0',
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer';

    return (
      <button
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          loading && 'opacity-75 disabled:cursor-wait',
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {icon && iconPosition === 'left' && !loading && (
          <span className="h-5 w-5">{icon}</span>
        )}
        {loading && loadingText ? loadingText : children}
        {icon && iconPosition === 'right' && !loading && (
          <span className="h-5 w-5">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
