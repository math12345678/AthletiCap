import React, { useMemo } from 'react';
import { formatCurrency } from '../lib/utils';
import {
  calculateAffordabilityScore,
  AffordabilityScorer,
} from './AffordabilityScorer';

interface Offer {
  id: string;
  schoolName: string;
  division: string;
  COA: number;
  athleticScholarshipPct: number;
  meritAidEstimate?: { low: number; high: number };
  meritAidOverride?: number;
  annualContribution?: number;
  tuitionInflationRate?: number;
  status: string;
}

interface FamilyProfile {
  expectedFamilyContribution: number;
  acceptableDebtLevel: number;
  preferredLocations: string[];
  academicPriorities: string[];
  athleticPriorities: string[];
}

interface OfferComparisonTableProps {
  offers: Offer[];
  familyProfile?: FamilyProfile;
  sortBy?: 'affordability' | 'cost' | 'scholarship' | 'school';
}

export const OfferComparisonTable: React.FC<OfferComparisonTableProps> = ({
  offers,
  familyProfile,
  sortBy = 'affordability',
}) => {
  const getMetricsForOffer = (offer: Offer) => {
    const meritAid =
      offer.meritAidOverride ||
      (offer.meritAidEstimate
        ? (offer.meritAidEstimate.low + offer.meritAidEstimate.high) / 2
        : 0);
    const athleticScholarship = offer.COA * (offer.athleticScholarshipPct / 100);
    const yearlyNetCost = Math.max(0, offer.COA - athleticScholarship - meritAid);
    const annualContribution = offer.annualContribution || familyProfile?.expectedFamilyContribution || 0;
    const yearlyGap = Math.max(0, yearlyNetCost - annualContribution);

    // Calculate 4-year projection with inflation
    let fourYearTotal = 0;
    let currentCOA = offer.COA;
    const inflationRate = offer.tuitionInflationRate || 3;

    for (let year = 1; year <= 4; year++) {
      if (year > 1) {
        currentCOA *= 1 + inflationRate / 100;
      }
      const yearScholarship = currentCOA * (offer.athleticScholarshipPct / 100);
      const yearNetCost = Math.max(0, currentCOA - yearScholarship - meritAid);
      const yearGap = Math.max(0, yearNetCost - annualContribution);
      fourYearTotal += yearGap;
    }

    return {
      meritAid,
      athleticScholarship,
      yearlyNetCost,
      yearlyGap,
      fourYearTotal,
      annualContribution,
    };
  };

  const offersWithScores = useMemo(() => {
    return offers.map((offer) => {
      const metrics = getMetricsForOffer(offer);
      const affordabilityScore = familyProfile
        ? calculateAffordabilityScore({
            coa: offer.COA,
            athleticScholarshipPct: offer.athleticScholarshipPct,
            meritAid: metrics.meritAid,
            familyContribution: familyProfile.expectedFamilyContribution,
            acceptableDebtLevel: familyProfile.acceptableDebtLevel,
            fourYearTotalCost: metrics.fourYearTotal,
          })
        : null;

      return {
        ...offer,
        ...metrics,
        affordabilityScore,
      };
    });
  }, [offers, familyProfile]);

  const sortedOffers = useMemo(() => {
    const sorted = [...offersWithScores];
    switch (sortBy) {
      case 'affordability':
        return sorted.sort((a, b) => {
          if (!a.affordabilityScore || !b.affordabilityScore) return 0;
          return b.affordabilityScore.score - a.affordabilityScore.score;
        });
      case 'cost':
        return sorted.sort((a, b) => a.yearlyNetCost - b.yearlyNetCost);
      case 'scholarship':
        return sorted.sort(
          (a, b) => b.athleticScholarshipPct - a.athleticScholarshipPct
        );
      case 'school':
        return sorted.sort((a, b) =>
          a.schoolName.localeCompare(b.schoolName)
        );
      default:
        return sorted;
    }
  }, [offersWithScores, sortBy]);

  const bestAffordableOffer = offersWithScores
    .filter((o) => o.affordabilityScore && o.affordabilityScore.score >= 5)
    .sort(
      (a, b) =>
        (b.affordabilityScore?.score || 0) - (a.affordabilityScore?.score || 0)
    )[0];

  return (
    <div className="space-y-6">
      {bestAffordableOffer && (
        <div className="bg-gradient-to-r from-[#2DD09A] to-[#10B981] p-6 rounded-lg text-white">
          <div className="text-sm font-semibold uppercase mb-2 opacity-90">
            Recommended Choice
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {bestAffordableOffer.schoolName}
              </h3>
              <p className="text-sm opacity-90">
                Best balance of affordability ({bestAffordableOffer.affordabilityScore?.score}/10) and offer quality
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">Annual Gap</div>
              <div className="text-2xl font-bold">
                {formatCurrency(bestAffordableOffer.yearlyGap)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#D8D5CC]">
              <th className="text-left py-3 px-4 font-semibold text-[#1A1916]">
                School
              </th>
              <th className="text-left py-3 px-4 font-semibold text-[#1A1916]">
                Division
              </th>
              <th className="text-right py-3 px-4 font-semibold text-[#1A1916]">
                COA
              </th>
              <th className="text-right py-3 px-4 font-semibold text-[#1A1916]">
                Athletic Aid %
              </th>
              <th className="text-right py-3 px-4 font-semibold text-[#1A1916]">
                Merit Aid
              </th>
              <th className="text-right py-3 px-4 font-semibold text-[#1A56DB]">
                Year 1 Gap
              </th>
              <th className="text-right py-3 px-4 font-semibold text-[#1A56DB]">
                4-Year Total
              </th>
              {familyProfile && (
                <th className="text-center py-3 px-4 font-semibold text-[#1A1916]">
                  Affordability
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedOffers.map((offer) => (
              <tr
                key={offer.id}
                className="border-b border-[#E8E5DC] hover:bg-[#F4F3EF] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="font-semibold text-[#1A1916]">
                    {offer.schoolName}
                  </div>
                  {offer.status && (
                    <div className="text-xs text-[#8A8783] mt-1">
                      {offer.status.replace(/_/g, ' ')}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 text-[#5C5A54]">{offer.division}</td>
                <td className="py-4 px-4 text-right font-semibold text-[#1A1916]">
                  {formatCurrency(offer.COA)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="px-2 py-1 bg-[#D4EDDA] text-[#0E7C50] rounded text-xs font-semibold">
                    {offer.athleticScholarshipPct}%
                  </span>
                </td>
                <td className="py-4 px-4 text-right text-[#2DD09A] font-semibold">
                  {formatCurrency(offer.meritAid)}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="font-semibold text-[#1A56DB]">
                    {formatCurrency(offer.yearlyGap)}
                  </div>
                  {offer.annualContribution && (
                    <div className="text-xs text-[#8A8783] mt-1">
                      {offer.yearlyGap > 0 ? 'Need funding' : 'Covered'}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="font-semibold text-[#1A56DB]">
                    {formatCurrency(offer.fourYearTotal)}
                  </div>
                </td>
                {familyProfile && offer.affordabilityScore && (
                  <td className="py-4 px-4 text-center">
                    <div
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-bold"
                      style={{
                        backgroundColor: offer.affordabilityScore.bgColor,
                        color: offer.affordabilityScore.color,
                      }}
                    >
                      {offer.affordabilityScore.score}
                      <span className="text-xs">/10</span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-xs font-semibold text-[#5C5A54] mb-1 uppercase">
            Lowest Annual Gap
          </div>
          <div className="text-lg font-bold text-[#1A1916]">
            {formatCurrency(
              Math.min(...offersWithScores.map((o) => o.yearlyGap))
            )}
          </div>
          <div className="text-xs text-[#8A8783] mt-2">
            {
              offersWithScores.find(
                (o) =>
                  o.yearlyGap ===
                  Math.min(...offersWithScores.map((o) => o.yearlyGap))
              )?.schoolName
            }
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-xs font-semibold text-[#5C5A54] mb-1 uppercase">
            Highest Scholarship %
          </div>
          <div className="text-lg font-bold text-[#1A1916]">
            {Math.max(...offersWithScores.map((o) => o.athleticScholarshipPct))}%
          </div>
          <div className="text-xs text-[#8A8783] mt-2">
            {
              offersWithScores.find(
                (o) =>
                  o.athleticScholarshipPct ===
                  Math.max(...offersWithScores.map((o) => o.athleticScholarshipPct))
              )?.schoolName
            }
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-xs font-semibold text-[#5C5A54] mb-1 uppercase">
            Average 4-Year Gap
          </div>
          <div className="text-lg font-bold text-[#1A1916]">
            {formatCurrency(
              offersWithScores.reduce((sum, o) => sum + o.fourYearTotal, 0) /
                offersWithScores.length
            )}
          </div>
          <div className="text-xs text-[#8A8783] mt-2">
            Across all {offersWithScores.length} offers
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferComparisonTable;
