import { useState, useEffect } from 'react';
import { SettingsToggle } from './SettingsToggle';
import { useConfigSettings } from '../../../hooks/config';

const DEFAULT_DR = {
  auto_failover: false,
  auto_failback_enabled: false,
  default_rto_target_minutes: 60,
  default_rpo_target_minutes: 240,
  drill_frequency_days: 30,
  max_parallel_recovery: 2,
  failover_timeout_minutes: 30,
};

export const DRThresholdsTab = ({ sections, onSectionChange, canEdit }) => {
  const { saveSection, isSaving } = useConfigSettings();
  const [local, setLocal] = useState({ ...DEFAULT_DR, ...sections.dr });

  useEffect(() => {
    setLocal({ ...DEFAULT_DR, ...sections.dr });
  }, [sections.dr]);

  const update = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onSectionChange('dr', next);
  };

  return (
    <div className="config-settings-section">
      <div className="config-settings-grid-2">
        <div className="config-settings-section">
          <SettingsToggle
            label="Auto Failover"
            hint="Automatically failover when health checks fail (Availability)"
            checked={local.auto_failover}
            onChange={(v) => update({ auto_failover: v })}
            disabled={!canEdit}
          />
          <SettingsToggle
            label="Auto Failback"
            checked={local.auto_failback_enabled}
            onChange={(v) => update({ auto_failback_enabled: v })}
            disabled={!canEdit}
          />
          <div className="config-settings-field">
            <label>Default RTO Target (minutes)</label>
            <input
              type="number"
              min={5}
              max={1440}
              disabled={!canEdit}
              value={local.default_rto_target_minutes}
              onChange={(e) => update({ default_rto_target_minutes: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="config-settings-field">
            <label>Default RPO Target (minutes)</label>
            <input
              type="number"
              min={5}
              max={10080}
              disabled={!canEdit}
              value={local.default_rpo_target_minutes}
              onChange={(e) => update({ default_rpo_target_minutes: parseInt(e.target.value, 10) })}
            />
            <p className="config-settings-field-hint">RTO must be ≥ RPO when saving</p>
          </div>
        </div>
        <div className="config-settings-section">
          <div className="config-settings-field">
            <label>Drill Frequency (days)</label>
            <input
              type="number"
              min={7}
              max={180}
              disabled={!canEdit}
              value={local.drill_frequency_days}
              onChange={(e) => update({ drill_frequency_days: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="config-settings-field">
            <label>Max Parallel Recovery</label>
            <input
              type="number"
              min={1}
              max={10}
              disabled={!canEdit}
              value={local.max_parallel_recovery}
              onChange={(e) => update({ max_parallel_recovery: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="config-settings-field">
            <label>Failover Timeout (minutes)</label>
            <input
              type="number"
              min={5}
              max={120}
              disabled={!canEdit}
              value={local.failover_timeout_minutes}
              onChange={(e) => update({ failover_timeout_minutes: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>
      </div>
      {canEdit && (
        <div className="config-settings-footer">
          <button type="button" onClick={() => saveSection('dr', local)} disabled={isSaving} className="config-settings-btn-primary">
            Save DR Settings
          </button>
        </div>
      )}
    </div>
  );
};
