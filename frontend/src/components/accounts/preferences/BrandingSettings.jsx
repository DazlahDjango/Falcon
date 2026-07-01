import React, { useState, useEffect } from 'react';
import {
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiUpload,
  FiX,
  FiImage,
  FiLink,
} from 'react-icons/fi';
import { Palette } from 'lucide-react';
import { usePreferences } from '../../../hooks/accounts/usePreferences';
import { useAuth } from '../../../hooks/accounts/useAuth';

export const BrandingSettings = () => {
  const { isSuperAdmin } = useAuth();
  const {
    tenantPreferences,
    getMyTenantPreferences,
    updateBranding,
    isLoading,
    error,
    clearError,
  } = usePreferences();

  const [formData, setFormData] = useState({
    logo_url: '',
    favicon_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#6B7280',
  });
  const [submitted, setSubmitted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (tenantPreferences) {
      setFormData({
        logo_url: tenantPreferences.logo_url || '',
        favicon_url: tenantPreferences.favicon_url || '',
        primary_color: tenantPreferences.primary_color || '#3B82F6',
        secondary_color: tenantPreferences.secondary_color || '#6B7280',
      });
      setLogoPreview(tenantPreferences.logo_url || null);
      setFaviconPreview(tenantPreferences.favicon_url || null);
    }
  }, [tenantPreferences]);

  const loadPreferences = async () => {
    await getMyTenantPreferences();
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleColorChange = (key, value) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value) || value === '') {
      handleChange(key, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    setSaveSuccess(false);

    try {
      const result = await updateBranding(formData);
      if (result.success !== false) {
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
        await loadPreferences();
      } else {
        setFormError(result.error || 'Failed to update branding');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to update branding');
    }
  };

  const handleReset = () => {
    if (tenantPreferences) {
      setFormData({
        logo_url: tenantPreferences.logo_url || '',
        favicon_url: tenantPreferences.favicon_url || '',
        primary_color: tenantPreferences.primary_color || '#3B82F6',
        secondary_color: tenantPreferences.secondary_color || '#6B7280',
      });
      setLogoPreview(tenantPreferences.logo_url || null);
      setFaviconPreview(tenantPreferences.favicon_url || null);
      setEditing(false);
    }
  };

  const canEdit = isSuperAdmin();

  if (isLoading && !tenantPreferences) {
    return (
      <div className="branding-settings-loading">
        <div className="spinner" />
        <p>Loading branding settings...</p>
      </div>
    );
  }

  return (
    <div className="branding-settings-container">
      <div className="branding-settings-header">
        <div className="branding-settings-title">
          <Palette className="title-icon" />
          <h1>Branding Settings</h1>
        </div>
        <div className="branding-settings-actions">
          <button className="btn-icon" onClick={loadPreferences}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="branding-settings-success">
          <FiCheckCircle className="success-icon" />
          <span>Branding updated successfully!</span>
        </div>
      )}

      {formError && (
        <div className="branding-settings-error">
          <FiAlertCircle className="error-icon" />
          <span>{formError}</span>
          <button onClick={() => setFormError(null)}>×</button>
        </div>
      )}

      <form className="branding-settings-form" onSubmit={handleSubmit}>
        <div className="branding-section">
          <h3>Logo</h3>
          <div className="branding-preview">
            <div className="logo-preview">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="logo-image" />
              ) : (
                <div className="logo-placeholder">
                  <FiImage />
                  <span>No logo set</span>
                </div>
              )}
            </div>
            <div className="branding-input-group">
              <label className="branding-label">Logo URL</label>
              <div className="branding-input-wrapper">
                <FiLink className="input-icon" />
                <input
                  type="text"
                  className="branding-input"
                  value={formData.logo_url}
                  onChange={(e) => {
                    handleChange('logo_url', e.target.value);
                    setLogoPreview(e.target.value);
                  }}
                  placeholder="https://example.com/logo.png"
                  disabled={!editing || !canEdit}
                />
              </div>
              <span className="branding-hint">Enter a URL for your organization logo</span>
            </div>
          </div>
        </div>

        <div className="branding-section">
          <h3>Favicon</h3>
          <div className="branding-preview">
            <div className="favicon-preview">
              {faviconPreview ? (
                <img src={faviconPreview} alt="Favicon preview" className="favicon-image" />
              ) : (
                <div className="favicon-placeholder">
                  <FiImage />
                  <span>No favicon set</span>
                </div>
              )}
            </div>
            <div className="branding-input-group">
              <label className="branding-label">Favicon URL</label>
              <div className="branding-input-wrapper">
                <FiLink className="input-icon" />
                <input
                  type="text"
                  className="branding-input"
                  value={formData.favicon_url}
                  onChange={(e) => {
                    handleChange('favicon_url', e.target.value);
                    setFaviconPreview(e.target.value);
                  }}
                  placeholder="https://example.com/favicon.ico"
                  disabled={!editing || !canEdit}
                />
              </div>
              <span className="branding-hint">Enter a URL for your favicon (16x16 or 32x32)</span>
            </div>
          </div>
        </div>

        <div className="branding-section">
          <h3>Colors</h3>
          <div className="branding-colors">
            <div className="color-item">
              <label className="branding-label">Primary Color</label>
              <div className="color-picker-wrapper">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: formData.primary_color || '#3B82F6' }}
                />
                <input
                  type="color"
                  className="color-picker"
                  value={formData.primary_color || '#3B82F6'}
                  onChange={(e) => handleColorChange('primary_color', e.target.value)}
                  disabled={!editing || !canEdit}
                />
                <input
                  type="text"
                  className="color-hex-input"
                  value={formData.primary_color || '#3B82F6'}
                  onChange={(e) => handleColorChange('primary_color', e.target.value)}
                  placeholder="#3B82F6"
                  disabled={!editing || !canEdit}
                />
              </div>
            </div>

            <div className="color-item">
              <label className="branding-label">Secondary Color</label>
              <div className="color-picker-wrapper">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: formData.secondary_color || '#6B7280' }}
                />
                <input
                  type="color"
                  className="color-picker"
                  value={formData.secondary_color || '#6B7280'}
                  onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                  disabled={!editing || !canEdit}
                />
                <input
                  type="text"
                  className="color-hex-input"
                  value={formData.secondary_color || '#6B7280'}
                  onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                  placeholder="#6B7280"
                  disabled={!editing || !canEdit}
                />
              </div>
            </div>
          </div>

          <div className="color-preview-section">
            <h4>Preview</h4>
            <div className="color-preview-boxes">
              <div
                className="color-preview-box primary"
                style={{ backgroundColor: formData.primary_color || '#3B82F6' }}
              >
                Primary
              </div>
              <div
                className="color-preview-box secondary"
                style={{ backgroundColor: formData.secondary_color || '#6B7280' }}
              >
                Secondary
              </div>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="branding-actions">
            {!editing ? (
              <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
                <Palette /> Edit Branding
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

export default BrandingSettings;
