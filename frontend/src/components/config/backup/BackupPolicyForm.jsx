import { useState, useEffect } from 'react';
import { useBackup } from '../../../hooks/config';
import { BACKUP_TYPES, BACKUP_TYPE_LABELS, COMPRESSION_ALGORITHMS, COMPRESSION_ALGORITHM_LABELS, STORAGE_CLASSES, STORAGE_CLASS_LABELS } from '../../../config/constants/configConstants';

export const BackupPolicyForm = ({ policy, onSave, onCancel }) => {
  const { updatePolicy } = useBackup();
  const [formData, setFormData] = useState({
    backup_type: BACKUP_TYPES.FULL,
    status: 'enabled',
    retention_days: 30,
    retention_full_weeks: 4,
    retention_monthly: 12,
    compression_enabled: true,
    compression_algorithm: COMPRESSION_ALGORITHMS.ZSTD,
    encryption_enabled: true,
    storage_class: STORAGE_CLASSES.STANDARD,
    incremental_chain_length: 30,
    parallel_backup_workers: 4,
    backup_timeout_minutes: 60,
    schedule_cron: '',
    schedule_weekdays_only: true
  });

  useEffect(() => {
    if (policy) setFormData({ ...formData, ...policy });
  }, [policy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (policy) await updatePolicy.mutateAsync({ policyId: policy.id, data: formData });
      onSave(formData);
    } catch (error) {
      console.error('Failed to save policy:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Backup Type</label>
          <select value={formData.backup_type} onChange={(e) => setFormData({ ...formData, backup_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {Object.entries(BACKUP_TYPES).map(([key, value]) => <option key={value} value={value}>{BACKUP_TYPE_LABELS[value]}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Retention Days</label>
          <input type="number" value={formData.retention_days} onChange={(e) => setFormData({ ...formData, retention_days: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" max="365" />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Compression Algorithm</label>
          <select value={formData.compression_algorithm} onChange={(e) => setFormData({ ...formData, compression_algorithm: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={!formData.compression_enabled}>
            {Object.entries(COMPRESSION_ALGORITHMS).map(([key, value]) => <option key={value} value={value}>{COMPRESSION_ALGORITHM_LABELS[value]}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Storage Class</label>
          <select value={formData.storage_class} onChange={(e) => setFormData({ ...formData, storage_class: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {Object.entries(STORAGE_CLASSES).map(([key, value]) => <option key={value} value={value}>{STORAGE_CLASS_LABELS[value]}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Cron Schedule</label>
          <input type="text" value={formData.schedule_cron} onChange={(e) => setFormData({ ...formData, schedule_cron: e.target.value })} placeholder="0 2 * * *" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.compression_enabled} onChange={(e) => setFormData({ ...formData, compression_enabled: e.target.checked })} className="w-4 h-4" /> Enable Compression</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.encryption_enabled} onChange={(e) => setFormData({ ...formData, encryption_enabled: e.target.checked })} className="w-4 h-4" /> Enable Encryption</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.schedule_weekdays_only} onChange={(e) => setFormData({ ...formData, schedule_weekdays_only: e.target.checked })} className="w-4 h-4" /> Weekdays Only</label>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Policy</button>
      </div>
    </form>
  );
};