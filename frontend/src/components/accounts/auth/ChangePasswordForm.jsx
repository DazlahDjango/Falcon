// src/components/accounts/auth/ChangePasswordForm.jsx
import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';

export const ChangePasswordForm = ({ onSuccess }) => {
  const { changePassword, isLoading, error, clearAuthError } = useAuth();

  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    clearAuthError();

    const { old_password, new_password, confirm_password } = formData;

    if (!old_password || !new_password || !confirm_password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (new_password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (new_password !== confirm_password) {
      setFormError('New passwords do not match');
      return;
    }

    const result = await changePassword({
      old_password,
      new_password,
      confirm_password,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 2000);
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to change password';
      setFormError(errorMessage);
    }
  };

  return (
    <div className="change-password-container">
      {success && (
        <div className="auth-alert success">
          <FiCheckCircle className="alert-icon" />
          <span>Password changed successfully!</span>
        </div>
      )}

      {formError && (
        <div className="auth-alert error">
          <FiAlertCircle className="alert-icon" />
          <span>{formError}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="old_password" className="form-label">Current Password</label>
          <div className="form-input-wrapper">
            <FiLock className="input-icon" />
            <input
              id="old_password"
              name="old_password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${submitted && !formData.old_password ? 'error' : ''}`}
              placeholder="Enter current password"
              value={formData.old_password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          {submitted && !formData.old_password && (
            <span className="form-error">Current password is required</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="new_password" className="form-label">New Password</label>
          <div className="form-input-wrapper">
            <FiLock className="input-icon" />
            <input
              id="new_password"
              name="new_password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${submitted && !formData.new_password ? 'error' : ''}`}
              placeholder="Enter new password"
              value={formData.new_password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {submitted && !formData.new_password && (
            <span className="form-error">New password is required</span>
          )}
          <span className="form-hint">
            Password must be at least 8 characters with uppercase, lowercase, and numbers
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="confirm_password" className="form-label">Confirm New Password</label>
          <div className="form-input-wrapper">
            <FiLock className="input-icon" />
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${submitted && !formData.confirm_password ? 'error' : ''}`}
              placeholder="Confirm new password"
              value={formData.confirm_password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          {submitted && !formData.confirm_password && (
            <span className="form-error">Please confirm your new password</span>
          )}
          {submitted && formData.new_password && formData.confirm_password && formData.new_password !== formData.confirm_password && (
            <span className="form-error">Passwords do not match</span>
          )}
        </div>

        <button
          type="submit"
          className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
          disabled={isLoading || success}
        >
          {isLoading ? (
            <>
              <span className="spinner-sm" />
              Changing Password...
            </>
          ) : (
            <>
              <FiSave /> Change Password
            </>
          )}
        </button>
      </form>
    </div>
  );
};
export default ChangePasswordForm;