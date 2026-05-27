import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Layout from '../components/layout/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockInstagramData = {
  followerCount: 8200,
  avgEngagementRate: 3.8,
  monthlyGrowthRate: 2.1,
  lastRefreshed: new Date(),
  history: [
    { month: 'Dec', followers: 7800, engagement: 3.2 },
    { month: 'Jan', followers: 8000, engagement: 3.5 },
    { month: 'Feb', followers: 8200, engagement: 3.8 },
  ],
};

export default function Influence() {
  const [brandReadiness, setBrandReadiness] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProfile, setShowAddProfile] = useState(false);

  const [formData, setFormData] = useState({
    platform: 'INSTAGRAM',
    handle: '',
    followerCount: 0,
    avgEngagementRate: 0,
    monthlyGrowthRate: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandRes, eligRes, profilesRes] = await Promise.all([
          api.influence.getBrandReadiness(),
          api.influence.getEligibility(),
          api.influence.getSocialProfiles(),
        ]);

        setBrandReadiness(brandRes);
        setEligibility(eligRes);
        setProfiles(profilesRes || []);
      } catch (err) {
        console.error('Error loading influence data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.influence.createSocialProfile({
        ...formData,
        followerCount: parseInt(formData.followerCount.toString()),
        avgEngagementRate: parseFloat(formData.avgEngagementRate.toString()),
        monthlyGrowthRate: parseFloat(formData.monthlyGrowthRate.toString()),
      });

      setFormData({
        platform: 'INSTAGRAM',
        handle: '',
        followerCount: 0,
        avgEngagementRate: 0,
        monthlyGrowthRate: 0,
      });
      setShowAddProfile(false);

      // Reload profiles and brand readiness
      const [brandRes, profilesRes] = await Promise.all([
        api.influence.getBrandReadiness(),
        api.influence.getSocialProfiles(),
      ]);
      setBrandReadiness(brandRes);
      setProfiles(profilesRes || []);
    } catch (err) {
      console.error('Error adding profile:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading brand analytics...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-playfair text-gold mb-2">Brand Analytics</h1>
          <p className="text-text-secondary">Track your social media growth and brand readiness</p>
        </div>

        {/* State Eligibility Banner */}
        {eligibility && (
          <div
            className={`rounded-lg p-4 text-sm ${
              eligibility.eligible
                ? 'bg-green/10 border border-green text-green'
                : 'bg-yellow/10 border border-yellow text-yellow'
            }`}
          >
            {eligibility.statePermitted
              ? `✓ NIL deals are permitted for high school athletes in ${eligibility.stateCode}. When you're ready, make sure any deal is disclosed to your coach.`
              : `⚠️ NIL deals are not currently permitted for high school athletes in ${eligibility.stateCode}. This section helps you build your brand for college.`}
          </div>
        )}

        {/* Brand Readiness Score */}
        {brandReadiness && (
          <div className="card space-y-6">
            <h2 className="text-xl font-semibold">Brand Readiness Score</h2>

            <div className="flex items-center gap-8">
              <div className="flex-1">
                {/* Circular gauge */}
                <svg viewBox="0 0 120 120" className="w-48 h-48">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#3D4A60"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#F0A500"
                    strokeWidth="8"
                    strokeDasharray={`${(brandReadiness.score / 100) * 314} 314`}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
                  />
                  <text
                    x="60"
                    y="65"
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="bold"
                    fill="#F0A500"
                    fontFamily="Playfair Display"
                  >
                    {brandReadiness.score}
                  </text>
                  <text
                    x="60"
                    y="80"
                    textAnchor="middle"
                    fontSize="10"
                    fill="#8A93A8"
                  >
                    {brandReadiness.tier}
                  </text>
                </svg>
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="font-semibold">How to Level Up</h3>
                {brandReadiness.checklist.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <span className={item.done ? '✓' : '○'} style={{ color: item.done ? '#2DD09A' : '#525C6F' }}>
                      {item.done ? '✓' : '○'}
                    </span>
                    <span className={item.done ? 'text-green' : 'text-text-secondary'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Profiles */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Connected Platforms</h2>
            <button
              onClick={() => setShowAddProfile(!showAddProfile)}
              className="btn-primary text-sm"
            >
              {showAddProfile ? 'Cancel' : '+ Connect Account'}
            </button>
          </div>

          {showAddProfile && (
            <form onSubmit={handleAddProfile} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                >
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="TWITTER">Twitter/X</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Handle / Username</label>
                <input
                  type="text"
                  required
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                  placeholder="@username"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Followers</label>
                  <input
                    type="number"
                    value={formData.followerCount}
                    onChange={(e) => setFormData({ ...formData, followerCount: parseInt(e.target.value) })}
                    className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Engagement Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.avgEngagementRate}
                    onChange={(e) =>
                      setFormData({ ...formData, avgEngagementRate: parseFloat(e.target.value) })
                    }
                    className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Connect Account
              </button>
            </form>
          )}

          {/* Mock Instagram Profile */}
          <div className="card">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-semibold text-lg">@sofiarodzguez_soccer</h3>
                <p className="text-sm text-text-secondary">Instagram</p>
              </div>
              <span className="bg-green/20 text-green text-xs px-3 py-1 rounded">Connected</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-bg-primary rounded p-4">
                <div className="text-sm text-text-secondary mb-1">Followers</div>
                <div className="text-2xl font-playfair font-bold text-gold">8,200</div>
                <div className="text-xs text-green mt-2">+340 this month</div>
              </div>

              <div className="bg-bg-primary rounded p-4">
                <div className="text-sm text-text-secondary mb-1">Engagement Rate</div>
                <div className="text-2xl font-playfair font-bold text-teal">3.8%</div>
                <div className="text-xs text-text-secondary mt-2">vs 2.5% benchmark</div>
              </div>

              <div className="bg-bg-primary rounded p-4">
                <div className="text-sm text-text-secondary mb-1">90-Day Growth</div>
                <div className="text-2xl font-playfair font-bold text-green">+4.2%</div>
                <div className="text-xs text-green mt-2">Trending up</div>
              </div>
            </div>

            <h4 className="font-semibold mb-4">Growth Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockInstagramData.history}>
                <defs>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F0A500" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F0A500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3D4A60" />
                <XAxis dataKey="month" stroke="#8A93A8" />
                <YAxis stroke="#8A93A8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1F2E',
                    border: '1px solid #3D4A60',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#F0A500"
                  fillOpacity={1}
                  fill="url(#colorFollowers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Card */}
        <div className="card bg-teal/10 border border-teal">
          <h3 className="font-semibold text-teal mb-3">About the Brand Readiness Score</h3>
          <p className="text-text-secondary text-sm">
            The Brand Readiness Score is an educational tool designed to help you understand your brand trajectory. It combines your follower count, engagement rate, platform diversity, and growth consistency. No dollar estimates are shown. This score helps you identify actionable ways to improve your brand for potential NIL opportunities when you reach college.
          </p>
        </div>
      </div>
    </Layout>
  );
}
