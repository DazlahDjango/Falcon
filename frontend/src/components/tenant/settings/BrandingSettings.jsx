// components/tenant/settings/BrandingSettings.jsx
import React, { useState } from 'react';
import { FiSave, FiRefreshCw } from 'react-icons/fi';

const BrandingSettings = ({ settings, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    primary_color: settings?.primary_color || '#2563EB',
    secondary_color: settings?.secondary_color || '#7C3AED',
    logo_url: settings?.logo_url || '',
    favicon_url: settings?.favicon_url || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) onUpdate({ branding: formData });
  };

  return (
    <form onSubmit={handleSubmit} className="settings-space-y-4">
      <div className="settings-grid settings-grid-cols-2 settings-gap-4">
        <div>
          <label className="settings-text-xs settings-text-muted settings-font-medium">Primary Color</label>
          <input
            type="color"
            name="primary_color"
            className="settings-input"
            style={{ padding: '4px', height: '44px' }}
            value={formData.primary_color}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <label className="settings-text-xs settings-text-muted settings-font-medium">Secondary Color</label>
          <input
            type="color"
            name="secondary_color"
            className="settings-input"
            style={{ padding: '4px', height: '44px' }}
            value={formData.secondary_color}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label className="settings-text-xs settings-text-muted settings-font-medium">Logo URL</label>
        <input
          type="text"
          name="logo_url"
          className="settings-input"
          placeholder="https://example.com/logo.png"
          value={formData.logo_url}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div>
        <label className="settings-text-xs settings-text-muted settings-font-medium">Favicon URL</label>
        <input
          type="text"
          name="favicon_url"
          className="settings-input"
          placeholder="https://example.com/favicon.ico"
          value={formData.favicon_url}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div className="settings-flex settings-gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="settings-btn settings-btn-primary" disabled={loading}>
          <FiSave size={16} style={{ marginRight: '6px' }} />
          {loading ? 'Saving...' : 'Save Branding'}
        </button>
      </div>
    </form>
  );
};

export default BrandingSettings;