import { useState } from 'react';
import { useBackup } from '../../../hooks/config';
import { FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { StatusBadge } from '../common/StatusBadge';

export const BackupRestoreModal = ({ backup, onClose, onSuccess }) => {
  const { restoreBackup } = useBackup();
  const [targetAppOnly, setTargetAppOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await restoreBackup.mutateAsync({ jobId: backup.id, targetAppOnly });
      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Restore failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <FiAlertTriangle className="text-yellow-600 text-xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Restore from Backup</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 mb-2">You are about to restore from backup:</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">App:</span><span className="font-medium">{backup.app_display_name}</span></div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Type:</span><span className="font-medium capitalize">{backup.backup_type}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Created:</span><span className="font-medium">{new Date(backup.created_at).toLocaleString()}</span></div>
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={targetAppOnly} onChange={(e) => setTargetAppOnly(e.target.checked)} className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">Restore app only (keep other data)</span>
            </label>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            Warning: Restoring will overwrite current data. This action cannot be undone.
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleRestore} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isLoading ? <FiLoader className="animate-spin" /> : <FiAlertTriangle />}
            Confirm Restore
          </button>
        </div>
      </div>
    </div>
  );
};