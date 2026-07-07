// components/tenant/settings/FeatureSettings.jsx
import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';

const FeatureSettings = ({ settings, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    custom_domains: settings?.custom_domains || false,
    ssl_auto_renew: settings?.ssl_auto_renew || false,
    multi_factor_auth: settings?.multi_factor_auth || false,
    audit_logs: settings?.audit_logs || false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) onUpdate({ features: formData });
  };

  const features = [
    { key: 'custom_domains', label: 'Custom Domains', description: 'Allow organizations to use custom domains' },
    { key: 'ssl_auto_renew', label: 'SSL Auto-Renew', description: 'Automatically renew SSL certificates before expiry' },
    { key: 'multi_factor_auth', label: 'Multi-Factor Authentication', description: 'Require MFA for admin users' },
    { key: 'audit_logs', label: 'Audit Logs', description: 'Track all system actions for compliance' },
  ];

  return (
    <form onSubmit={handleSubmit} className="settings-space-y-4">
      {features.map((feature) => (
        <div key={feature.key} className="settings-flex settings-gap-3" style={{ alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            name={feature.key}
            id={feature.key}
            checked={formData[feature.key]}
            onChange={handleChange}
            disabled={loading}
            style={{ marginTop: '2px' }}
          />
          <div>
            <label htmlFor={feature.key} className="settings-text-sm" style={{ color: '#0f172a', fontWeight: 500 }}>
              {feature.label}
            </label>
            <p className="settings-text-xs settings-text-muted">{feature.description}</p>
          </div>
        </div>
      ))}
      <div className="settings-divider"></div>
      <div className="settings-flex settings-gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="settings-btn settings-btn-primary" disabled={loading}>
          <FiSave size={16} style={{ marginRight: '6px' }} />
          {loading ? 'Saving...' : 'Save Features'}
        </button>
      </div>
    </form>
  );
};

export default FeatureSettings;