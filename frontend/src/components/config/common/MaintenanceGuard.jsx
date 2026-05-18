import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMaintenanceStatus } from '../../../hooks/config';
import { FiAlertTriangle, FiClock } from 'react-icons/fi';

export const MaintenanceGuard = ({ children, appName }) => {
  const { isAppAffected, maintenanceActive, maintenanceType, maintenanceMessage, activeWindows } = useMaintenanceStatus();

  if (!maintenanceActive) return children;
  if (appName && !isAppAffected(appName)) return children;

  const activeWindow = activeWindows[0];
  const estimatedEnd = activeWindow?.scheduled_end ? new Date(activeWindow.scheduled_end).toLocaleString() : 'Unknown';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${maintenanceType === 'full' ? 'bg-red-100' : 'bg-yellow-100'}`}>
        <FiAlertTriangle className={`text-4xl ${maintenanceType === 'full' ? 'text-red-600' : 'text-yellow-600'}`} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">System Under Maintenance</h2>
      <p className="text-gray-600 mb-4 max-w-md">{maintenanceMessage || 'Scheduled maintenance is in progress.'}</p>
      <div className="flex items-center gap-2 text-gray-500 mb-6">
        <FiClock className="text-lg" />
        <span>Expected completion: {estimatedEnd}</span>
      </div>
      {maintenanceType === 'full' ? (
        <p className="text-sm text-gray-500">All services are temporarily unavailable. Please check back later.</p>
      ) : (
        <p className="text-sm text-gray-500">Some features may be limited. We apologize for any inconvenience.</p>
      )}
    </div>
  );
};