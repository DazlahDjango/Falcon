import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiAlertCircle,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';
import { clearError } from '../../../store/accounts/slice/authSlice';

export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login, isLoading, error, isAuthenticated, requiresMfa, mfaToken, clearAuthError } =
    useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ACCOUNTS_ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  useEffect(() => {
    if (requiresMfa && mfaToken) {
      navigate(ACCOUNTS_ROUTES.MFA_VERIFY, {
        state: { mfaToken, email },
      });
    }
  }, [requiresMfa, mfaToken, navigate, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    dispatch(clearError());

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    const result = await login({ email, password });

    if (result.requiresMfa) {
      navigate(ACCOUNTS_ROUTES.MFA_VERIFY, {
        state: { 
          mfaToken: result.mfaToken, 
          email,
          mfaSetupRequired: result.mfa_setup_required || false 
        },
      });
    } else if (!result.success) {
      setFormError(result.error || 'Login failed. Please try again.');
    }
  };

  const handleClearError = () => {
    setFormError(null);
    clearAuthError();
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield className="logo-icon" />
            <span className="logo-text">Falcon PMS</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {formError && (
          <div className="auth-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{typeof formError === 'object' ? (formError.message || formError.error || 'Login failed. Please try again.') : formError}</span>
            <button className="alert-close" onClick={handleClearError}>
              ×
            </button>
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

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="form-input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
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
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to={ACCOUNTS_ROUTES.FORGOT_PASSWORD} className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to={ACCOUNTS_ROUTES.REGISTER} className="auth-link">
              Create one
            </Link>
          </p>
          <p className="auth-tenant-link">
            Need to set up your organization?{' '}
            <Link to={ACCOUNTS_ROUTES.REGISTER_TENANT} className="auth-link">
              Register Organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginForm;