import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail,
  FiArrowLeft,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const PasswordReset = () => {
  const { forgotPassword, isLoading, error, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    clearAuthError();

    if (!email) {
      setFormError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setFormError(result.error || 'Failed to send reset email');
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card reset-card">
          <div className="auth-header">
            <div className="success-icon-wrapper">
              <FiCheckCircle className="success-icon" />
            </div>
            <h1 className="auth-title">Check Your Email</h1>
            <p className="auth-subtitle">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="auth-subtitle">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
          </div>

          <div className="auth-footer">
            <Link to={ACCOUNTS_ROUTES.LOGIN} className="auth-link">
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card reset-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield className="logo-icon" />
            <span className="logo-text">Falcon PMS</span>
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {formError && (
          <div className="auth-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="form-input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="email"
                type="email"
                className={`form-input ${submitted && !email ? 'error' : ''}`}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
            {submitted && !email && (
              <span className="form-error">Email is required</span>
            )}
          </div>

          <button
            type="submit"
            className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" />
                Sending...
              </>
            ) : (
              <>
                <FiSend /> Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to={ACCOUNTS_ROUTES.LOGIN} className="auth-link">
            <FiArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
export default PasswordReset;