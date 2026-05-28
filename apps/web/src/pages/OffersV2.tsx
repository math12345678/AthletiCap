import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/layout/Layout';
import { useToast } from '../components/ui';

interface Offer {
  id: string;
  schoolName: string;
  division: string;
  COA: number;
  tuition: number;
  roomBoard: number;
  athleticScholarshipPct: number;
  meritAidEstimate: { low: number; high: number };
  meritAidOverride?: number;
  annualContribution: number;
  tuitionInflationRate: number;
  status: string;
  confidenceTier: string;
  notes: string;
  createdAt: string;
}

interface ProjectionYear {
  year: number;
  COA: number;
  athleticScholarship: number;
  meritAid: number;
  annualContribution: number;
  netCost: number;
}

export default function OffersV2() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Offer>>({
    schoolName: '',
    division: 'D1 Power 4',
    COA: 0,
    tuition: 0,
    roomBoard: 0,
    athleticScholarshipPct: 0,
    meritAidEstimate: { low: 0, high: 0 },
    annualContribution: 0,
    tuitionInflationRate: 3,
    status: 'interested',
    confidenceTier: 'speculative',
    notes: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await api.offers.list();
      setOffers(data || []);
    } catch (err) {
      console.error('Error loading offers:', err);
      addToast('Failed to load offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = async () => {
    try {
      if (!formData.schoolName) {
        addToast('School name is required', 'error');
        return;
      }
      await api.offers.create(formData);
      addToast('Offer added successfully', 'success');
      setShowAddModal(false);
      setFormData({
        schoolName: '',
        division: 'D1 Power 4',
        COA: 0,
        tuition: 0,
        roomBoard: 0,
        athleticScholarshipPct: 0,
        meritAidEstimate: { low: 0, high: 0 },
        annualContribution: 0,
        tuitionInflationRate: 3,
        status: 'interested',
        confidenceTier: 'speculative',
        notes: '',
      });
      loadOffers();
    } catch (err) {
      console.error('Error adding offer:', err);
      addToast('Failed to add offer', 'error');
    }
  };

  const handleEditOffer = async () => {
    try {
      if (selectedOffer) {
        await api.offers.update(selectedOffer.id, formData);
        addToast('Offer updated successfully', 'success');
        setShowEditModal(false);
        setSelectedOffer(null);
        loadOffers();
      }
    } catch (err) {
      console.error('Error updating offer:', err);
      addToast('Failed to update offer', 'error');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await api.offers.delete(id);
      addToast('Offer deleted', 'success');
      loadOffers();
    } catch (err) {
      console.error('Error deleting offer:', err);
      addToast('Failed to delete offer', 'error');
    }
  };

  const handleCommitOffer = async (id: string) => {
    try {
      await api.offers.commit(id);
      addToast('Committed to this offer!', 'success');
      loadOffers();
    } catch (err) {
      console.error('Error committing offer:', err);
      addToast('Failed to commit offer', 'error');
    }
  };

  const calculateYear1NetCost = (offer: Offer): number => {
    const athleticScholar = offer.COA * (offer.athleticScholarshipPct / 100);
    const meritAid =
      offer.meritAidOverride ||
      (offer.meritAidEstimate.low + offer.meritAidEstimate.high) / 2;
    return Math.max(
      0,
      offer.COA - athleticScholar - meritAid + offer.annualContribution
    );
  };

  const generate4YearProjection = (offer: Offer): ProjectionYear[] => {
    const years: ProjectionYear[] = [];
    let currentCOA = offer.COA;

    for (let i = 0; i < 4; i++) {
      const athleticScholar = currentCOA * (offer.athleticScholarshipPct / 100);
      const meritAid =
        offer.meritAidOverride ||
        (offer.meritAidEstimate.low + offer.meritAidEstimate.high) / 2;
      const netCost = Math.max(
        0,
        currentCOA - athleticScholar - meritAid + offer.annualContribution
      );

      years.push({
        year: i + 1,
        COA: currentCOA,
        athleticScholarship: athleticScholar,
        meritAid: meritAid,
        annualContribution: offer.annualContribution,
        netCost: netCost,
      });

      currentCOA *= 1 + offer.tuitionInflationRate / 100;
    }

    return years;
  };

  const getBestOffer = (): Offer | null => {
    if (offers.length === 0) return null;
    const qualifyingOffers = offers.filter(
      (o) => o.confidenceTier === 'written' || o.confidenceTier === 'signed'
    );
    if (qualifyingOffers.length === 0) return null;

    return qualifyingOffers.reduce((best, current) => {
      const bestNet = calculateYear1NetCost(best);
      const currentNet = calculateYear1NetCost(current);
      return currentNet < bestNet ? current : best;
    });
  };

  const getConfidenceColor = (tier: string): string => {
    switch (tier) {
      case 'verbal':
        return 'bg-[#FFF3CD] text-[#B45309]';
      case 'written':
        return 'bg-[#D4EDDA] text-[#0E7C50]';
      case 'signed':
        return 'bg-[#D4EDDA] text-[#0E7C50]';
      default:
        return 'bg-[#E0E8FF] text-[#1A56DB]';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'offer_received':
        return 'bg-[#D4EDDA] text-[#0E7C50]';
      case 'committed':
        return 'bg-[#D4EDDA] text-[#0E7C50]';
      case 'declined':
        return 'bg-[#FCE0E0] text-[#C0392B]';
      default:
        return 'bg-[#E0E8FF] text-[#1A56DB]';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#1A56DB] border-t-transparent mb-4" />
            <p className="text-[#5C5A54]">Loading your offers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const bestOffer = getBestOffer();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Section 1: School Offers Analysis */}
        <div className="flex justify-between items-start mb-8">
          <h2 className="section-header">
            <span className="section-number"># [1]</span> SCHOOL OFFERS ANALYSIS
          </h2>
          <button
            onClick={() => {
              setSelectedOffer(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-[#1A56DB] text-white rounded-DEFAULT text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            + Add Offer
          </button>
        </div>

        {/* Best Offer Highlight */}
        {bestOffer && (
          <div className="bg-white border-2 border-[#1A56DB] rounded-DEFAULT p-6 mb-8">
            <div className="text-xs font-mono uppercase tracking-widest text-[#1A56DB] mb-3">
              Best Offer
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-[#5C5A54] text-xs mb-1">School</div>
                <div className="text-2xl font-serif font-bold text-[#1A1916]">
                  {bestOffer.schoolName}
                </div>
              </div>
              <div>
                <div className="text-[#5C5A54] text-xs mb-1">Division</div>
                <div className="text-lg font-semibold text-[#1A1916]">
                  {bestOffer.division}
                </div>
              </div>
              <div>
                <div className="text-[#5C5A54] text-xs mb-1">
                  Athletic Scholarship
                </div>
                <div className="text-lg font-semibold text-[#2DD09A]">
                  {bestOffer.athleticScholarshipPct}%
                </div>
              </div>
              <div>
                <div className="text-[#5C5A54] text-xs mb-1">Net Year-1 Cost</div>
                <div className="text-2xl font-serif font-bold text-[#1A56DB]">
                  {formatCurrency(calculateYear1NetCost(bestOffer))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Offers Grid */}
        {offers.length > 0 ? (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-[#D8D5CC] rounded-sm overflow-hidden"
              >
                {/* Offer Summary Card */}
                <div
                  className="p-6 cursor-pointer hover:bg-[#F4F3EF] transition-colors"
                  onClick={() =>
                    setExpandedOfferId(
                      expandedOfferId === offer.id ? null : offer.id
                    )
                  }
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-serif font-bold text-[#1A1916]">
                          {offer.schoolName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-sm text-xs font-medium ${getStatusColor(offer.status)}`}
                        >
                          {offer.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-sm text-xs font-medium ${getConfidenceColor(offer.confidenceTier)}`}
                        >
                          {offer.confidenceTier.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#5C5A54]">{offer.division}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#8A8783] mb-1">
                        Year 1 Net Cost
                      </div>
                      <div className="text-3xl font-serif font-bold text-[#1A56DB]">
                        {formatCurrency(calculateYear1NetCost(offer))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 pt-4 border-t border-[#D8D5CC]">
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">COA</div>
                      <div className="text-lg font-semibold text-[#1A1916]">
                        {formatCurrency(offer.COA)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">
                        Athletic Scholarship
                      </div>
                      <div className="text-lg font-semibold text-[#2DD09A]">
                        {offer.athleticScholarshipPct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">Merit Aid</div>
                      <div className="text-lg font-semibold text-[#5BA5D9]">
                        {formatCurrency(
                          offer.meritAidOverride ||
                            (offer.meritAidEstimate.low +
                              offer.meritAidEstimate.high) /
                              2
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">
                        Your Contribution
                      </div>
                      <div className="text-lg font-semibold text-[#1A1916]">
                        {formatCurrency(offer.annualContribution)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A8783] text-xs mb-1">
                        Details
                      </div>
                      <div className="text-lg font-semibold text-[#1A56DB]">
                        {expandedOfferId === offer.id ? '▼' : '▶'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOfferId === offer.id && (
                  <div className="border-t border-[#D8D5CC] bg-[#F4F3EF] p-6">
                    {/* 4-Year Projection Table */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-[#1A1916] mb-4">
                        4-Year Cost Projection
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#D8D5CC]">
                              <th className="text-left py-2 px-4 text-[#5C5A54] font-semibold">
                                Year
                              </th>
                              <th className="text-right py-2 px-4 text-[#5C5A54] font-semibold">
                                COA
                              </th>
                              <th className="text-right py-2 px-4 text-[#5C5A54] font-semibold">
                                Athletic Grant
                              </th>
                              <th className="text-right py-2 px-4 text-[#5C5A54] font-semibold">
                                Merit Aid
                              </th>
                              <th className="text-right py-2 px-4 text-[#5C5A54] font-semibold">
                                Your Cost
                              </th>
                              <th className="text-right py-2 px-4 text-[#5C5A54] font-semibold">
                                Net Cost
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {generate4YearProjection(offer).map((year) => (
                              <tr
                                key={year.year}
                                className="border-b border-[#D8D5CC] hover:bg-[#FFFFFF]"
                              >
                                <td className="py-3 px-4 text-[#1A1916] font-semibold">
                                  Year {year.year}
                                </td>
                                <td className="text-right py-3 px-4 text-[#1A1916]">
                                  {formatCurrency(year.COA)}
                                </td>
                                <td className="text-right py-3 px-4 text-[#2DD09A]">
                                  {formatCurrency(year.athleticScholarship)}
                                </td>
                                <td className="text-right py-3 px-4 text-[#5BA5D9]">
                                  {formatCurrency(year.meritAid)}
                                </td>
                                <td className="text-right py-3 px-4 text-[#1A1916]">
                                  {formatCurrency(year.annualContribution)}
                                </td>
                                <td className="text-right py-3 px-4 font-bold text-[#1A56DB]">
                                  {formatCurrency(year.netCost)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Notes */}
                    {offer.notes && (
                      <div className="mb-8">
                        <h4 className="text-sm font-semibold text-[#5C5A54] mb-2">
                          Notes
                        </h4>
                        <p className="text-[#1A1916] text-sm">{offer.notes}</p>
                      </div>
                    )}

                    {/* 4-Year Total */}
                    <div className="bg-white border border-[#D8D5CC] rounded-sm p-4 mb-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-[#8A8783] text-xs mb-1">
                            4-Year Total Cost
                          </div>
                          <div className="text-xl font-bold text-[#1A1916]">
                            {formatCurrency(
                              generate4YearProjection(offer).reduce(
                                (sum, year) => sum + year.COA,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#8A8783] text-xs mb-1">
                            4-Year Your Cost
                          </div>
                          <div className="text-xl font-bold text-[#1A1916]">
                            {formatCurrency(
                              generate4YearProjection(offer).reduce(
                                (sum, year) => sum + year.netCost,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#8A8783] text-xs mb-1">
                            4-Year Grant Total
                          </div>
                          <div className="text-xl font-bold text-[#2DD09A]">
                            {formatCurrency(
                              generate4YearProjection(offer).reduce(
                                (sum, year) =>
                                  sum + year.athleticScholarship + year.meritAid,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#8A8783] text-xs mb-1">
                            Savings vs COA
                          </div>
                          <div className="text-xl font-bold text-[#2DD09A]">
                            {formatCurrency(
                              generate4YearProjection(offer).reduce(
                                (sum, year) =>
                                  sum + year.athleticScholarship + year.meritAid,
                                0
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setSelectedOffer(offer);
                          setFormData(offer);
                          setShowEditModal(true);
                        }}
                        className="px-4 py-2 border border-[#D8D5CC] text-[#1A1916] font-medium rounded-sm hover:bg-[#F4F3EF] transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="px-4 py-2 border border-[#C0392B] text-[#C0392B] font-medium rounded-sm hover:bg-[#FCE0E0] transition-colors text-sm"
                      >
                        Delete
                      </button>
                      {offer.confidenceTier === 'signed' &&
                        offer.status !== 'committed' && (
                          <button
                            onClick={() => handleCommitOffer(offer.id)}
                            className="px-6 py-2 bg-[#2DD09A] text-white font-medium rounded-sm hover:opacity-90 transition-opacity text-sm"
                          >
                            Commit to Offer
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#D8D5CC] rounded-sm p-12 text-center">
            <p className="text-lg text-[#5C5A54] mb-6">
              No school offers yet. Start tracking your offers to compare
              financial aid packages.
            </p>
            <button
              onClick={() => {
                setSelectedOffer(null);
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-[#1A56DB] text-white font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              Add Your First Offer
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-[#1A1916] bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#D8D5CC] p-6 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-[#1A1916]">
                {showEditModal ? 'Edit Offer' : 'Add School Offer'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedOffer(null);
                }}
                className="text-[#8A8783] hover:text-[#1A1916] text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* School & Division */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schoolName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                    Division
                  </label>
                  <select
                    value={formData.division || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, division: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                  >
                    <option>D1 Power 4</option>
                    <option>D1 Mid-Major</option>
                    <option>D2</option>
                    <option>D3</option>
                    <option>NAIA</option>
                    <option>JUCO</option>
                  </select>
                </div>
              </div>

              {/* Cost of Attendance */}
              <div className="bg-[#F4F3EF] rounded-sm p-4 border border-[#D8D5CC]">
                <h4 className="text-sm font-semibold text-[#5C5A54] mb-4">
                  Cost of Attendance (COA)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                      Total COA *
                    </label>
                    <input
                      type="number"
                      value={formData.COA || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          COA: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                      placeholder="60000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                      Tuition
                    </label>
                    <input
                      type="number"
                      value={formData.tuition || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tuition: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                      placeholder="35000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                      Room & Board
                    </label>
                    <input
                      type="number"
                      value={formData.roomBoard || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          roomBoard: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                      placeholder="16000"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Aid */}
              <div className="bg-[#F4F3EF] rounded-sm p-4 border border-[#D8D5CC]">
                <h4 className="text-sm font-semibold text-[#5C5A54] mb-4">
                  Financial Aid Package
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                      Athletic Scholarship %
                    </label>
                    <input
                      type="number"
                      value={formData.athleticScholarshipPct || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          athleticScholarshipPct:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                      Merit Aid (Low Estimate)
                    </label>
                    <input
                      type="number"
                      value={formData.meritAidEstimate?.low || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meritAidEstimate: {
                            ...formData.meritAidEstimate,
                            low: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                      Merit Aid (High Estimate)
                    </label>
                    <input
                      type="number"
                      value={formData.meritAidEstimate?.high || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meritAidEstimate: {
                            ...formData.meritAidEstimate,
                            high: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                      placeholder="10000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                      Override Merit Aid Amount (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.meritAidOverride || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meritAidOverride:
                            e.target.value === ''
                              ? undefined
                              : parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                      placeholder="Leave blank to use estimate"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                      Your Annual Contribution
                    </label>
                    <input
                      type="number"
                      value={formData.annualContribution || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          annualContribution:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                      placeholder="5000"
                    />
                  </div>
                </div>
              </div>

              {/* Tuition Inflation & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                    Tuition Inflation Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.tuitionInflationRate || 3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tuitionInflationRate:
                          parseFloat(e.target.value) || 3,
                      })
                    }
                    className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                  >
                    <option value="interested">Interested</option>
                    <option value="offer_received">Offer Received</option>
                    <option value="visit_scheduled">Visit Scheduled</option>
                    <option value="committed">Committed</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                    Confidence Tier
                  </label>
                  <select
                    value={formData.confidenceTier || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confidenceTier: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                  >
                    <option value="speculative">Speculative</option>
                    <option value="verbal">Verbal</option>
                    <option value="written">Written</option>
                    <option value="signed">Signed</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-[#5C5A54] mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#D8D5CC] rounded-sm focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB] focus:ring-opacity-10 outline-none"
                  placeholder="Add notes about this offer..."
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#D8D5CC] p-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedOffer(null);
                }}
                className="px-6 py-2 border border-[#D8D5CC] text-[#1A1916] font-medium rounded-sm hover:bg-[#F4F3EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={
                  showEditModal ? handleEditOffer : handleAddOffer
                }
                className="px-6 py-2 bg-[#1A56DB] text-white font-medium rounded-sm hover:opacity-90 transition-opacity"
              >
                {showEditModal ? 'Update Offer' : 'Add Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
