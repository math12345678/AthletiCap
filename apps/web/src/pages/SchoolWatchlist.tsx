import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Layout from '../components/layout/Layout';
import { useProfile } from '../contexts/ProfileContext';
import { api } from '../lib/api';
import { DIVISION_COLORS, FIT_SCORE_COLORS, FIT_SCORE_RANGES, formatCurrencyForChart } from '../lib/chart-colors';
import { GlossaryTerm } from '../components/ui';

interface SchoolData {
  id: string | number;
  name: string;
  division: string;
  state: string;
  estimatedCOA?: number;
  athleticScholarshipPct?: number;
  setting?: string;
  GPATarget?: number;
  acceptanceRate?: number;
}

interface WatchlistEntry {
  schoolId: number;
  school: SchoolData;
  fitScore: number;
  academicMatch: string;
  athleticMatch: string;
  addedAt: string;
  notes?: string;
}

// Flatten watchlist entry to school format for components
interface School extends SchoolData {
  fitScore?: number;
}

interface WatchlistStatsProps {
  schools: School[];
}

interface SortConfig {
  key: 'school' | 'division' | 'state' | 'fitScore' | 'coa' | 'athleticAid';
  direction: 'asc' | 'desc';
}

const WatchlistStats: React.FC<WatchlistStatsProps> = ({ schools }) => {
  if (schools.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#F4F3EF] border border-[#D8D5CC] rounded-DEFAULT p-4 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
            Total Tracked
          </div>
          <div className="text-2xl font-mono font-bold text-[#1A56DB]">0</div>
        </div>
      </div>
    );
  }

  const avgFitScore = Math.round(
    schools.reduce((sum, s) => sum + (s.fitScore || 0), 0) / schools.length
  );
  const avgCoa = Math.round(
    schools.reduce((sum, s) => sum + (s.estimatedCOA || 0), 0) / schools.length
  );
  const avgAthlticAid = Math.round(
    schools.reduce((sum, s) => sum + (s.athleticScholarshipPct || 0), 0) / schools.length
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '0ms' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
          Total Tracked
        </div>
        <div className="text-2xl font-mono font-bold text-[#1A56DB]">{schools.length}</div>
      </div>
      <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '100ms' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
          Avg Fit Score
        </div>
        <div className="text-2xl font-mono font-bold text-[#2DD09A]">{avgFitScore}</div>
      </div>
      <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '200ms' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
          Avg COA
        </div>
        <div className="text-2xl font-mono font-bold text-[#1A1916]">
          ${(avgCoa / 1000).toFixed(0)}K
        </div>
      </div>
      <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-4 animate-slideUp hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '300ms' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#5C5A54] mb-2">
          Avg Athletic Aid
        </div>
        <div className="text-2xl font-mono font-bold text-[#F59E0B]">{avgAthlticAid}%</div>
      </div>
    </div>
  );
};

