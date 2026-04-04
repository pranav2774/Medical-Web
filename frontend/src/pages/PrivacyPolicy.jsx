import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">{title}</h2>
    <div className="text-gray-600 space-y-3 leading-relaxed">{children}</div>
  </section>
);

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 mt-1 text-sm">Last updated: March 2026 &nbsp;·&nbsp; Effective for all users of Morya Medical online pre-ordering system.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">

          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            This Privacy Policy is prepared in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and
            the <strong>Information Technology Act, 2000</strong> of India. By using our website, you agree to the terms of this policy.
          </div>

          <Section title="1. Who We Are">
            <p>Morya Medical ("we", "our", "the Store") is a licensed retail pharmacy located at Shop No. 7, Tejas Complex, Limbadevi Phata, Ukhanda, Beed, Maharashtra – 414205. This website is a <strong>pre-order pickup platform</strong> that allows customers to browse our medicine catalog and place pickup orders. We are not an online pharmacy. All medicines are dispensed in-store by our registered pharmacist.</p>
            <p>For all privacy matters, contact us at: <a href="mailto:sonsalesunil5@gmail.com" className="text-primary-600 underline">sonsalesunil5@gmail.com</a></p>
          </Section>

          <Section title="2. What Personal Data We Collect">
            <p>We collect the following categories of personal data when you register and use our service:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Identity & Contact:</strong> Full name, email address, phone number, delivery/billing address</li>
              <li><strong>Account Data:</strong> Password (stored in hashed form, never readable), email verification status</li>
              <li><strong>Order Data:</strong> List of medicines ordered, quantities, pickup date/time, order status</li>
              <li><strong>Health Data:</strong> Prescription images uploaded for medicines that require a prescription</li>
              <li><strong>Technical Data:</strong> IP address, browser type, pages visited (server logs only; we do not use tracking cookies)</li>
              <li><strong>Preferences:</strong> Notification settings saved to your account</li>
            </ul>
            <p className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded">⚠️ <strong>Prescription images are health data</strong> — the most sensitive category. They are stored securely and accessed only by the store's registered pharmacist for the purpose of verifying your order.</p>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>We use your personal data <strong>only</strong> for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Creating and managing your account</li>
              <li>Processing and managing your pickup orders</li>
              <li>Sending order confirmation and status update emails (if you have opted in)</li>
              <li>Verifying your prescription with our pharmacist before dispensing restricted medicines</li>
              <li>Complying with legal obligations under Indian pharmaceutical law</li>
              <li>Responding to your queries or grievances</li>
            </ul>
            <p>We <strong>do not</strong> sell, rent, or share your personal data with any third party for marketing purposes.</p>
          </Section>

          <Section title="4. How We Share Your Data">
            <p>Your data is shared only in the following limited circumstances:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>With our registered pharmacist:</strong> To verify prescriptions and prepare your order</li>
              <li><strong>With cloud service providers:</strong> We use ImageKit (imagekit.io) to securely store prescription images and receipts. ImageKit processes data only on our behalf.</li>
              <li><strong>With email service providers:</strong> We use Resend to dispatch verification and order notification emails.</li>
              <li><strong>When required by law:</strong> If compelled by a valid court order, government authority, or Drug Controller directive under Indian law</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account data:</strong> Retained until you delete your account or we become aware the account is inactive for 3+ years</li>
              <li><strong>Order records:</strong> Retained for 5 years from order date (required by pharmaceutical record-keeping law)</li>
              <li><strong>Prescription images:</strong> Retained for 1 year after the related order is completed, then permanently deleted</li>
              <li><strong>Server logs:</strong> Retained for 90 days for security monitoring</li>
            </ul>
          </Section>

          <Section title="6. Your Rights Under the DPDP Act, 2023">
            <p>As a data principal under Indian law, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right to Access:</strong> Request a summary of what personal data we hold about you</li>
              <li><strong>Right to Correction:</strong> Update your profile information at any time via your account settings</li>
              <li><strong>Right to Erasure:</strong> Delete your account and personal data via Settings → Delete My Account. We will anonymize your order records to comply with pharmaceutical record-keeping requirements.</li>
              <li><strong>Right to Grievance:</strong> Lodge a complaint with our Grievance Officer (see Section 9) or with the Data Protection Board of India</li>
              <li><strong>Right to Withdraw Consent:</strong> Unsubscribe from promotional emails at any time via account settings</li>
            </ul>
          </Section>

          <Section title="7. Data Security">
            <p>We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All passwords are hashed using bcrypt (cost factor 12) — never stored in plain text</li>
              <li>All communication between your browser and our server is encrypted over HTTPS/TLS</li>
              <li>API access is protected by JWT authentication tokens with a 7-day expiry</li>
              <li>Our servers implement rate limiting, NoSQL injection protection, and Content Security Policy headers</li>
              <li>Prescription images are stored on a private access-controlled storage service</li>
            </ul>
            <p>In the event of a data breach affecting your personal data, we will notify you and report to the Data Protection Board of India as required under the DPDP Act, 2023.</p>
          </Section>

          <Section title="8. Cookies">
            <p>This website does not use tracking cookies or third-party analytics. We use browser <code className="bg-gray-100 px-1 rounded">localStorage</code> to store your login session and notification preferences. This data remains on your device and is cleared when you log out or delete your account.</p>
          </Section>

          <Section title="9. Grievance Officer">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-1">Grievance Officer — Morya Medical</p>
              <p>Name: Sunil Sonsale</p>
              <p>Email: <a href="mailto:sonsalesunil5@gmail.com" className="text-primary-600 underline">sonsalesunil5@gmail.com</a></p>
              <p>Phone: +91 96376 85171</p>
              <p>Address: Shop No. 7, Tejas Complex, Limbadevi Phata, Ukhanda, Beed, Maharashtra – 414205</p>
              <p className="mt-2 text-sm text-gray-500">We will acknowledge your complaint within <strong>48 hours</strong> and resolve it within <strong>30 days</strong>, in accordance with the Consumer Protection Act, 2019.</p>
            </div>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. Continued use of the website after changes implies acceptance of the updated policy. For significant changes, we will notify you by email.</p>
          </Section>

        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-4xl mx-auto px-4 pb-10 flex gap-4 text-sm">
        <Link to="/terms-of-use" className="text-primary-600 hover:underline">Terms of Use</Link>
        <Link to="/cancellation-policy" className="text-primary-600 hover:underline">Cancellation Policy</Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
