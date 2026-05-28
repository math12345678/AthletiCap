import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { useProfile } from '../contexts/ProfileContext';
import Layout from '../components/layout/Layout';
import { MetricCard } from '../components/dashboard/MetricCard';
import { Card, CardHeader, CardBody, Badge, Button, Loader } from '../components/ui';
import clsx from 'clsx';

interface DashboardData {
  athlete: {
    firstName: string;
    sport: string;
    gradYear: number;
  };
  totalSpend: number;
  budgetGoal: number;
  contactCount: number;
  recentOffers?: any[];
  topDivisionTier?: string;
  lowestNetCostOffer?: any;
  brandReadiness?: {
    score: number;
    tier: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentProfile } = useProfile();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await api.dashboard.getSummary();
        setData(dashboardData);
      } catch (err) {
        const errorMsg = (err as Error).message;
        // If athlete not found, use mock data based on current profile
        if (errorMsg.includes('Athlete not found') || errorMsg.includes('404')) {
          if (currentProfile) {
            setData({
              athlete: {
                firstName: currentProfile.athleteName || 'Student',
                sport: currentProfile.sport,
                gradYear: currentProfile.gradYear,
              },
              totalSpend: 0,
              budgetGoal: currentProfile.budgetGoal || 10000,
              contactCount: 0,
              recentOffers: [],
              topDivisionTier: undefined,
              lowestNetCostOffer: undefined,
              brandReadiness: { score: 0, tier: 'Emerging' },
            });
          } else {
            setError(errorMsg);
          }
        } else {
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentProfile]);

  if (loading) {
    return (
      <Layout>
        <Loader fullscreen label="Loading your dashboard..." />
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <Card className="bg-error-500/10 border-error-500/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-error-600">Error Loading Dashboard</h3>
              <p className="text-sm text-error-600/80 mt-1">{error || 'Unknown error'}</p>
              <Button
                size="sm"
                variant="error"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </Layout>
    );
  }

  const athlete = data.athlete;
  const budgetRemaining = (data.budgetGoal || 0) - data.totalSpend;
  const budgetPercent = data.budgetGoal ? (data.totalSpend / data.budgetGoal) * 100 : 0;
  const spendTrend = 12; // Example: 12% increase from last month

  const athleteName = currentProfile?.athleteName || athlete.firstName || 'Student';
  const sport = currentProfile?.sport || athlete.sport || '';
  const gradYear = currentProfile?.gradYear || athlete.gradYear || new Date().getFullYear();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Hero Section */}
        <div className="bg-gradient-to-r from-gold-500/10 to-teal-500/10 border border-gold-500/20 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold-500/5 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-playfair font-bold text-text-primary mb-2">
                  Welcome back, {athleteName}
                </h1>
                <p className="text-lg text-text-secondary">
                  {sport} • Class of {gradYear}
                </p>
              </div>
              <div className="text-5xl">🎯</div>
            </div>
            <p className="text-text-secondary max-w-2xl">
              You're on track with your recruitment goals. Keep monitoring your spending and growing your brand to attract more offers.
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Quick Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Recruitment Spend"
              value={formatCurrency(data.totalSpend)}
              unit={`/ ${formatCurrency(data.budgetGoal)}`}
              trend={{ value: spendTrend, isPositive: false, label: 'vs last month' }}
              icon="💰"
              color="gold"
              details={budgetRemaining > 0 ? `${budgetRemaining > 0 ? '$' : ''} ${budgetRemaining.toLocaleString()} remaining` : 'Budget exceeded'}
              animated
            />
            <MetricCard
              title="Coach Contacts"
              value={data.contactCount}
              icon="📞"
              color="teal"
              details={data.topDivisionTier ? `Top division: ${data.topDivisionTier}` : 'Add your first contact'}
              animated
            />
            <MetricCard
              title="Active Offers"
              value={data.recentOffers?.length || 0}
              icon="💼"
              color="info"
              details={data.recentOffers && data.recentOffers.length > 0 ? `${data.recentOffers.length} school${data.recentOffers.length > 1 ? 's' : ''} to compare` : 'Start receiving offers'}
              onClick={() => navigate('/offers')}
              animated
            />
            <MetricCard
              title="Brand Score"
              value={data.brandReadiness?.score || 0}
              unit="/100"
              icon="⭐"
              color="success"
              details={data.brandReadiness?.tier || 'Build your brand'}
              onClick={() => navigate('/influence')}
              animated
            />
          </div>
        </div>

        {/* Budget Progress */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Budget Allocation
          </h2>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Spending Progress</h3>
              <span className="text-sm text-text-secondary">{budgetPercent.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-bg-primary rounded-full overflow-hidden mb-4">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  budgetPercent > 80 ? 'bg-error-500' : 'bg-gold-500'
                )}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-secondary">
              <span>{formatCurrency(data.totalSpend)} spent</span>
              <span>{formatCurrency(budgetRemaining)} remaining</span>
            </div>
          </Card>
        </div>

        {/* Action Cards */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card hoverable onClick={() => navigate('/tracker')} className="cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">📊</div>
              </div>
              <h3 className="font-semibold text-text-primary mb-1">Recruitment Tracker</h3>
              <p className="text-sm text-text-secondary">Log expenses and track coach contacts</p>
            </Card>

            <Card hoverable onClick={() => navigate('/offers')} className="cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">💼</div>
              </div>
              <h3 className="font-semibold text-text-primary mb-1">Financial Matrix</h3>
              <p className="text-sm text-text-secondary">Compare offers and project costs</p>
            </Card>

            <Card hoverable onClick={() => navigate('/influence')} className="cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">⭐</div>
              </div>
              <h3 className="font-semibold text-text-primary mb-1">Brand Analytics</h3>
              <p className="text-sm text-text-secondary">Track social media growth</p>
            </Card>
          </div>
        </div>

        {/* Recent Offers */}
        {data.recentOffers && data.recentOffers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                  Active Offers
                </h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/offers')}
              >
                View All →
              </Button>
            </div>
            <Card>
              <div className="space-y-3">
                {data.recentOffers.slice(0, 3).map((offer: any) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between p-4 bg-bg-primary rounded-lg hover:bg-bg-elevated transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-text-primary">{offer.schoolName}</h4>
                        {offer.isVerbal && (
                          <Badge variant="success" size="sm">
                            VERBAL OFFER
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary">
                        {(offer.athleticScholarshipPct * 100).toFixed(0)}% athletic scholarship • {offer.division}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gold font-playfair">
                        {formatCurrency(offer.annualCOA * (1 - offer.athleticScholarshipPct))}
                      </div>
                      <p className="text-xs text-text-secondary">annual net cost</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Call-to-Action Sections */}
        {data.contactCount === 0 && (
          <Card className="bg-info-500/10 border-info-500/30">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📞</div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Get Started: Track Your Contacts</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Start logging the coaches you've contacted to see your recruitment cost analysis.
                </p>
                <Button
                  size="sm"
                  variant="info"
                  className="mt-3"
                  onClick={() => navigate('/tracker')}
                >
                  Go to Tracker
                </Button>
              </div>
            </div>
          </Card>
        )}

        {!data.brandReadiness && (
          <Card className="bg-success-500/10 border-success-500/30">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⭐</div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Build Your Brand</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Connect your social media profiles to track your brand readiness and grow your influence.
                </p>
                <Button
                  size="sm"
                  variant="success"
                  className="mt-3"
                  onClick={() => navigate('/influence')}
                >
                  Connect Profiles
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
