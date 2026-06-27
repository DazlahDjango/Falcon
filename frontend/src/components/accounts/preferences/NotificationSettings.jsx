import React, { useState, useEffect } from 'react';
import {
  FiBell,
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiMail,
  FiMessageSquare,
  FiBell as FiBellIcon,
  FiSmartphone,
  FiGlobe,
} from 'react-icons/fi';
import { usePreferences } from '../../../hooks/accounts/usePreferences';

export const NotificationSettings = () => {
  const {
    userPreferences,
    getMyPreferences,
    updateNotificationSettings,
    isLoading,
    error,
    clearError,
  } = usePreferences();

  const [formData, setFormData] = useState({
    kpi_submission: ['in_app', 'email'],
    kpi_approval: ['in_app', 'email'],
    kpi_rejection: ['in_app', 'email', 'push'],
    review_assigned: ['in_app', 'email'],
    review_completed: ['in_app'],
    escalation_created: ['in_app', 'email'],
    escalation_resolved: ['in_app'],
    system_alert: ['in_app', 'email', 'push'],
    security_alert: ['in_app', 'email', 'push'],
    mfa_event: ['in_app', 'email'],
    weekly_summary: ['email'],
    monthly_report: ['email'],
  });
  const [submitted, setSubmitted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editing, setEditing] = useState(false);

  const notificationEvents = [
    { key: 'kpi_submission', label: 'KPI Submission' },
    { key: 'kpi_approval', label: 'KPI Approval' },
    { key: 'kpi_rejection', label: 'KPI Rejection' },
    { key: 'review_assigned', label: 'Review Assigned' },
    { key: 'review_completed', label: 'Review Completed' },
    { key: 'escalation_created', label: 'Escalation Created' },
    { key: 'escalation_resolved', label: 'Escalation Resolved' },
    { key: 'system_alert', label: 'System Alert' },
    { key: 'security_alert', label: 'Security Alert' },
    { key: 'mfa_event', label: 'MFA Event' },
    { key: 'weekly_summary', label: 'Weekly Summary' },
    { key: 'monthly_report', label: 'Monthly Report' },
  ];

  const channelOptions = [
    { value: 'in_app', label: 'In-App', icon: FiBellIcon },
    { value: 'email', label: 'Email', icon: FiMail },
    { value: 'push', label: 'Push', icon: FiSmartphone },
    { value: 'sms', label: 'SMS', icon: FiMessageSquare },
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (userPreferences?.notification_settings) {
      const settings = userPreferences.notification_settings;
      setFormData((prev) => ({
        ...prev,
        ...settings,
      }));
    }
  }, [userPreferences]);

  const loadPreferences = async () => {
    await getMyPreferences();
  };

  const handleToggleChannel = (eventKey, channel) => {
    setFormData((prev) => {
      const current = prev[eventKey] || [];
      if (current.includes(channel)) {
        return { ...prev, [eventKey]: current.filter((c) => c !== channel) };
      }
      return { ...prev, [eventKey]: [...current, channel] };
    });
  };

  const handleToggleAll = (eventKey) => {
    setFormData((prev) => {
      const current = prev[eventKey] || [];
      if (current.length === channelOptions.length) {
        return { ...prev, [eventKey]: [] };
      }
      return { ...prev, [eventKey]: channelOptions.map((c) => c.value) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    setSaveSuccess(false);

    try {
      const result = await updateNotificationSettings(formData);
      if (result.success !== false) {
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
        await loadPreferences();
      } else {
        setFormError(result.error || 'Failed to update notification settings');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to update notification settings');
    }
  };

  const handleReset = () => {
    if (userPreferences?.notification_settings) {
      setFormData(userPreferences.notification_settings);
      setEditing(false);
    }
  };

  if (isLoading && !userPreferences) {
    return (
      <div className="notification-settings-loading">
        <div className="spinner" />
        <p>Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="notification-settings-container">
      <div className="notification-settings-header">
        <div className="notification-settings-title">
          <FiBell className="title-icon" />
          <h1>Notification Settings</h1>
        </div>
        <div className="notification-settings-actions">
          <button className="btn-icon" onClick={loadPreferences}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="notification-settings-success">
          <FiCheckCircle className="success-icon" />
          <span>Notification settings updated successfully!</span>
        </div>
      )}

      {formError && (
        <div className="notification-settings-error">
          <FiAlertCircle className="error-icon" />
          <span>{formError}</span>
          <button onClick={() => setFormError(null)}>×</button>
        </div>
      )}

      <form className="notification-settings-form" onSubmit={handleSubmit}>
        <div className="notification-section">
          <div className="notification-legend">
            <span className="legend-title">Channels</span>
            <div className="legend-channels">
              {channelOptions.map((channel) => {
                const Icon = channel.icon;
                return (
                  <span key={channel.value} className="legend-channel">
                    <Icon /> {channel.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="notification-grid">
            {notificationEvents.map((event) => (
              <div key={event.key} className="notification-item">
                <span className="notification-event">{event.label}</span>
                <div className="notification-channels">
                  {channelOptions.map((channel) => (
                    <button
                      key={channel.value}
                      type="button"
                      className={`channel-btn ${formData[event.key]?.includes(channel.value) ? 'active' : ''}`}
                      onClick={() => handleToggleChannel(event.key, channel.value)}
                      disabled={!editing}
                      title={channel.label}
                    >
                      {channel.icon({ className: 'channel-icon' })}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`channel-btn toggle-all ${formData[event.key]?.length === channelOptions.length ? 'active' : ''}`}
                    onClick={() => handleToggleAll(event.key)}
                    disabled={!editing}
                    title="Toggle all channels"
                  >
                    <FiGlobe className="channel-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="notification-actions">
          {!editing ? (
            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              <FiBell /> Edit Notifications
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

export default NotificationSettings;
