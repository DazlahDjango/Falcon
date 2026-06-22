import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';

export const SettingsPanel = () => {
  const { updateTenantSettings, tenantSettings } = useClientAdminDashboard();
  const [settings, setSettings] = useState({
    kpi_validation_required: true,
    supervisor_approval_required: true,
    mfa_required: false,
    session_timeout: 480,
    default_language: 'en'
  });

  const handleSave = async () => {
    await updateTenantSettings(settings);
  };

  return (
    <DashboardCard title="Tenant Settings">
      <div className="settings-form">
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.kpi_validation_required}
              onChange={(e) => setSettings({ ...settings, kpi_validation_required: e.target.checked })}
            />
            Require KPI validation before approval
          </label>
        </div>

        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.supervisor_approval_required}
              onChange={(e) => setSettings({ ...settings, supervisor_approval_required: e.target.checked })}
            />
            Require supervisor approval for all entries
          </label>
        </div>

        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.mfa_required}
              onChange={(e) => setSettings({ ...settings, mfa_required: e.target.checked })}
            />
            Require MFA for all users
          </label>
        </div>

        <div className="setting-group">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.session_timeout}
            onChange={(e) => setSettings({ ...settings, session_timeout: parseInt(e.target.value) })}
            min="15"
            max="1440"
          />
        </div>

        <div className="setting-group">
          <label>Default Language</label>
          <select
            value={settings.default_language}
            onChange={(e) => setSettings({ ...settings, default_language: e.target.value })}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
        </div>

        <button onClick={handleSave} className="save-btn">
          Save Settings
        </button>
      </div>
    </DashboardCard>
  );
};
export default SettingsPanel;