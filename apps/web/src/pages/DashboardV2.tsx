import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { useProfile } from '../contexts/ProfileContext';
import { api } from '../lib/api';
import clsx from 'clsx';

// Chart Placeholder Components
const SimpleLineChart = ({ data, height = 300 }: any) => (
  <svg width="100%" height={height} style={{ border: '1px solid #D8D5CC', borderRadius: '2px' }}>
    <text x="50%" y="50%" textAnchor="middle" fill="#5C5A54" fontSize="14">
      Budget trend visualization
    </text>
  </svg>
);

const SimpleBarChart = ({ data, height = 250 }: any) => (
  <svg width="100%" height={height} style={{ border: '1px solid #D8D5CC', borderRadius: '2px' }}>
    <text x="50%" y="50%" textAnchor="middle" fill="#5C5A54" fontSize="14">
      Category breakdown
    </text>
  </svg>
);

// KPI Card - Horizontal display for row layout
interface KPIItemProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
}

const KPIItem: React.FC<KPIItemProps> = ({ label, value, unit, subtext }) => (
  <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-4 flex-1">
    <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
      {label}
    </div>
    <div className="flex items-baseline gap-2 mb-2">
      <div className="text-3xl font-mono font-bold text-[#1A1916]">{value}</div>
      {unit && <span className="text-sm text-[#5C5A54]">{unit}</span>}
    </div>
    {subtext && <div className="text-xs text-[#5C5A54]">{subtext}</div>}
  </div>
);

// Budget Pace Meter Component
interface BudgetMeterProps {
  used: number;
  total: number;
  label: string;
}

