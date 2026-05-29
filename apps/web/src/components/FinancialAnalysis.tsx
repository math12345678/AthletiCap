import React from 'react';
import { formatCurrency } from '../lib/utils';

interface FinancialAnalysisProps {
  schoolName: string;
  coa: number;
  athleticScholarshipPct: number;
  meritAid: number;
  annualContribution?: number;
  fourYearProjection?: boolean;
  tuitionInflationRate?: number;
}

export const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({
  schoolName,
  coa,
  athleticScholarshipPct,
  meritAid,
  annualContribution = 0,
  fourYearProjection = false,
  tuitionInflationRate = 3,
}) => {
  const athleticScholarship = coa * (athleticScholarshipPct / 100);
  const netCost = Math.max(0, coa - athleticScholarship - meritAid + annualContribution);
  const familyPays = Math.max(0, coa - athleticScholarship - meritAid);

  const calculateYearProjection = (year: number) => {
    let yearCOA = coa;
    for (let i = 1; i < year; i++) {
      yearCOA *= 1 + tuitionInflationRate / 100;
    }
    const yearScholarship = yearCOA * (athleticScholarshipPct / 100);
    const yearNetCost = Math.max(0, yearCOA - yearScholarship - meritAid + annualContribution);
    return {
      coa: yearCOA,
      scholarship: yearScholarship,
      netCost: yearNetCost,
      familyPays: Math.max(0, yearCOA - yearScholarship - meritAid),
    };
  };

  return (
    <div className="space-y-6">
      {/* Year 1 Breakdown */}
      <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
        <div className="text-xs font-mono uppercase tracking-widest text-[#1A56DB] mb-4">
          Year 1 Cost Breakdown
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-[#E8E5DC]">
            <span className="text-[#5C5A54]">Cost of Attendance</span>
            <span className="font-semibold text-[#1A1916]">{formatCurrency(coa)}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-green-600">
            <span className="text-[#5C5A54]">Athletic Scholarship ({athleticScholarshipPct}%)</span>
            <span className="font-semibold">−{formatCurrency(athleticScholarship)}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-green-600">
            <span className="text-[#5C5A54]">Merit Aid</span>
            <span className="font-semibold">−{formatCurrency(meritAid)}</span>
          </div>

          <div className="flex justify-between items-center py-3 px-2 bg-[#F4F3EF] rounded border border-[#D8D5CC]">
            <span className="font-semibold text-[#1A1916]">Family Contribution</span>
            <span className="text-lg font-bold text-[#1A56DB]">{formatCurrency(familyPays)}</span>
          </div>
        </div>

        {/* Additional Context */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded border border-blue-100">
            <div className="text-[#5C5A54] text-xs mb-1">Student Loans/Work</div>
            <div className="font-semibold text-[#1A1916]">{formatCurrency(Math.max(0, familyPays - annualContribution))}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-100">
            <div className="text-[#5C5A54] text-xs mb-1">4-Year Total</div>
            <div className="font-semibold text-[#1A1916]">{formatCurrency(netCost * 4)}</div>
          </div>
        </div>
      </div>

      {/* 4-Year Projection (if enabled) */}
      {fourYearProjection && (
        <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
          <div className="text-xs font-mono uppercase tracking-widest text-[#1A56DB] mb-4">
            4-Year Financial Projection
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4].map((year) => {
              const projection = calculateYearProjection(year);
              return (
                <div key={year} className="flex justify-between items-center py-2 border-b border-[#E8E5DC] last:border-0">
                  <span className="text-[#5C5A54]">Year {year}</span>
                  <div className="flex gap-4 text-sm">
                    <div className="text-right">
                      <div className="text-[#8A8783] text-xs">COA</div>
                      <div className="font-semibold text-[#1A1916]">{formatCurrency(projection.coa)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#8A8783] text-xs">Net Cost</div>
                      <div className="font-semibold text-[#1A56DB]">{formatCurrency(projection.familyPays)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
            <div className="flex justify-between">
              <span className="font-semibold text-[#1A1916]">4-Year Total Cost</span>
              <span className="text-lg font-bold text-[#1A56DB]">{formatCurrency(
                [1, 2, 3, 4].reduce((sum, year) => sum + calculateYearProjection(year).familyPays, 0)
              )}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAnalysis;
