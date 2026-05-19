import { useMaintenance } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { format } from 'date-fns';

export const MaintenanceHistoryTable = ({ limit = 20, appFilter = null }) => {
  const { useMaintenanceWindows } = useMaintenance();
  const { data, isLoading } = useMaintenanceWindows({ 
    status: 'completed', 
    limit, 
    ordering: '-actual_end',
    ...(appFilter && { affected_apps: appFilter })
  });
  const windows = data?.data?.results || [];

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading history...</div>;

  if (windows.length === 0) {
    return <div className="text-center py-8 text-gray-500">No maintenance history found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">End</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Triggered By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {windows.map((window) => {
            const start = new Date(window.actual_start || window.scheduled_start);
            const end = new Date(window.actual_end || window.scheduled_end);
            const durationMinutes = Math.round((end - start) / 60000);
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            const durationDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            
            return (
              <tr key={window.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{window.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge 
                    status={window.maintenance_type} 
                    size="sm" 
                    customLabel={window.maintenance_type.charAt(0).toUpperCase() + window.maintenance_type.slice(1)} 
                  />
                </td>
                <td className="px-4 py-3 text-gray-600">{format(start, 'MMM dd, yyyy HH:mm')}</td>
                <td className="px-4 py-3 text-gray-600">{format(end, 'MMM dd, yyyy HH:mm')}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-700">{durationDisplay}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs capitalize px-2 py-1 bg-gray-100 rounded-full">{window.triggered_by_role}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};