import React from "react";
import { Link } from "react-router-dom";
import "./common.css";

const TermsOfService: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>

        <div className="glass-card" style={{ padding: "3rem" }}>
          <h1 className="page-title">Terms of Service</h1>

          <div className="content-section">
            <h2 className="section-title">1. Acceptance of Terms</h2>
            <p className="section-text">
              By accessing and using MirrorMe, you accept and agree to be bound
              by the terms and provision of this agreement. If you do not agree
              to these terms, please do not use the service.
            </p>

            <h2 className="section-title">2. Description of Service</h2>
            <p className="section-text">
              MirrorMe is a digital identity reflection platform that analyzes
              your browsing behavior to provide insights into your online
              presence and digital footprint.
            </p>

            <h2 className="section-title">3. Privacy and Data Collection</h2>
            <p className="section-text">
              We only collect metadata from your browsing patterns, never actual
              content. All data processing happens locally on your device when
              possible.
            </p>
            <ul className="support-resources-list">
              <li className="support-resources-item">
                We analyze browsing patterns and metadata only
              </li>
              <li className="support-resources-item">
                Personal content is never stored or transmitted
              </li>
              <li className="support-resources-item">
                You maintain full control over your data
              </li>
              <li className="support-resources-item">
                You can delete your account and data at any time
              </li>
            </ul>

            <h2 className="section-title">4. User Responsibilities</h2>
            <p className="section-text">
              You are responsible for maintaining the confidentiality of your
              account and password and for restricting access to your computer.
            </p>

            <h2 className="section-title">5. Prohibited Uses</h2>
            <p className="section-text">
              You may not use MirrorMe for any unlawful purpose or to solicit
              others to perform unlawful acts.
            </p>

            <h2 className="section-title">6. Limitation of Liability</h2>
            <p className="section-text">
              MirrorMe shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of the service.
            </p>

            <h2 className="section-title">7. Changes to Terms</h2>
            <p className="section-text">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting to the website.
            </p>

            <h2 className="section-title">8. Contact Information</h2>
            <p className="section-text">
              If you have any questions about these Terms of Service, please
              contact us at legal@mirrorme.com.
            </p>

            <div className="support-bottom-text">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              <br />
              These terms are effective immediately and apply to all users of
              the MirrorMe platform.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
