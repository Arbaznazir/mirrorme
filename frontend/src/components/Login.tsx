import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      // Handle different error formats
      let errorMessage = "Failed to login";

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
    <div className="login-container">
      <div className="login-content">
        {/* Header */}
        <div className="login-header">
          <Link to="/" className="login-brand-link">
            <div className="logo-container login-logo">
              <img src="/logo.png" alt="MirrorMe" className="logo-image" />
            </div>
            <div>
              <h1 className="login-brand-title">MirrorMe</h1>
              <p className="login-brand-subtitle">Digital Identity Platform</p>
            </div>
          </Link>

          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">
            Sign in to access your digital identity insights
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card login-form-card">
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <div className="login-error-content">
                  <span className="login-error-icon">⚠️</span>
                  {error}
                </div>
              </div>
            )}

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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            <div className="login-form-row">
              <div className="login-checkbox-group">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="login-checkbox"
                />
                <label htmlFor="remember-me" className="login-checkbox-label">
                  Remember me
                </label>
              </div>

              <button type="button" className="login-forgot-password">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary login-submit-button"
            >
              {loading ? (
                <div className="login-loading">
                  <div className="login-spinner"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="divider">
              <span className="divider-text">Or continue with</span>
            </div>

            <div className="social-buttons">
              <button className="social-button">
                <img
                  src="/google.png"
                  alt="Google"
                  className="login-social-icon"
                />
                Google
              </button>
              <button className="social-button">
                <img
                  src="/facebook.png"
                  alt="Facebook"
                  className="login-social-icon"
                />
                Facebook
              </button>
            </div>
          </form>

          <div className="login-register-link">
            Don't have an account?{" "}
            <Link to="/register" className="login-register-anchor">
              Create one
            </Link>
          </div>

          <div className="login-terms">
            By signing in, you agree to our{" "}
            <Link to="/terms-of-service" className="login-terms-link">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="login-terms-link">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
