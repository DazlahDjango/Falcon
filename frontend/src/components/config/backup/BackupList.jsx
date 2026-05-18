import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackup } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { FiEye, FiRefreshCw, FiTrash2, FiDownload, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';

export const BackupList = () => {
  const navigate = useNavigate();
  const { useBackupJobs } = useBackup();
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '', backup_type: '' });
  const { data, isLoading } = useBackupJobs(filters);

  const backups = data?.data?.results || [];
  const pagination = data?.data;

  const getSizeDisplay = (bytes) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleViewDetails = (id) => navigate(`/config/backups/${id}`);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Backup Jobs</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <FiRefreshCw /> Refresh
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search backups..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3">App</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Size</th>
              <th className="px-5 py-3">Started</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : backups.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-500">No backup jobs found</td></tr>
            ) : (
              backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{backup.app_display_name || backup.app_name}</td>
                  <td className="px-5 py-3 text-sm capitalize">{backup.backup_type}</td>
                  <td className="px-5 py-3"><StatusBadge status={backup.status} size="sm" /></td>
                  <td className="px-5 py-3 text-sm">{getSizeDisplay(backup.size_bytes)}</td>
                  <td className="px-5 py-3 text-sm">{backup.started_at ? format(new Date(backup.started_at), 'MMM dd, HH:mm') : '-'}</td>
                  <td className="px-5 py-3 text-sm">{backup.duration_display || '-'}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleViewDetails(backup.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <FiEye className="text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm">
          <span className="text-gray-500">Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
          <div className="flex gap-2">
            <button disabled={!pagination.previous} className="px-3 py-1 border rounded-lg disabled:opacity-50">Previous</button>
            <button disabled={!pagination.next} className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};