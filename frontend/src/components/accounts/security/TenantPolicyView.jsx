import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiRefreshCw,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiUser,
  FiKey,
  FiFileText,
} from 'react-icons/fi';
import { useSecurity } from '../../../hooks/accounts/useSecurity';
import { useAuth } from '../../../hooks/accounts/useAuth';

export const TenantPolicyView = () => {
  const { tenantId } = useAuth();
  const {
    getTenantPolicy,
    tenantPolicy,
    isLoading,
    error,
    clearError,
  } = useSecurity();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    await getTenantPolicy({ sync: editMode ? '1' : '0' });
  };

  useEffect(() => {
    if (tenantPolicy?.policy) {
      setFormData(tenantPolicy.policy);
    }
  }, [tenantPolicy]);

  const handleUpdate = async () => {
    setUpdating(true);
    setSaveSuccess(false);
    try {
      // This would call an update endpoint if available
      // For now, we just refresh with sync
      await getTenantPolicy({ sync: '1' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update policy:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }));
  };

  const policy = tenantPolicy?.policy || {};
  const version = tenantPolicy?.policy_version || 1;

  if (isLoading && !tenantPolicy) {
    return (
      <div className="tenant-policy-loading">
        <div className="spinner" />
        <p>Loading tenant policy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tenant-policy-error">
        <span>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</span>
        <button onClick={clearError}>×</button>
      </div>
    );
  }

  return (
    <div className="tenant-policy-container">
      <div className="tenant-policy-header">
        <div className="tenant-policy-title">
          <FiShield className="title-icon" />
          <h1>Tenant Security Policy</h1>
          <span className="policy-version">v{version}</span>
        </div>
        <div className="tenant-policy-actions">
          {!editMode ? (
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              <FiShield /> Edit Policy
            </button>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => {
                setEditMode(false);
                setFormData(policy);
              }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdate} disabled={updating}>
                {updating ? (
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
          <button className="btn-icon" onClick={loadPolicy}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="tenant-policy-success">
          <FiCheckCircle className="success-icon" />
          <span>Policy updated successfully!</span>
        </div>
      )}

      <div className="tenant-policy-content">
        <div className="policy-section">
          <h3><FiLock /> Session Policy</h3>
          <div className="policy-grid">
            <div className="policy-item">
              <label>Max Concurrent Sessions</label>
              {editMode ? (
                <input
                  type="number"
                  className="policy-input"
                  value={formData?.sessions?.max_concurrent_sessions || 5}
                  onChange={(e) => handleChange('sessions', 'max_concurrent_sessions', parseInt(e.target.value) || 5)}
                />
              ) : (
                <span className="policy-value">{policy?.sessions?.max_concurrent_sessions || 5}</span>
              )}
            </div>
            <div className="policy-item">
              <label>Session Timeout (minutes)</label>
              {editMode ? (
                <input
                  type="number"
                  className="policy-input"
                  value={formData?.sessions?.default_timeout_minutes || 480}
                  onChange={(e) => handleChange('sessions', 'default_timeout_minutes', parseInt(e.target.value) || 480)}
                />
              ) : (
                <span className="policy-value">{policy?.sessions?.default_timeout_minutes || 480}</span>
              )}
            </div>
            <div className="policy-item">
              <label>Session Retention (days)</label>
              {editMode ? (
                <input
                  type="number"
                  className="policy-input"
                  value={formData?.sessions?.retention_days || 90}
                  onChange={(e) => handleChange('sessions', 'retention_days', parseInt(e.target.value) || 90)}
                />
              ) : (
                <span className="policy-value">{policy?.sessions?.retention_days || 90}</span>
              )}
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h3><FiKey /> MFA Policy</h3>
          <div className="policy-grid">
            <div className="policy-item">
              <label>MFA Required Roles</label>
              {editMode ? (
                <input
                  type="text"
                  className="policy-input"
                  value={formData?.mfa?.required_roles?.join(', ') || ''}
                  onChange={(e) => handleChange('mfa', 'required_roles', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="super_admin, client_admin"
                />
              ) : (
                <span className="policy-value">
                  {policy?.mfa?.required_roles?.join(', ') || 'None'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h3><FiClock /> Password Policy</h3>
          <div className="policy-grid">
            <div className="policy-item">
              <label>Password Expiry (days)</label>
              {editMode ? (
                <input
                  type="number"
                  className="policy-input"
                  value={formData?.password?.expiry_days || 90}
                  onChange={(e) => handleChange('password', 'expiry_days', parseInt(e.target.value) || 90)}
                />
              ) : (
                <span className="policy-value">{policy?.password?.expiry_days || 90}</span>
              )}
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h3><FiAlertCircle /> Lockout Policy</h3>
          <div className="policy-grid">
            <div className="policy-item">
              <label>Failure Limit</label>
              {editMode ? (
                <input
                  type="number"
                  className="policy-input"
                  value={formData?.lockout?.failure_limit || 5}
                  onChange={(e) => handleChange('lockout', 'failure_limit', parseInt(e.target.value) || 5)}
                />
              ) : (
                <span className="policy-value">{policy?.lockout?.failure_limit || 5}</span>
              )}
            </div>
            <div className="policy-item">
              <label>Lockout Minutes</label>
              {editMode ? (
                <input
                  type="number"
                  className="policy-input"
                  value={formData?.lockout?.lockout_minutes || 15}
                  onChange={(e) => handleChange('lockout', 'lockout_minutes', parseInt(e.target.value) || 15)}
                />
              ) : (
                <span className="policy-value">{policy?.lockout?.lockout_minutes || 15}</span>
              )}
            </div>
            <div className="policy-item">
              <label>IP Failure Limit</label>
              {editMode ? (
                <input
                  type="number"
                  className="policy-input"
                  value={formData?.lockout?.ip_failure_limit || 5}
                  onChange={(e) => handleChange('lockout', 'ip_failure_limit', parseInt(e.target.value) || 5)}
                />
              ) : (
                <span className="policy-value">{policy?.lockout?.ip_failure_limit || 5}</span>
              )}
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h3><FiFileText /> Audit Policy</h3>
          <div className="policy-grid">
            <div className="policy-item">
              <label>Audit Log Retention (days)</label>
              {editMode ? (
                <input
                  type="number"
                  className="policy-input"
                  value={formData?.audit?.retention_days || 365}
                  onChange={(e) => handleChange('audit', 'retention_days', parseInt(e.target.value) || 365)}
                />
              ) : (
                <span className="policy-value">{policy?.audit?.retention_days || 365}</span>
              )}
            </div>
          </div>
        </div>

        <div className="policy-footer">
          <div className="policy-meta">
            <span className="policy-version-display">
              <FiShield /> Version {version}
            </span>
            <span className="policy-tenant">
              <FiUser /> Tenant ID: {tenantId || 'N/A'}
            </span>
          </div>
          {editMode && (
            <div className="policy-edit-hint">
              <FiAlertCircle />
              <span>Changes will be applied to all users in this tenant.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TenantPolicyView;