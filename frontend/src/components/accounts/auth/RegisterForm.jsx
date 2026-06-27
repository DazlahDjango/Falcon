import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiUserPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiShield,
  FiArrowLeft,
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearAuthError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    clearAuthError();

    const { email, username, first_name, last_name, password, confirm_password } = formData;

    if (!email || !username || !password || !confirm_password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirm_password) {
      setFormError('Passwords do not match');
      return;
    }

    const result = await register({
      email,
      username,
      first_name,
      last_name,
      password,
      confirm_password,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate(ACCOUNTS_ROUTES.LOGIN);
      }, 3000);
    } else {
      setFormError(result.error || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="success-icon-wrapper">
              <FiCheckCircle className="success-icon" />
            </div>
            <h1 className="auth-title">Registration Successful!</h1>
            <p className="auth-subtitle">
              Please check your email to verify your account. You'll be redirected to login shortly.
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
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield className="logo-icon" />
            <span className="logo-text">Falcon PMS</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Falcon PMS and start managing your performance</p>
        </div>

        {formError && (
          <div className="auth-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                First Name
              </label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="form-input"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                Last Name
              </label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="form-input"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="form-input-wrapper">
              <FiUser className="input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                className={`form-input ${submitted && !formData.username ? 'error' : ''}`}
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>
            {submitted && !formData.username && (
              <span className="form-error">Username is required</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="form-input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${submitted && !formData.email ? 'error' : ''}`}
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
            {submitted && !formData.email && (
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !formData.password ? 'error' : ''}`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
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
            {submitted && !formData.password && (
              <span className="form-error">Password is required</span>
            )}
            <span className="form-hint">
              Password must be at least 8 characters with uppercase, lowercase, and numbers
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password" className="form-label">
              Confirm Password
            </label>
            <div className="form-input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="confirm_password"
                name="confirm_password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !formData.confirm_password ? 'error' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>
            {submitted && !formData.confirm_password && (
              <span className="form-error">Please confirm your password</span>
            )}
            {submitted && formData.password && formData.confirm_password && formData.password !== formData.confirm_password && (
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
                Creating Account...
              </>
            ) : (
              <>
                <FiUserPlus /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to={ACCOUNTS_ROUTES.LOGIN} className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterForm;