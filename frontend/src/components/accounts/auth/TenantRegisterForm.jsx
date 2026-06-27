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
import { Building } from 'lucide-react';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';


export const TenantRegisterForm = () => {
  const navigate = useNavigate();
  const { registerTenant, isLoading, error, clearAuthError } = useAuth();

  const [formData, setFormData] = useState({
    company_name: '',
    admin_email: '',
    admin_username: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_password: '',
    admin_confirm_password: '',
    subscription_plan: 'trial',
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

    const {
      company_name,
      admin_email,
      admin_username,
      admin_first_name,
      admin_last_name,
      admin_password,
      admin_confirm_password,
      subscription_plan,
    } = formData;

    if (!company_name || !admin_email || !admin_username || !admin_password || !admin_confirm_password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (admin_password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (admin_password !== admin_confirm_password) {
      setFormError('Passwords do not match');
      return;
    }

    const result = await registerTenant({
      company_name,
      admin_email,
      admin_username,
      admin_first_name,
      admin_last_name,
      admin_password,
      admin_confirm_password,
      subscription_plan,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate(ACCOUNTS_ROUTES.LOGIN);
      }, 3000);
    } else {
      setFormError(result.error || 'Organization registration failed');
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card tenant-register-card">
          <div className="auth-header">
            <div className="success-icon-wrapper">
              <FiCheckCircle className="success-icon" />
            </div>
            <h1 className="auth-title">Organization Created!</h1>
            <p className="auth-subtitle">
              Your organization has been registered successfully. You'll be redirected to login shortly.
            </p>
            <p className="auth-subtitle">
              An admin account has been created for <strong>{formData.admin_email}</strong>
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
      <div className="auth-card tenant-register-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield className="logo-icon" />
            <span className="logo-text">Falcon PMS</span>
          </div>
          <h1 className="auth-title">Register Organization</h1>
          <p className="auth-subtitle">Set up your organization and admin account</p>
        </div>

        {formError && (
          <div className="auth-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="company_name" className="form-label">
              Organization Name
            </label>
            <div className="form-input-wrapper">
              <Building className="input-icon" />
              <input
                id="company_name"
                name="company_name"
                type="text"
                className={`form-input ${submitted && !formData.company_name ? 'error' : ''}`}
                placeholder="Acme Inc."
                value={formData.company_name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            {submitted && !formData.company_name && (
              <span className="form-error">Organization name is required</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="admin_first_name" className="form-label">
                Admin First Name
              </label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="admin_first_name"
                  name="admin_first_name"
                  type="text"
                  className="form-input"
                  placeholder="John"
                  value={formData.admin_first_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="admin_last_name" className="form-label">
                Admin Last Name
              </label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="admin_last_name"
                  name="admin_last_name"
                  type="text"
                  className="form-input"
                  placeholder="Doe"
                  value={formData.admin_last_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin_username" className="form-label">
              Admin Username
            </label>
            <div className="form-input-wrapper">
              <FiUser className="input-icon" />
              <input
                id="admin_username"
                name="admin_username"
                type="text"
                className={`form-input ${submitted && !formData.admin_username ? 'error' : ''}`}
                placeholder="admin"
                value={formData.admin_username}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>
            {submitted && !formData.admin_username && (
              <span className="form-error">Username is required</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="admin_email" className="form-label">
              Admin Email Address
            </label>
            <div className="form-input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="admin_email"
                name="admin_email"
                type="email"
                className={`form-input ${submitted && !formData.admin_email ? 'error' : ''}`}
                placeholder="admin@company.com"
                value={formData.admin_email}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
            {submitted && !formData.admin_email && (
              <span className="form-error">Admin email is required</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="admin_password" className="form-label">
              Admin Password
            </label>
            <div className="form-input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="admin_password"
                name="admin_password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !formData.admin_password ? 'error' : ''}`}
                placeholder="Create a strong password"
                value={formData.admin_password}
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
            {submitted && !formData.admin_password && (
              <span className="form-error">Password is required</span>
            )}
            <span className="form-hint">
              Password must be at least 8 characters with uppercase, lowercase, and numbers
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="admin_confirm_password" className="form-label">
              Confirm Password
            </label>
            <div className="form-input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="admin_confirm_password"
                name="admin_confirm_password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${submitted && !formData.admin_confirm_password ? 'error' : ''}`}
                placeholder="Confirm your password"
                value={formData.admin_confirm_password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>
            {submitted && !formData.admin_confirm_password && (
              <span className="form-error">Please confirm your password</span>
            )}
            {submitted && formData.admin_password && formData.admin_confirm_password && formData.admin_password !== formData.admin_confirm_password && (
              <span className="form-error">Passwords do not match</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="subscription_plan" className="form-label">
              Subscription Plan
            </label>
            <select
              id="subscription_plan"
              name="subscription_plan"
              className="form-select"
              value={formData.subscription_plan}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="trial">Trial - 14 days free</option>
              <option value="basic">Basic - $49/month</option>
              <option value="professional">Professional - $99/month</option>
              <option value="enterprise">Enterprise - Custom</option>
            </select>
          </div>

          <button
            type="submit"
            className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" />
                Creating Organization...
              </>
            ) : (
              <>
                <FiUserPlus /> Register Organization
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
export default TenantRegisterForm;