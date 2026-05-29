import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Card } from '../components/ui';

const sections = [
  {
    title: 'Core Concepts',
    topics: [
      {
        term: 'Budget',
        definition: 'A plan for how much money you expect to spend. Think of it like a roadmap for your finances.',
        example: 'Your recruiting budget is $50,000 for 4 years, so you plan to spend about $12,500 per year.'
      },
      {
        term: 'Expense / Cost',
        definition: 'Money you actually spend on recruiting. Includes campus visits, coaching fees, application costs, etc.',
        example: 'Traveling to a campus visit costs $500 (flights, hotel, meals). That\'s an expense.'
      },
      {
        term: 'Revenue / Scholarship',
        definition: 'Money you receive to help pay for college. Athletic scholarships reduce how much you need to pay.',
        example: 'A school offers you a 50% athletic scholarship, so they cover half your costs.'
      }
    ]
  },
  {
    title: 'Financial Tracking',
    topics: [
      {
        term: 'Total CapEx (Capital Expenditure)',
        definition: 'The total amount of money you\'ve spent so far on recruiting. CapEx = spending on assets/investments that last multiple years.',
        example: 'You\'ve spent $15,000 on recruiting so far (campus visits, coaches, materials). That\'s your Total CapEx.'
      },
      {
        term: 'CAC (Cost to Acquire)',
        definition: 'How much you spend to get one school offer. Calculated by dividing total spending by number of offers.',
        example: 'You spent $30,000 and got 3 offers. Your CAC is $10,000 per offer.'
      },
      {
        term: 'Blended CAC',
        definition: 'Your average cost per offer across all schools, weighted by scholarship value.',
        example: 'If offers have different scholarship amounts, blended CAC shows the true cost when scholarships are factored in.'
      },
      {
        term: 'Quality CAC',
        definition: 'Cost per offer, but only counting "quality" offers (schools that actually fit your goals).',
        example: 'Out of 3 offers, maybe 2 are schools you\'d actually attend. Quality CAC uses only those 2.'
      }
    ]
  },
  {
    title: 'Recruiting Pipeline',
    topics: [
      {
        term: 'Contacted',
        definition: 'Schools you\'ve reached out to or that have contacted you.',
        example: 'You emailed 20 coaches. Those 20 schools are in your "Contacted" stage.'
      },
      {
        term: 'Interested',
        definition: 'Schools that have shown genuine interest in recruiting you (multiple coaches contacted you, campus visits offered).',
        example: '5 of those 20 schools asked you to visit campus. Those 5 are "Interested".'
      },
      {
        term: 'In Talks',
        definition: 'Schools actively discussing offers with you (serious negotiations happening).',
        example: '2 schools are actively discussing scholarship packages with you.'
      },
      {
        term: 'Offered',
        definition: 'Schools that have officially offered you admission and/or athletic scholarship.',
        example: 'You have formal offers from 2 schools with scholarship amounts.'
      }
    ]
  },
  {
    title: 'Financial Scenarios (Monte Carlo)',
    topics: [
      {
        term: 'Conservative Scenario',
        definition: 'Best-case spending: You control costs, visit fewer schools, or get better scholarships that reduce expenses.',
        example: 'You only visit 5 schools, negotiate well, and spend $84,778 total.'
      },
      {
        term: 'Base Case Scenario',
        definition: 'Most likely spending: Things go as planned, you follow your original budget and plans.',
        example: 'You visit 10 schools as planned and spend $105,272 total (most realistic).'
      },
      {
        term: 'Optimistic Scenario',
        definition: 'Higher spending: You visit more schools, extend your recruiting timeline, or face unexpected costs.',
        example: 'You visit 15 schools and face unexpected travel costs, spending $124,758 total.'
      },
      {
        term: 'Percentile',
        definition: 'A ranking from 0-100. The 25th percentile means 25% of scenarios are lower, 75% are higher.',
        example: 'Conservative = 25th percentile (best 25% of outcomes). Base = 50th percentile (middle/most likely). Optimistic = 75th percentile.'
      },
      {
        term: 'Variance',
        definition: 'How much your spending actually differs from your plan. This creates the three different scenarios.',
        example: 'You planned to spend $12,500/year, but actual spending might be ±$2,000 more or less. That variance creates the scenarios.'
      }
    ]
  },
  {
    title: 'Smart Recruiting Strategy',
    topics: [
      {
        term: 'School Fit Score',
        definition: 'A rating (0-100) showing how well a school matches your athletic and academic profile.',
        example: 'A school wants a 3.5 GPA and you have 3.6. It\'s a strong fit (high score). A school wants 4.0 and you have 3.6. It\'s a reach (lower score).'
      },
      {
        term: 'Cost of Attendance (COA)',
        definition: 'How much it actually costs to attend a school for one year (tuition, room, board, books, fees).',
        example: 'State school COA: $25,000/year. Private school COA: $60,000/year.'
      },
      {
        term: 'Athletic Scholarship %',
        definition: 'The percentage of costs that a school covers through athletic scholarship.',
        example: 'If a school\'s COA is $60,000 and they offer 50% athletic scholarship, they cover $30,000.'
      },
      {
        term: 'Net Cost',
        definition: 'What you\'ll actually pay after scholarships. COA minus scholarship amount.',
        example: 'School costs $60,000 (COA), offers $30,000 scholarship. Your net cost is $30,000.'
      }
    ]
  },
  {
    title: 'Making Smart Decisions',
    topics: [
      {
        term: 'ROI (Return on Investment)',
        definition: 'How much value you got compared to what you spent. Good ROI = got a lot for your money.',
        example: 'You spent $15,000 to get 3 quality offers. That\'s $5,000 per offer - good ROI if the schools match your goals.'
      },
      {
        term: 'Trade-offs',
        definition: 'When you have to choose between options because you can\'t do everything.',
        example: 'You can visit 10 schools for $20,000 OR 5 schools for $10,000. More visits = better information, but costs more.'
      },
      {
        term: 'Opportunity Cost',
        definition: 'What you give up when you choose one thing over another.',
        example: 'If you visit an extra school, you spend $2,000 AND lose the time you could have spent on other things.'
      }
    ]
  }
];

