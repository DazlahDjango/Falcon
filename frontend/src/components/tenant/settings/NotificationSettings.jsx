// components/tenant/settings/NotificationSettings.jsx
import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';

const NotificationSettings = ({ settings, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    daily_summary: settings?.daily_summary || false,
    weekly_report: settings?.weekly_report || false,
    monthly_report: settings?.monthly_report || false,
    alerts: {
      resource_warning: settings?.alerts?.resource_warning || false,
      ssl_expiry: settings?.alerts?.ssl_expiry || false,
      migration_complete: settings?.alerts?.migration_complete || false,
      domain_verified: settings?.alerts?.domain_verified || false,
    },
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    if (name.startsWith('alert_')) {
      const alertKey = name.replace('alert_', '');
      setFormData({
        ...formData,
        alerts: { ...formData.alerts, [alertKey]: checked },
      });
    } else {
      setFormData({ ...formData, [name]: checked });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) onUpdate({ notifications: formData });
  };

  const alertTypes = [
    { key: 'resource_warning', label: 'Resource Warning', description: 'Notify when resources exceed warning threshold' },
    { key: 'ssl_expiry', label: 'SSL Expiry', description: 'Notify when SSL certificates are about to expire' },
    { key: 'migration_complete', label: 'Migration Complete', description: 'Notify when migrations finish' },
    { key: 'domain_verified', label: 'Domain Verified', description: 'Notify when domains are successfully verified' },
  ];

  return (
    <form onSubmit={handleSubmit} className="settings-space-y-4">
      <div className="settings-grid settings-grid-cols-2 settings-gap-4">
        <div className="settings-flex settings-gap-3" style={{ alignItems: 'center' }}>
          <input
            type="checkbox"
            name="daily_summary"
            id="daily_summary"
            checked={formData.daily_summary}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="daily_summary" className="settings-text-sm" style={{ color: '#0f172a' }}>Daily Summary</label>
        </div>
        <div className="settings-flex settings-gap-3" style={{ alignItems: 'center' }}>
          <input
            type="checkbox"
            name="weekly_report"
            id="weekly_report"
            checked={formData.weekly_report}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="weekly_report" className="settings-text-sm" style={{ color: '#0f172a' }}>Weekly Report</label>
        </div>
        <div className="settings-flex settings-gap-3" style={{ alignItems: 'center' }}>
          <input
            type="checkbox"
            name="monthly_report"
            id="monthly_report"
            checked={formData.monthly_report}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="monthly_report" className="settings-text-sm" style={{ color: '#0f172a' }}>Monthly Report</label>
        </div>
      </div>

      <div className="settings-divider"></div>
      <h4 className="settings-font-semibold settings-text-sm" style={{ color: '#0f172a' }}>Alert Preferences</h4>
      {alertTypes.map((alert) => (
        <div key={alert.key} className="settings-flex settings-gap-3" style={{ alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            name={`alert_${alert.key}`}
            id={`alert_${alert.key}`}
            checked={formData.alerts[alert.key]}
            onChange={handleChange}
            disabled={loading}
            style={{ marginTop: '2px' }}
          />
          <div>
            <label htmlFor={`alert_${alert.key}`} className="settings-text-sm" style={{ color: '#0f172a', fontWeight: 500 }}>
              {alert.label}
            </label>
            <p className="settings-text-xs settings-text-muted">{alert.description}</p>
          </div>
        </div>
      ))}

      <div className="settings-divider"></div>
      <div className="settings-flex settings-gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="settings-btn settings-btn-primary" disabled={loading}>
          <FiSave size={16} style={{ marginRight: '6px' }} />
          {loading ? 'Saving...' : 'Save Notifications'}
        </button>
      </div>
    </form>
  );
};

export default NotificationSettings;