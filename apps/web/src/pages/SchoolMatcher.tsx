import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/layout/Layout';
import { useToast } from '../components/ui';
import clsx from 'clsx';

interface School {
  id: string;
  name: string;
  division: string;
  state: string;
  setting: string;
  GPATarget: number;
  athleticScholarshipPct: number;
  estimatedCOA: number;
  fitScore: number;
  academicMatch: string;
  athleticMatch: string;
  acceptanceRate: number;
}

export default function SchoolMatcher() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);

  // Filters
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedSetting, setSelectedSetting] = useState('');
  const [sortBy, setSortBy] = useState('fitScore');

  const { addToast } = useToast();

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schools, selectedDivision, selectedState, selectedSetting, sortBy]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const data = await api.schools.getMatches({
        division: selectedDivision || undefined,
        state: selectedState || undefined,
        setting: selectedSetting || undefined,
      });
      setSchools(data || []);
    } catch (err) {
      console.error('Error loading schools:', err);
      addToast('Failed to load schools', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schools];

    if (selectedDivision) {
      filtered = filtered.filter((s) => s.division === selectedDivision);
    }
    if (selectedState) {
      filtered = filtered.filter((s) => s.state === selectedState);
    }
    if (selectedSetting) {
      filtered = filtered.filter((s) => s.setting === selectedSetting);
    }

    // Sort
    if (sortBy === 'fitScore') {
      filtered.sort((a, b) => b.fitScore - a.fitScore);
    } else if (sortBy === 'cost') {
      filtered.sort((a, b) => a.estimatedCOA - b.estimatedCOA);
    } else if (sortBy === 'academic') {
      filtered.sort((a, b) => {
        const aOrder = ['Safety', 'Fit', 'Reach'].indexOf(a.academicMatch);
        const bOrder = ['Safety', 'Fit', 'Reach'].indexOf(b.academicMatch);
        return aOrder - bOrder;
      });
    }

    setFilteredSchools(filtered);
  };

  const getFitScoreColor = (score: number): string => {
    if (score >= 80) return 'text-[#2DD09A]';
    if (score >= 60) return 'text-[#F59E0B]';
    return 'text-[#C0392B]';
  };

  const getFitScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-[#D4EDDA]';
    if (score >= 60) return 'bg-[#FFF3CD]';
    return 'bg-[#FCE0E0]';
  };

  const getMatchColor = (match: string): string => {
    switch (match) {
      case 'Safety':
        return 'bg-[#D4EDDA] text-[#0E7C50]';
      case 'Fit':
        return 'bg-[#E0E8FF] text-[#1A56DB]';
      case 'Reach':
        return 'bg-[#FFF3CD] text-[#B45309]';
      default:
        return 'bg-[#F4F3EF] text-[#5C5A54]';
    }
  };

  const divisionOptions = [
    'D1 Power 4',
    'D1 Mid-Major',
    'D2',
    'D3',
    'NAIA',
    'JUCO',
  ];
  const stateOptions = [
    'CA',
    'TX',
    'NY',
    'FL',
    'PA',
    'OH',
    'IL',
    'NC',
    'VA',
    'MA',
  ];
  const settingOptions = ['Urban', 'Suburban', 'Rural'];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#1A56DB] border-t-transparent mb-4" />
            <p className="text-[#5C5A54]">Finding your school matches...</p>
          </div>
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
            School Matcher
          </h1>
          <p className="text-[#5C5A54]">
            Discover schools that match your academic, athletic, and financial
            goals
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#D8D5CC] rounded-sm p-6">
          <h3 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
            Filter & Sort
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                Division
              </label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none text-sm"
              >
                <option value="">All Divisions</option>
                {divisionOptions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none text-sm"
              >
                <option value="">All States</option>
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                Setting
              </label>
              <select
                value={selectedSetting}
                onChange={(e) => setSelectedSetting(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none text-sm"
              >
                <option value="">All Settings</option>
                {settingOptions.map((setting) => (
                  <option key={setting} value={setting}>
                    {setting}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none text-sm"
              >
                <option value="fitScore">Fit Score</option>
                <option value="cost">Cost (Low to High)</option>
                <option value="academic">Academic Match</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedDivision('');
                  setSelectedState('');
                  setSelectedSetting('');
                  setSortBy('fitScore');
                }}
                className="w-full px-4 py-2 border border-[#D8D5CC] text-[#1A1916] font-medium rounded-sm hover:bg-[#F4F3EF] transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-[#5C5A54]">
          Showing <span className="font-semibold">{filteredSchools.length}</span>{' '}
          {filteredSchools.length === 1 ? 'school' : 'schools'}
        </div>

        {/* Schools Grid */}
        {filteredSchools.length > 0 ? (
          <div className="space-y-4">
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white border border-[#D8D5CC] rounded-sm overflow-hidden"
              >
                {/* School Card Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-[#F4F3EF] transition-colors"
                  onClick={() =>
                    setExpandedSchoolId(
                      expandedSchoolId === school.id ? null : school.id
                    )
                  }
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-[#1A1916] mb-1">
                        {school.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[#5C5A54]">
                        <span>{school.division}</span>
                        <span>•</span>
                        <span>{school.state}</span>
                        <span>•</span>
                        <span className="capitalize">{school.setting}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#8A8783] mb-1">
                        Fit Score
                      </div>
                      <div
                        className={`text-4xl font-serif font-bold ${getFitScoreColor(school.fitScore)}`}
                      >
                        {school.fitScore}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-[#D8D5CC]">
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">
                        Academic Match
                      </div>
                      <div
                        className={`inline-block px-2 py-1 rounded-sm text-xs font-semibold ${getMatchColor(school.academicMatch)}`}
                      >
                        {school.academicMatch}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">
                        Athletic Match
                      </div>
                      <div
                        className={`inline-block px-2 py-1 rounded-sm text-xs font-semibold ${getMatchColor(school.athleticMatch)}`}
                      >
                        {school.athleticMatch}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">
                        Estimated COA
                      </div>
                      <div className="text-lg font-semibold text-[#1A1916]">
                        {formatCurrency(school.estimatedCOA)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">
                        Acceptance Rate
                      </div>
                      <div className="text-lg font-semibold text-[#1A1916]">
                        {(school.acceptanceRate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#8A8783] text-xs mb-1">Details</div>
                      <div className="text-lg font-semibold text-[#1A56DB]">
                        {expandedSchoolId === school.id ? '▼' : '▶'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSchoolId === school.id && (
                  <div className="border-t border-[#D8D5CC] bg-[#F4F3EF] p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Academic Info */}
                      <div>
                        <h4 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
                          Academic Profile
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-white border border-[#D8D5CC] rounded-sm p-4">
                            <div className="text-[#8A8783] text-xs mb-2">
                              GPA Target
                            </div>
                            <div className="text-2xl font-bold text-[#1A1916]">
                              {school.GPATarget.toFixed(1)}
                            </div>
                          </div>
                          <div className="bg-white border border-[#D8D5CC] rounded-sm p-4">
                            <div className="text-[#8A8783] text-xs mb-2">
                              Acceptance Rate
                            </div>
                            <div className="text-2xl font-bold text-[#1A1916]">
                              {(school.acceptanceRate * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Athletic & Financial Info */}
                      <div>
                        <h4 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
                          Athletic & Financial
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-white border border-[#D8D5CC] rounded-sm p-4">
                            <div className="text-[#8A8783] text-xs mb-2">
                              Athletic Scholarship Avg
                            </div>
                            <div className="text-2xl font-bold text-[#2DD09A]">
                              {school.athleticScholarshipPct}%
                            </div>
                          </div>
                          <div className="bg-white border border-[#D8D5CC] rounded-sm p-4">
                            <div className="text-[#8A8783] text-xs mb-2">
                              Estimated Annual COA
                            </div>
                            <div className="text-2xl font-bold text-[#1A56DB]">
                              {formatCurrency(school.estimatedCOA)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fit Score Breakdown */}
                    <div className="mt-8 bg-white border border-[#D8D5CC] rounded-sm p-6">
                      <h4 className="text-sm font-semibold text-[#5C5A54] uppercase mb-4">
                        Why This School Matches
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[#1A1916]">
                            Academic fit (40%)
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-[#F4F3EF] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5BA5D9]"
                                style={{ width: '65%' }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[#5C5A54]">
                              26/40
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#1A1916]">
                            Athletic fit (30%)
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-[#F4F3EF] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#2DD09A]"
                                style={{ width: '80%' }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[#5C5A54]">
                              24/30
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#1A1916]">
                            Financial fit (30%)
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-[#F4F3EF] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1A56DB]"
                                style={{ width: '70%' }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[#5C5A54]">
                              21/30
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-3 justify-end">
                      <button className="px-6 py-2 border border-[#D8D5CC] text-[#1A1916] font-medium rounded-sm hover:bg-white transition-colors text-sm">
                        Learn More
                      </button>
                      <button className="px-6 py-2 bg-[#1A56DB] text-white font-medium rounded-sm hover:opacity-90 transition-opacity text-sm">
                        Add to My List
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#D8D5CC] rounded-sm p-12 text-center">
            <p className="text-lg text-[#5C5A54] mb-6">
              No schools match your current filters. Try adjusting your
              selections.
            </p>
            <button
              onClick={() => {
                setSelectedDivision('');
                setSelectedState('');
                setSelectedSetting('');
              }}
              className="px-6 py-2 bg-[#1A56DB] text-white font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
