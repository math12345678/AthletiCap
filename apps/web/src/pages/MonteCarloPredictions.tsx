import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/layout/Layout';
import { useProfile } from '../contexts/ProfileContext';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Card, GlossaryTerm } from '../components/ui';

interface MonteCarloResult {
  year: number;
  conservative: number;
  base: number;
  optimistic: number;
}

function runMonteCarloSimulation(
  initialExpenses: number,
  budgetGoal: number,
  years: number = 4,
  simulations: number = 1000
): MonteCarloResult[] {
  const results: number[][] = Array(years).fill(null).map(() => []);

  for (let sim = 0; sim < simulations; sim++) {
    let currentExpense = initialExpenses;
    const monthlyBudget = budgetGoal / 12;

    for (let year = 1; year <= years; year++) {
      const variance = (Math.random() * 0.6 - 0.2) * monthlyBudget * 12;
      currentExpense += variance;
      results[year - 1].push(Math.max(0, currentExpense));
    }
  }

  return results.map((yearResults, idx) => {
    yearResults.sort((a, b) => a - b);
    return {
      year: idx + 1,
      conservative: yearResults[Math.floor(yearResults.length * 0.25)],
      base: yearResults[Math.floor(yearResults.length * 0.5)],
      optimistic: yearResults[Math.floor(yearResults.length * 0.75)],
    };
  });
}

export default function MonteCarloPredictions() {
  const { currentProfile } = useProfile();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.dashboard.getSummary(),
    enabled: !!currentProfile,
  });

  const totalExpenses = dashboardData?.totalSpend || 0;
  const budgetGoal = currentProfile?.budgetGoal || 50000;

  const monteCarloResults = useMemo(() => {
    return runMonteCarloSimulation(totalExpenses, budgetGoal, 4, 1000);
  }, [totalExpenses, budgetGoal]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#1A56DB] border-t-transparent mb-4" />
            <p className="text-[#5C5A54]">Simulating your financial future...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="mb-2 animate-slideUp">
          <h1 className="text-5xl font-serif font-bold text-[#1A1916] mb-3">Financial Projections</h1>
          <p className="text-lg text-[#5C5A54] mb-4 max-w-3xl">
            See what your recruiting costs might look like over the next 4 years based on 1,000+ different scenarios.
          </p>
          <p className="text-sm text-[#8A8783] italic">
            💡 <strong>What is this?</strong> This page shows three possible futures: conservative (you spend less), base case (most likely), and optimistic (you spend more). The chart shows actual lines for each scenario so you can visually compare them.
          </p>
        </div>

        {/* Scenario Cards Explanation */}
        <Card className="bg-[#E0E8FF] border-[#1A56DB] animate-slideUp">
          <div className="space-y-3">
            <h3 className="font-bold text-[#1A1916] text-lg">Three Financial Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="font-semibold text-[#2DD09A] mb-2"><GlossaryTerm term="Conservative">Conservative (-30%)</GlossaryTerm></div>
                <p className="text-sm text-[#5C5A54]">Best case: You control spending, negotiate better scholarships, or need fewer school visits.</p>
              </div>
              <div>
                <div className="font-semibold text-[#1A56DB] mb-2"><GlossaryTerm term="Base Case">Base Case (100%)</GlossaryTerm></div>
                <p className="text-sm text-[#5C5A54]">Most likely: Things go as planned. You spend what you expect on coaches, visits, and applications.</p>
              </div>
              <div>
                <div className="font-semibold text-[#C0392B] mb-2"><GlossaryTerm term="Optimistic">Optimistic (+30%)</GlossaryTerm></div>
                <p className="text-sm text-[#5C5A54]">You visit more schools, extend recruitment timeline, or unexpected costs come up.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Chart */}
        <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
          <h2 className="text-xl font-bold text-[#1A1916] mb-4">Your 4-Year Spending Trajectory</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monteCarloResults} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" tick={{ fill: '#5C5A54', fontSize: 12 }} />
              <YAxis tick={{ fill: '#5C5A54', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D5CC' }}
                formatter={(value: any) => `$${(value as number).toLocaleString()}`}
              />
              <Line type="monotone" dataKey="conservative" stroke="#2DD09A" strokeWidth={3} name="Conservative" dot={false} />
              <Line type="monotone" dataKey="base" stroke="#1A56DB" strokeWidth={3} name="Base Case" dot={false} />
              <Line type="monotone" dataKey="optimistic" stroke="#C0392B" strokeWidth={3} name="Optimistic" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-[#8A8783] mt-4 italic">Three different colored lines = three different spending futures. See how they separate as you go further into your recruiting?</p>
        </div>

        {/* Year-by-Year Breakdown with Explanations */}
        <div className="animate-slideUp">
          <h2 className="text-2xl font-bold text-[#1A1916] mb-6">Year-by-Year Breakdown</h2>
          <div className="space-y-4">
            {monteCarloResults.map((year, idx) => (
              <Card key={year.year} className="animate-slideUp" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="mb-4 pb-4 border-b border-[#D8D5CC]">
                  <h3 className="text-lg font-bold text-[#1A1916] mb-1">Year {year.year}</h3>
                  <p className="text-xs text-[#8A8783]">
                    {year.year === 1 && "Initial recruitment phase - profile building, first campus visits"}
                    {year.year === 2 && "Active recruitment - contacting coaches, official visits"}
                    {year.year === 3 && "Serious offers - commitment phase begins"}
                    {year.year === 4 && "Final year - committing and preparing for college"}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#E8F8F5] p-3 rounded">
                    <div className="text-xs font-mono uppercase text-[#2DD09A] mb-2 font-bold">Conservative</div>
                    <div className="text-2xl font-mono font-bold text-[#1A1916]">{formatCurrency(year.conservative)}</div>
                    <p className="text-xs text-[#5C5A54] mt-2">You manage costs well</p>
                  </div>
                  <div className="bg-[#E0E8FF] p-3 rounded">
                    <div className="text-xs font-mono uppercase text-[#1A56DB] mb-2 font-bold">Base Case</div>
                    <div className="text-2xl font-mono font-bold text-[#1A1916]">{formatCurrency(year.base)}</div>
                    <p className="text-xs text-[#5C5A54] mt-2">Most realistic scenario</p>
                  </div>
                  <div className="bg-[#FFE8E8] p-3 rounded">
                    <div className="text-xs font-mono uppercase text-[#C0392B] mb-2 font-bold">Optimistic</div>
                    <div className="text-2xl font-mono font-bold text-[#1A1916]">{formatCurrency(year.optimistic)}</div>
                    <p className="text-xs text-[#5C5A54] mt-2">You explore more schools</p>
                  </div>
                </div>
                {year.year === 4 && (
                  <div className="mt-4 pt-4 border-t border-[#D8D5CC]">
                    <div className="font-semibold text-[#1A1916] mb-2">4-Year Total Spending</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-[#5C5A54]">Conservative Total</div>
                        <div className="text-xl font-bold text-[#2DD09A]">
                          {formatCurrency(monteCarloResults.reduce((sum, r) => sum + r.conservative, 0))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#5C5A54]">Base Case Total</div>
                        <div className="text-xl font-bold text-[#1A56DB]">
                          {formatCurrency(monteCarloResults.reduce((sum, r) => sum + r.base, 0))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#5C5A54]">Optimistic Total</div>
                        <div className="text-xl font-bold text-[#C0392B]">
                          {formatCurrency(monteCarloResults.reduce((sum, r) => sum + r.optimistic, 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Key Terms Explained */}
        <Card className="bg-[#F4F3EF]">
          <h3 className="font-bold text-[#1A1916] mb-4">Financial Terms Explained</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-[#1A1916]"><GlossaryTerm term="Monte Carlo">Monte Carlo Simulation:</GlossaryTerm></span>
              <span className="text-[#5C5A54] ml-2">A tool that runs 1,000+ different scenarios to show you the range of what could happen financially. It's like asking "what if?" a thousand times and showing you all the answers.</span>
            </div>
            <div>
              <span className="font-semibold text-[#1A1916]"><GlossaryTerm term="Percentile">Percentile:</GlossaryTerm></span>
              <span className="text-[#5C5A54] ml-2">Conservative = 25th percentile (only 25% of scenarios are lower). Base = 50th percentile (the middle/most likely). Optimistic = 75th percentile (only 25% of scenarios are higher).</span>
            </div>
            <div>
              <span className="font-semibold text-[#1A1916]"><GlossaryTerm term="Budget">Budget Goal:</GlossaryTerm></span>
              <span className="text-[#5C5A54] ml-2">How much you're planning to spend on recruiting. Used as the baseline for calculating the three scenarios.</span>
            </div>
            <div>
              <span className="font-semibold text-[#1A1916]"><GlossaryTerm term="Variance">Variance:</GlossaryTerm></span>
              <span className="text-[#5C5A54] ml-2">The amount your actual spending might differ from your plan. This is where the difference between scenarios comes from.</span>
            </div>
          </div>
        </Card>

        {/* Action Items */}
        <Card className="border-l-4 border-l-[#1A56DB] bg-[#E0E8FF]">
          <h3 className="font-bold text-[#1A1916] mb-3">What to do with this information:</h3>
          <ul className="space-y-2 text-sm text-[#5C5A54]">
            <li>✓ <strong>Plan for the Base Case:</strong> Budget for the middle line, not the best or worst case</li>
            <li>✓ <strong>Save for the Optimistic scenario:</strong> If you have extra money, prepare for higher costs</li>
            <li>✓ <strong>Track your actual spending:</strong> Compare what really happens to these projections</li>
            <li>✓ <strong>Adjust as you go:</strong> Each year, re-run these projections with real numbers to stay on track</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}
