import React, { useState, useEffect } from 'react';
import {
  FiBriefcase,
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiGlobe,
  FiClock,
  FiShield,
  FiUsers,
  FiLock,
  FiKey,
  FiFileText,
} from 'react-icons/fi';
import { usePreferences } from '../../../hooks/accounts/usePreferences';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import { useAdmin } from '../../../hooks/accounts/useAdmin';

export const TenantPreferences = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useAuthContext();
  const {
    tenantPreferences,
    getMyTenantPreferences,
    updateMyTenantPreferences,
    isLoading,
    error,
    clearError,
  } = usePreferences();


  const { getTenants } = useAdmin();

  const [formData, setFormData] = useState({
    default_language: 'en',
    default_timezone: 'Africa/Nairobi',
    audit_log_retention_days: 365,
    session_retention_days: 90,
    api_rate_limit: 1000,
    mfa_required_roles: [],
    password_expiry_days: 90,
    session_timeout_minutes: 480,
    max_concurrent_sessions: 5,
    default_password_mode: 'system_generated',
    default_password_custom_value: '',
    force_password_change_on_first_login: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (tenantPreferences) {
      setFormData({
        default_language: tenantPreferences.default_language || 'en',
        default_timezone: tenantPreferences.default_timezone || 'Africa/Nairobi',
        audit_log_retention_days: tenantPreferences.audit_log_retention_days || 365,
        session_retention_days: tenantPreferences.session_retention_days || 90,
        api_rate_limit: tenantPreferences.api_rate_limit || 1000,
        mfa_required_roles: tenantPreferences.mfa_required_roles || [],
        password_expiry_days: tenantPreferences.password_expiry_days || 90,
        session_timeout_minutes: tenantPreferences.session_timeout_minutes || 480,
        max_concurrent_sessions: tenantPreferences.max_concurrent_sessions || 5,
        default_password_mode: tenantPreferences.default_password_mode || 'system_generated',
        default_password_custom_value: tenantPreferences.default_password_custom_value || '',
        force_password_change_on_first_login: tenantPreferences.force_password_change_on_first_login !== false,
      });
    }
  }, [tenantPreferences]);

  const loadPreferences = async () => {
    await getMyTenantPreferences();
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleRole = (role) => {
    setFormData((prev) => {
      const current = prev.mfa_required_roles || [];
      if (current.includes(role)) {
        return { ...prev, mfa_required_roles: current.filter((r) => r !== role) };
      }
      return { ...prev, mfa_required_roles: [...current, role] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    setSaveSuccess(false);

    try {
      const result = await updateMyTenantPreferences(formData);
      if (result.success !== false) {
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
        await loadPreferences();
      } else {
        setFormError(result.error || 'Failed to update tenant preferences');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to update tenant preferences');
    }
  };

  const handleReset = () => {
    if (tenantPreferences) {
      setFormData({
        default_language: tenantPreferences.default_language || 'en',
        default_timezone: tenantPreferences.default_timezone || 'Africa/Nairobi',
        audit_log_retention_days: tenantPreferences.audit_log_retention_days || 365,
        session_retention_days: tenantPreferences.session_retention_days || 90,
        api_rate_limit: tenantPreferences.api_rate_limit || 1000,
        mfa_required_roles: tenantPreferences.mfa_required_roles || [],
        password_expiry_days: tenantPreferences.password_expiry_days || 90,
        session_timeout_minutes: tenantPreferences.session_timeout_minutes || 480,
        max_concurrent_sessions: tenantPreferences.max_concurrent_sessions || 5,
        default_password_mode: tenantPreferences.default_password_mode || 'system_generated',
        default_password_custom_value: tenantPreferences.default_password_custom_value || '',
        force_password_change_on_first_login: tenantPreferences.force_password_change_on_first_login !== false,
      });
      setEditing(false);
    }
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
    { value: 'ar', label: 'Arabic' },
  ];

  const timezoneOptions = [
    { value: 'Africa/Nairobi', label: 'Africa/Nairobi (GMT+3)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (GMT-4)' },
    { value: 'Europe/London', label: 'Europe/London (GMT+1)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8)' },
  ];

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'client_admin', label: 'Client Admin' },
    { value: 'executive', label: 'Executive' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'staff', label: 'Staff' },
    { value: 'read_only', label: 'Read Only' },
  ];

  const canEdit = isSuperAdmin() || user?.role === 'client_admin';

  if (isLoading && !tenantPreferences) {
    return (
      <div className="tenant-preferences-loading">
        <div className="spinner" />
        <p>Loading tenant preferences...</p>
      </div>
    );
  }

  return (
    <div className="tenant-preferences-container">
      <div className="tenant-preferences-header">
        <div className="tenant-preferences-title">
          <FiBriefcase className="title-icon" />
          <h1>Tenant Preferences</h1>
        </div>
        <div className="tenant-preferences-actions">
          <button className="btn-icon" onClick={loadPreferences}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="tenant-preferences-success">
          <FiCheckCircle className="success-icon" />
          <span>Tenant preferences updated successfully!</span>
        </div>
      )}

      {formError && (
        <div className="tenant-preferences-error">
          <FiAlertCircle className="error-icon" />
          <span>{formError}</span>
          <button onClick={() => setFormError(null)}>×</button>
        </div>
      )}

      <form className="tenant-preferences-form" onSubmit={handleSubmit}>
        <div className="preferences-section">
          <h3><FiGlobe /> Localization</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">Default Language</label>
              <select
                className="preference-select"
                value={formData.default_language}
                onChange={(e) => handleChange('default_language', e.target.value)}
                disabled={!editing || !canEdit}
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="preference-item">
              <label className="preference-label">Default Timezone</label>
              <select
                className="preference-select"
                value={formData.default_timezone}
                onChange={(e) => handleChange('default_timezone', e.target.value)}
                disabled={!editing || !canEdit}
              >
                {timezoneOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3><FiShield /> Security</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">MFA Required Roles</label>
              <div className="mfa-roles-grid">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    className={`role-btn ${formData.mfa_required_roles?.includes(role.value) ? 'active' : ''}`}
                    onClick={() => handleToggleRole(role.value)}
                    disabled={!editing || !canEdit}
                  >
                    <FiShield /> {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="preference-item">
              <label className="preference-label">Password Expiry (days)</label>
              <input
                type="number"
                className="preference-input"
                value={formData.password_expiry_days}
                onChange={(e) => handleChange('password_expiry_days', parseInt(e.target.value) || 90)}
                disabled={!editing || !canEdit}
                min={1}
                max={365}
              />
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3><FiKey /> Default Password Configurations</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">Default Password Mode</label>
              <select
                className="preference-select"
                value={formData.default_password_mode}
                onChange={(e) => handleChange('default_password_mode', e.target.value)}
                disabled={!editing || !canEdit}
              >
                <option value="system_generated">System-Generated Strong Password</option>
                <option value="custom_value">Client-Provided Default Password</option>
                <option value="invite_only">No Default Password (Invite-Only Flow)</option>
              </select>
            </div>

            {formData.default_password_mode === 'custom_value' && (
              <div className="preference-item">
                <label className="preference-label">Custom Default Password Value</label>
                <input
                  type="text"
                  className="preference-input"
                  value={formData.default_password_custom_value}
                  onChange={(e) => handleChange('default_password_custom_value', e.target.value)}
                  disabled={!editing || !canEdit}
                  placeholder="e.g. Welcome123!"
                  required
                />
              </div>
            )}

            <div className="preference-item flex items-center mt-6">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.force_password_change_on_first_login}
                  onChange={(e) => handleChange('force_password_change_on_first_login', e.target.checked)}
                  disabled={!editing || !canEdit}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Force password change on first login</span>
              </label>
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3><FiClock /> Session Settings</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">Session Timeout (minutes)</label>
              <input
                type="number"
                className="preference-input"
                value={formData.session_timeout_minutes}
                onChange={(e) => handleChange('session_timeout_minutes', parseInt(e.target.value) || 480)}
                disabled={!editing || !canEdit}
                min={5}
                max={1440}
              />
            </div>

            <div className="preference-item">
              <label className="preference-label">Max Concurrent Sessions</label>
              <input
                type="number"
                className="preference-input"
                value={formData.max_concurrent_sessions}
                onChange={(e) => handleChange('max_concurrent_sessions', parseInt(e.target.value) || 5)}
                disabled={!editing || !canEdit}
                min={1}
                max={50}
              />
            </div>

            <div className="preference-item">
              <label className="preference-label">Session Retention (days)</label>
              <input
                type="number"
                className="preference-input"
                value={formData.session_retention_days}
                onChange={(e) => handleChange('session_retention_days', parseInt(e.target.value) || 90)}
                disabled={!editing || !canEdit}
                min={1}
                max={365}
              />
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3><FiFileText /> Audit Settings</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">Audit Log Retention (days)</label>
              <input
                type="number"
                className="preference-input"
                value={formData.audit_log_retention_days}
                onChange={(e) => handleChange('audit_log_retention_days', parseInt(e.target.value) || 365)}
                disabled={!editing || !canEdit}
                min={1}
                max={730}
              />
            </div>

            <div className="preference-item">
              <label className="preference-label">API Rate Limit (requests/day)</label>
              <input
                type="number"
                className="preference-input"
                value={formData.api_rate_limit}
                onChange={(e) => handleChange('api_rate_limit', parseInt(e.target.value) || 1000)}
                disabled={!editing || !canEdit}
                min={100}
                max={100000}
              />
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="preferences-actions">
            {!editing ? (
              <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
                <FiBriefcase /> Edit Preferences
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
        )}
      </form>
    </div>
  );
};

export default TenantPreferences;
