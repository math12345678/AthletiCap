import React from 'react';
import { formatCurrency } from '../lib/utils';

export interface AffordabilityScore {
  score: number; // 1-10 scale
  tier: 'exceptional' | 'strong' | 'moderate' | 'challenging' | 'unaffordable';
  reasoning: string[];
  color: string;
  bgColor: string;
}

interface AffordabilityScorerProps {
  coa: number;
  athleticScholarshipPct: number;
  meritAid: number;
  familyContribution: number;
  acceptableDebtLevel: number;
  fourYearTotalCost: number;
}

export const calculateAffordabilityScore = ({
  coa,
  athleticScholarshipPct,
  meritAid,
  familyContribution,
  acceptableDebtLevel,
  fourYearTotalCost,
}: AffordabilityScorerProps): AffordabilityScore => {
  const athleticScholarship = coa * (athleticScholarshipPct / 100);
  const yearlyNetCost = Math.max(0, coa - athleticScholarship - meritAid);
  const yearlyGap = Math.max(0, yearlyNetCost - familyContribution);
  const fourYearGap = yearlyGap * 4;

  let score = 10;
  const reasoning: string[] = [];

  // Athletic scholarship coverage (up to -3 points)
  if (athleticScholarshipPct < 50) {
    score -= 3;
    reasoning.push(`Low athletic scholarship (${athleticScholarshipPct}% - seek higher coverage)`);
  } else if (athleticScholarshipPct < 75) {
    score -= 1;
    reasoning.push(`Moderate athletic scholarship (${athleticScholarshipPct}%)`);
  } else {
    reasoning.push(`Strong athletic scholarship (${athleticScholarshipPct}%)`);
  }

  // Family contribution vs annual net cost (up to -2 points)
  if (familyContribution === 0) {
    score -= 2;
    reasoning.push('Family contribution not set - unable to assess gap');
  } else if (yearlyGap > familyContribution * 0.5) {
    score -= 2;
    reasoning.push(
      `Annual gap of ${formatCurrency(yearlyGap)} exceeds 50% of family contribution`
    );
  } else if (yearlyGap > 0) {
    score -= 1;
    reasoning.push(`Annual gap of ${formatCurrency(yearlyGap)} requires additional funding`);
  } else {
    reasoning.push(`Family contribution covers net annual cost with surplus`);
  }

  // 4-year total cost vs acceptable debt (up to -3 points)
  if (fourYearTotalCost > acceptableDebtLevel) {
    const overage = fourYearTotalCost - acceptableDebtLevel;
    const overagePercent = (overage / acceptableDebtLevel) * 100;
    if (overagePercent > 50) {
      score -= 3;
      reasoning.push(
        `4-year cost (${formatCurrency(fourYearTotalCost)}) exceeds acceptable debt by ${overagePercent.toFixed(0)}%`
      );
    } else if (overagePercent > 20) {
      score -= 2;
      reasoning.push(
        `4-year cost (${formatCurrency(fourYearTotalCost)}) exceeds acceptable debt by ${overagePercent.toFixed(0)}%`
      );
    } else {
      score -= 1;
      reasoning.push(
        `4-year cost (${formatCurrency(fourYearTotalCost)}) slightly exceeds acceptable debt`
      );
    }
  } else {
    const surplus = acceptableDebtLevel - fourYearTotalCost;
    reasoning.push(
      `4-year cost (${formatCurrency(fourYearTotalCost)}) is within acceptable limits (${formatCurrency(surplus)} buffer)`
    );
  }

  // Ensure score is between 1-10
  score = Math.max(1, Math.min(10, score));

  // Determine tier and colors
  let tier: 'exceptional' | 'strong' | 'moderate' | 'challenging' | 'unaffordable';
  let color: string;
  let bgColor: string;

  if (score >= 8.5) {
    tier = 'exceptional';
    color = '#2DD09A'; // Bright green
    bgColor = '#D4EDDA'; // Light green
  } else if (score >= 7) {
    tier = 'strong';
    color = '#10B981'; // Medium green
    bgColor = '#E0F4F0'; // Very light green
  } else if (score >= 5) {
    tier = 'moderate';
    color = '#F59E0B'; // Amber
    bgColor = '#FFF3CD'; // Light amber
  } else if (score >= 3) {
    tier = 'challenging';
    color = '#EA8C55'; // Orange
    bgColor = '#FFE4D0'; // Light orange
  } else {
    tier = 'unaffordable';
    color = '#C0392B'; // Red
    bgColor = '#FCE0E0'; // Light red
  }

  return {
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    tier,
    reasoning,
    color,
    bgColor,
  };
};

export const AffordabilityScorer: React.FC<{
  score: AffordabilityScore;
  compact?: boolean;
}> = ({ score, compact = false }) => {
  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold"
        style={{ backgroundColor: score.bgColor, color: score.color }}
      >
        <span className="text-lg font-bold">{score.score}/10</span>
        <span className="text-xs uppercase">{score.tier}</span>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-lg border-2"
      style={{
        backgroundColor: score.bgColor,
        borderColor: score.color,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1A1916] mb-1">
            Affordability Score
          </h3>
          <p className="text-sm text-[#5C5A54]">
            Based on family financial profile and offer details
          </p>
        </div>
        <div className="text-right">
          <div
            className="text-4xl font-bold"
            style={{ color: score.color }}
          >
            {score.score}
          </div>
          <div className="text-xs uppercase font-semibold" style={{ color: score.color }}>
            {score.tier}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {score.reasoning.map((reason, idx) => (
          <div key={idx} className="flex gap-2 text-sm text-[#5C5A54]">
            <span className="font-bold text-[#1A1916]">•</span>
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AffordabilityScorer;
