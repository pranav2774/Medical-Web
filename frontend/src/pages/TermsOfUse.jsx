import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">{title}</h2>
    <div className="text-gray-600 space-y-3 leading-relaxed">{children}</div>
  </section>
);

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
          <p className="text-gray-500 mt-1 text-sm">Last updated: March 2026 &nbsp;·&nbsp; Please read these terms carefully before using this platform.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">

          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            <strong>Important:</strong> This website is a <strong>pre-order and pickup management platform</strong> for Morya Medical retail pharmacy. It is <strong>not an online pharmacy</strong>. No medicines are dispatched by post or courier. All orders must be collected in person from our store.
          </div>

          <Section title="1. Acceptance of Terms">
            <p>By registering an account or placing a pickup order on this website, you agree to be bound by these Terms of Use. If you do not agree, please do not use this platform. These terms are governed by the laws of India, and disputes shall be subject to the jurisdiction of courts in <strong>Beed, Maharashtra</strong>.</p>
          </Section>

          <Section title="2. Nature of the Service">
            <p>Morya Medical's website is a <strong>pickup pre-ordering system</strong>. It allows you to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Browse our available medicine catalog</li>
              <li>Place a pre-order for medicines to be picked up at our store</li>
              <li>Upload prescription images for restricted medicines (for initial screening only)</li>
              <li>Track the status of your pickup order</li>
            </ul>
            <p>This platform <strong>does not</strong> constitute an online pharmacy under the Drugs and Cosmetics Act, 1940 or the Draft E-Pharmacy Rules, 2018. Medicines are prepared and dispensed exclusively by our <strong>Registered Pharmacist</strong> at our physical store premises.</p>
          </Section>

          <Section title="3. Eligibility">
            <ul className="list-disc pl-6 space-y-1">
              <li>You must be at least <strong>18 years of age</strong> to register. Users under 18 may place orders only with parental consent and supervision.</li>
              <li>You must provide accurate, complete, and current information during registration.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials. Do not share your password.</li>
            </ul>
          </Section>

          <Section title="4. Prescription Medicines">
            <p>Certain medicines in our catalog are classified as <strong>Schedule H / H1 drugs</strong> under the Drugs and Cosmetics Act, 1940 and require a valid prescription from a registered medical practitioner.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may upload a prescription image during checkout as a preliminary screening step. This does <strong>not</strong> constitute a verified prescription.</li>
              <li><strong>Prescription verification is mandatory and happens physically at the time of pickup</strong>. You must bring your original prescription to the store.</li>
              <li>If you do not produce a valid prescription at pickup, we reserve the right to refuse dispensing the prescription medicine.</li>
              <li>By uploading a prescription, you confirm that it is genuine and issued by a registered medical practitioner in India. Submission of a forged prescription is a criminal offence under Indian law.</li>
            </ul>
          </Section>

          <Section title="5. Order Placement and Confirmation">
            <ul className="list-disc pl-6 space-y-2">
              <li>Placing an order does <strong>not</strong> guarantee availability. Orders are subject to stock confirmation by our pharmacist.</li>
              <li>We will notify you (via the order status on this platform and/or phone) if your order cannot be fulfilled.</li>
              <li>No advance payment is collected through this website. Payment is made at the store in cash at the time of pickup.</li>
            </ul>
          </Section>

          <Section title="6. Cancellation of Orders">
            <p>Please refer to our <Link to="/cancellation-policy" className="text-primary-600 underline">Cancellation Policy</Link> for full details. In summary:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You may cancel a pending (unconfirmed) order by calling us at +91 96376 85171.</li>
              <li>Once an order is confirmed and packed, it may not be cancelled.</li>
              <li>If we are unable to fulfill your order, we will cancel it at no cost to you.</li>
            </ul>
          </Section>

          <Section title="7. Prohibited Uses">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submit false or fraudulent prescription images</li>
              <li>Attempt to circumvent any security or access control mechanism</li>
              <li>Use automated scripts, bots, or scrapers on this platform</li>
              <li>Resell or redistribute medicines obtained from this store for commercial purposes</li>
              <li>Use this platform to order controlled or prohibited substances without a valid prescription</li>
            </ul>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>To the maximum extent permitted by Indian law:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Morya Medical is not liable for adverse reactions to medicines dispensed according to a valid prescription from a registered doctor.</li>
              <li>We are not responsible for delays in pickup caused by stock shortages, regulatory inspections, or force majeure events.</li>
              <li>Our aggregate liability for any claim arising from use of this platform shall not exceed the value of the disputed order.</li>
            </ul>
          </Section>

          <Section title="9. Intellectual Property">
            <p>All content on this website — including the Morya Medical logo, design, and text — is the property of Morya Medical. You may not reproduce, copy, or distribute any content from this website without written permission.</p>
          </Section>

          <Section title="10. Governing Law & Dispute Resolution">
            <p>These Terms of Use are governed by the laws of India. Any dispute arising from these terms shall first be referred to our Grievance Officer for resolution. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts in <strong>Beed District, Maharashtra</strong>.</p>
            <p>Consumer disputes may also be referred to the appropriate Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.</p>
          </Section>

          <Section title="11. Changes to These Terms">
            <p>We reserve the right to amend these Terms of Use at any time. The "Last updated" date at the top of this page reflects the most recent changes. Continued use of the platform constitutes acceptance of the revised terms.</p>
          </Section>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-10 flex gap-4 text-sm">
        <Link to="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</Link>
        <Link to="/cancellation-policy" className="text-primary-600 hover:underline">Cancellation Policy</Link>
      </div>
    </div>
  );
};

export default TermsOfUse;
