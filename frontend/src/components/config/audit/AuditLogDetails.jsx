import { FiX, FiUser, FiTarget, FiCalendar, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import { StatusBadge } from '../common/StatusBadge';

export const AuditLogDetails = ({ log, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Audit Log Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500">Action</label><div className="font-medium">{log.action.replace(/_/g, ' ')}</div></div>
            <div><label className="text-xs text-gray-500">Result</label><div><StatusBadge status={log.result} size="sm" /></div></div>
            <div><label className="text-xs text-gray-500">Performed By</label><div className="font-medium">{log.performed_by_email || log.performed_by}</div></div>
            <div><label className="text-xs text-gray-500">Role</label><div className="font-medium capitalize">{log.performed_by_role}</div></div>
            <div><label className="text-xs text-gray-500">Timestamp</label><div className="font-medium">{format(new Date(log.performed_at), 'MMM dd, yyyy HH:mm:ss')}</div></div>
            <div><label className="text-xs text-gray-500">IP Address</label><div className="font-mono text-sm">{log.ip_address || '-'}</div></div>
            <div><label className="text-xs text-gray-500">Target App</label><div className="font-medium">{log.target_app_name || '-'}</div></div>
            <div><label className="text-xs text-gray-500">Target ID</label><div className="font-mono text-sm">{log.target_id || '-'}</div></div>
          </div>
          {log.details && Object.keys(log.details).length > 0 && (
            <div>
              <label className="text-xs text-gray-500">Details</label>
              <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-xs overflow-auto max-h-60">{JSON.stringify(log.details, null, 2)}</pre>
            </div>
          )}
          {log.error_message && (
            <div>
              <label className="text-xs text-gray-500">Error Message</label>
              <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{log.error_message}</div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
};