const BudgetMeter: React.FC<BudgetMeterProps> = ({ used, total, label }) => {
  const percentage = (used / total) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-[#5C5A54]">{label}</span>
        <span className="text-sm font-mono font-semibold text-[#1A1916]">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full h-3 bg-[#F4F3EF] rounded-DEFAULT overflow-hidden border border-[#D8D5CC]">
        <div
          className="h-full bg-[#1A56DB] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-[#8A8783] mt-1">
        ${used.toLocaleString()} of ${total.toLocaleString()}
      </div>
    </div>
  );
};

// Pipeline Stage Card
interface StageCardProps {
  stage: string;
  count: number;
}

const StageCard: React.FC<StageCardProps> = ({ stage, count }) => (
  <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-4 text-center flex-1">
    <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
      {stage}
    </div>
    <div className="text-2xl font-mono font-bold text-[#1A56DB]">{count}</div>
  </div>
);

// Expense Category Card
interface ExpenseCategoryProps {
  category: string;
  amount: number;
}

const ExpenseCategory: React.FC<ExpenseCategoryProps> = ({ category, amount }) => (
  <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-4">
    <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
      {category}
    </div>
    <div className="text-xl font-mono font-bold text-[#1A1916]">
      ${amount.toLocaleString()}
    </div>
  </div>
);

// Best Offer Card
interface OfferProps {
  schoolName: string;
  scholarship: number;
  netCost: number;
}

const BestOfferCard: React.FC<OfferProps> = ({ schoolName, scholarship, netCost }) => (
  <div className="bg-[#FFFFFF] border-2 border-[#1A56DB] rounded-DEFAULT p-6">
    <div className="text-xs font-mono uppercase tracking-widest text-[#1A56DB] mb-3">
      BEST OFFER
    </div>
    <div className="mb-4">
      <div className="text-lg font-serif font-bold text-[#1A1916] mb-1">
        {schoolName}
      </div>
      <div className="text-sm text-[#5C5A54]">
        {scholarship}% athletic scholarship
      </div>
    </div>
    <div>
      <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
        NET COST (Year 1)
      </div>
      <div className="text-2xl font-mono font-bold text-[#2DD09A]">
        ${netCost.toLocaleString()}
      </div>
    </div>
  </div>
);

// Recent Activity Item
interface ActivityItemProps {
  type: 'expense' | 'contact';
  title: string;
  subtitle: string;
  date: string;
  value?: string;
}

const ActivityItemRow: React.FC<ActivityItemProps> = ({ type, title, subtitle, date, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#D8D5CC] last:border-b-0">
    <div className="flex items-start gap-3 flex-1">
      <span className="text-lg">{type === 'expense' ? '💰' : '👤'}</span>
      <div>
        <div className="text-sm font-semibold text-[#1A1916]">{title}</div>
        <div className="text-xs text-[#5C5A54]">{subtitle}</div>
      </div>
    </div>
    <div className="text-right">
      {value && <div className="text-sm font-semibold text-[#1A1916]">{value}</div>}
      <div className="text-xs text-[#8A8783]">{date}</div>
    </div>
  </div>
);

export default function DashboardV2() {
  const { currentProfile } = useProfile();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.dashboard.getSummary(),
    enabled: !!currentProfile,
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['dashboard', 'prediction'],
    queryFn: () => api.dashboard.getPrediction(),
    enabled: !!currentProfile,
  });

  const isLoading = dashboardLoading || predictionsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#1A56DB] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#5C5A54]">Loading Mission Control...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Section 1: Recruitment Financial Overview */}
        <section>
          <h2 className="section-header mb-6">
            <span className="section-number"># [1]</span> RECRUITMENT FINANCIAL OVERVIEW
          </h2>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPIItem
              label="Total CapEx"
              value={`$${(dashboardData?.totalSpend || 0).toLocaleString()}`}
              subtext={`${dashboardData?.budgetUsedPct || 0}% of budget`}
            />
            <KPIItem
              label="Blended CAC"
              value={`$${Math.round(dashboardData?.blendedCac || 0)}`}
              subtext="Cost per contact"
            />
            <KPIItem
              label="Quality CAC"
              value={`$${Math.round(dashboardData?.qualityWeightedCac || 0)}`}
              subtext="Division-weighted"
            />
            <KPIItem
              label="Offers Tracked"
              value={dashboardData?.offerCount || 0}
              subtext={`${dashboardData?.totalContacts || 0} active contacts`}
            />
          </div>
        </section>

        {/* Section 2: Budget Pace Meter */}
        <section className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6">
          <h3 className="section-header mb-4">
            <span className="section-number"># [2]</span> BUDGET PACE METER
          </h3>
          <BudgetMeter
            used={dashboardData?.totalSpend || 0}
            total={dashboardData?.budgetGoal || 50000}
            label="Annual budget utilization"
          />
        </section>

        {/* Section 3: Pipeline Stage Counts */}
        <section>
          <h3 className="section-header mb-6">
            <span className="section-number"># [3]</span> PIPELINE STAGE COUNTS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData?.contactsByStage?.map((stage: any) => (
              <StageCard key={stage.stage} stage={stage.stage} count={stage.count} />
            ))}
          </div>
        </section>

        {/* Section 4: Top Expense Categories */}
        <section>
          <h3 className="section-header mb-6">
            <span className="section-number"># [4]</span> TOP EXPENSE CATEGORIES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {dashboardData?.topExpenseCategories?.map((cat: any) => (
              <ExpenseCategory key={cat.category} category={cat.category} amount={cat.total} />
            ))}
          </div>
          <SimpleBarChart data={dashboardData?.topExpenseCategories || []} height={250} />
        </section>

        {/* Section 5: Best Available Offer */}
        {dashboardData?.bestOffer && (
          <section>
            <h3 className="section-header mb-6">
              <span className="section-number"># [5]</span> BEST AVAILABLE OFFER
            </h3>
            <BestOfferCard
              schoolName={dashboardData.bestOffer.schoolName}
              scholarship={dashboardData.bestOffer.athleticScholarshipPct}
              netCost={dashboardData.bestOffer.netCostYear1 || 0}
            />
          </section>
        )}

        {/* Section 6: Recent Expenses */}
        <section className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6">
          <h3 className="section-header mb-4">
            <span className="section-number"># [6]</span> RECENT EXPENSES
          </h3>
          <div className="divide-y divide-[#D8D5CC]">
            {dashboardData?.recentExpenses?.slice(0, 5).map((expense: any) => (
              <ActivityItemRow
                key={expense.id}
                type="expense"
                title={expense.category}
                subtitle={expense.description || 'Expense'}
                date={new Date(expense.date).toLocaleDateString()}
                value={`$${expense.amount}`}
              />
            ))}
          </div>
        </section>

        {/* Section 7: Recent Contacts */}
        <section className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6">
          <h3 className="section-header mb-4">
            <span className="section-number"># [7]</span> RECENT CONTACTS
          </h3>
          <div className="divide-y divide-[#D8D5CC]">
            {dashboardData?.recentContacts?.slice(0, 5).map((contact: any) => (
              <ActivityItemRow
                key={contact.id}
                type="contact"
                title={contact.school}
                subtitle={contact.coachName}
                date={contact.stage}
                value={contact.verbalOffer ? '✓ Verbal' : ''}
              />
            ))}
          </div>
        </section>

        {/* Insights Section (if needed) */}
        {predictions && (
          <section className="bg-[#F4F3EF] border border-[#D8D5CC] rounded-DEFAULT p-6">
            <h3 className="text-lg font-semibold text-[#1A1916] mb-4">
              Offer Probability by Division
            </h3>
            <div className="space-y-4">
              {predictions.predictions?.map((pred: any) => (
                <div key={pred.division}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#5C5A54]">{pred.division}</span>
                    <span className="text-sm font-mono font-semibold text-[#1A56DB]">{pred.probability}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#FFFFFF] rounded-DEFAULT overflow-hidden border border-[#D8D5CC]">
                    <div
                      className="h-full bg-[#1A56DB]"
                      style={{ width: `${pred.probability}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
