// components/tenant/sectors/SectorForm.jsx
import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import { useSectors } from '../../../hooks/tenant';

const SectorForm = ({ sectorId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    sector_type: 'COMMERCIAL',
    description: '',
    icon: '',
    color: '#3b82f6',
    is_active: true,
    metadata: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { create, update, fetchOne } = useSectors({ autoFetch: false });

  const sectorTypes = [
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'NGO', label: 'Non-Profit' },
    { value: 'PUBLIC', label: 'Public Sector' },
    { value: 'CONSULTING', label: 'Consulting' },
  ];

  useEffect(() => {
    if (sectorId) {
      const load = async () => {
        setLoading(true);
        try {
          const sector = await fetchOne(sectorId);
          if (sector) {
            setFormData({
              name: sector.name || '',
              code: sector.code || '',
              sector_type: sector.sector_type || 'COMMERCIAL',
              description: sector.description || '',
              icon: sector.icon || '',
              color: sector.color || '#3b82f6',
              is_active: sector.is_active !== undefined ? sector.is_active : true,
              metadata: sector.metadata || {},
            });
          }
        } catch (err) {
          setError('Failed to load sector');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [sectorId, fetchOne]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'metadata') {
      try {
        setFormData({ ...formData, metadata: JSON.parse(value) });
      } catch {
        setFormData({ ...formData, metadata: {} });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!formData.name) {
        setError('Sector name is required');
        setLoading(false);
        return;
      }
      if (!formData.code) {
        setError('Sector code is required');
        setLoading(false);
        return;
      }
      if (!formData.sector_type) {
        setError('Sector type is required');
        setLoading(false);
        return;
      }
      const submitData = { ...formData };
      submitData.code = submitData.code.toUpperCase();
      let result;
      if (sectorId) {
        result = await update(sectorId, submitData);
      } else {
        result = await create(submitData);
      }
      if (result) {
        onSuccess();
      }
    } catch (err) {
      setError(err?.message || 'Failed to save sector');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sector-space-y-4">
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div className="sector-grid sector-grid-cols-2 sector-gap-4">
        <div>
          <label className="sector-text-xs sector-text-muted sector-font-medium">Sector Name *</label>
          <input
            type="text"
            name="name"
            className="sector-input"
            placeholder="e.g., Healthcare"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="sector-text-xs sector-text-muted sector-font-medium">Code *</label>
          <input
            type="text"
            name="code"
            className="sector-input"
            placeholder="e.g., HEALTH"
            value={formData.code}
            onChange={handleChange}
            required
            disabled={loading || !!sectorId}
          />
          <p className="sector-text-xs sector-text-muted sector-mt-1">Unique identifier, automatically uppercased</p>
        </div>
      </div>

      <div>
        <label className="sector-text-xs sector-text-muted sector-font-medium">Sector Type *</label>
        <select
          name="sector_type"
          className="sector-select"
          value={formData.sector_type}
          onChange={handleChange}
          required
          disabled={loading}
        >
          {sectorTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="sector-text-xs sector-text-muted sector-font-medium">Description</label>
        <textarea
          name="description"
          className="sector-input"
          rows="2"
          placeholder="Brief description of this sector"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="sector-grid sector-grid-cols-2 sector-gap-4">
        <div>
          <label className="sector-text-xs sector-text-muted sector-font-medium">Icon</label>
          <input
            type="text"
            name="icon"
            className="sector-input"
            placeholder="e.g., FiBriefcase"
            value={formData.icon}
            onChange={handleChange}
            disabled={loading}
          />
          <p className="sector-text-xs sector-text-muted sector-mt-1">React icon name or emoji</p>
        </div>
        <div>
          <label className="sector-text-xs sector-text-muted sector-font-medium">Color</label>
          <input
            type="color"
            name="color"
            className="sector-input"
            style={{ padding: '4px', height: '44px' }}
            value={formData.color}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="sector-flex sector-gap-2" style={{ alignItems: 'center' }}>
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          disabled={loading}
        />
        <label htmlFor="is_active" className="sector-text-sm" style={{ color: '#0f172a' }}>Active</label>
      </div>

      <div>
        <label className="sector-text-xs sector-text-muted sector-font-medium">Metadata (JSON)</label>
        <textarea
          name="metadata"
          className="sector-input"
          rows="2"
          placeholder='{"key": "value"}'
          value={JSON.stringify(formData.metadata, null, 2)}
          onChange={handleChange}
          disabled={loading}
          style={{ fontFamily: 'monospace', fontSize: '13px' }}
        />
      </div>

      <div className="sector-divider"></div>
      <div className="sector-flex sector-gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="sector-btn sector-btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="sector-btn sector-btn-primary" disabled={loading}>
          <FiSave size={16} style={{ marginRight: '6px' }} />
          {loading ? 'Saving...' : sectorId ? 'Update Sector' : 'Create Sector'}
        </button>
      </div>
    </form>
  );
};

export default SectorForm;