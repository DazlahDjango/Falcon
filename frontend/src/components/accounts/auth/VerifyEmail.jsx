import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiArrowLeft,
  FiRefreshCw,
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification, isLoading, error, clearAuthError } = useAuth();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendEmail, setResendEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('no_token');
      setMessage('No verification token provided');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          setTimeout(() => {
            navigate(ACCOUNTS_ROUTES.LOGIN);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Email verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err?.message || 'Email verification failed');
      }
    };

    verify();
  }, [token, verifyEmail, navigate]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !resendEmail) return;
    setFormError(null);
    clearAuthError();

    const result = await resendVerification(resendEmail);

    if (result.success) {
      setResendCooldown(60);
      setFormError(null);
    } else {
      setFormError(result.error || 'Failed to resend verification email');
    }
  };

  const renderContent = () => {
    if (status === 'verifying') {
      return (
        <div className="verify-loading">
          <div className="spinner-lg" />
          <h2>Verifying your email...</h2>
          <p>Please wait while we confirm your email address.</p>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <>
          <div className="success-icon-wrapper">
            <FiCheckCircle className="success-icon" />
          </div>
          <h1 className="auth-title">Email Verified!</h1>
          <p className="auth-subtitle">{message}</p>
          <p className="auth-subtitle">You will be redirected to login shortly.</p>
          <Link to={ACCOUNTS_ROUTES.LOGIN} className="auth-link">
            <FiArrowLeft /> Go to Login
          </Link>
        </>
      );
    }

    if (status === 'no_token') {
      return (
        <>
          <div className="error-icon-wrapper">
            <FiAlertCircle className="error-icon" />
          </div>
          <h1 className="auth-title">Invalid Verification Link</h1>
          <p className="auth-subtitle">No verification token was provided.</p>
          <p className="auth-subtitle">
            Please check your email for the correct verification link or request a new one.
          </p>
          <div className="verify-resend-section">
            <div className="form-group">
              <label htmlFor="resendEmail" className="form-label">
                Enter your email to resend verification
              </label>
              <input
                id="resendEmail"
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </div>
            <button
              className="auth-btn secondary"
              onClick={handleResend}
              disabled={resendCooldown > 0 || !resendEmail}
            >
              <FiRefreshCw className={resendCooldown > 0 ? 'spinning' : ''} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification'}
            </button>
          </div>
          {formError && (
            <div className="auth-alert error">
              <FiAlertCircle className="alert-icon" />
              <span>{formError}</span>
            </div>
          )}
          <Link to={ACCOUNTS_ROUTES.LOGIN} className="auth-link">
            <FiArrowLeft /> Back to Login
          </Link>
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <div className="error-icon-wrapper">
            <FiAlertCircle className="error-icon" />
          </div>
          <h1 className="auth-title">Verification Failed</h1>
          <p className="auth-subtitle">{message}</p>
          <p className="auth-subtitle">The verification link may have expired or been used already.</p>
          <div className="verify-resend-section">
            <div className="form-group">
              <label htmlFor="resendEmail" className="form-label">
                Enter your email to resend verification
              </label>
              <input
                id="resendEmail"
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </div>
            <button
              className="auth-btn secondary"
              onClick={handleResend}
              disabled={resendCooldown > 0 || !resendEmail}
            >
              <FiRefreshCw className={resendCooldown > 0 ? 'spinning' : ''} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification'}
            </button>
          </div>
          {formError && (
            <div className="auth-alert error">
              <FiAlertCircle className="alert-icon" />
              <span>{formError}</span>
            </div>
          )}
          <Link to={ACCOUNTS_ROUTES.LOGIN} className="auth-link">
            <FiArrowLeft /> Back to Login
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <div className="auth-container">
      <div className="auth-card verify-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield className="logo-icon" />
            <span className="logo-text">Falcon PMS</span>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
export default VerifyEmail;