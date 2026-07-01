import React, { useState, useEffect } from 'react';
import {
  FiServer,
  FiRefreshCw,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiShield,
  FiClock,
  FiUsers,
  FiActivity,
  FiLock,
  FiKey,
  FiBriefcase,
  FiFileText,
} from 'react-icons/fi';
import { useAdmin } from '../../../hooks/accounts/useAdmin';
import { useSystemSettings } from '../../../hooks/accounts/useSystemSettings';

export const AdminSystemSettings = () => {
  const {
    getSystemInfo,
    getSystemHealth,
    clearSystemCache,
    systemInfo,
    systemHealth,
    isLoading,
    error,
    clearError,
  } = useAdmin();

  const {
    getSettings,
    update,
    reset,
    sync,
    settings,
    isLoading: settingsLoading,
    error: settingsError,
    clearError: clearSettingsError,
  } = useSystemSettings();

  const [clearingCache, setClearingCache] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      getSystemInfo(),
      getSystemHealth(),
      getSettings(),
    ]);
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await clearSystemCache();
      await loadData();
    } catch (err) {
      console.error('Failed to clear cache:', err);
    } finally {
      setClearingCache(false);
    }
  };

  const handleSyncPolicy = async () => {
    setSyncing(true);
    try {
      await sync();
      await loadData();
    } catch (err) {
      console.error('Failed to sync policy:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await update(formData);
      setEditMode(false);
      await loadData();
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all system settings to defaults?')) return;
    try {
      await reset();
      await loadData();
    } catch (err) {
      console.error('Failed to reset settings:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !systemInfo) {
    return (
      <div className="admin-system-loading">
        <div className="spinner" />
        <p>Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-system-settings">
      <div className="admin-system-header">
        <div className="admin-system-title">
          <FiServer className="title-icon" />
          <h1>System Settings</h1>
        </div>
        <div className="admin-system-actions">
          <button className="btn-secondary" onClick={handleSyncPolicy} disabled={syncing}>
            <FiRefreshCw className={syncing ? 'spinning' : ''} /> {syncing ? 'Syncing...' : 'Sync Policy'}
          </button>
          <button className="btn-secondary" onClick={handleClearCache} disabled={clearingCache}>
            <FiActivity /> {clearingCache ? 'Clearing...' : 'Clear Cache'}
          </button>
          <button className="btn-icon" onClick={loadData}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-system-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <div className="admin-system-grid">
        <div className="system-card health-card">
          <div className="card-header">
            <h3>System Health</h3>
            <span className={`health-status ${systemHealth?.status}`}>
              {systemHealth?.status === 'healthy' ? <FiCheckCircle /> : <FiAlertCircle />}
              {systemHealth?.status || 'Unknown'}
            </span>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label">Database</span>
              <span className={`stat-value ${systemHealth?.database === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                {systemHealth?.database || 'Unknown'}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Cache</span>
              <span className={`stat-value ${systemHealth?.cache === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                {systemHealth?.cache || 'Unknown'}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Python Version</span>
              <span className="stat-value">{systemHealth?.python_version || '-'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Platform</span>
              <span className="stat-value">{systemHealth?.platform || '-'}</span>
            </div>
          </div>
        </div>

        <div className="system-card info-card">
          <div className="card-header">
            <h3>System Information</h3>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label">Name</span>
              <span className="stat-value">{systemInfo?.system?.name || 'Falcon PMS'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Version</span>
              <span className="stat-value">{systemInfo?.system?.version || '1.0.0'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Environment</span>
              <span className="stat-value">{systemInfo?.system?.environment || 'production'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Last Updated</span>
              <span className="stat-value">{formatDate(systemInfo?.system?.time)}</span>
            </div>
          </div>
        </div>

        <div className="system-card stats-card">
          <div className="card-header">
            <h3>Statistics</h3>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label"><FiUsers /> Total Users</span>
              <span className="stat-value">{systemInfo?.statistics?.total_users || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label"><FiBriefcase /> Total Tenants</span>
              <span className="stat-value">{systemInfo?.statistics?.total_tenants || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label"><FiFileText /> Audit Logs</span>
              <span className="stat-value">{systemInfo?.statistics?.total_audit_logs || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label"><FiClock /> Recent Logins (24h)</span>
              <span className="stat-value">{systemInfo?.statistics?.recent_logins_24h || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {settings && (
        <div className="system-settings-card">
          <div className="card-header">
            <h3>Settings</h3>
            <div className="settings-actions">
              {!editMode ? (
                <button className="btn-secondary-sm" onClick={() => {
                  setFormData(settings);
                  setEditMode(true);
                }}>Edit</button>
              ) : (
                <>
                  <button className="btn-secondary-sm" onClick={() => setEditMode(false)}>Cancel</button>
                  <button className="btn-primary-sm" onClick={handleUpdate}>
                    <FiSave /> Save
                  </button>
                </>
              )}
              <button className="btn-danger-sm" onClick={handleReset}>Reset</button>
            </div>
          </div>
          <div className="card-content">
            {settingsError && (
              <div className="settings-error">
                <FiAlertCircle /> {settingsError}
                <button onClick={clearSettingsError}>×</button>
              </div>
            )}
            <div className="settings-grid">
              <div className="settings-group">
                <h4><FiLock /> Security</h4>
                <div className="settings-item">
                  <label>MFA Required Roles</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={editMode ? formData?.mfa?.required_roles?.join(', ') || '' : settings?.mfa?.required_roles?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      mfa: { ...formData?.mfa, required_roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                    })}
                    disabled={!editMode}
                    placeholder="super_admin, client_admin"
                  />
                </div>
              </div>
              <div className="settings-group">
                <h4><FiClock /> Sessions</h4>
                <div className="settings-item">
                  <label>Max Concurrent Sessions</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={editMode ? formData?.sessions?.max_concurrent_sessions || 5 : settings?.sessions?.max_concurrent_sessions || 5}
                    onChange={(e) => setFormData({
                      ...formData,
                      sessions: { ...formData?.sessions, max_concurrent_sessions: parseInt(e.target.value) || 5 }
                    })}
                    disabled={!editMode}
                  />
                </div>
                <div className="settings-item">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={editMode ? formData?.sessions?.default_timeout_minutes || 480 : settings?.sessions?.default_timeout_minutes || 480}
                    onChange={(e) => setFormData({
                      ...formData,
                      sessions: { ...formData?.sessions, default_timeout_minutes: parseInt(e.target.value) || 480 }
                    })}
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div className="settings-group">
                <h4><FiKey /> Password</h4>
                <div className="settings-item">
                  <label>Password Expiry (days)</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={editMode ? formData?.password?.expiry_days || 90 : settings?.password?.expiry_days || 90}
                    onChange={(e) => setFormData({
                      ...formData,
                      password: { ...formData?.password, expiry_days: parseInt(e.target.value) || 90 }
                    })}
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div className="settings-group">
                <h4><FiFileText /> Audit</h4>
                <div className="settings-item">
                  <label>Audit Log Retention (days)</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={editMode ? formData?.audit?.retention_days || 365 : settings?.audit?.retention_days || 365}
                    onChange={(e) => setFormData({
                      ...formData,
                      audit: { ...formData?.audit, retention_days: parseInt(e.target.value) || 365 }
                    })}
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div className="settings-group">
                <h4><FiShield /> Lockout</h4>
                <div className="settings-item">
                  <label>Failure Limit</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={editMode ? formData?.lockout?.failure_limit || 5 : settings?.lockout?.failure_limit || 5}
                    onChange={(e) => setFormData({
                      ...formData,
                      lockout: { ...formData?.lockout, failure_limit: parseInt(e.target.value) || 5 }
                    })}
                    disabled={!editMode}
                  />
                </div>
                <div className="settings-item">
                  <label>Lockout Minutes</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={editMode ? formData?.lockout?.lockout_minutes || 15 : settings?.lockout?.lockout_minutes || 15}
                    onChange={(e) => setFormData({
                      ...formData,
                      lockout: { ...formData?.lockout, lockout_minutes: parseInt(e.target.value) || 15 }
                    })}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSystemSettings;