import { useState } from 'react';
import { BACKUP_STORAGE_LOCATIONS, BACKUP_STORAGE_LABELS } from '../../../config/constants/configConstants';

export const StorageSettingsTab = () => {
  const [localSettings, setLocalSettings] = useState({
    storage_type: 's3',
    s3_bucket: 'falcon-pms-backups',
    s3_region: 'us-east-1',
    s3_path_prefix: 'backups/',
    local_path: '/var/backups/falcon',
    glacier_transition_days: 90,
    deep_archive_transition_days: 365,
    lifecycle_enabled: true
  });

  const handleSave = () => {
    alert('Storage settings saved');
  };

  return (
    <div className="space-y-6">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Primary Storage Type</label>
        <select value={localSettings.storage_type} onChange={(e) => setLocalSettings({ ...localSettings, storage_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          {Object.entries(BACKUP_STORAGE_LOCATIONS).map(([key, value]) => <option key={value} value={value}>{BACKUP_STORAGE_LABELS[value]}</option>)}
        </select>
      </div>

      {localSettings.storage_type === 's3' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">S3 Bucket Name</label>
            <input type="text" value={localSettings.s3_bucket} onChange={(e) => setLocalSettings({ ...localSettings, s3_bucket: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">S3 Region</label>
            <input type="text" value={localSettings.s3_region} onChange={(e) => setLocalSettings({ ...localSettings, s3_region: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Path Prefix</label>
            <input type="text" value={localSettings.s3_path_prefix} onChange={(e) => setLocalSettings({ ...localSettings, s3_path_prefix: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
      )}

      {localSettings.storage_type === 'local' && (
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Local Backup Path</label>
          <input type="text" value={localSettings.local_path} onChange={(e) => setLocalSettings({ ...localSettings, local_path: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">Absolute path on the filesystem</p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium text-gray-800 mb-4">Lifecycle Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Transition to Glacier (days)</label>
            <input type="number" value={localSettings.glacier_transition_days} onChange={(e) => setLocalSettings({ ...localSettings, glacier_transition_days: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="30" max="3650" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Transition to Deep Archive (days)</label>
            <input type="number" value={localSettings.deep_archive_transition_days} onChange={(e) => setLocalSettings({ ...localSettings, deep_archive_transition_days: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="90" max="7300" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => setLocalSettings({ ...localSettings, lifecycle_enabled: !localSettings.lifecycle_enabled })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.lifecycle_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.lifecycle_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-gray-700">Enable automated lifecycle management</span>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Storage Settings</button>
      </div>
    </div>
  );
};