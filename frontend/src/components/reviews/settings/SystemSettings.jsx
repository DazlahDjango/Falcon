// src/components/reviews/settings/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw, Shield, Bell, Database, Activity } from 'lucide-react';
import { useReviewsSystemSettings } from '../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../common';
import SettingsForm from './SettingsForm';
import SettingsReset from './SettingsReset';
import NotificationPreferences from './NotificationPreferences';
import AuditSettings from './AuditSettings';

const SystemSettings = () => {
  const navigate = useNavigate();
  const { settings, loading, error, fetchSettings, updateSettings, canManage } = useReviewsSystemSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (data) => {
    setIsSaving(true);
    try {
      await updateSettings(data);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { key: 'general', label: 'General', icon: <Settings size={16} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { key: 'audit', label: 'Audit', icon: <Shield size={16} /> },
    { key: 'advanced', label: 'Advanced', icon: <Database size={16} /> },
  ];

  if (loading) return <ReviewLoading size="lg" text="Loading system settings..." />;
  if (error) return <ReviewError error={error} onRetry={fetchSettings} />;
  if (!settings) return null;

  return (
    <div className="system-settings">
      <div className="system-settings-header">
        <button className="system-settings-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="system-settings-title">System Settings</h1>
        <div className="system-settings-status">
          <ReviewStatusBadge status={settings.is_default ? 'active' : 'inactive'} size="sm" />
          <span className="system-settings-version">v{settings.version || 1}</span>
        </div>
      </div>

      <div className="system-settings-content">
        <div className="system-settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`system-settings-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="system-settings-body">
          {activeTab === 'general' && (
            <SettingsForm
              settings={settings}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationPreferences
              settings={settings}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}
          {activeTab === 'audit' && (
            <AuditSettings
              settings={settings}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}
          {activeTab === 'advanced' && (
            <div className="system-settings-advanced">
              <div className="system-settings-card">
                <h3 className="system-settings-card-title">
                  <Database size={18} />
                  Advanced Settings
                </h3>
                <div className="system-settings-card-content">
                  <div className="system-settings-info">
                    <span className="system-settings-info-label">Settings Version</span>
                    <span className="system-settings-info-value">{settings.version || 1}</span>
                  </div>
                  <div className="system-settings-info">
                    <span className="system-settings-info-label">Last Updated</span>
                    <span className="system-settings-info-value">
                      {settings.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="system-settings-info">
                    <span className="system-settings-info-label">Updated By</span>
                    <span className="system-settings-info-value">{settings.updated_by || 'System'}</span>
                  </div>
                </div>
              </div>

              <SettingsReset onReset={() => fetchSettings()} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;