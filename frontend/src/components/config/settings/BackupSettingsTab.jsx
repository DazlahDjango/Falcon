import { useState, useEffect } from 'react';
import { COMPRESSION_ALGORITHMS, COMPRESSION_ALGORITHM_LABELS, STORAGE_CLASSES, STORAGE_CLASS_LABELS } from '../../../config/constants/configConstants';
import { SettingsToggle } from './SettingsToggle';
import { useConfigSettings } from '../../../hooks/config';

const DEFAULT_BACKUP = {
  compression_enabled: true,
  compression_algorithm: 'zstd',
  encryption_enabled: true,
  default_retention_days: 30,
  parallel_backup_workers: 4,
  backup_timeout_minutes: 60,
  storage_class: 'standard',
};

export const BackupSettingsTab = ({ sections, onSectionChange, canEdit }) => {
  const { saveSection, isSaving } = useConfigSettings();
  const [local, setLocal] = useState({ ...DEFAULT_BACKUP, ...sections.backup });

  useEffect(() => {
    setLocal({ ...DEFAULT_BACKUP, ...sections.backup });
  }, [sections.backup]);

  const update = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onSectionChange('backup', next);
  };

  const handleSaveTab = async () => {
    await saveSection('backup', local);
  };

  return (
    <div className="config-settings-section">
      <div className="config-settings-grid-2">
        <div className="config-settings-section">
          <SettingsToggle
            label="Enable Compression"
            hint="Compress backups to save storage space"
            checked={local.compression_enabled}
            onChange={(v) => update({ compression_enabled: v })}
            disabled={!canEdit}
          />
          <SettingsToggle
            label="Enable Encryption"
            hint="AES-256 encryption for backups at rest"
            checked={local.encryption_enabled}
            onChange={(v) => update({ encryption_enabled: v })}
            disabled={!canEdit}
          />
        </div>
        <div className="config-settings-section">
          <div className="config-settings-field">
            <label>Default Retention Days</label>
            <input
              type="number"
              min={1}
              max={365}
              disabled={!canEdit}
              value={local.default_retention_days}
              onChange={(e) => update({ default_retention_days: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="config-settings-field">
            <label>Parallel Backup Workers</label>
            <input
              type="number"
              min={1}
              max={16}
              disabled={!canEdit}
              value={local.parallel_backup_workers}
              onChange={(e) => update({ parallel_backup_workers: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>
      </div>
      <div className="config-settings-grid-2">
        <div className="config-settings-field">
          <label>Compression Algorithm</label>
          <select
            disabled={!canEdit || !local.compression_enabled}
            value={local.compression_algorithm}
            onChange={(e) => update({ compression_algorithm: e.target.value })}
          >
            {Object.entries(COMPRESSION_ALGORITHMS).map(([, value]) => (
              <option key={value} value={value}>{COMPRESSION_ALGORITHM_LABELS[value]}</option>
            ))}
          </select>
        </div>
        <div className="config-settings-field">
          <label>Default Storage Class</label>
          <select
            disabled={!canEdit}
            value={local.storage_class}
            onChange={(e) => update({ storage_class: e.target.value })}
          >
            {Object.entries(STORAGE_CLASSES).map(([, value]) => (
              <option key={value} value={value}>{STORAGE_CLASS_LABELS[value]}</option>
            ))}
          </select>
        </div>
      </div>
      {canEdit && (
        <div className="config-settings-footer">
          <button type="button" onClick={handleSaveTab} disabled={isSaving} className="config-settings-btn-primary">
            Save Backup Settings
          </button>
        </div>
      )}
    </div>
  );
};
