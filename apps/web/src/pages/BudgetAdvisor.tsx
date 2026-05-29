import { useEffect, useState, useMemo } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/layout/Layout';
import { useToast, GlossaryTerm } from '../components/ui';
import clsx from 'clsx';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

interface CategoryData {
  category: string;
  amount: number;
}

interface SimulationResult {
  month: number;
  mean: number;
  percentile10: number;
  percentile90: number;
  min: number;
  max: number;
}

interface ComplexityMetrics {
  volatility: number;
  variationCoefficient: number;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  categoryDispersion: number;
  predictability: number;
}

// Monte Carlo Simulation
const runMonteCarloSimulation = (
  categories: CategoryData[],
  months: number = 6,
  iterations: number = 1000
): SimulationResult[] => {
  // Calculate mean and std dev for each category
  const categoryStats = categories.map((cat) => {
    const mean = cat.amount;
    const stdDev = mean * 0.15; // 15% standard deviation
    return { category: cat.category, mean, stdDev };
  });

  const simulations: number[][] = Array(iterations)
    .fill(null)
    .map(() => Array(months).fill(0));

  // Run simulations
  for (let iter = 0; iter < iterations; iter++) {
    for (let month = 0; month < months; month++) {
      let monthlyTotal = 0;
      for (const stat of categoryStats) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const value = stat.mean + z0 * stat.stdDev;
        monthlyTotal += Math.max(0, value); // No negative spending
      }
      simulations[iter][month] = monthlyTotal;
    }
  }

  // Calculate percentiles
  const results: SimulationResult[] = [];
  for (let month = 0; month < months; month++) {
    const monthValues = simulations.map((sim) => sim[month]).sort((a, b) => a - b);
    const mean = monthValues.reduce((a, b) => a + b, 0) / monthValues.length;

    results.push({
      month: month + 1,
      mean: Math.round(mean),
      percentile10: Math.round(monthValues[Math.floor(iterations * 0.1)]),
      percentile90: Math.round(monthValues[Math.floor(iterations * 0.9)]),
      min: Math.round(Math.min(...monthValues)),
      max: Math.round(Math.max(...monthValues)),
    });
  }

  return results;
};

