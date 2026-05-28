import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FIT_SCORE_RANGES } from '../../lib/chart-colors';

interface FitScoreData {
  label: string;
  count: number;
  color: string;
  name: string;
}

interface FitScoreChartProps {
  data: FitScoreData[];
  height?: number;
  title?: string;
}

export function FitScoreDistributionChart({
  data,
  height = 300,
  title = 'Fit Score Distribution',
}: FitScoreChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#5C5A54', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#5C5A54', fontSize: 12 }}
            label={{ value: 'Schools', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8D5CC',
              borderRadius: '4px',
            }}
            formatter={(value) => [value, 'Schools']}
            labelStyle={{ color: '#1A1916' }}
          />
          <Bar
            dataKey="count"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Calculate fit score distribution from schools array
 */
export function calculateFitScoreDistribution(
  schools: Array<{ fitScore: number }>
) {
  const distribution = FIT_SCORE_RANGES.map((range) => ({
    label: range.label,
    name: range.name,
    color: range.color,
    count: schools.filter(
      (s) => s.fitScore >= range.min && s.fitScore <= range.max
    ).length,
  }));

  return distribution;
}
