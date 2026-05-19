import { useState } from 'react';
import { useAuditLog } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { AuditLogFilters } from './AuditLogFilters';
import { AuditLogDetails } from './AuditLogDetails';
import { AuditLogExporter } from './AuditLogExporter';
import { FiEye, FiDownload, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

export const AuditLogList = () => {
  const { useAuditLogs } = useAuditLog();
  const [filters, setFilters] = useState({ page: 1, limit: 50 });
  const [selectedLog, setSelectedLog] = useState(null);
  const { data, isLoading } = useAuditLogs(filters);

  const logs = data?.data?.results || [];
  const pagination = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
        <AuditLogExporter filters={filters} />
      </div>

      <AuditLogFilters filters={filters} onFilterChange={setFilters} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-sm text-gray-600">
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Result</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">No audit logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm">{format(new Date(log.performed_at), 'MMM dd, HH:mm:ss')}</td>
                    <td className="px-5 py-3 text-sm font-medium">{log.action.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3 text-sm">{log.performed_by_email || log.performed_by}</td>
                    <td className="px-5 py-3 text-sm capitalize">{log.performed_by_role}</td>
                    <td className="px-5 py-3"><StatusBadge status={log.result} size="sm" /></td>
                    <td className="px-5 py-3 text-sm">{log.target_app_name || '-'}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelectedLog(log)} className="p-1.5 hover:bg-gray-100 rounded-lg">
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
            <span className="text-gray-500">Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)} ({pagination.total} total)</span>
            <div className="flex gap-2">
              <button disabled={!pagination.previous} className="px-3 py-1 border rounded-lg disabled:opacity-50">Previous</button>
              <button disabled={!pagination.next} className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && <AuditLogDetails log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
};