const FitScoreDistributionChart: React.FC<{ schools: School[] }> = ({ schools }) => {
  const ranges = FIT_SCORE_RANGES;
  const data = ranges.map((range) => ({
    range: `${range.min}-${range.max}`,
    count: schools.filter((s) => (s.fitScore || 0) >= range.min && (s.fitScore || 0) <= range.max).length,
    fill: range.color,
  }));

  return (
    <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6 animate-slideUp hover:shadow-md transition-shadow duration-200">
      <h4 className="text-sm font-mono uppercase tracking-widest text-[#5C5A54] mb-6">
        Fit Score Distribution
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="range"
            tick={{ fill: '#5C5A54', fontSize: 12 }}
            label={{ value: 'Fit Score Range', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis
            tick={{ fill: '#5C5A54', fontSize: 12 }}
            label={{ value: 'Schools', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8D5CC',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#1A1916' }}
          />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DivisionBreakdownChart: React.FC<{ schools: School[] }> = ({ schools }) => {
  const divisions = ['D1 Power 4', 'D1 Mid-Major', 'D2', 'D3', 'NAIA', 'JUCO'];
  const data = divisions.map((div) => {
    const divSchools = schools.filter((s) => s.division === div);
    const avgFit = divSchools.length > 0
      ? Math.round(divSchools.reduce((sum, s) => sum + (s.fitScore || 0), 0) / divSchools.length)
      : 0;
    return {
      division: div,
      total: divSchools.length,
      avgFit,
      fill: DIVISION_COLORS[div as keyof typeof DIVISION_COLORS],
    };
  }).filter((d) => d.total > 0);

  if (data.length === 0) return null;

  return (
    <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6 animate-slideUp hover:shadow-md transition-shadow duration-200">
      <h4 className="text-sm font-mono uppercase tracking-widest text-[#5C5A54] mb-6">
        Schools by Division
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="division"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#5C5A54', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#5C5A54', fontSize: 12 }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8D5CC',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#1A1916' }}
          />
          <Legend />
          <Bar dataKey="total" fill="#3B82F6" name="Total Schools" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CostDistributionChart: React.FC<{ schools: School[] }> = ({ schools }) => {
  const costRanges = [
    { min: 0, max: 30000, label: '$0-30K' },
    { min: 30000, max: 50000, label: '$30K-50K' },
    { min: 50000, max: 80000, label: '$50K-80K' },
    { min: 80000, max: Infinity, label: '$80K+' },
  ];

  const data = costRanges.map((range) => ({
    range: range.label,
    count: schools.filter((s) => (s.estimatedCOA || 0) >= range.min && (s.estimatedCOA || 0) < range.max).length,
  }));

  return (
    <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6 animate-slideUp hover:shadow-md transition-shadow duration-200">
      <h4 className="text-sm font-mono uppercase tracking-widest text-[#5C5A54] mb-6">
        <GlossaryTerm term="COA">Cost of Attendance</GlossaryTerm> Distribution
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="range"
            tick={{ fill: '#5C5A54', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#5C5A54', fontSize: 12 }}
            label={{ value: 'Schools', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8D5CC',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#1A1916' }}
          />
          <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SchoolComparison: React.FC<{ schools: School[] }> = ({ schools }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'fitScore',
    direction: 'desc',
  });

  const sortedSchools = useMemo(() => {
    const sorted = [...schools].sort((a, b) => {
      let aVal: any = a[sortConfig.key];
      let bVal: any = b[sortConfig.key];

      // Handle coa -> estimatedCOA mapping
      if (sortConfig.key === 'coa') {
        aVal = (a as any).estimatedCOA || 0;
        bVal = (b as any).estimatedCOA || 0;
      }

      aVal = aVal || 0;
      bVal = bVal || 0;
      const comparison = typeof aVal === 'string' ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [schools, sortConfig]);

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIndicator = (key: SortConfig['key']) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#D8D5CC] rounded-DEFAULT p-6 overflow-x-auto animate-slideUp hover:shadow-md transition-shadow duration-200">
      <h4 className="text-sm font-mono uppercase tracking-widest text-[#5C5A54] mb-6">
        School Comparison Table
      </h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#D8D5CC]">
            <th
              className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-[#5C5A54] cursor-pointer hover:text-[#1A1916]"
              onClick={() => handleSort('school')}
            >
              School {getSortIndicator('school')}
            </th>
            <th
              className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-[#5C5A54] cursor-pointer hover:text-[#1A1916]"
              onClick={() => handleSort('division')}
            >
              Division {getSortIndicator('division')}
            </th>
            <th
              className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-[#5C5A54] cursor-pointer hover:text-[#1A1916]"
              onClick={() => handleSort('state')}
            >
              State {getSortIndicator('state')}
            </th>
            <th
              className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-[#5C5A54] cursor-pointer hover:text-[#1A1916]"
              onClick={() => handleSort('fitScore')}
            >
              Fit {getSortIndicator('fitScore')}
            </th>
            <th
              className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-[#5C5A54] cursor-pointer hover:text-[#1A1916]"
              onClick={() => handleSort('coa')}
            >
              COA {getSortIndicator('coa')}
            </th>
            <th
              className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-[#5C5A54] cursor-pointer hover:text-[#1A1916]"
              onClick={() => handleSort('athleticAid')}
            >
              Athletic Aid % {getSortIndicator('athleticAid')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedSchools.map((school) => (
            <tr key={school.id} className="border-b border-[#D8D5CC] hover:bg-[#F4F3EF]">
              <td className="py-3 px-4 font-semibold text-[#1A1916]">{school.name}</td>
              <td className="py-3 px-4 text-[#5C5A54]">{school.division}</td>
              <td className="py-3 px-4 text-[#5C5A54]">{school.state}</td>
              <td className="py-3 px-4">
                <span
                  className="inline-block px-3 py-1 rounded-DEFAULT text-white text-xs font-semibold"
                  style={{ backgroundColor: FIT_SCORE_COLORS[Math.min(Math.floor((school.fitScore || 0) / 20), 4) as 0 | 1 | 2 | 3 | 4] }}
                >
                  {school.fitScore}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-[#1A1916]">
                ${(school.estimatedCOA || 0).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right font-mono text-[#F59E0B]">
                {school.athleticScholarshipPct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function SchoolWatchlist() {
  const { currentProfile } = useProfile();

  const { data: watchlistEntries = [], isLoading, error } = useQuery({
    queryKey: ['schools', 'watchlist'],
    queryFn: () => api.schools.getWatchlist(),
    enabled: !!currentProfile,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#1A56DB] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-[#5C5A54]">Loading your school watchlist...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-[#C0392B] text-sm mb-2">Error loading watchlist</p>
          <p className="text-[#5C5A54]">Please try refreshing the page</p>
        </div>
      </Layout>
    );
  }

  // Flatten watchlist entries to school format
  const schools: School[] = (watchlistEntries as WatchlistEntry[]).map((entry) => ({
    ...entry.school,
    fitScore: entry.fitScore,
  }));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <section>
          <h2 className="section-header mb-6">
            <span className="section-number"># [1]</span> YOUR SCHOOL WATCHLIST
          </h2>
        </section>

        {/* Overview Stats */}
        <section>
          <div className="mb-4 text-sm text-[#5C5A54]">
            Track and compare your recruitment targets across all divisions
          </div>
          <WatchlistStats schools={schools} />
        </section>

        {schools.length === 0 ? (
          <section className="bg-[#F4F3EF] border border-[#D8D5CC] rounded-DEFAULT p-8 text-center">
            <div className="text-[#5C5A54] mb-4">
              <p className="text-sm mb-2">No schools saved yet</p>
              <p className="text-xs">Visit School Matcher to start building your watchlist</p>
            </div>
          </section>
        ) : (
          <>
            {/* Section 2: Fit Score Analysis */}
            <section>
              <h3 className="section-header mb-6">
                <span className="section-number"># [2]</span> FIT SCORE ANALYSIS
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FitScoreDistributionChart schools={schools} />
                <DivisionBreakdownChart schools={schools} />
              </div>
            </section>

            {/* Section 3: Cost Analysis */}
            <section>
              <h3 className="section-header mb-6">
                <span className="section-number"># [3]</span> COST ANALYSIS
              </h3>
              <CostDistributionChart schools={schools} />
            </section>

            {/* Section 4: School Comparison */}
            <section>
              <h3 className="section-header mb-6">
                <span className="section-number"># [4]</span> DETAILED COMPARISON
              </h3>
              <SchoolComparison schools={schools} />
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
