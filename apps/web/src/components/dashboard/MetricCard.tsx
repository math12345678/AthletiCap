import React, { useEffect, useState } from 'react';
import { Card } from '../ui';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  details?: string;
  onClick?: () => void;
  loading?: boolean;
  action?: React.ReactNode;
  color?: 'gold' | 'teal' | 'success' | 'error' | 'info';
  animated?: boolean;
}

const colorStyles = {
  gold: 'from-gold-500/10 to-transparent border-gold-500/20',
  teal: 'from-teal-500/10 to-transparent border-teal-500/20',
  success: 'from-success-500/10 to-transparent border-success-500/20',
  error: 'from-error-500/10 to-transparent border-error-500/20',
  info: 'from-info-500/10 to-transparent border-info-500/20',
};

const colorAccents = {
  gold: 'text-gold-400',
  teal: 'text-teal-400',
  success: 'text-success-400',
  error: 'text-error-400',
  info: 'text-info-400',
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  icon,
  details,
  onClick,
  loading = false,
  action,
  color = 'gold',
  animated = true,
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(0);

  useEffect(() => {
    if (!animated || typeof value === 'string' || loading) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = typeof value === 'number' ? value : 0;
    const duration = 800;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, animated, loading]);

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={clsx(
        'bg-gradient-to-br',
        colorStyles[color],
        'relative overflow-hidden'
      )}
    >
      <div
        className={clsx(
          'absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-5',
          colorAccents[color]
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-text-secondary font-medium">{title}</p>
          </div>
          {icon && (
            <div className={clsx('h-8 w-8 rounded-lg bg-bg-secondary flex items-center justify-center', colorAccents[color])}>
              {icon}
            </div>
          )}
        </div>

        <div className="mb-4">
          {loading ? (
            <div className="h-8 w-24 bg-bg-elevated rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-text-primary font-playfair">
                {displayValue}
              </span>
              {unit && <span className="text-lg text-text-secondary">{unit}</span>}
            </div>
          )}
        </div>

        {!loading && (
          <>
            {trend && (
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className={clsx(
                    'text-sm font-semibold flex items-center gap-0.5',
                    trend.isPositive ? 'text-success-400' : 'text-error-400'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}%
                </span>
                {trend.label && (
                  <span className="text-xs text-text-secondary">{trend.label}</span>
                )}
              </div>
            )}

            {details && (
              <p className="text-xs text-text-secondary">{details}</p>
            )}
          </>
        )}

        {action && <div className="mt-4 pt-4 border-t border-border-color">{action}</div>}
      </div>
    </Card>
  );
};

export { MetricCard };
