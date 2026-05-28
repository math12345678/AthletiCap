import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardBody } from '../components/ui';
import { MetricCard } from '../components/dashboard/MetricCard';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = {
  monthlySpend: [
    { month: 'Jan', spend: 1200, contacts: 4 },
    { month: 'Feb', spend: 1800, contacts: 6 },
    { month: 'Mar', spend: 1500, contacts: 5 },
    { month: 'Apr', spend: 2100, contacts: 7 },
    { month: 'May', spend: 1900, contacts: 6 },
    { month: 'Jun', spend: 2400, contacts: 8 },
  ],
  contactsByDivision: [
    { division: 'D1 Power 4', count: 3 },
    { division: 'D1 Mid-Major', count: 5 },
    { division: 'D2', count: 4 },
    { division: 'D3', count: 2 },
  ],
  spendByCategory: [
    { name: 'Coaching', value: 3500 },
    { name: 'Travel', value: 2800 },
    { name: 'Events', value: 1200 },
    { name: 'Equipment', value: 600 },
    { name: 'Other', value: 400 },
  ],
};

const chartColors = ['#F0A500', '#0FB8A8', '#22C55E', '#F59E0B', '#5BA5D9'];

export default function Analytics() {
  const totalSpend = mockData.spendByCategory.reduce((sum, item) => sum + item.value, 0);
  const avgMonthlySpend = (mockData.monthlySpend.reduce((sum, item) => sum + item.spend, 0) / mockData.monthlySpend.length).toFixed(0);
  const totalContacts = mockData.contactsByDivision.reduce((sum, item) => sum + item.count, 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-playfair font-bold text-text-primary mb-2">
            Analytics & Insights
          </h1>
          <p className="text-text-secondary">
            Detailed analysis of your recruitment journey
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Spending"
            value={`$${totalSpend.toLocaleString()}`}
            icon="💰"
            color="gold"
            details={`${mockData.monthlySpend.length} months tracked`}
          />
          <MetricCard
            title="Avg Monthly Spend"
            value={`$${avgMonthlySpend}`}
            icon="📊"
            color="teal"
            details="Over 6 months"
          />
          <MetricCard
            title="Total Contacts"
            value={totalContacts}
            icon="📞"
            color="success"
            details={`${totalContacts} coaches contacted`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spending Trend */}
          <Card>
            <CardHeader title="Spending Trend" subtitle="Last 6 months" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.monthlySpend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #2A3040' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#F0A500"
                    strokeWidth={2}
                    dot={{ fill: '#F0A500' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Spending by Category */}
          <Card>
            <CardHeader title="Spending by Category" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockData.spendByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {mockData.spendByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Monthly Contacts */}
          <Card>
            <CardHeader title="Monthly Contacts Made" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.monthlySpend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #2A3040' }} />
                  <Bar dataKey="contacts" fill="#0FB8A8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Contacts by Division */}
          <Card>
            <CardHeader title="Contacts by Division" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.contactsByDivision}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="division" angle={-45} textAnchor="end" height={100} stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1F2E', border: '1px solid #2A3040' }} />
                  <Bar dataKey="count" fill="#22C55E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader title="Key Insights" />
          <CardBody className="space-y-3">
            <div className="p-3 rounded-lg bg-success-500/10 border border-success-500/30">
              <p className="text-sm text-success-400 font-semibold">✓ Positive Trend</p>
              <p className="text-sm text-text-secondary mt-1">Your spending increased by 15% from May to June, with 2 additional coach contacts made.</p>
            </div>
            <div className="p-3 rounded-lg bg-info-500/10 border border-info-500/30">
              <p className="text-sm text-info-400 font-semibold">📊 Top Division</p>
              <p className="text-sm text-text-secondary mt-1">You have the most contacts with D1 Mid-Major programs (5 contacts), which offer good value for recruitment spend.</p>
            </div>
            <div className="p-3 rounded-lg bg-warning-500/10 border border-warning-500/30">
              <p className="text-sm text-warning-400 font-semibold">💡 Recommendation</p>
              <p className="text-sm text-text-secondary mt-1">Focus on coaching expenses - they represent 40% of your total spend. Consider exploring group training sessions for better value.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}
