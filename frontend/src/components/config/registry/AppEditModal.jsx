import { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import { RECOVERY_PRIORITY_LABELS } from '../../../config/constants/configConstants';

export const AppEditModal = ({ app, onClose, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    display_name: '',
    is_critical: false,
    recovery_priority: 3,
    rpo_minutes: 240,
    rto_minutes: 480,
    backup_retention_days: 30,
    health_check_endpoint: '',
  });

  useEffect(() => {
    if (app) {
      setFormData({
        display_name: app.display_name || '',
        is_critical: app.is_critical ?? false,
        recovery_priority: app.recovery_priority ?? 3,
        rpo_minutes: app.rpo_minutes ?? 240,
        rto_minutes: app.rto_minutes ?? 480,
        backup_retention_days: app.backup_retention_days ?? 30,
        health_check_endpoint: app.health_check_endpoint || '',
      });
    }
  }, [app]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rto_minutes < formData.rpo_minutes) {
      alert('RTO must be greater than or equal to RPO (availability constraint).');
      return;
    }
    onSave(formData);
  };

  if (!app) return null;

  return (
    <div className="config-registry-modal-overlay">
      <div className="config-registry-modal">
        <div className="config-registry-modal-header">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Edit Registry Entry</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{app.name_display || app.name}</p>
          </div>
          <button type="button" onClick={onClose} style={{ color: '#9ca3af' }}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="config-registry-form">
          <div>
            <label className="config-registry-form-label">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="config-registry-form-input"
              required
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={formData.is_critical}
              onChange={(e) => setFormData({ ...formData, is_critical: e.target.checked })}
            />
            Critical app (immediate recovery — Availability)
          </label>
          <div>
            <label className="config-registry-form-label">Recovery Priority</label>
            <select
              value={formData.recovery_priority}
              onChange={(e) => setFormData({ ...formData, recovery_priority: parseInt(e.target.value, 10) })}
              className="config-registry-form-input"
            >
              {Object.entries(RECOVERY_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="config-registry-form-grid-2">
            <div>
              <label className="config-registry-form-label">RPO (minutes)</label>
              <input
                type="number"
                min={5}
                value={formData.rpo_minutes}
                onChange={(e) => setFormData({ ...formData, rpo_minutes: parseInt(e.target.value, 10) })}
                className="config-registry-form-input"
              />
            </div>
            <div>
              <label className="config-registry-form-label">RTO (minutes)</label>
              <input
                type="number"
                min={15}
                value={formData.rto_minutes}
                onChange={(e) => setFormData({ ...formData, rto_minutes: parseInt(e.target.value, 10) })}
                className="config-registry-form-input"
              />
            </div>
          </div>
          <div>
            <label className="config-registry-form-label">Backup Retention (days)</label>
            <input
              type="number"
              min={1}
              max={365}
              value={formData.backup_retention_days}
              onChange={(e) => setFormData({ ...formData, backup_retention_days: parseInt(e.target.value, 10) })}
              className="config-registry-form-input"
            />
          </div>
          <div>
            <label className="config-registry-form-label">Health Check Endpoint</label>
            <input
              type="url"
              value={formData.health_check_endpoint}
              onChange={(e) => setFormData({ ...formData, health_check_endpoint: e.target.value })}
              className="config-registry-form-input"
              style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              placeholder="http://127.0.0.1:8000/api/v1/..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={onClose} className="config-registry-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="config-registry-btn-primary">
              {isSaving && <FiLoader className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
