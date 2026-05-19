import { useParams, useNavigate } from 'react-router-dom';
import { useMaintenance } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { MaintenanceTimer } from './MaintenanceTimer';
import { MaintenanceActions } from './MaintenanceActions';
import { FiArrowLeft, FiClock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

export const MaintenanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useMaintenanceWindow, useMaintenanceLogs } = useMaintenance();
  const { data, isLoading } = useMaintenanceWindow(id);
  const { data: logsData } = useMaintenanceLogs({ maintenance_window_id: id });

  const window = data?.data;
  const logs = logsData?.data?.results || [];

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!window) return <div className="p-8 text-center text-red-500">Maintenance window not found</div>;

  const isActive = window.status === 'in_progress';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/config/maintenance')} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{window.title}</h1>
        <StatusBadge status={window.status} size="lg" />
      </div>

      {isActive && <MaintenanceTimer endTime={window.scheduled_end} onExpire={() => window.location.reload()} />}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div><label className="text-xs text-gray-500">Type</label><div className="font-medium capitalize">{window.maintenance_type}</div></div>
          <div><label className="text-xs text-gray-500">Status</label><div className="font-medium capitalize">{window.status}</div></div>
          <div><label className="text-xs text-gray-500">Triggered By</label><div className="font-medium capitalize">{window.triggered_by_role}</div></div>
          <div><label className="text-xs text-gray-500">Expected Downtime</label><div className="font-medium">{window.expected_downtime_minutes} minutes</div></div>
          <div><label className="text-xs text-gray-500">Scheduled Start</label><div className="font-medium">{format(new Date(window.scheduled_start), 'MMM dd, yyyy HH:mm:ss')}</div></div>
          <div><label className="text-xs text-gray-500">Scheduled End</label><div className="font-medium">{format(new Date(window.scheduled_end), 'MMM dd, yyyy HH:mm:ss')}</div></div>
          {window.actual_start && <div><label className="text-xs text-gray-500">Actual Start</label><div className="font-medium">{format(new Date(window.actual_start), 'MMM dd, HH:mm:ss')}</div></div>}
          {window.actual_end && <div><label className="text-xs text-gray-500">Actual End</label><div className="font-medium">{format(new Date(window.actual_end), 'MMM dd, HH:mm:ss')}</div></div>}
        </div>

        <div className="mb-6"><label className="text-xs text-gray-500">Reason</label><div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700">{window.reason}</div></div>

        <div className="mb-6">
          <label className="text-xs text-gray-500">Affected Apps</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {window.affected_app_names?.length ? window.affected_app_names.map(app => (
              <span key={app} className="px-2 py-1 bg-gray-100 rounded-md text-xs">{app}</span>
            )) : <span className="text-sm text-gray-500">All apps (full maintenance)</span>}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4"><MaintenanceActions window={window} /></div>
      </div>

      {logs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Activity Log</h3>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2 border-b border-gray-100">
                <FiClock className="text-gray-400" />
                <span className="text-sm text-gray-600">{format(new Date(log.performed_at), 'MMM dd, HH:mm:ss')}</span>
                <span className="text-sm font-medium capitalize">{log.action}</span>
                <span className="text-sm text-gray-500">by {log.performed_by_role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};