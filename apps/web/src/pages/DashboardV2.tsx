import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '../components/layout/Layout';
import { useProfile } from '../contexts/ProfileContext';
import { useFamilyProfile } from '../contexts/FamilyProfileContext';
import { api } from '../lib/api';
import { CATEGORY_COLORS } from '../lib/chart-colors';
import FamilyProfile from '../components/FamilyProfile';
import { GlossaryTerm } from '../components/ui';

const SpendingTrendChart = ({ totalSpend = 0, budgetGoal = 50000, height = 300 }: any) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const monthsPassed = currentMonth + 1;

  const data = months.map((month, index) => {
    const monthNum = index + 1;
    if (monthNum <= monthsPassed) {
      const spending = Math.round((totalSpend / monthsPassed) * monthNum);
      const budgetAtMonth = (budgetGoal / 12) * monthNum;
      return { month, actual: spending, budgeted: budgetAtMonth };
    } else {
      const budgetAtMonth = (budgetGoal / 12) * monthNum;
      const projectedSpending = totalSpend + ((budgetGoal - totalSpend) / (12 - monthsPassed) * (monthNum - monthsPassed));
      return { month, actual: Math.round(projectedSpending), budgeted: budgetAtMonth };
    }
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" tick={{ fill: '#5C5A54', fontSize: 12 }} />
        <YAxis tick={{ fill: '#5C5A54', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D5CC', borderRadius: '4px' }} formatter={(value) => `$${(value as number).toLocaleString()}`} labelStyle={{ color: '#1A1916' }} />
        <Legend />
        <Line type="monotone" dataKey="actual" stroke="#1A56DB" name="Actual Spending" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="budgeted" stroke="#F59E0B" name="Budget Goal" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const CategoryBreakdownChart = ({ data = [], height = 250 }: any) => {
  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C5A54' }}>No expense data available</div>;
  }

  const chartData = data.map((cat: any, index: number) => ({
    name: cat.category,
    value: cat.total,
    fill: Object.values(CATEGORY_COLORS)[index % Object.keys(CATEGORY_COLORS).length],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#5C5A54', fontSize: 12 }} />
        <YAxis tick={{ fill: '#5C5A54', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D5CC', borderRadius: '4px' }} formatter={(value) => `$${(value as number).toLocaleString()}`} labelStyle={{ color: '#1A1916' }} />
        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Professional Metric Card with Bloomberg-like styling
interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  highlight?: boolean;
  glossaryTerm?: string;
}

const Metric: React.FC<MetricProps & { index?: number }> = ({ label, value, unit, subtext, highlight = false, index = 0, glossaryTerm }) => (
  <div
    className={`p-6 border rounded-sm animate-slideUp transition-all duration-200 ${
      highlight
        ? 'border-[#1A56DB] border-2 bg-white hover:shadow-lg hover:border-[#1A56DB]'
        : 'border-[#D8D5CC] bg-white hover:shadow-md hover:border-[#1A56DB] hover:bg-[#FAFAF8]'
    }`}
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-3">
      {glossaryTerm ? <GlossaryTerm term={glossaryTerm}>{label}</GlossaryTerm> : label}
    </div>
    <div className="flex items-baseline gap-2 mb-2">
      <div className={`text-3xl font-mono font-bold transition-colors ${highlight ? 'text-[#1A56DB]' : 'text-[#1A1916]'}`}>{value}</div>
      {unit && <span className="text-sm text-[#5C5A54]">{unit}</span>}
    </div>
    {subtext && <div className="text-xs text-[#5C5A54] transition-colors">{subtext}</div>}
  </div>
);

export default function DashboardV2() {
  const { currentProfile } = useProfile();
  const { familyProfile } = useFamilyProfile();
  const [showFamilyProfile, setShowFamilyProfile] = useState(false);

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<any>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.dashboard.getSummary(),
    enabled: !!currentProfile,
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery<any>({
    queryKey: ['dashboard', 'prediction'],
    queryFn: () => api.dashboard.getPrediction(),
    enabled: !!currentProfile,
  });

  const isLoading = dashboardLoading || predictionsLoading;

  const totalExpenses = useMemo(() => {
    return dashboardData?.totalSpend || 0;
  }, [dashboardData]);

  const budgetGoal = currentProfile?.budgetGoal || 50000;
  const budgetUsed = Math.min((totalExpenses / budgetGoal) * 100, 100);

  const topCategories = useMemo(() => {
    if (!dashboardData?.topExpenseCategories) return [];
    return dashboardData.topExpenseCategories.slice(0, 3);
  }, [dashboardData]);

  const contactsByStage = useMemo(() => {
    if (!dashboardData?.contactsByStage) {
      return {
        'Initial Contact': 0,
        'Reply Received': 0,
        'Phone Call': 0,
        'Official Visit': 0,
        'Offer Extended': 0,
      };
    }
    const stageCounts: Record<string, number> = {
      'Initial Contact': 0,
      'Reply Received': 0,
      'Phone Call': 0,
      'Official Visit': 0,
      'Offer Extended': 0,
    };
    dashboardData.contactsByStage.forEach((item: any) => {
      stageCounts[item.stage] = item.count || 0;
    });
    return stageCounts;
  }, [dashboardData]);

  const athleteName = currentProfile?.athleteName || 'Athlete';
  const gradYear = currentProfile?.gradYear || new Date().getFullYear();
  const monthsUntilGrad = Math.max(0, (new Date(gradYear, 5, 1).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#1A56DB] border-t-transparent mb-4" />
            <p className="text-[#5C5A54]">Loading mission control...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="mb-16 animate-slideUp">
          <h1 className="text-5xl font-serif font-bold text-[#1A1916] mb-3">Mission Control</h1>
          <p className="text-lg text-[#5C5A54] max-w-2xl">
            Financial clarity for the recruiting grind. Track every dollar, measure coach engagement, and compute scholarship arbitrage.
          </p>
        </div>

        {/* Section 1: RECRUITMENT FINANCIAL OVERVIEW */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-mono text-[#1A56DB]"># [1]</span>
            <h2 className="text-2xl font-mono font-bold text-[#1A1916]">RECRUITMENT FINANCIAL OVERVIEW</h2>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Metric
              index={0}
              label="Total CapEx"
              value={`$${(totalExpenses / 1000).toFixed(1)}K`}
              subtext={`of $${(budgetGoal / 1000).toFixed(0)}K budget`}
              glossaryTerm="Total CapEx"
            />
            <Metric
              index={1}
              label="Blended CAC"
              value={dashboardData?.blendedCac ? `$${Math.round(dashboardData.blendedCac)}` : '$--'}
              subtext="Cost per contact"
              glossaryTerm="Blended CAC"
            />
            <Metric
              index={2}
              label="Quality CAC"
              value={dashboardData?.qualityWeightedCac ? `$${Math.round(dashboardData.qualityWeightedCac)}` : '$--'}
              subtext="Weighted by division"
              glossaryTerm="Quality CAC"
            />
            <Metric
              index={3}
              label="Offers Tracked"
              value={dashboardData?.offerCount || 0}
              subtext="Active school offers"
              glossaryTerm="Offered"
            />
          </div>
        </div>

        {/* Section 2: BUDGET PACE */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-mono text-[#1A56DB]"># [2]</span>
            <h2 className="text-2xl font-mono font-bold text-[#1A1916]">BUDGET PACE METER</h2>
          </div>

          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-mono text-[#5C5A54]">YTD SPENDING vs BUDGET</span>
                  <span className="text-sm font-mono font-bold text-[#1A1916]">{Math.round(budgetUsed)}%</span>
                </div>
                <div className="w-full h-3 bg-[#F4F3EF] rounded-sm overflow-hidden border border-[#D8D5CC]">
                  <div className="h-full bg-[#1A56DB] transition-all duration-300" style={{ width: `${budgetUsed}%` }} />
                </div>
                <div className="text-xs text-[#8A8783] mt-2">
                  ${totalExpenses.toLocaleString()} of ${budgetGoal.toLocaleString()} • {Math.round(monthsUntilGrad)} months until graduation
                </div>
              </div>

              {/* Projected Spending */}
              <div className="bg-[#F4F3EF] border border-[#D8D5CC] rounded-sm p-4">
                <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">PROJECTION</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-[#1A1916]">
                    ${(totalExpenses * (12 / (new Date().getMonth() + 1)) * 1.1 / 1000).toFixed(1)}K
                  </span>
                  <span className="text-sm text-[#5C5A54]">annualized with 10% buffer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: SPENDING BY CATEGORY */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-mono text-[#1A56DB]"># [3]</span>
            <h2 className="text-2xl font-mono font-bold text-[#1A1916]">COST ALLOCATION BY CATEGORY</h2>
          </div>

          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <CategoryBreakdownChart data={dashboardData?.topExpenseCategories} height={300} />
          </div>
        </div>

        {/* Section 4: PIPELINE & CONTACTS */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-mono text-[#1A56DB]"># [4]</span>
            <h2 className="text-2xl font-mono font-bold text-[#1A1916]">RECRUITMENT PIPELINE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white border border-[#D8D5CC] rounded-sm p-4 text-center animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '0ms' }}>
              <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">Initial Contact</div>
              <div className="text-3xl font-mono font-bold text-[#1A56DB]">{contactsByStage['Initial Contact']}</div>
            </div>
            <div className="bg-white border border-[#D8D5CC] rounded-sm p-4 text-center animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '100ms' }}>
              <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">Replies</div>
              <div className="text-3xl font-mono font-bold text-[#8B5CF6]">{contactsByStage['Reply Received']}</div>
            </div>
            <div className="bg-white border border-[#D8D5CC] rounded-sm p-4 text-center animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '200ms' }}>
              <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">Phone Calls</div>
              <div className="text-3xl font-mono font-bold text-[#06B6D4]">{contactsByStage['Phone Call']}</div>
            </div>
            <div className="bg-white border border-[#D8D5CC] rounded-sm p-4 text-center animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '300ms' }}>
              <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">Official Visits</div>
              <div className="text-3xl font-mono font-bold text-[#10B981]">{contactsByStage['Official Visit']}</div>
            </div>
            <div className="bg-white border border-[#D8D5CC] rounded-sm p-4 text-center animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '400ms' }}>
              <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">Offers</div>
              <div className="text-3xl font-mono font-bold text-[#F59E0B]">{contactsByStage['Offer Extended']}</div>
            </div>
          </div>
        </div>

        {/* Section 5: TOP EXPENSE CATEGORIES */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-mono text-[#1A56DB]"># [5]</span>
            <h2 className="text-2xl font-mono font-bold text-[#1A1916]">MAJOR EXPENSE DRIVERS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCategories.map((cat: any, idx: number) => (
              <div
                key={idx}
                className="bg-white border border-[#D8D5CC] rounded-sm p-6 animate-slideUp hover:shadow-md transition-shadow duration-200"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-xs font-mono uppercase text-[#5C5A54] mb-3">{cat.category}</div>
                <div className="text-3xl font-mono font-bold text-[#1A1916] mb-2">
                  ${(cat.total / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-[#5C5A54]">
                  {Math.round((cat.total / totalExpenses) * 100)}% of total spend
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: BUDGET ANALYSIS */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-mono text-[#1A56DB]"># [6]</span>
            <h2 className="text-2xl font-mono font-bold text-[#1A1916]">FAMILY FINANCIAL CONTEXT</h2>
          </div>

          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">Expected Annual Contribution</div>
                <div className="text-2xl font-mono font-bold text-[#1A1916]">
                  ${familyProfile?.expectedFamilyContribution?.toLocaleString() || '0'}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">Acceptable Debt Limit</div>
                <div className="text-2xl font-mono font-bold text-[#1A1916]">
                  ${familyProfile?.acceptableDebtLevel?.toLocaleString() || '0'}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-[#5C5A54] mb-2">Preferred Regions</div>
                <div className="text-sm text-[#1A1916] font-semibold">
                  {familyProfile?.preferredLocations?.join(', ') || 'Not specified'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFamilyProfile(true)}
              className="mt-6 px-4 py-2 bg-[#1A56DB] text-white font-mono text-sm rounded-sm hover:opacity-90 transition-opacity"
            >
              Edit Family Profile
            </button>
          </div>
        </div>

        {/* Section 7: SPENDING TREND */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-mono text-[#1A56DB]"># [7]</span>
            <h2 className="text-2xl font-mono font-bold text-[#1A1916]">SPENDING TRAJECTORY</h2>
          </div>

          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <SpendingTrendChart totalSpend={totalExpenses} budgetGoal={budgetGoal} height={280} />
          </div>
        </div>

        {/* Family Profile Modal */}
        {showFamilyProfile && (
          <FamilyProfile
            isOpen={showFamilyProfile}
            onClose={() => setShowFamilyProfile(false)}
            initialData={familyProfile}
          />
        )}
      </div>
    </Layout>
  );
}
