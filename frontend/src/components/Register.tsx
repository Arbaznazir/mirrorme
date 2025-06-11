import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import "./Register.css";

const Register: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName);
    } catch (err: any) {
      // Handle different error formats
      let errorMessage = "Failed to create account";

      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          // Handle validation errors array
          errorMessage = err.response.data.detail
            .map((e: any) => e.msg || e.message || String(e))
            .join(", ");
        } else {
          // Handle object errors
          errorMessage = JSON.stringify(err.response.data.detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        {/* Header */}
        <div className="register-header">
          <Link to="/" className="register-brand-link">
            <div className="logo-container register-logo">
              <img src="/logo.png" alt="MirrorMe" className="logo-image" />
            </div>
            <div>
              <h1 className="register-brand-title">MirrorMe</h1>
              <p className="register-brand-subtitle">
                Digital Identity Platform
              </p>
            </div>
          </Link>

          <h2 className="register-title">Join MirrorMe</h2>
          <p className="register-subtitle">
            Start your digital identity journey today
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card register-form-card">
          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="register-error">
                <div className="register-error-content">
                  <span className="register-error-icon">⚠️</span>
                  {error}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Create a password (min. 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Confirm your password"
              />
            </div>

            <div className="register-terms-group">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="register-terms-checkbox"
                required
              />
              <label htmlFor="acceptTerms" className="register-terms-label">
                I agree to the{" "}
                <Link to="/terms-of-service" className="register-terms-link">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="register-terms-link">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary register-submit-button"
            >
              {loading ? (
                <div className="register-loading">
                  <div className="register-spinner"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="divider">
              <span className="divider-text">Or sign up with</span>
            </div>

            <div className="social-buttons">
              <button className="social-button">
                <img
                  src="/google.png"
                  alt="Google"
                  className="register-social-icon"
                />
                Google
              </button>
              <button className="social-button">
                <img
                  src="/facebook.png"
                  alt="Facebook"
                  className="register-social-icon"
                />
                Facebook
              </button>
            </div>
          </form>

          <div className="register-login-link">
            Already have an account?{" "}
            <Link to="/login" className="register-login-anchor">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
