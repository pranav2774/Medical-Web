import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">{title}</h2>
    <div className="text-gray-600 space-y-3 leading-relaxed">{children}</div>
  </section>
);

const CancellationPolicy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Cancellation Policy</h1>
          <p className="text-gray-500 mt-1 text-sm">Last updated: March 2026 &nbsp;·&nbsp; Applicable to all pickup pre-orders placed through this platform.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">

          <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-lg text-sm text-green-900">
            <strong>No advance payment is collected online.</strong> Since all payments are made in cash at pickup, there is no refund process for online transactions. This policy covers order cancellations and the exchange process for incorrect or damaged medicines.
          </div>

          <Section title="1. Customer-Initiated Cancellation">
            <p>You may cancel your pickup order under the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Before confirmation (Status: Pending):</strong> You may cancel your order at any time before it is confirmed by our pharmacist. To cancel, call us at <a href="tel:+919637685171" className="text-primary-600 underline">+91 96376 85171</a> or email <a href="mailto:sonsalesunil5@gmail.com" className="text-primary-600 underline">sonsalesunil5@gmail.com</a>.
              </li>
              <li>
                <strong>After confirmation (Status: Confirmed / Packed / Ready for Pickup):</strong> Once your order has been confirmed and medicines have been packed, we are unable to cancel it. The medicines are prepared exclusively for your order and cannot be restocked once dispensed.
              </li>
              <li>
                <strong>Customer No-Show:</strong> If you do not pick up a confirmed order within 24 hours of your selected pickup time without prior notice, your order may be cancelled. We will attempt to contact you on the registered phone number before cancelling.
              </li>
            </ul>
          </Section>

          <Section title="2. Store-Initiated Cancellation">
            <p>Morya Medical may cancel your order in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Out of Stock:</strong> If one or more medicines in your order are unavailable at the time of processing, we will contact you to offer an alternative or cancel the affected item(s).</li>
              <li><strong>Invalid / Missing Prescription:</strong> If you are unable to produce a valid original prescription for a Schedule H/H1 medicine at the time of pickup, we will cancel that item.</li>
              <li><strong>Regulatory / Safety Concerns:</strong> If our pharmacist determines that dispensing a medicine would be unsafe or non-compliant with applicable pharmaceutical law.</li>
            </ul>
            <p>There is no financial charge to you for any store-initiated cancellation, since no advance payment is collected.</p>
          </Section>

          <Section title="3. Wrong or Damaged Medicine at Pickup">
            <p>If you receive an incorrect medicine or a medicine with a damaged/tampered seal at the time of pickup:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Report immediately:</strong> Please check your order before leaving the store. Discrepancies should be reported to our pharmacist on the spot.</li>
              <li><strong>Report within 24 hours:</strong> If you discover the issue after reaching home, contact us within 24 hours of pickup at +91 96376 85171 or <a href="mailto:sonsalesunil5@gmail.com" className="text-primary-600 underline">sonsalesunil5@gmail.com</a>.</li>
              <li><strong>Exchange process:</strong> Return the incorrect/damaged item to our store with your order confirmation. We will exchange it free of charge, subject to stock availability.</li>
              <li>Reports made after 24 hours of pickup may not be eligible for exchange, as we cannot verify the condition of the medicine after leaving our custody.</li>
            </ul>
          </Section>

          <Section title="4. Expired Medicine">
            <p>If you discover that a medicine dispensed by us has an expiry date that has already passed at the time of purchase, you are entitled to a full exchange at no cost. Please return the medicine with proof of purchase (order confirmation from this website / our receipt). There is no time limit for reporting an expired medicine disclosure.</p>
          </Section>

          <Section title="5. Grievance Escalation">
            <p>If your concern is not resolved satisfactorily, you may escalate to our Grievance Officer:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <p className="font-semibold text-gray-900 mb-1">Grievance Officer — Morya Medical</p>
              <p>Name: Sunil Sonsale</p>
              <p>Email: <a href="mailto:sonsalesunil5@gmail.com" className="text-primary-600 underline">sonsalesunil5@gmail.com</a></p>
              <p>Phone: +91 96376 85171</p>
              <p className="mt-2 text-sm text-gray-500">We will acknowledge your complaint within <strong>48 hours</strong> and resolve it within <strong>30 days</strong> as required by the Consumer Protection Act, 2019.</p>
            </div>
            <p className="mt-3">You may also approach the <strong>District Consumer Disputes Redressal Commission, Beed, Maharashtra</strong> if your grievance is not resolved within 30 days.</p>
          </Section>

          <Section title="6. Contact Us">
            <p>For any cancellation or exchange request, contact:</p>
            <ul className="list-disc pl-6">
              <li>Phone: <a href="tel:+919637685171" className="text-primary-600 underline">+91 96376 85171</a></li>
              <li>Email: <a href="mailto:sonsalesunil5@gmail.com" className="text-primary-600 underline">sonsalesunil5@gmail.com</a></li>
              <li>Store Hours: Mon–Sat: 9:00 AM – 9:00 PM · Sunday: 10:00 AM – 6:00 PM</li>
            </ul>
          </Section>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-10 flex gap-4 text-sm">
        <Link to="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</Link>
        <Link to="/terms-of-use" className="text-primary-600 hover:underline">Terms of Use</Link>
      </div>
    </div>
  );
};

export default CancellationPolicy;
