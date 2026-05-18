import { FiHardDrive, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export const MaintenanceStatusCard = ({ stats }) => {
  const active = stats?.active || 0;
  const scheduled = stats?.scheduled || 0;
  const completed = stats?.completed || 0;
  const totalDowntimeHours = stats?.totalDowntimeHours || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FiHardDrive className="text-orange-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-800">Maintenance</h3>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-xl font-bold text-orange-600">{active}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-xl font-bold text-blue-600">{scheduled}</div>
          <div className="text-xs text-gray-500">Scheduled</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-xl font-bold text-green-600">{completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <FiClock className="text-xs" />
          <span>Downtime: {totalDowntimeHours}h</span>
        </div>
        {active > 0 && (
          <div className="flex items-center gap-1 text-yellow-600">
            <FiAlertCircle className="text-xs" />
            <span>Service Impact</span>
          </div>
        )}
      </div>
    </div>
  );
};