export default function PersonalFinanceGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>(sections[0].title);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero */}
        <div className="mb-2 animate-slideUp">
          <h1 className="text-5xl font-serif font-bold text-[#1A1916] mb-3">Personal Finance Guide</h1>
          <p className="text-lg text-[#5C5A54] max-w-3xl">
            Learn the financial concepts behind recruiting. This comprehensive guide explains every term you'll see in AthletiCap with real-world examples.
          </p>
        </div>

        {/* Important Note */}
        <Card className="border-l-4 border-l-[#F59E0B] bg-[#FFFAEB]">
          <h3 className="font-bold text-[#1A1916] mb-2">Why This Matters</h3>
          <p className="text-sm text-[#5C5A54]">
            College recruiting is expensive. Most students don't track their spending until it's too late. This guide helps you understand your recruiting finances so you can make smarter decisions, negotiate better, and avoid surprises.
          </p>
        </Card>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div key={section.title} className="animate-slideUp" style={{ animationDelay: `${idx * 50}ms` }}>
              <button
                onClick={() => setExpandedSection(expandedSection === section.title ? null : section.title)}
                className="w-full text-left p-4 bg-[#F4F3EF] border border-[#D8D5CC] rounded-sm hover:bg-[#E0E8FF] hover:border-[#1A56DB] transition-all duration-200"
              >
                <h2 className="text-lg font-bold text-[#1A1916] transition-colors">{section.title}</h2>
              </button>

              {expandedSection === section.title && (
                <div className="border border-t-0 border-[#D8D5CC] rounded-sm rounded-t-none bg-white p-6 space-y-6">
                  {section.topics.map((topic, idx) => (
                    <div key={idx} className="border-b border-[#E5E7EB] pb-6 last:border-0 last:pb-0">
                      <h3 className="text-lg font-bold text-[#1A56DB] mb-2">{topic.term}</h3>
                      <p className="text-sm text-[#5C5A54] mb-3">{topic.definition}</p>
                      <div className="bg-[#F4F3EF] p-3 rounded border-l-4 border-l-[#2DD09A]">
                        <p className="text-xs text-[#5C5A54]">
                          <span className="font-semibold">Example:</span> {topic.example}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Takeaways */}
        <Card className="bg-[#E0E8FF]">
          <h3 className="font-bold text-[#1A1916] mb-4">Key Takeaways</h3>
          <ul className="space-y-3 text-sm text-[#5C5A54]">
            <li className="flex gap-3">
              <span className="font-bold text-[#1A56DB]">1.</span>
              <span><strong>Track everything</strong> - Every expense matters. Use AthletiCap to log all recruiting costs.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#1A56DB]">2.</span>
              <span><strong>Know your scenarios</strong> - Conservative, base, and optimistic. Plan for base case, prepare for optimistic.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#1A56DB]">3.</span>
              <span><strong>Calculate ROI</strong> - How much are you spending per quality offer? Is it worth it?</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#1A56DB]">4.</span>
              <span><strong>Compare net costs</strong> - Don't just look at scholarship %. Look at what you'll actually pay.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#1A56DB]">5.</span>
              <span><strong>Revisit your budget</strong> - Each year, re-run your projections with real numbers. Stay on track.</span>
            </li>
          </ul>
        </Card>

        {/* Footer */}
        <div className="text-xs text-[#8A8783] border-t border-[#D8D5CC] pt-6 mt-8 animate-slideUp">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <p>
              Hover over financial terms throughout AthletiCap (they'll be highlighted with a dashed underline) to see quick definitions without leaving the page. This glossary system helps you learn while you work!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
