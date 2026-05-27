import React, { useEffect, useState } from 'react';

interface BrandGaugeProps {
  score: number;
  tier: string;
  maxScore?: number;
}

const BrandGauge: React.FC<BrandGaugeProps> = ({ score, tier, maxScore = 100 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const percentage = (animatedScore / maxScore) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on score
  let color = '#EF4444'; // error/red
  if (animatedScore >= 75) color = '#22C55E'; // success/green
  else if (animatedScore >= 50) color = '#F59E0B'; // warning/amber
  else if (animatedScore >= 25) color = '#5BA5D9'; // info/blue

  const tierColors = {
    'Nano': '#5BA5D9',
    'Micro': '#0FB8A8',
    'Mid-Tier': '#F0A500',
    'Macro': '#22C55E',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative h-48 w-48">
        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-text-primary font-playfair">
            {animatedScore}
          </div>
          <div className="text-sm text-text-secondary">out of 100</div>
        </div>
      </div>

      {/* Tier badge */}
      <div
        className="mt-6 px-4 py-2 rounded-full font-semibold text-white"
        style={{ backgroundColor: tierColors[tier as keyof typeof tierColors] || '#5BA5D9' }}
      >
        {tier} Tier
      </div>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success-500" />
          <span className="text-text-secondary">75+ Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning-500" />
          <span className="text-text-secondary">50-74 Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-info-500" />
          <span className="text-text-secondary">25-49 Fair</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-error-500" />
          <span className="text-text-secondary">&lt;25 Poor</span>
        </div>
      </div>
    </div>
  );
};

export { BrandGauge };
