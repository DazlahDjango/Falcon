import { useState } from 'react';
import { useBackup } from '../../../hooks/config';
import { BACKUP_TYPES, BACKUP_TYPE_LABELS } from '../../../config/constants/configConstants';
import { FiPlay, FiLoader } from 'react-icons/fi';

export const BackupTriggerForm = ({ apps, onSuccess, onClose }) => {
  const [selectedApp, setSelectedApp] = useState('');
  const [backupType, setBackupType] = useState(BACKUP_TYPES.FULL);
  const { triggerBackup } = useBackup();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setIsLoading(true);
    try {
      await triggerBackup.mutateAsync({ appName: selectedApp, backupType });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to trigger backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Application</label>
        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select an app...</option>
          {apps?.map((app) => (
            <option key={app.id} value={app.name}>{app.display_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Backup Type</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(BACKUP_TYPES).map(([key, value]) => (
            <label key={value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="backupType"
                value={value}
                checked={backupType === value}
                onChange={(e) => setBackupType(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm">{BACKUP_TYPE_LABELS[value]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={isLoading || !selectedApp} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isLoading ? <FiLoader className="animate-spin" /> : <FiPlay />}
          Start Backup
        </button>
      </div>
    </form>
  );
};