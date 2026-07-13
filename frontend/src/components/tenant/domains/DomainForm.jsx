// components/tenant/domains/DomainForm.jsx
import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import { useDomains, useOrganizations } from '../../../hooks/tenant';

const DomainForm = ({ domainId, organizationId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    domain: '',
    organization_id: organizationId || '',
    is_primary: false,
    force_https: true,
    redirect_to: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { create, update, fetchOne } = useDomains({ autoFetch: false });
  const { organizations, fetchList: fetchOrganizations } = useOrganizations({ autoFetch: !organizationId });

  useEffect(() => {
    if (!organizationId) {
      fetchOrganizations();
    }
  }, [organizationId, fetchOrganizations]);

  useEffect(() => {
    if (domainId) {
      const load = async () => {
        setLoading(true);
        try {
          const domain = await fetchOne(domainId);
          if (domain) {
            setFormData({
              domain: domain.domain || '',
              organization_id: domain.organization_id || organizationId || '',
              is_primary: domain.is_primary || false,
              force_https: domain.force_https !== undefined ? domain.force_https : true,
              redirect_to: domain.redirect_to || '',
            });
          }
        } catch (err) {
          setError('Failed to load domain');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [domainId, fetchOne, organizationId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const submitData = { ...formData };
      if (!submitData.organization_id) {
        setError('Organization is required');
        setLoading(false);
        return;
      }
      let result;
      if (domainId) {
        result = await update(domainId, submitData);
      } else {
        result = await create(submitData);
      }
      if (result) {
        onSuccess();
      }
    } catch (err) {
      setError(err?.message || 'Failed to save domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="domain-space-y-4">
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div>
        <label className="domain-text-xs domain-text-muted domain-font-medium">Domain Name *</label>
        <input
          type="text"
          name="domain"
          className="domain-input"
          placeholder="example.com"
          value={formData.domain}
          onChange={handleChange}
          required
          disabled={loading || !!domainId}
        />
      </div>

      {!organizationId && (
        <div>
          <label className="domain-text-xs domain-text-muted domain-font-medium">Organization *</label>
          <select
            name="organization_id"
            className="domain-select"
            value={formData.organization_id}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="domain-flex domain-gap-4">
        <div className="domain-flex domain-gap-2" style={{ alignItems: 'center' }}>
          <input
            type="checkbox"
            name="is_primary"
            id="is_primary"
            checked={formData.is_primary}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="is_primary" className="domain-text-sm" style={{ color: '#0f172a' }}>Set as primary domain</label>
        </div>
        <div className="domain-flex domain-gap-2" style={{ alignItems: 'center' }}>
          <input
            type="checkbox"
            name="force_https"
            id="force_https"
            checked={formData.force_https}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="force_https" className="domain-text-sm" style={{ color: '#0f172a' }}>Force HTTPS</label>
        </div>
      </div>

      <div>
        <label className="domain-text-xs domain-text-muted domain-font-medium">Redirect To</label>
        <input
          type="text"
          name="redirect_to"
          className="domain-input"
          placeholder="https://www.example.com"
          value={formData.redirect_to}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="domain-divider"></div>
      <div className="domain-flex domain-gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="domain-btn domain-btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="domain-btn domain-btn-primary" disabled={loading}>
          <FiSave size={16} style={{ marginRight: '6px' }} />
          {loading ? 'Saving...' : domainId ? 'Update Domain' : 'Add Domain'}
        </button>
      </div>
    </form>
  );
};

export default DomainForm;