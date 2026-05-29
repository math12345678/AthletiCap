import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { formatCurrency } from '../lib/utils';

interface CommitmentAnalyzerProps {
  schoolName: string;
  coa: number;
  athleticScholarshipPct: number;
  meritAid: number;
  familyContribution: number;
  tuitionInflationRate?: number;
}

interface YearProjection {
  year: number;
  coa: number;
  scholarship: number;
  aid: number;
  netCost: number;
  familyPays: number;
  gap: number;
}

export const FamilyCommitmentAnalyzer: React.FC<CommitmentAnalyzerProps> = ({
  schoolName,
  coa,
  athleticScholarshipPct,
  meritAid,
  familyContribution,
  tuitionInflationRate = 3,
}) => {
  const projections = useMemo((): YearProjection[] => {
    const data: YearProjection[] = [];
    let currentCOA = coa;

    for (let year = 1; year <= 4; year++) {
      // Apply inflation to COA (except year 1)
      if (year > 1) {
        currentCOA *= 1 + tuitionInflationRate / 100;
      }

      const scholarship = currentCOA * (athleticScholarshipPct / 100);
      const netCost = Math.max(0, currentCOA - scholarship - meritAid);
      const gapAmount = Math.max(0, netCost - familyContribution);

      data.push({
        year,
        coa: Math.round(currentCOA),
        scholarship: Math.round(scholarship),
        aid: Math.round(meritAid),
        netCost: Math.round(netCost),
        familyPays: Math.round(Math.min(netCost, familyContribution)),
        gap: Math.round(gapAmount),
      });
    }

    return data;
  }, [coa, athleticScholarshipPct, meritAid, familyContribution, tuitionInflationRate]);

  const totalFamilyCommitment = projections.reduce((sum, p) => sum + p.familyPays, 0);
  const totalGap = projections.reduce((sum, p) => sum + p.gap, 0);
  const averageAnnualGap = totalGap / 4;

  const getRiskLevel = (gap: number, contribution: number): 'low' | 'moderate' | 'high' => {
    const gapRatio = gap / contribution;
    if (gapRatio <= 0.2) return 'low';
    if (gapRatio <= 0.5) return 'moderate';
    return 'high';
  };

  const getRiskColor = (risk: 'low' | 'moderate' | 'high'): string => {
    switch (risk) {
      case 'low':
        return '#2DD09A';
      case 'moderate':
        return '#F59E0B';
      case 'high':
        return '#C0392B';
    }
  };

  const currentYearRisk = getRiskLevel(
    projections[0]?.gap || 0,
    familyContribution
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-[#D8D5CC] rounded shadow-lg text-xs space-y-1">
          <p className="font-semibold text-[#1A1916]">Year {data.year}</p>
          <p className="text-[#5C5A54]">COA: {formatCurrency(data.coa)}</p>
          <p className="text-green-600">
            Athletic Scholarship: {formatCurrency(data.scholarship)}
          </p>
          <p className="text-green-600">Merit Aid: {formatCurrency(data.aid)}</p>
          <p className="text-[#1A56DB]">
            Net Cost: {formatCurrency(data.netCost)}
          </p>
          <p className="text-[#1A56DB]">
            Your Contribution: {formatCurrency(data.familyPays)}
          </p>
          <p className="font-semibold text-[#C0392B]">Gap: {formatCurrency(data.gap)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
          <div className="text-xs font-semibold text-[#5C5A54] uppercase mb-2">
            Year 1 Risk Level
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold"
            style={{
              backgroundColor:
                currentYearRisk === 'low'
                  ? '#D4EDDA'
                  : currentYearRisk === 'moderate'
                  ? '#FFF3CD'
                  : '#FCE0E0',
              color: getRiskColor(currentYearRisk),
            }}
          >
            <span className="uppercase">{currentYearRisk}</span>
          </div>
          <p className="text-xs text-[#8A8783] mt-3">
            Annual funding gap of{' '}
            <span className="font-semibold">
              {formatCurrency(projections[0]?.gap || 0)}
            </span>
          </p>
        </div>

        <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
          <div className="text-xs font-semibold text-[#5C5A54] uppercase mb-2">
            Total 4-Year Commitment
          </div>
          <div className="text-2xl font-bold text-[#1A1916] mb-2">
            {formatCurrency(totalFamilyCommitment)}
          </div>
          <p className="text-xs text-[#8A8783]">
            Your family's planned contribution across 4 years
          </p>
        </div>

        <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
          <div className="text-xs font-semibold text-[#5C5A54] uppercase mb-2">
            Average Annual Gap
          </div>
          <div className="text-2xl font-bold text-[#1A56DB] mb-2">
            {formatCurrency(Math.round(averageAnnualGap))}
          </div>
          <p className="text-xs text-[#8A8783]">
            Total 4-year gap: {formatCurrency(totalGap)}
          </p>
        </div>
      </div>

      {/* 4-Year Projection Chart */}
      <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
          4-Year Financial Projection - {schoolName}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projections} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#5C5A54', fontSize: 12 }}
              label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              tick={{ fill: '#5C5A54', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="scholarship" fill="#2DD09A" name="Athletic Scholarship" stackId="a" />
            <Bar dataKey="aid" fill="#3B82F6" name="Merit Aid" stackId="a" />
            <Bar dataKey="familyPays" fill="#8B5CF6" name="Family Contribution" stackId="a" />
            <Bar dataKey="gap" fill="#C0392B" name="Funding Gap" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-[#8A8783] mt-4">
          Shows stacked breakdown of how each year's costs are covered. Gap indicates funding needed beyond family contribution.
        </p>
      </div>

      {/* Gap Trend Chart */}
      <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
          Funding Gap Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={projections} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#5C5A54', fontSize: 12 }}
              label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              tick={{ fill: '#5C5A54', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              label={{ value: 'Gap Amount', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="gap"
              stroke="#C0392B"
              dot={{ fill: '#C0392B', r: 4 }}
              strokeWidth={2}
              name="Annual Funding Gap"
            />
            <Line
              type="monotone"
              dataKey="coa"
              stroke="#F59E0B"
              dot={{ fill: '#F59E0B', r: 3 }}
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Cost of Attendance"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-[#8A8783] mt-4">
          Shows how the funding gap changes each year due to tuition inflation (rate: {tuitionInflationRate}% annually)
        </p>
      </div>

      {/* Year-by-Year Details */}
      <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
          Year-by-Year Details
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D8D5CC]">
                <th className="text-left py-3 px-4 font-semibold text-[#1A1916]">
                  Year
                </th>
                <th className="text-right py-3 px-4 font-semibold text-[#1A1916]">
                  COA
                </th>
                <th className="text-right py-3 px-4 font-semibold text-[#1A1916]">
                  Net Cost
                </th>
                <th className="text-right py-3 px-4 font-semibold text-[#1A56DB]">
                  Family Pays
                </th>
                <th className="text-right py-3 px-4 font-semibold text-[#C0392B]">
                  Gap
                </th>
              </tr>
            </thead>
            <tbody>
              {projections.map((proj) => (
                <tr
                  key={proj.year}
                  className="border-b border-[#E8E5DC] hover:bg-[#F4F3EF]"
                >
                  <td className="py-3 px-4 font-semibold text-[#1A1916]">
                    Year {proj.year}
                  </td>
                  <td className="py-3 px-4 text-right text-[#1A1916]">
                    {formatCurrency(proj.coa)}
                  </td>
                  <td className="py-3 px-4 text-right text-[#1A1916]">
                    {formatCurrency(proj.netCost)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#1A56DB]">
                    {formatCurrency(proj.familyPays)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div
                      className="inline-block px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor:
                          proj.gap === 0 ? '#D4EDDA' : '#FCE0E0',
                        color:
                          proj.gap === 0 ? '#0E7C50' : '#C0392B',
                      }}
                    >
                      {formatCurrency(proj.gap)}
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#D8D5CC] bg-[#F4F3EF]">
                <td className="py-3 px-4 font-semibold text-[#1A1916]">
                  4-Year Total
                </td>
                <td className="py-3 px-4 text-right font-semibold text-[#1A1916]">
                  {formatCurrency(
                    projections.reduce((sum, p) => sum + p.coa, 0)
                  )}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-[#1A1916]">
                  {formatCurrency(
                    projections.reduce((sum, p) => sum + p.netCost, 0)
                  )}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-[#1A56DB]">
                  {formatCurrency(totalFamilyCommitment)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-block px-2 py-1 rounded text-xs font-bold bg-[#FCE0E0] text-[#C0392B]">
                    {formatCurrency(totalGap)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FamilyCommitmentAnalyzer;
