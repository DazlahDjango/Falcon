import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { useOrganizations, useSectors } from '../../../hooks/tenant';
import {
  buildOrganizationPayload,
  SUBSCRIPTION_TIER_OPTIONS,
  SUBSCRIPTION_TIER_LABELS,
} from '../../../services/tenant';

const OrganizationForm = ({ organizationId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    website: '',
    sector_id: '',
    primary_color: '#2563EB',
    secondary_color: '#7C3AED',
    subscription_tier: 'free',
    logo: null,
    favicon: null,
    metadata: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const { create, update, fetchOne, currentOrganization } = useOrganizations({ autoFetch: false });
  const { sectors, fetchList: fetchSectors } = useSectors({ autoFetch: true });

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  useEffect(() => {
    if (organizationId) {
      const load = async () => {
        setLoading(true);
        try {
          const org = await fetchOne(organizationId);
          if (org) {
            setFormData({
              name: org.name || '',
              contact_email: org.contact_email || '',
              contact_phone: org.contact_phone || '',
              contact_address: org.contact_address || '',
              website: org.website || '',
              sector_id: org.sector_id || org.sector?.id || '',
              primary_color: org.primary_color || '#2563EB',
              secondary_color: org.secondary_color || '#7C3AED',
              subscription_tier: org.subscription_tier || 'free',
              logo: null,
              favicon: null,
              metadata: org.metadata || {},
            });
            if (org.logo) setLogoPreview(org.logo);
            if (org.favicon) setFaviconPreview(org.favicon);
          }
        } catch (err) {
          setError('Failed to load organization');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [organizationId, fetchOne]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files?.[0];
      if (file) {
        setFormData({ ...formData, [name]: file });
        if (name === 'logo') {
          const reader = new FileReader();
          reader.onload = () => setLogoPreview(reader.result);
          reader.readAsDataURL(file);
        }
        if (name === 'favicon') {
          const reader = new FileReader();
          reader.onload = () => setFaviconPreview(reader.result);
          reader.readAsDataURL(file);
        }
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim()) {
      setError('Organization name is required');
      return;
    }
    if (!formData.contact_email?.trim()) {
      setError('Contact email is required');
      return;
    }

    setLoading(true);
    try {
      const submitData = buildOrganizationPayload(formData);
      const result = organizationId
        ? await update(organizationId, submitData)
        : await create(submitData);
      if (result) {
        onSuccess(result);
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: null });
    setLogoPreview(null);
  };

  const handleRemoveFavicon = () => {
    setFormData({ ...formData, favicon: null });
    setFaviconPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="org-space-y-4">
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div>
        <label className="org-text-xs org-text-muted org-font-medium">Organization Name *</label>
        <input
          type="text"
          name="name"
          className="org-input"
          placeholder="Enter organization name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label className="org-text-xs org-text-muted org-font-medium">Contact Email *</label>
        <input
          type="email"
          name="contact_email"
          className="org-input"
          placeholder="admin@company.com"
          value={formData.contact_email}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <div className="org-grid org-grid-cols-2 org-gap-4">
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Phone</label>
          <input
            type="tel"
            name="contact_phone"
            className="org-input"
            placeholder="+254712345678"
            value={formData.contact_phone}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Website</label>
          <input
            type="url"
            name="website"
            className="org-input"
            placeholder="https://company.com"
            value={formData.website}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label className="org-text-xs org-text-muted org-font-medium">Address</label>
        <textarea
          name="contact_address"
          className="org-input"
          rows="2"
          placeholder="Street address, city, country"
          value={formData.contact_address}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div className="org-grid org-grid-cols-2 org-gap-4">
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Sector</label>
          <select
            name="sector_id"
            className="org-select"
            value={formData.sector_id}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select sector</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.sector_type})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Subscription Tier</label>
          <select
            name="subscription_tier"
            className="org-select"
            value={formData.subscription_tier}
            onChange={handleChange}
            disabled={loading}
          >
            {SUBSCRIPTION_TIER_OPTIONS.map((tier) => (
              <option key={tier} value={tier}>
                {SUBSCRIPTION_TIER_LABELS[tier] || tier}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="org-grid org-grid-cols-2 org-gap-4">
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Primary Color</label>
          <input
            type="color"
            name="primary_color"
            className="org-input"
            style={{ padding: '4px', height: '44px' }}
            value={formData.primary_color}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Secondary Color</label>
          <input
            type="color"
            name="secondary_color"
            className="org-input"
            style={{ padding: '4px', height: '44px' }}
            value={formData.secondary_color}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <div className="org-grid org-grid-cols-2 org-gap-4">
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Logo</label>
          <div className="org-flex org-gap-2" style={{ alignItems: 'center' }}>
            <input
              type="file"
              name="logo"
              className="org-input"
              style={{ padding: '6px' }}
              accept="image/*"
              onChange={handleChange}
              disabled={loading}
            />
            {logoPreview && (
              <button type="button" className="org-btn org-btn-danger org-btn-sm" onClick={handleRemoveLogo}>
                <FiX size={14} />
              </button>
            )}
          </div>
          {logoPreview && (
            <img src={logoPreview} alt="Logo preview" style={{ maxWidth: '100px', maxHeight: '60px', marginTop: '8px', borderRadius: '4px', objectFit: 'contain' }} />
          )}
        </div>
        <div>
          <label className="org-text-xs org-text-muted org-font-medium">Favicon</label>
          <div className="org-flex org-gap-2" style={{ alignItems: 'center' }}>
            <input
              type="file"
              name="favicon"
              className="org-input"
              style={{ padding: '6px' }}
              accept="image/*"
              onChange={handleChange}
              disabled={loading}
            />
            {faviconPreview && (
              <button type="button" className="org-btn org-btn-danger org-btn-sm" onClick={handleRemoveFavicon}>
                <FiX size={14} />
              </button>
            )}
          </div>
          {faviconPreview && (
            <img src={faviconPreview} alt="Favicon preview" style={{ maxWidth: '40px', maxHeight: '40px', marginTop: '8px', borderRadius: '4px', objectFit: 'contain' }} />
          )}
        </div>
      </div>
      <div className="org-divider"></div>
      <div className="org-flex org-gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="org-btn org-btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="org-btn org-btn-primary" disabled={loading}>
          <FiSave size={16} className="org-gap-2" />
          {loading ? 'Saving...' : organizationId ? 'Update Organization' : 'Create Organization'}
        </button>
      </div>
    </form>
  );
};

export default OrganizationForm;