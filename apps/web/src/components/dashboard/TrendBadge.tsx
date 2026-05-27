import React from 'react';
import clsx from 'clsx';

interface TrendBadgeProps {
  value: number;
  isPositive: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TrendBadge: React.FC<TrendBadgeProps> = ({
  value,
  isPositive,
  label,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const colorStyles = isPositive
    ? 'text-success-400 bg-success-500/10'
    : 'text-error-400 bg-error-500/10';

  return (
    <div className={clsx('flex items-center gap-1.5 font-semibold rounded-lg', sizeStyles[size], colorStyles)}>
      <span>{isPositive ? '↑' : '↓'}</span>
      <span>{value}%</span>
      {label && <span className="text-xs opacity-75">{label}</span>}
    </div>
  );
};

export { TrendBadge };