// Calculate complexity metrics
const calculateComplexityMetrics = (categories: CategoryData[]): ComplexityMetrics => {
  const amounts = categories.map((c) => c.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const volatility = Math.sqrt(variance);
  const variationCoefficient = (volatility / mean) * 100;

  // Category dispersion (how evenly spread spending is)
  const maxAmount = Math.max(...amounts);
  const minAmount = Math.min(...amounts);
  const categoryDispersion = ((maxAmount - minAmount) / maxAmount) * 100;

  // Predictability (inverse of variation coefficient)
  const predictability = Math.max(0, 100 - variationCoefficient);

  // Trend analysis (simplified)
  let spendingTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (variationCoefficient < 20) {
    spendingTrend = 'stable';
  } else if (volatility > mean * 0.2) {
    spendingTrend = 'increasing';
  }

  return {
    volatility: Math.round(volatility * 100) / 100,
    variationCoefficient: Math.round(variationCoefficient * 100) / 100,
    spendingTrend,
    categoryDispersion: Math.round(categoryDispersion * 100) / 100,
    predictability: Math.round(predictability * 100) / 100,
  };
};

export default function BudgetAdvisor() {
  const [categories, setCategories] = useState<CategoryData[]>([
    { category: 'Travel', amount: 2500 },
    { category: 'Camps/Showcases', amount: 3500 },
    { category: 'Training', amount: 1200 },
    { category: 'Equipment', amount: 800 },
    { category: 'Other', amount: 500 },
  ]);
  const [simulationMonths, setSimulationMonths] = useState(6);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Load real data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.expenses.getByCategorySum();
        if (data && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => ({
            category: item.category,
            amount: item.total,
          }));
          setCategories(formatted);
        }
      } catch (err) {
        console.error('Error loading expenses:', err);
        // Use default data on error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Run simulations
  const simulationResults = useMemo(
    () => runMonteCarloSimulation(categories, simulationMonths),
    [categories, simulationMonths]
  );

  const metrics = useMemo(
    () => calculateComplexityMetrics(categories),
    [categories]
  );

  const totalSpending = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.amount, 0),
    [categories]
  );

  const averageMonthly = useMemo(
    () => simulationResults[0]?.mean || 0,
    [simulationResults]
  );

  const projectedTotal = useMemo(
    () => simulationResults.reduce((sum, month) => sum + month.mean, 0),
    [simulationResults]
  );

  const getMetricColor = (value: number, type: 'volatility' | 'predictability'): string => {
    if (type === 'volatility') {
      if (value < 300) return 'text-[#2DD09A]';
      if (value < 500) return 'text-[#F59E0B]';
      return 'text-[#C0392B]';
    } else {
      if (value > 80) return 'text-[#2DD09A]';
      if (value > 60) return 'text-[#F59E0B]';
      return 'text-[#C0392B]';
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'increasing':
        return '↑';
      case 'decreasing':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Section 1: Budget Overview */}
        <section>
          <h2 className="section-header mb-6 animate-slideUp">
            <span className="section-number"># [1]</span> BUDGET INTELLIGENCE ANALYSIS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp shadow-sm hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '0ms' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
                <GlossaryTerm term="Expense">TOTAL SPENDING</GlossaryTerm>
              </div>
              <div className="text-2xl font-mono font-bold text-[#1A1916]">
                {formatCurrency(totalSpending)}
              </div>
            </div>
            <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp shadow-sm hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '100ms' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
                MONTHLY AVG (Simulated)
              </div>
              <div className="text-2xl font-mono font-bold text-[#1A56DB]">
                {formatCurrency(averageMonthly)}
              </div>
            </div>
            <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp shadow-sm hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '200ms' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
                {simulationMonths}-MONTH PROJECTION
              </div>
              <div className="text-2xl font-mono font-bold text-[#1A1916]">
                {formatCurrency(projectedTotal)}
              </div>
            </div>
            <div className="bg-white border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp shadow-sm hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '300ms' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
                SPENDING TREND
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTrendIcon(metrics.spendingTrend)}</span>
                <span className="text-sm font-semibold text-[#1A1916] capitalize">
                  {metrics.spendingTrend}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Complexity Metrics */}
        <section className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6 animate-slideUp shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="section-header mb-6">
            <span className="section-number"># [2]</span> COMPLEXITY METRICS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F4F3EF] rounded-DEFAULT p-6 border border-[#D8D5CC] animate-slideUp" style={{ animationDelay: '100ms' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-3">
                Spending Volatility
              </div>
              <div className={`text-3xl font-mono font-bold mb-2 ${getMetricColor(metrics.volatility, 'volatility')}`}>
                ${Math.round(metrics.volatility)}
              </div>
              <div className="text-xs text-[#5C5A54]">
                Standard deviation of spending
              </div>
              <div className="mt-4 pt-4 border-t border-[#D8D5CC]">
                <div className="text-xs font-mono uppercase tracking-wider text-[#8A8783]">
                  Coefficient of Variation
                </div>
                <div className="text-lg font-mono font-bold text-[#1A1916] mt-1">
                  {metrics.variationCoefficient}%
                </div>
              </div>
            </div>

            <div className="bg-[#F4F3EF] rounded-DEFAULT p-6 border border-[#D8D5CC] animate-slideUp" style={{ animationDelay: '200ms' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-3">
                Predictability Score
              </div>
              <div className={`text-3xl font-mono font-bold mb-2 ${getMetricColor(metrics.predictability, 'predictability')}`}>
                {metrics.predictability}%
              </div>
              <div className="text-xs text-[#5C5A54]">
                How stable your spending is
              </div>
              <div className="mt-4 pt-4 border-t border-[#D8D5CC]">
                <div className="w-full h-2 bg-[#E0E8FF] rounded-DEFAULT overflow-hidden">
                  <div
                    className="h-full bg-[#1A56DB] transition-all"
                    style={{ width: `${metrics.predictability}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#F4F3EF] rounded-DEFAULT p-6 border border-[#D8D5CC] animate-slideUp" style={{ animationDelay: '300ms' }}>
              <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-3">
                Category Dispersion
              </div>
              <div className="text-3xl font-mono font-bold text-[#1A1916] mb-2">
                {metrics.categoryDispersion}%
              </div>
              <div className="text-xs text-[#5C5A54]">
                Spread between high/low categories
              </div>
              <div className="mt-4 pt-4 border-t border-[#D8D5CC]">
                <div className="text-xs text-[#5C5A54]">
                  {metrics.categoryDispersion > 70 ? '🔴 High variation' : metrics.categoryDispersion > 40 ? '🟡 Moderate variation' : '🟢 Balanced'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Monte Carlo Simulation */}
        <section className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6 animate-slideUp shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-header">
              <span className="section-number"># [3]</span> MONTE CARLO PROJECTION
            </h3>
            <div className="flex items-center gap-4">
              <label className="text-xs font-mono uppercase tracking-wider text-[#5C5A54]">
                Months to simulate:
              </label>
              <select
                value={simulationMonths}
                onChange={(e) => setSimulationMonths(parseInt(e.target.value))}
                className="px-3 py-2 border border-[#D8D5CC] rounded-DEFAULT bg-white text-sm font-mono"
              >
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
              </select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={simulationResults}>
              <defs>
                <linearGradient id="colorMean" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1A56DB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D5CC" />
              <XAxis dataKey="month" stroke="#5C5A54" />
              <YAxis stroke="#5C5A54" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D8D5CC',
                  borderRadius: '2px',
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="percentile10"
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth={2}
                name="10th Percentile"
              />
              <Area
                type="monotone"
                dataKey="mean"
                fill="url(#colorMean)"
                stroke="#1A56DB"
                strokeWidth={3}
                name="Expected (Mean)"
              />
              <Area
                type="monotone"
                dataKey="percentile90"
                fill="transparent"
                stroke="#C0392B"
                strokeWidth={2}
                name="90th Percentile"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F4F3EF] rounded-DEFAULT p-4 border border-[#D8D5CC]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#5C5A54] mb-2">
                Best Case (10%)
              </div>
              <div className="text-lg font-mono font-bold text-[#2DD09A]">
                {formatCurrency(simulationResults[0]?.percentile10 || 0)}
              </div>
            </div>
            <div className="bg-[#F4F3EF] rounded-DEFAULT p-4 border border-[#D8D5CC]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#5C5A54] mb-2">
                Most Likely
              </div>
              <div className="text-lg font-mono font-bold text-[#1A56DB]">
                {formatCurrency(simulationResults[0]?.mean || 0)}
              </div>
            </div>
            <div className="bg-[#F4F3EF] rounded-DEFAULT p-4 border border-[#D8D5CC]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#5C5A54] mb-2">
                Worst Case (90%)
              </div>
              <div className="text-lg font-mono font-bold text-[#C0392B]">
                {formatCurrency(simulationResults[0]?.percentile90 || 0)}
              </div>
            </div>
            <div className="bg-[#F4F3EF] rounded-DEFAULT p-4 border border-[#D8D5CC]">
              <div className="text-xs font-mono uppercase tracking-wider text-[#5C5A54] mb-2">
                Spread (Range)
              </div>
              <div className="text-lg font-mono font-bold text-[#F59E0B]">
                {formatCurrency((simulationResults[0]?.percentile90 || 0) - (simulationResults[0]?.percentile10 || 0))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Category Breakdown */}
        <section className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6">
          <h3 className="section-header mb-6">
            <span className="section-number"># [4]</span> SPENDING BY CATEGORY
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D5CC" />
              <XAxis dataKey="category" stroke="#5C5A54" />
              <YAxis stroke="#5C5A54" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D8D5CC',
                  borderRadius: '2px',
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Bar dataKey="amount" fill="#1A56DB" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.category} className="bg-[#F4F3EF] rounded-DEFAULT p-4 border border-[#D8D5CC]">
                <div className="text-xs font-mono uppercase tracking-wider text-[#5C5A54] mb-2">
                  {cat.category}
                </div>
                <div className="text-lg font-mono font-bold text-[#1A1916]">
                  {formatCurrency(cat.amount)}
                </div>
                <div className="text-xs text-[#8A8783] mt-2">
                  {((cat.amount / totalSpending) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Risk Analysis */}
        <section className="bg-[#F4F3EF] rounded-DEFAULT p-6 border border-[#D8D5CC]">
          <h3 className="section-header mb-4">
            <span className="section-number"># [5]</span> SPENDING RISK PROFILE
          </h3>

          <div className="space-y-4">
            {metrics.predictability > 80 ? (
              <div className="flex gap-4 p-4 bg-[#D4EDDA] border border-[#0E7C50] rounded-DEFAULT">
                <span className="text-lg">✓</span>
                <div>
                  <div className="font-semibold text-[#0E7C50]">Low Risk - Stable Spending</div>
                  <div className="text-sm text-[#0E7C50]">Your spending is predictable and consistent. Good for budgeting.</div>
                </div>
              </div>
            ) : metrics.predictability > 60 ? (
              <div className="flex gap-4 p-4 bg-[#FFF3CD] border border-[#B45309] rounded-DEFAULT">
                <span className="text-lg">⚠</span>
                <div>
                  <div className="font-semibold text-[#B45309]">Moderate Risk - Variable Spending</div>
                  <div className="text-sm text-[#B45309]">Some categories vary significantly. Monitor your spending patterns.</div>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 p-4 bg-[#FCE0E0] border border-[#C0392B] rounded-DEFAULT">
                <span className="text-lg">!</span>
                <div>
                  <div className="font-semibold text-[#C0392B]">High Risk - Volatile Spending</div>
                  <div className="text-sm text-[#C0392B]">Your spending varies significantly. Create a strict monthly budget.</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-DEFAULT p-4 border border-[#D8D5CC]">
              <div className="text-xs font-semibold text-[#5C5A54] mb-2">💡 Recommendation</div>
              <div className="text-sm text-[#1A1916]">
                {metrics.predictability > 80
                  ? 'Maintain your current spending discipline. Consider allocating any savings to financial goals.'
                  : metrics.predictability > 60
                  ? 'Track high-variance categories more closely. Set category limits to reduce surprises.'
                  : 'Implement stricter spending controls. Focus on stabilizing high-variance categories first.'}
              </div>
            </div>
            <div className="bg-white rounded-DEFAULT p-4 border border-[#D8D5CC]">
              <div className="text-xs font-semibold text-[#5C5A54] mb-2">📊 Analysis</div>
              <div className="text-sm text-[#1A1916]">
                {metrics.categoryDispersion > 70
                  ? 'Your spending is unbalanced across categories. Evaluate if high categories are necessary.'
                  : metrics.categoryDispersion > 40
                  ? 'Spending is moderately distributed. Some reallocation could improve efficiency.'
                  : 'Your spending is well-balanced across categories.'}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
