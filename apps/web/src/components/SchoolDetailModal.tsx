import React from 'react';
import { formatCurrency } from '../lib/utils';

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

interface SchoolDetailModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWatchlist: (school: School) => void;
  isInWatchlist: boolean;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  isOpen,
  onClose,
  onAddToWatchlist,
  isInWatchlist,
}) => {
  if (!isOpen || !school) return null;

  const getMatchBg = (match: string): string => {
    switch (match) {
      case 'Safety':
        return 'bg-[#D4EDDA]';
      case 'Fit':
        return 'bg-[#E0E8FF]';
      case 'Reach':
        return 'bg-[#FFF3CD]';
      default:
        return 'bg-[#F4F3EF]';
    }
  };

  const getMatchColor = (match: string): string => {
    switch (match) {
      case 'Safety':
        return 'text-[#0E7C50]';
      case 'Fit':
        return 'text-[#1A56DB]';
      case 'Reach':
        return 'text-[#B45309]';
      default:
        return 'text-[#5C5A54]';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A56DB] to-[#0E7C50] p-6 text-white sticky top-0 z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2">{school.name}</h2>
              <p className="text-sm opacity-90">{school.state} • {school.setting}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white text-2xl font-bold hover:opacity-80"
            >
              ×
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{school.fitScore}</div>
              <div className="text-xs opacity-90">Fit Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{school.athleticScholarshipPct}%</div>
              <div className="text-xs opacity-90">Athletic Aid</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{(school.acceptanceRate * 100).toFixed(0)}%</div>
              <div className="text-xs opacity-90">Acceptance</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{school.division}</div>
              <div className="text-xs opacity-90">Division</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Match Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${getMatchBg(school.academicMatch)}`}>
              <div className="text-xs font-semibold text-[#5C5A54] mb-1">Academic Match</div>
              <div className={`text-2xl font-bold ${getMatchColor(school.academicMatch)}`}>
                {school.academicMatch}
              </div>
              <p className="text-xs text-[#5C5A54] mt-2">
                {school.academicMatch === 'Safety' && 'Your stats exceed requirements'}
                {school.academicMatch === 'Fit' && 'Your stats align with typical admits'}
                {school.academicMatch === 'Reach' && 'Your stats below typical admits'}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${getMatchBg(school.athleticMatch)}`}>
              <div className="text-xs font-semibold text-[#5C5A54] mb-1">Athletic Match</div>
              <div className={`text-2xl font-bold ${getMatchColor(school.athleticMatch)}`}>
                {school.athleticMatch}
              </div>
              <p className="text-xs text-[#5C5A54] mt-2">
                {school.athleticMatch === 'Safety' && 'Strong athletic profile fit'}
                {school.athleticMatch === 'Fit' && 'Good athletic fit for program'}
                {school.athleticMatch === 'Reach' && 'Competitive recruitment target'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50">
              <div className="text-xs font-semibold text-[#5C5A54] mb-1">Financial Aid</div>
              <div className="text-2xl font-bold text-[#1A56DB]">
                {school.athleticScholarshipPct}%
              </div>
              <p className="text-xs text-[#5C5A54] mt-2">
                Typical athletic scholarship coverage
              </p>
            </div>
          </div>

          {/* Academic Requirements */}
          <div>
            <h3 className="text-lg font-semibold text-[#1A1916] mb-4">Academic Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#D8D5CC] rounded-lg p-4">
                <div className="text-sm text-[#5C5A54] mb-1">GPA Target</div>
                <div className="text-2xl font-bold text-[#1A1916]">{school.GPATarget}</div>
                <p className="text-xs text-[#8A8783] mt-2">Typical freshman GPA</p>
              </div>
              <div className="border border-[#D8D5CC] rounded-lg p-4">
                <div className="text-sm text-[#5C5A54] mb-1">Acceptance Rate</div>
                <div className="text-2xl font-bold text-[#1A1916]">{(school.acceptanceRate * 100).toFixed(1)}%</div>
                <p className="text-xs text-[#8A8783] mt-2">Overall admission rate</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1A1916] mb-4">Financial Information</h3>
            <div className="bg-[#F4F3EF] border border-[#D8D5CC] rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#5C5A54]">Cost of Attendance</span>
                <span className="text-lg font-semibold text-[#1A1916]">{formatCurrency(school.estimatedCOA)}</span>
              </div>
              <div className="border-t border-[#D8D5CC] pt-4 flex justify-between items-center">
                <span className="text-[#5C5A54]">Typical Athletic Scholarship</span>
                <span className="text-lg font-semibold text-[#2DD09A]">
                  {formatCurrency(school.estimatedCOA * (school.athleticScholarshipPct / 100))}
                </span>
              </div>
              <div className="border-t border-[#D8D5CC] pt-4 flex justify-between items-center">
                <span className="text-[#5C5A54]">Est. Family Cost (before merit aid)</span>
                <span className="text-lg font-semibold text-[#1A56DB]">
                  {formatCurrency(school.estimatedCOA * (1 - school.athleticScholarshipPct / 100))}
                </span>
              </div>
            </div>
          </div>

          {/* Program Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1A1916] mb-4">Program Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1916]">Location</p>
                  <p className="text-sm text-[#5C5A54]">{school.state} • {school.setting}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1916]">Division Level</p>
                  <p className="text-sm text-[#5C5A54]">{school.division}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1916]">Scholarship Coverage</p>
                  <p className="text-sm text-[#5C5A54]">Athletic scholarships typically cover {school.athleticScholarshipPct}% of costs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-[#D8D5CC]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#D8D5CC] text-[#1A1916] rounded-lg font-medium hover:bg-[#F4F3EF] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onAddToWatchlist(school)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                isInWatchlist
                  ? 'bg-[#D4EDDA] text-[#0E7C50] hover:opacity-80'
                  : 'bg-[#1A56DB] text-white hover:opacity-90'
              }`}
            >
              {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailModal;
