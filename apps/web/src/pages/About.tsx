import React from 'react';
import Layout from '../components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#1A1916] mb-4">
            About AthletiCap
          </h1>
          <p className="text-lg text-[#5C5A54]">
            Recruitment Finance Intelligence for Student Athletes
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white border border-[#D8D5CC] rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1A1916] mb-3">
              Our Mission
            </h2>
            <p className="text-[#5C5A54] leading-relaxed">
              AthletiCap empowers student athletes and their families to make informed financial decisions during the college recruitment process. We combine financial planning tools with recruitment tracking to provide a complete picture of opportunity costs, scholarship value, and long-term financial commitment.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1A1916] mb-3">
              What We Do
            </h2>
            <ul className="space-y-3 text-[#5C5A54]">
              <li className="flex gap-3">
                <span className="text-[#1A56DB] font-bold">•</span>
                <span><strong>Track Recruitment Expenses</strong> - Monitor spending on showcases, camps, training, and recruiting services</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1A56DB] font-bold">•</span>
                <span><strong>Manage Coach Contacts</strong> - Stay organized with pipeline tracking across all recruited schools</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1A56DB] font-bold">•</span>
                <span><strong>Compare Offers</strong> - Analyze financial aid packages and 4-year cost projections</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1A56DB] font-bold">•</span>
                <span><strong>Financial Readiness Assessment</strong> - Evaluate affordability of offers based on family capacity</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1A56DB] font-bold">•</span>
                <span><strong>Milestone Planning</strong> - Stay on track with sport-specific recruiting milestones</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1A1916] mb-3">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F4F3EF] rounded-lg">
                <h3 className="font-semibold text-[#1A1916] mb-2">Mission Control Dashboard</h3>
                <p className="text-sm text-[#5C5A54]">Real-time overview of recruitment expenses, pipeline, and top offers</p>
              </div>
              <div className="p-4 bg-[#F4F3EF] rounded-lg">
                <h3 className="font-semibold text-[#1A1916] mb-2">Financial Analysis</h3>
                <p className="text-sm text-[#5C5A54]">Compare net costs, scholarships, and family contributions across offers</p>
              </div>
              <div className="p-4 bg-[#F4F3EF] rounded-lg">
                <h3 className="font-semibold text-[#1A1916] mb-2">Coach Intelligence</h3>
                <p className="text-sm text-[#5C5A54]">Track communication with coaches across divisions and regions</p>
              </div>
              <div className="p-4 bg-[#F4F3EF] rounded-lg">
                <h3 className="font-semibold text-[#1A1916] mb-2">Affordability Scoring</h3>
                <p className="text-sm text-[#5C5A54]">Evaluate offers based on family financial profile and constraints</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1A1916] mb-3">
              Why AthletiCap?
            </h2>
            <p className="text-[#5C5A54] leading-relaxed mb-4">
              The recruitment process is complex and expensive. Most families don't realize how much they're spending until offers arrive. AthletiCap helps you:
            </p>
            <ul className="space-y-2 text-[#5C5A54]">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Understand the true cost of recruitment</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Make data-driven decisions about college selection</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Evaluate scholarship value objectively</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Plan for 4-year financial commitment</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Stay organized throughout the recruiting cycle</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1A1916] mb-3">
              Version
            </h2>
            <p className="text-[#5C5A54]">
              AthletiCap v1.0.0 - Recruitment Finance Intelligence Platform
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
