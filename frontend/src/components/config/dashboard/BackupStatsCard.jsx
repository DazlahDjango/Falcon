// frontend/src/components/config/dashboard/BackupStatsCard.jsx
import { FiDatabase, FiCheckCircle, FiXCircle, FiClock, FiHardDrive } from 'react-icons/fi';

export const BackupStatsCard = ({ stats }) => {
  const totalStorageGB = Number(stats?.totalStorageGB) || 0;
  const pending = Number(stats?.pending) || 0;
  const running = Number(stats?.running) || 0;
  const failedToday = Number(stats?.failedToday) || 0;
  const successfulBackups = Number(stats?.successfulBackups) || 0;
  const totalBackups = Number(stats?.totalBackups) || 0;
  const successRate = totalBackups > 0 ? Number((successfulBackups / totalBackups * 100).toFixed(1)) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiDatabase className="text-blue-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-800">Backup Status</h3>
        </div>
        <span className="text-xs text-gray-400">Real-time</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">{totalStorageGB.toFixed(1)} GB</div>
          <div className="text-xs text-gray-500">Total Storage</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{successRate}%</div>
          <div className="text-xs text-gray-500">Success Rate</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
        <div className="flex items-center gap-1 text-yellow-600">
          <FiClock className="text-xs" />
          <span>Pending: {pending}</span>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <FiCheckCircle className="text-xs" />
          <span>Running: {running}</span>
        </div>
        <div className="flex items-center gap-1 text-red-600">
          <FiXCircle className="text-xs" />
          <span>Failed Today: {failedToday}</span>
        </div>
      </div>
    </div>
  );
};