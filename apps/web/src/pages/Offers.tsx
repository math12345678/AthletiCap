import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/layout/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [projections, setProjections] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [inflationRate, setInflationRate] = useState(0.04);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    schoolName: '',
    division: 'D1',
    athleticScholarshipPct: 0,
    meritAidRangeLow: 5000,
    meritAidRangeHigh: 10000,
    annualCOA: 50000,
    coaDataYear: new Date().getFullYear(),
    tuition: 30000,
    roomAndBoard: 15000,
    otherFees: 5000,
    expectedAnnualContrib: 0,
    isVerbal: false,
    confidenceLevel: 'WRITTEN',
  });

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const offersRes = await api.offers.list();
        setOffers(offersRes || []);

        // Load projections for each offer
        const projectionMap: any = {};
        for (const offer of offersRes || []) {
          try {
            const proj = await api.offers.getProjection(offer.id, inflationRate);
            projectionMap[offer.id] = proj;
          } catch (err) {
            console.error('Error loading projection:', err);
          }
        }
        setProjections(projectionMap);
      } catch (err) {
        console.error('Error loading offers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [inflationRate]);

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.offers.create({
        ...formData,
        athleticScholarshipPct: parseFloat(formData.athleticScholarshipPct.toString()),
        annualCOA: parseFloat(formData.annualCOA.toString()),
        tuition: parseFloat(formData.tuition.toString()),
        roomAndBoard: parseFloat(formData.roomAndBoard.toString()),
        otherFees: parseFloat(formData.otherFees.toString()),
      });

      setFormData({
        schoolName: '',
        division: 'D1',
        athleticScholarshipPct: 0,
        meritAidRangeLow: 5000,
        meritAidRangeHigh: 10000,
        annualCOA: 50000,
        coaDataYear: new Date().getFullYear(),
        tuition: 30000,
        roomAndBoard: 15000,
        otherFees: 5000,
        expectedAnnualContrib: 0,
        isVerbal: false,
        confidenceLevel: 'WRITTEN',
      });
      setShowAddOffer(false);

      // Reload offers
      const offersRes = await api.offers.list();
      setOffers(offersRes || []);
    } catch (err) {
      console.error('Error adding offer:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading offers...</div>
      </Layout>
    );
  }

  // Prepare chart data for comparison
  const comparisonData = selectedOffers.length >= 2 ? selectedOffers.map((offerId) => {
    const offer = offers.find((o) => o.id === offerId);
    const proj = projections[offerId];
    if (!proj || proj.length === 0) return null;
    const final = proj[3];
    return {
      schoolName: offer?.schoolName || 'Unknown',
      cumulativeDebt: final.cumulativeDebt,
    };
  }).filter(Boolean) : [];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-playfair text-gold mb-2">Financial Arbitrage Matrix</h1>
          <p className="text-text-secondary">Compare offers and calculate true net costs</p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow/10 border border-yellow rounded-lg p-4 text-sm text-yellow">
          ⚠️ Merit aid estimates are projections based on academic benchmark data. Actual aid packages are determined by individual institutions and are not guaranteed. Verify all financial decisions with your school's financial aid office.
        </div>

        {/* Inflation Rate Slider */}
        <div className="card space-y-4">
          <h3 className="font-semibold">Sensitivity Analysis</h3>
          <div>
            <label className="block text-sm mb-2">
              Tuition Inflation Rate: {(inflationRate * 100).toFixed(1)}% per year
            </label>
            <input
              type="range"
              min="0.01"
              max="0.06"
              step="0.01"
              value={inflationRate}
              onChange={(e) => setInflationRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-text-secondary mt-2">Drag to see how inflation affects 4-year projections</p>
          </div>
        </div>

        {/* Add Offer Form */}
        {showAddOffer && (
          <form onSubmit={handleAddOffer} className="card space-y-4">
            <h3 className="font-semibold">Add New Offer</h3>

            <div>
              <label className="block text-sm font-medium mb-2">School Name</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                placeholder="e.g., University of Georgia"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Division</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                >
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="NAIA">NAIA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Athletic Scholarship (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.athleticScholarshipPct * 100}
                  onChange={(e) =>
                    setFormData({ ...formData, athleticScholarshipPct: parseFloat(e.target.value) / 100 })
                  }
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tuition</label>
                <input
                  type="number"
                  value={formData.tuition}
                  onChange={(e) => setFormData({ ...formData, tuition: parseFloat(e.target.value) })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Room & Board</label>
                <input
                  type="number"
                  value={formData.roomAndBoard}
                  onChange={(e) => setFormData({ ...formData, roomAndBoard: parseFloat(e.target.value) })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Other Fees</label>
                <input
                  type="number"
                  value={formData.otherFees}
                  onChange={(e) => setFormData({ ...formData, otherFees: parseFloat(e.target.value) })}
                  className="w-full bg-bg-primary border border-border-color rounded px-3 py-2 text-text-primary"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn-primary flex-1">
                Save Offer
              </button>
              <button
                type="button"
                onClick={() => setShowAddOffer(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!showAddOffer && (
          <div className="flex justify-end">
            <button onClick={() => setShowAddOffer(true)} className="btn-primary">
              + Add Offer
            </button>
          </div>
        )}

        {/* Offers Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Offers</h2>

          {offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => {
                const proj = projections[offer.id];
                const final = proj && proj.length > 0 ? proj[3] : null;
                const netCost = final
                  ? final.netCost
                  : offer.annualCOA * (1 - offer.athleticScholarshipPct);

                return (
                  <div
                    key={offer.id}
                    className={`card cursor-pointer transition-all ${
                      selectedOffers.includes(offer.id) ? 'border-gold ring-2 ring-gold' : ''
                    }`}
                    onClick={() => {
                      setSelectedOffers(
                        selectedOffers.includes(offer.id)
                          ? selectedOffers.filter((id) => id !== offer.id)
                          : [...selectedOffers, offer.id]
                      );
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{offer.schoolName}</h3>
                        <p className="text-sm text-text-secondary">{offer.division}</p>
                      </div>
                      {offer.isVerbal && (
                        <span className="bg-yellow/20 text-yellow text-xs px-2 py-1 rounded">VERBAL</span>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Athletic Aid</span>
                        <span>{(offer.athleticScholarshipPct * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Merit Aid</span>
                        <span>
                          ${offer.meritAidRangeLow.toLocaleString()}-$
                          {offer.meritAidRangeHigh.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">COA</span>
                        <span>{formatCurrency(offer.annualCOA)}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border-color">
                      <div className="text-sm text-text-secondary mb-1">Net Cost (Year 1)</div>
                      <div className="text-2xl font-playfair text-gold">
                        {formatCurrency(netCost)}
                      </div>
                      {final && (
                        <div className="text-sm text-text-secondary mt-2">
                          4-year total: {formatCurrency(final.cumulativeDebt)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card text-center py-12 text-text-secondary">
              No offers yet. Add your first offer to compare schools!
            </div>
          )}
        </div>

        {/* Comparison Chart */}
        {comparisonData.length >= 2 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">4-Year Cost Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3D4A60" />
                <XAxis dataKey="schoolName" stroke="#8A93A8" />
                <YAxis stroke="#8A93A8" />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: '#1A1F2E',
                    border: '1px solid #3D4A60',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulativeDebt"
                  stroke="#F0A500"
                  strokeWidth={2}
                  name="4-Year Debt"
                />
              </LineChart>
            </ResponsiveContainer>

            {comparisonData.length >= 2 && (
              <div className="mt-6 p-4 bg-bg-primary rounded-lg">
                <h3 className="font-semibold text-gold mb-3">Financial Verdict</h3>
                {(() => {
                  const selected = selectedOffers.map((id) => offers.find((o) => o.id === id)).filter(Boolean);
                  if (selected.length < 2) return null;

                  const costs = selected.map((offer) => {
                    const proj = projections[offer.id];
                    return proj && proj.length > 0 ? proj[3].cumulativeDebt : 0;
                  });

                  const minIdx = costs.indexOf(Math.min(...costs));
                  const maxIdx = costs.indexOf(Math.max(...costs));
                  const savings = costs[maxIdx] - costs[minIdx];

                  return (
                    <p className="text-text-primary">
                      <span className="text-green font-semibold">{selected[minIdx].schoolName}</span> saves
                      you <span className="text-green font-semibold">{formatCurrency(savings)}</span> over 4
                      years compared to{' '}
                      <span className="text-red font-semibold">{selected[maxIdx].schoolName}</span>.
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
