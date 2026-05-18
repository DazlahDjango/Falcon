import { useBackup } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { format } from 'date-fns';

export const BackupHistoryTable = ({ appName, limit = 20 }) => {
  const { useBackupJobs } = useBackup();
  const { data } = useBackupJobs({ app_name: appName, limit, ordering: '-started_at' });
  const backups = data?.data?.results || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-2">Started</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Size</th>
            <th className="px-4 py-2">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {backups.map((backup) => (
            <tr key={backup.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{backup.started_at ? format(new Date(backup.started_at), 'MMM dd, HH:mm') : '-'}</td>
              <td className="px-4 py-2 capitalize">{backup.backup_type}</td>
              <td className="px-4 py-2"><StatusBadge status={backup.status} size="sm" /></td>
              <td className="px-4 py-2">{getSizeDisplay(backup.size_bytes)}</td>
              <td className="px-4 py-2">{backup.duration_display || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getSizeDisplay = (bytes) => {
  if (!bytes) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) { size /= 1024; unitIndex++; }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};