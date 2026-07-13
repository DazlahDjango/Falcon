// components/tenant/settings/SettingsForm.jsx
import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { useSettings } from '../../../hooks/tenant';
import BrandingSettings from './BrandingSettings';
import FeatureSettings from './FeatureSettings';
import NotificationSettings from './NotificationSettings';

const SettingsForm = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [localSettings, setLocalSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    settings,
    loading: settingsLoading,
    update,
    reset,
    fetchAll,
    clearAllErrors,
  } = useSettings({ autoFetch: true });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleUpdate = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await update(data);
      if (result) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      setLoading(true);
      setError(null);
      try {
        await reset();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err?.message || 'Failed to reset settings');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchAll();
    } catch (err) {
      setError('Failed to refresh settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'branding', label: 'Branding' },
    { key: 'features', label: 'Features' },
    { key: 'notifications', label: 'Notifications' },
  ];

  if (settingsLoading && !settings) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          <div className="settings-loading-spinner"></div>
        </div>
      </div>
    );
  }

  const brandingSettings = localSettings?.branding || {};
  const featureSettings = localSettings?.features || {};
  const notificationSettings = localSettings?.notifications || {};

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Organization Settings</h1>
          <p className="settings-subtitle">Manage your organization configuration</p>
        </div>
        <div className="settings-flex settings-gap-3">
          <button className="settings-btn settings-btn-secondary" onClick={handleRefresh} disabled={loading || settingsLoading}>
            <FiRefreshCw size={16} className={loading ? 'settings-loading-spinner' : ''} style={loading ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
          <button className="settings-btn settings-btn-danger" onClick={handleReset} disabled={loading || settingsLoading}>
            <FiAlertCircle size={16} style={{ marginRight: '6px' }} />
            Reset to Defaults
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
          <button className="settings-btn settings-btn-sm" style={{ background: 'transparent', color: '#991b1b', textDecoration: 'underline', marginLeft: '12px' }} onClick={clearAllErrors}>
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          Settings updated successfully!
        </div>
      )}

      <div className="settings-card">
        <div className="settings-flex settings-gap-2 settings-mb-6" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`settings-btn settings-btn-sm ${activeTab === tab.key ? 'settings-btn-primary' : 'settings-btn-secondary'}`}
              onClick={() => setActiveTab(tab.key)}
              disabled={loading || settingsLoading}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-tab-content">
          {activeTab === 'branding' && (
            <BrandingSettings
              settings={brandingSettings}
              onUpdate={handleUpdate}
              loading={loading || settingsLoading}
            />
          )}
          {activeTab === 'features' && (
            <FeatureSettings
              settings={featureSettings}
              onUpdate={handleUpdate}
              loading={loading || settingsLoading}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings
              settings={notificationSettings}
              onUpdate={handleUpdate}
              loading={loading || settingsLoading}
            />
          )}
        </div>

        <div className="settings-divider"></div>
        <div className="settings-text-xs settings-text-muted">
          Version: {settings?.version || 0} • Last updated: {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Never'}
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;