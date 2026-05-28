import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrencyForChart, getDivisionColor } from '../../lib/chart-colors';

interface CostData {
  year: number;
  [key: string]: number | string; // Offer names as keys with cost values
}

interface CostProjectionChartProps {
  data: CostData[];
  offerNames: string[];
  height?: number;
  title?: string;
}

export function CostProjectionChart({
  data,
  offerNames,
  height = 400,
  title = '4-Year Cost Projection',
}: CostProjectionChartProps) {
  const colors = ['#1A56DB', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
            tick={{ fill: '#5C5A54', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#5C5A54', fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            label={{ value: 'Net Cost', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8D5CC',
              borderRadius: '4px',
            }}
            formatter={(value) => `$${(value as number).toLocaleString()}`}
            labelStyle={{ color: '#1A1916' }}
          />
          <Legend />
          {offerNames.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={colors[index % colors.length]}
              dot={{ fill: colors[index % colors.length] }}
              strokeWidth={2}
              animationDuration={500}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Generate 4-year cost projection from offer data
 */
export function generateCostProjection(
  offers: Array<{
    schoolName: string;
    coa: number;
    athleticScholarshipPct: number;
    meritAidEstimateLow?: number;
    annualContribution?: number;
  }>,
  tuitionInflationRate: number = 0.03
) {
  const years = [1, 2, 3, 4];
  const projections: CostData[] = [];

  years.forEach((year) => {
    const yearData: CostData = { year };

    offers.forEach((offer) => {
      const inflationMultiplier = Math.pow(1 + tuitionInflationRate, year - 1);
      const adjustedCOA = offer.coa * inflationMultiplier;
      const athleticAid = (adjustedCOA * offer.athleticScholarshipPct) / 100;
      const meritAid = offer.meritAidEstimateLow || 0;
      const netCost = adjustedCOA - athleticAid - meritAid;

      yearData[offer.schoolName] = Math.round(netCost);
    });

    projections.push(yearData);
  });

  return projections;
}
