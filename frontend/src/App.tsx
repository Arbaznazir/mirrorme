import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import Support from "./components/Support";
import "./components/App.css";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const LandingPage: React.FC = () => {
  return (
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <div className="nav-logo logo-container app-nav-logo">
              <img src="/logo.png" alt="MirrorMe" className="logo-image" />
            </div>
            <div>
              <h1 className="nav-title">MirrorMe</h1>
              <p className="nav-subtitle">Digital Identity Platform</p>
            </div>
          </Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-logo logo-container app-hero-logo">
            <img src="/logo.png" alt="MirrorMe" className="logo-image" />
          </div>

          <h1 className="hero-title">
            Discover Your{" "}
            <span className="hero-gradient">Digital Identity</span>
          </h1>

          <p className="hero-subtitle">
            Understand your online behavior through privacy-first AI analysis.
            Gain insights while keeping your data secure and under your control.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Start Your Journey →
            </Link>
            <button
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-secondary"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose MirrorMe?</h2>
          <p className="section-subtitle">
            Experience digital self-awareness with our cutting-edge features
          </p>

          <div className="features-grid">
            <div className="feature-card glass-card">
              <div className="feature-icon icon-primary">
                <span>🔒</span>
              </div>
              <h3 className="feature-title">Privacy First</h3>
              <p className="feature-description">
                Your data stays local. Only metadata is analyzed, never your
                actual content.
              </p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon icon-violet">
                <span>🧠</span>
              </div>
              <h3 className="feature-title">AI Insights</h3>
              <p className="feature-description">
                Advanced AI analyzes your patterns to reveal personality
                insights and trends.
              </p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon icon-emerald">
                <span>📊</span>
              </div>
              <h3 className="feature-title">Real-time Analytics</h3>
              <p className="feature-description">
                Monitor your digital behavior with beautiful visualizations and
                insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get started with MirrorMe in three simple steps
          </p>

          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number icon-rose">
                <span>1</span>
              </div>
              <h3 className="step-title">Install Extension</h3>
              <p className="step-description">
                Add our privacy-focused browser extension to start capturing
                your digital patterns.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number icon-amber">
                <span>2</span>
              </div>
              <h3 className="step-title">Generate Insights</h3>
              <p className="step-description">
                Our AI analyzes your browsing patterns and generates
                personalized insights.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number icon-violet">
                <span>3</span>
              </div>
              <h3 className="step-title">Discover Yourself</h3>
              <p className="step-description">
                Explore your digital identity through beautiful dashboards and
                insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass-card">
            <h2 className="cta-title">Ready to Discover Your Digital Self?</h2>
            <p className="cta-description">
              Join thousands of users who have gained valuable insights into
              their digital behavior.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary">
                Create Free Account
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-brand">
            <div className="footer-logo logo-container">
              <img src="/logo.png" alt="MirrorMe" className="logo-image" />
            </div>
            <span className="footer-title">MirrorMe</span>
          </div>
          <p className="footer-description">
            Privacy-first digital identity reflection through AI analysis
          </p>
          <div className="footer-links">
            <a href="/privacy-policy" className="footer-link">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="footer-link">
              Terms of Service
            </a>
            <a href="/support" className="footer-link">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
