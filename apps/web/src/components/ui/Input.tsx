import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  floatingLabel?: boolean;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helpText,
      icon,
      iconPosition = 'left',
      floatingLabel = false,
      fullWidth = true,
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && !floatingLabel && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none h-5 w-5">
              {icon}
            </div>
          )}

          {floatingLabel ? (
            <>
              <input
                ref={ref}
                id={inputId}
                type={type}
                placeholder=" "
                className={clsx(
                  'w-full px-4 py-2.5 bg-bg-secondary border rounded-lg text-text-primary placeholder-transparent transition-all duration-200',
                  error
                    ? 'border-error-500 focus:border-error-600 focus:ring-1 focus:ring-error-500'
                    : 'border-border-color focus:border-gold focus:ring-1 focus:ring-gold/20',
                  icon && iconPosition === 'left' && 'pl-10',
                  icon && iconPosition === 'right' && 'pr-10',
                  'peer',
                  className
                )}
                {...props}
              />
              <label
                htmlFor={inputId}
                className="absolute left-4 top-2.5 text-sm text-text-secondary transition-all duration-200 pointer-events-none peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-1 peer-focus:text-xs peer-focus:text-gold"
              >
                {label}
              </label>
            </>
          ) : (
            <input
              ref={ref}
              id={inputId}
              type={type}
              className={clsx(
                'w-full px-4 py-2.5 bg-bg-secondary border rounded-lg text-text-primary transition-all duration-200',
                error
                  ? 'border-error-500 focus:border-error-600 focus:ring-1 focus:ring-error-500'
                  : 'border-border-color focus:border-gold focus:ring-1 focus:ring-gold/20',
                icon && iconPosition === 'left' && 'pl-10',
                icon && iconPosition === 'right' && 'pr-10',
                className
              )}
              {...props}
            />
          )}

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none h-5 w-5">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-error-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}

        {helpText && !error && (
          <p className="mt-1.5 text-sm text-text-secondary">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
