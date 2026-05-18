import { useSelector, useDispatch } from 'react-redux';
import { FiRefreshCw, FiBell, FiUser, FiMenu } from 'react-icons/fi';
import { dashboardService } from '../../../services/config';

export const ConfigHeader = ({ onMenuClick, onRefresh }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const globalMaintenanceActive = useSelector((state) => state.config?.maintenance?.globalMaintenanceActive);

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      await dashboardService.getOverview();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <FiMenu className="text-xl text-gray-600" />
        </button>
        {globalMaintenanceActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Maintenance Mode Active
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleRefresh} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <FiRefreshCw className="text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <FiBell className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUser className="text-blue-600" />
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-800">{user?.first_name || user?.email?.split('@')[0]}</div>
            <div className="text-xs text-gray-500">{user?.role === 'super_admin' ? 'Super Admin' : 'Client Admin'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};