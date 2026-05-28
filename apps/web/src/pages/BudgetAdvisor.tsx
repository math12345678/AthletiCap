import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/layout/Layout';
import { useToast } from '../components/ui';
import clsx from 'clsx';

interface CategoryAdvice {
  category: string;
  spent: number;
  benchmarkLow: number;
  benchmarkHigh: number;
  benchmarkAvg: number;
  status: string;
  suggestion: string;
  diminishingReturnsNote?: string;
}

interface BudgetAdvisorData {
  overallGrade: string;
  totalSpent: number;
  budgetGoal: number;
  budgetUsedPct: number;
  categoryAdvice: CategoryAdvice[];
  reallocations: Array<{
    from: string;
    to: string;
    amount: number;
    reasoning: string;
  }>;
  spending: Array<{
    category: string;
    amount: number;
  }>;
}

export default function BudgetAdvisor() {
  const [budgetData, setBudgetData] = useState<BudgetAdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReallocation, setSelectedReallocation] = useState<number | null>(
    null
  );
  const { addToast } = useToast();

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const data = await api.expenses.getAdvisor();
      setBudgetData(data);
    } catch (err) {
      console.error('Error loading budget advice:', err);
      addToast('Failed to load budget advisor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A':
        return 'bg-[#D4EDDA] text-[#0E7C50] border-[#0E7C50]';
      case 'B':
        return 'bg-[#E0E8FF] text-[#1A56DB] border-[#1A56DB]';
      case 'C':
        return 'bg-[#FFF3CD] text-[#B45309] border-[#B45309]';
      case 'D':
        return 'bg-[#FCE0E0] text-[#C0392B] border-[#C0392B]';
      default:
        return 'bg-[#F4F3EF] text-[#5C5A54]';
    }
  };

  const getGradeDescription = (grade: string): string => {
    switch (grade) {
      case 'A':
        return "Excellent spending discipline. You're within budget and spending efficiently.";
      case 'B':
        return 'Good spending habits. Minor adjustments could improve your allocation.';
      case 'C':
        return "Caution needed. You're approaching your budget limit in some categories.";
      case 'D':
        return 'Spending alert. You need immediate adjustments to stay within budget.';
      default:
        return 'Track your spending to improve your grade.';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'under':
        return 'bg-[#D4EDDA] text-[#0E7C50]';
      case 'on_track':
        return 'bg-[#E0E8FF] text-[#1A56DB]';
      case 'over':
        return 'bg-[#FFF3CD] text-[#B45309]';
      case 'way_over':
        return 'bg-[#FCE0E0] text-[#C0392B]';
      default:
        return 'bg-[#F4F3EF] text-[#5C5A54]';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'under':
        return '✓ Under Budget';
      case 'on_track':
        return '→ On Track';
      case 'over':
        return '! Over Budget';
      case 'way_over':
        return '‼ Way Over';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#1A56DB] border-t-transparent mb-4" />
            <p className="text-[#5C5A54]">Analyzing your spending...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!budgetData) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-lg text-[#5C5A54]">
            No spending data available yet. Log some expenses to get personalized
            budget advice.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-5xl font-serif font-bold text-[#1A1916] mb-2">
            Budget Advisor
          </h1>
          <p className="text-[#5C5A54]">
            Smart spending analysis and reallocation recommendations
          </p>
        </div>

        {/* Overall Grade Card */}
        <div className={`border-4 rounded-sm p-8 ${getGradeColor(budgetData.overallGrade)}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-sm font-semibold uppercase opacity-75 mb-2">
                Spending Grade
              </div>
              <div className="text-7xl font-serif font-bold mb-4">
                {budgetData.overallGrade}
              </div>
              <p className="text-sm max-w-sm">
                {getGradeDescription(budgetData.overallGrade)}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white bg-opacity-30 rounded-sm p-4">
                <div className="text-xs font-semibold uppercase opacity-75 mb-1">
                  Total Spent
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(budgetData.totalSpent)}
                </div>
              </div>
              <div className="bg-white bg-opacity-30 rounded-sm p-4">
                <div className="text-xs font-semibold uppercase opacity-75 mb-1">
                  Budget Goal
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(budgetData.budgetGoal)}
                </div>
              </div>
              <div className="bg-white bg-opacity-30 rounded-sm p-4">
                <div className="text-xs font-semibold uppercase opacity-75 mb-1">
                  Used
                </div>
                <div className="text-2xl font-bold">
                  {budgetData.budgetUsedPct.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#5C5A54]">
                Budget Utilization
              </h3>
              <span className="text-sm font-semibold text-[#1A1916]">
                {budgetData.budgetUsedPct.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-4 bg-[#F4F3EF] rounded-full overflow-hidden">
              <div
                className={clsx('h-full transition-all duration-300', {
                  'bg-[#2DD09A]': budgetData.budgetUsedPct <= 75,
                  'bg-[#F59E0B]': budgetData.budgetUsedPct > 75 && budgetData.budgetUsedPct <= 100,
                  'bg-[#C0392B]': budgetData.budgetUsedPct > 100,
                })}
                style={{ width: `${Math.min(budgetData.budgetUsedPct, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 mt-3 text-xs text-[#5C5A54]">
              <span>Remaining: {formatCurrency(Math.max(0, budgetData.budgetGoal - budgetData.totalSpent))}</span>
              <span className="text-right">
                {budgetData.budgetUsedPct > 100
                  ? `Over by ${formatCurrency(budgetData.totalSpent - budgetData.budgetGoal)}`
                  : `Room to spend: ${formatCurrency(budgetData.budgetGoal - budgetData.totalSpent)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-[#1A1916]">
            Category Analysis
          </h2>
          <div className="bg-white border border-[#D8D5CC] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D8D5CC] bg-[#F4F3EF]">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#5C5A54]">
                      Category
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-[#5C5A54]">
                      Spent
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-[#5C5A54]">
                      Benchmark
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-[#5C5A54]">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#5C5A54]">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.categoryAdvice.map((category, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#D8D5CC] hover:bg-[#F4F3EF] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#1A1916]">
                          {category.category}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-semibold text-[#1A1916]">
                          {formatCurrency(category.spent)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="text-sm text-[#5C5A54]">
                          {formatCurrency(category.benchmarkLow)} -{' '}
                          {formatCurrency(category.benchmarkHigh)}
                        </div>
                        <div className="text-xs text-[#8A8783]">
                          (avg: {formatCurrency(category.benchmarkAvg)})
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-sm text-xs font-semibold ${getStatusColor(category.status)}`}
                          >
                            {getStatusLabel(category.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-[#1A1916]">
                          {category.suggestion}
                        </div>
                        {category.diminishingReturnsNote && (
                          <div className="text-xs text-[#F59E0B] mt-1 font-medium">
                            ⚠ {category.diminishingReturnsNote}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Spending by Category Pie Chart Alternative */}
        {budgetData.spending.length > 0 && (
          <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
            <h3 className="text-lg font-semibold text-[#1A1916] mb-4">
              Spending Distribution
            </h3>
            <div className="space-y-3">
              {budgetData.spending.map((item, idx) => {
                const percentage = (
                  (item.amount / budgetData.totalSpent) *
                  100
                ).toFixed(1);
                return (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-[#1A1916]">
                        {item.category}
                      </span>
                      <span className="text-sm font-semibold text-[#5C5A54]">
                        {formatCurrency(item.amount)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F4F3EF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A56DB]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reallocation Suggestions */}
        {budgetData.reallocations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#1A1916]">
              Smart Reallocation Ideas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetData.reallocations.map((realloc, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    'bg-white border-2 rounded-sm p-6 cursor-pointer transition-all',
                    selectedReallocation === idx
                      ? 'border-[#1A56DB] bg-[#E0E8FF] bg-opacity-30'
                      : 'border-[#D8D5CC] hover:border-[#1A56DB]'
                  )}
                  onClick={() =>
                    setSelectedReallocation(
                      selectedReallocation === idx ? null : idx
                    )
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1A1916] mb-1">
                        Move {formatCurrency(realloc.amount)}
                      </h4>
                      <p className="text-sm text-[#5C5A54]">
                        From <span className="font-semibold">{realloc.from}</span> to{' '}
                        <span className="font-semibold">{realloc.to}</span>
                      </p>
                    </div>
                    <span className="text-2xl">→</span>
                  </div>
                  {selectedReallocation === idx && (
                    <div className="mt-4 pt-4 border-t border-[#D8D5CC]">
                      <p className="text-sm text-[#1A1916]">
                        {realloc.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="bg-[#E0E8FF] border border-[#1A56DB] rounded-sm p-6">
          <h3 className="text-lg font-semibold text-[#1A56DB] mb-4">
            💡 Key Insights
          </h3>
          <ul className="space-y-3 text-[#1A1916]">
            <li className="flex gap-3">
              <span className="text-[#1A56DB] font-bold">1.</span>
              <span>
                You're spending {budgetData.budgetUsedPct > 100 ? 'above' : 'at'}{' '}
                <span className="font-semibold">
                  {budgetData.budgetUsedPct.toFixed(0)}%
                </span>{' '}
                of your budget goal.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#1A56DB] font-bold">2.</span>
              <span>
                Your largest expense category is{' '}
                <span className="font-semibold">
                  {budgetData.spending.reduce(
                    (max, curr) =>
                      curr.amount > max.amount ? curr : max,
                    budgetData.spending[0]
                  )?.category || 'Travel'}
                </span>
                . Consider optimization opportunities here.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#1A56DB] font-bold">3.</span>
              <span>
                Reallocating from over-budget categories can help you hit your
                financial goals without increasing total spending.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={loadBudgetData}
            className="px-6 py-3 border border-[#D8D5CC] text-[#1A1916] font-medium rounded-sm hover:bg-[#F4F3EF] transition-colors"
          >
            Refresh Analysis
          </button>
          <button className="px-6 py-3 bg-[#1A56DB] text-white font-medium rounded-sm hover:opacity-90 transition-opacity">
            Download Report
          </button>
        </div>
      </div>
    </Layout>
  );
}
