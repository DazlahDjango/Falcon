import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const PasswordResetConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, isLoading, error, clearAuthError } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate(ACCOUNTS_ROUTES.LOGIN);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : (error?.message || 'An error occurred');
      setFormError(errorMessage);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    clearAuthError();

    if (!password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      const result = await resetPassword({ token, new_password: password, confirm_password: confirmPassword });

      if (result.success || result) {
        setSuccess(true);
        setTimeout(() => {
          navigate(ACCOUNTS_ROUTES.LOGIN);
        }, 3000);
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to reset password';
        setFormError(errorMessage);
      }
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to reset password');
      setFormError(errorMessage);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card reset-confirm-card">
          <div className="auth-header">
            <div className="success-icon-wrapper">
              <FiCheckCircle className="success-icon" />
            </div>
            <h1 className="auth-title">Password Reset Successful!</h1>
            <p className="auth-subtitle">
              Your password has been reset successfully. You can now log in with your new password.
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
      <div className="auth-card reset-confirm-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield className="logo-icon" />
            <span className="logo-text">Falcon PMS</span>
          </div>
          <h1 className="auth-title">Create New Password</h1>
          <p className="auth-subtitle">
            Enter your new password below. Make sure it's strong and secure.
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
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <div className="form-input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !password ? 'error' : ''}`}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {submitted && !password && (
              <span className="form-error">Password is required</span>
            )}
            <span className="form-hint">
              Password must be at least 8 characters with uppercase, lowercase, and numbers
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="form-input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !confirmPassword ? 'error' : ''}`}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>
            {submitted && !confirmPassword && (
              <span className="form-error">Please confirm your password</span>
            )}
            {submitted && password && confirmPassword && password !== confirmPassword && (
              <span className="form-error">Passwords do not match</span>
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
                Resetting...
              </>
            ) : (
              'Reset Password'
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
export default PasswordResetConfirm;