import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface OfferData {
  schoolName: string;
  coa: number;
  athleticScholarshipPct: number;
  meritAid: number;
  annualContribution?: number;
}

interface CostComparisonChartProps {
  offers: OfferData[];
  height?: number;
}

export const CostComparisonChart: React.FC<CostComparisonChartProps> = ({ offers, height = 300 }) => {
  if (offers.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-[#F4F3EF] rounded border border-[#D8D5CC]">
        <p className="text-[#5C5A54]">No offers to compare</p>
      </div>
    );
  }

  const data = offers.map((offer) => {
    const athleticScholarship = offer.coa * (offer.athleticScholarshipPct / 100);
    const familyPays = Math.max(0, offer.coa - athleticScholarship - offer.meritAid);
    const studentLoan = Math.max(0, familyPays - (offer.annualContribution || 0));

    return {
      name: offer.schoolName,
      'Athletic Scholarship': athleticScholarship,
      'Merit Aid': offer.meritAid,
      'Family Contribution': offer.annualContribution || 0,
      'Student Loan/Work': studentLoan,
      total: offer.coa,
    };
  });

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-[#D8D5CC] rounded shadow-lg text-xs">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
      <div className="text-xs font-mono uppercase tracking-widest text-[#1A56DB] mb-4">
        Cost Comparison by Offer
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12, fill: '#5C5A54' }}
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12, fill: '#5C5A54' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            itemStyle={{ color: '#5C5A54', fontSize: '12px' }}
          />
          <Bar dataKey="Athletic Scholarship" stackId="a" fill={COLORS[0]} />
          <Bar dataKey="Merit Aid" stackId="a" fill={COLORS[1]} />
          <Bar dataKey="Family Contribution" stackId="a" fill={COLORS[2]} />
          <Bar dataKey="Student Loan/Work" stackId="a" fill={COLORS[3]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D8D5CC]">
              <th className="text-left py-2 px-2 font-semibold text-[#1A1916]">School</th>
              <th className="text-right py-2 px-2 font-semibold text-[#1A1916]">COA</th>
              <th className="text-right py-2 px-2 font-semibold text-[#1A1916]">Scholarship</th>
              <th className="text-right py-2 px-2 font-semibold text-[#1A1916]">Merit Aid</th>
              <th className="text-right py-2 px-2 font-semibold text-[#1A56DB]">Family Pays</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const familyPays = Math.max(0, row.total - row['Athletic Scholarship'] - row['Merit Aid']);
              return (
                <tr key={row.name} className="border-b border-[#E8E5DC] hover:bg-[#F4F3EF]">
                  <td className="py-2 px-2 text-[#5C5A54]">{row.name}</td>
                  <td className="text-right py-2 px-2 text-[#1A1916]">{formatCurrency(row.total)}</td>
                  <td className="text-right py-2 px-2 text-green-600">{formatCurrency(row['Athletic Scholarship'])}</td>
                  <td className="text-right py-2 px-2 text-green-600">{formatCurrency(row['Merit Aid'])}</td>
                  <td className="text-right py-2 px-2 font-semibold text-[#1A56DB]">{formatCurrency(familyPays)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CostComparisonChart;
