import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/layout/Layout';
import MetricCard from '../components/dashboard/MetricCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await api.dashboard.get();
        setData(dashboardData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="p-6 bg-red/20 border border-red rounded-lg text-red">
          Error loading dashboard: {error}
        </div>
      </Layout>
    );
  }

  const athlete = data.athlete;
  const budgetRemaining = (data.budgetGoal || 0) - data.totalSpend;
  const budgetPercent = data.budgetGoal ? data.totalSpend / data.budgetGoal : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-playfair text-gold mb-2">
            {athlete.firstName}'s Recruitment Dashboard
          </h1>
          <p className="text-text-secondary">
            {athlete.sport} • Class of {athlete.gradYear}
          </p>
        </div>

        {/* Status Summary */}
        <div className="bg-bg-secondary border border-border-color rounded-lg p-6">
          <h2 className="font-semibold mb-4">Season Summary</h2>
          <p className="text-text-secondary">
            Season to date: <span className="text-gold">{formatCurrency(data.totalSpend)}</span> spent
            {' '} • <span className="text-gold">{data.contactCount}</span> coach replies
            {' '} • <span className="text-gold">{data.recentOffers?.length || 0}</span> offers to compare
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Recruitment Spend"
            value={formatCurrency(data.totalSpend)}
            label={`of ${formatCurrency(data.budgetGoal || 5000)} goal`}
            accent="gold"
          />
          <MetricCard
            title="Coach Contacts"
            value={data.contactCount.toString()}
            label={data.topDivisionTier ? `Top: ${data.topDivisionTier}` : 'Add your first contact'}
            accent="teal"
          />
          {data.lowestNetCostOffer ? (
            <MetricCard
              title="Lowest Net Cost"
              value={formatCurrency(
                data.lowestNetCostOffer.annualCOA -
                data.lowestNetCostOffer.athleticScholarshipPct * data.lowestNetCostOffer.annualCOA
              )}
              label={data.lowestNetCostOffer.schoolName}
              accent="green"
            />
          ) : (
            <MetricCard
              title="Lowest Net Cost"
              value="—"
              label="Add your first offer"
              accent="green"
            />
          )}
          {data.brandReadiness ? (
            <MetricCard
              title="Brand Score"
              value={`${data.brandReadiness.score}/100`}
              label={data.brandReadiness.tier}
              accent="gold"
            />
          ) : (
            <MetricCard
              title="Brand Score"
              value="—"
              label="Connect social profiles"
              accent="gold"
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/tracker')}
            className="bg-bg-secondary border border-border-color rounded-lg p-6 hover:bg-bg-elevated transition-colors text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold">Recruitment Tracker</h3>
            <p className="text-sm text-text-secondary mt-2">Log expenses and track coach contacts</p>
          </button>

          <button
            onClick={() => navigate('/offers')}
            className="bg-bg-secondary border border-border-color rounded-lg p-6 hover:bg-bg-elevated transition-colors text-left"
          >
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold">Financial Matrix</h3>
            <p className="text-sm text-text-secondary mt-2">Compare offers and calculate net costs</p>
          </button>

          <button
            onClick={() => navigate('/influence')}
            className="bg-bg-secondary border border-border-color rounded-lg p-6 hover:bg-bg-elevated transition-colors text-left"
          >
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold">Brand Analytics</h3>
            <p className="text-sm text-text-secondary mt-2">Track social media growth and engagement</p>
          </button>
        </div>

        {/* Recent Offers */}
        {data.recentOffers && data.recentOffers.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Recent Offers</h2>
            <div className="space-y-4">
              {data.recentOffers.map((offer: any) => (
                <div key={offer.id} className="flex justify-between items-center pb-4 border-b border-border-color last:border-b-0">
                  <div>
                    <h3 className="font-semibold">{offer.schoolName}</h3>
                    <p className="text-sm text-text-secondary">
                      {offer.athleticScholarshipPct * 100}% athletic • {offer.division}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-playfair text-lg text-gold">
                      {formatCurrency(offer.annualCOA * (1 - offer.athleticScholarshipPct))}
                    </div>
                    {offer.isVerbal && <span className="text-xs text-yellow">VERBAL</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
