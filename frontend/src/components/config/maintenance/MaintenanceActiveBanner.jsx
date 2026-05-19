import { useMaintenanceStatus } from '../../../hooks/config';
import { FiAlertTriangle, FiX, FiClock } from 'react-icons/fi';

export const MaintenanceActiveBanner = ({ onDismiss }) => {
  const { maintenanceActive, maintenanceType, maintenanceMessage, activeWindows } = useMaintenanceStatus();

  if (!maintenanceActive) return null;

  const activeWindow = activeWindows[0];
  const estimatedEnd = activeWindow?.scheduled_end ? new Date(activeWindow.scheduled_end).toLocaleString() : 'Unknown';

  return (
    <div className={`rounded-lg p-4 mb-6 flex items-center justify-between ${maintenanceType === 'full' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${maintenanceType === 'full' ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <FiAlertTriangle className={maintenanceType === 'full' ? 'text-red-600' : 'text-yellow-600'} />
        </div>
        <div>
          <h3 className={`font-semibold ${maintenanceType === 'full' ? 'text-red-800' : 'text-yellow-800'}`}>
            {maintenanceType === 'full' ? 'Full System Maintenance' : 'Partial Maintenance Active'}
          </h3>
          <p className={`text-sm ${maintenanceType === 'full' ? 'text-red-600' : 'text-yellow-600'}`}>
            {maintenanceMessage}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <FiClock className="text-xs" />
            <span>Expected completion: {estimatedEnd}</span>
          </div>
        </div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
          <FiX className="text-gray-500" />
        </button>
      )}
    </div>
  );
};