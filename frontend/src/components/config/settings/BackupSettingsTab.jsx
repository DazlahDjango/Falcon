import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCompressionEnabled, setEncryptionEnabled, setDefaultRetentionDays, setBackupConcurrencyLimit } from '../../../store/config/slices/configSettingsSlice';
import { COMPRESSION_ALGORITHMS, COMPRESSION_ALGORITHM_LABELS, STORAGE_CLASSES, STORAGE_CLASS_LABELS } from '../../../config/constants/configConstants';

export const BackupSettingsTab = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.config?.settings);
  const [localSettings, setLocalSettings] = useState({
    compression_enabled: settings?.compressionEnabled ?? true,
    compression_algorithm: 'zstd',
    encryption_enabled: settings?.encryptionEnabled ?? true,
    default_retention_days: settings?.defaultRetentionDays ?? 30,
    parallel_backup_workers: settings?.backupConcurrencyLimit ?? 4,
    backup_timeout_minutes: 60,
    storage_class: 'standard'
  });

  const handleSave = () => {
    dispatch(setCompressionEnabled(localSettings.compression_enabled));
    dispatch(setEncryptionEnabled(localSettings.encryption_enabled));
    dispatch(setDefaultRetentionDays(localSettings.default_retention_days));
    dispatch(setBackupConcurrencyLimit(localSettings.parallel_backup_workers));
    alert('Backup settings saved');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div><label className="font-medium text-gray-700">Enable Compression</label><p className="text-sm text-gray-500">Compress backups to save storage space</p></div>
            <button
              onClick={() => setLocalSettings({ ...localSettings, compression_enabled: !localSettings.compression_enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.compression_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            ><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.compression_enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div><label className="font-medium text-gray-700">Enable Encryption</label><p className="text-sm text-gray-500">AES-256 encryption for backups at rest</p></div>
            <button
              onClick={() => setLocalSettings({ ...localSettings, encryption_enabled: !localSettings.encryption_enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.encryption_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            ><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.encryption_enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
          </div>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Retention Days</label>
            <input type="number" value={localSettings.default_retention_days} onChange={(e) => setLocalSettings({ ...localSettings, default_retention_days: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" max="365" />
            <p className="text-xs text-gray-500 mt-1">How long to keep backups by default</p>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Parallel Backup Workers</label>
            <input type="number" value={localSettings.parallel_backup_workers} onChange={(e) => setLocalSettings({ ...localSettings, parallel_backup_workers: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" max="16" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Compression Algorithm</label>
          <select value={localSettings.compression_algorithm} onChange={(e) => setLocalSettings({ ...localSettings, compression_algorithm: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={!localSettings.compression_enabled}>
            {Object.entries(COMPRESSION_ALGORITHMS).map(([key, value]) => <option key={value} value={value}>{COMPRESSION_ALGORITHM_LABELS[value]}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Storage Class</label>
          <select value={localSettings.storage_class} onChange={(e) => setLocalSettings({ ...localSettings, storage_class: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {Object.entries(STORAGE_CLASSES).map(([key, value]) => <option key={value} value={value}>{STORAGE_CLASS_LABELS[value]}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Backup Settings</button>
      </div>
    </div>
  );
};