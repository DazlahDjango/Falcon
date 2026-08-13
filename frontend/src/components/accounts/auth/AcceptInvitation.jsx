import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiShield,
  FiArrowRight,
} from 'react-icons/fi';
import * as authApi from '../../../services/accounts/api/auth';
import { setTokens, setTenantId } from '../../../services/accounts/storage/secureStorage';
import { initializeAuth } from '../../../store/accounts/slice/authSlice';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const AcceptInvitation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!token) {
      setFormError('Invalid or missing invitation link. Please check your email.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    if (!token) {
      setFormError('Invalid or missing invitation link.');
      return;
    }

    if (!password || !confirmPassword) {
      setFormError('Password and Confirm Password are required');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.acceptInvitation({
        token,
        password,
        confirm_password: confirmPassword,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      const resData = response?.data || response;
      const tokens = resData?.tokens;
      const user = resData?.user;

      if (tokens?.access && tokens?.refresh) {
        await setTokens(tokens.access, tokens.refresh);
      }
      if (user?.tenant_id) {
        await setTenantId(user.tenant_id);
      }

      await dispatch(initializeAuth());

      setSuccess(true);
      setTimeout(() => {
        navigate(ACCOUNTS_ROUTES.DASHBOARD);
      }, 1500);
    } catch (err) {
      const resData = err?.response?.data;
      let errorMsg = 'Failed to accept invitation. The link may have expired or already been used.';
      if (resData?.error) {
        errorMsg = resData.error;
      } else if (resData?.detail) {
        errorMsg = resData.detail;
      } else if (typeof resData === 'string') {
        errorMsg = resData;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setFormError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card accept-invitation-card">
          <div className="auth-header">
            <div className="success-icon-wrapper">
              <FiCheckCircle className="success-icon" />
            </div>
            <h1 className="auth-title">Welcome to Falcon PMS!</h1>
            <p className="auth-subtitle">
              Your account has been set up successfully. Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card accept-invitation-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield className="logo-icon" />
            <span className="logo-text">Falcon PMS</span>
          </div>
          <h1 className="auth-title">Accept Your Invitation</h1>
          <p className="auth-subtitle">
            Set your password below to complete your account setup and access your workspace.
          </p>
        </div>

        {formError && (
          <div className="auth-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName" className="form-label">
                First Name (Optional)
              </label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="firstName"
                  type="text"
                  className="form-input"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading || !token}
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="lastName" className="form-label">
                Last Name (Optional)
              </label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="lastName"
                  type="text"
                  className="form-input"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading || !token}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Set Password <span className="text-danger">*</span>
            </label>
            <div className="form-input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !password ? 'error' : ''}`}
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || !token}
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
              Must be at least 8 characters long
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password <span className="text-danger">*</span>
            </label>
            <div className="form-input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !confirmPassword ? 'error' : ''}`}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !token}
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
            disabled={isLoading || !token}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" />
                Setting up account...
              </>
            ) : (
              <>
                Join Workspace <FiArrowRight style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to={ACCOUNTS_ROUTES.LOGIN} className="auth-link">
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
