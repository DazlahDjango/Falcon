import { useState, useEffect } from 'react';
import { BACKUP_STORAGE_LOCATIONS, BACKUP_STORAGE_LABELS } from '../../../config/constants/configConstants';
import { SettingsToggle } from './SettingsToggle';
import { useConfigSettings } from '../../../hooks/config';

const DEFAULT_STORAGE = {
  storage_type: 's3',
  s3_bucket: '',
  s3_region: 'us-east-1',
  s3_path_prefix: 'backups/',
  local_path: '/var/backups/falcon-pms',
  glacier_transition_days: 90,
  deep_archive_transition_days: 365,
  lifecycle_enabled: true,
};

export const StorageSettingsTab = ({ sections, onSectionChange, canEdit }) => {
  const { saveSection, isSaving } = useConfigSettings();
  const [local, setLocal] = useState({ ...DEFAULT_STORAGE, ...sections.storage });

  useEffect(() => {
    setLocal({ ...DEFAULT_STORAGE, ...sections.storage });
  }, [sections.storage]);

  const update = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onSectionChange('storage', next);
  };

  return (
    <div className="config-settings-section">
      <div className="config-settings-field">
        <label>Primary Storage Type</label>
        <select
          disabled={!canEdit}
          value={local.storage_type}
          onChange={(e) => update({ storage_type: e.target.value })}
        >
          {Object.entries(BACKUP_STORAGE_LOCATIONS).map(([, value]) => (
            <option key={value} value={value}>{BACKUP_STORAGE_LABELS[value]}</option>
          ))}
        </select>
        <p className="config-settings-field-hint">Runtime env may override via BACKUP_STORAGE_TYPE</p>
      </div>

      {local.storage_type === 's3' && (
        <div className="config-settings-grid-2">
          <div className="config-settings-field">
            <label>S3 Bucket</label>
            <input type="text" disabled={!canEdit} value={local.s3_bucket} onChange={(e) => update({ s3_bucket: e.target.value })} />
          </div>
          <div className="config-settings-field">
            <label>S3 Region</label>
            <input type="text" disabled={!canEdit} value={local.s3_region} onChange={(e) => update({ s3_region: e.target.value })} />
          </div>
          <div className="config-settings-field" style={{ gridColumn: '1 / -1' }}>
            <label>Path Prefix</label>
            <input type="text" disabled={!canEdit} value={local.s3_path_prefix} onChange={(e) => update({ s3_path_prefix: e.target.value })} />
          </div>
        </div>
      )}

      {local.storage_type === 'local' && (
        <div className="config-settings-field">
          <label>Local Backup Path</label>
          <input type="text" disabled={!canEdit} value={local.local_path} onChange={(e) => update({ local_path: e.target.value })} />
        </div>
      )}

      <div className="config-settings-divider">
        <h3 className="config-settings-subtitle">Lifecycle Rules</h3>
        <div className="config-settings-grid-2">
          <div className="config-settings-field">
            <label>Glacier Transition (days)</label>
            <input
              type="number"
              min={30}
              disabled={!canEdit}
              value={local.glacier_transition_days}
              onChange={(e) => update({ glacier_transition_days: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="config-settings-field">
            <label>Deep Archive Transition (days)</label>
            <input
              type="number"
              min={90}
              disabled={!canEdit}
              value={local.deep_archive_transition_days}
              onChange={(e) => update({ deep_archive_transition_days: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>
        <SettingsToggle
          label="Automated lifecycle management"
          checked={local.lifecycle_enabled}
          onChange={(v) => update({ lifecycle_enabled: v })}
          disabled={!canEdit}
        />
      </div>

      {canEdit && (
        <div className="config-settings-footer">
          <button type="button" onClick={() => saveSection('storage', local)} disabled={isSaving} className="config-settings-btn-primary">
            Save Storage Settings
          </button>
        </div>
      )}
    </div>
  );
};
