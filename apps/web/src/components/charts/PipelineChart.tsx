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
import { STAGE_COLORS } from '../../lib/chart-colors';

interface PipelineStageData {
  stage: string;
  total: number;
  offers: number;
  conversionRate: number;
}

interface PipelineChartProps {
  data: PipelineStageData[];
  height?: number;
  title?: string;
}

export function PipelineConversionChart({
  data,
  height = 350,
  title = 'Pipeline Conversion Funnel',
}: PipelineChartProps) {
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
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="stage"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#5C5A54', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#5C5A54', fontSize: 12 }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8D5CC',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#1A1916' }}
            formatter={(value, name) => {
              if (name === 'total') return [value, 'Total Contacts'];
              if (name === 'offers') return [value, 'Offer Extended'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar
            dataKey="total"
            fill="#3B82F6"
            name="Total Contacts"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="offers"
            fill="#F59E0B"
            name="Offers"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Calculate pipeline conversion rates
 */
export function calculatePipelineMetrics(
  contacts: Array<{
    stage: string;
    verbalOffer?: boolean;
  }>
) {
  const stages = [
    'Initial Contact',
    'Reply Received',
    'Phone Call',
    'Official Visit',
    'Offer Extended',
  ];

  const metrics: PipelineStageData[] = stages.map((stage) => {
    const stageContacts = contacts.filter((c) => c.stage === stage);
    const offersCount = stageContacts.filter((c) => c.verbalOffer).length;
    const total = stageContacts.length;

    return {
      stage,
      total,
      offers: offersCount,
      conversionRate: total > 0 ? (offersCount / total) * 100 : 0,
    };
  });

  return metrics;
}

/**
 * Calculate contacts by division
 */
export function calculateContactsByDivision(
  contacts: Array<{
    division: string;
    verbalOffer?: boolean;
  }>
) {
  const divisions = [
    'D1 Power 4',
    'D1 Mid-Major',
    'D2',
    'D3',
    'NAIA',
    'JUCO',
  ];

  return divisions.map((division) => {
    const divisionContacts = contacts.filter((c) => c.division === division);
    const offers = divisionContacts.filter((c) => c.verbalOffer).length;

    return {
      division,
      total: divisionContacts.length,
      offers,
      color: STAGE_COLORS['Offer Extended'],
    };
  });
}
