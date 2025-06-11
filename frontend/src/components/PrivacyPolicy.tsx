import React from "react";
import { Link } from "react-router-dom";
import "./common.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>

        <div className="glass-card" style={{ padding: "3rem" }}>
          <h1 className="page-title">Privacy Policy</h1>

          <div className="content-section">
            <h2 className="section-title">1. Information We Collect</h2>
            <p className="section-text">
              MirrorMe collects only metadata from your browsing behavior to
              provide digital identity insights. We never access or store your
              actual content, personal messages, or sensitive information.
            </p>

            <h2 className="section-title">2. How We Use Your Information</h2>
            <p className="section-text">
              We use the collected metadata to generate insights about your
              digital behavior patterns, interests, and online presence. All
              processing is done to provide you with valuable self-reflection
              tools.
            </p>

            <h2 className="section-title">3. Data Security</h2>
            <p className="section-text">
              Your data security is our top priority. We implement
              industry-standard encryption and security measures to protect your
              information at all times.
            </p>

            <h2 className="section-title">4. Data Retention</h2>
            <p className="section-text">
              You have full control over your data. You can delete your account
              and all associated data at any time through your dashboard
              settings.
            </p>

            <h2 className="section-title">5. Third-Party Services</h2>
            <p className="section-text">
              We do not share your personal data with third-party services for
              advertising or marketing purposes. Any data sharing is limited to
              essential service functionality and is done with your explicit
              consent.
            </p>

            <h2 className="section-title">6. Contact Us</h2>
            <p className="section-text">
              If you have any questions about this Privacy Policy, please
              contact us at privacy@mirrorme.com.
            </p>

            <div className="support-bottom-text">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              <br />
              This privacy policy is effective immediately and applies to all
              users of the MirrorMe platform.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
