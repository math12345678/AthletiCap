import React, { useState } from 'react';
import Layout from '../components/layout/Layout';

export default function Legal() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  const tabs = [
    { id: 'terms', label: 'Terms of Service' },
    { id: 'privacy', label: 'Privacy Policy' },
  ];

  return (
    <Layout>
      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#1A1916] mb-2">
            Legal
          </h1>
          <p className="text-lg text-[#5C5A54]">
            Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#D8D5CC]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-[#1A56DB] border-b-2 border-[#1A56DB]'
                  : 'text-[#5C5A54] hover:text-[#1A1916]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white border border-[#D8D5CC] rounded-lg p-8 space-y-6">
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#1A1916]">
                Terms of Service
              </h2>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  1. Acceptance of Terms
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  By accessing and using AthletiCap, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  2. Use License
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  Permission is granted to temporarily download one copy of the materials (information or software) on AthletiCap for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="mt-3 space-y-2 text-[#5C5A54] ml-4">
                  <li>• Modifying or copying the materials</li>
                  <li>• Using the materials for any commercial purpose or for any public display</li>
                  <li>• Attempting to decompile or reverse engineer any software contained on the site</li>
                  <li>• Removing any copyright or other proprietary notations from the materials</li>
                  <li>• Transferring the materials to another person or "mirroring" the materials on any other server</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  3. Disclaimer
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  The materials on AthletiCap are provided on an 'as is' basis. AthletiCap makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  4. Limitations
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  In no event shall AthletiCap or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AthletiCap.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  5. Accuracy of Materials
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  The materials appearing on AthletiCap could include technical, typographical, or photographic errors. AthletiCap does not warrant that any of the materials on its Internet web site are accurate, complete, or current. AthletiCap may make changes to the materials contained on its web site at any time without notice.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  6. Modifications
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  AthletiCap may revise these terms of service for its web site at any time without notice. By using this web site you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  7. Governing Law
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-[#1A1916]">
                Privacy Policy
              </h2>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  1. Introduction
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  AthletiCap is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and website.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  2. Information We Collect
                </h3>
                <p className="text-[#5C5A54] leading-relaxed mb-3">
                  We may collect information about you in a variety of ways. The information we may collect on the site includes:
                </p>
                <div className="ml-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-[#1A1916]">Personal Data:</h4>
                    <p className="text-[#5C5A54]">Name, email address, phone number, graduation year, sport, GPA, test scores</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1916]">Financial Data:</h4>
                    <p className="text-[#5C5A54]">Budget information, expense tracking, scholarship details, family contribution amounts</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1916]">Recruitment Data:</h4>
                    <p className="text-[#5C5A54]">Coach contacts, school information, offer details, milestones, preferences</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  3. Use of Your Information
                </h3>
                <p className="text-[#5C5A54] leading-relaxed mb-3">
                  Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:
                </p>
                <ul className="space-y-2 text-[#5C5A54] ml-4">
                  <li>• Generate and track recruitment and financial metrics</li>
                  <li>• Provide analytics and insights about offers and expenses</li>
                  <li>• Help you compare schools and make informed decisions</li>
                  <li>• Improve and optimize our services</li>
                  <li>• Communicate with you about changes to our policies</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  4. Protection of Your Information
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  We use administrative, technical, and physical security measures to protect your personal information. However, perfect security does not exist on the Internet. If you have any questions about security on our website, you can contact us at support@athleticap.app.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  5. Disclosure of Your Information
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may share generic aggregated demographic information not linked to any personal identification information regarding visitor and user preferences with our business partners.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  6. Contact Us
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  If you have questions or comments about this Privacy Policy, please contact us at:
                </p>
                <p className="text-[#5C5A54] mt-2">
                  Email: privacy@athleticap.app<br />
                  Website: athleticap.app
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1A1916] mb-2">
                  7. Changes to Privacy Policy
                </h3>
                <p className="text-[#5C5A54] leading-relaxed">
                  AthletiCap reserves the right to make changes to this Privacy Policy at any time. Any changes to this Privacy Policy will be communicated by updating the "Last Modified" date of this Privacy Policy, and your continued use of the site will signify your acceptance of the updated Privacy Policy.
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-[#D8D5CC]">
                <p className="text-sm text-[#8A8783]">
                  Last Modified: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
