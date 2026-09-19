import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSave,
  FiAlertCircle,
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiShield,
  FiClock,
} from 'react-icons/fi';
import { useProfile } from '../../../hooks/accounts/useProfile';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    currentProfile,
    updateMyProfile,
    isLoading,
    error,
    clearError,
    getMyProfile,
  } = useProfile();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: '',
    date_of_birth: '',
    work_phone: '',
    mobile_phone: '',
    address: '',
    city: '',
    country: '',
    employee_type: '',
    cost_center: '',
    timezone: 'Africa/Nairobi',
    date_format: 'MM/DD/YYYY',
    number_format: '1,000.00',
    theme: 'light',
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentProfile) {
      getMyProfile();
    }
  }, [currentProfile, getMyProfile]);

  useEffect(() => {
    if (currentProfile) {
      const user = currentProfile.user || currentUser;
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone_number: user?.phone_number || '',
        bio: currentProfile.bio || '',
        date_of_birth: currentProfile.date_of_birth || '',
        work_phone: currentProfile.work_phone || '',
        mobile_phone: currentProfile.mobile_phone || '',
        address: currentProfile.address || '',
        city: currentProfile.city || '',
        country: currentProfile.country || '',
        employee_type: currentProfile.employee_type || '',
        cost_center: currentProfile.cost_center || '',
        timezone: currentProfile.timezone || 'Africa/Nairobi',
        date_format: currentProfile.date_format || 'MM/DD/YYYY',
        number_format: currentProfile.number_format || '1,000.00',
        theme: currentProfile.theme || 'light',
      });
    }
  }, [currentProfile, currentUser]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    clearError();

    const {
      first_name,
      last_name,
      phone_number,
      bio,
      date_of_birth,
      work_phone,
      mobile_phone,
      address,
      city,
      country,
      employee_type,
      cost_center,
      timezone,
      date_format,
      number_format,
      theme,
    } = formData;

    if (!first_name || !last_name) {
      setFormError('First name and last name are required');
      return;
    }

    const profileData = {
      first_name,
      last_name,
      phone_number,
      bio,
      date_of_birth,
      work_phone,
      mobile_phone,
      address,
      city,
      country,
      timezone,
      date_format,
      number_format,
      theme,
    };

    const result = await updateMyProfile(profileData);

    if (result.success !== false) {
      setSuccess(true);
      setTimeout(() => {
        navigate(ACCOUNTS_ROUTES.MY_PROFILE);
      }, 1500);
    } else {
      setFormError(result.error || 'Failed to update profile');
    }
  };

  if (isLoading && !currentProfile) {
    return (
      <div className="profile-edit-loading">
        <div className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <button className="back-btn" onClick={() => navigate(ACCOUNTS_ROUTES.MY_PROFILE)}>
          <FiArrowLeft /> Back to Profile
        </button>
        <h1>Edit Profile</h1>
      </div>

      {success && (
        <div className="profile-edit-success">
          <FiSave className="success-icon" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {formError && (
        <div className="profile-edit-error">
          <FiAlertCircle className="error-icon" />
          <span>{typeof formError === 'string' ? formError : (formError?.displayMessage || formError?.message || formError?.detail || formError?.error || JSON.stringify(formError))}</span>
        </div>
      )}

      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">First Name</label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className={`form-input ${submitted && !formData.first_name ? 'error' : ''}`}
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
              {submitted && !formData.first_name && (
                <span className="form-error">First name is required</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="last_name" className="form-label">Last Name</label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className={`form-input ${submitted && !formData.last_name ? 'error' : ''}`}
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
              {submitted && !formData.last_name && (
                <span className="form-error">Last name is required</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone_number" className="form-label">Phone Number</label>
            <div className="form-input-wrapper">
              <FiPhone className="input-icon" />
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                className="form-input"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">Bio</label>
            <textarea
              id="bio"
              name="bio"
              className="form-textarea"
              rows="4"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
            <div className="form-input-wrapper">
              <FiCalendar className="input-icon" />
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                className="form-input"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="work_phone" className="form-label">Work Phone</label>
              <div className="form-input-wrapper">
                <FiPhone className="input-icon" />
                <input
                  id="work_phone"
                  name="work_phone"
                  type="tel"
                  className="form-input"
                  value={formData.work_phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="mobile_phone" className="form-label">Mobile Phone</label>
              <div className="form-input-wrapper">
                <FiPhone className="input-icon" />
                <input
                  id="mobile_phone"
                  name="mobile_phone"
                  type="tel"
                  className="form-input"
                  value={formData.mobile_phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Address</label>
            <div className="form-input-wrapper">
              <FiMapPin className="input-icon" />
              <input
                id="address"
                name="address"
                type="text"
                className="form-input"
                placeholder="Street address"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label">City</label>
              <div className="form-input-wrapper">
                <FiMapPin className="input-icon" />
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="country" className="form-label">Country</label>
              <div className="form-input-wrapper">
                <FiMapPin className="input-icon" />
                <input
                  id="country"
                  name="country"
                  type="text"
                  className="form-input"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="flex items-center justify-between mb-3">
            <h3>Employment & Organizational Structure</h3>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              🔒 Managed via Structure App
            </span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <p className="text-[11px] text-slate-500 font-medium">
              Employment properties, job title, organizational placement, and manager lines are automatically mapped from your active Employment & Position in the Structure App.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-700 pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="block text-[10px] font-bold text-slate-400">Job Title:</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">
                  {currentProfile?.title || (currentProfile?.user?.title) || currentUser?.title || 'Not Mapped'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="block text-[10px] font-bold text-slate-400">Structure Level:</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">
                  {(currentProfile?.user?.department) || currentUser?.department || 'Not Mapped'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="block text-[10px] font-bold text-slate-400">Employee Type:</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">
                  {currentProfile?.employee_type || 'Full-time'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                <span className="block text-[10px] font-bold text-slate-400">Cost Center:</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">
                  {currentProfile?.cost_center || 'General'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Preferences</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="timezone" className="form-label">Time Zone</label>
              <div className="form-input-wrapper">
                <FiClock className="input-icon" />
                <select
                  id="timezone"
                  name="timezone"
                  className="form-select"
                  value={formData.timezone}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="Africa/Nairobi">Africa/Nairobi</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="date_format" className="form-label">Date Format</label>
              <div className="form-input-wrapper">
                <FiCalendar className="input-icon" />
                <select
                  id="date_format"
                  name="date_format"
                  className="form-select"
                  value={formData.date_format}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="number_format" className="form-label">Number Format</label>
              <div className="form-input-wrapper">
                <FiShield className="input-icon" />
                <select
                  id="number_format"
                  name="number_format"
                  className="form-select"
                  value={formData.number_format}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="1,000.00">1,000.00</option>
                  <option value="1.000,00">1.000,00</option>
                  <option value="1 000,00">1 000,00</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="theme" className="form-label">Theme</label>
              <div className="form-input-wrapper">
                <FiShield className="input-icon" />
                <select
                  id="theme"
                  name="theme"
                  className="form-select"
                  value={formData.theme}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-edit-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(ACCOUNTS_ROUTES.MY_PROFILE)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || success}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" />
                Saving...
              </>
            ) : (
              <>
                <FiSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ProfileEdit;