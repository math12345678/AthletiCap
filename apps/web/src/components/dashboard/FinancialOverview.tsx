import React from 'react';
import { Card, CardHeader, CardBody } from '../ui';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialOverviewProps {
  expenses?: Array<{ category: string; amount: number }>;
  monthlySpend?: Array<{ month: string; amount: number }>;
}

const chartColors = ['#F0A500', '#0FB8A8', '#22C55E', '#F59E0B', '#5BA5D9', '#EF4444'];

const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  expenses = [
    { category: 'Coaching', amount: 1200 },
    { category: 'Travel', amount: 800 },
    { category: 'Training', amount: 400 },
    { category: 'Events', amount: 600 },
  ],
  monthlySpend = [
    { month: 'Jan', amount: 2500 },
    { month: 'Feb', amount: 3000 },
    { month: 'Mar', amount: 2800 },
    { month: 'Apr', amount: 3200 },
    { month: 'May', amount: 2900 },
  ],
}) => {
  const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expense Breakdown */}
      <Card>
        <CardHeader
          title="Expense Breakdown"
          subtitle={`Total: $${totalSpend.toLocaleString()}`}
        />
        <CardBody>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expenses}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
              >
                {expenses.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader
          title="Spending Trend"
          subtitle="Last 5 months"
        />
        <CardBody>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlySpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#F0A500"
                dot={{ fill: '#F0A500', r: 5 }}
                activeDot={{ r: 7 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
};

export { FinancialOverview };
