import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiGrid,
  FiList,
  FiClock,
  FiCalendar,
  FiShield,
  FiEye,
  FiEyeOff,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import { usePreferences } from '../../../hooks/accounts/usePreferences';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { useThemeContext } from '../../../contexts/global/ThemeContext';

export const UserPreferences = () => {
  const { user } = useAuth();
  const { setThemeMode } = useThemeContext();
  const {
    userPreferences,
    getMyPreferences,
    updateMyPreferences,
    isLoading,
    error,
    clearError,
  } = usePreferences();

  const [formData, setFormData] = useState({
    items_per_page: 20,
    default_dashboard: 'individual',
    collapsed_sidebar: false,
    public_profile: false,
    show_email: true,
    show_phone: false,
    work_start_time: '09:00',
    work_end_time: '17:00',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    theme: 'light',
  });
  const [submitted, setSubmitted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (userPreferences) {
      const activeTheme = userPreferences.theme || 'light';
      setFormData({
        items_per_page: userPreferences.items_per_page || 20,
        default_dashboard: userPreferences.default_dashboard || 'individual',
        collapsed_sidebar: userPreferences.collapsed_sidebar || false,
        public_profile: userPreferences.public_profile || false,
        show_email: userPreferences.show_email !== undefined ? userPreferences.show_email : true,
        show_phone: userPreferences.show_phone || false,
        work_start_time: userPreferences.work_start_time || '09:00',
        work_end_time: userPreferences.work_end_time || '17:00',
        working_days: userPreferences.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        theme: activeTheme,
      });
      if (activeTheme) {
        setThemeMode(activeTheme);
      }
    }
  }, [userPreferences, setThemeMode]);

  const loadPreferences = async () => {
    try {
      const res = await getMyPreferences();
      const prefs = res?.data || res;
      if (prefs?.theme) {
        setThemeMode(prefs.theme);
      }
    } catch (err) {
      console.warn("Could not load my preferences", err);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      setThemeMode(value);
    }
  };

  const handleToggleArray = (key, value) => {
    setFormData((prev) => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((item) => item !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    setSaveSuccess(false);

    try {
      const result = await updateMyPreferences(formData);
      if (result.success !== false) {
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
        await loadPreferences();
      } else {
        setFormError(result.error || 'Failed to update preferences');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to update preferences');
    }
  };

  const handleReset = () => {
    if (userPreferences) {
      setFormData({
        items_per_page: userPreferences.items_per_page || 20,
        default_dashboard: userPreferences.default_dashboard || 'individual',
        collapsed_sidebar: userPreferences.collapsed_sidebar || false,
        public_profile: userPreferences.public_profile || false,
        show_email: userPreferences.show_email !== undefined ? userPreferences.show_email : true,
        show_phone: userPreferences.show_phone || false,
        work_start_time: userPreferences.work_start_time || '09:00',
        work_end_time: userPreferences.work_end_time || '17:00',
        working_days: userPreferences.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        theme: userPreferences.theme || 'light',
      });
      setEditing(false);
    }
  };

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const dashboardOptions = [
    { value: 'individual', label: 'Individual Dashboard' },
    { value: 'manager', label: 'Manager Dashboard' },
    { value: 'executive', label: 'Executive Dashboard' },
    { value: 'champion', label: 'Champion Dashboard' },
    { value: 'admin', label: 'Admin Dashboard' },
  ];

  if (isLoading && !userPreferences) {
    return (
      <div className="user-preferences-loading">
        <div className="spinner" />
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="user-preferences-container">
      <div className="user-preferences-header">
        <div className="user-preferences-title">
          <FiUser className="title-icon" />
          <h1>User Preferences</h1>
        </div>
        <div className="user-preferences-actions">
          <button className="btn-icon" onClick={loadPreferences}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="user-preferences-success">
          <FiCheckCircle className="success-icon" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {formError && (
        <div className="user-preferences-error">
          <FiAlertCircle className="error-icon" />
          <span>{formError}</span>
          <button onClick={() => setFormError(null)}>×</button>
        </div>
      )}

      <form className="user-preferences-form" onSubmit={handleSubmit}>
        <div className="preferences-section">
          <h3>Display Settings</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">Items Per Page</label>
              <select
                className="preference-select"
                value={formData.items_per_page}
                onChange={(e) => handleChange('items_per_page', Number(e.target.value))}
                disabled={!editing}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="preference-item">
              <label className="preference-label">Default Dashboard</label>
              <select
                className="preference-select"
                value={formData.default_dashboard}
                onChange={(e) => handleChange('default_dashboard', e.target.value)}
                disabled={!editing}
              >
                {dashboardOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="preference-item">
              <label className="preference-label">Theme</label>
              <div className="preference-theme-toggle">
                <button
                  type="button"
                  className={`theme-btn ${formData.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleChange('theme', 'light')}
                >
                  <FiSun /> Light
                </button>
                <button
                  type="button"
                  className={`theme-btn ${formData.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleChange('theme', 'dark')}
                >
                  <FiMoon /> Dark
                </button>
                <button
                  type="button"
                  className={`theme-btn ${formData.theme === 'system' ? 'active' : ''}`}
                  onClick={() => handleChange('theme', 'system')}
                >
                  <FiShield /> System
                </button>
              </div>
            </div>

            <div className="preference-item">
              <label className="preference-label">Sidebar</label>
              <button
                type="button"
                className={`toggle-btn ${formData.collapsed_sidebar ? 'active' : ''}`}
                onClick={() => handleChange('collapsed_sidebar', !formData.collapsed_sidebar)}
                disabled={!editing}
              >
                {formData.collapsed_sidebar ? <FiList /> : <FiGrid />}
                {formData.collapsed_sidebar ? 'Collapsed' : 'Expanded'}
              </button>
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3>Profile Privacy</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">Public Profile</label>
              <button
                type="button"
                className={`toggle-btn ${formData.public_profile ? 'active' : ''}`}
                onClick={() => handleChange('public_profile', !formData.public_profile)}
                disabled={!editing}
              >
                {formData.public_profile ? <FiEye /> : <FiEyeOff />}
                {formData.public_profile ? 'Public' : 'Private'}
              </button>
            </div>

            <div className="preference-item">
              <label className="preference-label">Show Email</label>
              <button
                type="button"
                className={`toggle-btn ${formData.show_email ? 'active' : ''}`}
                onClick={() => handleChange('show_email', !formData.show_email)}
                disabled={!editing}
              >
                {formData.show_email ? <FiEye /> : <FiEyeOff />}
                {formData.show_email ? 'Visible' : 'Hidden'}
              </button>
            </div>

            <div className="preference-item">
              <label className="preference-label">Show Phone</label>
              <button
                type="button"
                className={`toggle-btn ${formData.show_phone ? 'active' : ''}`}
                onClick={() => handleChange('show_phone', !formData.show_phone)}
                disabled={!editing}
              >
                {formData.show_phone ? <FiEye /> : <FiEyeOff />}
                {formData.show_phone ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3><FiClock /> Work Schedule</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">Work Start Time</label>
              <input
                type="time"
                className="preference-input"
                value={formData.work_start_time}
                onChange={(e) => handleChange('work_start_time', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="preference-item">
              <label className="preference-label">Work End Time</label>
              <input
                type="time"
                className="preference-input"
                value={formData.work_end_time}
                onChange={(e) => handleChange('work_end_time', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="preference-item full-width">
              <label className="preference-label">Working Days</label>
              <div className="working-days-grid">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    className={`day-btn ${formData.working_days?.includes(day.value) ? 'active' : ''}`}
                    onClick={() => handleToggleArray('working_days', day.value)}
                    disabled={!editing}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="preferences-actions">
          {!editing ? (
            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              <FiUser /> Edit Preferences
            </button>
          ) : (
            <>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
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
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserPreferences;
