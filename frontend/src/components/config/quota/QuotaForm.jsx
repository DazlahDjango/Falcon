import { useState } from 'react';
import { useQuota } from '../../../hooks/config';
import { FiX, FiLoader } from 'react-icons/fi';

export const QuotaForm = ({ quota, onClose, onSuccess }) => {
  const { updateQuota } = useQuota();
  const [formData, setFormData] = useState({
    total_backup_storage_bytes: quota?.total_backup_storage_bytes / (1024 ** 3) || 100,
    max_backup_count: quota?.max_backup_count || 100,
    max_restore_per_day: quota?.max_restore_per_day || 10,
    warning_threshold_percent: quota?.warning_threshold_percent || 80
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSend = {
        ...formData,
        total_backup_storage_bytes: formData.total_backup_storage_bytes * (1024 ** 3)
      };
      await updateQuota.mutateAsync({ quotaId: quota.id, data: dataToSend });
      onSuccess();
    } catch (error) {
      console.error('Failed to update quota:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Edit Quota</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Storage (GB)</label>
            <input type="number" value={formData.total_backup_storage_bytes} onChange={(e) => setFormData({ ...formData, total_backup_storage_bytes: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" step="1" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Backup Count</label>
            <input type="number" value={formData.max_backup_count} onChange={(e) => setFormData({ ...formData, max_backup_count: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="10" max="10000" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Restore Per Day</label>
            <input type="number" value={formData.max_restore_per_day} onChange={(e) => setFormData({ ...formData, max_restore_per_day: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" max="1000" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Warning Threshold (%)</label>
            <input type="number" value={formData.warning_threshold_percent} onChange={(e) => setFormData({ ...formData, warning_threshold_percent: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="50" max="100" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? <FiLoader className="animate-spin" /> : null}
              Save Quota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};