// components/tenant/schemas/SchemaForm.jsx
import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import { useSchemas, useOrganizations } from '../../../hooks/tenant';

const SchemaForm = ({ schemaId, organizationId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    schema_name: '',
    organization_id: organizationId || '',
    schema_type: 'separate_schema',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { create, update, fetchOne } = useSchemas({ autoFetch: false });
  const { organizations, fetchList: fetchOrganizations } = useOrganizations({ autoFetch: !organizationId });

  useEffect(() => {
    if (!organizationId) {
      fetchOrganizations();
    }
  }, [organizationId, fetchOrganizations]);

  useEffect(() => {
    if (schemaId) {
      const load = async () => {
        setLoading(true);
        try {
          const schema = await fetchOne(schemaId);
          if (schema) {
            setFormData({
              schema_name: schema.schema_name || '',
              organization_id: schema.organization_id || organizationId || '',
              schema_type: schema.schema_type || 'separate_schema',
            });
          }
        } catch (err) {
          setError('Failed to load schema');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [schemaId, fetchOne, organizationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!formData.organization_id) {
        setError('Organization is required');
        setLoading(false);
        return;
      }
      if (!formData.schema_name) {
        setError('Schema name is required');
        setLoading(false);
        return;
      }
      let result;
      if (schemaId) {
        result = await update(schemaId, formData);
      } else {
        result = await create(formData);
      }
      if (result) {
        onSuccess();
      }
    } catch (err) {
      setError(err?.message || 'Failed to save schema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="schema-space-y-4">
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div>
        <label className="schema-text-xs schema-text-muted schema-font-medium">Schema Name *</label>
        <input
          type="text"
          name="schema_name"
          className="schema-input"
          placeholder="org_company_name"
          value={formData.schema_name}
          onChange={handleChange}
          required
          disabled={loading || !!schemaId}
        />
        <p className="schema-text-xs schema-text-muted schema-mt-1">Must start with a letter and contain only letters, numbers, and underscores</p>
      </div>

      {!organizationId && (
        <div>
          <label className="schema-text-xs schema-text-muted schema-font-medium">Organization *</label>
          <select
            name="organization_id"
            className="schema-select"
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

      <div>
        <label className="schema-text-xs schema-text-muted schema-font-medium">Schema Type *</label>
        <select
          name="schema_type"
          className="schema-select"
          value={formData.schema_type}
          onChange={handleChange}
          required
          disabled={loading || !!schemaId}
        >
          <option value="shared_schema">Shared Schema (All tenants in one schema)</option>
          <option value="separate_schema">Separate Schema (Each tenant gets their own schema)</option>
          <option value="separate_database">Separate Database (Each tenant gets their own database)</option>
        </select>
        <p className="schema-text-xs schema-text-muted schema-mt-1">
          Determines how tenant data is isolated. Cannot be changed after creation.
        </p>
      </div>

      <div className="schema-divider"></div>
      <div className="schema-flex schema-gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="schema-btn schema-btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="schema-btn schema-btn-primary" disabled={loading}>
          <FiSave size={16} style={{ marginRight: '6px' }} />
          {loading ? 'Saving...' : schemaId ? 'Update Schema' : 'Create Schema'}
        </button>
      </div>
    </form>
  );
};

export default SchemaForm;