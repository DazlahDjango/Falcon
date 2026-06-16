// src/components/reviews/settings/AuditSettings.jsx
import React, { useState, useEffect } from 'react';
import { Save, Shield, FileText, Clock, Users, Database, RefreshCw } from 'lucide-react';

const AuditSettings = ({ settings, onSave, isSaving }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (settings) {
      setFormData({
        audit_enabled: settings.audit_enabled !== undefined ? settings.audit_enabled : true,
        audit_trail_enabled: settings.audit_trail_enabled !== undefined ? settings.audit_trail_enabled : true,
        integrity_checks_enabled: settings.integrity_checks_enabled !== undefined ? settings.integrity_checks_enabled : true,
        field_encryption_enabled: settings.field_encryption_enabled !== undefined ? settings.field_encryption_enabled : true,
        retention_days: settings.retention_days || 365,
        require_audit_reason: settings.require_audit_reason !== undefined ? settings.require_audit_reason : true,
        log_sensitive_actions: settings.log_sensitive_actions !== undefined ? settings.log_sensitive_actions : true,
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="audit-settings" onSubmit={handleSubmit}>
      <div className="audit-settings-header">
        <h3 className="audit-settings-title">
          <Shield size={18} />
          Audit & Security Settings
        </h3>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="audit-settings-grid">
        <div className="audit-settings-group">
          <label className="audit-settings-label">Enable Audit Logging</label>
          <div className="audit-settings-toggle">
            <input
              type="checkbox"
              checked={formData.audit_enabled}
              onChange={(e) => handleChange('audit_enabled', e.target.checked)}
            />
            <span className="audit-settings-toggle-label">
              {formData.audit_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="audit-settings-hint">Log all system actions for audit purposes</span>
        </div>

        <div className="audit-settings-group">
          <label className="audit-settings-label">Audit Trail</label>
          <div className="audit-settings-toggle">
            <input
              type="checkbox"
              checked={formData.audit_trail_enabled}
              onChange={(e) => handleChange('audit_trail_enabled', e.target.checked)}
            />
            <span className="audit-settings-toggle-label">
              {formData.audit_trail_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="audit-settings-hint">Maintain detailed audit trail of changes</span>
        </div>

        <div className="audit-settings-group">
          <label className="audit-settings-label">Integrity Checks</label>
          <div className="audit-settings-toggle">
            <input
              type="checkbox"
              checked={formData.integrity_checks_enabled}
              onChange={(e) => handleChange('integrity_checks_enabled', e.target.checked)}
            />
            <span className="audit-settings-toggle-label">
              {formData.integrity_checks_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="audit-settings-hint">Perform integrity checks on sensitive data</span>
        </div>

        <div className="audit-settings-group">
          <label className="audit-settings-label">Field Encryption</label>
          <div className="audit-settings-toggle">
            <input
              type="checkbox"
              checked={formData.field_encryption_enabled}
              onChange={(e) => handleChange('field_encryption_enabled', e.target.checked)}
            />
            <span className="audit-settings-toggle-label">
              {formData.field_encryption_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="audit-settings-hint">Encrypt sensitive fields at rest</span>
        </div>

        <div className="audit-settings-group">
          <label className="audit-settings-label">Require Audit Reason</label>
          <div className="audit-settings-toggle">
            <input
              type="checkbox"
              checked={formData.require_audit_reason}
              onChange={(e) => handleChange('require_audit_reason', e.target.checked)}
            />
            <span className="audit-settings-toggle-label">
              {formData.require_audit_reason ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="audit-settings-hint">Require reason for sensitive actions</span>
        </div>

        <div className="audit-settings-group">
          <label className="audit-settings-label">Log Sensitive Actions</label>
          <div className="audit-settings-toggle">
            <input
              type="checkbox"
              checked={formData.log_sensitive_actions}
              onChange={(e) => handleChange('log_sensitive_actions', e.target.checked)}
            />
            <span className="audit-settings-toggle-label">
              {formData.log_sensitive_actions ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="audit-settings-hint">Log all sensitive actions (approvals, deletions, etc.)</span>
        </div>
      </div>

      <div className="audit-settings-group">
        <label className="audit-settings-label">Audit Retention (Days)</label>
        <input
          type="number"
          className="audit-settings-input"
          value={formData.retention_days}
          onChange={(e) => handleChange('retention_days', Number(e.target.value))}
          min={30}
          max={3650}
        />
        <span className="audit-settings-hint">Number of days to retain audit logs</span>
      </div>
    </form>
  );
};

export default AuditSettings;