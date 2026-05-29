import React, { useState } from 'react';
import { formatCurrency } from '../lib/utils';

interface FamilyProfileData {
  expectedFamilyContribution: number;
  acceptableDebtLevel: number;
  preferredLocations: string[];
  academicPriorities: string[];
  athleticPriorities: string[];
}

interface FamilyProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FamilyProfileData) => void;
  initialData?: Partial<FamilyProfileData>;
}

export const FamilyProfile: React.FC<FamilyProfileProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData = {},
}) => {
  const [data, setData] = useState<FamilyProfileData>({
    expectedFamilyContribution: initialData.expectedFamilyContribution || 0,
    acceptableDebtLevel: initialData.acceptableDebtLevel || 0,
    preferredLocations: initialData.preferredLocations || [],
    academicPriorities: initialData.academicPriorities || [],
    athleticPriorities: initialData.athleticPriorities || [],
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  const fourYearContribution = data.expectedFamilyContribution * 4;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-serif font-bold text-[#1A1916] mb-6">Family Financial Profile</h2>

        <div className="space-y-6">
          {/* Expected Family Contribution */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1916] mb-2">
              Expected Family Contribution (Annual)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-[#5C5A54]">$</span>
              <input
                type="number"
                value={data.expectedFamilyContribution}
                onChange={(e) => setData({ ...data, expectedFamilyContribution: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-2 border border-[#D8D5CC] rounded-lg bg-white text-[#1A1916] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-[#8A8783] mt-1">
              4-year total: {formatCurrency(fourYearContribution)}
            </p>
          </div>

          {/* Acceptable Debt Level */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1916] mb-2">
              Acceptable Total Student Debt
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-[#5C5A54]">$</span>
              <input
                type="number"
                value={data.acceptableDebtLevel}
                onChange={(e) => setData({ ...data, acceptableDebtLevel: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-2 border border-[#D8D5CC] rounded-lg bg-white text-[#1A1916] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-[#8A8783] mt-1">
              Maximum amount comfortable borrowing for college
            </p>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1916] mb-2">
              Preferred Regions/States (comma-separated)
            </label>
            <input
              type="text"
              value={data.preferredLocations.join(', ')}
              onChange={(e) => setData({ ...data, preferredLocations: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full px-4 py-2 border border-[#D8D5CC] rounded-lg bg-white text-[#1A1916] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              placeholder="California, Northeast, etc."
            />
          </div>

          {/* Academic Priorities */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1916] mb-2">
              Academic Priorities (comma-separated)
            </label>
            <input
              type="text"
              value={data.academicPriorities.join(', ')}
              onChange={(e) => setData({ ...data, academicPriorities: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full px-4 py-2 border border-[#D8D5CC] rounded-lg bg-white text-[#1A1916] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              placeholder="Engineering, Business, pre-med, etc."
            />
          </div>

          {/* Athletic Priorities */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1916] mb-2">
              Athletic Priorities (comma-separated)
            </label>
            <input
              type="text"
              value={data.athleticPriorities.join(', ')}
              onChange={(e) => setData({ ...data, athleticPriorities: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full px-4 py-2 border border-[#D8D5CC] rounded-lg bg-white text-[#1A1916] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              placeholder="Playing time, coaching style, program strength, etc."
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded border border-blue-100">
            <p className="text-sm text-[#5C5A54]">
              This information helps AthletiCap evaluate which offers align with your family's financial situation and goals. You can update this anytime.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-[#D8D5CC]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#D8D5CC] text-[#1A1916] rounded-lg font-medium hover:bg-[#F4F3EF] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#1A56DB] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Save Family Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyProfile;
