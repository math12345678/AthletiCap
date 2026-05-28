/**
 * Centralized chart color configuration for consistent theming across all visualizations
 */

export const DIVISION_COLORS: Record<string, string> = {
  'D1 Power 4': '#1A56DB',
  'D1 Mid-Major': '#3B82F6',
  'D2': '#8B5CF6',
  'D3': '#06B6D4',
  'NAIA': '#10B981',
  'JUCO': '#F59E0B',
};

export const FIT_SCORE_COLORS = {
  excellent: '#2DD09A', // 80+
  good: '#F59E0B', // 60-79
  moderate: '#EA8C55', // 40-59
  low: '#C0392B', // 0-39
};

export const FIT_SCORE_RANGES = [
  { min: 80, max: 100, label: '80-100', color: FIT_SCORE_COLORS.excellent, name: 'Excellent Fit' },
  { min: 60, max: 79, label: '60-79', color: FIT_SCORE_COLORS.good, name: 'Good Fit' },
  { min: 40, max: 59, label: '40-59', color: FIT_SCORE_COLORS.moderate, name: 'Moderate Fit' },
  { min: 0, max: 39, label: '0-39', color: FIT_SCORE_COLORS.low, name: 'Low Fit' },
];

export const STAGE_COLORS: Record<string, string> = {
  'Initial Contact': '#E5E7EB',
  'Reply Received': '#3B82F6',
  'Phone Call': '#8B5CF6',
  'Official Visit': '#10B981',
  'Offer Extended': '#F59E0B',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Showcase/Camp': '#3B82F6',
  'Travel': '#8B5CF6',
  'Camps': '#06B6D4',
  'Visits': '#10B981',
  'Coaching Fee': '#F59E0B',
  'Film': '#EA8C55',
  'Other': '#D1D5DB',
};

export const CONFIDENCE_COLORS: Record<string, string> = {
  verbal: '#F59E0B',
  written: '#8B5CF6',
  signed: '#2DD09A',
};

/**
 * Get fit score color based on score value
 */
export function getFitScoreColor(score: number): string {
  if (score >= 80) return FIT_SCORE_COLORS.excellent;
  if (score >= 60) return FIT_SCORE_COLORS.good;
  if (score >= 40) return FIT_SCORE_COLORS.moderate;
  return FIT_SCORE_COLORS.low;
}

/**
 * Get division color by name
 */
export function getDivisionColor(division: string): string {
  return DIVISION_COLORS[division] || '#9CA3AF';
}

/**
 * Get stage color by name
 */
export function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || '#D1D5DB';
}

/**
 * Format currency for tooltips
 */
export function formatCurrencyForChart(value: number): string {
  return `$${(value / 1000).toFixed(0)}K`;
}

/**
 * Format percentage for tooltips
 */
export function formatPercentageForChart(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
