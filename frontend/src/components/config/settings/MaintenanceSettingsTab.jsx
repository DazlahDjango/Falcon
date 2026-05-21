import { useState, useEffect } from 'react';
import { SettingsToggle } from './SettingsToggle';
import { useConfigSettings } from '../../../hooks/config';

const DEFAULT_MAINTENANCE = {
  auto_approve: false,
  health_check_interval_seconds: 300,
    max_concurrent_maintenance: 3,
  default_maintenance_duration_minutes: 60,
    notify_before_minutes: [15, 30, 60],
  emergency_requires_super_admin: true,
  maintenance_overlap_blocked: true,
};

export const MaintenanceSettingsTab = ({ sections, onSectionChange, canEdit }) => {
  const { saveSection, isSaving } = useConfigSettings();
  const [local, setLocal] = useState({ ...DEFAULT_MAINTENANCE, ...sections.maintenance });

  useEffect(() => {
    setLocal({ ...DEFAULT_MAINTENANCE, ...sections.maintenance });
  }, [sections.maintenance]);

  const update = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onSectionChange('maintenance', next);
  };

  const toggleNotify = (minutes) => {
    const list = local.notify_before_minutes || [];
    const next = list.includes(minutes) ? list.filter((m) => m !== minutes) : [...list, minutes].sort((a, b) => a - b);
    update({ notify_before_minutes: next });
  };

  return (
    <div className="config-settings-section">
      <div className="config-settings-grid-2">
        <div className="config-settings-section">
          <SettingsToggle
            label="Auto-approve Maintenance"
            hint="Automatically approve scheduled maintenance windows"
            checked={local.auto_approve}
            onChange={(v) => update({ auto_approve: v })}
            disabled={!canEdit}
          />
          <SettingsToggle
            label="Emergency Requires Super Admin"
            checked={local.emergency_requires_super_admin}
            onChange={(v) => update({ emergency_requires_super_admin: v })}
            disabled={!canEdit}
          />
          <SettingsToggle
            label="Block Overlapping Windows"
            hint="Integrity: prevent conflicting maintenance schedules"
            checked={local.maintenance_overlap_blocked}
            onChange={(v) => update({ maintenance_overlap_blocked: v })}
            disabled={!canEdit}
          />
        </div>
        <div className="config-settings-section">
          <div className="config-settings-field">
            <label>Health Check Interval (seconds)</label>
            <input
              type="number"
              min={30}
              max={3600}
              step={30}
              disabled={!canEdit}
              value={local.health_check_interval_seconds}
              onChange={(e) => update({ health_check_interval_seconds: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="config-settings-field">
            <label>Default Maintenance Duration (minutes)</label>
            <input
              type="number"
              min={15}
              max={1440}
              disabled={!canEdit}
              value={local.default_maintenance_duration_minutes}
              onChange={(e) => update({ default_maintenance_duration_minutes: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>
      </div>
      <div className="config-settings-field">
        <label>Notify Before (minutes)</label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[15, 30, 60].map((minutes) => (
            <label key={minutes} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={(local.notify_before_minutes || []).includes(minutes)}
                onChange={() => toggleNotify(minutes)}
              />
              {minutes} min
            </label>
          ))}
        </div>
      </div>
      {canEdit && (
        <div className="config-settings-footer">
          <button type="button" onClick={() => saveSection('maintenance', local)} disabled={isSaving} className="config-settings-btn-primary">
            Save Maintenance Settings
          </button>
      </div>
      )}
    </div>
  );
};
