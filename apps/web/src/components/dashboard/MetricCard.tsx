import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  label?: string;
  accent?: 'gold' | 'teal' | 'green' | 'red';
}

export default function MetricCard({ title, value, label, accent = 'gold' }: MetricCardProps) {
  const accentMap = {
    gold: 'metric-card-accent-gold',
    teal: 'metric-card-accent-teal',
    green: 'metric-card-accent-green',
    red: 'border-l-red',
  };

  return (
    <div className={`metric-card ${accentMap[accent]}`}>
      <div className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-2">
        {title}
      </div>
      <div className="text-3xl font-playfair font-bold text-text-primary mb-2">
        {value}
      </div>
      {label && <div className="text-sm text-text-secondary">{label}</div>}
    </div>
  );
}
