import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  elevated?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  border?: boolean;
  onClick?: () => void;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverable = false,
      elevated = false,
      padding = 'md',
      border = true,
      children,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      none: 'p-0',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-lg bg-bg-secondary transition-all duration-200',
          border && 'border border-border-color',
          elevated && 'shadow-lg',
          hoverable && 'hover:shadow-xl hover:border-border-bright cursor-pointer',
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex items-start justify-between gap-4 pb-4 border-b border-border-color', className)}
      {...props}
    >
      <div className="flex-1">
        {title && <h3 className="font-playfair text-lg font-bold text-text-primary">{title}</h3>}
        {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('py-4', className)} {...props}>
      {children}
    </div>
  )
);

CardBody.displayName = 'CardBody';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex items-center justify-end gap-3 border-t border-border-color pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
