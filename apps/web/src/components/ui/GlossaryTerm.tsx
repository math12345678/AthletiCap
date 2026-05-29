import React, { useState } from 'react';

interface GlossaryTermProps {
  term: string;
  children: React.ReactNode;
  definition?: string;
}

const glossary: Record<string, string> = {
  'Budget': 'A plan for how much money you expect to spend on recruiting. Think of it like a roadmap for your finances.',
  'Expense': 'Money you actually spend on recruiting. Includes campus visits, coaching fees, application costs, etc.',
  'Scholarship': 'Money you receive to help pay for college. Athletic scholarships reduce how much you need to pay.',
  'Revenue': 'Money you receive to help pay for college. Athletic scholarships reduce how much you need to pay.',
  'Total CapEx': 'The total amount of money you\'ve spent so far on recruiting.',
  'CAC': 'How much you spend to get one school offer. Calculated by dividing total spending by number of offers.',
  'Cost to Acquire': 'How much you spend to get one school offer. Calculated by dividing total spending by number of offers.',
  'Blended CAC': 'Your average cost per offer across all schools, weighted by scholarship value.',
  'Quality CAC': 'Cost per offer, but only counting "quality" offers (schools that actually fit your goals).',
  'Contacted': 'Schools you\'ve reached out to or that have contacted you.',
  'Interested': 'Schools that have shown genuine interest in recruiting you (multiple coaches contacted you, campus visits offered).',
  'In Talks': 'Schools actively discussing offers with you (serious negotiations happening).',
  'Offered': 'Schools that have officially offered you admission and/or athletic scholarship.',
  'Conservative': 'Best-case spending: You control costs, visit fewer schools, or get better scholarships that reduce expenses.',
  'Base Case': 'Most likely spending: Things go as planned, you follow your original budget and plans.',
  'Optimistic': 'Higher spending: You visit more schools, extend your recruiting timeline, or face unexpected costs.',
  'Percentile': 'A ranking from 0-100. The 25th percentile means 25% of scenarios are lower, 75% are higher.',
  'Variance': 'How much your spending actually differs from your plan. This creates the three different scenarios.',
  'Monte Carlo': 'A tool that runs 1,000+ different scenarios to show you the range of what could happen financially.',
  'School Fit Score': 'A rating (0-100) showing how well a school matches your athletic and academic profile.',
  'Cost of Attendance': 'How much it actually costs to attend a school for one year (tuition, room, board, books, fees).',
  'COA': 'How much it actually costs to attend a school for one year (tuition, room, board, books, fees).',
  'Athletic Scholarship %': 'The percentage of costs that a school covers through athletic scholarship.',
  'Net Cost': 'What you\'ll actually pay after scholarships. COA minus scholarship amount.',
  'ROI': 'How much value you got compared to what you spent. Good ROI = got a lot for your money.',
  'Return on Investment': 'How much value you got compared to what you spent. Good ROI = got a lot for your money.',
  'Trade-offs': 'When you have to choose between options because you can\'t do everything.',
  'Opportunity Cost': 'What you give up when you choose one thing over another.',
};

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ term, children, definition }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipText = definition || glossary[term] || glossary[term.toLowerCase()] || null;

  if (!tooltipText) {
    return <>{children}</>;
  }

  return (
    <div className="inline-block relative">
      <span
        className="border-b border-dashed border-[#1A56DB] cursor-help hover:bg-[#E0E8FF] transition-colors px-0.5"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {children}
      </span>

      {showTooltip && (
        <div className="absolute left-0 bottom-full mb-2 w-48 bg-[#1A1916] text-[#FFFFFF] text-sm rounded px-3 py-2 shadow-lg z-50 pointer-events-none border border-[#2A2824]">
          {tooltipText}
          <div className="absolute left-4 top-full w-2 h-2 bg-[#1A1916] border-r border-b border-[#2A2824]" style={{ transform: 'rotate(45deg)' }} />
        </div>
      )}
    </div>
  );
};

export default GlossaryTerm;
