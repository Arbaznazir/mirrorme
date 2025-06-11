import React from "react";
import { Link } from "react-router-dom";
import "./common.css";
import "./Support.css";

const Support: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>

        <div className="glass-card" style={{ padding: "3rem" }}>
          <h1 className="page-title">Support Center</h1>

          <div className="content-section">
            <h2 className="section-title">Get Help</h2>
            <p className="section-text">
              Welcome to the MirrorMe Support Center. We're here to help you get
              the most out of your digital identity reflection experience. Find
              answers to common questions or get in touch with our support team.
            </p>

            <h2 className="section-title">Frequently Asked Questions</h2>

            <div className="mb-8">
              <h3 className="section-subtitle">
                How does MirrorMe protect my privacy?
              </h3>
              <p className="section-text-small">
                MirrorMe only analyzes metadata from your browsing patterns,
                never your actual content. All data processing happens locally
                on your device, and we use end-to-end encryption for any data
                that needs to be transmitted.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="section-subtitle">
                How do I install the browser extension?
              </h3>
              <p className="section-text-small">
                After creating your account, you'll be provided with
                installation instructions for your specific browser. The
                extension is available for Chrome, Firefox, Safari, and Edge.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="section-subtitle">
                What kind of insights will I receive?
              </h3>
              <p className="section-text-small">
                MirrorMe provides insights into your digital behavior patterns,
                interests, personality traits, and online habits. All insights
                are generated using advanced AI while maintaining your privacy.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="section-subtitle">Can I delete my data?</h3>
              <p className="section-text-small">
                Yes, you have full control over your data. You can delete your
                account and all associated data at any time from your dashboard
                settings.
              </p>
            </div>

            <h2 className="section-title">Contact Support</h2>
            <p className="section-text">
              Need additional help? Our support team is here to assist you.
            </p>

            <div className="support-contact-grid">
              <div className="support-contact-card">
                <h3 className="support-contact-title">📧 Email Support</h3>
                <p className="support-contact-description">
                  For general inquiries and technical support
                </p>
                <a
                  href="mailto:support@mirrorme.com"
                  className="support-contact-link"
                >
                  support@mirrorme.com
                </a>
              </div>

              <div className="support-contact-card">
                <h3 className="support-contact-title">💬 Live Chat</h3>
                <p className="support-contact-description">
                  Available Monday-Friday, 9 AM - 6 PM PST
                </p>
                <button className="btn-primary">Start Chat</button>
              </div>

              <div className="support-contact-card">
                <h3 className="support-contact-title">📞 Phone Support</h3>
                <p className="support-contact-description">
                  For urgent technical issues
                </p>
                <a href="tel:+1-555-0123" className="support-contact-link">
                  +1 (555) 012-3456
                </a>
              </div>

              <div className="support-contact-card">
                <h3 className="support-contact-title">🐛 Bug Reports</h3>
                <p className="support-contact-description">
                  Report bugs and technical issues
                </p>
                <a
                  href="mailto:bugs@mirrorme.com"
                  className="support-contact-link"
                >
                  bugs@mirrorme.com
                </a>
              </div>
            </div>

            <h2 className="section-title">Resources</h2>
            <p className="section-text">
              Explore our comprehensive resources to get the most out of
              MirrorMe.
            </p>

            <ul className="support-resources-list">
              <li className="support-resources-item">
                <a href="/getting-started" className="support-resources-link">
                  Getting Started Guide
                </a>{" "}
                - Learn the basics of setting up your account
              </li>
              <li className="support-resources-item">
                <a href="/user-manual" className="support-resources-link">
                  User Manual
                </a>{" "}
                - Comprehensive guide to all features
              </li>
              <li className="support-resources-item">
                <a href="/privacy-guide" className="support-resources-link">
                  Privacy & Security Guide
                </a>{" "}
                - Understanding how we protect your data
              </li>
              <li className="support-resources-item">
                <a href="/api-docs" className="support-resources-link">
                  API Documentation
                </a>{" "}
                - For developers wanting to integrate with MirrorMe
              </li>
            </ul>

            <div className="support-bottom-text">
              <strong>Need immediate assistance?</strong>
              <br />
              Our support team typically responds within 24 hours. For urgent
              issues, please use our live chat or phone support during business
              hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
