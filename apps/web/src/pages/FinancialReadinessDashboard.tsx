import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Layout from '../components/layout/Layout';
import { useToast, GlossaryTerm } from '../components/ui';
import OfferComparisonTable from '../components/OfferComparisonTable';
import FamilyCommitmentAnalyzer from '../components/FamilyCommitmentAnalyzer';
import { AffordabilityScorer, calculateAffordabilityScore } from '../components/AffordabilityScorer';
import FamilyProfile from '../components/FamilyProfile';
import { useProfile } from '../contexts/ProfileContext';
import { useFamilyProfile } from '../contexts/FamilyProfileContext';

interface Offer {
  id: string;
  schoolName: string;
  division: string;
  COA: number;
  athleticScholarshipPct: number;
  meritAidEstimate?: { low: number; high: number };
  meritAidOverride?: number;
  annualContribution: number;
  tuitionInflationRate: number;
  status: string;
}

interface FamilyProfileData {
  expectedFamilyContribution: number;
  acceptableDebtLevel: number;
  preferredLocations: string[];
  academicPriorities: string[];
  athleticPriorities: string[];
}

export default function FinancialReadinessDashboard() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showFamilyProfile, setShowFamilyProfile] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { currentProfile } = useProfile();
  const { familyProfile, updateFamilyProfile } = useFamilyProfile();

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

  const handleFamilyProfileSave = (data: FamilyProfileData) => {
    updateFamilyProfile(data);
    addToast('Family profile updated', 'success');
  };

  const getMetricsForOffer = (offer: Offer) => {
    const meritAid =
      offer.meritAidOverride ||
      (offer.meritAidEstimate
        ? (offer.meritAidEstimate.low + offer.meritAidEstimate.high) / 2
        : 0);

    // Calculate 4-year total
    let fourYearTotal = 0;
    let currentCOA = offer.COA;
    const inflationRate = offer.tuitionInflationRate || 3;
    const familyContribution = familyProfile?.expectedFamilyContribution || 0;

    for (let year = 1; year <= 4; year++) {
      if (year > 1) {
        currentCOA *= 1 + inflationRate / 100;
      }
      const yearScholarship = currentCOA * (offer.athleticScholarshipPct / 100);
      const yearNetCost = Math.max(0, currentCOA - yearScholarship - meritAid);
      const yearGap = Math.max(0, yearNetCost - familyContribution);
      fourYearTotal += yearGap;
    }

    return {
      meritAid,
      fourYearTotal,
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-[#1A56DB] border-t-transparent mb-4" />
            <p className="text-[#5C5A54]">Loading financial readiness data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const offersWithScores = offers
    .map((offer) => {
      const metrics = getMetricsForOffer(offer);
      if (!familyProfile) return { ...offer, affordabilityScore: null };

      const score = calculateAffordabilityScore({
        coa: offer.COA,
        athleticScholarshipPct: offer.athleticScholarshipPct,
        meritAid: metrics.meritAid,
        familyContribution: familyProfile.expectedFamilyContribution,
        acceptableDebtLevel: familyProfile.acceptableDebtLevel,
        fourYearTotalCost: metrics.fourYearTotal,
      });

      return { ...offer, affordabilityScore: score };
    })
    .sort((a, b) => {
      if (!a.affordabilityScore || !b.affordabilityScore) return 0;
      return b.affordabilityScore.score - a.affordabilityScore.score;
    });

  const bestOffer = offersWithScores[0];
  const recommendedOffers = offersWithScores.filter(
    (o) => o.affordabilityScore && o.affordabilityScore.score >= 5
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="section-header">
            <span className="section-number"># [1]</span> FINANCIAL READINESS DASHBOARD
          </h1>
          <button
            onClick={() => setShowFamilyProfile(true)}
            className="px-4 py-2 bg-[#1A56DB] text-white rounded text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {familyProfile ? 'Update Family Profile' : 'Set Family Profile'}
          </button>
        </div>

        {/* Family Profile Modal */}
        <FamilyProfile
          isOpen={showFamilyProfile}
          onClose={() => setShowFamilyProfile(false)}
          onSave={handleFamilyProfileSave}
          initialData={familyProfile || {}}
        />

        {/* Quick Summary */}
        {familyProfile && offers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
              <div className="text-xs font-semibold text-[#5C5A54] uppercase mb-2">
                Total Offers
              </div>
              <div className="text-3xl font-bold text-[#1A1916]">
                {offers.length}
              </div>
            </div>

            <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
              <div className="text-xs font-semibold text-[#5C5A54] uppercase mb-2">
                Affordable Options
              </div>
              <div className="text-3xl font-bold text-[#2DD09A]">
                {recommendedOffers.length}
              </div>
              <p className="text-xs text-[#8A8783] mt-2">
                Score 5+/10
              </p>
            </div>

            <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
              <div className="text-xs font-semibold text-[#5C5A54] uppercase mb-2">
                Your Annual Budget
              </div>
              <div className="text-3xl font-bold text-[#1A56DB]">
                ${(familyProfile.expectedFamilyContribution || 0).toLocaleString()}
              </div>
              <p className="text-xs text-[#8A8783] mt-2">
                Per year capacity
              </p>
            </div>

            <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
              <div className="text-xs font-semibold text-[#5C5A54] uppercase mb-2">
                Debt Tolerance
              </div>
              <div className="text-3xl font-bold text-[#1A56DB]">
                ${(familyProfile.acceptableDebtLevel || 0).toLocaleString()}
              </div>
              <p className="text-xs text-[#8A8783] mt-2">
                4-year maximum
              </p>
            </div>
          </div>
        )}

        {/* Best Offer Recommendation */}
        {bestOffer && bestOffer.affordabilityScore && (
          <div className="bg-gradient-to-r from-[#2DD09A] to-[#10B981] rounded-lg p-8 text-white">
            <div className="text-sm font-semibold uppercase mb-3 opacity-90">
              💡 Top Recommendation
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-sm opacity-90 mb-2">School</div>
                <div className="text-3xl font-bold">{bestOffer.schoolName}</div>
                <div className="text-sm opacity-90 mt-2">{bestOffer.division}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-2">Affordability Score</div>
                <div className="text-4xl font-bold">
                  {bestOffer.affordabilityScore.score}
                  <span className="text-2xl">/10</span>
                </div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-2">Best For You Because</div>
                <ul className="text-sm space-y-1 mt-2">
                  {bestOffer.affordabilityScore.reasoning.slice(0, 2).map((reason, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Missing Family Profile Warning */}
        {!familyProfile && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-4">
              <div className="flex-shrink-0 text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-[#1A1916] mb-2">
                  Set Your Family Profile for Personalized Analysis
                </h3>
                <p className="text-sm text-[#5C5A54] mb-4">
                  Add your family's financial constraints and preferences to unlock affordability scoring and personalized recommendations.
                </p>
                <button
                  onClick={() => setShowFamilyProfile(true)}
                  className="px-4 py-2 bg-[#F59E0B] text-white rounded text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Set Family Profile Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Offer Comparison Section */}
        {offers.length > 0 && (
          <div>
            <h2 className="section-header mb-6">
              <span className="section-number"># [2]</span> OFFER COMPARISON
            </h2>
            <OfferComparisonTable
              offers={offers}
              familyProfile={familyProfile || undefined}
              sortBy="affordability"
            />
          </div>
        )}

        {/* Detailed Analysis for Selected Offer */}
        {selectedOffer && (
          <div>
            <h2 className="section-header mb-6">
              <span className="section-number"># [3]</span> DETAILED ANALYSIS: {selectedOffer.schoolName.toUpperCase()}
            </h2>

            {/* Affordability Score */}
            {familyProfile && (
              <div className="mb-8">
                <AffordabilityScorer
                  score={calculateAffordabilityScore({
                    coa: selectedOffer.COA,
                    athleticScholarshipPct: selectedOffer.athleticScholarshipPct,
                    meritAid:
                      selectedOffer.meritAidOverride ||
                      (selectedOffer.meritAidEstimate
                        ? (selectedOffer.meritAidEstimate.low +
                            selectedOffer.meritAidEstimate.high) /
                          2
                        : 0),
                    familyContribution: familyProfile.expectedFamilyContribution,
                    acceptableDebtLevel: familyProfile.acceptableDebtLevel,
                    fourYearTotalCost:
                      getMetricsForOffer(selectedOffer).fourYearTotal,
                  })}
                />
              </div>
            )}

            {/* Family Commitment Analyzer */}
            <FamilyCommitmentAnalyzer
              schoolName={selectedOffer.schoolName}
              coa={selectedOffer.COA}
              athleticScholarshipPct={selectedOffer.athleticScholarshipPct}
              meritAid={
                selectedOffer.meritAidOverride ||
                (selectedOffer.meritAidEstimate
                  ? (selectedOffer.meritAidEstimate.low +
                      selectedOffer.meritAidEstimate.high) /
                    2
                  : 0)
              }
              familyContribution={
                familyProfile?.expectedFamilyContribution || 0
              }
              tuitionInflationRate={selectedOffer.tuitionInflationRate}
            />
          </div>
        )}

        {/* Decision Framework */}
        <div>
          <h2 className="section-header mb-6">
            <span className="section-number"># [4]</span> DECISION FRAMEWORK
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
              <h3 className="font-semibold text-[#1A1916] mb-4">Key Metrics to Consider</h3>
              <ul className="space-y-3 text-sm text-[#5C5A54]">
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">1.</span>
                  <div>
                    <div className="font-semibold text-[#1A1916]">Affordability Score</div>
                    <div className="text-xs">Comprehensive 1-10 rating of offer fit for your family</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">2.</span>
                  <div>
                    <div className="font-semibold text-[#1A1916]">Annual Funding Gap</div>
                    <div className="text-xs">Difference between cost and family contribution</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">3.</span>
                  <div>
                    <div className="font-semibold text-[#1A1916]">4-Year Total Commitment</div>
                    <div className="text-xs">Complete financial picture including inflation</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">4.</span>
                  <div>
                    <div className="font-semibold text-[#1A1916]">Athletic Scholarship %</div>
                    <div className="text-xs">Higher % = greater financial support</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[#D8D5CC] rounded-lg p-6">
              <h3 className="font-semibold text-[#1A1916] mb-4">Next Steps</h3>
              <ol className="space-y-3 text-sm text-[#5C5A54]">
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">1.</span>
                  <div>Confirm your family's annual contribution capacity</div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">2.</span>
                  <div>Set your maximum acceptable 4-year debt level</div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">3.</span>
                  <div>Review affordability scores for all offers</div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">4.</span>
                  <div>Select offers to analyze 4-year projections</div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#1A56DB]">5.</span>
                  <div>Make your decision based on financial readiness</div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Offer Selection Panel */}
        {offers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-[#1A1916] mb-4">
              Select an Offer for Detailed Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offersWithScores.map((offer) => (
                <button
                  key={offer.id}
                  onClick={() => setSelectedOffer(selectedOffer?.id === offer.id ? null : offer)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedOffer?.id === offer.id
                      ? 'border-[#1A56DB] bg-blue-50'
                      : 'border-[#D8D5CC] hover:border-[#1A56DB]'
                  }`}
                >
                  <div className="font-semibold text-[#1A1916] mb-2">
                    {offer.schoolName}
                  </div>
                  <div className="text-xs text-[#5C5A54] mb-3">
                    {offer.division}
                  </div>
                  {offer.affordabilityScore && (
                    <div
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-bold"
                      style={{
                        backgroundColor: offer.affordabilityScore.bgColor,
                        color: offer.affordabilityScore.color,
                      }}
                    >
                      {offer.affordabilityScore.score}
                      <span className="text-xs">/10</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
